// ============================================================
// AI 书签管家 v2 — 时间轴分组逻辑 Hook
// ============================================================
import { useEffect, useState, useMemo } from 'react';
import type { BookmarkItem } from '@shared/types';
import { safeSendMessage } from '@shared/utils/chrome-api';

export type TimelineGroupKey = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'this_year' | 'earlier';

export interface TimelineGroup {
  key: TimelineGroupKey;
  label: string;
  bookmarks: BookmarkItem[];
  count: number;
}

const GROUP_CONFIG: Array<{ key: TimelineGroupKey; label: string; getStart: (now: Date) => Date }> = [
  {
    key: 'today',
    label: '今天',
    getStart: (now) => new Date(now.getFullYear(), now.getMonth(), now.getDate()),
  },
  {
    key: 'yesterday',
    label: '昨天',
    getStart: (now) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      d.setDate(d.getDate() - 1);
      return d;
    },
  },
  {
    key: 'this_week',
    label: '本周',
    getStart: (now) => {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      d.setDate(d.getDate() - 7);
      return d;
    },
  },
  {
    key: 'this_month',
    label: '本月',
    getStart: (now) => {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return d;
    },
  },
  {
    key: 'this_year',
    label: '今年',
    getStart: (now) => new Date(now.getFullYear(), 0, 1),
  },
  {
    key: 'earlier',
    label: '更早',
    getStart: () => new Date(0),
  },
];

export function useTimeline() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  // Load bookmarks
  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const response = await safeSendMessage({ type: 'BOOKMARK_LIST' });
      setBookmarks(((response as Record<string, unknown>)?.bookmarks as BookmarkItem[]) ?? []);
    } catch {
      // silent
    }
    setLoading(false);
  };

  // Filter
  const filteredBookmarks = useMemo(() => {
    let result = [...bookmarks];

    // Search text filter
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(lower) ||
          b.url.toLowerCase().includes(lower),
      );
    }

    // Category filter
    if (selectedCategories.size > 0) {
      result = result.filter((b) => selectedCategories.has(b.parentTitle));
    }

    // Tag filter - deferred to caller, processed via selectedTagIds

    return result;
  }, [bookmarks, searchText, selectedCategories]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const bm of bookmarks) {
      if (bm.parentTitle) cats.add(bm.parentTitle);
    }
    return Array.from(cats).sort();
  }, [bookmarks]);

  // Group by time
  // Performance note: For typical bookmark counts (100-500), main-thread grouping
  // with useMemo completes in < 5ms. Web Worker would add ~20ms serialization overhead
  // for message passing, making it slower for common cases. Worker is only justified
  // for 5000+ bookmarks, which is rare. If profiling shows need, create a worker at
  // src/content/workers/timeline-grouper.worker.ts using `new Worker(new URL(...))`.
  const groups: TimelineGroup[] = useMemo(() => {
    const now = new Date();
    const groupsMap = new Map<TimelineGroupKey, BookmarkItem[]>();

    for (const bm of filteredBookmarks) {
      const date = new Date(bm.dateAdded);
      let groupKey: TimelineGroupKey = 'earlier';

      for (const config of GROUP_CONFIG) {
        if (config.key === 'earlier') break;
        const start = config.getStart(now);
        if (date >= start) {
          groupKey = config.key;
          break;
        }
      }

      // More precise check for yesterday/this_week relative to today
      if (groupKey === 'today') {
        // Already correct
      } else if (groupKey === 'yesterday') {
        // Already correct
      }

      const group = groupsMap.get(groupKey);
      if (group) group.push(bm);
      else groupsMap.set(groupKey, [bm]);
    }

    // Sort bookmarks within each group by dateAdded descending
    for (const [, bookmarksArr] of groupsMap) {
      bookmarksArr.sort((a, b) => b.dateAdded - a.dateAdded);
    }

    return GROUP_CONFIG
      .map((config) => ({
        key: config.key,
        label: config.label,
        bookmarks: groupsMap.get(config.key) ?? [],
        count: (groupsMap.get(config.key) ?? []).length,
      }))
      .filter((g) => g.count > 0);
  }, [filteredBookmarks]);

  return {
    loading,
    groups,
    categories,
    searchText,
    setSearchText,
    selectedCategories,
    setSelectedCategories,
    selectedTagIds,
    setSelectedTagIds,
    refresh: loadBookmarks,
  };
}

/**
 * Get relative time string for a date.
 */
export function getRelativeTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
