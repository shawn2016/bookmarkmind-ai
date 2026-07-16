// ============================================================
// SearchBar — bookmark search input with 300ms debounce
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';
import { useBookmarks } from '@content/hooks/useBookmarks';
import { debounce } from '@shared/utils/debounce';

export const SearchBar: React.FC = () => {
  const searchQuery = useContentStore((s) => s.searchQuery);
  const { searchBookmarks } = useBookmarks();
  const [localValue, setLocalValue] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);

  const debouncedSearch = useRef(
    debounce((q: string) => {
      useContentStore.getState().setSearchQuery(q);
      searchBookmarks(q);
    }, 300),
  ).current;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setLocalValue(v);
      debouncedSearch(v);
    },
    [debouncedSearch],
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    useContentStore.getState().setSearchQuery('');
    searchBookmarks('');
  }, [searchBookmarks]);

  const containerStyle: React.CSSProperties = {
    padding: 'var(--bm-space-3) var(--bm-space-3) 0',
  };

  const inputWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    backgroundColor: isFocused ? 'var(--bm-gray-0)' : 'var(--bm-gray-50)',
    border: `1px solid ${isFocused ? 'var(--bm-primary-500)' : 'var(--bm-gray-200)'}`,
    borderRadius: 'var(--bm-radius-md)',
    padding: '0 var(--bm-space-3)',
    gap: 'var(--bm-space-2)',
    transition: 'border-color var(--bm-duration-fast), background var(--bm-duration-fast)',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: 'var(--bm-text-base)',
    fontFamily: 'var(--bm-font-sans)',
    color: 'var(--bm-gray-700)',
    outline: 'none',
    padding: 0,
  };

  const clearBtnStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    border: 'none',
    background: 'transparent',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--bm-gray-400)',
    padding: 0,
    visibility: localValue ? 'visible' : 'hidden',
    transition: 'background var(--bm-duration-fast)',
  };

  return (
    <div style={containerStyle}>
      <div style={inputWrapStyle}>
        <Search size={16} color="var(--bm-gray-400)" />
        <input
          style={inputStyle}
          type="text"
          placeholder="搜索书签..."
          value={localValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-label="搜索书签"
        />
        <button
          style={clearBtnStyle}
          onClick={handleClear}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--bm-gray-200)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }}
          aria-label="清除搜索"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
