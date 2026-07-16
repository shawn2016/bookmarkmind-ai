// ============================================================
// AI 书签管家 v2 — 高亮存储层
// ============================================================
import type { BookmarkHighlight } from '@shared/types';
import { STORAGE_KEYS } from '@shared/types';

const MAX_HIGHLIGHTS_PER_BOOKMARK = 10;

let highlightsCache: Map<string, BookmarkHighlight[]> | null = null; // bookmarkId -> highlights

async function loadHighlights(): Promise<Map<string, BookmarkHighlight[]>> {
  if (highlightsCache) return highlightsCache;
  const raw = await chrome.storage.local.get(STORAGE_KEYS.HIGHLIGHTS);
  const all = (raw[STORAGE_KEYS.HIGHLIGHTS] as BookmarkHighlight[] | undefined) ?? [];
  highlightsCache = new Map<string, BookmarkHighlight[]>();
  for (const h of all) {
    const existing = highlightsCache.get(h.bookmarkId);
    if (existing) {
      existing.push(h);
    } else {
      highlightsCache.set(h.bookmarkId, [h]);
    }
  }
  return highlightsCache;
}

async function saveHighlights(map: Map<string, BookmarkHighlight[]>): Promise<void> {
  highlightsCache = map;
  const all = Array.from(map.values()).flat();
  await chrome.storage.local.set({ [STORAGE_KEYS.HIGHLIGHTS]: all });
}

export async function addHighlight(
  bookmarkId: string,
  text: string,
  xpath: string,
  url: string,
): Promise<BookmarkHighlight> {
  const map = await loadHighlights();
  const existing = map.get(bookmarkId) ?? [];

  if (existing.length >= MAX_HIGHLIGHTS_PER_BOOKMARK) {
    throw new Error(`每个书签最多 ${MAX_HIGHLIGHTS_PER_BOOKMARK} 条高亮`);
  }

  // Check for duplicate text
  if (existing.some((h) => h.text === text)) {
    // Already exists, skip
    return existing.find((h) => h.text === text)!;
  }

  const highlight: BookmarkHighlight = {
    id: crypto.randomUUID(),
    bookmarkId,
    text,
    xpath,
    url,
    createdAt: Date.now(),
  };

  existing.push(highlight);
  map.set(bookmarkId, existing);
  await saveHighlights(map);
  return highlight;
}

export async function listHighlights(
  bookmarkId: string,
): Promise<BookmarkHighlight[]> {
  const map = await loadHighlights();
  return map.get(bookmarkId) ?? [];
}

export async function deleteHighlight(
  bookmarkId: string,
  highlightId: string,
): Promise<void> {
  const map = await loadHighlights();
  const existing = map.get(bookmarkId);
  if (existing) {
    const filtered = existing.filter((h) => h.id !== highlightId);
    if (filtered.length === 0) {
      map.delete(bookmarkId);
    } else {
      map.set(bookmarkId, filtered);
    }
    await saveHighlights(map);
  }
}

export async function getBookmarksWithHighlights(): Promise<Set<string>> {
  const map = await loadHighlights();
  const result = new Set<string>();
  for (const [bookmarkId, highlights] of map) {
    if (highlights.length > 0) result.add(bookmarkId);
  }
  return result;
}
