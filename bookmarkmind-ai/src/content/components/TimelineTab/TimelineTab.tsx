// ============================================================
// TimelineTab — 时间轴主视图容器
// ============================================================
import React, { useCallback, useEffect, useState } from 'react';
import type { BookmarkItem } from '@shared/types';
import { TimelineGroup } from './TimelineGroup';
import { TimelineFilters } from './TimelineFilters';
import { BookmarkDetail } from '@content/components/BookmarkTab/BookmarkDetail';
import { useTimeline } from '@content/hooks/useTimeline';
import { useTagStore } from '@content/store/tagStore';
import { safeSendMessage } from '@shared/utils/chrome-api';

export const TimelineTab: React.FC = () => {
  const {
    loading,
    groups,
    categories,
    searchText,
    setSearchText,
    selectedCategories,
    setSelectedCategories,
  } = useTimeline();

  const bookmarkTagMap = useTagStore((s) => s.bookmarkTagMap);
  const loadTags = useTagStore((s) => s.loadTags);
  const loadBookmarkTagMap = useTagStore((s) => s.loadBookmarkTagMap);

  const [resurfaceIds, setResurfaceIds] = useState<Set<string>>(new Set());
  const [noteIds, setNoteIds] = useState<Set<string>>(new Set());
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const [detailBookmark, setDetailBookmark] = useState<BookmarkItem | null>(
    null,
  );

  useEffect(() => {
    loadMetadata();
    void loadTags();
    void loadBookmarkTagMap();
  }, [loadTags, loadBookmarkTagMap]);

  const loadMetadata = async () => {
    try {
      const [resurfaceResp, noteResp, highlightResp] = await Promise.all([
        safeSendMessage({ type: 'RESURFACE_GET_RECORDS' }),
        safeSendMessage({ type: 'NOTE_LIST_IDS' }),
        safeSendMessage({ type: 'HIGHLIGHT_LIST_IDS' }),
      ]);

      const records =
        ((resurfaceResp as Record<string, unknown>)?.records as Array<{
          bookmarkId: string;
        }>) ?? [];
      setResurfaceIds(new Set(records.map((r) => r.bookmarkId)));

      const nIds =
        ((noteResp as Record<string, unknown>)?.noteIds as string[]) ?? [];
      setNoteIds(new Set(nIds));

      const hIds =
        ((highlightResp as Record<string, unknown>)?.highlightIds as string[]) ??
        [];
      setHighlightIds(new Set(hIds));
    } catch {
      /* silent */
    }
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleCloseDetail = useCallback(() => {
    setDetailBookmark(null);
    void loadBookmarkTagMap();
  }, [loadBookmarkTagMap]);

  if (loading) {
    return (
      <div style={centerStyle}>
        <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-md)' }}>
          加载中...
        </span>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div style={containerStyle}>
        <TimelineFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />
        <div style={centerStyle}>
          <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-md)' }}>
            {searchText || selectedCategories.size > 0 ? '无匹配结果' : '暂无书签'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={containerStyle}>
        <TimelineFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />

        <div style={scrollStyle}>
          {groups.map((group) => (
            <TimelineGroup
              key={group.key}
              label={group.label}
              bookmarks={group.bookmarks}
              count={group.count}
              resurfaceBookmarkIds={resurfaceIds}
              bookmarkNotes={noteIds}
              bookmarkHighlights={highlightIds}
              bookmarkTagMap={bookmarkTagMap}
              onOpenDetail={setDetailBookmark}
            />
          ))}
        </div>
      </div>

      {detailBookmark && (
        <BookmarkDetail
          bookmark={detailBookmark}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
};

const scrollStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
};

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 'var(--bm-space-4)',
};

export default TimelineTab;
