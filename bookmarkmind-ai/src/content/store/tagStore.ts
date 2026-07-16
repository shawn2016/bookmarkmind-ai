// ============================================================
// AI 书签管家 v2 — 标签 Zustand Store
// ============================================================
import { create } from 'zustand';
import type { Tag } from '@shared/types';
import { safeSendMessage } from '@shared/utils/chrome-api';

export interface TagStore {
  tags: Tag[];
  bookmarkTags: Map<string, Tag[]>; // bookmarkId -> Tag[]
  selectedTagIds: Set<string>;
  filterMode: 'and' | 'or';

  // Actions
  loadTags: () => Promise<void>;
  loadBookmarkTags: (bookmarkId: string) => Promise<void>;
  createTag: (name: string, path: string, color?: string) => Promise<string>;
  updateTag: (id: string, changes: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  mergeTags: (sourceId: string, targetId: string) => Promise<void>;
  setBookmarkTags: (bookmarkId: string, tagIds: string[]) => Promise<void>;
  toggleTagSelection: (tagId: string) => void;
  setFilterMode: (mode: 'and' | 'or') => void;
  clearSelection: () => void;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  bookmarkTags: new Map<string, Tag[]>(),
  selectedTagIds: new Set<string>(),
  filterMode: 'or',

  loadTags: async () => {
    const response = await safeSendMessage({ type: 'TAG_LIST' }) as Record<string, unknown> | null;
    if (response?.tags) {
      set({ tags: response.tags as Tag[] });
    }
  },

  loadBookmarkTags: async (bookmarkId: string) => {
    const response = await safeSendMessage({
      type: 'TAG_GET_BOOKMARK_TAGS',
      payload: { bookmarkId },
    }) as Record<string, unknown> | null;
    if (response?.tags) {
      const tags = response.tags as Tag[];
      set((state) => {
        const next = new Map(state.bookmarkTags);
        next.set(bookmarkId, tags);
        return { bookmarkTags: next };
      });
    }
  },

  createTag: async (name: string, path: string, color?: string) => {
    const response = await safeSendMessage({
      type: 'TAG_CREATE',
      payload: { name, path, color },
    }) as Record<string, unknown> | null;
    if (response?.tag) {
      const tag = response.tag as Tag;
      set((state) => ({ tags: [...state.tags, tag] }));
      return tag.id;
    }
    throw new Error('创建标签失败');
  },

  updateTag: async (id: string, changes: Partial<Tag>) => {
    await safeSendMessage({
      type: 'TAG_UPDATE',
      payload: { id, changes },
    });
    set((state) => ({
      tags: state.tags.map((t) => (t.id === id ? { ...t, ...changes } : t)),
    }));
  },

  deleteTag: async (id: string) => {
    await safeSendMessage({
      type: 'TAG_DELETE',
      payload: { id },
    });
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== id),
      selectedTagIds: (() => {
        const next = new Set(state.selectedTagIds);
        next.delete(id);
        return next;
      })(),
    }));
  },

  mergeTags: async (sourceId: string, targetId: string) => {
    await safeSendMessage({
      type: 'TAG_MERGE',
      payload: { sourceId, targetId },
    });
    set((state) => ({
      tags: state.tags.filter((t) => t.id !== sourceId),
      selectedTagIds: (() => {
        const next = new Set(state.selectedTagIds);
        next.delete(sourceId);
        return next;
      })(),
    }));
  },

  setBookmarkTags: async (bookmarkId: string, tagIds: string[]) => {
    const response = await safeSendMessage({
      type: 'TAG_SET_BOOKMARK_TAGS',
      payload: { bookmarkId, tagIds },
    }) as Record<string, unknown> | null;
    if (response?.tags) {
      const tags = response.tags as Tag[];
      set((state) => {
        const next = new Map(state.bookmarkTags);
        if (tags.length === 0) {
          next.delete(bookmarkId);
        } else {
          next.set(bookmarkId, tags);
        }
        return { bookmarkTags: next };
      });
    }
  },

  toggleTagSelection: (tagId: string) => {
    set((state) => {
      const next = new Set(state.selectedTagIds);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return { selectedTagIds: next };
    });
  },

  setFilterMode: (mode: 'and' | 'or') => set({ filterMode: mode }),

  clearSelection: () => set({ selectedTagIds: new Set<string>() }),
}));
