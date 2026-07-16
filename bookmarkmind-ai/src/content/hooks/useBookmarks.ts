// ============================================================
// useBookmarks — bookmark list management hook
// ============================================================

import { useCallback, useRef } from "react";
import { useContentStore } from "@content/store/contentStore";
import type { BookmarkItem } from "@shared/types";
import { debounce } from "@shared/utils/debounce";
import { safeSendMessage } from "@shared/utils/chrome-api";

/**
 * Bookmark hook — load, search, filter, batch operations.
 */
export function useBookmarks() {
  const { setBookmarks, setFilteredBookmarks, bookmarks } = useContentStore();

  const bookmarksRef = useRef<BookmarkItem[]>([]);
  const activeCategoryRef = useRef<string | null>(null);

  useContentStore.subscribe(state => {
    bookmarksRef.current = state.bookmarks;
    activeCategoryRef.current = state.activeCategory;
  });

  const loadBookmarks = useCallback(async () => {
    const response = await safeSendMessage<{ bookmarks?: BookmarkItem[] }>({
      type: "BOOKMARK_LIST",
      payload: {},
    });

    if (response?.bookmarks && Array.isArray(response.bookmarks)) {
      const items: BookmarkItem[] = response.bookmarks;
      setBookmarks(items);
      setFilteredBookmarks(items);
    }
  }, [setBookmarks, setFilteredBookmarks]);

  const searchBookmarks = useCallback(
    (query: string) => {
      const doSearch = () => {
        const q = query.toLowerCase().trim();
        const category = activeCategoryRef.current;
        let filtered = bookmarksRef.current;

        if (q) {
          filtered = filtered.filter(
            b =>
              b.title.toLowerCase().includes(q) ||
              b.url.toLowerCase().includes(q),
          );
        }

        if (category) {
          filtered = filtered.filter(b => b.parentId === category);
        }

        setFilteredBookmarks(filtered);
      };

      debounce(doSearch, 300)();
    },
    [setFilteredBookmarks],
  );

  const filterByCategory = useCallback(
    (cat: string | null) => {
      useContentStore.getState().setActiveCategory(cat);

      let filtered = bookmarksRef.current;
      if (cat) {
        filtered = filtered.filter(b => b.parentId === cat);
      }
      setFilteredBookmarks(filtered);
    },
    [setFilteredBookmarks],
  );

  const batchDelete = useCallback(
    async (ids: string[]) => {
      const response = await safeSendMessage({
        type: "BOOKMARK_BATCH_DELETE",
        payload: { ids },
      });

      if (response) {
        await loadBookmarks();
        useContentStore.getState().clearSelected();
        useContentStore.getState().pushToast({
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
    [loadBookmarks],
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
    batchDelete,
    batchMove,
    checkBookmarked,
  };
}
