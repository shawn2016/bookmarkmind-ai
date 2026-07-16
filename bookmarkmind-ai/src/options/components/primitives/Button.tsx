/* ============================================================
   Primitive — Button
   统一按钮：3 个 variant（primary / danger / ghost）+ 2 个 size
   ============================================================ */

import React from 'react';

export type ButtonVariant = 'primary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md';

interface ButtonProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  ariaLabel?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  style?: React.CSSProperties;
}

const VARIANT_STYLE: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background:
      'linear-gradient(135deg, var(--bm-amber-500) 0%, var(--bm-primary-500) 100%)',
    color: 'var(--bm-text-on-accent)',
    border: '1px solid var(--bm-accent-30)',
    boxShadow: '0 1px 3px var(--bm-accent-25), inset 0 1px 0 rgba(255,255,255,0.18)',
  },
  danger: {
    background: 'var(--bm-error-50)',
    color: 'var(--bm-state-error)',
    border: '1px solid var(--bm-error-100)',
  },
  ghost: {
    background: 'var(--bm-bg-elevated)',
    color: 'var(--bm-text-secondary)',
    border: '1px solid var(--bm-border-subtle)',
  },
};

const SIZE_STYLE: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 'var(--bm-text-sm)' },
  md: { padding: '8px 14px', fontSize: 'var(--bm-text-sm)' },
};

export const Button: React.FC<ButtonProps> = ({
  icon,
  children,
  onClick,
  variant = 'ghost',
  size = 'md',
  ariaLabel,
  disabled,
  type = 'button',
  className,
  style,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel ?? (typeof children === 'string' ? children : undefined)}
    className={`flex items-center gap-bm-2 rounded-bm-md outline-none ${className ?? ''}`}
    style={{
      ...SIZE_STYLE[size],
      ...VARIANT_STYLE[variant],
      fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all .22s var(--bm-ease-out)',
      ...style,
    }}
    onMouseDown={(e) => {
      if (!disabled) e.currentTarget.style.transform = 'scale(0.97)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {icon}
    <span>{children}</span>
  </button>
);

export default Button;