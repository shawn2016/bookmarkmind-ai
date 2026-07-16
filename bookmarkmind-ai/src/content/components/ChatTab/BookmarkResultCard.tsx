// ============================================================
// BookmarkResultCard — search result card shown in AI responses
// ============================================================

import React, { useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import type { BookmarkSearchResult } from '@shared/types';
import { getFaviconUrl } from '@shared/utils/format';

interface BookmarkResultCardProps {
  result: BookmarkSearchResult;
}

export const BookmarkResultCard: React.FC<BookmarkResultCardProps> = ({
  result,
}) => {
  const faviconUrl = result.faviconUrl || getFaviconUrl(result.url);

  const handleOpen = useCallback(() => {
    window.open(result.url, '_blank');
  }, [result.url]);

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--bm-gray-0)',
    border: '1px solid var(--bm-gray-200)',
    borderRadius: 'var(--bm-radius-md)',
    padding: 'var(--bm-space-2) var(--bm-space-3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-2)',
    cursor: 'pointer',
    transition:
      'background var(--bm-duration-fast), transform var(--bm-duration-fast), box-shadow var(--bm-duration-fast)',
  };

  const faviconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '2px',
    objectFit: 'contain',
  };

  const textAreaStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 500,
    color: 'var(--bm-gray-700)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const urlStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-xs)',
    color: 'var(--bm-gray-400)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const badgeStyle: React.CSSProperties = {
    backgroundColor: 'var(--bm-primary-50)',
    color: 'var(--bm-primary-600)',
    fontSize: 'var(--bm-text-xs)',
    padding: '1px 6px',
    borderRadius: 'var(--bm-radius-sm)',
    whiteSpace: 'nowrap',
    lineHeight: '1.6',
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--bm-radius-sm)',
    cursor: 'pointer',
    color: 'var(--bm-gray-400)',
    flexShrink: 0,
    transition: 'color var(--bm-duration-fast), background var(--bm-duration-fast)',
  };

  return (
    <div
      style={cardStyle}
      onClick={handleOpen}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'var(--bm-gray-50)';
        el.style.transform = 'translateY(-1px)';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.background = 'var(--bm-gray-0)';
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = 'none';
      }}
    >
      <img
        src={faviconUrl}
        alt=""
        style={faviconStyle}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      <div style={textAreaStyle}>
        <span style={titleStyle}>{result.title}</span>
        <span style={urlStyle}>{result.url}</span>
      </div>
      {result.category && <span style={badgeStyle}>{result.category}</span>}
      <button
        style={btnStyle}
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            'var(--bm-primary-500)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            'var(--bm-gray-400)';
        }}
        title="打开"
        aria-label="打开链接"
      >
        <ExternalLink size={14} />
      </button>
    </div>
  );
};

export default BookmarkResultCard;
