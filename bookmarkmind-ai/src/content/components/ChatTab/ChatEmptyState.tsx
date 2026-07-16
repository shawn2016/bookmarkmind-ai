// ============================================================
// ChatEmptyState — AI 未配置 / 未选模型
// ============================================================

import React, { useCallback } from 'react';
import { MessageSquareOff } from 'lucide-react';
import { safeOpenOptionsPage } from '@shared/utils/chrome-api';

interface ChatEmptyStateProps {
  hasCredentials: boolean;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  hasCredentials,
}) => {
  const handleGoSettings = useCallback(() => {
    safeOpenOptionsPage();
  }, []);

  const title = hasCredentials ? '请先选择模型' : 'AI 尚未配置';
  const desc = hasCredentials
    ? '测试连接成功后，从下拉列表中选择一个默认模型即可使用 AI 对话'
    : '不配置 AI 也可以正常收藏书签。配置后可使用智能分类和对话';

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
    maxWidth: '260px',
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
      <div style={titleStyle}>{title}</div>
      <div style={descStyle}>{desc}</div>
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
