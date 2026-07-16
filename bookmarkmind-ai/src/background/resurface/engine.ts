// ============================================================
// AI 书签管家 v2 — 再发现引擎
// ============================================================
import { buildCandidatePool, computeScores, selectTopCandidates } from './scorer';
import { getAllBookmarks } from '../bookmarks/crud';
import type {
  ResurfaceRecord,
  ResurfacePrefs,
  ResurfaceAction,
} from '@shared/types';
import { STORAGE_KEYS, DEFAULT_RESURFACE_PREFS } from '@shared/types';

export interface ResurfaceCardData {
  bookmarkId: string;
  title: string;
  url: string;
  domain: string;
  faviconUrl?: string;
  daysSinceAdded: number;
  daysSinceLastVisit: number;
  score: number;
  tags?: string[];
}

// ---- Cache for today's results ----

let todayCards: ResurfaceCardData[] | null = null;
let todayDate: string = '';

function getToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterday(): string {
  const d = new Date(Date.now() - 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---- Prefs Management ----

export async function getResurfacePrefs(): Promise<ResurfacePrefs> {
  const raw = await chrome.storage.local.get(STORAGE_KEYS.RESURFACE_PREFS);
  const stored = raw[STORAGE_KEYS.RESURFACE_PREFS] as Partial<ResurfacePrefs> | undefined;
  return { ...DEFAULT_RESURFACE_PREFS, ...stored };
}

export async function setResurfacePrefs(partial: Partial<ResurfacePrefs>): Promise<void> {
  const current = await getResurfacePrefs();
  const updated = { ...current, ...partial };
  await chrome.storage.local.set({ [STORAGE_KEYS.RESURFACE_PREFS]: updated });
}

// ---- Records Management ----

async function getResurfaceRecords(): Promise<ResurfaceRecord[]> {
  const raw = await chrome.storage.local.get(STORAGE_KEYS.RESURFACE_RECORDS);
  return (raw[STORAGE_KEYS.RESURFACE_RECORDS] as ResurfaceRecord[] | undefined) ?? [];
}

export async function getResurfaceRecordsPublic(): Promise<ResurfaceRecord[]> {
  return getResurfaceRecords();
}

async function saveResurfaceRecords(records: ResurfaceRecord[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.RESURFACE_RECORDS]: records });
}

// ---- Engine ----

/**
 * Select N bookmarks to resurface using the scoring algorithm.
 * Caches results for the same day.
 */
export async function selectResurfaceCards(
  count?: number,
  refresh?: boolean,
): Promise<ResurfaceCardData[]> {
  const today = getToday();
  const prefs = await getResurfacePrefs();

  // Return cached if same day and not refreshing
  if (!refresh && todayCards && todayDate === today) {
    return todayCards;
  }

  const allBookmarks = await getAllBookmarks();
  const records = await getResurfaceRecords();
  const actualCount = count ?? prefs.count;

  // Check if the previous day's push was ignored (no user action)
  // This handles the case where user simply doesn't interact with the notification
  const yesterday = getYesterday();
  const prevDayPush = records.filter(
    (r) => r.pushedDate === yesterday && r.action === 'no_action',
  );
  if (prevDayPush.length > 0) {
    prefs.noActionStreak += 1;

    // Anti-disturbance: degrade frequency or pause
    if (prefs.noActionStreak >= 5) {
      prefs.paused = true;
    } else if (prefs.noActionStreak >= 3 && prefs.frequency === 'daily') {
      prefs.frequency = 'weekly';
    }
    await setResurfacePrefs(prefs);
  }

  // If paused, still build cards but skip push notification
  if (prefs.paused && actualCount === 0) {
    return [];
  }

  // Build candidate pool and compute scores
  const candidates = await buildCandidatePool(allBookmarks, records);
  const scored = computeScores(candidates);

  // Select top N
  const selected = selectTopCandidates(scored, actualCount);

  // Convert to card data
  const cards: ResurfaceCardData[] = selected.map((s) => ({
    bookmarkId: s.bookmark.id,
    title: s.bookmark.title,
    url: s.bookmark.url,
    domain: extractDomain(s.bookmark.url),
    faviconUrl: buildFavicon(s.bookmark.url),
    daysSinceAdded: s.daysSinceAdded,
    daysSinceLastVisit: s.daysSinceLastVisit,
    score: Math.round(s.score * 100) / 100,
  }));

  // Cache
  todayCards = cards;
  todayDate = today;

  // Record as pushed
  const newRecords: ResurfaceRecord[] = cards.map((c) => ({
    bookmarkId: c.bookmarkId,
    pushedDate: today,
    action: 'no_action',
    score: c.score,
  }));

  const allRecords = [...records, ...newRecords];
  await saveResurfaceRecords(allRecords);

  return cards;
}

/**
 * Handle a user action on a resurface card.
 */
export async function handleResurfaceAction(
  bookmarkId: string,
  action: ResurfaceAction,
): Promise<void> {
  const records = await getResurfaceRecords();
  const now = Date.now();

  const record = records.find(
    (r) => r.bookmarkId === bookmarkId,
  );

  if (record) {
    record.action = action;
    record.actionAt = now;

    if (action === 'dismissed') {
      // Dismiss for 90 days
      record.dismissedUntil = now + 90 * 24 * 60 * 60 * 1000;
    }
  }

  // Update prefs based on action
  const prefs = await getResurfacePrefs();

  if (action === 'opened' || action === 'rebookmarked') {
    prefs.noActionStreak = 0;
    prefs.paused = false;
  } else if (action === 'dismissed' || action === 'no_action') {
    prefs.noActionStreak += 1;

    // Anti-disturbance: degrade frequency after 3 consecutive no-actions
    if (prefs.noActionStreak >= 5) {
      prefs.paused = true;
    } else if (prefs.noActionStreak >= 3) {
      prefs.frequency = 'weekly';
    }
  }

  await saveResurfaceRecords(records);
  await setResurfacePrefs(prefs);

  // Invalidate cache
  todayCards = null;
}

/**
 * Check if resurface push should be enabled (7-day rule, pause state).
 */
export async function shouldPush(): Promise<boolean> {
  const prefs = await getResurfacePrefs();

  if (!prefs.enabled) return false;
  if (prefs.frequency === 'disabled') return false;
  if (prefs.paused) return false;

  // Check 7-day install rule
  const raw = await chrome.storage.local.get(STORAGE_KEYS.INSTALL_DATE);
  const installDate = raw[STORAGE_KEYS.INSTALL_DATE] as number | undefined;
  if (installDate) {
    const daysSinceInstall = Math.floor((Date.now() - installDate) / (24 * 60 * 60 * 1000));
    if (daysSinceInstall < 7) return false;
  }

  return true;
}

/**
 * Generate system notification for today's cards.
 */
export async function pushNotification(cards: ResurfaceCardData[]): Promise<void> {
  if (cards.length === 0) return;

  const mainCard = cards[0];
  const count = cards.length;

  await chrome.notifications.create(`resurface-${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: `发现 ${count} 个被遗忘的书签`,
    message: `${mainCard.title} 及另外 ${count - 1} 个书签`,
    priority: 1,
    requireInteraction: false,
  });
}

// ---- Helpers ----

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function buildFavicon(url: string): string {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
  } catch {
    return '';
  }
}
