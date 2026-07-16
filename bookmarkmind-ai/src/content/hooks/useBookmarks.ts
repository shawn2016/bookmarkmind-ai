// ============================================================
// useBookmarks — bookmark list management hook
// ============================================================

import { useCallback, useRef } from "react";
import { useContentStore } from "@content/store/contentStore";
import { useTagStore } from "@content/store/tagStore";
import type { BookmarkItem } from "@shared/types";
import { debounce } from "@shared/utils/debounce";
import { safeSendMessage } from "@shared/utils/chrome-api";

function applyBookmarkFilters(
  bookmarks: BookmarkItem[],
  query: string,
  category: string | null,
  selectedTagIds: Set<string>,
  filterMode: "and" | "or",
  tagMap: Record<string, string[]>,
): BookmarkItem[] {
  let filtered = bookmarks;
  const q = query.toLowerCase().trim();

  if (q) {
    filtered = filtered.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q),
    );
  }

  if (category) {
    filtered = filtered.filter((b) => b.parentId === category);
  }

  if (selectedTagIds.size > 0) {
    const ids = Array.from(selectedTagIds);
    filtered = filtered.filter((b) => {
      const bTags = tagMap[b.id] ?? [];
      if (filterMode === "and") {
        return ids.every((tid) => bTags.includes(tid));
      }
      return ids.some((tid) => bTags.includes(tid));
    });
  }

  return filtered;
}

/**
 * Bookmark hook — load, search, filter, batch operations.
 */
export function useBookmarks() {
  const { setBookmarks, setFilteredBookmarks, bookmarks } = useContentStore();

  const bookmarksRef = useRef<BookmarkItem[]>([]);
  const activeCategoryRef = useRef<string | null>(null);
  const searchQueryRef = useRef("");
  const selectedTagIdsRef = useRef<Set<string>>(new Set());
  const filterModeRef = useRef<"and" | "or">("or");
  const tagMapRef = useRef<Record<string, string[]>>({});

  useContentStore.subscribe((state) => {
    bookmarksRef.current = state.bookmarks;
    activeCategoryRef.current = state.activeCategory;
    searchQueryRef.current = state.searchQuery;
  });

  useTagStore.subscribe((state) => {
    selectedTagIdsRef.current = state.selectedTagIds;
    filterModeRef.current = state.filterMode;
    tagMapRef.current = state.bookmarkTagMap;
  });

  const reapplyFilters = useCallback(() => {
    const filtered = applyBookmarkFilters(
      bookmarksRef.current,
      searchQueryRef.current,
      activeCategoryRef.current,
      selectedTagIdsRef.current,
      filterModeRef.current,
      tagMapRef.current,
    );
    setFilteredBookmarks(filtered);
  }, [setFilteredBookmarks]);

  const loadBookmarks = useCallback(async () => {
    const response = await safeSendMessage<{ bookmarks?: BookmarkItem[] }>({
      type: "BOOKMARK_LIST",
      payload: {},
    });

    if (response?.bookmarks && Array.isArray(response.bookmarks)) {
      const items: BookmarkItem[] = response.bookmarks;
      setBookmarks(items);
      const filtered = applyBookmarkFilters(
        items,
        searchQueryRef.current,
        activeCategoryRef.current,
        selectedTagIdsRef.current,
        filterModeRef.current,
        tagMapRef.current,
      );
      setFilteredBookmarks(filtered);
    }
  }, [setBookmarks, setFilteredBookmarks]);

  const searchBookmarks = useCallback(
    (query: string) => {
      const doSearch = () => {
        searchQueryRef.current = query;
        reapplyFilters();
      };

      debounce(doSearch, 300)();
    },
    [reapplyFilters],
  );

  const filterByCategory = useCallback(
    (cat: string | null) => {
      useContentStore.getState().setActiveCategory(cat);
      activeCategoryRef.current = cat;
      reapplyFilters();
    },
    [reapplyFilters],
  );

  const removeBookmark = useCallback(async (id: string): Promise<boolean> => {
    const response = await safeSendMessage<{ success?: boolean; error?: string }>({
      type: "BOOKMARK_REMOVE",
      payload: { id },
    });

    if (!response?.success) {
      return false;
    }

    const store = useContentStore.getState();
    store.setBookmarks(store.bookmarks.filter((b) => b.id !== id));
    store.setFilteredBookmarks(
      store.filteredBookmarks.filter((b) => b.id !== id),
    );
    if (store.selectedIds.has(id)) {
      const next = new Set(store.selectedIds);
      next.delete(id);
      useContentStore.setState({ selectedIds: next });
    }
    return true;
  }, []);

  const batchDelete = useCallback(
    async (ids: string[]) => {
      const response = await safeSendMessage<{ success?: boolean }>({
        type: "BOOKMARK_BATCH_DELETE",
        payload: { ids },
      });

      if (response?.success) {
        const store = useContentStore.getState();
        const idSet = new Set(ids);
        store.setBookmarks(store.bookmarks.filter((b) => !idSet.has(b.id)));
        store.setFilteredBookmarks(
          store.filteredBookmarks.filter((b) => !idSet.has(b.id)),
        );
        const nextSelected = new Set(store.selectedIds);
        ids.forEach((id) => nextSelected.delete(id));
        useContentStore.setState({ selectedIds: nextSelected });
        store.pushToast({
          type: "success",
          message: `已删除 ${ids.length} 个书签`,
        });
      } else {
        useContentStore.getState().pushToast({
          type: "error",
          message: "删除失败，请重试",
        });
      }
    },
    [],
  );

  const batchMove = useCallback(
    async (ids: string[], folderId: string) => {
      const response = await safeSendMessage({
        type: "BOOKMARK_BATCH_MOVE",
        payload: { ids, folderId },
      });

      if (response) {
        await loadBookmarks();
        useContentStore.getState().clearSelected();
        useContentStore.getState().pushToast({
          type: "success",
          message: `已移动 ${ids.length} 个书签`,
        });
      } else {
        useContentStore.getState().pushToast({
          type: "error",
          message: "移动失败，请重试",
        });
      }
    },
    [loadBookmarks],
  );

  const checkBookmarked = useCallback(async (url: string): Promise<boolean> => {
    const response = await safeSendMessage<{ bookmarked?: boolean }>({
      type: "CHECK_BOOKMARKED",
      payload: { url },
    });
    return response?.bookmarked ?? false;
  }, []);

  return {
    bookmarks,
    loadBookmarks,
    searchBookmarks,
    filterByCategory,
    reapplyFilters,
    removeBookmark,
    batchDelete,
    batchMove,
    checkBookmarked,
  };
}
