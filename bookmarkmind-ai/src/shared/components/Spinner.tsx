import React from 'react';

export interface SpinnerProps {
  /** Size in pixels (default 20) */
  size?: number;
  /** Stroke color (default var(--bm-primary-500)) */
  color?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Spinner — SVG loading indicator with 360° rotation animation.
 *
 * Animation: rotate 0 → 360deg, 0.8s linear infinite.
 * The arc is drawn with a 270° sweep and dasharray to create the tail effect.
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 20,
  color = 'var(--bm-primary-500)',
  className = '',
}) => {
  const strokeWidth = Math.max(2, size * 0.12);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75; // 270° arc

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    animation: 'bm-spin 0.8s linear infinite',
  };

  return (
    <span className={className} style={containerStyle} role="status" aria-label="Loading">
      <style>{`
        @keyframes bm-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={circumference * 0.25}
          opacity={0.2}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={circumference * 0.25}
          style={{
            animation: 'bm-spin-dash 0.8s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes bm-spin-dash {
            0% { stroke-dashoffset: ${circumference * 0.25}; }
            50% { stroke-dashoffset: ${circumference * 0.85}; }
            100% { stroke-dashoffset: ${circumference * 0.25}; }
          }
        `}</style>
      </svg>
    </span>
  );
};

export default Spinner;
