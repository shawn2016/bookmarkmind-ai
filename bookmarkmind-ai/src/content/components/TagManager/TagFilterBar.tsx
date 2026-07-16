// ============================================================
// TagFilterBar — 标签筛选 chips + 管理入口
// ============================================================

import React from 'react';
import { Settings2 } from 'lucide-react';
import { useTagStore } from '@content/store/tagStore';
import { TagChip } from '@content/components/TagManager/TagChip';

interface TagFilterBarProps {
  onManageTags: () => void;
}

export const TagFilterBar: React.FC<TagFilterBarProps> = ({ onManageTags }) => {
  const tags = useTagStore((s) => s.tags);
  const selectedTagIds = useTagStore((s) => s.selectedTagIds);
  const toggleTagSelection = useTagStore((s) => s.toggleTagSelection);

  if (tags.length === 0) {
    return (
      <div style={barStyle}>
        <span style={hintStyle}>暂无标签，</span>
        <button style={linkBtnStyle} onClick={onManageTags}>
          创建标签
        </button>
      </div>
    );
  }

  return (
    <div style={barStyle}>
      <div style={chipsStyle}>
        {tags.map((tag) => (
          <TagChip
            key={tag.id}
            tag={tag}
            selected={selectedTagIds.has(tag.id)}
            size="sm"
            onToggle={() => toggleTagSelection(tag.id)}
          />
        ))}
      </div>
      <button style={manageBtnStyle} onClick={onManageTags} title="管理标签">
        <Settings2 size={12} />
        管理标签
      </button>
    </div>
  );
};

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--bm-space-2)',
  padding: 'var(--bm-space-2) var(--bm-space-3)',
  borderBottom: '1px solid var(--bm-gray-100)',
  flexWrap: 'wrap',
};

const chipsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--bm-space-1)',
  flexWrap: 'wrap',
  flex: 1,
  minWidth: 0,
};

const manageBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-full)',
  background: 'var(--bm-gray-0)',
  fontSize: 'var(--bm-text-xs)',
  fontWeight: 500,
  color: 'var(--bm-gray-600)',
  cursor: 'pointer',
  padding: '4px 10px',
  flexShrink: 0,
};

const hintStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-gray-400)',
};

const linkBtnStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-primary-500)',
  cursor: 'pointer',
  padding: 0,
  fontWeight: 500,
};

export default TagFilterBar;
