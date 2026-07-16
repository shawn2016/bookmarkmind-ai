/* ============================================================
   AI 书签管家 — Popup UI (fallback when content script can't inject)
   ============================================================ */

import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Bookmark, Search, Settings, Globe } from 'lucide-react';
import { getBookmarkCreateToastMessage } from '@shared/utils/bookmark-toast';

interface TabInfo {
  title: string;
  url: string;
  faviconUrl: string;
}

const Popup: React.FC = () => {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [bookmarking, setBookmarking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | 'warning'>('success');

  /** Load current tab info on mount */
  useEffect(() => {
    const load = async () => {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.title) {
        setTabInfo({
          title: tab.title,
          url: tab.url,
          faviconUrl: tab.favIconUrl ?? '',
        });

        // Check if already bookmarked
        try {
          const response = await chrome.runtime.sendMessage({
            type: 'CHECK_BOOKMARKED',
            payload: { url: tab.url },
          });
          setBookmarked(response?.bookmarked ?? false);
        } catch {
          // Ignore — background may not be ready
        }
      }
    };
    load();
  }, []);

  /** Bookmark current page */
  const handleBookmark = useCallback(async () => {
    if (!tabInfo || bookmarking) return;
    setBookmarking(true);
    setStatusMessage(null);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'BOOKMARK_CREATE',
        payload: { url: tabInfo.url, title: tabInfo.title },
      }) as {
        success?: boolean;
        error?: string;
        classified?: boolean;
        category?: string;
      } | undefined;

      if (response?.success) {
        setBookmarked(true);
        const toast = getBookmarkCreateToastMessage(response, {
          quickLabel: '已收藏当前页面',
        });
        setStatusType(toast.type);
        setStatusMessage(toast.message);
      } else {
        const toast = getBookmarkCreateToastMessage({
          success: false,
          error: response?.error,
        });
        setStatusType(toast.type);
        setStatusMessage(toast.message);
      }
    } catch {
      setStatusType('error');
      setStatusMessage('收藏失败，请重试');
    } finally {
      setBookmarking(false);
    }
  }, [tabInfo, bookmarking]);

  /** Open AI search panel in the page */
  const handleSearch = useCallback(async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'AI_INTENT', payload: { message: '' } });
    } catch {
      // Ignore
    }
    window.close();
  }, []);

  /** Open options page */
  const handleSettings = useCallback(() => {
    chrome.runtime.openOptionsPage();
    window.close();
  }, []);

  return (
    <div
      style={{
        width: '320px',
        padding: '16px',
        fontFamily: 'var(--bm-font-sans)',
        background: 'var(--bm-gray-0)',
        color: 'var(--bm-gray-800)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 mb-3"
        style={{ paddingBottom: '12px', borderBottom: '1px solid var(--bm-gray-200)' }}
      >
        <BookOpen size={20} strokeWidth={2} style={{ color: 'var(--bm-primary-500)' }} />
        <span
          style={{
            fontSize: 'var(--bm-text-xl)',
            fontWeight: 600,
            color: 'var(--bm-gray-800)',
          }}
        >
          AI 书签管家
        </span>
      </div>

      {/* Current page info */}
      {tabInfo && (
        <div
          className="flex items-center gap-2 mb-3 rounded-bm-md p-2"
          style={{
            background: 'var(--bm-gray-50)',
            border: '1px solid var(--bm-gray-200)',
          }}
        >
          {tabInfo.faviconUrl ? (
            <img
              src={tabInfo.faviconUrl}
              alt=""
              width={16}
              height={16}
              style={{ borderRadius: '2px' }}
            />
          ) : (
            <Globe size={16} strokeWidth={2} style={{ color: 'var(--bm-gray-400)' }} />
          )}
          <div className="flex-1 min-w-0">
            <p
              className="truncate"
              style={{
                fontSize: 'var(--bm-text-sm)',
                fontWeight: 500,
                color: 'var(--bm-gray-700)',
                lineHeight: 'var(--bm-leading-tight)',
              }}
            >
              {tabInfo.title}
            </p>
            <p
              className="truncate"
              style={{
                fontSize: 'var(--bm-text-xs)',
                color: 'var(--bm-gray-400)',
              }}
            >
              {tabInfo.url}
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-2 mb-3">
        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          disabled={bookmarking || bookmarked}
          className="flex items-center justify-center gap-2 rounded-bm-md outline-none w-full"
          style={{
            fontSize: 'var(--bm-text-md)',
            fontWeight: 500,
            padding: '10px 16px',
            color: bookmarked ? 'var(--bm-success-500)' : 'var(--bm-primary-500)',
            background: bookmarked ? 'var(--bm-success-50)' : 'var(--bm-primary-50)',
            border: bookmarked
              ? '1px solid var(--bm-success-100)'
              : '1px solid var(--bm-primary-200)',
            cursor: bookmarking || bookmarked ? 'default' : 'pointer',
            transition:
              'background .22s var(--bm-ease-out), transform .32s var(--bm-ease-spring)',
          }}
          onMouseDown={(e) => {
            if (!bookmarking && !bookmarked) e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Bookmark size={16} strokeWidth={2} />
          <span>{bookmarked ? '已收藏' : bookmarking ? '正在收藏…' : '收藏此页'}</span>
        </button>

        {/* AI search button */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-bm-md outline-none w-full"
          style={{
            fontSize: 'var(--bm-text-md)',
            fontWeight: 500,
            padding: '10px 16px',
            color: 'var(--bm-gray-700)',
            background: 'var(--bm-gray-50)',
            border: '1px solid var(--bm-gray-200)',
            cursor: 'pointer',
            transition:
              'background .22s var(--bm-ease-out), transform .32s var(--bm-ease-spring)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bm-gray-100)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bm-gray-50)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.97)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Search size={16} strokeWidth={2} />
          <span>AI 搜索</span>
        </button>
      </div>

      {statusMessage && (
        <p
          style={{
            fontSize: 'var(--bm-text-xs)',
            color:
              statusType === 'success'
                ? 'var(--bm-success-500)'
                : statusType === 'warning'
                  ? 'var(--bm-warning-500, var(--bm-gray-600))'
                  : 'var(--bm-error-500)',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          {statusMessage}
        </p>
      )}

      {/* Settings link */}
      <button
        onClick={handleSettings}
        className="flex items-center justify-center gap-1 rounded-bm-md outline-none w-full"
        style={{
          fontSize: 'var(--bm-text-sm)',
          fontWeight: 400,
          padding: '8px 16px',
          color: 'var(--bm-gray-400)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'color var(--bm-duration-fast) var(--bm-ease-default)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--bm-primary-500)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--bm-gray-400)';
        }}
      >
        <Settings size={14} strokeWidth={2} />
        <span>设置</span>
      </button>
    </div>
  );
};

export default Popup;
