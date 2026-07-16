/* ============================================================
   AI 书签管家 — Category Management Section
   ============================================================ */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Folder,
  FolderPlus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Bookmark,
  ExternalLink,
  CheckSquare,
  FolderInput,
  Sparkles,
  Info,
} from 'lucide-react';
import type { BookmarkNode } from '@shared/types';
import { getFaviconUrl } from '@shared/utils/format';

interface FolderItemProps {
  node: BookmarkNode;
  level: number;
  editingId: string | null;
  editValue: string;
  creatingParentId: string | null;
  createValue: string;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onStartEdit: (node: BookmarkNode) => void;
  onEditChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onCreateChild: (parentId: string) => void;
  onCreateChange: (v: string) => void;
  onSaveCreate: () => void;
  onCancelCreate: () => void;
  onDelete: (node: BookmarkNode) => void;
  onDeleteBookmark: (node: BookmarkNode) => void;
  batchMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
}

const FolderItem: React.FC<FolderItemProps> = ({
  node,
  level,
  editingId,
  editValue,
  creatingParentId,
  createValue,
  expandedIds,
  onToggleExpand,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onCreateChild,
  onCreateChange,
  onSaveCreate,
  onCancelCreate,
  onDelete,
  onDeleteBookmark,
  batchMode = false,
  selectedIds,
  onToggleSelect,
}) => {
  const isEditing = editingId === node.id;
  const isCreatingChild = creatingParentId === node.id;
  const subFolders = node.children?.filter((c) => !c.url) ?? [];
  const bookmarks = node.children?.filter((c) => c.url) ?? [];
  const isExpanded = expandedIds.has(node.id);
  const hasContent = subFolders.length > 0 || bookmarks.length > 0;

  return (
    <div style={{ marginLeft: level > 0 ? '20px' : 0 }}>
      <div
        className="flex items-center justify-between gap-bm-2 py-bm-2 px-bm-2 rounded-bm-md"
        style={{
          background: level === 0 ? 'var(--bm-gray-0)' : 'transparent',
          border: level === 0 ? '1px solid var(--bm-gray-200)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center gap-bm-2 min-w-0">
          {hasContent ? (
            <button
              onClick={() => onToggleExpand(node.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                color: 'var(--bm-gray-400)',
              }}
              title={isExpanded ? '收起' : '展开'}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span style={{ width: '16px' }} />
          )}
          <Folder
            size={18}
            strokeWidth={2}
            style={{ color: 'var(--bm-primary-500)', flexShrink: 0 }}
          />
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              autoFocus
              style={{
                fontSize: 'var(--bm-text-md)',
                padding: '4px 8px',
                border: '1px solid var(--bm-primary-400)',
                borderRadius: 'var(--bm-radius-sm)',
                background: 'var(--bm-gray-0)',
                color: 'var(--bm-gray-800)',
                outline: 'none',
                minWidth: '120px',
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 'var(--bm-text-md)',
                color: 'var(--bm-gray-800)',
                fontWeight: level === 0 ? 500 : 400,
              }}
              className="truncate"
            >
              {node.title || '未命名文件夹'}
            </span>
          )}
          {!isEditing && (
            <span
              style={{
                fontSize: 'var(--bm-text-xs)',
                color: 'var(--bm-gray-400)',
                flexShrink: 0,
              }}
            >
              ({bookmarks.length} 书签{subFolders.length > 0 ? `, ${subFolders.length} 文件夹` : ''})
            </span>
          )}
        </div>

        <div className="flex items-center gap-bm-1">
          {isEditing ? (
            <>
              <IconButton
                icon={<Check size={14} />}
                onClick={onSaveEdit}
                color="var(--bm-success-500)"
                title="保存"
              />
              <IconButton
                icon={<X size={14} />}
                onClick={onCancelEdit}
                color="var(--bm-gray-400)"
                title="取消"
              />
            </>
          ) : (
            <>
              <IconButton
                icon={<FolderPlus size={14} />}
                onClick={() => onCreateChild(node.id)}
                color="var(--bm-primary-500)"
                title="新建子文件夹"
              />
              <IconButton
                icon={<Edit2 size={14} />}
                onClick={() => onStartEdit(node)}
                color="var(--bm-gray-500)"
                title="重命名"
              />
              <IconButton
                icon={<Trash2 size={14} />}
                onClick={() => onDelete(node)}
                color="var(--bm-error-500)"
                title="删除"
              />
            </>
          )}
        </div>
      </div>

      {isCreatingChild && (
        <div
          className="flex items-center gap-bm-2 py-bm-2 px-bm-2 mt-bm-1"
          style={{ marginLeft: '20px' }}
        >
          <Folder size={16} style={{ color: 'var(--bm-primary-400)', flexShrink: 0 }} />
          <input
            type="text"
            value={createValue}
            onChange={(e) => onCreateChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveCreate();
              if (e.key === 'Escape') onCancelCreate();
            }}
            placeholder="新文件夹名称"
            autoFocus
            style={{
              flex: 1,
              fontSize: 'var(--bm-text-sm)',
              padding: '6px 10px',
              border: '1px solid var(--bm-primary-400)',
              borderRadius: 'var(--bm-radius-sm)',
              outline: 'none',
            }}
          />
          <IconButton
            icon={<Check size={14} />}
            onClick={onSaveCreate}
            color="var(--bm-success-500)"
            title="保存"
          />
          <IconButton
            icon={<X size={14} />}
            onClick={onCancelCreate}
            color="var(--bm-gray-400)"
            title="取消"
          />
        </div>
      )}

      {isExpanded && bookmarks.length > 0 && (
        <div style={{ marginLeft: `${20 + level * 12}px` }}>
          {bookmarks.map((bm) => {
            const isSelected = selectedIds?.has(bm.id) ?? false;
            const favicon = bm.url ? getFaviconUrl(bm.url) : '';
            return (
            <div
              key={bm.id}
              className="flex items-center justify-between gap-bm-2 py-bm-1 px-bm-2 rounded-bm-sm"
              style={{
                borderBottom: '1px solid var(--bm-gray-100)',
                background: isSelected ? 'var(--bm-primary-50)' : 'transparent',
                cursor: batchMode ? 'pointer' : 'default',
              }}
              onClick={() => {
                if (batchMode && onToggleSelect) onToggleSelect(bm.id);
              }}
            >
              <div className="flex items-center gap-bm-2 min-w-0">
                {batchMode && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSelect?.(bm.id);
                    }}
                    style={{
                      width: 16,
                      height: 16,
                      minWidth: 16,
                      borderRadius: 4,
                      border: `2px solid ${
                        isSelected ? 'var(--bm-primary-500)' : 'var(--bm-gray-300)'
                      }`,
                      background: isSelected
                        ? 'var(--bm-primary-500)'
                        : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition:
                        'background .18s var(--bm-ease-out), border-color .18s var(--bm-ease-out)',
                    }}
                  >
                    {isSelected && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 5.2 4 7.2 8 3"
                          stroke="var(--bm-text-heading)"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                )}
                {bm.url ? (
                  <img
                    src={favicon}
                    alt=""
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      flexShrink: 0,
                      objectFit: 'contain',
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Bookmark size={14} style={{ color: 'var(--bm-primary-400)', flexShrink: 0 }} />
                )}
                <div className="min-w-0">
                  <div
                    className="truncate"
                    style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-gray-700)', fontWeight: 500 }}
                  >
                    {bm.title || '无标题'}
                  </div>
                  <div
                    className="truncate"
                    style={{ fontSize: 'var(--bm-text-xs)', color: 'var(--bm-gray-400)' }}
                  >
                    {bm.url}
                  </div>
                </div>
              </div>
              {!batchMode && (
              <div className="flex items-center gap-bm-1">
                {bm.url && (
                  <IconButton
                    icon={<ExternalLink size={13} />}
                    onClick={() => window.open(bm.url, '_blank')}
                    color="var(--bm-gray-500)"
                    title="打开"
                  />
                )}
                <IconButton
                  icon={<Trash2 size={13} />}
                  onClick={() => onDeleteBookmark(bm)}
                  color="var(--bm-error-500)"
                  title="删除书签"
                />
              </div>
              )}
            </div>
          );
          })}
        </div>
      )}

      {isExpanded && subFolders.length > 0 && (
        <div className="mt-bm-1">
          {subFolders.map((child) => (
            <FolderItem
              key={child.id}
              node={child}
              level={level + 1}
              editingId={editingId}
              editValue={editValue}
              creatingParentId={creatingParentId}
              createValue={createValue}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onStartEdit={onStartEdit}
              onEditChange={onEditChange}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onCreateChild={onCreateChild}
              onCreateChange={onCreateChange}
              onSaveCreate={onSaveCreate}
              onCancelCreate={onCancelCreate}
              onDelete={onDelete}
              onDeleteBookmark={onDeleteBookmark}
              batchMode={batchMode}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  title: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, color, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: '26px',
      height: '26px',
      border: 'none',
      background: 'transparent',
      borderRadius: 'var(--bm-radius-md)',
      color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background var(--bm-duration-fast), transform var(--bm-duration-fast) var(--bm-ease-spring)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--bm-gray-100)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
    }}
    onMouseDown={(e) => {
      e.currentTarget.style.transform = 'scale(0.92)';
    }}
    onMouseUp={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {icon}
  </button>
);

const CategoryManagementSection: React.FC = () => {
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);
  const [createValue, setCreateValue] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [organizing, setOrganizing] = useState(false);
  const [organizeProgress, setOrganizeProgress] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveFolderId, setMoveFolderId] = useState('');

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const folderOptions = useMemo(() => {
    const result: { id: string; title: string }[] = [];
    const walk = (nodes: BookmarkNode[], prefix = '') => {
      for (const n of nodes) {
        if (!n.url && n.title) {
          const label = prefix ? `${prefix} / ${n.title}` : n.title;
          if (!['书签栏', 'Bookmarks bar', '其他书签', 'Other Bookmarks'].includes(n.title)) {
            result.push({ id: n.id, title: label });
          }
          if (n.children) walk(n.children, label);
        }
      }
    };
    walk(tree[0]?.children ?? []);
    return result;
  }, [tree]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      // chrome.bookmarks 在非扩展环境（普通浏览器 / preview）为 undefined —
      // 不要把 stack 暴露给用户，降级为空状态
      if (
        typeof chrome === 'undefined' ||
        !chrome.bookmarks ||
        typeof chrome.bookmarks.getTree !== 'function'
      ) {
        setTree([]);
        setError(null);
        return;
      }
      const nodes = await chrome.bookmarks.getTree();
      setTree(nodes);
      setError(null);
    } catch (err) {
      const message = (err as Error)?.message ?? '';
      // 已知：chrome.bookmarks API 失败时的常见 stack 文案
      const isUnavailable =
        message.includes("Cannot read properties of undefined") ||
        message.includes("is not a function") ||
        message.includes("permission") ||
        message === '';
      setError(
        isUnavailable
          ? '暂无书签数据 — 请在 Chrome 中添加书签后刷新此页面'
          : `读取书签失败: ${message}`,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const showMessage = useCallback((text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const handleBatchDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`确定删除选中的 ${selectedIds.size} 个书签？`)) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => chrome.bookmarks.remove(id)),
      );
      showMessage(`已删除 ${selectedIds.size} 个书签`, 'success');
      setSelectedIds(new Set());
      setBatchMode(false);
      loadTree();
    } catch (err) {
      showMessage(`删除失败: ${(err as Error).message}`, 'error');
    }
  }, [selectedIds, loadTree, showMessage]);

  const handleBatchMove = useCallback(async () => {
    if (selectedIds.size === 0 || !moveFolderId) return;
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          chrome.bookmarks.move(id, { parentId: moveFolderId }),
        ),
      );
      showMessage(`已移动 ${selectedIds.size} 个书签`, 'success');
      setSelectedIds(new Set());
      setBatchMode(false);
      setMoveFolderId('');
      loadTree();
    } catch (err) {
      showMessage(`移动失败: ${(err as Error).message}`, 'error');
    }
  }, [selectedIds, moveFolderId, loadTree, showMessage]);

  const handleCreateChild = useCallback((parentId: string) => {
    setCreatingParentId(parentId);
    setCreateValue('');
  }, []);

  const handleSaveCreate = useCallback(async () => {
    if (!creatingParentId || !createValue.trim()) return;
    try {
      await chrome.bookmarks.create({
        parentId: creatingParentId,
        title: createValue.trim(),
      });
      showMessage('文件夹创建成功', 'success');
      setCreatingParentId(null);
      setCreateValue('');
      loadTree();
    } catch (err) {
      showMessage(`创建失败: ${(err as Error).message}`, 'error');
    }
  }, [creatingParentId, createValue, loadTree, showMessage]);

  const handleStartEdit = useCallback((node: BookmarkNode) => {
    setEditingId(node.id);
    setEditValue(node.title);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editValue.trim()) return;
    try {
      await chrome.bookmarks.update(editingId, { title: editValue.trim() });
      showMessage('重命名成功', 'success');
      setEditingId(null);
      setEditValue('');
      loadTree();
    } catch (err) {
      showMessage(`重命名失败: ${(err as Error).message}`, 'error');
    }
  }, [editingId, editValue, loadTree, showMessage]);

  const handleDelete = useCallback(async (node: BookmarkNode) => {
    const childCount = node.children?.filter((c) => !c.url).length ?? 0;
    const itemCount = node.children?.filter((c) => c.url).length ?? 0;
    const confirmText =
      childCount > 0 || itemCount > 0
        ? `文件夹「${node.title}」包含 ${itemCount} 个书签和 ${childCount} 个子文件夹，删除后无法恢复，确定删除？`
        : `确定删除空文件夹「${node.title}」？`;
    if (!window.confirm(confirmText)) return;

    try {
      await chrome.bookmarks.removeTree(node.id);
      showMessage('文件夹已删除', 'success');
      loadTree();
    } catch (err) {
      showMessage(`删除失败: ${(err as Error).message}`, 'error');
    }
  }, [loadTree, showMessage]);

  const handleDeleteBookmark = useCallback(async (node: BookmarkNode) => {
    if (!node.url) return;
    if (!window.confirm(`确定删除书签「${node.title}」？`)) return;
    try {
      await chrome.bookmarks.remove(node.id);
      showMessage('书签已删除', 'success');
      loadTree();
    } catch (err) {
      showMessage(`删除失败: ${(err as Error).message}`, 'error');
    }
  }, [loadTree, showMessage]);

  const totalBookmarks = useMemo(() => {
    let count = 0;
    const walk = (nodes: BookmarkNode[]) => {
      for (const n of nodes) {
        if (n.url) count++;
        if (n.children) walk(n.children);
      }
    };
    walk(tree);
    return count;
  }, [tree]);

  const handleReorganizeAll = useCallback(async () => {
    if (totalBookmarks === 0) {
      showMessage('没有书签可整理', 'error');
      return;
    }
    if (!window.confirm(
      `⚠️ 一键整理将对全部 ${totalBookmarks} 个书签执行以下操作：\n\n` +
      `1. 删除所有用户自建文件夹\n` +
      `2. 打破现有分类结构\n` +
      `3. 由 AI 重新分类（新建分类 ≤10 个）\n\n` +
      `开始前会自动创建完整备份，可在「数据管理」中一键恢复。\n\n确定继续？`,
    )) return;

    setOrganizing(true);
    setOrganizeProgress('正在清空现有分类…');

    const progressListener = (msg: { type?: string; payload?: { done: number; total: number; phase?: string } }) => {
      if (msg?.type === 'CLASSIFY_PROGRESS' && msg.payload) {
        const { done, total, phase } = msg.payload;
        setOrganizeProgress(`${phase ?? '处理中'} ${done}/${total}`);
      }
    };
    chrome.runtime.onMessage.addListener(progressListener);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'AI_ORGANIZE_SCATTERED',
      }) as { success?: boolean; summary?: string; organized?: number };

      if (response?.success) {
        showMessage(response.summary ?? `已整理 ${response.organized} 个书签`, 'success');
        loadTree();
      } else {
        showMessage('整理失败，请检查 AI 模型配置', 'error');
      }
    } catch (err) {
      showMessage(`整理失败: ${(err as Error).message}`, 'error');
    } finally {
      chrome.runtime.onMessage.removeListener(progressListener);
      setOrganizing(false);
      setOrganizeProgress('');
    }
  }, [totalBookmarks, loadTree, showMessage]);

  const rootNodes = useMemo(
    () =>
      tree[0]?.children?.filter((n) => !n.url) ?? [],
    [tree],
  );

  return (
    <div className="p-bm-6" style={{ maxWidth: '640px' }}>
      <h2
        className="mb-bm-2"
        style={{
          fontFamily: 'var(--bm-font-display)',
          fontSize: 'var(--bm-text-2xl)',
          fontWeight: 600,
          color: 'var(--bm-text-heading)',
          letterSpacing: 'var(--bm-tracking-tight)',
        }}
      >
        书签管理
      </h2>
      <p
        className="mb-bm-6"
        style={{
          fontSize: 'var(--bm-text-sm)',
          color: 'var(--bm-text-secondary)',
        }}
      >
        管理浏览器书签和文件夹，点击文件夹左侧箭头展开查看书签内容。
      </p>

      {/* 一键整理全部书签 — Marginalia amber callout */}
      <div
        className="mb-bm-6 p-bm-4 rounded-bm-xl"
        style={{
          // 从浅琥珀渐变到 parchment，调和而非警示
          background:
            'linear-gradient(135deg, rgba(200,148,90,0.10) 0%, var(--bm-bg-canvas) 60%, var(--bm-bg-surface) 100%)',
          border: '1px solid rgba(200,148,90,0.30)',
          boxShadow: 'var(--bm-shadow-card)',
        }}
      >
        <div className="flex items-start justify-between gap-bm-4">
          <div>
            <div
              style={{
                fontSize: 'var(--bm-text-md)',
                fontWeight: 600,
                color: 'var(--bm-gray-800)',
                marginBottom: '4px',
                fontFamily: 'var(--bm-font-display)',
                letterSpacing: 'var(--bm-tracking-tight)',
              }}
            >
              一键整理全部书签
            </div>
            <div
              style={{
                fontSize: 'var(--bm-text-sm)',
                color: 'var(--bm-gray-500)',
                lineHeight: 'var(--bm-leading-normal)',
              }}
            >
              {totalBookmarks > 0
                ? `将打破现有 ${totalBookmarks} 个书签的文件夹结构，由 AI 从零重新分类（≤10 个分类）。不可撤销，请先备份。`
                : '当前没有书签。'}
            </div>
            {organizeProgress && (
              <div
                style={{
                  fontSize: 'var(--bm-text-xs)',
                  color: 'var(--bm-primary-400)',
                  marginTop: '8px',
                }}
              >
                {organizeProgress}
              </div>
            )}
          </div>
          <button
            onClick={handleReorganizeAll}
            disabled={organizing || totalBookmarks === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              background: totalBookmarks > 0
                ? 'var(--bm-primary-400)'
                : 'var(--bm-gray-200)',
              color: totalBookmarks > 0 ? 'var(--bm-text-on-accent)' : 'var(--bm-gray-400)',
              border: totalBookmarks > 0
                ? '1px solid var(--bm-primary-300)'
                : 'none',
              borderRadius: 'var(--bm-radius-md)',
              fontSize: 'var(--bm-text-sm)',
              fontWeight: 600,
              cursor: organizing || totalBookmarks === 0 ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              opacity: organizing ? 0.7 : 1,
              boxShadow: totalBookmarks > 0
                ? '0 4px 14px rgba(200,148,90,0.30)'
                : 'none',
              transition: 'transform .22s var(--bm-ease-spring), box-shadow .22s var(--bm-ease-out)',
            }}
            onMouseEnter={(e) => {
              if (totalBookmarks > 0 && !organizing) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(200,148,90,0.40)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = totalBookmarks > 0
                ? '0 4px 14px rgba(200,148,90,0.30)'
                : 'none';
            }}
            onMouseDown={(e) => {
              if (totalBookmarks > 0 && !organizing) {
                e.currentTarget.style.transform = 'scale(0.97)';
              }
            }}
            onMouseUp={(e) => {
              if (totalBookmarks > 0 && !organizing) {
                e.currentTarget.style.transform = 'translateY(-1px)';
              } else {
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            <Sparkles size={16} />
            {organizing ? '整理中…' : '开始整理'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className="mb-bm-4 p-bm-3 rounded-bm-lg flex items-center gap-bm-2"
          style={{
            background:
              message.type === 'success' ? 'var(--bm-success-50)' : 'var(--bm-error-50)',
            border: `1px solid ${
              message.type === 'success' ? 'var(--bm-success-100)' : 'var(--bm-error-100)'
            }`,
            color:
              message.type === 'success' ? 'var(--bm-success-600)' : 'var(--bm-error-600)',
            fontSize: 'var(--bm-text-sm)',
          }}
        >
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      {loading ? (
        <div
          className="p-bm-6 text-center rounded-bm-lg"
          style={{
            background: 'var(--bm-gray-50)',
            border: '1px solid var(--bm-gray-200)',
            color: 'var(--bm-gray-400)',
            fontSize: 'var(--bm-text-sm)',
          }}
        >
          正在加载书签分类…
        </div>
      ) : error ? (
        <div
          className="p-bm-6 rounded-bm-lg"
          style={{
            background: 'var(--bm-error-50)',
            border: '1px solid var(--bm-error-100)',
            color: 'var(--bm-error-600)',
            fontSize: 'var(--bm-text-sm)',
          }}
        >
          {error}
        </div>
      ) : (
        <div
          className="p-bm-4 rounded-bm-lg"
          style={{
            background: 'var(--bm-bg-surface)',
            border: '1px solid var(--bm-border-subtle)',
          }}
        >
          {creatingParentId === '1' && (
            <div className="flex items-center gap-bm-2 mb-bm-3">
              <Folder size={18} style={{ color: 'var(--bm-primary-500)' }} />
              <input
                type="text"
                value={createValue}
                onChange={(e) => setCreateValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCreate();
                  if (e.key === 'Escape') {
                    setCreatingParentId(null);
                    setCreateValue('');
                  }
                }}
                placeholder="新文件夹名称"
                autoFocus
                style={{
                  flex: 1,
                  fontSize: 'var(--bm-text-md)',
                  padding: '6px 10px',
                  border: '1px solid var(--bm-primary-400)',
                  borderRadius: 'var(--bm-radius-sm)',
                  outline: 'none',
                }}
              />
              <IconButton
                icon={<Check size={14} />}
                onClick={handleSaveCreate}
                color="var(--bm-success-500)"
                title="保存"
              />
              <IconButton
                icon={<X size={14} />}
                onClick={() => {
                  setCreatingParentId(null);
                  setCreateValue('');
                }}
                color="var(--bm-gray-400)"
                title="取消"
              />
            </div>
          )}

          <div className="flex items-center justify-between mb-bm-3">
            <span
              style={{
                fontSize: 'var(--bm-text-sm)',
                color: 'var(--bm-gray-400)',
                fontWeight: 500,
              }}
            >
              书签栏 / 其他文件夹
            </span>
            <div className="flex items-center gap-bm-2">
              <button
                onClick={() => {
                  if (batchMode) {
                    setSelectedIds(new Set());
                    setBatchMode(false);
                  } else {
                    setBatchMode(true);
                  }
                }}
                style={{
                  fontSize: 'var(--bm-text-sm)',
                  color: batchMode ? 'var(--bm-primary-600)' : 'var(--bm-gray-600)',
                  fontWeight: 500,
                  background: batchMode ? 'var(--bm-primary-50)' : 'transparent',
                  border: `1px solid ${batchMode ? 'var(--bm-primary-200)' : 'var(--bm-gray-200)'}`,
                  borderRadius: 'var(--bm-radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                }}
              >
                <CheckSquare size={14} />
                {batchMode ? '退出多选' : '多选'}
              </button>
              {creatingParentId !== '1' && (
              <button
                onClick={() => handleCreateChild('1')}
                style={{
                  fontSize: 'var(--bm-text-sm)',
                  color: 'var(--bm-primary-500)',
                  fontWeight: 500,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <FolderPlus size={14} />
                新建文件夹
              </button>
              )}
            </div>
          </div>

          {batchMode && selectedIds.size > 0 && (
            <div
              className="flex items-center justify-between gap-bm-2 mb-bm-3 p-bm-3 rounded-bm-md"
              style={{
                // Marginalia 风格：parchment 底 + 琥珀书签带，告别丑黑条
                background: 'var(--bm-gray-50)',
                border: '1px solid var(--bm-tobacco-600)',
                borderLeft: '3px solid var(--bm-primary-400)',
                boxShadow: 'var(--bm-shadow-card)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--bm-text-sm)',
                  color: 'var(--bm-gray-700)',
                  fontFamily: 'var(--bm-font-display)',
                  fontStyle: 'italic',
                  letterSpacing: 'var(--bm-tracking-tight)',
                }}
              >
                已选 <strong style={{ color: 'var(--bm-primary-500)' }}>{selectedIds.size}</strong> 项
              </span>
              <div className="flex items-center gap-bm-2">
                <select
                  value={moveFolderId}
                  onChange={(e) => setMoveFolderId(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--bm-radius-sm)',
                    border: '1px solid var(--bm-tobacco-600)',
                    background: 'var(--bm-gray-0)',
                    color: 'var(--bm-gray-800)',
                    fontSize: 'var(--bm-text-xs)',
                    maxWidth: '140px',
                  }}
                >
                  <option value="">移动到…</option>
                  {folderOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleBatchMove}
                  disabled={!moveFolderId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    background: moveFolderId
                      ? 'var(--bm-primary-400)'
                      : 'var(--bm-gray-200)',
                    color: moveFolderId
                      ? 'var(--bm-text-on-accent)'
                      : 'var(--bm-gray-400)',
                    border: moveFolderId
                      ? '1px solid var(--bm-primary-300)'
                      : 'none',
                    borderRadius: 'var(--bm-radius-sm)',
                    fontSize: 'var(--bm-text-xs)',
                    fontWeight: 600,
                    cursor: moveFolderId ? 'pointer' : 'not-allowed',
                  }}
                >
                  <FolderInput size={12} />
                  移动
                </button>
                <button
                  onClick={handleBatchDelete}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    background: 'var(--bm-error-500)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--bm-radius-sm)',
                    fontSize: 'var(--bm-text-xs)',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} />
                  删除
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-bm-2">
            {rootNodes.map((node) => (
              <FolderItem
                key={node.id}
                node={node}
                level={0}
                editingId={editingId}
                editValue={editValue}
                creatingParentId={creatingParentId}
                createValue={createValue}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onStartEdit={handleStartEdit}
                onEditChange={setEditValue}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={() => {
                  setEditingId(null);
                  setEditValue('');
                }}
                onCreateChild={handleCreateChild}
                onCreateChange={setCreateValue}
                onSaveCreate={handleSaveCreate}
                onCancelCreate={() => {
                  setCreatingParentId(null);
                  setCreateValue('');
                }}
                onDelete={handleDelete}
                onDeleteBookmark={handleDeleteBookmark}
                batchMode={batchMode}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
              />
            ))}
          </div>

          {rootNodes.length === 0 && (
            <div
              className="text-center py-bm-6"
              style={{
                fontSize: 'var(--bm-text-sm)',
                color: 'var(--bm-gray-400)',
              }}
            >
              暂无文件夹
            </div>
          )}
        </div>
      )}

      <div
        className="mt-bm-6 p-bm-4 rounded-bm-lg flex items-start gap-bm-2"
        style={{
          background: 'var(--bm-bg-elevated)',
          border: '1px solid var(--bm-border-subtle)',
          borderLeft: '3px solid var(--bm-amber-500)',
        }}
      >
        <Info
          size={14}
          strokeWidth={2}
          style={{
            color: 'var(--bm-text-accent)',
            marginTop: '2px',
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontSize: 'var(--bm-text-sm)',
            color: 'var(--bm-text-secondary)',
            lineHeight: 'var(--bm-leading-relaxed)',
            fontFamily: 'var(--bm-font-display)',
            fontStyle: 'italic',
            letterSpacing: 'var(--bm-tracking-tight)',
          }}
        >
          提示：AI 智能分类会根据已有文件夹名称进行匹配，自动将新书签归入最合适的文件夹。如果没有匹配项，会提示创建新文件夹。
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementSection;
