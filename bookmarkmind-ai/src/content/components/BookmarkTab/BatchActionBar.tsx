// ============================================================
// BatchActionBar — batch operations bar (appears when selecting)
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import { Trash2, X, Sparkles, FolderInput, CheckSquare } from "lucide-react";
import { useContentStore } from "@content/store/contentStore";
import { useBookmarks } from "@content/hooks/useBookmarks";
import { safeSendMessage } from "@shared/utils/chrome-api";

export const BatchActionBar: React.FC = () => {
  const batchMode = useContentStore(s => s.batchMode);
  const selectedIds = useContentStore(s => s.selectedIds);
  const filteredBookmarks = useContentStore(s => s.filteredBookmarks);
  const setBatchMode = useContentStore(s => s.setBatchMode);
  const clearSelected = useContentStore(s => s.clearSelected);
  const selectAll = useContentStore(s => s.selectAll);
  const { batchDelete, batchMove } = useBookmarks();
  const count = selectedIds.size;
  const totalVisible = filteredBookmarks.length;
  const allSelected = totalVisible > 0 && count === totalVisible;
  const [classifying, setClassifying] = useState(false);
  const [folders, setFolders] = useState<{ id: string; title: string }[]>([]);
  const [moveFolderId, setMoveFolderId] = useState("");

  useEffect(() => {
    if (!batchMode) return;
    safeSendMessage<{ folders?: { id: string; title: string }[] }>({
      type: "BOOKMARK_FOLDERS",
    }).then(res => {
      if (res?.folders) setFolders(res.folders);
    });
  }, [batchMode]);

  const handleDelete = useCallback(() => {
    const ids = Array.from(selectedIds);
    const store = useContentStore.getState();
    store.showModal({
      open: true,
      title: "批量删除",
      content: `确定删除选中的 ${count} 个书签？`,
      confirmVariant: "danger",
      onConfirm: () => {
        batchDelete(ids);
        store.hideModal();
      },
    });
  }, [selectedIds, count, batchDelete]);

  const handleMove = useCallback(async () => {
    if (!moveFolderId) {
      useContentStore.getState().pushToast({
        type: "info",
        message: "请选择目标文件夹",
      });
      return;
    }
    const ids = Array.from(selectedIds);
    await batchMove(ids, moveFolderId);
    setBatchMode(false);
  }, [selectedIds, moveFolderId, batchMove, setBatchMode]);

  const handleSmartClassify = useCallback(async () => {
    const ids = Array.from(selectedIds);
    setClassifying(true);
    const response = await safeSendMessage<{ results?: unknown[] }>({
      type: "AI_BATCH_CLASSIFY",
      payload: { bookmarkIds: ids },
    });
    if (response?.results) {
      useContentStore.getState().pushToast({
        type: "success",
        message: `已智能分类 ${response.results.length} 个书签`,
      });
      clearSelected();
      setBatchMode(false);
    } else {
      useContentStore.getState().pushToast({
        type: "error",
        message: "智能分类失败，请检查 AI 配置",
      });
    }
    setClassifying(false);
  }, [selectedIds, clearSelected, setBatchMode]);

  const handleCancel = useCallback(() => {
    clearSelected();
    setBatchMode(false);
  }, [clearSelected, setBatchMode]);

  const handleSelectAll = useCallback(() => {
    selectAll();
  }, [selectAll]);

  const handleClearSelection = useCallback(() => {
    clearSelected();
  }, [clearSelected]);

  if (!batchMode) return null;

  const hasSelection = count > 0;

  const barStyle: React.CSSProperties = {
    background: hasSelection
      ? "linear-gradient(135deg, var(--bm-primary-50) 0%, var(--bm-gray-0) 100%)"
      : "var(--bm-primary-50)",
    color: hasSelection ? "var(--bm-gray-700)" : "var(--bm-primary-700)",
    padding: "var(--bm-space-2) var(--bm-space-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--bm-space-2)",
    borderBottom: "1px solid var(--bm-primary-100)",
    minHeight: "40px",
    flexWrap: "wrap",
  };

  const leftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--bm-space-2)",
    fontSize: "var(--bm-text-sm)",
    fontWeight: hasSelection ? 600 : 500,
  };

  const rightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--bm-space-2)",
    flexWrap: "wrap",
  };

  const btnBaseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 12px",
    border: "none",
    borderRadius: "var(--bm-radius-sm)",
    fontSize: "var(--bm-text-sm)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity var(--bm-duration-fast)",
  };

  const primaryBtnStyle: React.CSSProperties = {
    ...btnBaseStyle,
    backgroundColor: "var(--bm-primary-500)",
    color: "white",
  };

  const dangerBtnStyle: React.CSSProperties = {
    ...btnBaseStyle,
    backgroundColor: "var(--bm-error-500)",
    color: "white",
  };

  const cancelBtnStyle: React.CSSProperties = {
    ...btnBaseStyle,
    backgroundColor: "var(--bm-gray-0)",
    color: "var(--bm-gray-600)",
    border: "1px solid var(--bm-gray-200)",
  };

  const ghostBtnStyle: React.CSSProperties = {
    ...btnBaseStyle,
    backgroundColor: "var(--bm-gray-0)",
    color: "var(--bm-primary-600)",
    border: "1px solid var(--bm-primary-200)",
  };

  const selectStyle: React.CSSProperties = {
    padding: "5px 8px",
    borderRadius: "var(--bm-radius-sm)",
    border: "1px solid var(--bm-gray-200)",
    background: "var(--bm-gray-0)",
    color: "var(--bm-gray-700)",
    fontSize: "var(--bm-text-xs)",
    maxWidth: "120px",
  };

  return (
    <div style={barStyle}>
      <div style={leftStyle}>
        {hasSelection
          ? `已选 ${count}${totalVisible > 0 ? ` / ${totalVisible}` : ""} 项`
          : "多选模式 · 点击书签或全选当前列表"}
      </div>
      <div style={rightStyle}>
        {totalVisible > 0 && (
          <button
            style={ghostBtnStyle}
            onClick={allSelected ? handleClearSelection : handleSelectAll}
            title={allSelected ? "取消当前列表的全部选中" : "选中当前列表中的全部书签"}
          >
            <CheckSquare size={14} />
            {allSelected ? "取消全选" : "全选"}
          </button>
        )}
        {hasSelection && (
          <>
            <select
              value={moveFolderId}
              onChange={e => setMoveFolderId(e.target.value)}
              style={selectStyle}
              title="移动到文件夹"
            >
              <option value="">移动到…</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
            <button
              style={primaryBtnStyle}
              onClick={handleMove}
              disabled={!moveFolderId}
              title="移动选中的书签到指定文件夹"
            >
              <FolderInput size={14} />
              移动
            </button>
            <button
              style={primaryBtnStyle}
              onClick={handleSmartClassify}
              disabled={classifying}
              title="对选中的书签重新 AI 分类"
            >
              <Sparkles size={14} />
              {classifying ? "分类中..." : "重新分类"}
            </button>
            <button style={dangerBtnStyle} onClick={handleDelete}>
              <Trash2 size={14} />
              删除
            </button>
          </>
        )}
        <button style={cancelBtnStyle} onClick={handleCancel}>
          <X size={14} />
          退出
        </button>
      </div>
    </div>
  );
};

export default BatchActionBar;
