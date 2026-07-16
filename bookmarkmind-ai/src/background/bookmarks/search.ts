// ============================================================
// AI 书签管家 — Bookmark Keyword Pre-Filter
// ============================================================
import type { BookmarkItem } from '@shared/types';

/**
 * Pre-filter bookmarks by simple keyword matching on title and URL.
 * Reduces the candidate list before sending to AI for expensive semantic search.
 *
 * @param query     — Natural language search query
 * @param bookmarks — Full list of bookmarks to filter
 * @param limit     — Maximum number of candidates to return (default 50)
 */
export function preFilterBookmarks(
  query: string,
  bookmarks: BookmarkItem[],
  limit: number = 50,
): BookmarkItem[] {
  if (!query || !query.trim()) {
    return bookmarks.slice(0, limit);
  }

  const keywords = extractKeywords(query);

  if (keywords.length === 0) {
    return bookmarks.slice(0, limit);
  }

  // Score each bookmark by how many keywords match
  const scored = bookmarks.map((bm) => {
    let score = 0;
    const titleLower = bm.title.toLowerCase();
    const urlLower = bm.url.toLowerCase();

    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();

      // Title match (highest weight)
      if (titleLower.includes(kwLower)) {
        score += 3;
        // Exact word match bonus
        const wordBoundary = new RegExp(`\\b${escapeRegex(kwLower)}\\b`, 'i');
        if (wordBoundary.test(bm.title)) {
          score += 2;
        }
      }

      // URL domain/path match
      if (urlLower.includes(kwLower)) {
        score += 1;
      }

      // URL domain exact match bonus
      try {
        const domain = new URL(bm.url).hostname.toLowerCase();
        if (domain.includes(kwLower)) {
          score += 1;
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    return { bookmark: bm, score };
  });

  // Sort by score descending, then by dateAdded descending as tiebreaker
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.bookmark.dateAdded || 0) - (a.bookmark.dateAdded || 0);
  });

  // Return bookmarks with score > 0, up to limit
  return scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.bookmark);
}

/**
 * Extract meaningful keywords from a natural language query.
 *
 * Removes common stop words and splits on whitespace/punctuation.
 * Returns lowercase keywords.
 */
export function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都',
    '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会',
    '着', '没有', '看', '好', '自己', '这', '他', '她', '它', '们',
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'shall', 'can',
    'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between',
    'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'about', 'and', 'but',
    'or', 'if', 'while', 'me', 'my', 'we', 'our', 'you', 'your',
  ]);

  // Split on non-word characters (excluding Chinese)
  const tokens = query
    .replace(/[^\w\u4e00-\u9fff]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const keywords: string[] = [];

  for (const token of tokens) {
    const lower = token.toLowerCase();
    // Skip stop words and very short tokens
    if (stopWords.has(lower)) continue;
    if (lower.length < 2 && !/[\u4e00-\u9fff]/.test(lower)) continue;
    keywords.push(lower);
  }

  // Also add the original query as a phrase for whole-phrase matching
  if (keywords.length > 1) {
    keywords.push(query.toLowerCase().trim());
  }

  return keywords;
}

// ---- Helpers ----

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
