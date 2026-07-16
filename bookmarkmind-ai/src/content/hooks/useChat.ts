// ============================================================
// useChat — AI chat hook with background communication
// ============================================================

import { useCallback } from "react";
import { useContentStore, nextMessageId } from "@content/store/contentStore";
import type { ChatMessage, BookmarkSearchResult } from "@shared/types";
import { safeSendMessage } from "@shared/utils/chrome-api";

interface ChatSendOptions {
  text: string;
}

/** 传给 AI 的最近对话轮数上限（user+assistant 各算一条） */
const MAX_CHAT_HISTORY = 20;
/** 单条历史消息最大字符，避免 token 爆炸 */
const MAX_HISTORY_MSG_CHARS = 2000;

function buildChatHistory(
  messages: ChatMessage[],
): { role: 'user' | 'assistant'; content: string }[] {
  return messages
    .filter(
      (m) =>
        (m.role === 'user' || m.role === 'assistant') &&
        !m.isStreaming &&
        m.content.trim(),
    )
    .slice(-MAX_CHAT_HISTORY)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content:
        m.content.length > MAX_HISTORY_MSG_CHARS
          ? `${m.content.slice(0, MAX_HISTORY_MSG_CHARS)}…`
          : m.content,
    }));
}

/**
 * Chat hook — manages conversation with AI via background service worker.
 * Handles messages, streaming chunks, and AI response cards.
 */
export function useChat() {
  const { addMessage, updateMessage, setStreaming, isStreaming } =
    useContentStore();

  /**
   * Send a user message and await AI response from background.
   */
  const sendMessage = useCallback(
    async (options: ChatSendOptions) => {
      const { text } = options;

      if (!text.trim() || isStreaming) return;

      const history = buildChatHistory(useContentStore.getState().messages);

      // Add user message
      const userMsg: ChatMessage = {
        id: nextMessageId(),
        role: "user",
        content: text.trim(),
        timestamp: Date.now(),
      };
      addMessage(userMsg);

      // Add placeholder AI message
      const aiMsgId = nextMessageId();
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };
      addMessage(aiMsg);

      setStreaming(true);

      const response = await safeSendMessage<{
        success?: boolean;
        data?: {
          contents?: string[];
          bookmarkResults?: BookmarkSearchResult[];
        };
        error?: string;
      }>({
        type: "AI_CHAT",
        payload: { query: text.trim(), history },
      });

      const currentMsg = useContentStore
        .getState()
        .messages.find(m => m.id === aiMsgId);

      if (!response) {
        if (!currentMsg?.content?.trim()) {
          updateMessage(aiMsgId, {
            content: "扩展上下文已失效，请刷新页面重试。",
            isStreaming: false,
            error: "Context invalidated",
          });
        } else {
          updateMessage(aiMsgId, { isStreaming: false });
        }
      } else if (response?.success) {
        const contents: string[] = response.data?.contents ?? [];
        const bookmarkResults: BookmarkSearchResult[] =
          response.data?.bookmarkResults ?? [];
        const streamed = currentMsg?.content?.trim();
        const content =
          streamed || contents.join("\n\n") || "未找到相关书签。";

        updateMessage(aiMsgId, {
          content,
          isStreaming: false,
          bookmarkResults,
        });
      } else if (response?.error) {
        updateMessage(aiMsgId, {
          content: `❌ ${response.error}`,
          isStreaming: false,
          error: response.error,
        });
      } else if (!currentMsg?.content?.trim()) {
        updateMessage(aiMsgId, {
          content: "未收到 AI 回复，请检查 API 配置。",
          isStreaming: false,
          error: "No response",
        });
      } else {
        updateMessage(aiMsgId, { isStreaming: false });
      }

      setStreaming(false);
    },
    [addMessage, updateMessage, setStreaming, isStreaming],
  );

  /**
   * Handle streaming chunk from background (AI_CHUNK / AI_DONE).
   * Called by the message listener in index.tsx.
   */
  const handleStreamChunk = useCallback(
    (data: { messageId: string; content: string }) => {
      const state = useContentStore.getState();
      const msg = state.messages.find(m => m.id === data.messageId);
      if (msg) {
        updateMessage(data.messageId, {
          content: (msg.content || "") + data.content,
        });
      }
    },
    [updateMessage],
  );

  const handleStreamDone = useCallback(
    (data: { messageId: string; bookmarkResults?: BookmarkSearchResult[] }) => {
      updateMessage(data.messageId, {
        isStreaming: false,
        bookmarkResults: data.bookmarkResults,
      });
      setStreaming(false);
    },
    [updateMessage, setStreaming],
  );

  return { sendMessage, isStreaming, handleStreamChunk, handleStreamDone };
}
