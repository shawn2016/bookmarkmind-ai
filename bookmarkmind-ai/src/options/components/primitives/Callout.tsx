/* ============================================================
   Primitive — Callout
   信息提示盒：parchment bg + tobacco border + 琥珀左书签带 + display italic
   用于隐私声明、提示、警告、说明等场景
   ============================================================ */

import React from 'react';

export type CalloutTone = 'info' | 'warning' | 'error' | 'success' | 'privacy';

interface CalloutProps {
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  tone?: CalloutTone;
  /** 行内 layout（无 padding 容器版本，用于已在外层有 padding 的位置） */
  inline?: boolean;
}

const TONE_LEFT_BAR: Record<CalloutTone, string> = {
  info:     'var(--bm-state-info)',
  warning:  'var(--bm-state-warning)',
  error:    'var(--bm-state-error)',
  success:  'var(--bm-state-success)',
  privacy:  'var(--bm-amber-500)',
};

const TONE_ICON_COLOR: Record<CalloutTone, string> = {
  info:     'var(--bm-state-info)',
  warning:  'var(--bm-state-warning)',
  error:    'var(--bm-state-error)',
  success:  'var(--bm-state-success)',
  privacy:  'var(--bm-text-accent)',
};

export const Callout: React.FC<CalloutProps> = ({
  icon,
  title,
  children,
  tone = 'privacy',
  inline,
}) => (
  <div
    className={inline ? 'flex items-start gap-bm-2' : 'flex items-start gap-bm-3 p-bm-4 rounded-bm-md'}
    style={{
      background: inline ? 'transparent' : 'var(--bm-bg-elevated)',
      border: inline ? 'none' : '1px solid var(--bm-border-subtle)',
      borderLeft: inline ? 'none' : `3px solid ${TONE_LEFT_BAR[tone]}`,
    }}
  >
    {icon && (
      <span
        style={{
          color: TONE_ICON_COLOR[tone],
          marginTop: inline ? '1px' : '2px',
          flexShrink: 0,
          display: 'inline-flex',
        }}
      >
        {icon}
      </span>
    )}
    <div className="flex-1 min-w-0">
      {title && (
        <div
          style={{
            fontFamily: 'var(--bm-font-display)',
            fontSize: 'var(--bm-text-sm)',
            fontWeight: 600,
            color: 'var(--bm-text-heading)',
            fontStyle: 'italic',
            letterSpacing: 'var(--bm-tracking-tight)',
            marginBottom: '4px',
          }}
        >
          {title}
        </div>
      )}
      <div
        style={{
          fontSize: 'var(--bm-text-sm)',
          color: 'var(--bm-text-secondary)',
          lineHeight: 'var(--bm-leading-relaxed)',
          fontFamily: 'var(--bm-font-display)',
          fontStyle: 'italic',
          letterSpacing: 'var(--bm-tracking-tight)',
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

export default Callout;