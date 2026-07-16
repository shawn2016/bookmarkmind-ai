import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Optional icon node rendered before children */
  icon?: React.ReactNode;
  /** Show a loading spinner and disable interaction */
  loading?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Button label / content */
  children?: React.ReactNode;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Additional CSS classes */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    height: '28px',
    padding: '0 var(--bm-space-3)',
    fontSize: 'var(--bm-text-sm)',
    borderRadius: 'var(--bm-radius-sm)',
    gap: 'var(--bm-space-1)',
  },
  md: {
    height: '34px',
    padding: '0 var(--bm-space-4)',
    fontSize: 'var(--bm-text-base)',
    borderRadius: 'var(--bm-radius-md)',
    gap: 'var(--bm-space-2)',
  },
  lg: {
    height: '40px',
    padding: '0 var(--bm-space-5)',
    fontSize: 'var(--bm-text-md)',
    borderRadius: 'var(--bm-radius-md)',
    gap: 'var(--bm-space-2)',
  },
};

const variantBaseStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--bm-primary-500)',
    color: 'var(--bm-gray-0)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--bm-gray-700)',
    border: '1px solid var(--bm-gray-200)',
  },
  danger: {
    backgroundColor: 'var(--bm-error-500)',
    color: 'var(--bm-gray-0)',
    border: 'none',
  },
  text: {
    backgroundColor: 'transparent',
    color: 'var(--bm-gray-700)',
    border: 'none',
    paddingLeft: 'var(--bm-space-2)',
    paddingRight: 'var(--bm-space-2)',
  },
};

/**
 * Button — Unified button with 4 variants, sizes, loading state, and spring animation.
 *
 * Interactive behaviour:
 * - :active → transform: scale(0.97) with spring easing
 * - Hover primary → --bm-primary-600 background
 * - Hover secondary → --bm-gray-100 background
 * - Hover danger → --bm-error-600 background
 * - Hover text → --bm-gray-100 background
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  children,
  onClick,
  className = '',
  style,
}) => {
  const isDisabled = disabled || loading;

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--bm-font-sans)',
    fontWeight: 'var(--bm-font-medium)',
    lineHeight: 'var(--bm-leading-tight)',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    transition: `transform var(--bm-duration-fast) var(--bm-ease-spring), background var(--bm-duration-fast) var(--bm-ease-out), box-shadow var(--bm-duration-fast) var(--bm-ease-out)`,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...variantBaseStyles[variant],
    ...(variant === 'text' ? sizeStyles[size] : {}),
    ...style,
  };

  const hoverStyle = !isDisabled
    ? (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.currentTarget;
        if (variant === 'primary') {
          target.style.backgroundColor = 'var(--bm-primary-600)';
        } else if (variant === 'secondary' || variant === 'text') {
          target.style.backgroundColor = 'var(--bm-gray-100)';
        } else if (variant === 'danger') {
          target.style.backgroundColor = 'var(--bm-error-600)';
        }
      }
    : undefined;

  const leaveStyle = !isDisabled
    ? (e: React.MouseEvent<HTMLButtonElement>) => {
        const target = e.currentTarget;
        target.style.backgroundColor = variantBaseStyles[variant].backgroundColor ?? '';
      }
    : undefined;

  const activeStyle = !isDisabled
    ? (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(0.97)';
      }
    : undefined;

  const resetActiveStyle = !isDisabled
    ? (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.transform = 'scale(1)';
      }
    : undefined;

  return (
    <button
      type="button"
      className={className}
      style={baseStyle}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={hoverStyle}
      onMouseLeave={(e) => {
        leaveStyle?.(e);
        resetActiveStyle?.(e);
      }}
      onMouseDown={activeStyle}
      onMouseUp={resetActiveStyle}
    >
      {loading && (
        <span
          style={{
            display: 'inline-flex',
            animation: 'bm-spin 0.8s linear infinite',
          }}
        >
          <svg
            width={size === 'sm' ? 12 : 14}
            height={size === 'sm' ? 12 : 14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </span>
      )}
      {!loading && icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
