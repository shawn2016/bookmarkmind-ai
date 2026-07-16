import React from 'react';

export interface EmptyStateProps {
  /** Optional icon element */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button element rendered below description */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmptyState — Centered placeholder for empty lists, search results, etc.
 *
 * Icon: 48px rendered in var(--bm-gray-300) if a raw element is passed
 * Title: var(--bm-text-md), font-weight 600, color var(--bm-gray-700)
 * Description: var(--bm-text-sm), color var(--bm-gray-400)
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--bm-space-12) var(--bm-space-6)',
    textAlign: 'center',
  };

  const iconWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    marginBottom: 'var(--bm-space-4)',
    color: 'var(--bm-gray-300)',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-md)',
    fontWeight: 'var(--bm-font-semibold)',
    color: 'var(--bm-gray-700)',
    lineHeight: 'var(--bm-leading-tight)',
    marginBottom: description ? 'var(--bm-space-1)' : 0,
  };

  const descriptionStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-sm)',
    color: 'var(--bm-gray-400)',
    lineHeight: 'var(--bm-leading-normal)',
    maxWidth: '280px',
    marginBottom: action ? 'var(--bm-space-5)' : 0,
  };

  return (
    <div className={className} style={containerStyle}>
      {icon && <div style={iconWrapperStyle}>{icon}</div>}
      <p style={titleStyle}>{title}</p>
      {description && <p style={descriptionStyle}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
