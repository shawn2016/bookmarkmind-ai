// ============================================================
// BookmarkTab — bookmark list container
// ============================================================

import React, { useEffect } from 'react';
import { useBookmarks } from '@content/hooks/useBookmarks';
import { SearchBar } from '@content/components/BookmarkTab/SearchBar';
import { CategoryTabs } from '@content/components/BookmarkTab/CategoryTabs';
import { BookmarkList } from '@content/components/BookmarkTab/BookmarkList';
import { BatchActionBar } from '@content/components/BookmarkTab/BatchActionBar';
import { BookmarkToolbar } from '@content/components/BookmarkTab/BookmarkToolbar';
import { useTagStore } from '@content/store/tagStore';
import { TagChip } from '@content/components/TagManager/TagChip';

export const BookmarkTab: React.FC = () => {
  const { loadBookmarks } = useBookmarks();
  const selectedTagIds = useTagStore((s) => s.selectedTagIds);
  const filterMode = useTagStore((s) => s.filterMode);
  const toggleTagSelection = useTagStore((s) => s.toggleTagSelection);
  const setFilterMode = useTagStore((s) => s.setFilterMode);
  const tags = useTagStore((s) => s.tags);
  const loadTags = useTagStore((s) => s.loadTags);

  // Load tags on mount
  useEffect(() => {
    loadBookmarks();
    loadTags();
  }, [loadBookmarks, loadTags]);

  const hasTagFilter = selectedTagIds.size > 0;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle}>
      <BookmarkToolbar />
      <BatchActionBar />
      <SearchBar />
      <CategoryTabs />
      {/* Tag filter bar */}
      {hasTagFilter && (
        <div style={tagFilterStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bm-space-1)', flexWrap: 'wrap', flex: 1 }}>
            <span style={{ fontSize: 'var(--bm-text-xs)', color: 'var(--bm-gray-500)' }}>筛选:</span>
            {Array.from(selectedTagIds).map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  selected
                  removable
                  size="sm"
                  onRemove={() => toggleTagSelection(tagId)}
                />
              );
            })}
          </div>
          <button
            style={{
              ...filterModeBtnStyle,
              background: filterMode === 'and' ? 'var(--bm-primary-50)' : 'transparent',
              color: filterMode === 'and' ? 'var(--bm-primary-600)' : 'var(--bm-gray-500)',
            }}
            onClick={() => setFilterMode(filterMode === 'and' ? 'or' : 'and')}
            title={filterMode === 'and' ? 'AND模式：同时包含所有标签' : 'OR模式：包含任一标签'}
          >
            {filterMode === 'and' ? 'AND' : 'OR'}
          </button>
        </div>
      )}
      <BookmarkList />
    </div>
  );
};

export default BookmarkTab;

// ---- Styles ----

const tagFilterStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--bm-space-2)',
  padding: 'var(--bm-space-2) var(--bm-space-3)',
  borderBottom: '1px solid var(--bm-gray-100)',
  flexWrap: 'wrap',
};

const filterModeBtnStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  fontSize: 'var(--bm-text-xs)',
  padding: '1px var(--bm-space-2)',
  cursor: 'pointer',
  flexShrink: 0,
};
