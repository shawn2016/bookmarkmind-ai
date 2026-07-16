// ============================================================
// AI 书签管家 v2 — 清理中心 Zustand Store
// ============================================================
import { create } from 'zustand';
import type {
  InvalidLinkRecord,
  InvalidLinkStatus,
  DuplicateGroup,
  CleanupScanState,
} from '@shared/types';
import { safeSendMessage } from '@shared/utils/chrome-api';

export interface CleanupStore {
  // Scan state
  scanState: CleanupScanState;

  // Invalid link results
  invalidLinks: InvalidLinkRecord[];
  filteredInvalidLinks: InvalidLinkRecord[];
  invalidFilter: 'all' | InvalidLinkStatus;

  // Duplicate results
  duplicateGroups: DuplicateGroup[];

  // Active sub-tab in cleanup center
  activeCleanupTab: 'invalid' | 'duplicates';

  // Operations
  startScan: () => Promise<void>;
  findDuplicates: () => Promise<void>;
  batchDelete: (ids: string[]) => Promise<void>;
  exportCSV: () => void;
  setInvalidFilter: (f: 'all' | InvalidLinkStatus) => void;
  setActiveCleanupTab: (t: 'invalid' | 'duplicates') => void;
}

export const useCleanupStore = create<CleanupStore>((set, get) => ({
  scanState: { phase: 'idle', done: 0, total: 0, results: [] },
  invalidLinks: [],
  filteredInvalidLinks: [],
  invalidFilter: 'all',
  duplicateGroups: [],
  activeCleanupTab: 'invalid',

  startScan: async () => {
    set({
      scanState: { phase: 'scanning', done: 0, total: 0, results: [] },
    });

    try {
      const response = await safeSendMessage<{ results: InvalidLinkRecord[] }>({ type: 'CLEANUP_SCAN_INVALID' });
      const results = response?.results ?? [];

      set({
        scanState: { phase: 'done', done: results.length, total: results.length, results },
        invalidLinks: results,
        filteredInvalidLinks: results,
      });
    } catch (err) {
      set({
        scanState: {
          phase: 'error',
          done: 0,
          total: 0,
          results: [],
          error: String(err),
        },
      });
    }
  },

  findDuplicates: async () => {
    try {
      const response = await safeSendMessage<{ groups: DuplicateGroup[] }>({ type: 'CLEANUP_FIND_DUPLICATES' });
      const groups = response?.groups ?? [];
      set({ duplicateGroups: groups });
    } catch {
      set({ duplicateGroups: [] });
    }
  },

  batchDelete: async (ids: string[]) => {
    await safeSendMessage({ type: 'CLEANUP_BATCH_DELETE', payload: { ids } });

    // Remove deleted from local state
    const idSet = new Set(ids);
    set(state => ({
      invalidLinks: state.invalidLinks.filter(l => !idSet.has(l.bookmarkId)),
      filteredInvalidLinks: state.filteredInvalidLinks.filter(l => !idSet.has(l.bookmarkId)),
      duplicateGroups: state.duplicateGroups
        .map(g => ({
          ...g,
          bookmarks: g.bookmarks.filter(b => !idSet.has(b.id)),
        }))
        .filter(g => g.bookmarks.length > 1),
    }));
  },

  exportCSV: () => {
    const { invalidLinks } = get();
    const header = 'URL,Title,Status,HTTPStatusCode,DetectedAt';
    const STATUS_LABELS: Record<InvalidLinkStatus, string> = {
      invalid_404: '失效-404',
      invalid_5xx: '失效-服务器错误',
      invalid_redirect: '失效-重定向',
      invalid_dns: '失效-DNS',
      invalid_timeout: '失效-超时',
      invalid_content_deleted: '失效-内容已删',
    };

    const rows = invalidLinks.map(r => {
      const date = new Date(r.detectedAt).toISOString();
      const statusLabel = STATUS_LABELS[r.status] ?? r.status;
      return `"${r.url}","${r.title.replace(/"/g, '""')}","${statusLabel}",${r.httpStatusCode ?? ''},${date}`;
    });

    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmark-invalid-links-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  setInvalidFilter: (f) => {
    const { invalidLinks } = get();
    set({
      invalidFilter: f,
      filteredInvalidLinks: f === 'all'
        ? invalidLinks
        : invalidLinks.filter(l => l.status === f),
    });
  },

  setActiveCleanupTab: (t) => set({ activeCleanupTab: t }),
}));

// ---- Helper: Listen for CLEANUP_PROGRESS messages from SW ----

// Progress tracking from background scan
let progressListenerRegistered = false;

export function registerCleanupProgressListener(): void {
  if (progressListenerRegistered) return;
  progressListenerRegistered = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'CLEANUP_PROGRESS' && message.payload) {
      const { done, total } = message.payload as { done: number; total: number };
      useCleanupStore.setState({
        scanState: { phase: 'scanning', done, total, results: [] },
      });
    }

    if (message.type === 'CLEANUP_COMPLETE' && message.payload) {
      const { results } = message.payload as { results: InvalidLinkRecord[] };
      useCleanupStore.setState({
        scanState: { phase: 'done', done: results.length, total: results.length, results },
        invalidLinks: results,
        filteredInvalidLinks: results,
      });
    }
  });
}
