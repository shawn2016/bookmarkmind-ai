// ============================================================
// BookmarkList — virtualized scrollable bookmark list
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useContentStore } from '@content/store/contentStore';
import { BookmarkItem } from '@content/components/BookmarkTab/BookmarkItem';
import { BookmarkEmptyState } from '@content/components/BookmarkTab/BookmarkEmptyState';
import { safeSendMessage } from '@shared/utils/chrome-api';

const ITEM_HEIGHT = 56;

export const BookmarkList: React.FC = () => {
  const filteredBookmarks = useContentStore((s) => s.filteredBookmarks);
  const bookmarks = useContentStore((s) => s.bookmarks);
  const parentRef = useRef<HTMLDivElement>(null);

  // Track which bookmarks have notes or highlights
  const [noteBookmarkIds, setNoteBookmarkIds] = useState<Set<string>>(new Set());
  const [highlightBookmarkIds, setHighlightBookmarkIds] = useState<Set<string>>(new Set());

  // Load icon state data on mount and when bookmarks change
  useEffect(() => {
    loadIconStates();
  }, [bookmarks.length]);

  const loadIconStates = async () => {
    try {
      const [noteResp, highlightResp] = await Promise.all([
        safeSendMessage({ type: 'NOTE_LIST_IDS' }),
        safeSendMessage({ type: 'HIGHLIGHT_LIST_IDS' }),
      ]);
      const noteIds = (noteResp as Record<string, unknown>)?.noteIds as string[] ?? [];
      const highlightIds = (highlightResp as Record<string, unknown>)?.highlightIds as string[] ?? [];
      setNoteBookmarkIds(new Set(noteIds));
      setHighlightBookmarkIds(new Set(highlightIds));
    } catch {
      // silent
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: filteredBookmarks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
    getItemKey: (index) => filteredBookmarks[index]?.id ?? index,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [filteredBookmarks, rowVirtualizer]);

  // Determine empty state type
  const hasAnyBookmarks = bookmarks.length > 0;

  if (filteredBookmarks.length === 0) {
    return (
      <BookmarkEmptyState
        type={hasAnyBookmarks ? 'no-results' : 'no-bookmarks'}
      />
    );
  }

  const containerStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    position: 'relative',
  };

  const innerStyle: React.CSSProperties = {
    height: `${rowVirtualizer.getTotalSize()}px`,
    width: '100%',
    position: 'relative',
  };

  return (
    <div ref={parentRef} style={containerStyle} className="bm-scrollbar">
      <div style={innerStyle}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const bookmark = filteredBookmarks[virtualItem.index];
          return (
            <div
              key={bookmark.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <BookmarkItem
                bookmark={bookmark}
                hasNote={noteBookmarkIds.has(bookmark.id)}
                hasHighlight={highlightBookmarkIds.has(bookmark.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookmarkList;
