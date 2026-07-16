// ============================================================
// BatchActionBar — batch operations bar (appears when selecting)
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import { Trash2, X, Sparkles, FolderInput } from "lucide-react";
import { useContentStore } from "@content/store/contentStore";
import { useBookmarks } from "@content/hooks/useBookmarks";
import { safeSendMessage } from "@shared/utils/chrome-api";

export const BatchActionBar: React.FC = () => {
  const batchMode = useContentStore(s => s.batchMode);
  const selectedIds = useContentStore(s => s.selectedIds);
  const setBatchMode = useContentStore(s => s.setBatchMode);
  const clearSelected = useContentStore(s => s.clearSelected);
  const { batchDelete, batchMove } = useBookmarks();
  const count = selectedIds.size;
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

  if (!batchMode) return null;

  const barStyle: React.CSSProperties = {
    backgroundColor: "var(--bm-gray-800)",
    color: "white",
    padding: "var(--bm-space-2) var(--bm-space-3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "var(--bm-space-2)",
    borderRadius: count > 0 ? "var(--bm-radius-lg) var(--bm-radius-lg) 0 0" : 0,
    animation: count > 0 ? "bm-slide-up var(--bm-duration-normal) var(--bm-ease-spring)" : undefined,
    minHeight: "44px",
    flexWrap: "wrap",
  };

  const leftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--bm-space-2)",
    fontSize: "var(--bm-text-sm)",
    fontWeight: 500,
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
    backgroundColor: "transparent",
    color: "rgba(255,255,255,0.7)",
  };

  const selectStyle: React.CSSProperties = {
    padding: "5px 8px",
    borderRadius: "var(--bm-radius-sm)",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "var(--bm-text-xs)",
    maxWidth: "120px",
  };

  return (
    <div style={barStyle}>
      <div style={leftStyle}>
        {count > 0 ? `已选 ${count} 项` : "多选模式：点击书签进行选择"}
      </div>
      {count > 0 && (
        <div style={rightStyle}>
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
          <button style={cancelBtnStyle} onClick={handleCancel}>
            <X size={14} />
            取消
          </button>
        </div>
      )}
    </div>
  );
};

export default BatchActionBar;
