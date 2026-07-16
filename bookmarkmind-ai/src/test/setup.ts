import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Minimal Chrome API mock — each test extends the methods it needs.
// Tests that exercise chrome.* APIs should override specific methods via vi.fn().
const noop = vi.fn();
(globalThis as any).chrome = {
  runtime: {
    sendMessage: noop,
    onMessage: { addListener: noop, removeListener: noop },
    onInstalled: { addListener: noop },
    getURL: (path: string) => `chrome-extension://test/${path}`,
  },
  storage: {
    local: {
      get: noop,
      set: noop,
      remove: noop,
      clear: noop,
    },
    sync: {
      get: noop,
      set: noop,
    },
    onChanged: { addListener: noop, removeListener: noop },
  },
  bookmarks: {
    getTree: noop,
    getRecent: noop,
    search: noop,
    create: noop,
    update: noop,
    remove: noop,
    removeTree: noop,
    move: noop,
  },
  tabs: {
    sendMessage: noop,
    query: noop,
    create: noop,
    update: noop,
  },
  contextMenus: {
    create: noop,
    removeAll: noop,
  },
};