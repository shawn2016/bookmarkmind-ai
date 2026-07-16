// ============================================================
// ChatEmptyState — shown when AI is not yet configured
// ============================================================

import React, { useCallback } from 'react';
import { MessageSquareOff } from 'lucide-react';
import { safeOpenOptionsPage } from '@shared/utils/chrome-api';

export const ChatEmptyState: React.FC = () => {
  const handleGoSettings = useCallback(() => {
    safeOpenOptionsPage();
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: 'var(--bm-space-6)',
    gap: 'var(--bm-space-4)',
    textAlign: 'center',
  };

  const iconWrapStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--bm-radius-full)',
    backgroundColor: 'var(--bm-gray-100)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-md)',
    fontWeight: 600,
    color: 'var(--bm-gray-700)',
  };

  const descStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-sm)',
    color: 'var(--bm-gray-400)',
    lineHeight: 'var(--bm-leading-normal)',
  };

  const btnStyle: React.CSSProperties = {
    padding: '8px 20px',
    backgroundColor: 'var(--bm-primary-500)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--bm-radius-md)',
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform var(--bm-duration-fast) var(--bm-ease-spring)',
  };

  return (
    <div style={containerStyle}>
      <div style={iconWrapStyle}>
        <MessageSquareOff size={24} color="var(--bm-gray-300)" />
      </div>
      <div style={titleStyle}>AI 尚未配置</div>
      <div style={descStyle}>请在设置中配置 AI 模型 API Key</div>
      <button
        style={btnStyle}
        onClick={handleGoSettings}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
      >
        前往设置
      </button>
    </div>
  );
};

export default ChatEmptyState;
