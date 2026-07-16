// ============================================================
// BookmarkItem — single bookmark row with hover effects
// ============================================================

import React, { useCallback, useRef, useState } from "react";
import { ExternalLink, StickyNote, Highlighter, Trash2 } from "lucide-react";
import type { BookmarkItem as BookmarkItemType } from "@shared/types";
import {
  getFaviconUrl,
  formatRelativeTime,
  truncateUrl,
} from "@shared/utils/format";
import { useContentStore } from "@content/store/contentStore";
import { safeSendMessage } from "@shared/utils/chrome-api";
import { CatalogStamp } from "@shared/components/CatalogStamp";

interface BookmarkItemProps {
  bookmark: BookmarkItemType;
  hasNote?: boolean;
  hasHighlight?: boolean;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({
  bookmark,
  hasNote = false,
  hasHighlight = false,
}) => {
  const batchMode = useContentStore(s => s.batchMode);
  const selectedIds = useContentStore(s => s.selectedIds);
  const toggleSelected = useContentStore(s => s.toggleSelected);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLDivElement>(null);

  const isSelected = selectedIds.has(bookmark.id);
  const faviconUrl = bookmark.faviconUrl || getFaviconUrl(bookmark.url);
  // Derive a stable per-render index from the bookmark id hash so
  // the catalog number doesn't shuffle when the user reorders.
  const catalogIndex = useStableIndex(bookmark.id, bookmark.parentTitle);
  // Treat a bookmark as "fresh" if added within the last 24h
  const isFresh =
    Date.now() - (bookmark.dateAdded ?? 0) < 24 * 60 * 60 * 1000;

  const handleOpen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      window.open(bookmark.url, "_blank");
    },
    [bookmark.url],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const store = useContentStore.getState();
      store.showModal({
        open: true,
        title: "删除书签",
        content: `确定删除「${bookmark.title}」？`,
        confirmVariant: "danger",
        onConfirm: async () => {
          const response = await safeSendMessage({
            type: "BOOKMARK_REMOVE",
            payload: { id: bookmark.id },
          });
          if (response) {
            store.pushToast({ type: "success", message: "已删除" });
          } else {
            store.pushToast({ type: "error", message: "删除失败" });
          }
          store.hideModal();
        },
      });
    },
    [bookmark],
  );

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      const isBatch = useContentStore.getState().batchMode;
      if (isBatch) {
        e.preventDefault();
        e.stopPropagation();
        toggleSelected(bookmark.id);
        return;
      }
      window.open(bookmark.url, "_blank");
    },
    [toggleSelected, bookmark.id, bookmark.url],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, []);

  const rowStyle: React.CSSProperties = {
    height: "56px",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    gap: "var(--bm-space-3)",
    cursor: batchMode ? "pointer" : "default",
    borderBottom: "1px solid var(--bm-gray-100)",
    transition: "background var(--bm-duration-fast)",
    position: "relative",
    backgroundColor: isSelected
      ? "var(--bm-primary-50)"
      : isHovered
        ? "var(--bm-gray-50)"
        : "transparent",
  };

  // Subtle radial gradient on hover using mouse position
  if (isHovered && !batchMode) {
    rowStyle.background = `radial-gradient(200px at ${mousePos.x}px ${mousePos.y}px, var(--bm-gray-100), var(--bm-gray-50))`;
  }

  return (
    <div
      ref={rowRef}
      style={rowStyle}
      onClick={handleRowClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      role="listitem"
      data-testid="bookmark-item"
      data-bookmark-id={bookmark.id}
    >
      {/* Checkbox in batch mode */}
      {batchMode && (
        <div
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            toggleSelected(bookmark.id);
          }}
          onPointerDown={e => e.stopPropagation()}
          style={{
            width: "16px",
            height: "16px",
            minWidth: "16px",
            borderRadius: "var(--bm-radius-sm)",
            border: `2px solid ${isSelected ? "var(--bm-primary-500)" : "var(--bm-gray-300)"}`,
            backgroundColor: isSelected
              ? "var(--bm-primary-500)"
              : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--bm-duration-fast)",
          }}
        >
          {isSelected && (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M2 5l2 2 4-4"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      )}

      {/* Favicon */}
      <img
        src={faviconUrl}
        alt=""
        style={{
          width: "24px",
          height: "24px",
          minWidth: "24px",
          borderRadius: "6px",
          objectFit: "contain",
        }}
        onError={e => {
          (e.currentTarget as HTMLImageElement).src =
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect fill="%23E1E4EA" width="24" height="24" rx="6"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="%239BA1AB">?</text></svg>';
        }}
      />

      {/* Title + URL */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        <span
          className="bm-truncate"
          style={{
            fontSize: "var(--bm-text-md)",
            fontWeight: 500,
            color: "var(--bm-gray-700)",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span className="bm-truncate" style={{ flex: 1 }}>
            {bookmark.title}
          </span>
          {hasNote && (
            <span title="有备注" style={{ display: "inline-flex", flexShrink: 0, color: "var(--bm-primary-400)" }}>
              <StickyNote size={12} />
            </span>
          )}
          {hasHighlight && (
            <span title="有高亮" style={{ display: "inline-flex", flexShrink: 0, color: "var(--bm-warning-500)" }}>
              <Highlighter size={12} />
            </span>
          )}
        </span>
        <span
          className="bm-truncate"
          style={{
            fontSize: "var(--bm-text-xs)",
            color: "var(--bm-gray-400)",
          }}
        >
          {truncateUrl(bookmark.url, 50)}
        </span>
      </div>

      {/* Category badge + time */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "2px",
          flexShrink: 0,
        }}
      >
        {bookmark.parentTitle && (
          <span
            style={{
              backgroundColor: "var(--bm-primary-50)",
              color: "var(--bm-primary-600)",
              fontSize: "var(--bm-text-xs)",
              padding: "0 6px",
              borderRadius: "var(--bm-radius-sm)",
              lineHeight: "1.6",
              whiteSpace: "nowrap",
            }}
          >
            {bookmark.parentTitle}
          </span>
        )}
        <span
          style={{
            fontSize: "var(--bm-text-xs)",
            color: "var(--bm-gray-400)",
          }}
        >
          {formatRelativeTime(bookmark.dateAdded)}
        </span>
        {/* Signature: 馆藏编号 stamp */}
        <div style={{ marginTop: "4px" }}>
          <CatalogStamp
            category={bookmark.parentTitle || 'GEN'}
            index={catalogIndex}
            pulse={isFresh}
          />
        </div>
      </div>

      {/* Action buttons on hover (non-batch mode) */}
      {isHovered && !batchMode && (
        <div
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            gap: "2px",
            backgroundColor: "var(--bm-gray-0)",
            borderRadius: "var(--bm-radius-sm)",
            padding: "2px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            border: "1px solid var(--bm-gray-200)",
          }}
        >
          <ActionBtn
            icon={<ExternalLink size={12} />}
            title="打开"
            onClick={handleOpen}
            testId="bookmark-open-btn"
          />
          <ActionBtn
            icon={<Trash2 size={12} />}
            title="删除"
            onClick={handleDelete}
            testId="bookmark-delete-btn"
          />
        </div>
      )}
    </div>
  );
};

// Small action button helper
const ActionBtn: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  testId?: string;
}> = ({ icon, title, onClick, testId }) => {
  const btnStyle: React.CSSProperties = {
    width: "22px",
    height: "22px",
    border: "none",
    background: "transparent",
    borderRadius: "var(--bm-radius-sm)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--bm-gray-500)",
    padding: 0,
    transition:
      "background var(--bm-duration-fast), color var(--bm-duration-fast)",
  };

  return (
    <button
      style={btnStyle}
      onClick={onClick}
      title={title}
      aria-label={title}
      data-testid={testId}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "var(--bm-gray-100)";
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--bm-gray-700)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        (e.currentTarget as HTMLButtonElement).style.color =
          "var(--bm-gray-500)";
      }}
    >
      {icon}
    </button>
  );
};

export default BookmarkItem;

/**
 * Derive a stable per-bookmark catalog index by hashing its id and the
 * parent folder title. Same input → same number across re-renders.
 */
function useStableIndex(id: string, parentTitle?: string): number {
  const key = `${parentTitle ?? ''}::${id}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  // Map to 1-999 so the stamp stays compact.
  return (Math.abs(h) % 999) + 1;
}
