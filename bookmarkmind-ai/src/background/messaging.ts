// ============================================================
// AI 书签管家 — Messaging Helpers
// ============================================================
import type { ExtMessage } from '@shared/types';

/**
 * Send a typed message to the background service worker (or any runtime listener)
 * and get a typed response.
 */
export function sendMessage<T = unknown>(message: ExtMessage): Promise<T> {
  return chrome.runtime.sendMessage(message) as Promise<T>;
}

/**
 * Send a message to a specific tab and get a typed response.
 */
export function sendMessageToTab<T = unknown>(
  tabId: number,
  message: Record<string, unknown>,
): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message) as Promise<T>;
}
