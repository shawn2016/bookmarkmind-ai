// ============================================================
// TagSelector — 标签选择器（搜索/多选/新建）
// ============================================================
import React, { useState, useMemo } from 'react';
import { TagChip } from './TagChip';
import { useTagStore } from '@content/store/tagStore';

interface TagSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedIds,
  onChange,
  placeholder = '搜索或创建标签...',
}) => {
  const tags = useTagStore((s) => s.tags);
  const createTag = useTagStore((s) => s.createTag);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter tags based on search text
  const filteredTags = useMemo(() => {
    if (!searchText.trim()) return tags;
    const lower = searchText.toLowerCase();
    return tags.filter(
      (t) => t.name.toLowerCase().includes(lower) || t.path.toLowerCase().includes(lower),
    );
  }, [tags, searchText]);

  // Check if we can create a new tag (no exact match found)
  const canCreate = useMemo(() => {
    if (!searchText.trim()) return false;
    return !tags.some(
      (t) => t.name.toLowerCase() === searchText.trim().toLowerCase(),
    );
  }, [tags, searchText]);

  const handleToggle = (tagId: string) => {
    const next = selectedIds.includes(tagId)
      ? selectedIds.filter((id) => id !== tagId)
      : [...selectedIds, tagId];
    onChange(next);
  };

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      const name = searchText.trim();
      const newId = await createTag(name, name);
      onChange([...selectedIds, newId]);
      setSearchText('');
    } catch {
      // silent
    }
  };

  // Get selected tag objects
  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));

  return (
    <div style={containerStyle}>
      {/* Selected tags */}
      {selectedTags.length > 0 && (
        <div style={selectedRowStyle}>
          {selectedTags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              selected
              removable
              size="sm"
              onRemove={() => handleToggle(tag.id)}
            />
          ))}
        </div>
      )}

      {/* Search input with dropdown */}
      <div style={inputWrapperStyle}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          style={inputStyle}
        />
        {showDropdown && (filteredTags.length > 0 || canCreate) && (
          <div style={dropdownStyle}>
            {filteredTags.map((tag) => {
              const isSelected = selectedIds.includes(tag.id);
              return (
                <div
                  key={tag.id}
                  style={{
                    ...dropdownItemStyle,
                    background: isSelected ? 'var(--bm-primary-50)' : 'transparent',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleToggle(tag.id);
                  }}
                >
                  <TagChip tag={tag} size="sm" selected={isSelected} />
                </div>
              );
            })}
            {canCreate && (
              <div
                style={createItemStyle}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleCreate();
                }}
              >
                + 创建标签 "{searchText.trim()}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Styles ----

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--bm-space-2)',
};

const selectedRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--bm-space-1)',
};

const inputWrapperStyle: React.CSSProperties = {
  position: 'relative',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  padding: 'var(--bm-space-1) var(--bm-space-2)',
  fontSize: 'var(--bm-text-sm)',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-700)',
  outline: 'none',
  boxSizing: 'border-box',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  maxHeight: '200px',
  overflowY: 'auto',
  background: 'var(--bm-gray-0)',
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  boxShadow: 'var(--bm-shadow-md)',
  zIndex: 100,
  marginTop: '2px',
};

const dropdownItemStyle: React.CSSProperties = {
  padding: 'var(--bm-space-1) var(--bm-space-2)',
  cursor: 'pointer',
  transition: 'background var(--bm-duration-fast)',
};

const createItemStyle: React.CSSProperties = {
  padding: 'var(--bm-space-1) var(--bm-space-2)',
  cursor: 'pointer',
  color: 'var(--bm-primary-500)',
  fontSize: 'var(--bm-text-sm)',
  borderTop: '1px solid var(--bm-gray-100)',
};
