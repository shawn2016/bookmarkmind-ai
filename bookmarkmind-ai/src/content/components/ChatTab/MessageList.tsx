// ============================================================
// MessageList — scrollable chat message list
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useContentStore } from '@content/store/contentStore';
import { AIMessage } from '@content/components/ChatTab/AIMessage';
import { UserMessage } from '@content/components/ChatTab/UserMessage';
import { TypingIndicator } from '@content/components/ChatTab/TypingIndicator';

export const MessageList: React.FC = () => {
  const messages = useContentStore((s) => s.messages);
  const isStreaming = useContentStore((s) => s.isStreaming);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const isAutoScroll = useRef(true);

  useEffect(() => {
    if (isAutoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    setIsScrolledUp(!isAtBottom);
    isAutoScroll.current = isAtBottom;
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      isAutoScroll.current = true;
      setIsScrolledUp(false);
    }
  }, []);

  const wrapperStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const containerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--bm-space-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--bm-space-3)',
  };

  const scrollBtnStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '6px 14px',
    backgroundColor: 'var(--bm-primary-500)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--bm-radius-full)',
    fontSize: 'var(--bm-text-xs)',
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: 'var(--bm-shadow-card)',
    zIndex: 5,
    whiteSpace: 'nowrap',
    animation: 'bm-fade-in var(--bm-duration-fast) var(--bm-ease-out)',
  };

  return (
    <div style={wrapperStyle}>
      <div
        ref={scrollRef}
        className="bm-scrollbar"
        style={containerStyle}
        onScroll={handleScroll}
      >
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <UserMessage key={msg.id} message={msg} />
          ) : (
            <AIMessage key={msg.id} message={msg} />
          ),
        )}

        {isStreaming &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && (
            <TypingIndicator />
          )}
      </div>

      {isScrolledUp && (
        <button style={scrollBtnStyle} onClick={scrollToBottom}>
          ↓ 新消息
        </button>
      )}
    </div>
  );
};

export default MessageList;
