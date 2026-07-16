// ============================================================
// ChatTab — main chat container
// ============================================================

import React, { useEffect } from 'react';
import { useContentStore } from '@content/store/contentStore';
import { useBookmarks } from '@content/hooks/useBookmarks';
import { MessageList } from '@content/components/ChatTab/MessageList';
import { ChatInput } from '@content/components/ChatTab/ChatInput';
import { ChatEmptyState } from '@content/components/ChatTab/ChatEmptyState';

export const ChatTab: React.FC = () => {
  const aiConfigured = useContentStore((s) => s.aiConfigured);
  const hasAiCredentials = useContentStore((s) => s.hasAiCredentials);
  const { loadBookmarks } = useBookmarks();

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  if (!aiConfigured) {
    return <ChatEmptyState hasCredentials={hasAiCredentials} />;
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  return (
    <div style={containerStyle} data-testid="chat-tab">
      <MessageList />
      <ChatInput />
    </div>
  );
};

export default ChatTab;
