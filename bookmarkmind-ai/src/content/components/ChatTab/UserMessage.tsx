// ============================================================
// UserMessage — user message bubble (right-aligned, primary color)
// ============================================================

import React from 'react';
import type { ChatMessage } from '@shared/types';
import { useContentStore } from '@content/store/contentStore';

interface UserMessageProps {
  message: ChatMessage;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const panelSize = useContentStore((s) => s.panelSize);
  const maxWidth = panelSize.width - 48;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    maxWidth: '100%',
    animation: 'bm-fade-in var(--bm-duration-fast) var(--bm-ease-out)',
  };

  const bubbleStyle: React.CSSProperties = {
    maxWidth: `${maxWidth}px`,
    backgroundColor: 'var(--bm-primary-500)',
    borderRadius: '12px 12px 4px 12px',
    padding: 'var(--bm-space-3) var(--bm-space-4)',
    fontSize: 'var(--bm-text-base)',
    fontWeight: 400,
    color: 'white',
    lineHeight: 'var(--bm-leading-relaxed)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  return (
    <div style={containerStyle}>
      <div style={bubbleStyle}>{message.content}</div>
    </div>
  );
};

export default UserMessage;
