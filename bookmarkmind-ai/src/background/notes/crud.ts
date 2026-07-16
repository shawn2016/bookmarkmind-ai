// ============================================================
// AI 书签管家 v2 — 备注存储层
// ============================================================
import type { BookmarkNote } from '@shared/types';
import { STORAGE_KEYS } from '@shared/types';

const MAX_CONTENT_LENGTH = 500;

let notesCache: Map<string, BookmarkNote> | null = null;

async function loadNotes(): Promise<Map<string, BookmarkNote>> {
  if (notesCache) return notesCache;
  const raw = await chrome.storage.local.get(STORAGE_KEYS.NOTES);
  const notes = (raw[STORAGE_KEYS.NOTES] as BookmarkNote[] | undefined) ?? [];
  notesCache = new Map(notes.map((n) => [n.bookmarkId, n]));
  return notesCache;
}

async function saveNotes(map: Map<string, BookmarkNote>): Promise<void> {
  notesCache = map;
  const arr = Array.from(map.values());
  await chrome.storage.local.set({ [STORAGE_KEYS.NOTES]: arr });
}

export async function getNote(bookmarkId: string): Promise<BookmarkNote | null> {
  const map = await loadNotes();
  return map.get(bookmarkId) ?? null;
}

export async function setNote(
  bookmarkId: string,
  content: string,
): Promise<BookmarkNote> {
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(`备注内容不能超过 ${MAX_CONTENT_LENGTH} 个字符 (当前 ${content.length})`);
  }

  const map = await loadNotes();
  const now = Date.now();

  const note: BookmarkNote = {
    bookmarkId,
    content,
    createdAt: map.get(bookmarkId)?.createdAt ?? now,
    updatedAt: now,
  };

  map.set(bookmarkId, note);
  await saveNotes(map);
  return note;
}

export async function deleteNote(bookmarkId: string): Promise<void> {
  const map = await loadNotes();
  map.delete(bookmarkId);
  await saveNotes(map);
}

export async function getNotesForBookmarks(
  bookmarkIds: string[],
): Promise<Map<string, BookmarkNote>> {
  const map = await loadNotes();
  const result = new Map<string, BookmarkNote>();
  for (const id of bookmarkIds) {
    const note = map.get(id);
    if (note) result.set(id, note);
  }
  return result;
}

/**
 * Clear note cache (useful for testing or forced refresh).
 */
export function clearNotesCache(): void {
  notesCache = null;
}

/**
 * Get all bookmark IDs that have notes (for badge display).
 */
export async function getBookmarksWithNotes(): Promise<Set<string>> {
  const map = await loadNotes();
  return new Set(map.keys());
}
