// ============================================================
// AI 书签管家 — Prompt Templates
// ============================================================

interface BookmarkForSearch {
  title: string;
  url: string;
}

interface BookmarkForClassify {
  title: string;
  url: string;
  description?: string;
}

/**
 * Build a search prompt that asks the AI to find relevant bookmarks
 * from the user's list based on a natural language query.
 */
export function buildSearchPrompt(
  query: string,
  bookmarks: BookmarkForSearch[],
): string {
  const bookmarkList = bookmarks
    .map((b, i) => `${i + 1}. ${b.title}\n   ${b.url}`)
    .join('\n');

  return `You are a bookmark search assistant. Given the user's query and their bookmark list, return the most relevant bookmarks.

## User Query
${query}

## Bookmark List
${bookmarkList}

## Instructions
- Find bookmarks that are semantically relevant to the query, not just keyword matches.
- Consider the bookmark title and URL domain when determining relevance.
- Return at most 10 results, ranked by relevance.
- If no bookmarks match, return an empty results array.

Respond in JSON format:
{
  "results": [
    {
      "title": "Bookmark title",
      "url": "https://...",
      "reason": "Why this bookmark is relevant to the query (in Chinese)"
    }
  ]
}`;
}

/**
 * Build a classify prompt that asks the AI to categorize a bookmark
 * into one of the existing folders or suggest a new one.
 */
export function buildClassifyPrompt(
  bookmark: BookmarkForClassify,
  existingFolders: string[],
  options?: { preferExisting?: boolean; maxNewCategories?: number },
): string {
  const preferExisting = options?.preferExisting ?? true;
  const maxNew = options?.maxNewCategories ?? 8;

  const folderList =
    existingFolders.length > 0
      ? existingFolders.map((f) => `- ${f}`).join('\n')
      : '(暂无用户文件夹)';

  const description = bookmark.description ? `\nDescription: ${bookmark.description}` : '';

  return `You are a bookmark organizer. Categorize the following bookmark into an appropriate folder.

## Bookmark
Title: ${bookmark.title}
URL: ${bookmark.url}${description}

## Existing Folders (use these first)
${folderList}

## Rules
${preferExisting ? '- **Strongly prefer** matching an existing folder. Only suggest a new folder if nothing fits.' : ''}
- New category names must be concise Chinese (2-4 chars), e.g. 开发、设计、阅读、工具、资讯
- Do NOT create overly specific categories (avoid per-site folders)
- Maximum ${maxNew} distinct new categories allowed across all bookmarks
- If uncertain, use "其他"
- confidence: 0.9 = perfect fit existing folder, 0.6 = reasonable new category, 0.3 = uncertain

Respond in JSON only:
{
  "category": "Folder name",
  "confidence": 0.85
}`;
}

/**
 * Build batch reorganize prompt — ignore existing folders, create fresh taxonomy.
 */
export function buildReorganizeAllPrompt(
  bookmarks: { id: string; title: string; url: string }[],
  maxCategories: number,
): string {
  const list = bookmarks
    .map((b) => `- [id:${b.id}] ${b.title} | ${b.url}`)
    .join('\n');

  return `请对以下全部书签重新分类整理（忽略任何既有文件夹结构）。

## 待分类书签（${bookmarks.length} 个）
${list}

## 分类策略（严格遵守）
1. 从零设计分类体系，新建分类最多 ${maxCategories} 个
2. 分类名称 2-4 个汉字，粒度适中，不要过细
3. 禁止按单个网站、日期、域名分文件夹
4. 推荐示例：开发、设计、阅读、工具、资讯、购物、社交、学习、娱乐、其他
5. 每个书签必须有一个分类；无法判断的归入「其他」
6. 返回时使用书签的 id 字段（方括号内的 id:xxx）

返回 JSON：
{
  "assignments": [
    { "id": "书签id", "category": "文件夹名" }
  ],
  "summary": "一句话说明整理结果"
}`;
}

/**
 * Build batch organize prompt for scattered bookmarks.
 */
export function buildBatchOrganizePrompt(
  bookmarks: { id: string; title: string; url: string }[],
  existingFolders: string[],
  maxNewCategories: number,
): string {
  const list = bookmarks
    .map((b) => `- [id:${b.id}] ${b.title} | ${b.url}`)
    .join('\n');

  const folders =
    existingFolders.length > 0
      ? existingFolders.join('、')
      : '（暂无，可新建）';

  return `整理以下零散书签到合适文件夹。

## 现有文件夹（优先使用，不要重复创建相似名称）
${folders}

## 待整理书签（${bookmarks.length} 个）
${list}

## 整理策略（严格遵守）
1. **优先归入现有文件夹**，名称相似则合并（如「开发工具」→「开发」）
2. 新建分类最多 ${maxNewCategories} 个，名称 2-4 个汉字，粒度适中
3. 禁止过细分类：不要按单个网站、不要按日期分文件夹
4. 推荐分类体系示例：开发、设计、阅读、工具、资讯、购物、社交、学习、娱乐、其他
5. 每个书签必须有一个分类；无法判断的归入「其他」
6. 返回时使用书签的 id 字段（方括号内的 id:xxx）

返回 JSON：
{
  "assignments": [
    { "id": "书签id", "category": "文件夹名" }
  ],
  "summary": "一句话说明整理结果"
}`;
}

/**
 * Build an intent parsing prompt that extracts the user's intended
 * bookmark operation from natural language.
 */
export function buildIntentPrompt(message: string): string {
  return `You are a bookmark management assistant. Parse the user's natural language request into a structured action.

## User Message
${message}

## Available Actions
- "search": User wants to find bookmarks matching a description
- "move": User wants to move bookmarks to a folder
- "delete": User wants to delete/remove bookmarks
- "organize": User wants to clean up, classify, or reorganize bookmarks
- "stats": User wants to see bookmark statistics or usage info
- "unknown": Cannot determine the intent

## Instructions
- Extract the core intent from the message.
- For "search", extract the search query as params.query.
- For "move", extract params.bookmarkId or params.bookmarkTitle, and params.folder.
- For "delete", extract params.bookmarkId or params.bookmarkTitle.
- For "organize", extract params.scope (e.g., "all", "unsorted", "folder name").
- Provide a brief description of what you understood.

Respond in JSON format:
{
  "action": "search",
  "params": { "query": "..." },
  "description": "I'll search for bookmarks about..."
}`;
}

/**
 * Build a general chat prompt for direct model conversation
 * with bookmark context.
 */
export function buildChatSystemPrompt(
  bookmarkCount: number,
  folderNames: string[],
  localMatches: { title: string; url: string }[],
): string {
  const folders =
    folderNames.length > 0
      ? folderNames.slice(0, 20).join('、')
      : '（暂无文件夹）';

  const matches =
    localMatches.length > 0
      ? localMatches
          .map((b, i) => `${i + 1}. ${b.title} — ${b.url}`)
          .join('\n')
      : '（无本地关键词匹配）';

  return `你是「AI 书签管家」智能助手，帮助用户管理浏览器书签。

## 用户书签概况
- 书签总数：${bookmarkCount}
- 文件夹：${folders}

## 本地关键词匹配（供参考）
${matches}

## 你的能力
1. **搜索书签**：根据用户描述找到相关书签，列出标题和链接
2. **整理分类**：帮助用户归类、整理书签
3. **日常对话**：友好回答用户问题，介绍如何使用本扩展

## 回复要求
- 使用中文回复
- 简洁实用，必要时用列表展示书签
- 结合对话上下文理解用户意图（如「再找找」「刚才那些」等指代）
- 如果用户要搜索书签，优先从本地匹配结果中推荐，也可根据语义推断
- 如果用户要整理/分类，说明可以切换到「书签」Tab 点击「智能分类」按钮
- 不要编造不存在的书签 URL`;
}

/**
 * Build a prompt for AI to suggest tags for a bookmark.
 * Returns both a category and relevant tags.
 */
export function buildClassifyWithTagsPrompt(
  bookmark: BookmarkForClassify,
  existingFolders: string[],
  existingTags: string[],
  options?: { preferExisting?: boolean },
): string {
  const preferExisting = options?.preferExisting ?? true;

  const folderList =
    existingFolders.length > 0
      ? existingFolders.map((f) => `- ${f}`).join('\n')
      : '(暂无用户文件夹)';

  const tagList =
    existingTags.length > 0
      ? existingTags.join('、')
      : '(暂无标签)';

  return `You are a bookmark organizer. Categorize this bookmark and suggest relevant tags.

## Bookmark
Title: ${bookmark.title}
URL: ${bookmark.url}

## Existing Folders (use these first for category)
${folderList}

## Existing Tags (use these first for tags)
${tagList}

## Rules
${preferExisting ? '- **Strongly prefer** matching existing folders and tags.' : ''}
- Category name must be concise Chinese (2-4 chars)
- Tags should be 1-3 relevant keywords describing the content/topic
- Suggest 2-5 tags maximum
- Prefer reusing existing tags over creating new ones
- Example tags: react, frontend, tutorial, github, design, api, docs, tool

Respond in JSON only:
{
  "category": "Folder name",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.85
}`;
}
