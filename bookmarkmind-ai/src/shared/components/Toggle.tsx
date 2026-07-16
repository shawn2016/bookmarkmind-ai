import React from 'react';

export interface ToggleProps {
  /** Whether the toggle is on */
  checked: boolean;
  /** Change handler */
  onChange: (value: boolean) => void;
  /** Label text rendered next to the toggle */
  label?: string;
  /** Disable the toggle */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Toggle — Switch component with spring-animated knob.
 *
 * Dimensions: 36px × 20px track, 16px white circle knob.
 * On:  background = var(--bm-primary-500)
 * Off: background = var(--bm-gray-300)
 *
 * Track transition: background var(--bm-duration-fast) var(--bm-ease-out)
 * Knob transition:  transform var(--bm-duration-fast) var(--bm-ease-spring)
 */
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  const toggleId = React.useId();

  const trackStyle: React.CSSProperties = {
    position: 'relative',
    width: '36px',
    height: '20px',
    borderRadius: 'var(--bm-radius-full)',
    backgroundColor: checked ? 'var(--bm-primary-500)' : 'var(--bm-gray-300)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: `background var(--bm-duration-fast) var(--bm-ease-out)`,
    flexShrink: 0,
  };

  const knobStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '16px',
    height: '16px',
    borderRadius: 'var(--bm-radius-full)',
    backgroundColor: 'var(--bm-gray-0)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    transform: checked ? 'translateX(16px)' : 'translateX(0)',
    transition: `transform var(--bm-duration-fast) var(--bm-ease-spring)`,
  };

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--bm-space-2)',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-base)',
    color: disabled ? 'var(--bm-gray-400)' : 'var(--bm-gray-700)',
    lineHeight: 'var(--bm-leading-tight)',
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={className} style={containerStyle}>
      <div
        id={toggleId}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        style={trackStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div style={knobStyle} />
      </div>
      {label && (
        <label htmlFor={toggleId} style={labelStyle}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Toggle;
