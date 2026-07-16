// ============================================================
// AI 书签管家 — Bookmark CRUD Operations
// ============================================================
import type { BookmarkItem, BookmarkNode, RecycleItem } from '@shared/types';
import { addToRecycleBin, getConfig } from '../storage';

// ---- Tree traversal ----

/**
 * Get the full bookmark tree from chrome.bookmarks API.
 */
export async function getBookmarkTree(): Promise<BookmarkNode[]> {
  const tree = await chrome.bookmarks.getTree();
  return tree as BookmarkNode[];
}

/**
 * Flatten the bookmark tree into a list of BookmarkItem objects,
 * including parent folder title.
 */
export async function getAllBookmarks(): Promise<BookmarkItem[]> {
  const tree = await getBookmarkTree();

  // Build a parent-title map first
  const folderTitles = new Map<string, string>();
  const walkFolders = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      if (!node.url && node.title) {
        folderTitles.set(node.id, node.title);
      }
      if (node.children) {
        walkFolders(node.children);
      }
    }
  };
  walkFolders(tree);

  // Flatten bookmark nodes
  const result: BookmarkItem[] = [];
  const walkBookmarks = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      if (node.url) {
        result.push({
          id: node.id,
          title: node.title,
          url: node.url,
          dateAdded: node.dateAdded ?? 0,
          parentId: node.parentId ?? '',
          parentTitle: folderTitles.get(node.parentId ?? '') ?? '根目录',
        });
      }
      if (node.children) {
        walkBookmarks(node.children);
      }
    }
  };
  walkBookmarks(tree);

  return result;
}

// ---- CRUD ----

/**
 * Create a new bookmark. Throws if the URL is already bookmarked.
 */
export async function createBookmark(
  url: string,
  title: string,
  parentId?: string,
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  const createArgs: chrome.bookmarks.BookmarkCreateArg = {
    title,
    url,
  };
  if (parentId) {
    createArgs.parentId = parentId;
  }

  return chrome.bookmarks.create(createArgs);
}

/**
 * Remove a bookmark. If the recycle bin is enabled, moves it there first.
 */
export async function removeBookmark(id: string): Promise<void> {
  const config = await getConfig();

  if (config.app.recycleBinEnabled) {
    // Save bookmark info before removing
    const nodes = await chrome.bookmarks.get([id]);
    if (nodes.length > 0) {
      const node = nodes[0];
      const recycleItem: RecycleItem = {
        bookmark: {
          id: node.id,
          title: node.title,
          url: node.url ?? '',
          dateAdded: node.dateAdded ?? Date.now(),
          parentId: node.parentId ?? '',
          parentTitle: '',
        },
        deletedAt: Date.now(),
        originalParentId: node.parentId ?? '',
      };
      await addToRecycleBin(recycleItem);
    }
  }

  // Recursively remove (works for folders too)
  await chrome.bookmarks.removeTree(id);
}

/**
 * Delete multiple bookmarks at once.
 */
export async function batchDelete(ids: string[]): Promise<void> {
  const config = await getConfig();

  if (config.app.recycleBinEnabled) {
    // Batch fetch all nodes to get bookmark info
    const promises = ids.map((id) =>
      chrome.bookmarks.get([id]).catch(() => [] as chrome.bookmarks.BookmarkTreeNode[]),
    );
    const results = await Promise.all(promises);

    const recycleItems: RecycleItem[] = [];
    for (const nodes of results) {
      if (nodes.length > 0) {
        const node = nodes[0];
        recycleItems.push({
          bookmark: {
            id: node.id,
            title: node.title,
            url: node.url ?? '',
            dateAdded: node.dateAdded ?? Date.now(),
            parentId: node.parentId ?? '',
            parentTitle: '',
          },
          deletedAt: Date.now(),
          originalParentId: node.parentId ?? '',
        });
      }
    }

    // Add all to recycle bin concurrently
    for (const item of recycleItems) {
      await addToRecycleBin(item);
    }
  }

  // Remove all trees
  await Promise.all(ids.map((id) => chrome.bookmarks.removeTree(id).catch(() => {})));
}

/**
 * Move a bookmark to a different folder.
 */
export async function moveBookmark(id: string, parentId: string): Promise<void> {
  await chrome.bookmarks.move(id, { parentId });
}

// ---- Search ----

/**
 * Search bookmarks using chrome.bookmarks.search (title/URL keyword match).
 */
export async function searchBookmarks(query: string): Promise<BookmarkItem[]> {
  const nodes = await chrome.bookmarks.search(query);
  return nodes
    .filter((n) => n.url) // filter out folders
    .map((n) => ({
      id: n.id,
      title: n.title,
      url: n.url ?? '',
      dateAdded: n.dateAdded ?? 0,
      parentId: n.parentId ?? '',
      parentTitle: '',
    }));
}

// ---- Check ----

/**
 * Check if a URL is already bookmarked.
 */
export async function checkBookmarked(url: string): Promise<boolean> {
  const nodes = await chrome.bookmarks.search({ url });
  return nodes.length > 0;
}

/**
 * Find bookmark nodes matching a URL.
 */
export async function findBookmarksByUrl(
  url: string,
): Promise<chrome.bookmarks.BookmarkTreeNode[]> {
  return chrome.bookmarks.search({ url });
}

/**
 * Remove the first bookmark matching a URL.
 */
export async function removeBookmarkByUrl(url: string): Promise<boolean> {
  const nodes = await findBookmarksByUrl(url);
  if (nodes.length === 0) return false;
  await removeBookmark(nodes[0].id);
  return true;
}

// ---- Folders ----

/**
 * Get all folder nodes (excluding bookmark leaf nodes).
 */
export async function getFolders(): Promise<BookmarkNode[]> {
  const tree = await getBookmarkTree();

  const folders: BookmarkNode[] = [];
  const walk = (nodes: BookmarkNode[]) => {
    for (const node of nodes) {
      if (!node.url) {
        // This is a folder
        folders.push(node);
      }
      if (node.children) {
        walk(node.children);
      }
    }
  };
  walk(tree);

  return folders;
}
