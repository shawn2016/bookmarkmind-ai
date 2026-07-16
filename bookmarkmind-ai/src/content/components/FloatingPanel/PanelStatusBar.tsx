// ============================================================
// PanelStatusBar — bottom bar with stats, bookmark & settings entry
// ============================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bookmark, BookmarkCheck, Settings, FolderOpen, Sparkles } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';
import { safeOpenOptionsPage, safeSendMessage } from '@shared/utils/chrome-api';
import { useBookmarks } from '@content/hooks/useBookmarks';

export const PanelStatusBar: React.FC = () => {
  const bookmarks = useContentStore((s) => s.bookmarks);
  const aiConfigured = useContentStore((s) => s.aiConfigured);
  const hasAiCredentials = useContentStore((s) => s.hasAiCredentials);
  const { loadBookmarks } = useBookmarks();
  const [isCurrentBookmarked, setIsCurrentBookmarked] = useState(false);

  const stats = useMemo(() => {
    const folders = new Set(bookmarks.map((b) => b.parentId));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAdded = bookmarks.filter(
      (b) => b.dateAdded >= today.getTime(),
    ).length;
    return {
      total: bookmarks.length,
      folders: folders.size,
      todayAdded,
    };
  }, [bookmarks]);

  useEffect(() => {
    const url = window.location.href;
    const found = bookmarks.some((b) => b.url === url);
    setIsCurrentBookmarked(found);
  }, [bookmarks]);

  const handleBookmarkClick = useCallback(async () => {
    const url = window.location.href;
    const title = document.title;

    if (isCurrentBookmarked) {
      const response = await safeSendMessage<{ success?: boolean }>({
        type: 'BOOKMARK_REMOVE_BY_URL',
        payload: { url },
      });
      if (response?.success) {
        useContentStore.getState().pushToast({
          type: 'success',
          message: '已取消收藏',
        });
        setIsCurrentBookmarked(false);
        await loadBookmarks();
      } else {
        useContentStore.getState().pushToast({
          type: 'error',
          message: '取消收藏失败',
        });
      }
      return;
    }

    useContentStore.getState().showBookmarkSaveModal({ url, title });
  }, [isCurrentBookmarked, loadBookmarks]);

  const handleSettingsClick = useCallback(() => {
    safeOpenOptionsPage();
  }, []);

  const barStyle: React.CSSProperties = {
    minHeight: '52px',
    background:
      'linear-gradient(180deg, var(--bm-gray-50) 0%, var(--bm-gray-0) 100%)',
    borderTop: '1px solid var(--bm-gray-200)',
    display: 'flex',
    flexDirection: 'column',
    padding: '6px var(--bm-space-3) 8px',
    gap: '6px',
  };

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const statsRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-3)',
  };

  const statItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: 'var(--bm-text-xs)',
    color: 'var(--bm-gray-500)',
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-1)',
    border: 'none',
    background: 'transparent',
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 500,
    color: isCurrentBookmarked
      ? 'var(--bm-success-500)'
      : 'var(--bm-primary-500)',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 'var(--bm-radius-md)',
    transition: 'background var(--bm-duration-fast)',
  };

  const settingsBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid var(--bm-gray-200)',
    background: 'var(--bm-gray-0)',
    fontSize: 'var(--bm-text-xs)',
    fontWeight: 500,
    color: 'var(--bm-gray-600)',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 'var(--bm-radius-full)',
    transition: 'background var(--bm-duration-fast), border-color var(--bm-duration-fast)',
  };

  return (
    <div style={barStyle}>
      <div style={topRowStyle}>
        <button
          style={btnStyle}
          onClick={handleBookmarkClick}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              isCurrentBookmarked ? 'var(--bm-success-50)' : 'var(--bm-primary-50)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }}
        >
          {isCurrentBookmarked ? (
            <BookmarkCheck size={14} color="var(--bm-success-500)" />
          ) : (
            <Bookmark size={14} color="var(--bm-primary-500)" />
          )}
          <span>{isCurrentBookmarked ? '取消收藏' : '收藏此页'}</span>
        </button>

        <button
          style={settingsBtnStyle}
          onClick={handleSettingsClick}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--bm-gray-100)';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'var(--bm-primary-200)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--bm-gray-0)';
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              'var(--bm-gray-200)';
          }}
        >
          <Settings size={12} />
          设置
        </button>
      </div>

      <div style={statsRowStyle}>
        <span style={statItemStyle}>
          <Bookmark size={11} />
          {stats.total} 书签
        </span>
        <span style={statItemStyle}>
          <FolderOpen size={11} />
          {stats.folders} 文件夹
        </span>
        <span style={statItemStyle}>
          <Sparkles size={11} color={aiConfigured ? 'var(--bm-success-500)' : 'var(--bm-gray-400)'} />
          {aiConfigured ? 'AI 已就绪' : hasAiCredentials ? '请选择模型' : 'AI 未配置'}
        </span>
        {stats.todayAdded > 0 && (
          <span
            style={{
              ...statItemStyle,
              color: 'var(--bm-primary-500)',
              fontWeight: 500,
            }}
          >
            今日 +{stats.todayAdded}
          </span>
        )}
      </div>
    </div>
  );
};

export default PanelStatusBar;
