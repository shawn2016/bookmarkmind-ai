// ============================================================
// Content Script Entry Point
// ============================================================

import React from "react";
import { createRoot } from "react-dom/client";
import { createShadowContainer } from "@content/shadow-root";
import {
  useContentStore,
  syncConfigToStore,
} from "@content/store/contentStore";
import type { ExtensionConfig } from "@shared/types";
import { STORAGE_KEYS, DEFAULT_CONFIG } from "@shared/types";
import {
  isChromeInternalPage,
  isPdfPage,
  isInIframe,
} from "@shared/utils/url-match";
import { safeStorageGet, isContextValid } from "@shared/utils/chrome-api";
import App from "@content/App";

function shouldSkip(): boolean {
  const url = window.location.href;

  if (isChromeInternalPage(url)) return true;
  if (isPdfPage()) return true;
  if (isInIframe()) return true;

  return false;
}

async function init(): Promise<void> {
  if (!isContextValid()) return;
  if (shouldSkip()) return;

  try {
    const result = await safeStorageGet<{
      [STORAGE_KEYS.CONFIG]?: ExtensionConfig;
    }>(STORAGE_KEYS.CONFIG);
    if (!result) return;
    const config: ExtensionConfig =
      result[STORAGE_KEYS.CONFIG] ?? DEFAULT_CONFIG;

    if (!config.ball.enabled) return;

    if (config.ball.whitelistMode) {
      const matched = config.ball.disabledSites.some(p => {
        try {
          const r = new RegExp(
            "^" +
              p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
              "$",
            "i",
          );
          return r.test(window.location.href);
        } catch {
          return false;
        }
      });
      if (!matched) return;
    }
  } catch {
    return;
  }

  const { mountPoint } = createShadowContainer();

  const root = createRoot(mountPoint);
  root.render(React.createElement(App));

  chrome.storage.onChanged.addListener((changes, area) => {
    if (!isContextValid()) return;
    try {
      if (area !== "local") return;
      if (changes[STORAGE_KEYS.CONFIG]) {
        const config: ExtensionConfig =
          changes[STORAGE_KEYS.CONFIG].newValue ?? DEFAULT_CONFIG;
        syncConfigToStore(config);
      }
    } catch {
      // ignore
    }
  });

  chrome.runtime.onMessage.addListener(message => {
    if (!isContextValid()) return;
    try {
      if (!message?.type) return;

      switch (message.type) {
        case "TOGGLE_PANEL": {
          const store = useContentStore.getState();
          if (store.panelVisible) {
            store.collapsePanel();
          } else {
            store.expandPanel();
          }
          break;
        }

        case "AI_CHUNK": {
          const store = useContentStore.getState();
          const msg = store.messages.find(
            m => m.isStreaming && m.role === "assistant",
          );
          if (msg) {
            store.updateMessage(msg.id, {
              content: (msg.content || "") + (message.payload?.text ?? ""),
            });
          }
          break;
        }

        case "AI_DONE": {
          const store = useContentStore.getState();
          const msg = store.messages.find(
            m => m.isStreaming && m.role === "assistant",
          );
          if (msg) {
            const summary =
              message.payload?.fullText?.trim() || msg.content?.trim();
            store.updateMessage(msg.id, {
              content: summary || "未找到相关书签。",
              isStreaming: false,
              bookmarkResults: message.payload?.bookmarkResults,
            });
          }
          store.setStreaming(false);
          break;
        }

        case "AI_ERROR": {
          const store = useContentStore.getState();
          const msg = store.messages.find(
            m => m.isStreaming && m.role === "assistant",
          );
          if (msg) {
            store.updateMessage(msg.id, {
              content: `❌ ${message.payload?.error ?? "未知错误"}`,
              isStreaming: false,
              error: message.payload?.error,
            });
          }
          store.setStreaming(false);
          break;
        }
      }
    } catch {
      // ignore
    }
  });

  try {
    const result = await safeStorageGet<{
      [STORAGE_KEYS.CONFIG]?: ExtensionConfig;
    }>(STORAGE_KEYS.CONFIG);
    if (!result) return;
    const config: ExtensionConfig =
      result[STORAGE_KEYS.CONFIG] ?? DEFAULT_CONFIG;
    syncConfigToStore(config);

    const stored = await safeStorageGet<{
      bm_config_panel_size?: { width: number; height: number };
      bm_config_panel_position?: { x: number; y: number };
      bm_config_ball_position?: number;
    }>([
      "bm_config_panel_size",
      "bm_config_panel_position",
      "bm_config_ball_position",
    ]);
    if (!stored) return;

    const store = useContentStore.getState();
    if (stored.bm_config_panel_size) {
      store.setPanelSize(stored.bm_config_panel_size);
    }
    if (stored.bm_config_panel_position) {
      store.setPanelPosition(stored.bm_config_panel_position);
    }
    if (stored.bm_config_ball_position != null) {
      store.setBallConfig({
        ...config.ball,
        verticalPosition: stored.bm_config_ball_position,
      });
    }
  } catch {
    // Use defaults
  }
}

init().catch(() => {});
