// ============================================================
// FloatingBall — circular draggable floating button with tooltip
// Click = quick bookmark; hover = close + settings below
// ============================================================

import React, { useCallback, useRef, useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useContentStore } from "@content/store/contentStore";
import { useBallDrag, BALL_BOTTOM_SAFE } from "@content/hooks/useDrag";
import { safeSendMessage } from "@shared/utils/chrome-api";
import { getEffectiveBallSize } from "@shared/utils/ball-size";
import { useBookmarks } from "@content/hooks/useBookmarks";

export const FloatingBall: React.FC = () => {
  const ballConfig = useContentStore(s => s.ballConfig);
  const ballState = useContentStore(s => s.ballState);
  const ballOpacity = useContentStore(s => s.ballOpacity);
  const ballShrunk = useContentStore(s => s.ballShrunk);
  const ballLivePos = useContentStore(s => s.ballLivePos);
  const ballDragging = useContentStore(s => s.ballDragging);
  const bookmarks = useContentStore(s => s.bookmarks);
  const panelVisible = useContentStore(s => s.panelVisible);
  const { ballHoverEnter, ballHoverLeave } = useContentStore.getState();

  const { onPointerDown, isDragging } = useBallDrag();
  const ballRef = useRef<HTMLDivElement>(null);
  const dragHappenedRef = useRef(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [, setWinTick] = useState(0);

  const BALL_SIZE = getEffectiveBallSize(ballConfig, ballShrunk);
  const iconSize = Math.round(BALL_SIZE * 0.46);

  const side = ballConfig.side;
  const yPct = ballConfig.verticalPosition;
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;

  const defaultY = Math.max(
    8,
    Math.min(
      (yPct / 100) * viewH,
      viewH - BALL_SIZE - BALL_BOTTOM_SAFE,
    ),
  );
  const defaultX = side === "left" ? 8 : viewW - BALL_SIZE - 8;

  const posX = ballLivePos?.x ?? defaultX;
  const posY = ballLivePos?.y ?? defaultY;

  // Ball hides when panel is visible OR when the panel is in fullscreen
  // mode (otherwise the ball would overlap the fullscreen panel edge).
  const panelFullscreen = useContentStore((s) => s.panelFullscreen);
  const isHidden = panelVisible || panelFullscreen;

  useEffect(() => {
    const onResize = () => {
      setWinTick(t => t + 1);
      const store = useContentStore.getState();
      if (store.ballLivePos && !store.ballDragging) {
        const size = getEffectiveBallSize(store.ballConfig, store.ballShrunk);
        const { x, y } = store.ballLivePos;
        store.setBallLivePos({
          x: Math.max(8, Math.min(x, window.innerWidth - size - 8)),
          y: Math.max(
            8,
            Math.min(y, window.innerHeight - size - BALL_BOTTOM_SAFE),
          ),
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleMouseEnter = useCallback(() => {
    ballHoverEnter();
    setShowTooltip(true);
  }, [ballHoverEnter]);

  const handleMouseLeave = useCallback(() => {
    if (ballDragging) return;
    setShowTooltip(false);
    ballHoverLeave();
  }, [ballHoverLeave, ballDragging]);

  const { loadBookmarks } = useBookmarks();

  const handleQuickBookmark = useCallback(async () => {
    const url = window.location.href;
    const title = document.title;
    const store = useContentStore.getState();
    const isBookmarked = bookmarks.some(b => b.url === url);

    if (isBookmarked) {
      const response = await safeSendMessage<{ success?: boolean }>({
        type: "BOOKMARK_REMOVE_BY_URL",
        payload: { url },
      });
      if (response?.success) {
        store.pushToast({ type: "success", message: "已取消收藏" });
        await loadBookmarks();
      } else {
        store.pushToast({ type: "error", message: "取消收藏失败" });
      }
      return;
    }

    const response = await safeSendMessage<{
      success?: boolean;
      classified?: boolean;
      category?: string;
    }>({
      type: "BOOKMARK_CREATE",
      payload: { url, title },
    });

    if (response?.success) {
      const msg =
        response.classified && response.category
          ? `已收藏并归入「${response.category}」`
          : "已快速收藏";
      store.pushToast({ type: "success", message: msg });
      await loadBookmarks();
    } else {
      store.pushToast({ type: "error", message: "收藏失败" });
    }
  }, [bookmarks, loadBookmarks]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragHappenedRef.current || isDragging || ballDragging) {
        dragHappenedRef.current = false;
        return;
      }
      e.stopPropagation();

      if (panelVisible) {
        useContentStore.getState().collapsePanel();
        return;
      }

      void handleQuickBookmark();
    },
    [panelVisible, isDragging, ballDragging, handleQuickBookmark],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!panelVisible) {
        useContentStore.getState().expandPanel();
      }
    },
    [panelVisible],
  );

  useEffect(() => {
    const el = ballRef.current;
    if (!el) return;

    const onUp = () => {
      dragHappenedRef.current = isDragging || ballDragging;
    };
    el.addEventListener("pointerup", onUp);
    return () => el.removeEventListener("pointerup", onUp);
  }, [isDragging, ballDragging]);

  const effectiveOpacity =
    ballState !== "collapsed" || ballDragging ? 1.0 : ballOpacity;
  const isHover = ballState === "hover" || ballDragging;

  const isCurrentBookmarked = bookmarks.some(
    b => b.url === window.location.href,
  );
  const tooltipText = isCurrentBookmarked
    ? "点击取消收藏"
    : "点击快速收藏";

  const ballStyle: React.CSSProperties = {
    position: "fixed",
    left: `${posX}px`,
    top: `${posY}px`,
    width: `${BALL_SIZE}px`,
    height: `${BALL_SIZE}px`,
    borderRadius: "var(--bm-radius-full)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1px solid var(--bm-gray-200)",
    boxShadow: isHover
      ? "var(--bm-shadow-ball-hover)"
      : "var(--bm-shadow-ball)",
    opacity: effectiveOpacity,
    transform: isHover ? "scale(1.08)" : "scale(1)",
    transition: ballDragging
      ? "none"
      : `opacity var(--bm-duration-fast) var(--bm-ease-spring), transform var(--bm-duration-fast) var(--bm-ease-spring), box-shadow var(--bm-duration-fast) var(--bm-ease-spring), left var(--bm-duration-normal) var(--bm-ease-spring), top var(--bm-duration-normal) var(--bm-ease-spring)`,
    cursor: ballDragging ? "grabbing" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "calc(var(--bm-z-actionbar) + 1)",
    pointerEvents: isHidden ? "none" : "auto",
    visibility: isHidden ? "hidden" : "visible",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "none",
  };

  const tooltipStyle: React.CSSProperties = {
    position: "fixed",
    right: `${viewW - posX + 10}px`,
    top: `${posY + BALL_SIZE / 2}px`,
    height: "28px",
    padding: "0 12px",
    backgroundColor: "rgba(0, 0, 0, 0.88)",
    color: "#fff",
    borderRadius: "var(--bm-radius-md)",
    fontSize: "var(--bm-text-sm)",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    zIndex: "var(--bm-z-actionbar)",
    pointerEvents: "none",
    opacity: showTooltip && !ballDragging ? 1 : 0,
    transform:
      showTooltip && !ballDragging
        ? "translateY(-50%)"
        : "translateY(-50%) translateX(6px)",
    transition: `opacity var(--bm-duration-fast) var(--bm-ease-out), transform var(--bm-duration-fast) var(--bm-ease-spring)`,
  };

  return (
    <>
      <div
        ref={ballRef}
        style={ballStyle}
        onPointerDown={onPointerDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        aria-label="AI 书签管家"
        data-testid="floating-ball"
        tabIndex={0}
        title={tooltipText}
      >
        <Bookmark
          size={iconSize}
          color={
            isCurrentBookmarked
              ? "var(--bm-success-500)"
              : "var(--bm-primary-500)"
          }
          strokeWidth={2}
          fill={isCurrentBookmarked ? "var(--bm-success-100)" : "none"}
        />
      </div>
      <div style={tooltipStyle}>{tooltipText}</div>
    </>
  );
};

export default FloatingBall;
