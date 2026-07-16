// ============================================================
// BookmarkDetail — 书签详情侧栏（备注+高亮+标签编辑）
// ============================================================
import React, { useEffect, useState } from 'react';
import type { BookmarkItem, BookmarkNote } from '@shared/types';
import { safeSendMessage } from '@shared/utils/chrome-api';
import { NoteEditor } from './NoteEditor';
import { HighlightList } from './HighlightList';
import { TagSelector } from '../TagManager/TagSelector';
import { useTagStore } from '@content/store/tagStore';

interface BookmarkDetailProps {
  bookmark: BookmarkItem;
  onClose: () => void;
}

export const BookmarkDetail: React.FC<BookmarkDetailProps> = ({
  bookmark,
  onClose,
}) => {
  const [note, setNote] = useState<BookmarkNote | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const setBookmarkTags = useTagStore((s) => s.setBookmarkTags);
  const loadTags = useTagStore((s) => s.loadTags);
  const loadBookmarkTagMap = useTagStore((s) => s.loadBookmarkTagMap);

  useEffect(() => {
    void loadTags();
    loadDetails();
  }, [bookmark.id, loadTags]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [noteResp, tagsResp] = await Promise.all([
        safeSendMessage({
          type: 'NOTE_GET',
          payload: { bookmarkId: bookmark.id },
        }),
        safeSendMessage({
          type: 'TAG_GET_BOOKMARK_TAGS',
          payload: { bookmarkId: bookmark.id },
        }),
      ]);

      setNote((noteResp as Record<string, unknown>)?.note as BookmarkNote ?? null);
      const tags = (tagsResp as Record<string, unknown>)?.tags as Array<{ id: string }> ?? [];
      setSelectedTagIds(tags.map((t) => t.id));
    } catch {
      // silent
    }
    setLoading(false);
  };

  const handleTagsChange = async (ids: string[]) => {
    setSelectedTagIds(ids);
    await setBookmarkTags(bookmark.id, ids);
    await loadBookmarkTagMap();
  };

  const handleOpen = () => {
    window.open(bookmark.url, '_blank');
  };

  let hostname = '';
  try {
    hostname = new URL(bookmark.url).hostname.replace(/^www\./, '');
  } catch { /* ignore */ }

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bm-space-2)', flex: 1 }}>
            <img
              src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=16`}
              alt=""
              style={{ width: '16px', height: '16px' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={titleStyle}>{bookmark.title}</div>
              <div style={urlStyle} onClick={handleOpen}>{bookmark.url}</div>
            </div>
          </div>
          <button style={closeBtnStyle} onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <div style={loadingStyle}>加载中...</div>
        ) : (
          <div style={contentStyle}>
            {/* Tags */}
            <div style={sectionStyle}>
              <span style={sectionLabelStyle}>标签</span>
              <TagSelector
                selectedIds={selectedTagIds}
                onChange={handleTagsChange}
                placeholder="添加标签..."
              />
            </div>

            {/* Note */}
            <div style={sectionStyle}>
              <NoteEditor
                bookmarkId={bookmark.id}
                initialContent={note?.content ?? ''}
                onSaved={() => loadDetails()}
              />
            </div>

            {/* Highlights */}
            <div style={sectionStyle}>
              <HighlightList bookmarkId={bookmark.id} />
            </div>

            {/* Actions */}
            <div style={actionsStyle}>
              <button style={actionBtnStyle} onClick={handleOpen}>
                打开书签
              </button>
              <button style={actionBtnStyle} onClick={onClose}>
                关闭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---- Styles ----

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.3)',
  zIndex: 10000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const panelStyle: React.CSSProperties = {
  width: '400px',
  maxHeight: '80vh',
  background: 'var(--bm-gray-0)',
  borderRadius: 'var(--bm-radius-lg)',
  boxShadow: 'var(--bm-shadow-panel)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: 'var(--bm-space-4)',
  borderBottom: '1px solid var(--bm-gray-200)',
};

const titleStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-md)',
  fontWeight: 600,
  color: 'var(--bm-gray-800)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const urlStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-primary-500)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  marginTop: '2px',
};

const closeBtnStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  fontSize: '18px',
  color: 'var(--bm-gray-400)',
  cursor: 'pointer',
  padding: '2px',
  lineHeight: 1,
};

const loadingStyle: React.CSSProperties = {
  padding: 'var(--bm-space-8)',
  textAlign: 'center',
  color: 'var(--bm-gray-400)',
};

const contentStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 'var(--bm-space-4)',
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--bm-space-5)',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-sm)',
  fontWeight: 600,
  color: 'var(--bm-gray-700)',
  display: 'block',
  marginBottom: 'var(--bm-space-2)',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--bm-space-2)',
  paddingTop: 'var(--bm-space-3)',
  borderTop: '1px solid var(--bm-gray-100)',
};

const actionBtnStyle: React.CSSProperties = {
  flex: 1,
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-600)',
  fontSize: 'var(--bm-text-sm)',
  padding: 'var(--bm-space-2)',
  cursor: 'pointer',
};
