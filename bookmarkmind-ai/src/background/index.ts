// ============================================================
// AI 书签管家 — Background Service Worker
// ============================================================
import type { ExtMessage, ExtensionConfig, BookmarkSearchResult } from '@shared/types';
import { DEFAULT_CONFIG } from '@shared/types';

import { getConfig, saveConfig, checkDailyLimit, incrementUsage } from './storage';
import { createProvider } from './ai/provider';
import { buildSearchPrompt, buildIntentPrompt, buildChatSystemPrompt } from './ai/prompt';
import {
  getAllBookmarks,
  getBookmarkTree,
  createBookmark,
  removeBookmark,
  batchDelete,
  moveBookmark,
  searchBookmarks,
  checkBookmarked,
  removeBookmarkByUrl,
  getFolders,
} from './bookmarks/crud';
import { preFilterBookmarks } from './bookmarks/search';
import { classifyBookmark, batchClassify, applyClassification, autoClassifyOnCreate, reorganizeAllBookmarks, suggestCategoryForBookmark } from './bookmarks/classify';
import { getOrganizeBackup, restoreOrganizeBackup } from './bookmarks/backup';

// v2: Cleanup + Resurface
import { exportToCSV } from './cleanup/invalid-links';
import { findDuplicates } from './cleanup/duplicates';
import { selectResurfaceCards, handleResurfaceAction, getResurfacePrefs, setResurfacePrefs, getResurfaceRecordsPublic } from './resurface/engine';
import { initScheduler, handleAlarm, triggerCleanupScan } from './scheduler';

// v2 Phase 5-6: Tags, Notes, Highlights
import { getAllTags, createTag, updateTag, deleteTag, mergeTags, getBookmarkTags, setBookmarkTags } from './tags/crud';
import { migrateFoldersToTags } from './tags/migrate';
import { getNote, setNote, deleteNote, getBookmarksWithNotes } from './notes/crud';
import { addHighlight, listHighlights, deleteHighlight, getBookmarksWithHighlights } from './highlights/crud';

// ============================================================
// Lifecycle: Install / Update
// ============================================================

chrome.runtime.onInstalled.addListener(async (details) => {
  // Initialize config with defaults on fresh install
  if (details.reason === 'install') {
    await chrome.storage.local.set({
      bm_config: DEFAULT_CONFIG,
      bm_recycle_bin: [],
      bm_chat_history: [],
      bm_usage_stats: { date: '', apiCalls: 0, tokensUsed: 0 },
    });
  }

  // v2: Initialize scheduler
  await initScheduler();

  // Create context menu items
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'bookmark-current',
      title: '收藏当前页面',
      contexts: ['action'],
    });
    chrome.contextMenus.create({
      id: 'open-panel',
      title: '打开书签面板',
      contexts: ['action'],
    });
    chrome.contextMenus.create({
      id: 'classify-all',
      title: '智能整理所有书签',
      contexts: ['action'],
    });
    chrome.contextMenus.create({
      id: 'separator',
      type: 'separator',
      contexts: ['action'],
    });
    chrome.contextMenus.create({
      id: 'disable-site',
      title: '在此网站禁用悬浮球',
      contexts: ['action'],
    });
  });
});

// v2: Alarm listener
chrome.alarms.onAlarm.addListener((alarm) => {
  handleAlarm(alarm);
});

// ============================================================
// Context Menu
// ============================================================

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  switch (info.menuItemId) {
    case 'bookmark-current': {
      if (tab.url && tab.title) {
        try {
          await createBookmark(tab.url, tab.title);
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOAST',
            payload: { message: '已收藏当前页面', variant: 'success' },
          });
        } catch (err) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOAST',
            payload: { message: `收藏失败: ${String(err)}`, variant: 'error' },
          });
        }
      }
      break;
    }

    case 'open-panel': {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
      break;
    }

    case 'classify-all': {
      chrome.tabs.sendMessage(tab.id, {
        type: 'NAVIGATE',
        payload: { route: '/organize' },
      });
      break;
    }

    case 'disable-site': {
      if (tab.url) {
        const config = await getConfig();
        try {
          const hostname = new URL(tab.url).hostname;
          const pattern = `*://${hostname}/*`;
          if (!config.ball.disabledSites.includes(pattern)) {
            config.ball.disabledSites.push(pattern);
            await saveConfig({ ball: config.ball });
          }
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOAST',
            payload: { message: `已在 ${hostname} 禁用悬浮球`, variant: 'info' },
          });
        } catch {
          // Invalid URL — ignore
        }
      }
      break;
    }
  }
});

// ============================================================
// Keyboard Shortcuts
// ============================================================

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  switch (command) {
    case 'toggle-panel': {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_PANEL' });
      break;
    }
    case 'bookmark-current': {
      if (tab.url && tab.title) {
        try {
          await createBookmark(tab.url, tab.title);
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOAST',
            payload: { message: '已收藏当前页面', variant: 'success' },
          });
        } catch {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOAST',
            payload: { message: '收藏失败', variant: 'error' },
          });
        }
      }
      break;
    }
  }
});

// ============================================================
// Message Router
// ============================================================

chrome.runtime.onMessage.addListener((message: ExtMessage, sender, sendResponse) => {
  // sender.tab?.id is available when message comes from a content script
  const tabId = sender.tab?.id;

  // Route to handler; return true to keep the sendResponse channel open for async
  handleMessage(message, tabId).then(
    (result) => sendResponse(result),
    (error) => sendResponse({ error: String(error) }),
  );

  return true; // Keep the message channel open for async response
});

// ============================================================
// Message Handler
// ============================================================

async function handleMessage(
  message: ExtMessage,
  tabId: number | undefined,
): Promise<unknown> {
  switch (message.type) {
    // ---- Bookmark Operations ----

    case 'BOOKMARK_CREATE': {
      const { url, title, folderId, skipAutoClassify } = message.payload;
      const node = await createBookmark(url, title, folderId);

      const config = await getConfig();
      let classifyResult = null;
      if (
        !skipAutoClassify &&
        config.app.autoClassify &&
        isModelConfigured(config)
      ) {
        try {
          classifyResult = await autoClassifyOnCreate(node.id, config.model);
        } catch {
          // 自动分类失败不影响收藏成功
        }
      }

      return {
        success: true,
        bookmark: node,
        classified: !!classifyResult,
        category: classifyResult?.category,
      };
    }

    case 'BOOKMARK_SEARCH': {
      const results = await searchBookmarks(message.payload.query);
      return { results };
    }

    case 'BOOKMARK_BATCH_DELETE': {
      await batchDelete(message.payload.ids);
      return { success: true };
    }

    case 'BOOKMARK_BATCH_MOVE': {
      const { ids, folderId } = message.payload;
      await Promise.all(ids.map((id) => moveBookmark(id, folderId)));
      return { success: true };
    }

    case 'BOOKMARK_LIST': {
      const bookmarks = await getAllBookmarks();
      if (message.payload?.folderId) {
        return {
          bookmarks: bookmarks.filter((b) => b.parentId === message.payload.folderId),
        };
      }
      return { bookmarks };
    }

    case 'BOOKMARK_TREE': {
      const tree = await getBookmarkTree();
      return { tree };
    }

    case 'BOOKMARK_REMOVE': {
      await removeBookmark(message.payload.id);
      return { success: true };
    }

    case 'BOOKMARK_REMOVE_BY_URL': {
      const removed = await removeBookmarkByUrl(message.payload.url);
      return { success: removed };
    }

    case 'BOOKMARK_FOLDERS': {
      const folders = await getFolders();
      const SYSTEM_NAMES = new Set([
        '书签栏', 'Bookmarks bar', 'Bookmarks Bar',
        '其他书签', 'Other Bookmarks',
        '移动设备书签', 'Mobile bookmarks',
      ]);
      const userFolders = folders
        .filter((f) => f.title && !SYSTEM_NAMES.has(f.title) && f.id !== '0')
        .map((f) => ({ id: f.id, title: f.title }));
      return { folders: userFolders };
    }

    case 'BOOKMARK_ORGANIZE_BACKUP_INFO': {
      const backup = await getOrganizeBackup();
      return {
        hasBackup: !!backup,
        backup: backup
          ? {
              createdAt: backup.createdAt,
              bookmarkCount: backup.bookmarkCount,
            }
          : null,
      };
    }

    case 'BOOKMARK_RESTORE_ORGANIZE_BACKUP': {
      const result = await restoreOrganizeBackup();
      return { success: result.restored, ...result };
    }

    case 'BOOKMARK_MOVE': {
      const { id, parentId } = message.payload;
      await moveBookmark(id, parentId);
      return { success: true };
    }

    // ---- AI Operations ----

    case 'AI_SEARCH': {
      return handleAISearch(message.payload.query, tabId);
    }

    case 'AI_CHAT': {
      return handleAIChat(message.payload.query, tabId, message.payload.history);
    }

    case 'AI_CLASSIFY': {
      const config = await getConfig();
      const result = await classifyBookmark(message.payload.bookmarkId, config.model);
      await applyClassification(message.payload.bookmarkId, result);
      return { result };
    }

    case 'AI_BATCH_CLASSIFY': {
      const config = await getConfig();
      const results = await batchClassify(
        message.payload.bookmarkIds,
        config.model,
        (done, total) => {
          if (tabId !== undefined) {
            chrome.tabs.sendMessage(tabId, {
              type: 'CLASSIFY_PROGRESS',
              payload: { done, total },
            }).catch(() => {});
          }
        },
      );

      // Apply classifications
      for (const { id, result } of results) {
        try {
          await applyClassification(id, result);
        } catch {
          // Skip failed applications
        }
      }

      return { results };
    }

    case 'AI_ORGANIZE_SCATTERED': {
      const config = await getConfig();
      const result = await reorganizeAllBookmarks(
        config.model,
        (done, total, phase) => {
          const payload = { done, total, phase };
          if (tabId !== undefined) {
            chrome.tabs.sendMessage(tabId, {
              type: 'CLASSIFY_PROGRESS',
              payload,
            }).catch(() => {});
          }
          chrome.runtime.sendMessage({
            type: 'CLASSIFY_PROGRESS',
            payload,
          }).catch(() => {});
        },
      );
      return { success: true, ...result };
    }

    case 'AI_SUGGEST_CATEGORY': {
      const config = await getConfig();
      if (!isModelConfigured(config)) {
        return { category: null };
      }
      const { title, url } = message.payload;
      const category = await suggestCategoryForBookmark(title, url, config.model);
      return { category };
    }

    case 'AI_INTENT': {
      const config = await getConfig();
      const provider = await createProvider(config.model);

      const prompt = buildIntentPrompt(message.payload.message);
      const fullText = await provider.chatStream(
        [{ role: 'user', content: prompt }],
        () => {}, // No streaming for intent parsing
      );

      try {
        const parsed = JSON.parse(fullText);
        return { intent: parsed };
      } catch {
        return { intent: { action: 'unknown', params: {}, description: '无法理解您的意图' } };
      }
    }

    // ---- Utility ----

    case 'CHECK_BROKEN_LINKS': {
      return handleBrokenLinkCheck(message.payload.bookmarkIds, tabId);
    }

    case 'GET_CURRENT_TAB': {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return { tab };
    }

    // ---- Settings ----

    case 'SETTINGS_GET': {
      const config = await getConfig();
      const key = message.payload.key;
      const value = getNestedValue(config, key);
      return { value };
    }

    case 'SETTINGS_SET': {
      const { key, value } = message.payload;
      const partial = setNestedValue({}, key, value);
      await saveConfig(partial as Partial<ExtensionConfig>);
      return { success: true };
    }

    case 'SETTINGS_GET_ALL': {
      const config = await getConfig();
      return { config };
    }

    // ---- Connection Test ----

    case 'TEST_AI_CONNECTION': {
      const { provider, apiKey, baseUrl, model } = message.payload;
      try {
        const providerInstance = await createProvider({
          provider: provider as ExtensionConfig['model']['provider'],
          apiKey,
          model: model ?? 'gpt-4o-mini',
          baseUrl: baseUrl ?? '',
          temperature: 0.3,
          maxTokens: 256,
          timeout: 10000,
          dailyLimit: 100,
        });
        const result = await providerInstance.testConnection();
        if (result.success) {
          return {
            success: true,
            message:
              result.message ??
              `连接成功 (${provider}/${model ?? 'gpt-4o-mini'})`,
            models: result.models,
          };
        }
        return {
          success: false,
          message:
            result.message ??
            `连接失败 — 请检查 API Key、模型名称和网络。Provider: ${provider}`,
          models: [],
        };
      } catch (err) {
        return {
          success: false,
          message: `初始化失败: ${(err as Error).message ?? String(err)}`,
        };
      }
    }

    // ---- Check Bookmarked ----

    case 'CHECK_BOOKMARKED': {
      const exists = await checkBookmarked(message.payload.url);
      return { bookmarked: exists };
    }

    case 'OPEN_OPTIONS_PAGE': {
      await chrome.runtime.openOptionsPage();
      return { success: true };
    }

    // ============================================================
    // v2: Cleanup Operations
    // ============================================================

    case 'CLEANUP_SCAN_INVALID': {
      const results = await triggerCleanupScan(
        (done, total) => {
          if (tabId !== undefined) {
            chrome.tabs.sendMessage(tabId, {
              type: 'CLEANUP_PROGRESS',
              payload: { done, total },
            }).catch(() => {});
          }
        },
      );
      return { results };
    }

    case 'CLEANUP_FIND_DUPLICATES': {
      const bookmarks = await getAllBookmarks();
      const groups = findDuplicates(bookmarks);
      return { groups };
    }

    case 'CLEANUP_BATCH_DELETE': {
      await batchDelete(message.payload.ids);
      return { success: true };
    }

    case 'CLEANUP_EXPORT_CSV': {
      const csv = exportToCSV(message.payload.records);
      return { csv };
    }

    // ============================================================
    // v2: Resurface Operations
    // ============================================================

    case 'RESURFACE_GET_CARDS': {
      const cards = await selectResurfaceCards();
      return { cards };
    }

    case 'RESURFACE_REFRESH': {
      const cards = await selectResurfaceCards(undefined, true);
      return { cards };
    }

    case 'RESURFACE_ACTION': {
      const { bookmarkId, action } = message.payload;
      await handleResurfaceAction(bookmarkId, action);
      return { success: true };
    }

    case 'RESURFACE_GET_PREFS': {
      const prefs = await getResurfacePrefs();
      return { prefs };
    }

    case 'RESURFACE_SET_PREFS': {
      await setResurfacePrefs(message.payload);
      return { success: true };
    }

    case 'RESURFACE_GET_RECORDS': {
      const records = await getResurfaceRecordsPublic();
      return { records };
    }

    // ============================================================
    // v2: View Preferences
    // ============================================================

    case 'VIEW_PREFS_GET': {
      const raw = await chrome.storage.local.get('bm_view_prefs');
      return { prefs: raw['bm_view_prefs'] ?? null };
    }

    case 'VIEW_PREFS_SET': {
      const raw = await chrome.storage.local.get('bm_view_prefs');
      const current = raw['bm_view_prefs'] ?? {};
      await chrome.storage.local.set({
        bm_view_prefs: { ...current, ...message.payload },
      });
      return { success: true };
    }

    // ============================================================
    // v2 Phase 5: Tag Operations
    // ============================================================

    case 'TAG_LIST': {
      const tags = await getAllTags();
      return { tags };
    }

    case 'TAG_CREATE': {
      const { name, path, color } = message.payload;
      const tag = await createTag(name, path, color);
      return { tag };
    }

    case 'TAG_UPDATE': {
      const { id, changes } = message.payload;
      await updateTag(id, changes);
      return { success: true };
    }

    case 'TAG_DELETE': {
      await deleteTag(message.payload.id);
      return { success: true };
    }

    case 'TAG_MERGE': {
      const { sourceId, targetId } = message.payload;
      await mergeTags(sourceId, targetId);
      return { success: true };
    }

    case 'TAG_GET_BOOKMARK_TAGS': {
      const tags = await getBookmarkTags(message.payload.bookmarkId);
      return { tags };
    }

    case 'TAG_SET_BOOKMARK_TAGS': {
      const { bookmarkId, tagIds } = message.payload;
      await setBookmarkTags(bookmarkId, tagIds);
      const tags = await getBookmarkTags(bookmarkId);
      return { tags };
    }

    case 'TAG_MIGRATE_FROM_FOLDERS': {
      const report = await migrateFoldersToTags((progress) => {
        if (tabId !== undefined) {
          chrome.tabs.sendMessage(tabId, {
            type: 'TAG_MIGRATE_PROGRESS',
            payload: progress,
          }).catch(() => {});
        }
      });
      return { report };
    }

    // ============================================================
    // v2 Phase 6: Notes & Highlights Operations
    // ============================================================

    case 'NOTE_GET': {
      const note = await getNote(message.payload.bookmarkId);
      return { note };
    }

    case 'NOTE_SET': {
      const note = await setNote(message.payload.bookmarkId, message.payload.content);
      return { note };
    }

    case 'NOTE_DELETE': {
      await deleteNote(message.payload.bookmarkId);
      return { success: true };
    }

    case 'NOTE_LIST_IDS': {
      const ids = await getBookmarksWithNotes();
      return { noteIds: Array.from(ids) };
    }

    case 'HIGHLIGHT_ADD': {
      const { bookmarkId, text, xpath, url } = message.payload;
      const highlight = await addHighlight(bookmarkId, text, xpath, url);
      return { highlight };
    }

    case 'HIGHLIGHT_LIST': {
      const highlights = await listHighlights(message.payload.bookmarkId);
      return { highlights };
    }

    case 'HIGHLIGHT_DELETE': {
      const { bookmarkId, highlightId } = message.payload;
      await deleteHighlight(bookmarkId, highlightId);
      return { success: true };
    }

    case 'HIGHLIGHT_LIST_IDS': {
      const ids = await getBookmarksWithHighlights();
      return { highlightIds: Array.from(ids) };
    }

    default:
      return { error: `Unknown message type: ${(message as { type: string }).type}` };
  }
}

// ============================================================
// AI Search — Streaming
// ============================================================

function isModelConfigured(config: ExtensionConfig): boolean {
  if (config.model.provider === 'custom') {
    return !!config.model.baseUrl?.trim();
  }
  return !!config.model.apiKey?.trim();
}

function formatSearchSummary(
  query: string,
  results: BookmarkSearchResult[],
): string {
  if (results.length === 0) {
    return `未找到与「${query}」相关的书签。`;
  }
  const lines = results.map(
    (r, i) =>
      `${i + 1}. ${r.title}${r.category ? ` — ${r.category}` : ''}`,
  );
  return `找到 ${results.length} 个相关书签：\n\n${lines.join('\n')}`;
}

async function handleAISearch(
  query: string,
  tabId: number | undefined,
): Promise<{
  success: boolean;
  data?: { contents: string[]; bookmarkResults: BookmarkSearchResult[] };
  error?: string;
}> {
  const config = await getConfig();

  if (!isModelConfigured(config)) {
    return {
      success: false,
      error:
        config.model.provider === 'custom'
          ? '请先在扩展设置中配置 Base URL'
          : '请先在扩展设置中配置 API Key',
    };
  }

  // Check daily limit
  const limited = await checkDailyLimit();
  if (limited) {
    return {
      success: false,
      error: '今日 API 调用已达上限，请明天再试',
    };
  }

  const allBookmarks = await getAllBookmarks();

  // Pre-filter to reduce candidate count
  const candidates = preFilterBookmarks(query, allBookmarks, 50);

  if (candidates.length === 0) {
    return {
      success: true,
      data: {
        contents: [`未找到与「${query}」相关的书签。`],
        bookmarkResults: [],
      },
    };
  }

  // Build the search prompt
  const prompt = buildSearchPrompt(query, candidates);

  // Create AI provider
  const provider = await createProvider(config.model);

  // Stream chunks to content script
  let fullText = '';
  const onChunk = (text: string) => {
    fullText += text;
    if (tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, {
        type: 'AI_CHUNK',
        payload: { text },
      }).catch(() => {});
    }
  };

  // Signal the start of streaming
  if (tabId !== undefined) {
    chrome.tabs.sendMessage(tabId, {
      type: 'AI_START',
      payload: { query },
    }).catch(() => {});
  }

  try {
    // Perform streaming AI call
    await provider.chatStream(
      [{ role: 'user', content: prompt }],
      onChunk,
    );

    // Parse results from the full text
    const results = parseSearchResults(fullText, allBookmarks);
    const summary = formatSearchSummary(query, results);

    // Signal done
    if (tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, {
        type: 'AI_DONE',
        payload: { fullText: summary, bookmarkResults: results },
      }).catch(() => {});
    }

    // Track usage (estimate token count)
    const estimatedTokens = Math.ceil(fullText.length / 3);
    await incrementUsage(estimatedTokens);

    return {
      success: true,
      data: {
        contents: [summary],
        bookmarkResults: results,
      },
    };
  } catch (err) {
    const errorMsg = String(err);
    if (tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, {
        type: 'AI_ERROR',
        payload: { error: errorMsg },
      }).catch(() => {});
    }
    return { success: false, error: errorMsg };
  }
}

// ============================================================
// AI Chat — Direct model conversation with bookmark context
// ============================================================

async function handleAIChat(
  query: string,
  tabId: number | undefined,
  history?: { role: 'user' | 'assistant'; content: string }[],
): Promise<{
  success: boolean;
  data?: { contents: string[]; bookmarkResults: BookmarkSearchResult[] };
  error?: string;
}> {
  const config = await getConfig();

  if (!isModelConfigured(config)) {
    return {
      success: false,
      error:
        config.model.provider === 'custom'
          ? '请先在扩展设置中配置 Base URL'
          : '请先在扩展设置中配置 API Key',
    };
  }

  const limited = await checkDailyLimit();
  if (limited) {
    return { success: false, error: '今日 API 调用已达上限，请明天再试' };
  }

  const allBookmarks = await getAllBookmarks();
  const localMatches = preFilterBookmarks(query, allBookmarks, 10);

  // Collect folder names
  const tree = await getBookmarkTree();
  const folderNames: string[] = [];
  const collectFolders = (nodes: typeof tree) => {
    for (const node of nodes) {
      if (!node.url && node.title) {
        folderNames.push(node.title);
      }
      if (node.children) collectFolders(node.children);
    }
  };
  collectFolders(tree);

  const systemPrompt = buildChatSystemPrompt(
    allBookmarks.length,
    folderNames,
    localMatches.map(b => ({ title: b.title, url: b.url })),
  );

  const provider = await createProvider(config.model);

  let fullText = '';
  const onChunk = (text: string) => {
    fullText += text;
    if (tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, {
        type: 'AI_CHUNK',
        payload: { text },
      }).catch(() => {});
    }
  };

  if (tabId !== undefined) {
    chrome.tabs.sendMessage(tabId, {
      type: 'AI_START',
      payload: { query },
    }).catch(() => {});
  }

  try {
    const chatMessages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (history?.length) {
      for (const msg of history) {
        chatMessages.push({ role: msg.role, content: msg.content });
      }
    }

    chatMessages.push({ role: 'user', content: query });

    await provider.chatStream(chatMessages, onChunk);

    const bookmarkResults: BookmarkSearchResult[] = localMatches.map(b => ({
      id: b.id,
      title: b.title,
      url: b.url,
      category: b.parentTitle || '',
    }));

    if (tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, {
        type: 'AI_DONE',
        payload: { fullText, bookmarkResults },
      }).catch(() => {});
    }

    const estimatedTokens = Math.ceil(fullText.length / 3);
    await incrementUsage(estimatedTokens);

    return {
      success: true,
      data: {
        contents: [fullText.trim() || '（无回复内容）'],
        bookmarkResults,
      },
    };
  } catch (err) {
    const errorMsg = String(err);
    if (tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, {
        type: 'AI_ERROR',
        payload: { error: errorMsg },
      }).catch(() => {});
    }
    return { success: false, error: errorMsg };
  }
}

// ============================================================
// Broken Link Checker
// ============================================================

async function handleBrokenLinkCheck(
  bookmarkIds: string[],
  tabId: number | undefined,
): Promise<{ broken: string[] }> {
  const broken: string[] = [];
  let checked = 0;

  const reportProgress = () => {
    if (tabId !== undefined) {
      chrome.tabs.sendMessage(tabId, {
        type: 'BROKEN_LINK_PROGRESS',
        payload: { done: checked, total: bookmarkIds.length },
      }).catch(() => {});
    }
  };

  // Check links in batches of 5 to avoid overwhelming the network
  const BATCH_SIZE = 5;

  for (let i = 0; i < bookmarkIds.length; i += BATCH_SIZE) {
    const batch = bookmarkIds.slice(i, i + BATCH_SIZE);

    await Promise.allSettled(
      batch.map(async (id) => {
        const nodes = await chrome.bookmarks.get([id]);
        if (nodes.length === 0) return;
        const url = nodes[0].url;
        if (!url) return;

        try {
          const response = await fetch(url, {
            method: 'HEAD',
            signal: AbortSignal.timeout(10000),
          });
          if (!response.ok && response.status >= 400) {
            broken.push(id);
          }
        } catch {
          // Network error likely means broken link
          broken.push(id);
        }
      }),
    );

    checked += batch.length;
    reportProgress();
  }

  return { broken };
}

// ============================================================
// Helpers
// ============================================================

function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function setNestedValue(
  obj: unknown,
  path: string,
  value: unknown,
): unknown {
  const keys = path.split('.');
  const base = (obj && typeof obj === 'object' ? { ...obj as Record<string, unknown> } : {}) as Record<string, unknown>;
  return rebuildNested(base, keys, value);
}

function rebuildNested(
  base: Record<string, unknown>,
  keys: string[],
  value: unknown,
): Record<string, unknown> {
  if (keys.length === 0) return base;
  const [head, ...rest] = keys;

  if (rest.length === 0) {
    return { ...base, [head]: value };
  }

  const existing = (base[head] as Record<string, unknown> | undefined) ?? {};
  return {
    ...base,
    [head]: rebuildNested(existing, rest, value),
  };
}

function parseSearchResults(
  rawText: string,
  bookmarks: { id: string; title: string; url: string }[],
): BookmarkSearchResult[] {
  // Try to extract JSON from the response
  let jsonText = rawText;

  // Strip markdown fences if present
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonText = fenceMatch[1];
  }

  try {
    const parsed = JSON.parse(jsonText.trim());
    const aiResults: { title: string; url: string; reason?: string }[] =
      parsed?.results ?? [];

    // Match AI results back to actual bookmark IDs
    return aiResults.map((r) => {
      const match = bookmarks.find(
        (b) => b.url === r.url || b.title.toLowerCase() === r.title.toLowerCase(),
      );
      return {
        id: match?.id ?? '',
        title: r.title,
        url: r.url,
        category: r.reason ?? '',
      };
    }).filter((r) => r.id !== ''); // Only return results we could match
  } catch {
    // If parsing fails, try to extract URLs from the response
    const urlMatches = rawText.match(/https?:\/\/[^\s,)\]}"'<>]+/g);
    if (!urlMatches) return [];

    return urlMatches
      .map((url) => {
        const match = bookmarks.find((b) => b.url === url);
        return match
          ? { id: match.id, title: match.title, url: match.url, category: '' }
          : null;
      })
      .filter((r): r is BookmarkSearchResult => r !== null);
  }
}
