/* ============================================================
   AI 书签管家 — Data Management Section
   使用 primitives: SectionCard, SubSection, StatCard, Button, Callout
   ============================================================ */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Download,
  Upload,
  Trash2,
  RotateCcw,
  BarChart3,
  AlertTriangle,
  Database,
  FileText,
} from 'lucide-react';
import type { RecycleItem, UsageStats } from '@shared/types';
import { STORAGE_KEYS } from '@shared/types';
import { useOptionsStore } from '@options/store/optionsStore';
import {
  SectionCard,
  SubSection,
  StatCard,
  Button,
  Callout,
} from '../primitives';

const DataManagementSection: React.FC = () => {
  const config = useOptionsStore((s) => s.config);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [recycleBin, setRecycleBin] = useState<RecycleItem[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [organizeBackup, setOrganizeBackup] = useState<{
    createdAt: number;
    bookmarkCount: number;
  } | null>(null);
  const [restoring, setRestoring] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResult, recycleResult, tree, backupResult] = await Promise.all([
        chrome.storage.local.get(STORAGE_KEYS.USAGE_STATS),
        chrome.storage.local.get(STORAGE_KEYS.RECYCLE_BIN),
        chrome.bookmarks.getTree(),
        chrome.runtime.sendMessage({ type: 'BOOKMARK_ORGANIZE_BACKUP_INFO' }) as Promise<{
          hasBackup?: boolean;
          backup?: { createdAt: number; bookmarkCount: number } | null;
        }>,
      ]);
      setStats(
        (statsResult[STORAGE_KEYS.USAGE_STATS] as UsageStats) ?? {
          date: '',
          apiCalls: 0,
          tokensUsed: 0,
        },
      );
      setRecycleBin(
        (recycleResult[STORAGE_KEYS.RECYCLE_BIN] as RecycleItem[]) ?? [],
      );

      let count = 0;
      const countBookmarks = (nodes: chrome.bookmarks.BookmarkTreeNode[]) => {
        for (const node of nodes) {
          if (node.url) count++;
          if (node.children) countBookmarks(node.children);
        }
      };
      countBookmarks(tree);
      setBookmarkCount(count);
      setOrganizeBackup(
        backupResult?.hasBackup && backupResult.backup
          ? backupResult.backup
          : null,
      );
    } catch (err) {
      console.error('[DataManagement] loadData failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExportJSON = useCallback(async () => {
    try {
      const tree = await chrome.bookmarks.getTree();
      const blob = new Blob([JSON.stringify(tree, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookmarks-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, []);

  const handleExportHTML = useCallback(async () => {
    try {
      const tree = await chrome.bookmarks.getTree();
      const buildHTML = (
        nodes: chrome.bookmarks.BookmarkTreeNode[],
        indent = 1,
      ): string => {
        let html = '';
        for (const node of nodes) {
          if (node.url) {
            html += `${'  '.repeat(indent)}<DT><A HREF="${node.url}">${node.title || node.url}</A>\n`;
          } else if (node.children) {
            html += `${'  '.repeat(indent)}<DT><H3>${node.title || 'Folder'}</H3>\n`;
            html += `${'  '.repeat(indent)}<DL>\n`;
            html += buildHTML(node.children, indent + 1);
            html += `${'  '.repeat(indent)}</DL>\n`;
          }
        }
        return html;
      };

      const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks Export</TITLE>
<H1>Bookmarks</H1>
<DL>
${buildHTML(tree)}
</DL>`;

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookmarks-export-${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export HTML failed:', err);
    }
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.html';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text) as chrome.bookmarks.BookmarkTreeNode[];
          const importNode = async (
            nodes: chrome.bookmarks.BookmarkTreeNode[],
            parentId: string,
          ) => {
            for (const node of nodes) {
              if (node.url) {
                await chrome.bookmarks.create({
                  parentId,
                  title: node.title || node.url,
                  url: node.url,
                });
              } else if (node.children) {
                const folder = await chrome.bookmarks.create({
                  parentId,
                  title: node.title || 'Imported Folder',
                });
                await importNode(node.children, folder.id);
              }
            }
          };
          const [root] = await chrome.bookmarks.getTree();
          const bookmarksBar = root.children?.find(
            (c) =>
              c.title === '书签栏' ||
              c.title === 'Bookmarks bar' ||
              c.title === 'Bookmarks Bar',
          );
          await importNode(
            data,
            bookmarksBar?.id ?? root.children?.[0]?.id ?? '1',
          );
        }
        await loadData();
      } catch (err) {
        console.error('Import failed:', err);
        alert(`导入失败: ${(err as Error).message}`);
      }
    };
    input.click();
  }, [loadData]);

  const handleRestore = useCallback(
    async (item: RecycleItem) => {
      try {
        await chrome.bookmarks.create({
          parentId: item.originalParentId,
          title: item.bookmark.title,
          url: item.bookmark.url,
        });
        const newBin = recycleBin.filter(
          (i) => i.bookmark.id !== item.bookmark.id,
        );
        await chrome.storage.local.set({
          [STORAGE_KEYS.RECYCLE_BIN]: newBin,
        });
        setRecycleBin(newBin);
      } catch (err) {
        console.error('Restore failed:', err);
        alert(`恢复失败: ${(err as Error).message}`);
      }
    },
    [recycleBin],
  );

  const handleClearRecycleBin = useCallback(async () => {
    if (!confirm('确定清空回收站？此操作不可撤销。')) return;
    await chrome.storage.local.set({ [STORAGE_KEYS.RECYCLE_BIN]: [] });
    setRecycleBin([]);
  }, []);

  const handleResetStats = useCallback(async () => {
    const ok = window.confirm(
      '⚠️ 确定要重置今日用量统计吗？\n\n此操作不可撤销 — 已记录的 API 调用次数和 Token 用量将被永久清零。',
    );
    if (!ok) return;
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const reset: UsageStats = { date: dateKey, apiCalls: 0, tokensUsed: 0 };
    await chrome.storage.local.set({ [STORAGE_KEYS.USAGE_STATS]: reset });
    setStats(reset);
  }, []);

  const handleRestoreOrganizeBackup = useCallback(async () => {
    if (!organizeBackup) return;
    const time = new Date(organizeBackup.createdAt).toLocaleString('zh-CN');
    if (
      !confirm(
        `确定恢复到 ${time} 的整理前备份？\n\n将覆盖当前书签栏和其他书签中的全部内容（共 ${organizeBackup.bookmarkCount} 个书签）。`,
      )
    ) {
      return;
    }

    setRestoring(true);
    try {
      const response = (await chrome.runtime.sendMessage({
        type: 'BOOKMARK_RESTORE_ORGANIZE_BACKUP',
      })) as { success?: boolean; bookmarkCount?: number };

      if (response?.success) {
        alert(
          `已恢复 ${response.bookmarkCount ?? organizeBackup.bookmarkCount} 个书签到整理前状态`,
        );
        await loadData();
      } else {
        alert('未找到整理备份，无法恢复');
      }
    } catch (err) {
      console.error('Restore organize backup failed:', err);
      alert(`恢复失败: ${(err as Error).message}`);
    } finally {
      setRestoring(false);
    }
  }, [organizeBackup, loadData]);

  const formatBackupTime = (ts: number) =>
    new Date(ts).toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const dailyLimit = config?.model?.dailyLimit ?? 100;
  const apiCallsToday = stats?.apiCalls ?? 0;
  const tokensToday = stats?.tokensUsed ?? 0;

  return (
    <SectionCard
      title="数据管理"
      subtitle="管理书签数据、回收站和使用统计"
    >
      {/* 今日用量 */}
      <SubSection
        icon={<BarChart3 size={15} strokeWidth={2.2} />}
        title="今日用量"
        caption="API · Token · 书签"
      >
        <div className="grid grid-cols-3 gap-bm-3 mb-bm-4">
          <StatCard
            icon={<Database size={20} />}
            label="API 调用"
            value={loading ? '—' : apiCallsToday}
            suffix={`/ ${dailyLimit}`}
            tone="amber"
          />
          <StatCard
            icon={<FileText size={20} />}
            label="Token 用量"
            value={
              loading
                ? '—'
                : tokensToday > 1000
                  ? `${(tokensToday / 1000).toFixed(1)}k`
                  : tokensToday
            }
            tone="info"
          />
          <StatCard
            icon={<Database size={20} />}
            label="书签总数"
            value={loading ? '—' : bookmarkCount}
            tone="success"
          />
        </div>

        {/* 危险操作区 */}
        <div
          className="flex items-center justify-between gap-bm-3 mt-bm-4 pt-bm-3"
          style={{ borderTop: '1px dashed var(--bm-border-subtle)' }}
        >
          <span
            className="flex items-center gap-bm-1"
            style={{
              fontSize: 'var(--bm-text-xs)',
              color: 'var(--bm-state-error)',
              fontFamily: 'var(--bm-font-display)',
              fontStyle: 'italic',
              letterSpacing: 'var(--bm-tracking-tight)',
            }}
          >
            <AlertTriangle size={12} strokeWidth={2.4} />
            危险操作 · 不可撤销
          </span>
          <Button
            icon={<RotateCcw size={15} />}
            onClick={handleResetStats}
            variant="danger"
            ariaLabel="重置今日用量统计，此操作不可撤销"
          >
            重置今日用量
          </Button>
        </div>
      </SubSection>

      {/* 导入 / 导出 */}
      <SubSection
        icon={<Download size={15} strokeWidth={2.2} />}
        title="导入 / 导出"
        caption="备份 · 迁移"
      >
        <p
          style={{
            fontSize: 'var(--bm-text-sm)',
            color: 'var(--bm-text-secondary)',
            lineHeight: 'var(--bm-leading-relaxed)',
            margin: '0 0 12px',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            letterSpacing: 'var(--bm-tracking-tight)',
          }}
        >
          导出支持 JSON（完整树结构）和 HTML（Netscape 格式，可导入浏览器）。导入支持 JSON 和 HTML 文件。
        </p>
        <div className="flex flex-wrap gap-bm-2">
          <Button
            icon={<Download size={15} />}
            onClick={handleExportJSON}
            variant="primary"
          >
            导出 JSON
          </Button>
          <Button
            icon={<FileText size={15} />}
            onClick={handleExportHTML}
            variant="primary"
          >
            导出 HTML
          </Button>
          <Button icon={<Upload size={15} />} onClick={handleImport}>
            导入书签
          </Button>
        </div>
      </SubSection>

      {/* 整理前备份 */}
      <SubSection
        icon={<RotateCcw size={15} strokeWidth={2.2} />}
        title="整理前备份"
        caption="一键整理 · 回滚"
      >
        <p
          style={{
            fontSize: 'var(--bm-text-sm)',
            color: 'var(--bm-text-secondary)',
            lineHeight: 'var(--bm-leading-relaxed)',
            margin: '0 0 12px',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            letterSpacing: 'var(--bm-tracking-tight)',
          }}
        >
          每次「一键整理」开始前会自动保存完整书签结构。若整理结果不满意或整理失败，可在此恢复。
        </p>

        {loading ? (
          <p style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-text-muted)' }}>
            加载中…
          </p>
        ) : organizeBackup ? (
          <div className="flex flex-wrap items-center gap-bm-3">
            <div
              className="flex-1 p-bm-3 rounded-bm-md"
              style={{
                background: 'var(--bm-bg-elevated)',
                border: '1px solid var(--bm-border-subtle)',
                borderLeft: '3px solid var(--bm-state-warning)',
                minWidth: '200px',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--bm-text-sm)',
                  fontWeight: 500,
                  color: 'var(--bm-text-heading)',
                }}
              >
                {formatBackupTime(organizeBackup.createdAt)} 的备份
              </div>
              <div
                style={{
                  fontSize: 'var(--bm-text-xs)',
                  color: 'var(--bm-text-secondary)',
                  marginTop: '4px',
                  fontFamily: 'var(--bm-font-mono)',
                }}
              >
                共 {organizeBackup.bookmarkCount} 个书签
              </div>
            </div>
            <Button
              icon={<RotateCcw size={15} />}
              onClick={handleRestoreOrganizeBackup}
              variant="primary"
              disabled={restoring}
            >
              {restoring ? '恢复中…' : '恢复此备份'}
            </Button>
          </div>
        ) : (
          <Callout icon={<AlertTriangle size={14} strokeWidth={2} />} tone="warning">
            暂无整理备份。执行「一键整理」后会自动创建。
          </Callout>
        )}
      </SubSection>

      {/* 回收站 */}
      <SubSection
        icon={<Trash2 size={15} strokeWidth={2.2} />}
        title="回收站"
        caption={recycleBin.length > 0 ? `${recycleBin.length} 条` : '空'}
      >
        {recycleBin.length > 0 && (
          <div className="flex justify-end mb-bm-3">
            <Button
              icon={<Trash2 size={14} />}
              onClick={handleClearRecycleBin}
              variant="danger"
              size="sm"
            >
              清空回收站
            </Button>
          </div>
        )}

        {recycleBin.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-bm-8"
            style={{ color: 'var(--bm-text-muted)' }}
          >
            <Trash2 size={32} strokeWidth={1.5} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <p
              style={{
                fontSize: 'var(--bm-text-sm)',
                fontFamily: 'var(--bm-font-display)',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              回收站为空
            </p>
          </div>
        ) : (
          <div
            className="flex flex-col gap-bm-2"
            style={{ maxHeight: '320px', overflowY: 'auto' }}
          >
            {recycleBin.map((item) => (
              <div
                key={item.bookmark.id}
                className="flex items-center gap-bm-3 p-bm-3 rounded-bm-md"
                style={{
                  background: 'var(--bm-bg-elevated)',
                  border: '1px solid var(--bm-border-subtle)',
                }}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.bookmark.url)}&sz=16`}
                  alt=""
                  style={{ width: '16px', height: '16px', flexShrink: 0, borderRadius: '2px' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    style={{
                      fontSize: 'var(--bm-text-sm)',
                      fontWeight: 500,
                      color: 'var(--bm-text-heading)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.bookmark.title}
                  </div>
                  <div
                    style={{
                      fontSize: 'var(--bm-text-xs)',
                      color: 'var(--bm-text-muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--bm-font-mono)',
                    }}
                  >
                    {item.bookmark.url}
                  </div>
                </div>
                <Button
                  icon={<RotateCcw size={13} />}
                  onClick={() => handleRestore(item)}
                  variant="ghost"
                  size="sm"
                >
                  恢复
                </Button>
              </div>
            ))}
          </div>
        )}

        {recycleBin.length > 5 && (
          <div className="mt-bm-3">
            <Callout icon={<AlertTriangle size={14} strokeWidth={2} />} tone="warning">
              回收站中有 {recycleBin.length} 条记录，建议定期清理或恢复。
            </Callout>
          </div>
        )}
      </SubSection>
    </SectionCard>
  );
};

export default DataManagementSection;