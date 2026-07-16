import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'AI 书签管家',
  version: '1.0.0',
  description: 'AI 驱动的 Chrome 书签管理扩展 — 收藏即整理，搜索即对话',
  permissions: [
    'bookmarks',
    'storage',
    'tabs',
    'scripting',
    'contextMenus',
    'commands',
    'alarms',
    'notifications',
    'history',
  ],
  host_permissions: ['<all_urls>'],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.tsx'],
      run_at: 'document_idle',
    },
  ],
  options_page: 'src/options/index.html',
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
    },
  },
  icons: {
    16: 'icons/icon-16.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  commands: {
    'toggle-panel': {
      suggested_key: { default: 'Alt+B' },
      description: '展开/收起悬浮面板',
    },
    'bookmark-current': {
      suggested_key: { default: 'Alt+S' },
      description: '收藏当前页面',
    },
  },
});
