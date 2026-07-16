// ============================================================
// ChatInput — message input with auto-resize and send
// ============================================================

import React, { useCallback, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';
import { useChat } from '@content/hooks/useChat';

export const ChatInput: React.FC = () => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = useContentStore((s) => s.isStreaming);
  const { sendMessage } = useChat();

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    sendMessage({ text: trimmed });
    setText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);

      // Auto-resize
      const ta = e.target;
      ta.style.height = 'auto';
      const maxH = 4 * 20; // 4 rows at ~20px line height
      ta.style.height = `${Math.min(ta.scrollHeight, maxH)}px`;
    },
    [],
  );

  const canSend = text.trim().length > 0 && !isStreaming;

  const containerStyle: React.CSSProperties = {
    borderTop: '1px solid var(--bm-gray-200)',
    padding: 'var(--bm-space-3)',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--bm-space-2)',
    backgroundColor: 'var(--bm-gray-0)',
  };

  const textareaStyle: React.CSSProperties = {
    flex: 1,
    resize: 'none' as const,
    fontSize: 'var(--bm-text-base)',
    fontFamily: 'var(--bm-font-sans)',
    fontWeight: 400,
    color: 'var(--bm-gray-700)',
    lineHeight: 'var(--bm-leading-normal)',
    padding: 'var(--bm-space-2) var(--bm-space-3)',
    backgroundColor: 'var(--bm-gray-50)',
    borderRadius: 'var(--bm-radius-md)',
    border: '1px solid var(--bm-gray-200)',
    outline: 'none',
    maxHeight: '88px',
    minHeight: '36px',
    overflow: 'hidden',
    transition: 'border-color var(--bm-duration-fast)',
  };

  const textareaFocusStyle: React.CSSProperties = {
    ...textareaStyle,
    borderColor: 'var(--bm-primary-500)',
    backgroundColor: 'var(--bm-gray-0)',
  };

  const [isFocused, setIsFocused] = useState(false);

  const sendBtnStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    minWidth: '32px',
    border: 'none',
    borderRadius: 'var(--bm-radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: canSend ? 'pointer' : 'not-allowed',
    backgroundColor: canSend
      ? 'var(--bm-primary-500)'
      : 'var(--bm-gray-200)',
    color: canSend ? 'white' : 'var(--bm-gray-400)',
    transition:
      'background var(--bm-duration-fast), transform var(--bm-duration-fast) var(--bm-ease-spring)',
  };

  return (
    <div style={containerStyle}>
      <textarea
        ref={textareaRef}
        style={isFocused ? textareaFocusStyle : textareaStyle}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="输入消息，搜索书签或对话..."
        rows={1}
        disabled={isStreaming}
        data-testid="chat-input"
      />
      <button
        style={sendBtnStyle}
        onClick={handleSend}
        disabled={!canSend}
        onMouseDown={(e) => {
          if (canSend) {
            (e.currentTarget as HTMLButtonElement).style.transform =
              'scale(0.92)';
          }
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
        aria-label="发送"
        title="发送 (Enter)"
        data-testid="chat-send-btn"
      >
        <Send size={16} />
      </button>
    </div>
  );
};

export default ChatInput;
