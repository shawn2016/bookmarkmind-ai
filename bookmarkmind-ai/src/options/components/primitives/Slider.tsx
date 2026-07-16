/* ============================================================
   Primitive — Slider
   增强滑块：track 渐变填充 + 大圆 thumb + min/max 端点标签 + 数值徽章
   ============================================================ */

import React, { useId } from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  /** 自定义显示文本，默认原值 */
  formatValue?: (v: number) => string;
  minLabel?: string;
  maxLabel?: string;
  ariaLabel: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  minLabel,
  maxLabel,
  ariaLabel,
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  const display = formatValue ? formatValue(value) : `${value}`;
  const trackId = useId();

  return (
    <div className="flex flex-col gap-bm-1">
      <div
        className="flex items-center gap-bm-3"
        style={{ padding: '4px 0' }}
      >
        <span
          style={{
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-muted)',
            fontFamily: 'var(--bm-font-mono)',
            minWidth: '32px',
            textAlign: 'left',
          }}
        >
          {minLabel ?? min}
        </span>

        <div
          style={{
            position: 'relative',
            flex: 1,
            height: '20px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Track 底 */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: '4px',
              borderRadius: '2px',
              background: 'var(--bm-bg-elevated)',
              border: '1px solid var(--bm-border-subtle)',
            }}
          />
          {/* Track 填充（琥珀渐变） */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: `${pct}%`,
              height: '4px',
              borderRadius: '2px',
              background:
                'linear-gradient(90deg, var(--bm-primary-500) 0%, var(--bm-amber-500) 100%)',
              boxShadow: '0 0 6px var(--bm-accent-30)',
              transition: 'width .15s var(--bm-ease-out)',
            }}
          />
          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${pct}% - 9px)`,
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background:
                'linear-gradient(135deg, var(--bm-amber-500) 0%, var(--bm-primary-600) 100%)',
              border: '2px solid var(--bm-bg-input)',
              boxShadow:
                '0 2px 6px var(--bm-accent-40), inset 0 1px 0 rgba(255,255,255,0.20)',
              transition: 'left .15s var(--bm-ease-out)',
              pointerEvents: 'none',
            }}
          />
          {/* Native range 透明覆盖 */}
          <input
            id={trackId}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={ariaLabel}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              width: '100%',
              height: '20px',
              margin: 0,
              padding: 0,
              background: 'transparent',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
        </div>

        <span
          style={{
            fontSize: 'var(--bm-text-xs)',
            color: 'var(--bm-text-muted)',
            fontFamily: 'var(--bm-font-mono)',
            minWidth: '32px',
            textAlign: 'right',
          }}
        >
          {maxLabel ?? max}
        </span>

        {/* 数值徽章 */}
        <span
          className="rounded-bm-sm"
          style={{
            fontSize: 'var(--bm-text-xs)',
            fontWeight: 600,
            fontFamily: 'var(--bm-font-mono)',
            color: 'var(--bm-text-on-accent)',
            background:
              'linear-gradient(135deg, var(--bm-amber-500) 0%, var(--bm-primary-500) 100%)',
            padding: '3px 8px',
            minWidth: '44px',
            textAlign: 'center',
            boxShadow: '0 1px 3px var(--bm-accent-30)',
          }}
        >
          {display}
        </span>
      </div>
    </div>
  );
};

export default Slider;