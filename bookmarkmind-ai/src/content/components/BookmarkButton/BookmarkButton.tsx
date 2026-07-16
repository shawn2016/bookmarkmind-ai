// ============================================================
// BookmarkButton — reusable bookmark toggle button
// ============================================================

import React, { useCallback, useState } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface BookmarkButtonProps {
  bookmarked: boolean;
  onClick: () => void;
  size?: 'sm' | 'md';
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  bookmarked,
  onClick,
  size = 'md',
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick();
    },
    [onClick],
  );

  const dims = size === 'sm' ? { btn: 28, icon: 14 } : { btn: 36, icon: 18 };

  const btnStyle: React.CSSProperties = {
    width: `${dims.btn}px`,
    height: `${dims.btn}px`,
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--bm-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: bookmarked ? 'var(--bm-success-500)' : 'var(--bm-primary-500)',
    transform: isActive ? 'scale(0.95)' : 'scale(1)',
    transition:
      'transform var(--bm-duration-fast) var(--bm-ease-spring), background var(--bm-duration-fast), color var(--bm-duration-fast)',
  };

  return (
    <button
      style={btnStyle}
      onClick={handleClick}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        setIsActive(false);
        e.currentTarget.style.background = 'transparent';
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.background = 'var(--bm-gray-100)';
      }}
      aria-label={bookmarked ? '已收藏' : '收藏'}
      title={bookmarked ? '已收藏' : '收藏此页'}
      data-testid="bookmark-btn"
      data-bookmarked={bookmarked}
    >
      {bookmarked ? (
        <BookmarkCheck size={dims.icon} fill="var(--bm-success-500)" />
      ) : (
        <Bookmark size={dims.icon} />
      )}
    </button>
  );
};

export default BookmarkButton;
