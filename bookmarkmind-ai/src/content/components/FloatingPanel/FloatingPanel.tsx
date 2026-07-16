// ============================================================
// FloatingPanel — main panel container with drag & resize
// ============================================================

import React, { useCallback, useEffect, useRef } from "react";
import { useContentStore } from "@content/store/contentStore";
import { usePanelDrag } from "@content/hooks/useDrag";
import { useResize } from "@content/hooks/useResize";
import { PanelHeader } from "@content/components/FloatingPanel/PanelHeader";
import { PanelTabs } from "@content/components/FloatingPanel/PanelTabs";
import { PanelStatusBar } from "@content/components/FloatingPanel/PanelStatusBar";
import { ChatTab } from "@content/components/ChatTab/ChatTab";
import { BookmarkTab } from "@content/components/BookmarkTab/BookmarkTab";
import { CleanupTab } from "@content/components/CleanupTab/CleanupTab";
import { ResurfaceTab } from "@content/components/ResurfaceTab/ResurfaceTab";
import { TimelineTab } from "@content/components/TimelineTab/TimelineTab";

export const FloatingPanel: React.FC = () => {
  const panelSize = useContentStore(s => s.panelSize);
  const panelPosition = useContentStore(s => s.panelPosition);
  const activeTab = useContentStore(s => s.activeTab);
  const panelFullscreen = useContentStore(s => s.panelFullscreen);
  const panelShortcutEnabled = useContentStore(
    (s) => s.ballConfig.panelShortcutEnabled,
  );
  const setPanelPosition = useContentStore(s => s.setPanelPosition);
  const { collapsePanel, togglePanelFullscreen } = useContentStore.getState();

  const { onPointerDown: onHeaderDragDown, isDragging: isHeaderDragging } =
    usePanelDrag();
  const { onResizeStart, isResizing } = useResize();
  const panelRef = useRef<HTMLDivElement>(null);

  // Calculate default position if not set
  useEffect(() => {
    const pos = useContentStore.getState().panelPosition;
    if (pos.x === 0 && pos.y === 0) {
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;
      const x = viewW - panelSize.width - 24;
      const y = Math.max(8, (viewH - panelSize.height) / 2);
      setPanelPosition({ x, y });
    }
  }, [panelSize, setPanelPosition]);

  // Keyboard shortcuts: F toggles fullscreen, Escape exits fullscreen first.
  // Gated by ballConfig.panelShortcutEnabled — users can disable in settings.
  useEffect(() => {
    if (!panelShortcutEnabled) return;

    const isEditable = (el: EventTarget | null): boolean => {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape always exits fullscreen first (if in fullscreen), regardless of focus
      if (e.key === 'Escape' && panelFullscreen) {
        e.preventDefault();
        e.stopPropagation();
        useContentStore.getState().setPanelFullscreen(false);
        return;
      }
      // F toggles fullscreen, but only when user isn't typing
      if ((e.key === 'f' || e.key === 'F') && !isEditable(e.target)) {
        // Ignore if modifier keys (allow Cmd+F, Ctrl+F for native search)
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        togglePanelFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [panelFullscreen, togglePanelFullscreen, panelShortcutEnabled]);

  // Outside click to close (suppressed in fullscreen — backdrop covers everything anyway)
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelFullscreen) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        collapsePanel();
      }
    },
    [collapsePanel, panelFullscreen],
  );

  const panelStyle: React.CSSProperties = panelFullscreen
    ? {
        position: "fixed",
        left: "12px",
        top: "12px",
        width: "calc(100vw - 24px)",
        height: "calc(100vh - 24px)",
        backgroundColor: "var(--bm-gray-0)",
        borderRadius: "var(--bm-radius-lg)",
        boxShadow: "var(--bm-shadow-panel)",
        border: "1px solid var(--bm-gray-200)",
        display: "flex",
        flexDirection: "column",
        zIndex: "var(--bm-z-panel)",
        animation: "bm-panel-enter var(--bm-duration-normal) var(--bm-ease-out)",
        pointerEvents: "auto",
        overflow: "hidden",
        transition:
          "left var(--bm-duration-normal) var(--bm-ease-out), top var(--bm-duration-normal) var(--bm-ease-out), width var(--bm-duration-normal) var(--bm-ease-out), height var(--bm-duration-normal) var(--bm-ease-out)",
      }
    : {
        position: "fixed",
        left: `${panelPosition.x}px`,
        top: `${panelPosition.y}px`,
        width: `${panelSize.width}px`,
        height: `${panelSize.height}px`,
        backgroundColor: "var(--bm-gray-0)",
        borderRadius: "var(--bm-radius-lg)",
        boxShadow: "var(--bm-shadow-panel)",
        border: "1px solid var(--bm-gray-200)",
        display: "flex",
        flexDirection: "column",
        zIndex: "var(--bm-z-panel)",
        animation: "bm-panel-enter var(--bm-duration-normal) var(--bm-ease-out)",
        pointerEvents: "auto",
        overflow: "hidden",
        transition:
          "left var(--bm-duration-normal) var(--bm-ease-out), top var(--bm-duration-normal) var(--bm-ease-out), width var(--bm-duration-normal) var(--bm-ease-out), height var(--bm-duration-normal) var(--bm-ease-out)",
      };

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: "calc(var(--bm-z-panel) - 1)",
    pointerEvents: "auto",
  };

  return (
    <>
      {/* Backdrop for outside-click dismissal (hidden in fullscreen — panel covers it anyway) */}
      {!panelFullscreen && (
        <div style={backdropStyle} onClick={handleBackdropClick} />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        style={panelStyle}
        role="dialog"
        aria-label="AI 书签管家面板"
        data-testid="floating-panel"
        data-fullscreen={panelFullscreen}
      >
        <PanelHeader
          onPointerDown={panelFullscreen ? undefined : onHeaderDragDown}
          isDragging={isHeaderDragging}
          onClose={collapsePanel}
        />
        <PanelTabs />
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {activeTab === "chat" && <ChatTab />}
          {activeTab === "bookmarks" && <BookmarkTab />}
          {activeTab === "timeline" && <TimelineTab />}
          {activeTab === "cleanup" && <CleanupTab />}
          {activeTab === "resurface" && <ResurfaceTab />}
        </div>
        <PanelStatusBar />

        {/* Resize handle — bottom-right corner (hidden in fullscreen) */}
        {!panelFullscreen && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: "16px",
              height: "16px",
              cursor: isResizing ? "nwse-resize" : "nwse-resize",
              pointerEvents: "auto",
              zIndex: 10,
            }}
            onPointerDown={onResizeStart}
          />
        )}
      </div>
    </>
  );
};

export default FloatingPanel;
