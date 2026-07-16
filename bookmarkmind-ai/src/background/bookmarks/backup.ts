// ============================================================
// Bookmark backup — snapshot before one-click reorganize
// ============================================================
import type { BookmarkNode, OrganizeBackup, OrganizeBackupNode } from '@shared/types';
import { STORAGE_KEYS } from '@shared/types';
import { getBookmarkTree } from './crud';

function serializeNodes(nodes: BookmarkNode[]): OrganizeBackupNode[] {
  return nodes.map((n) => {
    if (n.url) {
      return { title: n.title || n.url, url: n.url };
    }
    return {
      title: n.title || '未命名文件夹',
      children: n.children ? serializeNodes(n.children) : [],
    };
  });
}

function countBookmarks(nodes: OrganizeBackupNode[]): number {
  let count = 0;
  for (const n of nodes) {
    if (n.url) count++;
    if (n.children) count += countBookmarks(n.children);
  }
  return count;
}

async function findBookmarksBarId(): Promise<string> {
  const tree = await getBookmarkTree();
  const root = tree[0]?.children ?? [];
  const bar = root.find(
    (n) =>
      n.title === '书签栏' ||
      n.title === 'Bookmarks bar' ||
      n.title === 'Bookmarks Bar' ||
      n.id === '1',
  );
  return bar?.id ?? '1';
}

/** 整理前创建完整书签结构备份 */
export async function createOrganizeBackup(): Promise<OrganizeBackup> {
  const tree = await getBookmarkTree();
  const rootChildren = tree[0]?.children ?? [];
  const nodes = serializeNodes(rootChildren);
  const backup: OrganizeBackup = {
    createdAt: Date.now(),
    bookmarkCount: countBookmarks(nodes),
    nodes,
  };
  await chrome.storage.local.set({ [STORAGE_KEYS.ORGANIZE_BACKUP]: backup });
  return backup;
}

export async function getOrganizeBackup(): Promise<OrganizeBackup | null> {
  const raw = await chrome.storage.local.get(STORAGE_KEYS.ORGANIZE_BACKUP);
  const backup = raw[STORAGE_KEYS.ORGANIZE_BACKUP] as OrganizeBackup | undefined;
  return backup?.nodes?.length ? backup : null;
}

async function importNodes(
  nodes: OrganizeBackupNode[],
  parentId: string,
): Promise<void> {
  for (const node of nodes) {
    if (node.url) {
      await chrome.bookmarks.create({
        parentId,
        title: node.title || node.url,
        url: node.url,
      });
    } else {
      const folder = await chrome.bookmarks.create({
        parentId,
        title: node.title || '未命名文件夹',
      });
      if (node.children?.length) {
        await importNodes(node.children, folder.id);
      }
    }
  }
}

/** 清除书签栏/其他书签下的全部内容 */
async function clearAllBookmarkContent(): Promise<void> {
  const tree = await getBookmarkTree();
  const rootChildren = tree[0]?.children ?? [];
  for (const top of rootChildren) {
    if (top.children?.length) {
      const childIds = [...top.children].map((c) => c.id).reverse();
      for (const id of childIds) {
        try {
          await chrome.bookmarks.removeTree(id);
        } catch {
          // 可能已被删除
        }
      }
    }
  }
}

/** 从整理备份恢复书签结构 */
export async function restoreOrganizeBackup(): Promise<{
  restored: boolean;
  bookmarkCount: number;
}> {
  const backup = await getOrganizeBackup();
  if (!backup) {
    return { restored: false, bookmarkCount: 0 };
  }

  await clearAllBookmarkContent();

  const tree = await getBookmarkTree();
  const rootChildren = tree[0]?.children ?? [];

  for (const backupTop of backup.nodes) {
    const target = rootChildren.find(
      (t) =>
        t.title === backupTop.title ||
        (backupTop.title === '书签栏' && t.id === '1') ||
        (backupTop.title === 'Bookmarks bar' && t.id === '1') ||
        (backupTop.title === '其他书签' && t.id === '2') ||
        (backupTop.title === 'Other Bookmarks' && t.id === '2'),
    );
    const parentId = target?.id ?? (await findBookmarksBarId());

    if (backupTop.url) {
      await chrome.bookmarks.create({
        parentId,
        title: backupTop.title,
        url: backupTop.url,
      });
    } else if (backupTop.children?.length) {
      await importNodes(backupTop.children, parentId);
    }
  }

  return { restored: true, bookmarkCount: backup.bookmarkCount };
}
