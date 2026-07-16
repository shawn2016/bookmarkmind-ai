// ============================================================
// TimelineGroup — 时间分组卡片（标题 + 数量 + 书签列表）
// ============================================================
import React, { useRef } from 'react';
import type { BookmarkItem } from '@shared/types';
import { getRelativeTime } from '@content/hooks/useTimeline';
import { useVirtualizer } from '@tanstack/react-virtual';

const CARD_HEIGHT = 56;

interface TimelineGroupProps {
  label: string;
  bookmarks: BookmarkItem[];
  count: number;
  resurfaceBookmarkIds?: Set<string>;
  bookmarkNotes?: Set<string>;
  bookmarkHighlights?: Set<string>;
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  label,
  bookmarks,
  count,
  resurfaceBookmarkIds,
  bookmarkNotes,
  bookmarkHighlights,
}) => {
  const groupRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: bookmarks.length,
    getScrollElement: () => groupRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 5,
  });

  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div style={groupContainerStyle}>
      {/* Group header */}
      <div style={groupHeaderStyle}>
        <span style={groupTitleStyle}>{label}</span>
        <span style={groupCountStyle}>{count}</span>
      </div>

      {/* Bookmark cards — virtualized */}
      <div
        ref={groupRef}
        style={{
          maxHeight: `${Math.min(bookmarks.length * CARD_HEIGHT, 400)}px`,
          overflowY: 'auto',
          padding: '0 var(--bm-space-3)',
          position: 'relative',
        }}
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const bm = bookmarks[virtualItem.index];
            const hasNote = bookmarkNotes?.has(bm.id);
            const hasHighlight = bookmarkHighlights?.has(bm.id);
            const isResurfaced = resurfaceBookmarkIds?.has(bm.id);

            let hostname = '';
            try {
              hostname = new URL(bm.url).hostname.replace(/^www\./, '');
            } catch { /* ignore invalid URL */ }

            return (
              <div
                key={bm.id}
                style={{
                  ...cardStyle,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                onClick={() => handleOpen(bm.url)}
                title={bm.url}
              >
              {/* Favicon */}
              <img
                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=16`}
                alt=""
                style={faviconStyle}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />

              {/* Content */}
              <div style={cardContentStyle}>
                <div style={cardTitleStyle}>
                  {isResurfaced && <span style={sparkleStyle}>✨</span>}
                  {hasNote && <span style={iconStyle}>📝</span>}
                  {hasHighlight && <span style={iconStyle}>🖊️</span>}
                  {bm.title || '无标题'}
                </div>
                <div style={cardMetaStyle}>
                  <span style={domainStyle}>{hostname}</span>
                  {bm.parentTitle && (
                    <span style={categoryTagStyle}>{bm.parentTitle}</span>
                  )}
                  <span style={timeStyle}>{getRelativeTime(bm.dateAdded)}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Styles ----

const groupContainerStyle: React.CSSProperties = {
  marginBottom: 'var(--bm-space-1)',
};

const groupHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  padding: 'var(--bm-space-2) var(--bm-space-3)',
  gap: 'var(--bm-space-2)',
};

const groupTitleStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-md)',
  fontWeight: 600,
  color: 'var(--bm-gray-700)',
};

const groupCountStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-gray-400)',
  background: 'var(--bm-gray-100)',
  borderRadius: '10px',
  padding: '1px var(--bm-space-2)',
};

const cardStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: 'var(--bm-space-2)',
  borderRadius: 'var(--bm-radius-sm)',
  cursor: 'pointer',
  transition: 'background var(--bm-duration-fast)',
  borderBottom: '1px solid var(--bm-gray-100)',
};

const faviconStyle: React.CSSProperties = {
  width: '16px',
  height: '16px',
  marginRight: 'var(--bm-space-2)',
  marginTop: '2px',
  flexShrink: 0,
};

const cardContentStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-sm)',
  fontWeight: 500,
  color: 'var(--bm-gray-700)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  lineHeight: 1.4,
};

const sparkleStyle: React.CSSProperties = {
  marginRight: '2px',
  fontSize: 'var(--bm-text-xs)',
};

const iconStyle: React.CSSProperties = {
  marginRight: '2px',
  fontSize: 'var(--bm-text-xs)',
};

const cardMetaStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--bm-space-2)',
  marginTop: '2px',
};

const domainStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-gray-400)',
};

const categoryTagStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-primary-500)',
  background: 'var(--bm-primary-50)',
  borderRadius: '4px',
  padding: '0 var(--bm-space-1)',
};

const timeStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-gray-400)',
  marginLeft: 'auto',
};
