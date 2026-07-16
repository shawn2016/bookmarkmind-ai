// ============================================================
// 收藏结果 Toast 文案（v3 三级）
// ============================================================

export type BookmarkCreateResult = {
  success?: boolean;
  classified?: boolean;
  category?: string;
  aiAttempted?: boolean;
  error?: string;
};

export type BookmarkToastVariant = 'success' | 'warning' | 'error';

function humanizeBookmarkError(error?: string): string {
  if (!error) return '收藏失败，请重试';
  const lower = error.toLowerCase();
  if (lower.includes('503') || lower.includes('service unavailable')) {
    return '收藏失败：无法写入 Chrome 书签';
  }
  if (lower.includes('timeout') || lower.includes('超时')) {
    return '收藏失败，请重试';
  }
  if (lower.includes('permission') || lower.includes('权限')) {
    return '收藏失败：无法写入 Chrome 书签';
  }
  return '收藏失败，请重试';
}

export function getBookmarkCreateToastMessage(
  result: BookmarkCreateResult,
  options?: { quickLabel?: string },
): { type: BookmarkToastVariant; message: string } {
  const quickLabel = options?.quickLabel ?? '已快速收藏';

  if (!result.success) {
    return { type: 'error', message: humanizeBookmarkError(result.error) };
  }

  if (result.classified && result.category) {
    return {
      type: 'success',
      message: `已收藏并归入「${result.category}」`,
    };
  }

  return { type: 'success', message: quickLabel };
}

export function getClassifyFailedToastMessage(): {
  type: BookmarkToastVariant;
  message: string;
} {
  return {
    type: 'warning',
    message: '已收藏（智能分类暂不可用）',
  };
}

export function getClassifySuccessToastMessage(category: string): {
  type: BookmarkToastVariant;
  message: string;
} {
  return {
    type: 'success',
    message: `已收藏并归入「${category}」`,
  };
}
