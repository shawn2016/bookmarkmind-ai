// ============================================================
// AI 书签管家 v2 — chrome.alarms 定时任务调度器
// ============================================================
import { STORAGE_KEYS } from '@shared/types';
import { shouldPush, selectResurfaceCards, pushNotification } from './resurface/engine';
import { getAllBookmarks } from './bookmarks/crud';
import { scanInvalidLinks } from './cleanup/invalid-links';

// ---- Alarm Names ----
const ALARM_CLEANUP_SCAN = 'cleanup-invalid-scan';
const ALARM_RESURFACE_DAILY = 'resurface-daily';

// ---- Initialize ----

/**
 * Set up all scheduled alarms.
 * Called on extension install/update and startup.
 */
export async function initScheduler(): Promise<void> {
  // Record install date on first run
  const raw = await chrome.storage.local.get(STORAGE_KEYS.INSTALL_DATE);
  if (!raw[STORAGE_KEYS.INSTALL_DATE]) {
    await chrome.storage.local.set({ [STORAGE_KEYS.INSTALL_DATE]: Date.now() });
  }

  // Clear existing alarms and recreate
  await chrome.alarms.clearAll();

  // Daily cleanup scan at 3:00 AM
  await chrome.alarms.create(ALARM_CLEANUP_SCAN, {
    delayInMinutes: calculateDelayToHour(3),
    periodInMinutes: 24 * 60,
  });

  // Daily resurface push at 9:00 AM
  await chrome.alarms.create(ALARM_RESURFACE_DAILY, {
    delayInMinutes: calculateDelayToHour(9),
    periodInMinutes: 24 * 60,
  });
}

/**
 * Calculate minutes from now until the next occurrence of a given hour.
 */
function calculateDelayToHour(targetHour: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, 0, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return Math.ceil((target.getTime() - now.getTime()) / 60000);
}

// ---- Alarm Handler ----

/**
 * Handle chrome.alarms.onAlarm events.
 */
export async function handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  switch (alarm.name) {
    case ALARM_CLEANUP_SCAN: {
      await runCleanupScan();
      break;
    }
    case ALARM_RESURFACE_DAILY: {
      await runResurfacePush();
      break;
    }
  }
}

// ---- Cleanup Scan ----

async function runCleanupScan(): Promise<void> {
  try {
    const bookmarks = await getAllBookmarks();
    if (bookmarks.length === 0) return;

    await scanInvalidLinks(bookmarks);

    // Broadcast completion to all tabs
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'CLEANUP_COMPLETE',
          payload: { results: [] },
        }).catch(() => {});
      }
    }
  } catch {
    // Background scan failures are silent
  }
}

// ---- Resurface Push ----

async function runResurfacePush(): Promise<void> {
  try {
    const enabled = await shouldPush();
    if (!enabled) return;

    const cards = await selectResurfaceCards();
    if (cards.length === 0) return;

    await pushNotification(cards);
  } catch {
    // Background push failures are silent
  }
}

// ---- Manual Trigger (called from message handler) ----

export async function triggerCleanupScan(
  onProgress?: (done: number, total: number) => void,
) {
  const bookmarks = await getAllBookmarks();
  return scanInvalidLinks(bookmarks, onProgress);
}

export async function triggerResurfacePush(
  count?: number,
  refresh?: boolean,
) {
  return selectResurfaceCards(count, refresh);
}
