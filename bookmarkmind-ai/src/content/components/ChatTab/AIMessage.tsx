// ============================================================
// AIMessage — AI assistant message bubble
// ============================================================

import React from 'react';
import { Bot } from 'lucide-react';
import type { ChatMessage } from '@shared/types';
import { BookmarkResultCard } from '@content/components/ChatTab/BookmarkResultCard';
import { useContentStore } from '@content/store/contentStore';

interface AIMessageProps {
  message: ChatMessage;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const panelSize = useContentStore((s) => s.panelSize);
  const maxWidth = panelSize.width - 48;

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--bm-space-2)',
    maxWidth: `${maxWidth}px`,
    animation: 'bm-fade-in var(--bm-duration-fast) var(--bm-ease-out)',
  };

  const avatarStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    minWidth: '28px',
    borderRadius: 'var(--bm-radius-full)',
    backgroundColor: 'var(--bm-primary-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const bubbleStyle: React.CSSProperties = {
    backgroundColor: 'var(--bm-gray-100)',
    borderRadius: '12px 12px 12px 4px',
    padding: 'var(--bm-space-3) var(--bm-space-4)',
    fontSize: 'var(--bm-text-base)',
    fontWeight: 400,
    color: 'var(--bm-gray-700)',
    lineHeight: 'var(--bm-leading-relaxed)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    flex: 1,
  };

  const streamingStyle: React.CSSProperties = {
    display: 'inline-block',
    width: '1px',
    height: '1em',
    backgroundColor: 'var(--bm-primary-500)',
    marginLeft: '1px',
    verticalAlign: 'text-bottom',
    animation: 'bm-blink 530ms infinite',
  };

  return (
    <div style={containerStyle}>
      <div style={avatarStyle}>
        <Bot size={14} color="var(--bm-primary-500)" />
      </div>
      <div>
        <div style={bubbleStyle}>
          {message.content || (message.isStreaming ? '' : '...')}
          {message.isStreaming && <span style={streamingStyle} />}
        </div>

        {/* Bookmark result cards */}
        {message.bookmarkResults && message.bookmarkResults.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--bm-space-2)',
              marginTop: 'var(--bm-space-2)',
            }}
          >
            {message.bookmarkResults.map((result) => (
              <BookmarkResultCard key={result.id} result={result} />
            ))}
          </div>
        )}

        {/* Error indicator */}
        {message.error && (
          <div
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-error-500)',
              marginTop: 'var(--bm-space-1)',
            }}
          >
            {message.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIMessage;
