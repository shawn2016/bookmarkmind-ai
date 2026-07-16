import React from 'react';

export interface SliderProps {
  /** Current value */
  value: number;
  /** Minimum value */
  min: number;
  /** Maximum value */
  max: number;
  /** Step increment */
  step?: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Label text */
  label?: string;
  /** Show the numeric value next to the label */
  showValue?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Disable the slider */
  disabled?: boolean;
}

/**
 * Slider — Range slider with styled track and thumb.
 *
 * Track: 4px height, bg var(--bm-gray-200), filled portion var(--bm-primary-500)
 * Thumb: 16px circle, white fill, 2px solid var(--bm-primary-500), shadow on hover
 */
export const Slider: React.FC<SliderProps> = ({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
  showValue = false,
  className = '',
  disabled = false,
}) => {
  const sliderId = React.useId();

  // Calculate fill percentage
  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--bm-space-2)',
    width: '100%',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: label || showValue ? 'space-between' : 'flex-start',
    alignItems: 'center',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 'var(--bm-font-medium)',
    color: disabled ? 'var(--bm-gray-400)' : 'var(--bm-gray-600)',
    lineHeight: 'var(--bm-leading-tight)',
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-mono)',
    fontSize: 'var(--bm-text-sm)',
    color: 'var(--bm-gray-500)',
    lineHeight: 'var(--bm-leading-tight)',
  };

  const trackOuterStyle: React.CSSProperties = {
    position: 'relative',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const trackStyle: React.CSSProperties = {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    backgroundColor: 'var(--bm-gray-200)',
    position: 'relative',
  };

  const filledTrackStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '4px',
    borderRadius: '2px',
    backgroundColor: disabled ? 'var(--bm-gray-400)' : 'var(--bm-primary-500)',
    width: `${percentage}%`,
    transition: `width var(--bm-duration-fast) var(--bm-ease-out)`,
  };

  const thumbWrapperStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: `${percentage}%`,
    transform: 'translate(-50%, -50%)',
  };

  const thumbStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: 'var(--bm-radius-full)',
    backgroundColor: 'var(--bm-gray-0)',
    border: `2px solid ${disabled ? 'var(--bm-gray-400)' : 'var(--bm-primary-500)'}`,
    boxShadow: 'var(--bm-shadow-ball)',
    cursor: disabled ? 'not-allowed' : 'grab',
    transition: `box-shadow var(--bm-duration-fast) var(--bm-ease-out)`,
    boxSizing: 'border-box',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className={className} style={containerStyle}>
      {(label || showValue) && (
        <div style={headerStyle}>
          {label && <label htmlFor={sliderId} style={labelStyle}>{label}</label>}
          {showValue && <span style={valueStyle}>{value}</span>}
        </div>
      )}
      <div style={trackOuterStyle}>
        <div style={trackStyle}>
          <div style={filledTrackStyle} />
          <div style={thumbWrapperStyle}>
            <div style={thumbStyle} />
          </div>
        </div>
        {/* Hidden native input for accessibility */}
        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            margin: 0,
          }}
        />
      </div>
    </div>
  );
};

export default Slider;
