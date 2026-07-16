import React from 'react';

export type InputType = 'text' | 'password' | 'number';
export type InputSize = 'sm' | 'md';

export interface InputProps {
  /** Label text rendered above the input */
  label?: string;
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Input type */
  type?: InputType;
  /** Error message — when present, border turns red */
  error?: string;
  /** Icon rendered at the start (left) of the input */
  prefixIcon?: React.ReactNode;
  /** Icon rendered at the end (right) of the input */
  suffixIcon?: React.ReactNode;
  /** Disable the input */
  disabled?: boolean;
  /** Control height: sm = 32px, md = 36px (default) */
  inputSize?: InputSize;
  /** Additional CSS classes */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
  /** Input name attribute */
  name?: string;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

const sizeMap: Record<InputSize, { height: string; paddingX: string }> = {
  sm: { height: '32px', paddingX: 'var(--bm-space-3)' },
  md: { height: '36px', paddingX: 'var(--bm-space-3)' },
};

/**
 * Input — Text input with label, error state, and icon slots.
 *
 * Border: 1px solid var(--bm-gray-200) by default,
 *        1px solid var(--bm-primary-500) on focus + box-shadow var(--bm-shadow-focus),
 *        1px solid var(--bm-error-500) when error is set.
 */
export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  prefixIcon,
  suffixIcon,
  disabled = false,
  inputSize = 'md',
  className = '',
  style,
  name,
  autoFocus,
}) => {
  const inputId = React.useId();

  const { height, paddingX } = sizeMap[inputSize];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--bm-space-1)',
    width: '100%',
    ...style,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 'var(--bm-font-medium)',
    color: 'var(--bm-gray-600)',
    lineHeight: 'var(--bm-leading-tight)',
  };

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height,
    borderRadius: 'var(--bm-radius-md)',
    border: `1px solid ${error ? 'var(--bm-error-500)' : 'var(--bm-gray-200)'}`,
    backgroundColor: disabled ? 'var(--bm-gray-50)' : 'var(--bm-gray-0)',
    transition: `border-color var(--bm-duration-fast) var(--bm-ease-out), box-shadow var(--bm-duration-fast) var(--bm-ease-out)`,
    boxShadow: error ? '0 0 0 3px rgba(226, 75, 74, 0.15)' : 'none',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-base)',
    color: disabled ? 'var(--bm-gray-400)' : 'var(--bm-gray-800)',
    lineHeight: 'var(--bm-leading-normal)',
    paddingLeft: prefixIcon ? `var(--bm-space-1)` : paddingX,
    paddingRight: suffixIcon ? `var(--bm-space-1)` : paddingX,
  };

  const iconSlotStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--bm-gray-400)',
  };

  const errorStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-xs)',
    color: 'var(--bm-error-500)',
    lineHeight: 'var(--bm-leading-tight)',
  };

  return (
    <div className={className} style={containerStyle}>
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}
      <div
        style={wrapperStyle}
        onFocusCapture={(e) => {
          if (!error && !disabled) {
            e.currentTarget.style.borderColor = 'var(--bm-primary-500)';
            e.currentTarget.style.boxShadow = 'var(--bm-shadow-focus)';
          }
        }}
        onBlurCapture={(e) => {
          if (!error && !disabled) {
            e.currentTarget.style.borderColor = 'var(--bm-gray-200)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
      >
        {prefixIcon && <span style={{ paddingLeft: paddingX, ...iconSlotStyle }}>{prefixIcon}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          style={inputStyle}
        />
        {suffixIcon && <span style={{ paddingRight: paddingX, ...iconSlotStyle }}>{suffixIcon}</span>}
      </div>
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};

export default Input;
