// ============================================================
// useBallHover — document-level pointer tracking for hover state
// Replaces fragile ref-counting across ball / zone / buttons
// ============================================================

import { useEffect } from 'react';
import { useContentStore } from '@content/store/contentStore';
import type { BallConfig } from '@shared/types';
import { getEffectiveBallSize } from '@shared/utils/ball-size';
import { BALL_BOTTOM_SAFE } from '@content/hooks/useDrag';

const BTN_SIZE = 32;
const GAP = 4;
const HOVER_PAD = 6;
const LEAVE_DELAY = 200;

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

let leaveTimer: ReturnType<typeof setTimeout> | null = null;

function resolveBallPos(
  ballConfig: BallConfig,
  ballLivePos: { x: number; y: number } | null,
  ballShrunk: boolean,
) {
  const size = getEffectiveBallSize(ballConfig, ballShrunk);
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;
  const defaultY = Math.max(
    8,
    Math.min(
      (ballConfig.verticalPosition / 100) * viewH,
      viewH - size - BALL_BOTTOM_SAFE,
    ),
  );
  const defaultX =
    ballConfig.side === 'left' ? 8 : viewW - size - 8;
  const x = ballLivePos?.x ?? defaultX;
  const y = ballLivePos?.y ?? defaultY;
  return { x, y, size, centerX: x + size / 2 };
}

function toRect(
  x: number,
  y: number,
  w: number,
  h: number,
  pad = HOVER_PAD,
): Rect {
  return {
    left: x - pad,
    top: y - pad,
    right: x + w + pad,
    bottom: y + h + pad,
  };
}

function pointInRect(px: number, py: number, rect: Rect): boolean {
  return (
    px >= rect.left &&
    px <= rect.right &&
    py >= rect.top &&
    py <= rect.bottom
  );
}

function getHoverRects(): Rect[] {
  const state = useContentStore.getState();
  const { ballConfig, ballLivePos, ballShrunk, ballState, ballClosePanelVisible } =
    state;

  const { x, y, size, centerX } = resolveBallPos(
    ballConfig,
    ballLivePos,
    ballShrunk,
  );
  const rects: Rect[] = [toRect(x, y, size, size)];

  const showActionBar =
    ballConfig.actionBarMode !== 'hidden' &&
    (ballConfig.actionBarMode === 'always' ||
      ballState === 'hover' ||
      ballClosePanelVisible);

  if (showActionBar) {
    const colTop = y + size + 2;
    const colLeft = centerX - BTN_SIZE / 2;
    rects.push(
      toRect(colLeft, colTop, BTN_SIZE, BTN_SIZE * 3 + GAP * 2),
    );
  }

  if (ballClosePanelVisible) {
    const panelWidth = 240;
    const panelLeft = Math.max(
      8,
      Math.min(centerX - panelWidth / 2, window.innerWidth - panelWidth - 8),
    );
    const panelTop = y + size + 12;
    rects.push(toRect(panelLeft, panelTop, panelWidth, 220, 4));
  }

  return rects;
}

function isPointerInHoverZone(px: number, py: number): boolean {
  return getHoverRects().some((rect) => pointInRect(px, py, rect));
}

function clearLeaveTimer() {
  if (leaveTimer) {
    clearTimeout(leaveTimer);
    leaveTimer = null;
  }
}

function scheduleCollapse() {
  if (leaveTimer) return;
  leaveTimer = setTimeout(() => {
    leaveTimer = null;
    const state = useContentStore.getState();
    if (
      state.ballDragging ||
      state.ballClosePanelVisible ||
      state.panelVisible
    ) {
      return;
    }
    if (state.ballState === 'hover') {
      state.setBallState('collapsed');
    }
  }, LEAVE_DELAY);
}

function applyPointer(px: number, py: number) {
  const state = useContentStore.getState();
  if (state.panelVisible || state.ballDragging) return;

  if (isPointerInHoverZone(px, py)) {
    clearLeaveTimer();
    if (state.ballState === 'collapsed') {
      state.setBallState('hover');
    }
    return;
  }

  if (state.ballState === 'hover') {
    scheduleCollapse();
  }
}

/** Track pointer globally so hover reliably clears when leaving the ball cluster */
export function useBallHoverPointer(): void {
  const ballConfig = useContentStore((s) => s.ballConfig);
  const ballLivePos = useContentStore((s) => s.ballLivePos);
  const ballShrunk = useContentStore((s) => s.ballShrunk);
  const ballState = useContentStore((s) => s.ballState);
  const ballDragging = useContentStore((s) => s.ballDragging);
  const ballClosePanelVisible = useContentStore((s) => s.ballClosePanelVisible);
  const panelVisible = useContentStore((s) => s.panelVisible);

  useEffect(() => {
    const onMove = (e: MouseEvent) => applyPointer(e.clientX, e.clientY);

    const onWindowLeave = () => {
      const state = useContentStore.getState();
      if (
        state.ballState === 'hover' &&
        !state.ballDragging &&
        !state.ballClosePanelVisible
      ) {
        state.setBallState('collapsed');
      }
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onWindowLeave);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onWindowLeave);
      clearLeaveTimer();
    };
  }, [
    ballConfig,
    ballLivePos,
    ballShrunk,
    ballState,
    ballDragging,
    ballClosePanelVisible,
    panelVisible,
  ]);
}
