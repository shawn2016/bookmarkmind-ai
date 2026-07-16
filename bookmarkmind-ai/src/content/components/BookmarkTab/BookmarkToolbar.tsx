// ============================================================
// BookmarkToolbar — one-click reorganize all bookmarks
// ============================================================

import React, { useCallback, useState } from "react";
import { Sparkles, CheckSquare, FolderTree, Tags } from "lucide-react";
import { useContentStore } from "@content/store/contentStore";
import { useBookmarks } from "@content/hooks/useBookmarks";
import { safeSendMessage, safeOpenOptionsPage } from "@shared/utils/chrome-api";

const REORGANIZE_WARNING = `⚠️ 一键整理将执行以下操作：

1. 打破现有书签文件夹结构（用户自建文件夹将被删除）
2. 将待整理书签移至临时区域后，由 AI 重新分类
3. 新建分类不超过 10 个
4. 书签栏上直接摆放的书签（手动拖入）不会参与整理

开始前会自动创建完整备份，可在「设置 → 数据管理」中一键恢复。

确定要继续吗？`;

export const BookmarkToolbar: React.FC<{
  onManageTags?: () => void;
}> = ({ onManageTags }) => {
  const batchMode = useContentStore(s => s.batchMode);
  const bookmarks = useContentStore(s => s.bookmarks);
  const aiConfigured = useContentStore(s => s.aiConfigured);
  const { setBatchMode, clearSelected } = useContentStore.getState();
  const { loadBookmarks } = useBookmarks();
  const [organizing, setOrganizing] = useState(false);

  const handleReorganizeAll = useCallback(async () => {
    if (!aiConfigured) {
      useContentStore.getState().pushToast({
        type: "error",
        message: "请先在设置中配置 AI 并选择模型",
      });
      return;
    }

    if (bookmarks.length === 0) {
      useContentStore.getState().pushToast({
        type: "info",
        message: "没有书签可整理",
      });
      return;
    }

    const store = useContentStore.getState();
    store.showModal({
      open: true,
      title: "一键整理全部书签",
      content: REORGANIZE_WARNING,
      confirmVariant: "danger",
      confirmText: "我已了解风险，开始整理",
      onConfirm: async () => {
        store.hideModal();
        setOrganizing(true);
        const response = await safeSendMessage<{
          success?: boolean;
          organized?: number;
          summary?: string;
        }>({ type: "AI_ORGANIZE_SCATTERED" });

        if (response?.success) {
          store.pushToast({
            type: "success",
            message: response.summary ?? `已整理 ${response.organized} 个书签`,
          });
          await loadBookmarks();
        } else {
          store.pushToast({
            type: "error",
            message: "整理失败，请检查 AI 配置",
          });
        }
        setOrganizing(false);
      },
    });
  }, [aiConfigured, bookmarks.length, loadBookmarks]);

  const handleToggleBatch = useCallback(() => {
    if (batchMode) {
      clearSelected();
      setBatchMode(false);
    } else {
      setBatchMode(true);
    }
  }, [batchMode, clearSelected, setBatchMode]);

  const handleManageFolders = useCallback(() => {
    safeOpenOptionsPage();
  }, []);

  const barStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--bm-space-2) var(--bm-space-3)",
    gap: "var(--bm-space-2)",
    borderBottom: "1px solid var(--bm-gray-100)",
    background:
      "linear-gradient(135deg, var(--bm-primary-50) 0%, var(--bm-gray-0) 100%)",
  };

  const btnStyle = (primary?: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    border: primary ? "none" : "1px solid var(--bm-gray-200)",
    borderRadius: "var(--bm-radius-md)",
    background: primary ? "var(--bm-primary-500)" : "var(--bm-gray-0)",
    color: primary ? "white" : "var(--bm-gray-600)",
    fontSize: "var(--bm-text-xs)",
    fontWeight: 500,
    cursor: "pointer",
    transition: "opacity var(--bm-duration-fast)",
    whiteSpace: "nowrap",
  });

  return (
    <div style={barStyle}>
      <button
        style={btnStyle(true)}
        onClick={handleReorganizeAll}
        disabled={organizing || bookmarks.length === 0}
        title="打破现有文件夹，将全部书签重新 AI 分类（不可撤销，请先备份）"
      >
        <Sparkles size={13} />
        {organizing
          ? "整理中..."
          : bookmarks.length > 0
            ? `一键整理 (${bookmarks.length})`
            : "无书签"}
      </button>

      <div style={{ display: "flex", gap: "6px" }}>
        <button
          style={{
            ...btnStyle(),
            ...(batchMode
              ? {
                  background: "var(--bm-primary-50)",
                  borderColor: "var(--bm-primary-200)",
                  color: "var(--bm-primary-600)",
                }
              : {}),
          }}
          onClick={handleToggleBatch}
        >
          <CheckSquare size={13} />
          {batchMode ? "退出多选" : "多选"}
        </button>
        <button style={btnStyle()} onClick={handleManageFolders}>
          <FolderTree size={13} />
          书签管理
        </button>
        {onManageTags && (
          <button style={btnStyle()} onClick={onManageTags}>
            <Tags size={13} />
            管理标签
          </button>
        )}
      </div>
    </div>
  );
};

export default BookmarkToolbar;
