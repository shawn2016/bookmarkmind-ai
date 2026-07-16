// ============================================================
// AI 书签管家 v2 — 重复书签检测核心逻辑
// ============================================================
import type { BookmarkItem, DuplicateGroup } from '@shared/types';
import { normalizeUrl } from '@shared/utils/url';

/**
 * Detect duplicate bookmarks using URL normalization and title matching.
 * Returns groups of duplicate bookmarks (O(n) complexity using Maps).
 */
export function findDuplicates(bookmarks: BookmarkItem[]): DuplicateGroup[] {
  // Map: normalized URL → bookmarks with that URL
  const urlMap = new Map<string, BookmarkItem[]>();
  // Map: normalized title → bookmarks with that title
  const titleMap = new Map<string, BookmarkItem[]>();

  for (const bm of bookmarks) {
    if (!bm.url) continue;

    // URL exact match (normalized: strip tracking, trailing slash, lowercase)
    const normUrl = normalizeUrl(bm.url);
    const existing = urlMap.get(normUrl);
    if (existing) {
      existing.push(bm);
    } else {
      urlMap.set(normUrl, [bm]);
    }

    // Title exact match (trimmed, lowercase)
    const normTitle = bm.title.trim().toLowerCase();
    const titleExisting = titleMap.get(normTitle);
    if (titleExisting) {
      titleExisting.push(bm);
    } else {
      titleMap.set(normTitle, [bm]);
    }
  }

  const groups: DuplicateGroup[] = [];

  // Collect URL exact duplicates
  for (const [, bookmarks] of urlMap) {
    if (bookmarks.length > 1) {
      groups.push({
        type: 'url_exact',
        bookmarks,
      });
    }
  }

  // Collect title exact duplicates (only those not already in URL groups)
  for (const [, bookmarks] of titleMap) {
    if (bookmarks.length > 1) {
      // Check if all bookmarks in this group are already covered by URL groups
      const coveredIds = new Set(
        groups
          .filter((g) => g.type === 'url_exact')
          .flatMap((g) => g.bookmarks.map((b) => b.id)),
      );
      const newBookmarks = bookmarks.filter((b) => !coveredIds.has(b.id));
      if (newBookmarks.length > 1) {
        groups.push({
          type: 'title_exact',
          bookmarks: newBookmarks,
        });
      }
    }
  }

  // URL suspected duplicates (same origin + path, different query params)
  const pathMap = new Map<string, BookmarkItem[]>();
  for (const bm of bookmarks) {
    if (!bm.url) continue;
    try {
      const u = new URL(bm.url);
      const pathKey = `${u.origin}${u.pathname}`.toLowerCase();
      const existing = pathMap.get(pathKey);
      if (existing) {
        existing.push(bm);
      } else {
        pathMap.set(pathKey, [bm]);
      }
    } catch {
      // Invalid URL, skip
    }
  }

  for (const [, pathBookmarks] of pathMap) {
    if (pathBookmarks.length > 1) {
      // Only add if not already captured by URL exact or title exact groups
      const coveredIds = new Set(
        groups.flatMap((g) => g.bookmarks.map((b) => b.id)),
      );
      const newBookmarks = pathBookmarks.filter((b) => !coveredIds.has(b.id));
      if (newBookmarks.length > 1) {
        groups.push({
          type: 'url_suspected',
          bookmarks: newBookmarks,
        });
      }
    }
  }

  return groups;
}
