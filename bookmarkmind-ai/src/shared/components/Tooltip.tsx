import React from 'react';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip text content */
  content: string;
  /** The element that triggers the tooltip on hover */
  children: React.ReactNode;
  /** Preferred position relative to children */
  position?: TooltipPosition;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

const positionStyles: Record<TooltipPosition, React.CSSProperties> = {
  top: {
    bottom: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  bottom: {
    top: 'calc(100% + 6px)',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  left: {
    right: 'calc(100% + 6px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  right: {
    left: 'calc(100% + 6px)',
    top: '50%',
    transform: 'translateY(-50%)',
  },
};

const arrowStyles: Record<TooltipPosition, React.CSSProperties> = {
  top: {
    top: '100%',
    left: '50%',
    marginLeft: '-4px',
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderTop: '4px solid var(--bm-gray-900)',
  },
  bottom: {
    bottom: '100%',
    left: '50%',
    marginLeft: '-4px',
    borderLeft: '4px solid transparent',
    borderRight: '4px solid transparent',
    borderBottom: '4px solid var(--bm-gray-900)',
  },
  left: {
    left: '100%',
    top: '50%',
    marginTop: '-4px',
    borderTop: '4px solid transparent',
    borderBottom: '4px solid transparent',
    borderLeft: '4px solid var(--bm-gray-900)',
  },
  right: {
    right: '100%',
    top: '50%',
    marginTop: '-4px',
    borderTop: '4px solid transparent',
    borderBottom: '4px solid transparent',
    borderRight: '4px solid var(--bm-gray-900)',
  },
};

/**
 * Tooltip — Simple hover tooltip positioned relative to children.
 *
 * Dark background (var(--bm-gray-900)), white text, var(--bm-text-sm).
 * Appears with opacity 0 → 1 over 150ms.
 * Uses pure CSS absolute positioning — no portal.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [visible, setVisible] = React.useState(false);

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
  };

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 'var(--bm-z-dropdown)',
    padding: '4px 8px',
    maxWidth: '200px',
    backgroundColor: 'var(--bm-gray-900)',
    color: 'var(--bm-gray-0)',
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-sm)',
    lineHeight: 'var(--bm-leading-tight)',
    borderRadius: 'var(--bm-radius-sm)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    pointerEvents: 'none',
    opacity: visible ? 1 : 0,
    transition: `opacity var(--bm-duration-fast) var(--bm-ease-out)`,
    ...positionStyles[position],
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    ...arrowStyles[position],
  };

  return (
    <div
      className={className}
      style={wrapperStyle}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={tooltipStyle}>
          {content}
          <div style={arrowStyle} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
