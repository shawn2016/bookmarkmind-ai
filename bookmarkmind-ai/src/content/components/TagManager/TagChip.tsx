// ============================================================
// TagChip — 彩色标签 Chip 组件
// ============================================================
import React from 'react';
import type { Tag } from '@shared/types';

interface TagChipProps {
  tag: Tag;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  size?: 'sm' | 'md';
}

export const TagChip: React.FC<TagChipProps> = ({
  tag,
  selected = false,
  onToggle,
  onRemove,
  removable = false,
  size = 'md',
}) => {
  const isSmall = size === 'sm';
  const color = tag.color ?? '#6B7280';

  const chipStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    border: `1px solid ${selected ? color : 'var(--bm-gray-200)'}`,
    borderRadius: isSmall ? '10px' : '12px',
    background: selected ? `${color}15` : 'var(--bm-gray-0)',
    color: selected ? color : 'var(--bm-gray-600)',
    fontSize: isSmall ? 'var(--bm-text-xs)' : 'var(--bm-text-sm)',
    padding: isSmall ? '1px var(--bm-space-2)' : 'var(--bm-space-1) var(--bm-space-2)',
    cursor: onToggle ? 'pointer' : 'default',
    transition: 'all var(--bm-duration-fast)',
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
    userSelect: 'none',
  };

  const dotStyle: React.CSSProperties = {
    width: isSmall ? '6px' : '8px',
    height: isSmall ? '6px' : '8px',
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
  };

  return (
    <span
      style={chipStyle}
      onClick={onToggle}
      title={tag.path}
    >
      <span style={dotStyle} />
      {tag.name}
      {removable && onRemove && (
        <span
          style={removeBtnStyle}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          ×
        </span>
      )}
    </span>
  );
};

const removeBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  color: 'var(--bm-gray-400)',
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  lineHeight: 1,
};
