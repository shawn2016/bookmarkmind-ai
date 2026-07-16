/* ============================================================
   Primitive — Toggle
   唯一开关样式：amber 渐变 + 琥珀光晕（开）/ 灰底 inset 阴影（关）
   支持 tone: 'amber' (默认) | 'success' | 'error' | 'info' | 'warning'
   ============================================================ */

import React, { useId } from 'react';

export type ToggleTone = 'amber' | 'success' | 'error' | 'info' | 'warning';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  /** 屏幕阅读器标签（必填，保证 a11y） */
  ariaLabel: string;
  /** 语义色调 — 默认琥珀（无强调），按通知分类选择 */
  tone?: ToggleTone;
  disabled?: boolean;
}

const TONE_ACTIVE: Record<ToggleTone, string> = {
  amber:   'linear-gradient(135deg, var(--bm-amber-500) 0%, var(--bm-primary-500) 100%)',
  success: 'var(--bm-state-success)',
  error:   'var(--bm-state-error)',
  info:    'var(--bm-state-info)',
  warning: 'var(--bm-state-warning)',
};

const TONE_RING: Record<ToggleTone, string> = {
  amber:   'var(--bm-accent-40)',
  success: 'rgba(136,198,110,0.40)',
  error:   'rgba(224,133,133,0.40)',
  info:    'rgba(139,151,214,0.40)',
  warning: 'rgba(232,184,109,0.40)',
};

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  ariaLabel,
  tone = 'amber',
  disabled,
}) => {
  const id = useId();
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className="relative rounded-bm-full outline-none flex-shrink-0"
      style={{
        width: '40px',
        height: '22px',
        background: checked ? TONE_ACTIVE[tone] : 'var(--bm-bg-elevated)',
        border: checked
          ? `1px solid ${TONE_RING[tone]}`
          : '1px solid var(--bm-border-strong)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all var(--bm-duration-fast) var(--bm-ease-default)',
        boxShadow: checked
          ? `0 1px 3px ${TONE_RING[tone]}, inset 0 1px 1px rgba(255,255,255,0.20)`
          : 'inset 0 1px 2px rgba(0,0,0,0.20)',
      }}
    >
      <span
        className="absolute rounded-bm-full"
        style={{
          width: '16px',
          height: '16px',
          top: '2px',
          left: checked ? '20px' : '2px',
          background: 'var(--bm-bg-input)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          transition: 'left var(--bm-duration-fast) var(--bm-ease-spring)',
        }}
      />
    </button>
  );
};

/* ============================================================
   ToggleRow — Field + Toggle 的封装（用于个人化、通知等单行设置）
   ============================================================ */

interface ToggleRowProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
  tone?: ToggleTone;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  icon,
  title,
  description,
  checked,
  onChange,
  ariaLabel,
  tone = 'amber',
}) => (
  <div
    className="flex items-center justify-between gap-bm-3"
    style={{ padding: '8px 0' }}
  >
    <div className="flex items-start gap-bm-2 flex-1 min-w-0">
      {icon && (
        <span
          style={{
            color: checked ? 'var(--bm-text-accent)' : 'var(--bm-text-muted)',
            marginTop: '1px',
            transition: 'color .22s var(--bm-ease-out)',
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <div
          style={{
            fontSize: 'var(--bm-text-md)',
            fontWeight: 500,
            color: 'var(--bm-text-heading)',
            lineHeight: 'var(--bm-leading-snug)',
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-text-secondary)',
              lineHeight: 'var(--bm-leading-relaxed)',
              marginTop: '2px',
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
    <Toggle
      checked={checked}
      onChange={onChange}
      ariaLabel={ariaLabel}
      tone={tone}
    />
  </div>
);

export default Toggle;