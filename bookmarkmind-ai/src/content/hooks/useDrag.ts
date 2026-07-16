// ============================================================
// useDrag — pointer-event drag hook for floating ball & panel
// ============================================================

import { useCallback, useRef, useState } from "react";
import { useContentStore } from "@content/store/contentStore";
import { safeStorageSet } from "@shared/utils/chrome-api";
import { getEffectiveBallSize } from "@shared/utils/ball-size";

interface DragCallbacks {
  onDrag: (deltaX: number, deltaY: number) => void;
  onDragEnd: (finalX: number, finalY: number) => void;
  onDragStart?: () => void;
}

interface DragOptions {
  verticalOnly?: boolean;
  getInitialPosition: () => { x: number; y: number };
}

export function useDrag(callbacks: DragCallbacks, options: DragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.stopPropagation();

      const pos = options.getInitialPosition();
      pointerStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { x: pos.x, y: pos.y };
      hasMoved.current = false;
      setIsDragging(true);
      callbacks.onDragStart?.();

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - pointerStart.current.x;
        const dy = ev.clientY - pointerStart.current.y;

        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          hasMoved.current = true;
        }

        if (hasMoved.current) {
          callbacks.onDrag(
            options.verticalOnly ? 0 : dx,
            dy,
          );
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.releasePointerCapture(ev.pointerId);

        if (hasMoved.current) {
          const finalX =
            posStart.current.x + (ev.clientX - pointerStart.current.x);
          const finalY =
            posStart.current.y + (ev.clientY - pointerStart.current.y);
          callbacks.onDragEnd(
            options.verticalOnly ? posStart.current.x : finalX,
            finalY,
          );
        }
        setIsDragging(false);
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
    },
    [callbacks, options],
  );

  return { onPointerDown, isDragging, hasMoved: () => hasMoved.current };
}

// ============================================================
// Ball-specific drag — free move while holding, snap on release
// ============================================================

/** 底部留白，防止下方操作面板被裁切 */
export const BALL_BOTTOM_SAFE = 140;
const BALL_TOP_SAFE = 8;

function getBallSize(): number {
  const s = useContentStore.getState();
  return getEffectiveBallSize(s.ballConfig, s.ballShrunk);
}

export function useBallDrag() {
  const dragOrigin = useRef({ x: 0, y: 0 });

  const onDragStart = useCallback(() => {
    const store = useContentStore.getState();
    const ballConfig = store.ballConfig;
    const viewH = window.innerHeight;
    const size = getBallSize();
    const x =
      ballConfig.side === "left"
        ? 8
        : window.innerWidth - size - 8;
    const y = Math.max(
      BALL_TOP_SAFE,
      Math.min(
        (ballConfig.verticalPosition / 100) * viewH,
        viewH - size - BALL_BOTTOM_SAFE,
      ),
    );
    dragOrigin.current = { x, y };
    store.setBallDragging(true);
    store.setBallLivePos({ x, y });
  }, []);

  const onDrag = useCallback((dx: number, dy: number) => {
    const size = getBallSize();
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    const newX = Math.max(
      8,
      Math.min(dragOrigin.current.x + dx, viewW - size - 8),
    );
    const newY = Math.max(
      BALL_TOP_SAFE,
      Math.min(dragOrigin.current.y + dy, viewH - size - BALL_BOTTOM_SAFE),
    );

    useContentStore.getState().setBallLivePos({ x: newX, y: newY });
  }, []);

  const onDragEnd = useCallback((fx: number, fy: number) => {
    const store = useContentStore.getState();
    const ballConfig = store.ballConfig;
    const size = getBallSize();
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    const clampedY = Math.max(
      BALL_TOP_SAFE,
      Math.min(fy, viewH - size - BALL_BOTTOM_SAFE),
    );
    const snapSide: "left" | "right" =
      fx + size / 2 < viewW / 2 ? "left" : "right";
    const pct = Math.round((clampedY / viewH) * 100);

    const newConfig = {
      ...ballConfig,
      side: snapSide,
      verticalPosition: pct,
    };
    store.setBallConfig(newConfig);
    store.setBallLivePos(null);
    store.setBallDragging(false);

    safeStorageSet({ bm_config_ball_position: pct });
  }, []);

  const getInitialPosition = useCallback(() => {
    const store = useContentStore.getState();
    if (store.ballLivePos) return store.ballLivePos;

    const ballConfig = store.ballConfig;
    const size = getBallSize();
    const viewH = window.innerHeight;
    return {
      x:
        ballConfig.side === "left"
          ? 8
          : window.innerWidth - size - 8,
      y: Math.max(
        BALL_TOP_SAFE,
        Math.min(
          (ballConfig.verticalPosition / 100) * viewH,
          viewH - size - BALL_BOTTOM_SAFE,
        ),
      ),
    };
  }, []);

  const drag = useDrag(
    { onDrag, onDragEnd, onDragStart },
    { verticalOnly: false, getInitialPosition },
  );

  return drag;
}

// ============================================================
// Panel-specific drag helpers
// ============================================================

const PANEL_MIN_VISIBLE = 80;

export function usePanelDrag() {
  const panelPosition = useContentStore(s => s.panelPosition);
  const panelSize = useContentStore(s => s.panelSize);
  const { setPanelPosition } = useContentStore.getState();

  const onDrag = useCallback(
    (dx: number, dy: number) => {
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      let newX = panelPosition.x + dx;
      let newY = panelPosition.y + dy;

      newX = Math.max(
        PANEL_MIN_VISIBLE - panelSize.width,
        Math.min(newX, viewW - PANEL_MIN_VISIBLE),
      );
      newY = Math.max(
        -PANEL_MIN_VISIBLE,
        Math.min(newY, viewH - PANEL_MIN_VISIBLE),
      );

      setPanelPosition({ x: newX, y: newY });
    },
    [panelPosition, panelSize, setPanelPosition],
  );

  const onDragEnd = useCallback(
    (fx: number, fy: number) => {
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      const newX = Math.max(
        PANEL_MIN_VISIBLE - panelSize.width,
        Math.min(fx, viewW - PANEL_MIN_VISIBLE),
      );
      const newY = Math.max(
        -PANEL_MIN_VISIBLE,
        Math.min(fy, viewH - PANEL_MIN_VISIBLE),
      );

      setPanelPosition({ x: newX, y: newY });
      safeStorageSet({ bm_config_panel_position: { x: newX, y: newY } });
    },
    [panelSize, setPanelPosition],
  );

  const getInitialPosition = useCallback(() => {
    return { x: panelPosition.x, y: panelPosition.y };
  }, [panelPosition]);

  return useDrag({ onDrag, onDragEnd }, { getInitialPosition });
}
