// ============================================================
// AI 书签管家 — Storage Manager
// ============================================================
import type {
  ExtensionConfig,
  RecycleItem,
  UsageStats,
} from '@shared/types';
import { DEFAULT_CONFIG, STORAGE_KEYS } from '@shared/types';

// ---- Helpers ----

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Deep merge two objects. Source overrides target for scalar values but merges objects recursively. */
function deepMerge<T>(target: T, source: Partial<T>): T {
  if (!isPlainObject(target) || !isPlainObject(source)) {
    return (source as T | undefined) ?? target;
  }

  const result = { ...target as Record<string, unknown> };
  const srcObj = source as unknown as Record<string, unknown>;
  for (const key of Object.keys(srcObj)) {
    const srcVal = srcObj[key];
    const tgtVal = result[key];
    if (isPlainObject(srcVal) && isPlainObject(tgtVal)) {
      result[key] = deepMerge(tgtVal, srcVal);
    } else if (srcVal !== undefined) {
      result[key] = srcVal;
    }
  }
  return result as unknown as T;
}

// ---- Config ----

/**
 * Retrieve the full extension config, merged with defaults.
 * Missing keys in storage are filled from DEFAULT_CONFIG.
 */
export async function getConfig(): Promise<ExtensionConfig> {
  const raw = await chrome.storage.local.get(STORAGE_KEYS.CONFIG);
  const stored = raw[STORAGE_KEYS.CONFIG] as Partial<ExtensionConfig> | undefined;
  if (stored && typeof stored === 'object') {
    return deepMerge(DEFAULT_CONFIG, stored);
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Save a partial config. Deep-merges with the existing stored config.
 */
export async function saveConfig(partial: Partial<ExtensionConfig>): Promise<void> {
  const current = await getConfig();
  const merged = deepMerge(current, partial);
  await chrome.storage.local.set({ [STORAGE_KEYS.CONFIG]: merged });
}

// ---- Recycle Bin ----

export async function getRecycleBin(): Promise<RecycleItem[]> {
  const raw = await chrome.storage.local.get(STORAGE_KEYS.RECYCLE_BIN);
  const items = raw[STORAGE_KEYS.RECYCLE_BIN];
  return Array.isArray(items) ? (items as RecycleItem[]) : [];
}

export async function addToRecycleBin(item: RecycleItem): Promise<void> {
  const items = await getRecycleBin();
  items.push(item);
  await chrome.storage.local.set({ [STORAGE_KEYS.RECYCLE_BIN]: items });
}

export async function removeFromRecycleBin(id: string): Promise<void> {
  const items = await getRecycleBin();
  const filtered = items.filter((i) => i.bookmark.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEYS.RECYCLE_BIN]: filtered });
}

export async function clearRecycleBin(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.RECYCLE_BIN]: [] });
}

// ---- Usage Stats ----

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function getUsageStats(): Promise<UsageStats> {
  const raw = await chrome.storage.local.get(STORAGE_KEYS.USAGE_STATS);
  const stats = raw[STORAGE_KEYS.USAGE_STATS] as UsageStats | undefined;
  const today = todayKey();
  if (stats && stats.date === today) {
    return stats;
  }
  return { date: today, apiCalls: 0, tokensUsed: 0 };
}

export async function incrementUsage(tokens: number): Promise<void> {
  const stats = await getUsageStats();
  stats.apiCalls += 1;
  stats.tokensUsed += tokens;
  await chrome.storage.local.set({ [STORAGE_KEYS.USAGE_STATS]: stats });
}

export async function checkDailyLimit(): Promise<boolean> {
  const config = await getConfig();
  const stats = await getUsageStats();
  return stats.apiCalls >= config.model.dailyLimit;
}
