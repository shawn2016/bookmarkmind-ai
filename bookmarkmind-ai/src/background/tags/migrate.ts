// ============================================================
// AI 书签管家 v2 — 文件夹 → 标签迁移
// ============================================================
import { getAllBookmarks } from '../bookmarks/crud';
import { createTag, setBookmarkTags } from './crud';

export interface MigrationProgress {
  done: number;
  total: number;
  phase: string;
}

export interface MigrationReport {
  bookmarksMigrated: number;
  tagsCreated: number;
  tagNames: string[];
  errors: string[];
}

/**
 * Migrate bookmarks from folder-based organization to tag-based.
 * Each bookmark's parent folder name becomes a tag.
 *
 * @param onProgress Progress callback for UI updates.
 * @param parentIdOnly If provided, only migrate bookmarks under this folder.
 */
export async function migrateFoldersToTags(
  onProgress?: (progress: MigrationProgress) => void,
  parentIdOnly?: string,
): Promise<MigrationReport> {
  const report: MigrationReport = {
    bookmarksMigrated: 0,
    tagsCreated: 0,
    tagNames: [],
    errors: [],
  };

  // Get all bookmarks
  let allBookmarks = await getAllBookmarks();

  // Filter by parentId if specified
  if (parentIdOnly) {
    allBookmarks = allBookmarks.filter((b) => b.parentId === parentIdOnly);
  }

  // Filter: only bookmarks with meaningful parent folders
  const SYSTEM_NAMES = new Set([
    '书签栏', 'Bookmarks bar', 'Bookmarks Bar',
    '其他书签', 'Other Bookmarks',
    '移动设备书签', 'Mobile bookmarks',
  ]);

  const candidates = allBookmarks.filter(
    (b) => b.parentTitle && !SYSTEM_NAMES.has(b.parentTitle),
  );

  // Deduplicate folder names
  const folderNames = [...new Set(candidates.map((b) => b.parentTitle))];

  // Create a tag for each unique folder name
  const folderToTagId = new Map<string, string>();

  for (const folderName of folderNames) {
    try {
      const tag = await createTag(folderName, `migrated/${folderName}`, undefined, 'migrated');
      folderToTagId.set(folderName, tag.id);
      report.tagNames.push(folderName);
      report.tagsCreated++;
    } catch (err) {
      report.errors.push(`创建标签 "${folderName}" 失败: ${String(err)}`);
    }
  }

  // Assign tags to bookmarks
  const total = candidates.length;
  let done = 0;

  for (const bookmark of candidates) {
    const tagId = folderToTagId.get(bookmark.parentTitle);
    if (tagId) {
      try {
        await setBookmarkTags(bookmark.id, [tagId]);
        report.bookmarksMigrated++;
      } catch (err) {
        report.errors.push(`为书签 "${bookmark.title}" 设置标签失败: ${String(err)}`);
      }
    }
    done++;
    onProgress?.({ done, total, phase: 'migrating' });
  }

  return report;
}
