import type { BallConfig } from '@shared/types';

export const BALL_SIZE_MIN = 36;
export const BALL_SIZE_MAX = 64;
export const BALL_SIZE_DEFAULT = 48;
export const BALL_SHRUNK_RATIO = 0.67;

/** 有效悬浮球直径（含缩小态） */
export function getEffectiveBallSize(
  ballConfig: BallConfig,
  shrunk = false,
): number {
  const base = ballConfig.size ?? BALL_SIZE_DEFAULT;
  const clamped = Math.max(BALL_SIZE_MIN, Math.min(BALL_SIZE_MAX, base));
  return shrunk ? Math.round(clamped * BALL_SHRUNK_RATIO) : clamped;
}
