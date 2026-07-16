// ============================================================
// TypingIndicator — three-dot bouncing animation
// ============================================================

import React from 'react';
import { useContentStore } from '@content/store/contentStore';

export const TypingIndicator: React.FC = () => {
  const panelSize = useContentStore((s) => s.panelSize);
  const maxWidth = panelSize.width - 48;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--bm-space-2)',
    maxWidth: `${maxWidth}px`,
    animation: 'bm-fade-in var(--bm-duration-fast) var(--bm-ease-out)',
  };

  const bubbleStyle: React.CSSProperties = {
    backgroundColor: 'var(--bm-gray-100)',
    borderRadius: '12px 12px 12px 4px',
    padding: 'var(--bm-space-3) var(--bm-space-4)',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    minWidth: '60px',
  };

  const dotBaseStyle: React.CSSProperties = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: 'var(--bm-gray-400)',
    animation: 'bm-bounce-dot 1.2s infinite ease-in-out',
  };

  const dot1Style: React.CSSProperties = {
    ...dotBaseStyle,
    animationDelay: '0ms',
  };

  const dot2Style: React.CSSProperties = {
    ...dotBaseStyle,
    animationDelay: '150ms',
  };

  const dot3Style: React.CSSProperties = {
    ...dotBaseStyle,
    animationDelay: '300ms',
  };

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>
        <span style={dot1Style} />
        <span style={dot2Style} />
        <span style={dot3Style} />
      </div>
    </div>
  );
};

export default TypingIndicator;
