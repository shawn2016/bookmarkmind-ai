/* ============================================================
   Primitive — StatCard
   统计卡片：图标方块（语义色底）+ 大数值 + 标签
   用于数据管理 section
   ============================================================ */

import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  /** 强调色（控制图标底色 + 数值色） */
  tone?: 'amber' | 'success' | 'info' | 'warning';
}

const TONE_BG: Record<NonNullable<StatCardProps['tone']>, string> = {
  amber:   'var(--bm-accent-10)',
  success: 'rgba(136,198,110,0.12)',
  info:    'rgba(139,151,214,0.12)',
  warning: 'rgba(232,184,109,0.12)',
};

const TONE_FG: Record<NonNullable<StatCardProps['tone']>, string> = {
  amber:   'var(--bm-amber-500)',
  success: 'var(--bm-state-success)',
  info:    'var(--bm-state-info)',
  warning: 'var(--bm-state-warning)',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  suffix,
  tone = 'amber',
}) => (
  <div
    className="flex items-center gap-bm-3 p-bm-4 rounded-bm-lg"
    style={{
      background: 'var(--bm-bg-elevated)',
      border: '1px solid var(--bm-border-subtle)',
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: 'var(--bm-radius-md)',
        background: TONE_BG[tone],
        color: TONE_FG[tone],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <div
        style={{
          fontFamily: 'var(--bm-font-display)',
          fontSize: 'var(--bm-text-xl)',
          fontWeight: 600,
          color: 'var(--bm-text-heading)',
          lineHeight: 1.2,
          letterSpacing: 'var(--bm-tracking-tight)',
        }}
      >
        {value}
        {suffix && (
          <span
            style={{
              fontSize: 'var(--bm-text-sm)',
              fontWeight: 400,
              color: 'var(--bm-text-muted)',
              marginLeft: '4px',
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 'var(--bm-text-xs)',
          color: 'var(--bm-text-secondary)',
          marginTop: '2px',
        }}
      >
        {label}
      </div>
    </div>
  </div>
);

export default StatCard;