// ============================================================
// CategoryTabs — horizontally scrollable category pills
// ============================================================

import React, { useCallback, useMemo, useRef } from 'react';
import { useContentStore } from '@content/store/contentStore';
import { useBookmarks } from '@content/hooks/useBookmarks';
import type { BookmarkItem } from '@shared/types';

interface Category {
  id: string;
  title: string;
}

/**
 * Extract unique parent categories from bookmarks
 */
function extractCategories(bookmarks: BookmarkItem[]): Category[] {
  const map = new Map<string, Category>();
  for (const b of bookmarks) {
    if (!map.has(b.parentId)) {
      map.set(b.parentId, { id: b.parentId, title: b.parentTitle || '未分类' });
    }
  }
  return Array.from(map.values());
}

export const CategoryTabs: React.FC = () => {
  const bookmarks = useContentStore((s) => s.bookmarks);
  const activeCategory = useContentStore((s) => s.activeCategory);
  const { filterByCategory } = useBookmarks();
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = useMemo(() => extractCategories(bookmarks), [bookmarks]);

  const handleClick = useCallback(
    (cat: Category | null) => {
      filterByCategory(cat?.id ?? null);
    },
    [filterByCategory],
  );

  const containerStyle: React.CSSProperties = {
    padding: 'var(--bm-space-2) var(--bm-space-3)',
    display: 'flex',
    gap: 'var(--bm-space-2)',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
  };

  const getPillStyle = useCallback(
    (isActive: boolean): React.CSSProperties => ({
      height: '28px',
      padding: '0 12px',
      border: `1px solid ${isActive ? 'var(--bm-primary-200)' : 'var(--bm-gray-200)'}`,
      borderRadius: 'var(--bm-radius-full)',
      backgroundColor: isActive ? 'var(--bm-primary-50)' : 'transparent',
      color: isActive ? 'var(--bm-primary-600)' : 'var(--bm-gray-600)',
      fontSize: 'var(--bm-text-sm)',
      fontWeight: 500,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition:
        'background var(--bm-duration-fast), border-color var(--bm-duration-fast), color var(--bm-duration-fast)',
      flexShrink: 0,
    }),
    [],
  );

  return (
    <div
      ref={scrollRef}
      style={containerStyle}
      className="bm-scrollbar"
    >
      {/* "全部" pill */}
      <button
        style={getPillStyle(activeCategory === null)}
        onClick={() => handleClick(null)}
        onMouseEnter={(e) => {
          if (activeCategory !== null) {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--bm-gray-100)';
          }
        }}
        onMouseLeave={(e) => {
          if (activeCategory !== null) {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }
        }}
      >
        全部
      </button>

      {/* Category pills */}
      {categories.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            style={getPillStyle(isActive)}
            onClick={() => handleClick(cat)}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'var(--bm-gray-100)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
              }
            }}
          >
            {cat.title}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
