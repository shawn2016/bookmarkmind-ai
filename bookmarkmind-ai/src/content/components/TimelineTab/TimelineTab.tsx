// ============================================================
// TimelineTab — 时间轴主视图容器
// ============================================================
import React, { useEffect, useState } from 'react';
import { TimelineGroup } from './TimelineGroup';
import { TimelineFilters } from './TimelineFilters';
import { useTimeline } from '@content/hooks/useTimeline';
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

  const [resurfaceIds, setResurfaceIds] = useState<Set<string>>(new Set());
  const [noteIds, setNoteIds] = useState<Set<string>>(new Set());
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());

  // Load badge data on mount
  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [resurfaceResp, noteResp, highlightResp] = await Promise.all([
        safeSendMessage({ type: 'RESURFACE_GET_RECORDS' }),
        safeSendMessage({ type: 'NOTE_LIST_IDS' }),
        safeSendMessage({ type: 'HIGHLIGHT_LIST_IDS' }),
      ]);

      // Resurface pushed bookmark IDs
      const records = (resurfaceResp as Record<string, unknown>)?.records as Array<{ bookmarkId: string }> ?? [];
      setResurfaceIds(new Set(records.map((r) => r.bookmarkId)));

      // Note bookmark IDs
      const nIds = (noteResp as Record<string, unknown>)?.noteIds as string[] ?? [];
      setNoteIds(new Set(nIds));

      // Highlight bookmark IDs
      const hIds = (highlightResp as Record<string, unknown>)?.highlightIds as string[] ?? [];
      setHighlightIds(new Set(hIds));
    } catch { /* silent */ }
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div style={centerStyle}>
        <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-md)' }}>
          加载中...
        </span>
      </div>
    );
  }

  // Empty state
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
    <div style={containerStyle}>
      <TimelineFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />

      {/* Timeline groups */}
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
          />
        ))}
      </div>
    </div>
  );
};

// ---- Styles ----

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
