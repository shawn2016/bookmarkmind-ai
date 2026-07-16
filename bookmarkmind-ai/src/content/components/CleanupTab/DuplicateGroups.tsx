// ============================================================
// DuplicateGroups — display and manage duplicate bookmark groups
// ============================================================
import React, { useState } from 'react';
import type { DuplicateGroup, BookmarkItem } from '@shared/types';
import { useCleanupStore } from '@content/store/cleanupStore';

const TYPE_LABELS: Record<DuplicateGroup['type'], string> = {
  url_exact: 'URL 完全相同',
  title_exact: '标题完全相同',
  url_suspected: '疑似重复',
};

export const DuplicateGroups: React.FC = () => {
  const duplicateGroups = useCleanupStore(s => s.duplicateGroups);
  const findDuplicates = useCleanupStore(s => s.findDuplicates);
  const batchDelete = useCleanupStore(s => s.batchDelete);

  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleKeepOne = async (group: DuplicateGroup, strategy: 'newest' | 'oldest' | 'first') => {
    const sorted = [...group.bookmarks].sort((a, b) => a.dateAdded - b.dateAdded);
    let toDelete: BookmarkItem[];

    if (strategy === 'newest') {
      toDelete = sorted.slice(0, -1); // Delete all except newest
    } else if (strategy === 'oldest') {
      toDelete = sorted.slice(1); // Delete all except oldest
    } else {
      toDelete = sorted.slice(1); // Delete all except first
    }

    const ids = toDelete.map(b => b.id);
    await batchDelete(ids);
  };

  const handleCleanAll = async () => {
    const allIds: string[] = [];
    for (const group of duplicateGroups) {
      // Keep the newest in each group
      const sorted = [...group.bookmarks].sort((a, b) => a.dateAdded - b.dateAdded);
      const toDelete = sorted.slice(0, -1).map(b => b.id);
      allIds.push(...toDelete);
    }
    if (allIds.length > 0) {
      await batchDelete(allIds);
    }
  };

  // Empty state
  if (duplicateGroups.length === 0) {
    return (
      <div style={emptyStyle}>
        <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-md)' }}>
          暂无重复书签
        </span>
        <button style={actionBtnStyle} onClick={findDuplicates}>检测重复</button>
      </div>
    );
  }

  const totalDuplicates = duplicateGroups.reduce(
    (sum, g) => sum + g.bookmarks.length - 1,
    0,
  );

  return (
    <div style={containerStyle}>
      {/* Summary */}
      <div style={summaryStyle}>
        <span style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-gray-600)' }}>
          发现 {duplicateGroups.length} 组重复，共 {totalDuplicates} 个可清理
        </span>
        <div style={{ display: 'flex', gap: 'var(--bm-space-2)' }}>
          <button style={actionBtnStyle} onClick={findDuplicates}>重新检测</button>
          <button
            style={{ ...actionBtnStyle, background: 'var(--bm-error-500)', color: '#fff' }}
            onClick={handleCleanAll}
          >
            一键清理所有
          </button>
        </div>
      </div>

      {/* Groups */}
      <div style={listStyle}>
        {duplicateGroups.map((group, idx) => {
          const isExpanded = expandedGroups.has(idx);
          const sorted = [...group.bookmarks].sort((a, b) => a.dateAdded - b.dateAdded);

          return (
            <div key={idx} style={groupCardStyle}>
              <div
                style={groupHeaderStyle}
                onClick={() => toggleGroup(idx)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--bm-text-sm)', fontWeight: 600, color: 'var(--bm-gray-700)' }}>
                    {sorted[sorted.length - 1]?.title ?? '无标题'}
                  </div>
                  <div style={{ fontSize: 'var(--bm-text-xs)', color: 'var(--bm-gray-400)' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        background: 'var(--bm-warning-50)',
                        color: 'var(--bm-warning-600)',
                        padding: '1px var(--bm-space-1)',
                        borderRadius: '4px',
                        marginRight: 'var(--bm-space-1)',
                      }}
                    >
                      {TYPE_LABELS[group.type]}
                    </span>
                    共 {group.bookmarks.length} 个书签
                  </div>
                </div>
                <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-sm)' }}>
                  {isExpanded ? '收起' : '展开'}
                </span>
              </div>

              {/* Detail list */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--bm-gray-200)', paddingTop: 'var(--bm-space-2)' }}>
                  {sorted.map((bm) => (
                    <div key={bm.id} style={bookmarkItemStyle}>
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(bm.url).hostname}&sz=16`}
                        alt=""
                        style={{ width: '16px', height: '16px', marginRight: 'var(--bm-space-2)', flexShrink: 0 }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{
                          fontSize: 'var(--bm-text-sm)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {bm.title}
                        </div>
                        <div style={{
                          fontSize: 'var(--bm-text-xs)',
                          color: 'var(--bm-gray-400)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {new URL(bm.url).hostname}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 'var(--bm-text-xs)',
                        color: 'var(--bm-gray-400)',
                        whiteSpace: 'nowrap',
                        marginLeft: 'var(--bm-space-2)',
                      }}>
                        {new Date(bm.dateAdded).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  ))}

                  {/* Action buttons */}
                  <div style={{
                    display: 'flex',
                    gap: 'var(--bm-space-2)',
                    paddingTop: 'var(--bm-space-2)',
                    borderTop: '1px solid var(--bm-gray-100)',
                    marginTop: 'var(--bm-space-2)',
                  }}>
                    <button
                      style={smallBtnStyle}
                      onClick={() => handleKeepOne(group, 'newest')}
                    >
                      保留最新
                    </button>
                    <button
                      style={smallBtnStyle}
                      onClick={() => handleKeepOne(group, 'oldest')}
                    >
                      保留最旧
                    </button>
                    <button
                      style={smallBtnStyle}
                      onClick={() => handleKeepOne(group, 'first')}
                    >
                      保留第一个
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Styles ----

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
};

const summaryStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--bm-space-3)',
  borderBottom: '1px solid var(--bm-gray-200)',
};

const listStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 'var(--bm-space-2)',
};

const emptyStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 'var(--bm-space-4)',
};

const actionBtnStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-600)',
  fontSize: 'var(--bm-text-xs)',
  fontWeight: 500,
  padding: 'var(--bm-space-1) var(--bm-space-3)',
  cursor: 'pointer',
};

const smallBtnStyle: React.CSSProperties = {
  ...actionBtnStyle,
  fontSize: 'var(--bm-text-xs)',
  padding: '2px var(--bm-space-2)',
  color: 'var(--bm-primary-500)',
  borderColor: 'var(--bm-primary-200)',
};

const groupCardStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  padding: 'var(--bm-space-3)',
  marginBottom: 'var(--bm-space-2)',
};

const groupHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};

const bookmarkItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--bm-space-1) 0',
};
