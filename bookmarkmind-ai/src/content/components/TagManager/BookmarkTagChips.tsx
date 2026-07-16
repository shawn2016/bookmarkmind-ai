// ============================================================
// BookmarkTagChips — 书签关联标签展示（列表/时间轴复用）
// ============================================================

import React from 'react';
import { useTagStore } from '@content/store/tagStore';
import { TagChip } from './TagChip';

interface BookmarkTagChipsProps {
  bookmarkId: string;
  max?: number;
  size?: 'sm' | 'md';
}

export const BookmarkTagChips: React.FC<BookmarkTagChipsProps> = ({
  bookmarkId,
  max = 3,
  size = 'sm',
}) => {
  const tags = useTagStore((s) => s.tags);
  const tagMap = useTagStore((s) => s.bookmarkTagMap);
  const tagIds = tagMap[bookmarkId] ?? [];

  if (tagIds.length === 0) return null;

  const visibleTags = tagIds
    .slice(0, max)
    .map((id) => tags.find((t) => t.id === id))
    .filter(Boolean);

  const overflow = tagIds.length - visibleTags.length;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flexWrap: 'nowrap',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      {visibleTags.map((tag) => (
        <TagChip key={tag!.id} tag={tag!} size={size} />
      ))}
      {overflow > 0 && (
        <span
          style={{
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-gray-400)',
            flexShrink: 0,
          }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
};

export default BookmarkTagChips;
