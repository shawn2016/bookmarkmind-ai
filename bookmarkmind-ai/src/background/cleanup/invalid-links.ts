// ============================================================
// AI 书签管家 v2 — 失效链接检测核心逻辑
// ============================================================
import type { InvalidLinkRecord, InvalidLinkStatus, BookmarkItem } from '@shared/types';
import { STORAGE_KEYS } from '@shared/types';

const BATCH_SIZE = 5;
const REQUEST_TIMEOUT = 10000; // 10s
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

/**
 * Determine the failure type from an HTTP response or error.
 */
function classifyStatus(status: number | null, errorType: string | null): InvalidLinkStatus {
  if (errorType) {
    if (errorType === 'AbortError' || errorType === 'TimeoutError') return 'invalid_timeout';
    if (errorType === 'TypeError') return 'invalid_dns';
    return 'invalid_dns';
  }
  if (status === null) return 'invalid_dns';

  if (status === 404) return 'invalid_404';
  if (status >= 500 && status < 600) return 'invalid_5xx';
  if (status >= 300 && status < 400) return 'invalid_redirect';
  if (status === 200) return 'invalid_content_deleted'; // will be filtered out if body > 100
  return 'invalid_5xx';
}

/**
 * Read cached scan results, filtering out expired entries.
 */
async function getCachedResults(): Promise<InvalidLinkRecord[]> {
  const raw = await chrome.storage.local.get(STORAGE_KEYS.INVALID_LINKS);
  const records = (raw[STORAGE_KEYS.INVALID_LINKS] as InvalidLinkRecord[] | undefined) ?? [];
  const now = Date.now();
  return records.filter((r) => now - r.detectedAt < CACHE_TTL);
}

/**
 * Save scan results to storage.
 */
async function saveResults(records: InvalidLinkRecord[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.INVALID_LINKS]: records });
}

/**
 * Build a set of cached bookmark IDs from cached results.
 */
function getCachedBookmarkIds(cached: InvalidLinkRecord[]): Set<string> {
  return new Set(cached.map((r) => r.bookmarkId));
}

/**
 * Scan all bookmarks for invalid links.
 * Supports progress callback (SW → Content Script).
 * Uses HEAD requests, 5 concurrent, 10s timeout.
 */
export async function scanInvalidLinks(
  bookmarks: BookmarkItem[],
  onProgress?: (done: number, total: number) => void,
): Promise<InvalidLinkRecord[]> {
  const cached = await getCachedResults();
  const cachedIds = getCachedBookmarkIds(cached);

  // Filter: only scan URLs that are not already cached
  const toScan = bookmarks.filter(
    (b) => b.url && !cachedIds.has(b.id),
  );

  const total = toScan.length;
  let done = 0;
  const results: InvalidLinkRecord[] = [...cached];

  for (let i = 0; i < toScan.length; i += BATCH_SIZE) {
    const batch = toScan.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (bm) => {
        try {
          const response = await fetch(bm.url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(REQUEST_TIMEOUT),
          });

          const contentType = response.headers.get('content-type') ?? '';
          const contentLength = response.headers.get('content-length');

          // Check if 200 but empty/deleted content
          if (
            response.ok &&
            contentLength &&
            parseInt(contentLength, 10) < 100 &&
            contentType.includes('text/html')
          ) {
            return createRecord(bm, 'invalid_content_deleted', response.status);
          }

          // Check for redirect: fetch follows redirects by default,
          // so response.status is the final status (usually 200), not 3xx.
          // response.redirected is true if the request followed a redirect.
          if (response.redirected) {
            return createRecord(bm, 'invalid_redirect', response.status);
          }

          // 404 and 5xx errors
          if (!response.ok) {
            return createRecord(bm, classifyStatus(response.status, null), response.status);
          }

          // URL is valid
          return null;
        } catch (err) {
          const errorName = (err as { name?: string }).name ?? 'Unknown';
          return createRecord(bm, classifyStatus(null, errorName));
        }
      }),
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled' && r.value) {
        results.push(r.value);
      }
    }

    done += batch.length;
    onProgress?.(done, total);
  }

  // Save updated results to storage
  await saveResults(results);

  return results;
}

/**
 * Create an InvalidLinkRecord from a bookmark scan result.
 */
function createRecord(
  bm: BookmarkItem,
  status: InvalidLinkStatus,
  httpStatusCode?: number,
): InvalidLinkRecord {
  return {
    bookmarkId: bm.id,
    url: bm.url,
    title: bm.title,
    status,
    httpStatusCode,
    detectedAt: Date.now(),
    retryCount: 0,
  };
}

/**
 * Export invalid link records to CSV format.
 */
export function exportToCSV(records: InvalidLinkRecord[]): string {
  const header = 'URL,Title,Status,HTTPStatusCode,DetectedAt';
  const rows = records.map((r) => {
    const date = new Date(r.detectedAt).toISOString();
    const statusLabel = STATUS_LABELS[r.status] ?? r.status;
    return `"${r.url}","${r.title.replace(/"/g, '""')}","${statusLabel}",${r.httpStatusCode ?? ''},${date}`;
  });
  return [header, ...rows].join('\n');
}

/** Human-readable labels for invalid link statuses */
const STATUS_LABELS: Record<InvalidLinkStatus, string> = {
  invalid_404: '失效-404',
  invalid_5xx: '失效-服务器错误',
  invalid_redirect: '失效-重定向',
  invalid_dns: '失效-DNS',
  invalid_timeout: '失效-超时',
  invalid_content_deleted: '失效-内容已删',
};
