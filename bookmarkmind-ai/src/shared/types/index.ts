// ============================================================
// AI 书签管家 — 共享类型定义
// ============================================================

// ---- 消息通信协议 ----
export type MessageType =
  | 'BOOKMARK_CREATE'
  | 'BOOKMARK_SEARCH'
  | 'BOOKMARK_BATCH_DELETE'
  | 'BOOKMARK_BATCH_MOVE'
  | 'BOOKMARK_LIST'
  | 'BOOKMARK_TREE'
  | 'BOOKMARK_REMOVE'
  | 'BOOKMARK_REMOVE_BY_URL'
  | 'BOOKMARK_FOLDERS'
  | 'BOOKMARK_ORGANIZE_BACKUP_INFO'
  | 'BOOKMARK_RESTORE_ORGANIZE_BACKUP'
  | 'BOOKMARK_MOVE'
  | 'AI_SUGGEST_CATEGORY'
  | 'AI_SEARCH'
  | 'AI_CHAT'
  | 'AI_CLASSIFY'
  | 'AI_BATCH_CLASSIFY'
  | 'AI_ORGANIZE_SCATTERED'
  | 'AI_INTENT'
  | 'CHECK_BROKEN_LINKS'
  | 'GET_CURRENT_TAB'
  | 'SETTINGS_GET'
  | 'SETTINGS_SET'
  | 'SETTINGS_GET_ALL'
  | 'TEST_AI_CONNECTION'
  | 'CHECK_BOOKMARKED'
  | 'OPEN_OPTIONS_PAGE'
  // ---- v2 新增 — 清理中心 ----
  | 'CLEANUP_SCAN_INVALID'
  | 'CLEANUP_FIND_DUPLICATES'
  | 'CLEANUP_BATCH_DELETE'
  | 'CLEANUP_EXPORT_CSV'
  // ---- v2 新增 — 再发现 ----
  | 'RESURFACE_GET_CARDS'
  | 'RESURFACE_REFRESH'
  | 'RESURFACE_ACTION'
  | 'RESURFACE_GET_PREFS'
  | 'RESURFACE_SET_PREFS'
  | 'RESURFACE_GET_RECORDS'
  // ---- v2 新增 — 标签系统 ----
  | 'TAG_LIST'
  | 'TAG_CREATE'
  | 'TAG_UPDATE'
  | 'TAG_DELETE'
  | 'TAG_MERGE'
  | 'TAG_GET_BOOKMARK_TAGS'
  | 'TAG_SET_BOOKMARK_TAGS'
  | 'TAG_MIGRATE_FROM_FOLDERS'
  // ---- v2 新增 — 备注与高亮 ----
  | 'NOTE_GET'
  | 'NOTE_SET'
  | 'NOTE_DELETE'
  | 'NOTE_LIST_IDS'
  | 'HIGHLIGHT_ADD'
  | 'HIGHLIGHT_LIST'
  | 'HIGHLIGHT_DELETE'
  | 'HIGHLIGHT_LIST_IDS'
  // ---- v2 新增 — 视图偏好 ----
  | 'VIEW_PREFS_GET'
  | 'VIEW_PREFS_SET';

export interface BaseMessage<T extends MessageType = MessageType> {
  type: T;
}

export interface MessageWithPayload<T extends MessageType, P> extends BaseMessage<T> {
  payload: P;
}

export type ExtMessage =
  | MessageWithPayload<'BOOKMARK_CREATE', {
      url: string;
      title: string;
      folderId?: string;
      skipAutoClassify?: boolean;
    }>
  | MessageWithPayload<'BOOKMARK_SEARCH', { query: string }>
  | MessageWithPayload<'BOOKMARK_BATCH_DELETE', { ids: string[] }>
  | MessageWithPayload<'BOOKMARK_BATCH_MOVE', { ids: string[]; folderId: string }>
  | MessageWithPayload<'BOOKMARK_LIST', { folderId?: string }>
  | BaseMessage<'BOOKMARK_TREE'>
  | MessageWithPayload<'BOOKMARK_REMOVE', { id: string }>
  | MessageWithPayload<'BOOKMARK_REMOVE_BY_URL', { url: string }>
  | BaseMessage<'BOOKMARK_FOLDERS'>
  | BaseMessage<'BOOKMARK_ORGANIZE_BACKUP_INFO'>
  | BaseMessage<'BOOKMARK_RESTORE_ORGANIZE_BACKUP'>
  | MessageWithPayload<'BOOKMARK_MOVE', { id: string; parentId: string }>
  | MessageWithPayload<'AI_SUGGEST_CATEGORY', { title: string; url: string }>
  | MessageWithPayload<'AI_SEARCH', { query: string }>
  | MessageWithPayload<'AI_CHAT', {
      query: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    }>
  | MessageWithPayload<'AI_CLASSIFY', { bookmarkId: string }>
  | MessageWithPayload<'AI_BATCH_CLASSIFY', { bookmarkIds: string[] }>
  | BaseMessage<'AI_ORGANIZE_SCATTERED'>
  | MessageWithPayload<'AI_INTENT', { message: string }>
  | MessageWithPayload<'CHECK_BROKEN_LINKS', { bookmarkIds: string[] }>
  | BaseMessage<'GET_CURRENT_TAB'>
  | MessageWithPayload<'SETTINGS_GET', { key: string }>
  | MessageWithPayload<'SETTINGS_SET', { key: string; value: unknown }>
  | BaseMessage<'SETTINGS_GET_ALL'>
  | MessageWithPayload<'TEST_AI_CONNECTION', { provider: string; apiKey: string; baseUrl?: string; model?: string }>
  | MessageWithPayload<'CHECK_BOOKMARKED', { url: string }>
  | BaseMessage<'OPEN_OPTIONS_PAGE'>
  // ---- v2 新增 — 清理中心 ----
  | BaseMessage<'CLEANUP_SCAN_INVALID'>
  | BaseMessage<'CLEANUP_FIND_DUPLICATES'>
  | MessageWithPayload<'CLEANUP_BATCH_DELETE', { ids: string[] }>
  | MessageWithPayload<'CLEANUP_EXPORT_CSV', { records: InvalidLinkRecord[] }>
  // ---- v2 新增 — 再发现 ----
  | BaseMessage<'RESURFACE_GET_CARDS'>
  | BaseMessage<'RESURFACE_REFRESH'>
  | MessageWithPayload<'RESURFACE_ACTION', {
      bookmarkId: string;
      action: ResurfaceAction;
    }>
  | BaseMessage<'RESURFACE_GET_PREFS'>
  | MessageWithPayload<'RESURFACE_SET_PREFS', Partial<ResurfacePrefs>>
  | BaseMessage<'RESURFACE_GET_RECORDS'>
  // ---- v2 新增 — 标签系统 ----
  | BaseMessage<'TAG_LIST'>
  | MessageWithPayload<'TAG_CREATE', { name: string; path: string; color?: string }>
  | MessageWithPayload<'TAG_UPDATE', { id: string; changes: Partial<Tag> }>
  | MessageWithPayload<'TAG_DELETE', { id: string }>
  | MessageWithPayload<'TAG_MERGE', { sourceId: string; targetId: string }>
  | MessageWithPayload<'TAG_GET_BOOKMARK_TAGS', { bookmarkId: string }>
  | MessageWithPayload<'TAG_SET_BOOKMARK_TAGS', { bookmarkId: string; tagIds: string[] }>
  | BaseMessage<'TAG_MIGRATE_FROM_FOLDERS'>
  // ---- v2 新增 — 备注与高亮 ----
  | MessageWithPayload<'NOTE_GET', { bookmarkId: string }>
  | MessageWithPayload<'NOTE_SET', { bookmarkId: string; content: string }>
  | MessageWithPayload<'NOTE_DELETE', { bookmarkId: string }>
  | BaseMessage<'NOTE_LIST_IDS'>
  | MessageWithPayload<'HIGHLIGHT_ADD', { bookmarkId: string; text: string; xpath: string; url: string }>
  | MessageWithPayload<'HIGHLIGHT_LIST', { bookmarkId: string }>
  | MessageWithPayload<'HIGHLIGHT_DELETE', { bookmarkId: string; highlightId: string }>
  | BaseMessage<'HIGHLIGHT_LIST_IDS'>
  // ---- v2 新增 — 视图偏好 ----
  | BaseMessage<'VIEW_PREFS_GET'>
  | MessageWithPayload<'VIEW_PREFS_SET', Partial<ViewPreferences>>;

// ---- AI 配置 ----
export type AIProvider = 'openai' | 'anthropic' | 'custom';

export interface ModelConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
  dailyLimit: number;
}

// ---- 悬浮球配置 ----
export type BallSide = 'left' | 'right';
export type ActionBarMode = 'hidden' | 'hover' | 'always';
export type ClickBehavior = 'expand' | 'bookmark' | 'search';

export interface BallConfig {
  enabled: boolean;
  side: BallSide;
  size: number;             // 36-64 px
  opacity: number;          // 0-100
  actionBarMode: ActionBarMode;
  clickBehavior: ClickBehavior;
  disabledSites: string[];   // URL 匹配规则
  whitelistMode: boolean;
  autoHideFullscreen: boolean;
  verticalPosition: number;  // 0-100 百分比
  /** 是否启用 F 键切换面板全屏 */
  panelShortcutEnabled: boolean;
}

// ---- 通用设置 ----
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'zh' | 'en';

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  fontSize: 'small' | 'medium' | 'large';
  autoClassify: boolean;
  recycleBinEnabled: boolean;
  notifications: NotificationSettings;
  // v2 新增
  tagMode: 'coexist' | 'tag_primary' | 'folder_primary';
}

export interface NotificationSettings {
  /** 收藏成功时显示提示 */
  toastSuccess: boolean;
  /** 操作失败时显示提示 */
  toastError: boolean;
  /** 普通信息提示 */
  toastInfo: boolean;
  /** 检测到失效链接时通知 */
  notifyBrokenLinks: boolean;
  /** 每日使用摘要 */
  dailySummary: boolean;
}

// ---- 完整配置 ----
export interface ExtensionConfig {
  model: ModelConfig;
  ball: BallConfig;
  app: AppSettings;
}

// ---- 默认配置 ----
export const DEFAULT_CONFIG: ExtensionConfig = {
  model: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    baseUrl: '',
    temperature: 0.3,
    maxTokens: 2048,
    timeout: 30000,
    dailyLimit: 100,
  },
  ball: {
    enabled: true,
    side: 'right',
    size: 48,
    opacity: 30,
    actionBarMode: 'hover',
    clickBehavior: 'bookmark',
    disabledSites: [
      '*://*.alipay.com/*',
      '*://*.wechat.com/*',
      '*://*.paypal.com/*',
      '*://*.bankcomm.com/*',
    ],
    whitelistMode: false,
    autoHideFullscreen: true,
    verticalPosition: 50,
    panelShortcutEnabled: true,
  },
  app: {
    theme: 'light',
    language: 'zh',
    fontSize: 'medium',
    autoClassify: true,
    recycleBinEnabled: true,
    notifications: {
      toastSuccess: true,
      toastError: true,
      toastInfo: true,
      notifyBrokenLinks: false,
      dailySummary: false,
    },
    tagMode: 'coexist',
  },
};

// ---- 书签相关 ----
export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  dateAdded?: number;
  dateGroupModified?: number;
  parentId?: string;
  children?: BookmarkNode[];
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  dateAdded: number;
  parentId: string;
  parentTitle: string;
  faviconUrl?: string;
}

export interface BookmarkFolder {
  id: string;
  title: string;
  children: BookmarkNode[];
}

// ---- AI 对话 ----
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  bookmarkResults?: BookmarkSearchResult[];
  isStreaming?: boolean;
  error?: string;
}

export interface BookmarkSearchResult {
  id: string;
  title: string;
  url: string;
  category: string;
  faviconUrl?: string;
}

export interface ClassifyResult {
  category: string;
  confidence: number;
  folderId?: string;
}

// ---- 存储键 ----
export const STORAGE_KEYS = {
  CONFIG: 'bm_config',
  RECYCLE_BIN: 'bm_recycle_bin',
  CHAT_HISTORY: 'bm_chat_history',
  USAGE_STATS: 'bm_usage_stats',
  ORGANIZE_BACKUP: 'bm_organize_backup',
  // v2 新增
  TAGS: 'bm_tags',
  BOOKMARK_TAGS: 'bm_bookmark_tags',
  NOTES: 'bm_notes',
  HIGHLIGHTS: 'bm_highlights',
  INVALID_LINKS: 'bm_invalid_links',
  RESURFACE_RECORDS: 'bm_resurface_records',
  VIEW_PREFS: 'bm_view_prefs',
  RESURFACE_PREFS: 'bm_resurface_prefs',
  INSTALL_DATE: 'bm_install_date',
} as const;

// ---- 整理前备份 ----
export interface OrganizeBackupNode {
  title: string;
  url?: string;
  children?: OrganizeBackupNode[];
}

export interface OrganizeBackup {
  createdAt: number;
  bookmarkCount: number;
  nodes: OrganizeBackupNode[];
}

// ---- 回收站 ----
export interface RecycleItem {
  bookmark: BookmarkItem;
  deletedAt: number;
  originalParentId: string;
}

// ---- 用量统计 ----
export interface UsageStats {
  date: string;        // YYYY-MM-DD
  apiCalls: number;
  tokensUsed: number;
}

// ============================================================
// v2 新增类型
// ============================================================

// ---- 失效链接检测 ----
export type InvalidLinkStatus =
  | 'invalid_404'
  | 'invalid_5xx'
  | 'invalid_redirect'
  | 'invalid_dns'
  | 'invalid_timeout'
  | 'invalid_content_deleted';

export interface InvalidLinkRecord {
  bookmarkId: string;
  url: string;
  title: string;
  status: InvalidLinkStatus;
  httpStatusCode?: number;
  detectedAt: number;
  retryCount: number;
}

// ---- 再发现 ----
export type ResurfaceAction =
  | 'opened'
  | 'rebookmarked'
  | 'archived'
  | 'deleted'
  | 'dismissed'
  | 'no_action';

export interface ResurfaceRecord {
  bookmarkId: string;
  pushedDate: string;       // YYYY-MM-DD
  action: ResurfaceAction;
  actionAt?: number;
  score: number;
  dismissedUntil?: number;
}

export interface ResurfacePrefs {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'disabled';
  pushTime: string;          // HH:MM, 默认 "09:00"
  count: number;             // 每次推送数量，默认 5，范围 3-10
  noActionStreak: number;
  paused: boolean;
}

export const DEFAULT_RESURFACE_PREFS: ResurfacePrefs = {
  enabled: true,
  frequency: 'daily',
  pushTime: '09:00',
  count: 5,
  noActionStreak: 0,
  paused: false,
};

// ---- 标签系统 ----
export type TagSource = 'auto' | 'manual' | 'migrated';

export interface Tag {
  id: string;                // crypto.randomUUID()
  name: string;
  path: string;              // e.g. "tech/frontend/react"
  color?: string;
  createdAt: number;
  source: TagSource;
}

export interface BookmarkTag {
  bookmarkId: string;
  tagId: string;
  createdAt: number;
}

// ---- 备注与高亮 ----
export interface BookmarkNote {
  bookmarkId: string;
  content: string;           // Markdown, max 500 chars
  createdAt: number;
  updatedAt: number;
}

export interface BookmarkHighlight {
  id: string;                // crypto.randomUUID()
  bookmarkId: string;
  text: string;
  xpath: string;
  url: string;
  createdAt: number;
}

// ---- 视图偏好 ----
export type ActiveView =
  | 'chat'
  | 'bookmarks'
  | 'timeline'
  | 'cleanup'
  | 'resurface'
  | 'topic'
  | 'canvas';

export interface ViewPreferences {
  activeView: ActiveView;
  panelFullscreen?: boolean;
  listFilters: {
    category?: string[];
    tags?: string[];
    dateRange?: { start: string; end: string };
  };
  timelineFilters: {
    category?: string[];
    tags?: string[];
    dateRange?: { start: string; end: string };
  };
}

export const DEFAULT_VIEW_PREFS: ViewPreferences = {
  activeView: 'chat',
  panelFullscreen: false,
  listFilters: {},
  timelineFilters: {},
};

// ---- 清理中心 ----
export interface DuplicateGroup {
  type: 'url_exact' | 'title_exact' | 'url_suspected';
  bookmarks: BookmarkItem[];
}

export interface CleanupScanState {
  phase: 'idle' | 'scanning' | 'done' | 'error';
  done: number;
  total: number;
  results: InvalidLinkRecord[];
  error?: string;
}
