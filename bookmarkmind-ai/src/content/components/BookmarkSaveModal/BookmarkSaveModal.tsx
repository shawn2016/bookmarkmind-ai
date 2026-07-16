// ============================================================
// BookmarkSaveModal — confirm bookmark with AI category suggestion
// ============================================================

import React, { useCallback, useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';
import { safeSendMessage } from '@shared/utils/chrome-api';
import { getBookmarkCreateToastMessage } from '@shared/utils/bookmark-toast';
import { useBookmarks } from '@content/hooks/useBookmarks';
import { TagSelector } from '@content/components/TagManager/TagSelector';
import { useTagStore } from '@content/store/tagStore';

const MAX_NOTE_LENGTH = 500;

export const BookmarkSaveModal: React.FC = () => {
  const modal = useContentStore((s) => s.bookmarkSaveModal);
  const aiConfigured = useContentStore((s) => s.aiConfigured);
  const { hideBookmarkSaveModal, setBookmarkSaveModal } =
    useContentStore.getState();
  const { loadBookmarks } = useBookmarks();
  const loadTags = useTagStore((s) => s.loadTags);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!modal.open) return;

    setSelectedFolder('');
    setNoteText(modal.note ?? '');
    setSelectedTagIds(modal.selectedTagIds ?? []);
    setBookmarkSaveModal({ loading: true });

    // Preload tags
    loadTags();

    (async () => {
      const foldersRes = await safeSendMessage<{
        folders?: { id: string; title: string }[];
      }>({ type: 'BOOKMARK_FOLDERS' });

      const folders = foldersRes?.folders ?? [];
      setBookmarkSaveModal({ folders, loading: false });

      if (aiConfigured) {
        const suggestRes = await safeSendMessage<{
          category?: string;
          tags?: { name: string; path: string }[];
        }>({
          type: 'AI_SUGGEST_CATEGORY',
          payload: { title: modal.title, url: modal.url },
        });
        if (suggestRes?.category) {
          setBookmarkSaveModal({
            suggestedCategory: suggestRes.category,
            suggestedTags: suggestRes.tags ?? [],
          });
          const match = folders.find(
            (f) => f.title === suggestRes.category,
          );
          setSelectedFolder(match?.id ?? '');
        }
      }
    })();
  }, [modal.open, modal.title, modal.url, aiConfigured, setBookmarkSaveModal, loadTags]);

  useEffect(() => {
    if (modal.suggestedCategory && !selectedFolder) {
      const match = modal.folders.find(
        (f) => f.title === modal.suggestedCategory,
      );
      if (match) setSelectedFolder(match.id);
    }
  }, [modal.suggestedCategory, modal.folders, selectedFolder]);

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    const response = await safeSendMessage<{
      success?: boolean;
      classified?: boolean;
      category?: string;
      bookmarkId?: string;
      error?: string;
    }>({
      type: 'BOOKMARK_CREATE',
      payload: {
        url: modal.url,
        title: modal.title,
        folderId: selectedFolder || undefined,
        skipAutoClassify: !!selectedFolder,
      },
    });

    if (response?.success) {
      const bookmarkId = response.bookmarkId;

      // Save note if provided
      if (noteText.trim() && bookmarkId) {
        await safeSendMessage({
          type: 'NOTE_SET',
          payload: { bookmarkId, content: noteText.trim() },
        }).catch(() => {});
      }

      // Save tags if selected
      if (selectedTagIds.length > 0 && bookmarkId) {
        await safeSendMessage({
          type: 'TAG_SET_BOOKMARK_TAGS',
          payload: { bookmarkId, tagIds: selectedTagIds },
        }).catch(() => {});
      }

      const toast = getBookmarkCreateToastMessage(response, {
        quickLabel: '已收藏当前页面',
      });
      useContentStore.getState().pushToast(toast);
      await loadBookmarks();
      hideBookmarkSaveModal();
    } else {
      useContentStore.getState().pushToast(
        getBookmarkCreateToastMessage({
          success: false,
          error: response?.error,
        }),
      );
    }
    setSaving(false);
  }, [
    modal,
    selectedFolder,
    noteText,
    selectedTagIds,
    loadBookmarks,
    hideBookmarkSaveModal,
  ]);

  if (!modal.open) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    zIndex: 'var(--bm-z-modal)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  };

  const boxStyle: React.CSSProperties = {
    width: '320px',
    backgroundColor: 'var(--bm-gray-0)',
    borderRadius: 'var(--bm-radius-lg)',
    boxShadow: 'var(--bm-shadow-panel)',
    border: '1px solid var(--bm-gray-200)',
    overflow: 'hidden',
  };

  return (
    <div style={overlayStyle} onClick={() => hideBookmarkSaveModal()}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--bm-gray-100)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 'var(--bm-text-md)' }}>
            收藏此页
          </span>
          <button
            onClick={() => hideBookmarkSaveModal()}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--bm-gray-400)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          <div
            style={{
              fontSize: 'var(--bm-text-sm)',
              fontWeight: 500,
              color: 'var(--bm-gray-800)',
              marginBottom: '4px',
            }}
            className="bm-truncate"
          >
            {modal.title}
          </div>
          <div
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-gray-400)',
              marginBottom: '14px',
            }}
            className="bm-truncate"
          >
            {modal.url}
          </div>

          {modal.loading ? (
            <div
              style={{
                fontSize: 'var(--bm-text-sm)',
                color: 'var(--bm-gray-400)',
                padding: '8px 0',
              }}
            >
              AI 正在推荐分类…
            </div>
          ) : modal.suggestedCategory ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                background: 'var(--bm-primary-50)',
                borderRadius: 'var(--bm-radius-md)',
                marginBottom: '12px',
                fontSize: 'var(--bm-text-sm)',
                color: 'var(--bm-primary-700)',
              }}
            >
              <Sparkles size={14} />
              AI 推荐分类：{modal.suggestedCategory}
            </div>
          ) : null}

          <label
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-gray-500)',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            保存到文件夹
          </label>
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--bm-radius-md)',
              border: '1px solid var(--bm-gray-200)',
              fontSize: 'var(--bm-text-sm)',
              background: 'var(--bm-gray-0)',
              color: 'var(--bm-gray-700)',
              marginBottom: '16px',
            }}
          >
            <option value="">自动分类（AI 推荐）</option>
            {modal.folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>

          {/* Note input */}
          <label
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-gray-500)',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            备注
          </label>
          <textarea
            value={noteText}
            onChange={(e) => {
              if (e.target.value.length <= MAX_NOTE_LENGTH) {
                setNoteText(e.target.value);
              }
            }}
            placeholder="添加备注（可选）"
            maxLength={MAX_NOTE_LENGTH}
            rows={2}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--bm-radius-md)',
              border: '1px solid var(--bm-gray-200)',
              fontSize: 'var(--bm-text-sm)',
              fontFamily: 'inherit',
              background: 'var(--bm-gray-0)',
              color: 'var(--bm-gray-700)',
              marginBottom: '4px',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            fontSize: 'var(--bm-text-xs)',
            color: noteText.length >= MAX_NOTE_LENGTH ? 'var(--bm-error-500)' : 'var(--bm-gray-400)',
            textAlign: 'right',
            marginBottom: '12px',
          }}>
            {noteText.length}/{MAX_NOTE_LENGTH}
          </div>

          {/* Tag selector */}
          <label
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-gray-500)',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            标签
          </label>
          <div style={{ marginBottom: '16px' }}>
            <TagSelector
              selectedIds={selectedTagIds}
              onChange={setSelectedTagIds}
              placeholder="搜索或创建标签..."
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => hideBookmarkSaveModal()}
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid var(--bm-gray-200)',
                borderRadius: 'var(--bm-radius-md)',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 'var(--bm-text-sm)',
              }}
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              style={{
                flex: 1,
                padding: '8px',
                border: 'none',
                borderRadius: 'var(--bm-radius-md)',
                background: 'var(--bm-primary-500)',
                color: 'white',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: 'var(--bm-text-sm)',
                fontWeight: 500,
              }}
            >
              {saving ? '保存中…' : '确认收藏'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkSaveModal;
