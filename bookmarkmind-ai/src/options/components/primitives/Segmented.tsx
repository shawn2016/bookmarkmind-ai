/* ============================================================
   Primitive — Segmented
   单行分段控件：bg-elevated 容器 + 选中项琥珀渐变 + inset shadow 凸起
   ============================================================ */

import React from 'react';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
}

interface SegmentedProps<T extends string = string> {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}

export function Segmented<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="flex rounded-bm-md"
      style={{
        padding: '3px',
        background: 'var(--bm-bg-elevated)',
        border: '1px solid var(--bm-border-subtle)',
        gap: '2px',
      }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className="flex-1 rounded-bm-sm outline-none"
            style={{
              padding: selected ? '5px 12px' : '6px 12px',
              fontSize: 'var(--bm-text-sm)',
              fontWeight: selected ? 600 : 400,
              color: selected
                ? 'var(--bm-text-on-accent)'
                : 'var(--bm-text-secondary)',
              background: selected
                ? 'linear-gradient(180deg, var(--bm-amber-500) 0%, var(--bm-primary-500) 100%)'
                : 'transparent',
              border: 'none',
              boxShadow: selected
                ? 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 2px rgba(0,0,0,0.18), 0 1px 3px var(--bm-accent-25)'
                : 'none',
              cursor: 'pointer',
              transition:
                'background .18s var(--bm-ease-out), color .18s var(--bm-ease-out), padding .18s var(--bm-ease-out), box-shadow .22s var(--bm-ease-out)',
            }}
            onMouseEnter={(e) => {
              if (!selected) {
                e.currentTarget.style.background = 'var(--bm-bg-overlay)';
                e.currentTarget.style.color = 'var(--bm-text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!selected) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--bm-text-secondary)';
              }
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;