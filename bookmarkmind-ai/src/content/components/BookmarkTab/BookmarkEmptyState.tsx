// ============================================================
// BookmarkEmptyState — empty state for no bookmarks / no results
// ============================================================

import React from 'react';
import { Bookmark, Search } from 'lucide-react';

interface BookmarkEmptyStateProps {
  type: 'no-bookmarks' | 'no-results';
}

export const BookmarkEmptyState: React.FC<BookmarkEmptyStateProps> = ({
  type,
}) => {
  const isNoResults = type === 'no-results';

  const containerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--bm-space-6)',
    gap: 'var(--bm-space-3)',
    textAlign: 'center',
  };

  const iconWrapStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--bm-radius-full)',
    backgroundColor: 'var(--bm-gray-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-md)',
    fontWeight: 600,
    color: 'var(--bm-gray-600)',
  };

  const descStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-sm)',
    color: 'var(--bm-gray-400)',
    lineHeight: 'var(--bm-leading-normal)',
  };

  return (
    <div style={containerStyle}>
      <div style={iconWrapStyle}>
        {isNoResults ? (
          <Search size={24} color="var(--bm-gray-300)" />
        ) : (
          <Bookmark size={24} color="var(--bm-gray-300)" />
        )}
      </div>
      <div style={titleStyle}>
        {isNoResults ? '未找到匹配的书签' : '暂无书签'}
      </div>
      <div style={descStyle}>
        {isNoResults
          ? '尝试使用不同的关键词搜索'
          : '点击底部「收藏此页」按钮收藏当前页面'}
      </div>
    </div>
  );
};

export default BookmarkEmptyState;
