// ============================================================
// NoteEditor — Markdown 备注编辑器
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { safeSendMessage } from '@shared/utils/chrome-api';

interface NoteEditorProps {
  bookmarkId: string;
  initialContent?: string;
  onSaved?: () => void;
}

const MAX_LENGTH = 500;

/**
 * Simple Markdown renderer supporting bold, italic, lists, and links.
 */
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Bold: **text**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic: *text*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code: `text`
    .replace(/`(.+?)`/g, '<code style="background:var(--bm-gray-100);padding:1px 4px;border-radius:3px;font-size:12px;">$1</code>')
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--bm-primary-500);">$1</a>')
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li style="margin-left:16px;">$1</li>')
    // Ordered list items
    .replace(/^\d+\.\s(.+)$/gm, '<li style="margin-left:16px;">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br/>');

  return html;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  bookmarkId,
  initialContent = '',
  onSaved,
}) => {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Auto-save with debounce
  useEffect(() => {
    if (content === initialContent) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 1500);
    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await safeSendMessage({
        type: 'NOTE_SET',
        payload: { bookmarkId, content },
      });
      setLastSaved(Date.now());
      onSaved?.();
    } catch {
      // silent
    }
    setSaving(false);
  }, [bookmarkId, content, onSaved]);

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>备注</span>
        <div style={headerRightStyle}>
          <button
            style={toggleBtnStyle}
            onClick={() => setPreview(!preview)}
          >
            {preview ? '编辑' : '预览'}
          </button>
          {saving && <span style={{ fontSize: 'var(--bm-text-xs)', color: 'var(--bm-gray-400)' }}>保存中...</span>}
          {lastSaved && !saving && (
            <span style={{ fontSize: 'var(--bm-text-xs)', color: 'var(--bm-success-500)' }}>
              已保存
            </span>
          )}
        </div>
      </div>

      {preview ? (
        <div
          style={previewStyle}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) || '<span style="color:var(--bm-gray-400)">暂无内容</span>' }}
        />
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="添加备注，支持 Markdown 基础语法..."
          style={textareaStyle}
          maxLength={MAX_LENGTH + 100} // Allow overflow for UX, validation handles it
        />
      )}

      {/* Character count */}
      <div style={countBarStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--bm-space-2)' }}>
          <div style={progressBarBgStyle}>
            <div
              style={{
                ...progressBarFillStyle,
                width: `${Math.min(100, (content.length / MAX_LENGTH) * 100)}%`,
                background: isOverLimit ? 'var(--bm-error-500)' : content.length > 400 ? 'var(--bm-warning-500)' : 'var(--bm-primary-400)',
              }}
            />
          </div>
          <span style={{
            fontSize: 'var(--bm-text-xs)',
            color: isOverLimit ? 'var(--bm-error-500)' : 'var(--bm-gray-400)',
            whiteSpace: 'nowrap',
          }}>
            {content.length}/{MAX_LENGTH}
          </span>
        </div>
        {isOverLimit && (
          <span style={{ fontSize: 'var(--bm-text-xs)', color: 'var(--bm-error-500)' }}>
            超出字符限制
          </span>
        )}
      </div>
    </div>
  );
};

// ---- Styles ----

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--bm-space-2)',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const headerRightStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--bm-space-2)',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-sm)',
  fontWeight: 600,
  color: 'var(--bm-gray-700)',
};

const toggleBtnStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-500)',
  fontSize: 'var(--bm-text-xs)',
  padding: '1px var(--bm-space-2)',
  cursor: 'pointer',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '80px',
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  padding: 'var(--bm-space-2)',
  fontSize: 'var(--bm-text-sm)',
  fontFamily: 'inherit',
  color: 'var(--bm-gray-700)',
  background: 'var(--bm-gray-0)',
  outline: 'none',
  resize: 'vertical',
  boxSizing: 'border-box',
  lineHeight: 1.5,
};

const previewStyle: React.CSSProperties = {
  minHeight: '80px',
  padding: 'var(--bm-space-2)',
  border: '1px solid var(--bm-gray-100)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-gray-50)',
  fontSize: 'var(--bm-text-sm)',
  color: 'var(--bm-gray-700)',
  lineHeight: 1.6,
  wordBreak: 'break-word',
};

const countBarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const progressBarBgStyle: React.CSSProperties = {
  width: '60px',
  height: '3px',
  background: 'var(--bm-gray-200)',
  borderRadius: '2px',
  overflow: 'hidden',
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '2px',
  transition: 'width var(--bm-duration-fast)',
};
