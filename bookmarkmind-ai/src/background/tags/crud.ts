// ============================================================
// AI 书签管家 v2 — 标签 CRUD 存储层
// ============================================================
import type { Tag, BookmarkTag, TagSource } from '@shared/types';
import { STORAGE_KEYS } from '@shared/types';

// ---- In-memory cache with Map index (O(1) lookups) ----

let tagsCache: Tag[] | null = null;
let bookmarkTagsCache: Map<string, string[]> | null = null; // bookmarkId -> tagId[]

async function loadTags(): Promise<Tag[]> {
  if (tagsCache) return tagsCache;
  const raw = await chrome.storage.local.get(STORAGE_KEYS.TAGS);
  tagsCache = (raw[STORAGE_KEYS.TAGS] as Tag[] | undefined) ?? [];
  return tagsCache;
}

function saveTags(tags: Tag[]): Promise<void> {
  tagsCache = tags;
  return chrome.storage.local.set({ [STORAGE_KEYS.TAGS]: tags });
}

async function loadBookmarkTags(): Promise<Map<string, string[]>> {
  if (bookmarkTagsCache) return bookmarkTagsCache;
  const raw = await chrome.storage.local.get(STORAGE_KEYS.BOOKMARK_TAGS);
  const bts = (raw[STORAGE_KEYS.BOOKMARK_TAGS] as BookmarkTag[] | undefined) ?? [];
  const map = new Map<string, string[]>();
  for (const bt of bts) {
    const existing = map.get(bt.bookmarkId);
    if (existing) {
      existing.push(bt.tagId);
    } else {
      map.set(bt.bookmarkId, [bt.tagId]);
    }
  }
  bookmarkTagsCache = map;
  return map;
}

function saveBookmarkTagsMap(map: Map<string, string[]>): Promise<void> {
  bookmarkTagsCache = map;
  const bts: BookmarkTag[] = [];
  for (const [bookmarkId, tagIds] of map) {
    for (const tagId of tagIds) {
      bts.push({ bookmarkId, tagId, createdAt: Date.now() });
    }
  }
  return chrome.storage.local.set({ [STORAGE_KEYS.BOOKMARK_TAGS]: bts });
}

// ---- CRUD Operations ----

export async function getAllTags(): Promise<Tag[]> {
  return loadTags();
}

export async function getTagById(id: string): Promise<Tag | undefined> {
  const tags = await loadTags();
  return tags.find((t) => t.id === id);
}

export async function createTag(
  name: string,
  path: string,
  color?: string,
  source: TagSource = 'manual',
): Promise<Tag> {
  const tags = await loadTags();

  // Check for duplicate name at same path
  const exists = tags.some((t) => t.name === name && t.path === path);
  if (exists) {
    throw new Error(`标签 "${name}" 已存在于路径 "${path}" 中`);
  }

  const tag: Tag = {
    id: crypto.randomUUID(),
    name,
    path,
    color: color ?? generateTagColor(name),
    createdAt: Date.now(),
    source,
  };

  tags.push(tag);
  await saveTags(tags);
  return tag;
}

export async function updateTag(
  id: string,
  changes: Partial<Pick<Tag, 'name' | 'path' | 'color'>>,
): Promise<void> {
  const tags = await loadTags();
  const idx = tags.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`标签不存在: ${id}`);

  if (changes.name !== undefined) {
    // Update path as well if name changes (last segment of path)
    const oldPath = tags[idx].path;
    const parts = oldPath.split('/');
    parts[parts.length - 1] = changes.name;
    changes.path = parts.join('/');
  }

  tags[idx] = { ...tags[idx], ...changes };
  await saveTags(tags);
}

export async function deleteTag(id: string): Promise<void> {
  const tags = await loadTags();
  const map = await loadBookmarkTags();

  // Remove from tags array
  const idx = tags.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`标签不存在: ${id}`);
  tags.splice(idx, 1);

  // Remove all bookmark-tag associations for this tag
  for (const [bookmarkId, tagIds] of map) {
    const filtered = tagIds.filter((tid) => tid !== id);
    if (filtered.length === 0) {
      map.delete(bookmarkId);
    } else {
      map.set(bookmarkId, filtered);
    }
  }

  await Promise.all([saveTags(tags), saveBookmarkTagsMap(map)]);
}

export async function mergeTags(sourceId: string, targetId: string): Promise<void> {
  if (sourceId === targetId) throw new Error('不能将标签合并到自身');

  const tag = await getTagById(sourceId);
  const target = await getTagById(targetId);
  if (!tag) throw new Error(`标签不存在: ${sourceId}`);
  if (!target) throw new Error(`标签不存在: ${targetId}`);

  // Move all bookmark associations from source to target
  const map = await loadBookmarkTags();
  for (const [bookmarkId, tagIds] of map) {
    const idx = tagIds.indexOf(sourceId);
    if (idx !== -1) {
      tagIds.splice(idx, 1);
      if (!tagIds.includes(targetId)) {
        tagIds.push(targetId);
      }
      map.set(bookmarkId, tagIds);
    }
  }

  // Delete source tag
  await deleteTag(sourceId);
  await saveBookmarkTagsMap(map);
}

// ---- Bookmark-Tag Association ----

export async function getBookmarkTags(bookmarkId: string): Promise<Tag[]> {
  const [tags, map] = await Promise.all([loadTags(), loadBookmarkTags()]);
  const tagIds = map.get(bookmarkId) ?? [];
  return tags.filter((t) => tagIds.includes(t.id));
}

export async function getBookmarkTagMap(): Promise<Record<string, string[]>> {
  const map = await loadBookmarkTags();
  const result: Record<string, string[]> = {};
  for (const [bookmarkId, tagIds] of map) {
    result[bookmarkId] = tagIds;
  }
  return result;
}

export async function getBookmarkTagIds(bookmarkId: string): Promise<string[]> {
  const map = await loadBookmarkTags();
  return map.get(bookmarkId) ?? [];
}

export async function setBookmarkTags(
  bookmarkId: string,
  tagIds: string[],
): Promise<void> {
  const map = await loadBookmarkTags();
  if (tagIds.length === 0) {
    map.delete(bookmarkId);
  } else {
    map.set(bookmarkId, tagIds);
  }
  await saveBookmarkTagsMap(map);
}

export async function addBookmarkTag(
  bookmarkId: string,
  tagId: string,
): Promise<void> {
  const map = await loadBookmarkTags();
  const existing = map.get(bookmarkId) ?? [];
  if (!existing.includes(tagId)) {
    existing.push(tagId);
    map.set(bookmarkId, existing);
    await saveBookmarkTagsMap(map);
  }
}

export async function removeBookmarkTag(
  bookmarkId: string,
  tagId: string,
): Promise<void> {
  const map = await loadBookmarkTags();
  const existing = map.get(bookmarkId);
  if (existing) {
    const filtered = existing.filter((id) => id !== tagId);
    if (filtered.length === 0) {
      map.delete(bookmarkId);
    } else {
      map.set(bookmarkId, filtered);
    }
    await saveBookmarkTagsMap(map);
  }
}

// ---- Helpers ----

const TAG_COLORS = [
  '#E24B4A', '#BA7517', '#3679A4', '#468A45', '#8E44AD',
  '#E67E22', '#2980B9', '#27AE60', '#D35400', '#7F8C8D',
];

function generateTagColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}
