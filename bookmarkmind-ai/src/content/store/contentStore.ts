// ============================================================
// Zustand Content Store — manages all content script state
// ============================================================

import { create } from 'zustand';
import type {
  ChatMessage,
  BookmarkItem,
  BallConfig,
  ExtensionConfig,
  AppSettings,
  ActiveView,
  ViewPreferences,
} from '@shared/types';
import { DEFAULT_CONFIG, DEFAULT_VIEW_PREFS } from '@shared/types';
import { applyAppSettings, watchSystemTheme } from '@shared/utils/theme';

// ---- Toast ----
export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

let toastId = 0;
function nextToastId(): string {
  return `toast-${++toastId}`;
}

let msgId = 0;
export function nextMessageId(): string {
  return `msg-${++msgId}`;
}

// ---- Bookmark Save Modal ----
export interface BookmarkSaveModalState {
  open: boolean;
  url: string;
  title: string;
  suggestedCategory: string;
  folders: { id: string; title: string }[];
  loading: boolean;
  // v2 新增
  note: string;
  suggestedTags: { name: string; path: string }[];
  selectedTagIds: string[];
}

// ---- Modal ----
export interface ModalState {
  open: boolean;
  title: string;
  content: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'danger';
  confirmText?: string;
}

// ---- Content Store ----
export interface ContentStore {
  // Ball state
  ballState: 'collapsed' | 'hover' | 'expanded';
  ballPosition: { side: 'left' | 'right'; y: number };
  ballOpacity: number;
  ballConfig: BallConfig;
  ballSessionHidden: boolean;
  ballShrunk: boolean;
  ballClosePanelVisible: boolean;
  ballLivePos: { x: number; y: number } | null;
  ballDragging: boolean;

  // App settings
  appSettings: AppSettings;

  // Panel state
  panelVisible: boolean;
  panelSize: { width: number; height: number };
  panelPosition: { x: number; y: number };
  activeTab: ActiveView;
  panelFullscreen: boolean;
  messages: ChatMessage[];
  isStreaming: boolean;
  aiConfigured: boolean;

  // Bookmark state
  bookmarks: BookmarkItem[];
  filteredBookmarks: BookmarkItem[];
  selectedIds: Set<string>;
  searchQuery: string;
  activeCategory: string | null;
  batchMode: boolean;

  // Toast
  toasts: ToastItem[];

  // Modal
  modalState: ModalState;
  bookmarkSaveModal: BookmarkSaveModalState;

  // v2: View Preferences
  viewPreferences: ViewPreferences;

  // ---- Actions ----
  setBallState: (s: 'collapsed' | 'hover' | 'expanded') => void;
  ballHoverEnter: () => void;
  ballHoverLeave: () => void;
  setBallConfig: (c: BallConfig) => void;
  setBallSessionHidden: (v: boolean) => void;
  setBallShrunk: (v: boolean) => void;
  setBallClosePanelVisible: (v: boolean) => void;
  setBallLivePos: (p: { x: number; y: number } | null) => void;
  setBallDragging: (v: boolean) => void;
  toggleBallShrunk: () => void;
  setAppSettings: (s: AppSettings) => void;
  expandPanel: () => void;
  collapsePanel: () => void;
  setActiveTab: (t: ActiveView) => void;
  setPanelSize: (s: { width: number; height: number }) => void;
  setPanelPosition: (p: { x: number; y: number }) => void;
  togglePanelFullscreen: () => void;
  setPanelFullscreen: (v: boolean) => void;
  addMessage: (m: ChatMessage) => void;
  updateMessage: (id: string, partial: Partial<ChatMessage>) => void;
  setStreaming: (s: boolean) => void;
  setAiConfigured: (v: boolean) => void;
  setBookmarks: (b: BookmarkItem[]) => void;
  setFilteredBookmarks: (b: BookmarkItem[]) => void;
  toggleSelected: (id: string) => void;
  selectAll: () => void;
  clearSelected: () => void;
  setSearchQuery: (q: string) => void;
  setActiveCategory: (c: string | null) => void;
  setBatchMode: (b: boolean) => void;
  pushToast: (t: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  showModal: (s: ModalState) => void;
  hideModal: () => void;
  showBookmarkSaveModal: (data: { url: string; title: string }) => void;
  hideBookmarkSaveModal: () => void;
  setBookmarkSaveModal: (partial: Partial<BookmarkSaveModalState>) => void;
  // v2: View Preferences actions
  setViewPreferences: (p: Partial<ViewPreferences>) => void;
  persistViewPreferences: () => Promise<void>;
  restoreViewPreferences: () => Promise<void>;
}

const defaultBallConfig: BallConfig = DEFAULT_CONFIG.ball;
const defaultAppSettings: AppSettings = DEFAULT_CONFIG.app;

let ballHoverLeaveTimer: ReturnType<typeof setTimeout> | null = null;
let ballHoverRefCount = 0;
const BALL_HOVER_LEAVE_DELAY = 1600;

export const useContentStore = create<ContentStore>((set, get) => ({
  // Ball state
  ballState: 'collapsed',
  ballPosition: {
    side: defaultBallConfig.side,
    y: defaultBallConfig.verticalPosition,
  },
  ballOpacity: defaultBallConfig.opacity / 100,
  ballConfig: defaultBallConfig,
  ballSessionHidden: false,
  ballShrunk: false,
  ballClosePanelVisible: false,
  ballLivePos: null,
  ballDragging: false,

  // App settings
  appSettings: defaultAppSettings,

  // Panel state
  panelVisible: false,
  panelSize: { width: 380, height: 520 },
  panelPosition: { x: 0, y: 0 },
  activeTab: 'chat',
  panelFullscreen: false,

  // Chat state
  messages: [],
  isStreaming: false,
  aiConfigured: false,

  // Bookmark state
  bookmarks: [],
  filteredBookmarks: [],
  selectedIds: new Set<string>(),
  searchQuery: '',
  activeCategory: null,
  batchMode: false,

  // Toast
  toasts: [],

  // Modal
  modalState: {
    open: false,
    title: '',
    content: '',
  },

  bookmarkSaveModal: {
    open: false,
    url: '',
    title: '',
    suggestedCategory: '',
    folders: [],
    loading: false,
    note: '',
    suggestedTags: [],
    selectedTagIds: [],
  },

  // v2: View Preferences
  viewPreferences: DEFAULT_VIEW_PREFS,

  // ---- Actions ----

  setBallState: (s) => set({ ballState: s }),

  ballHoverEnter: () => {
    ballHoverRefCount += 1;
    if (ballHoverLeaveTimer) {
      clearTimeout(ballHoverLeaveTimer);
      ballHoverLeaveTimer = null;
    }
    set({ ballState: 'hover' });
  },

  ballHoverLeave: () => {
    ballHoverRefCount = Math.max(0, ballHoverRefCount - 1);
    if (ballHoverRefCount > 0) return;

    if (ballHoverLeaveTimer) clearTimeout(ballHoverLeaveTimer);
    ballHoverLeaveTimer = setTimeout(() => {
      if (ballHoverRefCount > 0) return;
      const state = get();
      if (!state.ballDragging && !state.ballClosePanelVisible) {
        set({ ballState: 'collapsed' });
      }
      ballHoverLeaveTimer = null;
    }, BALL_HOVER_LEAVE_DELAY);
  },

  setBallConfig: (c) =>
    set({
      ballConfig: c,
      ballOpacity: c.opacity / 100,
      ballPosition: { side: c.side, y: c.verticalPosition },
    }),

  setBallSessionHidden: (v) => set({ ballSessionHidden: v }),

  setBallShrunk: (v) => set({ ballShrunk: v }),

  setBallClosePanelVisible: (v) => set({ ballClosePanelVisible: v }),

  setBallLivePos: (p) => set({ ballLivePos: p }),

  setBallDragging: (v) => set({ ballDragging: v }),

  toggleBallShrunk: () =>
    set((state) => ({ ballShrunk: !state.ballShrunk })),

  setAppSettings: (s) => set({ appSettings: s }),

  expandPanel: () => set({ panelVisible: true, ballState: 'expanded' }),

  collapsePanel: () =>
    set({
      panelVisible: false,
      ballState: 'collapsed',
    }),

  setActiveTab: (t) => set({ activeTab: t }),

  setPanelSize: (s) => set({ panelSize: s }),

  setPanelPosition: (p) => set({ panelPosition: p }),

  togglePanelFullscreen: () => {
    const next = !get().panelFullscreen;
    set({ panelFullscreen: next });
    // Persist preference so reopening the panel keeps the user's choice
    get().persistViewPreferences();
  },

  setPanelFullscreen: (v) => {
    set({ panelFullscreen: v });
    get().persistViewPreferences();
  },

  addMessage: (m) =>
    set((state) => {
      const messages = state.messages.length >= 50
        ? state.messages.slice(-49).concat(m)
        : [...state.messages, m];
      return { messages };
    }),

  updateMessage: (id, partial) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...partial } : m,
      ),
    })),

  setStreaming: (s) => set({ isStreaming: s }),

  setAiConfigured: (v) => set({ aiConfigured: v }),

  setBookmarks: (b) => set({ bookmarks: b }),

  setFilteredBookmarks: (b) => set({ filteredBookmarks: b }),

  toggleSelected: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),

  selectAll: () =>
    set((state) => ({
      selectedIds: new Set(state.filteredBookmarks.map((b) => b.id)),
    })),

  clearSelected: () => set({ selectedIds: new Set<string>() }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  setActiveCategory: (c) => set({ activeCategory: c }),

  setBatchMode: (b) =>
    set((state) => ({
      batchMode: b,
      selectedIds: b ? state.selectedIds : new Set<string>(),
    })),

  pushToast: (t) => {
    const id = nextToastId();
    set((state) => {
      // Respect notification settings
      const settings = state.appSettings.notifications;
      if (t.type === 'success' && !settings.toastSuccess) return {};
      if (t.type === 'error' && !settings.toastError) return {};
      if (t.type === 'info' && !settings.toastInfo) return {};
      return { toasts: [...state.toasts, { ...t, id }] };
    });
    const dur = t.duration ?? 3000;
    if (dur > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, dur);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  showModal: (s) => set({ modalState: { ...s, open: true } }),

  hideModal: () =>
    set({
      modalState: { open: false, title: '', content: '' },
    }),

  showBookmarkSaveModal: (data) => {
    set({
      bookmarkSaveModal: {
        open: true,
        url: data.url,
        title: data.title,
        suggestedCategory: '',
        folders: [],
        loading: true,
        note: '',
        suggestedTags: [],
        selectedTagIds: [],
      },
    });
  },

  hideBookmarkSaveModal: () =>
    set({
      bookmarkSaveModal: {
        open: false,
        url: '',
        title: '',
        suggestedCategory: '',
        folders: [],
        loading: false,
        note: '',
        suggestedTags: [],
        selectedTagIds: [],
      },
    }),

  setBookmarkSaveModal: (partial) =>
    set(state => ({
      bookmarkSaveModal: { ...state.bookmarkSaveModal, ...partial },
    })),

  // v2: View Preferences
  setViewPreferences: (p) =>
    set(state => ({
      viewPreferences: { ...state.viewPreferences, ...p },
    })),

  persistViewPreferences: async () => {
    const prefs = get().viewPreferences;
    await chrome.storage.local.set({ bm_view_prefs: prefs });
  },

  restoreViewPreferences: async () => {
    try {
      const raw = await chrome.storage.local.get('bm_view_prefs');
      const stored = raw['bm_view_prefs'] as ViewPreferences | undefined;
      if (stored && typeof stored === 'object' && stored.activeView) {
        const merged = { ...DEFAULT_VIEW_PREFS, ...stored };
        if ((merged.activeView as string) === 'graph') {
          merged.activeView = 'chat';
        }
        set({
          viewPreferences: merged,
          panelFullscreen: merged.panelFullscreen ?? false,
        });
      }
    } catch {
      // Ignore restore errors
    }
  },
}));

import { resolveModelConfig } from '@shared/utils/api-url';

/** Helper: load full extension config into store */
export function syncConfigToStore(rawConfig: ExtensionConfig): void {
  const config: ExtensionConfig = {
    model: resolveModelConfig({ ...DEFAULT_CONFIG.model, ...rawConfig.model }),
    ball: { ...DEFAULT_CONFIG.ball, ...rawConfig.ball },
    app: {
      ...DEFAULT_CONFIG.app,
      ...rawConfig.app,
      notifications: {
        ...DEFAULT_CONFIG.app.notifications,
        ...(rawConfig.app?.notifications ?? {}),
      },
    },
  };
  const store = useContentStore.getState();
  store.setBallConfig(config.ball);
  store.setAppSettings(config.app);
  store.setAiConfigured(isModelConfigured(config));

  applyThemeToContent(config.app);
}

function isModelConfigured(config: ExtensionConfig): boolean {
  if (config.model.provider === 'custom') {
    return !!config.model.baseUrl?.trim();
  }
  return !!config.model.apiKey?.trim();
}

function applyThemeToContent(app: ExtensionConfig['app']): void {
  const host = document.getElementById('bookmarkmind-ai-host');
  if (!host) return;
  applyAppSettings(app, host);
  watchSystemTheme(app, host);
}
