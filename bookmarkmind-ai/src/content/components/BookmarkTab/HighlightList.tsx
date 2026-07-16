// ============================================================
// HighlightList — 高亮片段列表
// ============================================================
import React, { useEffect, useState } from 'react';
import type { BookmarkHighlight } from '@shared/types';
import { safeSendMessage } from '@shared/utils/chrome-api';

interface HighlightListProps {
  bookmarkId: string;
}

export const HighlightList: React.FC<HighlightListProps> = ({ bookmarkId }) => {
  const [highlights, setHighlights] = useState<BookmarkHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighlights();
  }, [bookmarkId]);

  const loadHighlights = async () => {
    setLoading(true);
    try {
      const response = await safeSendMessage({
        type: 'HIGHLIGHT_LIST',
        payload: { bookmarkId },
      });
      setHighlights(((response as Record<string, unknown>)?.highlights as BookmarkHighlight[]) ?? []);
    } catch {
      // silent
    }
    setLoading(false);
  };

  const handleDelete = async (highlightId: string) => {
    try {
      await safeSendMessage({
        type: 'HIGHLIGHT_DELETE',
        payload: { bookmarkId, highlightId },
      });
      setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
    } catch {
      // silent
    }
  };

  const handleAddCurrentSelection = async () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString().trim();
    if (!text || text.length > 500) return;

    // Get XPath of selection
    let xpath = '';
    try {
      const range = selection.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;
      if (ancestor.nodeType === Node.TEXT_NODE && ancestor.parentElement) {
        xpath = getXPath(ancestor.parentElement);
      }
    } catch {
      xpath = ''; // Fallback
    }

    const url = window.location.href;

    try {
      const response = await safeSendMessage({
        type: 'HIGHLIGHT_ADD',
        payload: { bookmarkId, text, xpath, url },
      });
      const addResp = response as Record<string, unknown>;
      if (addResp?.highlight) {
        setHighlights((prev) => [...prev, addResp.highlight as BookmarkHighlight]);
      }
      selection.removeAllRanges();
    } catch {
      // silent
    }
  };

  if (loading) {
    return <div style={emptyStyle}>加载中...</div>;
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={labelStyle}>高亮片段 ({highlights.length}/10)</span>
        <button style={addBtnStyle} onClick={handleAddCurrentSelection}>
          + 添加选中文本
        </button>
      </div>

      {highlights.length === 0 ? (
        <div style={emptyStyle}>
          <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-sm)' }}>
            暂无高亮。选中网页文本后点击上方按钮添加。
          </span>
        </div>
      ) : (
        <div style={listStyle}>
          {highlights.map((h) => (
            <div key={h.id} style={highlightItemStyle}>
              <div style={quoteBarStyle} />
              <div style={{ flex: 1 }}>
                <div style={textStyle}>"{h.text}"</div>
                <div style={metaStyle}>
                  <span>{new Date(h.createdAt).toLocaleDateString('zh-CN')}</span>
                  <button
                    style={deleteBtnStyle}
                    onClick={() => handleDelete(h.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Simple XPath helper
function getXPath(element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current) {
    let index = 1;
    const tag = current.tagName.toLowerCase();
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === current.tagName) index++;
      sibling = sibling.previousElementSibling;
    }
    parts.unshift(`${tag}[${index}]`);
    current = current.parentElement;
    if (current?.tagName === 'BODY' || current?.tagName === 'HTML') break;
  }
  return '/' + parts.join('/');
}

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

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-sm)',
  fontWeight: 600,
  color: 'var(--bm-gray-700)',
};

const addBtnStyle: React.CSSProperties = {
  border: '1px solid var(--bm-primary-200)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-primary-50)',
  color: 'var(--bm-primary-600)',
  fontSize: 'var(--bm-text-xs)',
  padding: '1px var(--bm-space-2)',
  cursor: 'pointer',
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  padding: 'var(--bm-space-4)',
  color: 'var(--bm-gray-400)',
  fontSize: 'var(--bm-text-sm)',
};

const listStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--bm-space-2)',
  maxHeight: '200px',
  overflowY: 'auto',
};

const highlightItemStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--bm-space-2)',
  padding: 'var(--bm-space-2)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-gray-50)',
  border: '1px solid var(--bm-gray-100)',
};

const quoteBarStyle: React.CSSProperties = {
  width: '3px',
  borderRadius: '2px',
  background: 'var(--bm-primary-400)',
  flexShrink: 0,
  alignSelf: 'stretch',
};

const textStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-sm)',
  color: 'var(--bm-gray-700)',
  fontStyle: 'italic',
  lineHeight: 1.5,
};

const metaStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'var(--bm-space-1)',
  fontSize: 'var(--bm-text-xs)',
  color: 'var(--bm-gray-400)',
};

const deleteBtnStyle: React.CSSProperties = {
  border: 'none',
  background: 'none',
  color: 'var(--bm-gray-400)',
  fontSize: 'var(--bm-text-xs)',
  cursor: 'pointer',
  padding: '1px 4px',
};
