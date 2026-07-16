// ============================================================
// AI 书签管家 — AI Classification Logic
// ============================================================
import type {
  ModelConfig,
  ClassifyResult,
  BookmarkNode,
  BookmarkItem,
} from '@shared/types';
import { createProvider } from '../ai/provider';
import {
  getFolders,
  moveBookmark,
  getBookmarkTree,
  getAllBookmarks,
} from './crud';
import { buildBatchOrganizePrompt, buildReorganizeAllPrompt, buildClassifyWithTagsPrompt } from '../ai/prompt';
import { checkDailyLimit, incrementUsage } from '../storage';
import { createOrganizeBackup } from './backup';
import { getAllTags } from '../tags/crud';

/** 系统保留文件夹，不作为分类目标 */
const SYSTEM_FOLDER_NAMES = new Set([
  '书签栏',
  'Bookmarks bar',
  'Bookmarks Bar',
  '其他书签',
  'Other Bookmarks',
  '移动设备书签',
  'Mobile bookmarks',
  '未命名文件夹',
]);

/** 系统根目录 ID（不作为用户文件夹） */
const SCATTERED_PARENT_IDS = new Set(['1', '2']);

/** 单条分类时新建分类上限 */
const MAX_NEW_CATEGORIES_SINGLE = 8;

/** 一键整理时每批处理数量 */
const ORGANIZE_BATCH_SIZE = 40;

/** 一键整理时最多新建分类数 */
const MAX_NEW_CATEGORIES_ORGANIZE = 10;

export interface OrganizeResult {
  organized: number;
  skipped: number;
  categoriesUsed: string[];
  summary: string;
}

/**
 * Classify a single bookmark using AI.
 */
export async function classifyBookmark(
  bookmarkId: string,
  config: ModelConfig,
  options?: { preferExisting?: boolean },
): Promise<ClassifyResult> {
  if (await isBookmarkOnBookmarksBarRoot(bookmarkId)) {
    throw new Error('书签栏上的书签为用户手动摆放，不参与智能分类');
  }

  const nodes = await chrome.bookmarks.get([bookmarkId]);
  if (nodes.length === 0) {
    throw new Error(`Bookmark not found: ${bookmarkId}`);
  }
  const node = nodes[0];

  const folders = await getUserFolders();
  const folderNames = folders.map((f) => f.title).filter(Boolean);

  const provider = await createProvider(config);

  const result = await provider.classify(
    {
      title: node.title,
      url: node.url ?? '',
    },
    folderNames,
    { preferExisting: options?.preferExisting ?? true, maxNewCategories: MAX_NEW_CATEGORIES_SINGLE },
  );

  const normalized = normalizeCategoryName(result.category, folders);
  result.category = normalized.name;
  if (normalized.folderId) {
    result.folderId = normalized.folderId;
  }

  return result;
}

/**
 * Classify multiple bookmarks one by one (legacy batch).
 */
export async function batchClassify(
  bookmarkIds: string[],
  config: ModelConfig,
  onProgress?: (done: number, total: number) => void,
): Promise<{ id: string; result: ClassifyResult }[]> {
  const eligible: string[] = [];
  for (const id of bookmarkIds) {
    if (!(await isBookmarkOnBookmarksBarRoot(id))) {
      eligible.push(id);
    }
  }

  const BATCH_SIZE = 10;
  const results: { id: string; result: ClassifyResult }[] = [];

  for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
    const batch = eligible.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (id) => {
        const result = await classifyBookmark(id, config);
        return { id, result };
      }),
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') {
        results.push(r.value);
      }
    }

    onProgress?.(
      Math.min(i + BATCH_SIZE, eligible.length),
      eligible.length,
    );
  }

  return results;
}

/**
 * 获取散落在「其他书签」根目录下的书签（未归入文件夹）。
 * 书签栏根目录下的链接视为用户手动摆放，不参与整理。
 */
export async function getScatteredBookmarks(): Promise<BookmarkItem[]> {
  const all = await getAllBookmarks();
  const other = await findOtherBookmarksFolder();
  const otherId = other?.id ?? '2';
  return all.filter((b) => b.parentId === otherId);
}

/**
 * 一键整理零散书签：批量 AI 分类，控制分类数量。
 */
export async function organizeScatteredBookmarks(
  config: ModelConfig,
  onProgress?: (done: number, total: number, phase: string) => void,
): Promise<OrganizeResult> {
  const limited = await checkDailyLimit();
  if (limited) {
    throw new Error('今日 API 调用已达上限，请明天再试');
  }

  const scattered = await getScatteredBookmarks();
  if (scattered.length === 0) {
    return {
      organized: 0,
      skipped: 0,
      categoriesUsed: [],
      summary: '没有需要整理的零散书签',
    };
  }

  const folders = await getUserFolders();
  const folderNames = folders.map((f) => f.title).filter(Boolean);
  const provider = await createProvider(config);

  const categoryRegistry = new Map<string, string>();
  for (const f of folders) {
    categoryRegistry.set(f.title.toLowerCase(), f.title);
  }

  let organized = 0;
  let skipped = 0;
  const categoriesUsed = new Set<string>();

  for (let i = 0; i < scattered.length; i += ORGANIZE_BATCH_SIZE) {
    const batch = scattered.slice(i, i + ORGANIZE_BATCH_SIZE);
    onProgress?.(i, scattered.length, '正在分析书签…');

    const prompt = buildBatchOrganizePrompt(
      batch.map((b) => ({ id: b.id, title: b.title, url: b.url })),
      folderNames,
      MAX_NEW_CATEGORIES_ORGANIZE,
    );

    let rawText = '';
    try {
      rawText = await provider.chatStream(
        [
          { role: 'system', content: '你是精确的书签整理助手，只返回合法 JSON。' },
          { role: 'user', content: prompt },
        ],
        () => {},
      );
    } catch (err) {
      throw new Error(`AI 整理失败: ${String(err)}`);
    }

    const assignments = parseOrganizeAssignments(
      rawText,
      batch.map((b) => b.id),
    );
    const estimatedTokens = Math.ceil(rawText.length / 3);
    await incrementUsage(estimatedTokens);

    for (const bm of batch) {
      const assignment = assignments.find((a) => a.id === bm.id);
      if (!assignment?.category) {
        skipped++;
        continue;
      }

      const normalized = resolveCategory(
        assignment.category,
        folderNames,
        categoryRegistry,
      );

      try {
        await applyClassification(
          bm.id,
          { category: normalized, confidence: 0.8 },
          { createUnder: 'bookmarksBar' },
        );
        categoriesUsed.add(normalized);
        organized++;
      } catch {
        skipped++;
      }
    }

    onProgress?.(
      Math.min(i + ORGANIZE_BATCH_SIZE, scattered.length),
      scattered.length,
      '正在移动书签…',
    );
  }

  return {
    organized,
    skipped,
    categoriesUsed: Array.from(categoriesUsed),
    summary: `已整理 ${organized} 个零散书签到 ${categoriesUsed.size} 个分类${skipped > 0 ? `，${skipped} 个跳过` : ''}`,
  };
}

/**
 * 一键整理：清空用户文件夹结构，将全部书签重新 AI 分类。
 */
export async function reorganizeAllBookmarks(
  config: ModelConfig,
  onProgress?: (done: number, total: number, phase: string) => void,
): Promise<OrganizeResult> {
  const limited = await checkDailyLimit();
  if (limited) {
    throw new Error('今日 API 调用已达上限，请明天再试');
  }

  const all = await getAllBookmarks();
  if (all.length === 0) {
    return {
      organized: 0,
      skipped: 0,
      categoriesUsed: [],
      summary: '没有书签可整理',
    };
  }

  const barId = await getBookmarksBarId();
  const toOrganize = all.filter((b) => b.parentId !== barId);
  const barProtected = all.length - toOrganize.length;

  if (toOrganize.length === 0) {
    return {
      organized: 0,
      skipped: 0,
      categoriesUsed: [],
      summary: `书签栏上的 ${barProtected} 个书签为用户手动摆放，未参与整理`,
    };
  }

  onProgress?.(0, toOrganize.length, '正在备份书签…');
  const backup = await createOrganizeBackup();

  onProgress?.(0, toOrganize.length, '正在清空现有分类…');

  const other = await findOtherBookmarksFolder();
  const stagingId = other?.id ?? '2';

  for (const bm of toOrganize) {
    if (bm.parentId !== stagingId) {
      try {
        await moveBookmark(bm.id, stagingId);
      } catch {
        // 单条移动失败不阻断
      }
    }
  }

  await clearUserFolderStructure();

  const provider = await createProvider(config);
  const categoryRegistry = new Map<string, string>();
  const newCategoryCount = { value: 0 };
  let organized = 0;
  let skipped = 0;
  const categoriesUsed = new Set<string>();

  for (let i = 0; i < toOrganize.length; i += ORGANIZE_BATCH_SIZE) {
    const batch = toOrganize.slice(i, i + ORGANIZE_BATCH_SIZE);
    onProgress?.(i, toOrganize.length, '正在 AI 重新分类…');

    const prompt = buildReorganizeAllPrompt(
      batch.map((b) => ({ id: b.id, title: b.title, url: b.url })),
      MAX_NEW_CATEGORIES_ORGANIZE,
    );

    let rawText = '';
    try {
      rawText = await provider.chatStream(
        [
          { role: 'system', content: '你是精确的书签整理助手，只返回合法 JSON。' },
          { role: 'user', content: prompt },
        ],
        () => {},
      );
    } catch (err) {
      throw new Error(`AI 整理失败: ${String(err)}`);
    }

    const assignments = parseOrganizeAssignments(rawText, batch.map((b) => b.id));
    const estimatedTokens = Math.ceil(rawText.length / 3);
    await incrementUsage(estimatedTokens);

    for (const bm of batch) {
      const assignment = assignments.find((a) => a.id === bm.id);
      if (!assignment?.category) {
        skipped++;
        continue;
      }

      const normalized = resolveCategory(
        assignment.category,
        [],
        categoryRegistry,
        newCategoryCount,
      );

      try {
        await applyClassification(
          bm.id,
          { category: normalized, confidence: 0.8 },
          { createUnder: 'bookmarksBar' },
        );
        categoriesUsed.add(normalized);
        organized++;
      } catch {
        skipped++;
      }
    }

    onProgress?.(
      Math.min(i + ORGANIZE_BATCH_SIZE, toOrganize.length),
      toOrganize.length,
      '正在移动书签…',
    );
  }

  const flushed = await flushStagingBookmarks(stagingId, categoryRegistry);
  if (flushed > 0) {
    organized += flushed;
    categoriesUsed.add('其他');
  }

  const stagingLeft = await countStagingBookmarks(stagingId);
  if (stagingLeft > 0) {
    skipped += stagingLeft;
  }

  const barNote =
    barProtected > 0 ? `，书签栏 ${barProtected} 个手动摆放未动` : '';

  return {
    organized,
    skipped,
    categoriesUsed: Array.from(categoriesUsed),
    summary: `已重新分类 ${organized} 个书签到书签栏下 ${categoriesUsed.size} 个文件夹${skipped > 0 ? `，${skipped} 个未分类` : ''}${barNote}。已自动备份 ${backup.bookmarkCount} 个书签，可在设置→数据管理中恢复。`,
  };
}

/**
 * 收藏前预览 AI 推荐分类（不移动书签）。
 */
export async function suggestCategoryForBookmark(
  title: string,
  url: string,
  config: ModelConfig,
): Promise<string | null> {
  try {
    const folders = await getUserFolders();
    const folderNames = folders.map((f) => f.title).filter(Boolean);
    const provider = await createProvider(config);
    const result = await provider.classify(
      { title, url },
      folderNames,
      { preferExisting: true, maxNewCategories: MAX_NEW_CATEGORIES_SINGLE },
    );
    const normalized = normalizeCategoryName(result.category, folders);
    return normalized.name || null;
  } catch {
    return null;
  }
}

/**
 * v2: AI 标签建议 — 推荐分类 + 标签
 * Returns {category, tags: string[]}
 */
export async function suggestTagsForBookmark(
  title: string,
  url: string,
  config: ModelConfig,
): Promise<{ category: string; tags: string[] } | null> {
  try {
    const folders = await getUserFolders();
    const folderNames = folders.map((f) => f.title).filter(Boolean);

    // Get existing tags for reuse (static import)
    const tags = await getAllTags();
    const existingTagNames = tags.map((t) => t.name);

    const provider = await createProvider(config);
    const prompt = buildClassifyWithTagsPrompt(
      { title, url },
      folderNames,
      existingTagNames,
      { preferExisting: true },
    );

    const fullText = await provider.chatStream(
      [{ role: 'user', content: prompt }],
      () => {}, // No streaming needed for tag suggestions
    );

    // Parse JSON response
    let parsed: { category?: string; tags?: string[] };
    try {
      const cleaned = fullText.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Try raw parsing
      parsed = JSON.parse(fullText.trim());
    }

    const normalized = normalizeCategoryName(parsed.category || '其他', folders);
    return {
      category: normalized.name || '其他',
      tags: (parsed.tags || []).slice(0, 5),
    };
  } catch {
    return null;
  }
}

/**
 * 收藏时自动分类（若已配置 AI）。
 */
export async function autoClassifyOnCreate(
  bookmarkId: string,
  config: ModelConfig,
): Promise<ClassifyResult | null> {
  if (await isBookmarkOnBookmarksBarRoot(bookmarkId)) {
    return null;
  }

  try {
    const result = await classifyBookmark(bookmarkId, config, {
      preferExisting: true,
    });
    if (result.confidence >= 0.5) {
      await applyClassification(bookmarkId, result);
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Apply a classification result: find or create folder, then move bookmark.
 * 默认在「书签栏」下创建分类文件夹（而非「其他书签」）。
 */
export async function applyClassification(
  bookmarkId: string,
  result: ClassifyResult,
  options?: { createUnder?: 'bookmarksBar' | 'otherBookmarks' },
): Promise<void> {
  const category = result.category.trim();
  if (!category) {
    return;
  }

  const folders = await getUserFolders();
  let targetFolder = folders.find(
    (f) => f.title.toLowerCase() === category.toLowerCase(),
  );

  if (!targetFolder) {
    const parentFolder =
      options?.createUnder === 'otherBookmarks'
        ? await findOtherBookmarksFolder()
        : await findBookmarksBarFolder();
    const newFolder = await chrome.bookmarks.create({
      parentId: parentFolder?.id ?? '1',
      title: category,
    });
    targetFolder = {
      id: newFolder.id,
      title: newFolder.title,
      children: [],
    };
  }

  await moveBookmark(bookmarkId, targetFolder.id);
}

// ---- Helpers ----

async function getBookmarksBarId(): Promise<string> {
  const bar = await findBookmarksBarFolder();
  return bar?.id ?? '1';
}

/** 书签栏根目录下的链接 = 用户手动拖放，不参与智能分类 */
async function isBookmarkOnBookmarksBarRoot(bookmarkId: string): Promise<boolean> {
  const nodes = await chrome.bookmarks.get([bookmarkId]);
  if (nodes.length === 0) return false;
  const barId = await getBookmarksBarId();
  return nodes[0].parentId === barId;
}

async function findBookmarksBarFolder(): Promise<BookmarkNode | undefined> {
  const tree = await getBookmarkTree();
  let bar: BookmarkNode | undefined;

  const findBar = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      if (
        !node.url &&
        (node.title === '书签栏' ||
          node.title === 'Bookmarks bar' ||
          node.title === 'Bookmarks Bar' ||
          node.id === '1')
      ) {
        bar = node;
        return;
      }
      if (node.children) findBar(node.children);
    }
  };
  findBar(tree);
  return bar;
}

async function findOtherBookmarksFolder(): Promise<BookmarkNode | undefined> {
  const tree = await getBookmarkTree();
  let other: BookmarkNode | undefined;

  const findOther = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      if (
        !node.url &&
        (node.title === '其他书签' ||
          node.title === 'Other Bookmarks' ||
          node.id === '2')
      ) {
        other = node;
        return;
      }
      if (node.children) findOther(node.children);
    }
  };
  findOther(tree);
  return other;
}

async function getUserFolders(): Promise<BookmarkNode[]> {
  const all = await getFolders();
  return all.filter(
    (f) => f.title && !SYSTEM_FOLDER_NAMES.has(f.title) && !SCATTERED_PARENT_IDS.has(f.id),
  );
}

/** 后序遍历收集并删除用户自建文件夹 */
async function clearUserFolderStructure(): Promise<void> {
  const tree = await getBookmarkTree();
  const toDelete: string[] = [];

  const walk = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      if (node.children?.length) {
        walk(node.children);
      }
      if (
        !node.url &&
        node.title &&
        !SYSTEM_FOLDER_NAMES.has(node.title) &&
        !SCATTERED_PARENT_IDS.has(node.id)
      ) {
        toDelete.push(node.id);
      }
    }
  };
  walk(tree);

  for (const id of toDelete) {
    try {
      await chrome.bookmarks.removeTree(id);
    } catch {
      // 可能已被删除
    }
  }
}

function normalizeCategoryName(
  category: string,
  folders: BookmarkNode[],
): { name: string; folderId?: string } {
  const trimmed = category.trim();
  const lower = trimmed.toLowerCase();

  for (const f of folders) {
    if (f.title.toLowerCase() === lower) {
      return { name: f.title, folderId: f.id };
    }
  }

  for (const f of folders) {
    const ft = f.title.toLowerCase();
    if (ft.includes(lower) || lower.includes(ft)) {
      return { name: f.title, folderId: f.id };
    }
  }

  return { name: trimmed };
}

function resolveCategory(
  raw: string,
  existingFolders: string[],
  registry: Map<string, string>,
  newCategoryCount?: { value: number },
): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (registry.has(lower)) {
    return registry.get(lower)!;
  }

  for (const f of existingFolders) {
    if (f.toLowerCase() === lower) {
      registry.set(lower, f);
      return f;
    }
  }

  for (const f of existingFolders) {
    if (f.toLowerCase().includes(lower) || lower.includes(f.toLowerCase())) {
      registry.set(lower, f);
      return f;
    }
  }

  if (
    newCategoryCount &&
    newCategoryCount.value >= MAX_NEW_CATEGORIES_ORGANIZE
  ) {
    if (!registry.has('其他')) {
      registry.set('其他', '其他');
      newCategoryCount.value++;
    }
    return '其他';
  }

  registry.set(lower, trimmed);
  if (newCategoryCount) {
    newCategoryCount.value++;
  }
  return trimmed;
}

/** 将暂存区（其他书签根目录）剩余书签移入书签栏「其他」文件夹 */
async function flushStagingBookmarks(
  stagingId: string,
  registry: Map<string, string>,
): Promise<number> {
  const tree = await getBookmarkTree();
  const stagingNode = findNodeById(tree, stagingId);
  if (!stagingNode?.children?.length) return 0;

  const leftovers = stagingNode.children.filter((n) => n.url);
  if (leftovers.length === 0) return 0;

  registry.set('其他', '其他');
  let moved = 0;
  for (const node of leftovers) {
    try {
      await applyClassification(
        node.id,
        { category: '其他', confidence: 0.5 },
        { createUnder: 'bookmarksBar' },
      );
      moved++;
    } catch {
      // 单条失败不阻断
    }
  }
  return moved;
}

async function countStagingBookmarks(stagingId: string): Promise<number> {
  const tree = await getBookmarkTree();
  const stagingNode = findNodeById(tree, stagingId);
  return stagingNode?.children?.filter((n) => n.url).length ?? 0;
}

function findNodeById(
  nodes: BookmarkNode[],
  id: string,
): BookmarkNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

function parseOrganizeAssignments(
  rawText: string,
  expectedIds?: string[],
): { id: string; category: string }[] {
  let jsonText = rawText;
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonText = fenceMatch[1];

  const normalizeId = (id: string) => String(id).replace(/^id:/, '').trim();

  const fromParsed = (parsed: unknown): { id: string; category: string }[] => {
    const list: { id: string; category: string }[] =
      (parsed as { assignments?: { id: string; category: string }[] })
        ?.assignments ?? [];
    return list
      .filter((a) => a.id && a.category)
      .map((a) => ({
        id: normalizeId(String(a.id)),
        category: String(a.category).trim(),
      }));
  };

  try {
    const parsed = JSON.parse(jsonText.trim());
    const result = fromParsed(parsed);
    if (result.length > 0) return result;
  } catch {
    // fall through to regex extraction
  }

  const assignments: { id: string; category: string }[] = [];
  const re =
    /"id"\s*:\s*"([^"]+)"\s*,\s*"category"\s*:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(rawText)) !== null) {
    assignments.push({
      id: normalizeId(match[1]),
      category: match[2].trim(),
    });
  }
  if (assignments.length > 0) return assignments;

  if (expectedIds?.length) {
    const byTitle = extractAssignmentsByTitle(rawText, expectedIds);
    if (byTitle.length > 0) return byTitle;
  }

  return [];
}

function extractAssignmentsByTitle(
  rawText: string,
  expectedIds: string[],
): { id: string; category: string }[] {
  const results: { id: string; category: string }[] = [];
  for (const id of expectedIds) {
    const patterns = [
      new RegExp(`\\[id:${id}\\][^\\n]*?[:：]\\s*["']?([^"'\\n,]+)`, 'i'),
      new RegExp(`"id"\\s*:\\s*"${id}"[^}]*"category"\\s*:\\s*"([^"]+)"`, 'i'),
    ];
    for (const pattern of patterns) {
      const m = rawText.match(pattern);
      if (m?.[1]) {
        results.push({ id, category: m[1].trim() });
        break;
      }
    }
  }
  return results;
}
