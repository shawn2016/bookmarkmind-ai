// ============================================================
// AI 书签管家 v2 — 再发现评分算法
// ============================================================
import type { BookmarkItem, ResurfaceRecord } from '@shared/types';

export interface ScoredBookmark {
  bookmark: BookmarkItem;
  score: number;
  daysSinceAdded: number;
  daysSinceLastVisit: number;
}

/**
 * Build a candidate pool: bookmarks older than 30 days, not visited recently,
 * and not pushed or dismissed in the last 30 days.
 */
export async function buildCandidatePool(
  bookmarks: BookmarkItem[],
  resurfaceRecords: ResurfaceRecord[],
): Promise<ScoredBookmark[]> {
  const now = Date.now();
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

  // Build sets for exclusion
  const dismissedUntil = new Map<string, number>();
  const pushedRecently = new Set<string>();

  for (const record of resurfaceRecords) {
    if (record.dismissedUntil && record.dismissedUntil > now) {
      dismissedUntil.set(record.bookmarkId, record.dismissedUntil);
    }
    // Check if pushed in last 30 days
    const pushedDate = new Date(record.pushedDate).getTime();
    if (now - pushedDate < THIRTY_DAYS) {
      pushedRecently.add(record.bookmarkId);
    }
  }

  // Query browser history for last visit times
  const lastVisitMap = new Map<string, number>();
  try {
    const historyResults = await chrome.history.search({
      text: '',
      startTime: now - 365 * 24 * 60 * 60 * 1000, // Last year
      maxResults: 10000,
    });
    for (const item of historyResults) {
      if (item.url && item.lastVisitTime) {
        lastVisitMap.set(item.url, item.lastVisitTime);
      }
    }
  } catch {
    // If history API is unavailable, fall through
  }

  const candidates: ScoredBookmark[] = [];

  for (const bm of bookmarks) {
    // Must have URL and be at least 30 days old
    if (!bm.url) continue;
    if (now - bm.dateAdded < THIRTY_DAYS) continue;

    // Not dismissed
    if (dismissedUntil.has(bm.id)) continue;

    // Not pushed recently
    if (pushedRecently.has(bm.id)) continue;

    const daysSinceAdded = Math.floor((now - bm.dateAdded) / (24 * 60 * 60 * 1000));

    // Use chrome.history to get last visit time
    const lastVisit = lastVisitMap.get(bm.url) ?? 0;
    const daysSinceLastVisit = lastVisit > 0
      ? Math.floor((now - lastVisit) / (24 * 60 * 60 * 1000))
      : daysSinceAdded; // No visit record → use creation time as proxy

    // PRD: skip bookmarks visited within the last 14 days
    if (lastVisit > 0 && now - lastVisit < FOURTEEN_DAYS) continue;

    candidates.push({
      bookmark: bm,
      score: 0,
      daysSinceAdded,
      daysSinceLastVisit,
    });
  }

  return candidates;
}

/**
 * Compute the resurface score for each candidate using the weighted formula:
 *   score = days_since_last_visit * 0.3
 *         + min(days_since_added, 365) * 0.2
 *         + topic_match * 0.3
 *         + quality * 0.2
 *
 * In P0, topic_match is replaced by a simple heuristic based on URL domain.
 */
export function computeScores(candidates: ScoredBookmark[]): ScoredBookmark[] {
  for (const candidate of candidates) {
    const bookmark = candidate.bookmark;

    // days_since_last_visit normalized (max 1 year = 3.0)
    const visitScore = Math.min(candidate.daysSinceLastVisit, 365) / 365 * 3.0;

    // days_since_added normalized (max 1 year = 2.0)
    const ageScore = Math.min(candidate.daysSinceAdded, 365) / 365 * 2.0;

    // topic_match: heuristic based on URL domain variety
    // P0: give higher score to non-common domains
    const domain = extractDomainSimple(bookmark.url);
    const domainScore = computeDomainScore(domain);

    // quality: heuristic based on title length and URL structure
    const qualityScore = computeQualityScore(bookmark.title, bookmark.url);

    candidate.score =
      visitScore * 0.3 +
      ageScore * 0.2 +
      domainScore * 0.3 +
      qualityScore * 0.2;
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

/**
 * Select top N candidates by score, with some randomization for variety.
 */
export function selectTopCandidates(
  candidates: ScoredBookmark[],
  count: number,
  excludeIds?: Set<string>,
): ScoredBookmark[] {
  const filtered = excludeIds
    ? candidates.filter((c) => !excludeIds.has(c.bookmark.id))
    : candidates;

  // For scores within 10% of each other, shuffle to add variety
  const result: ScoredBookmark[] = [];
  let i = 0;

  while (result.length < count && i < filtered.length) {
    // Find the next batch with similar scores (within 10%)
    const batch: ScoredBookmark[] = [filtered[i]];
    const threshold = filtered[i].score * 0.9;

    for (let j = i + 1; j < filtered.length && filtered[j].score >= threshold; j++) {
      batch.push(filtered[j]);
    }

    // Shuffle the batch
    for (let k = batch.length - 1; k > 0; k--) {
      const rand = Math.floor(Math.random() * (k + 1));
      [batch[k], batch[rand]] = [batch[rand], batch[k]];
    }

    // Take from batch
    for (const item of batch) {
      if (result.length >= count) break;
      result.push(item);
    }

    i += batch.length;
  }

  return result;
}

// ---- Helpers ----

function extractDomainSimple(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Compute a simple domain-based "interestingness" score.
 * Less common domains get higher scores.
 */
const COMMON_DOMAINS = new Set([
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'x.com',
  'instagram.com', 'reddit.com', 'wikipedia.org', 'amazon.com', 'ebay.com',
  'netflix.com', 'github.com', 'stackoverflow.com', 'linkedin.com',
  'baidu.com', 'zhihu.com', 'weibo.com', 'bilibili.com', 'douyin.com',
]);

function computeDomainScore(domain: string): number {
  if (!domain) return 1.0;
  if (COMMON_DOMAINS.has(domain)) return 0.5;
  // Niche domains get higher scores
  return 1.0 + Math.min(domain.length / 20, 0.5);
}

/**
 * Compute a simple quality score based on title length and URL structure.
 */
function computeQualityScore(title: string, url: string): number {
  let score = 1.0;

  // Title length bonus (10-60 chars is good)
  const titleLen = title.trim().length;
  if (titleLen >= 10 && titleLen <= 60) score += 0.5;
  else if (titleLen > 0 && titleLen < 10) score += 0.2;
  else if (titleLen > 60) score += 0.3;

  // URL path depth bonus (deeper paths suggest more specific content)
  try {
    const path = new URL(url).pathname;
    const segments = path.split('/').filter(Boolean);
    if (segments.length >= 2) score += 0.3;
  } catch {
    // ignore
  }

  return score;
}
