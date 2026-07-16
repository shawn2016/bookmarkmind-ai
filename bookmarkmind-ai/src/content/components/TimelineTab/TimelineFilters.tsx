// ============================================================
// TimelineFilters — 时间轴顶部过滤器
// ============================================================
import React from 'react';

interface TimelineFiltersProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  categories: string[];
  selectedCategories: Set<string>;
  onCategoryToggle: (cat: string) => void;
}

export const TimelineFilters: React.FC<TimelineFiltersProps> = ({
  searchText,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryToggle,
}) => {
  return (
    <div style={containerStyle}>
      {/* Search */}
      <div style={searchContainerStyle}>
        <input
          type="text"
          placeholder="搜索书签标题或URL..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={searchInputStyle}
        />
        {searchText && (
          <button
            onClick={() => onSearchChange('')}
            style={clearBtnStyle}
            aria-label="清除搜索"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter chips */}
      {categories.length > 0 && (
        <div style={chipsStyle}>
          {categories.map((cat) => {
            const isActive = selectedCategories.has(cat);
            return (
              <button
                key={cat}
                style={isActive ? chipActiveStyle : chipStyle}
                onClick={() => onCategoryToggle(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---- Styles ----

const containerStyle: React.CSSProperties = {
  padding: 'var(--bm-space-2) var(--bm-space-3)',
  borderBottom: '1px solid var(--bm-gray-200)',
};

const searchContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  padding: 'var(--bm-space-1) var(--bm-space-3)',
  fontSize: 'var(--bm-text-sm)',
  background: 'var(--bm-gray-50)',
  color: 'var(--bm-gray-700)',
  outline: 'none',
};

const clearBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: 'var(--bm-space-2)',
  border: 'none',
  background: 'none',
  color: 'var(--bm-gray-400)',
  fontSize: 'var(--bm-text-xs)',
  cursor: 'pointer',
  padding: '2px 4px',
};

const chipsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--bm-space-1)',
  marginTop: 'var(--bm-space-2)',
  flexWrap: 'wrap',
  maxHeight: '80px',
  overflowY: 'auto',
};

const chipStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: '12px',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-500)',
  fontSize: 'var(--bm-text-xs)',
  padding: '2px var(--bm-space-2)',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const chipActiveStyle: React.CSSProperties = {
  ...chipStyle,
  background: 'var(--bm-primary-50)',
  borderColor: 'var(--bm-primary-400)',
  color: 'var(--bm-primary-600)',
};
