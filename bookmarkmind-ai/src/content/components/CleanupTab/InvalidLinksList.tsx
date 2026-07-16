// ============================================================
// InvalidLinksList — display invalid link scan results
// ============================================================
import React, { useRef, useState, useMemo } from 'react';
import type { InvalidLinkRecord, InvalidLinkStatus } from '@shared/types';
import { useCleanupStore } from '@content/store/cleanupStore';
import { useVirtualizer } from '@tanstack/react-virtual';

const ITEM_HEIGHT = 60;
const GROUP_HEADER_HEIGHT = 28;

const STATUS_LABELS: Record<InvalidLinkStatus, string> = {
  invalid_404: '404',
  invalid_5xx: '5xx',
  invalid_redirect: '重定向',
  invalid_dns: 'DNS',
  invalid_timeout: '超时',
  invalid_content_deleted: '已删',
};

const STATUS_COLORS: Record<InvalidLinkStatus, string> = {
  invalid_404: '#E24B4A',
  invalid_5xx: '#E24B4A',
  invalid_redirect: '#BA7517',
  invalid_dns: '#E24B4A',
  invalid_timeout: '#BA7517',
  invalid_content_deleted: '#6B7280',
};

export const InvalidLinksList: React.FC = () => {
  const scanState = useCleanupStore(s => s.scanState);
  const filteredInvalidLinks = useCleanupStore(s => s.filteredInvalidLinks);
  const invalidLinks = useCleanupStore(s => s.invalidLinks);
  const invalidFilter = useCleanupStore(s => s.invalidFilter);
  const startScan = useCleanupStore(s => s.startScan);
  const batchDelete = useCleanupStore(s => s.batchDelete);
  const exportCSV = useCleanupStore(s => s.exportCSV);
  const setInvalidFilter = useCleanupStore(s => s.setInvalidFilter);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Group results by status
  const grouped = useMemo(() => {
    const groups = new Map<InvalidLinkStatus, InvalidLinkRecord[]>();
    for (const link of filteredInvalidLinks) {
      const group = groups.get(link.status);
      if (group) group.push(link);
      else groups.set(link.status, [link]);
    }
    return groups;
  }, [filteredInvalidLinks]);

  // Flatten groups into a single array for virtual scrolling
  // Each item is either a group header or a link
  type FlatItem =
    | { type: 'header'; status: InvalidLinkStatus; count: number }
    | { type: 'link'; link: InvalidLinkRecord };

  const flatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = [];
    for (const [status, links] of grouped) {
      items.push({ type: 'header', status, count: links.length });
      for (const link of links) {
        items.push({ type: 'link', link });
      }
    }
    return items;
  }, [grouped]);

  const rowVirtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => listRef.current,
    estimateSize: (index) => {
      return flatItems[index]?.type === 'header' ? GROUP_HEADER_HEIGHT : ITEM_HEIGHT;
    },
    overscan: 5,
  });

  // Available status filters
  const availableStatuses = useMemo(() => {
    const statuses = new Set<InvalidLinkStatus>();
    for (const link of invalidLinks) {
      statuses.add(link.status);
    }
    return Array.from(statuses);
  }, [invalidLinks]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const allIds = filteredInvalidLinks.map(l => l.bookmarkId);
    setSelectedIds(new Set(allIds));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    await batchDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowConfirm(false);
  };

  // Scanning state
  if (scanState.phase === 'scanning') {
    return (
      <div style={centerStyle}>
        <div style={progressBarContainerStyle}>
          <div
            style={{
              ...progressBarFillStyle,
              width: scanState.total > 0
                ? `${Math.round((scanState.done / scanState.total) * 100)}%`
                : '0%',
            }}
          />
        </div>
        <span style={progressTextStyle}>
          正在检测链接有效性... {scanState.done}/{scanState.total}
        </span>
      </div>
    );
  }

  // Error state
  if (scanState.phase === 'error') {
    return (
      <div style={centerStyle}>
        <span style={{ color: 'var(--bm-error-500)', fontSize: 'var(--bm-text-md)' }}>
          检测失败: {scanState.error}
        </span>
        <button style={actionButtonStyle} onClick={startScan}>重试</button>
      </div>
    );
  }

  // Empty state
  if (scanState.phase === 'idle') {
    return (
      <div style={centerStyle}>
        <span style={{ color: 'var(--bm-gray-400)', fontSize: 'var(--bm-text-md)' }}>
          暂无检测结果
        </span>
        <button style={actionButtonStyle} onClick={startScan}>开始检测</button>
      </div>
    );
  }

  // No results
  if (filteredInvalidLinks.length === 0 && scanState.phase === 'done') {
    return (
      <div style={centerStyle}>
        <span style={{ color: 'var(--bm-success-500)', fontSize: 'var(--bm-text-md)' }}>
          {invalidFilter === 'all'
            ? '所有链接都有效!'
            : '该类型暂无失效链接'}
        </span>
        <div style={{ display: 'flex', gap: 'var(--bm-space-2)', marginTop: 'var(--bm-space-2)' }}>
          <button style={actionButtonStyle} onClick={startScan}>重新检测</button>
          {invalidFilter !== 'all' && (
            <button
              style={{ ...actionButtonStyle, background: 'var(--bm-gray-100)', color: 'var(--bm-gray-600)' }}
              onClick={() => setInvalidFilter('all')}
            >
              显示全部
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Toolbar */}
      <div style={toolbarStyle}>
        <div style={{ display: 'flex', gap: 'var(--bm-space-2)' }}>
          <button style={actionButtonStyle} onClick={startScan}>
            重新检测
          </button>
          <button
            style={{ ...actionButtonStyle, background: 'var(--bm-error-500)', color: '#fff' }}
            onClick={() => selectedIds.size > 0 && setShowConfirm(true)}
            disabled={selectedIds.size === 0}
          >
            删除选中 ({selectedIds.size})
          </button>
          <button style={actionButtonStyle} onClick={exportCSV}>
            导出 CSV
          </button>
        </div>
        <div style={{ display: 'flex', gap: 'var(--bm-space-1)' }}>
          <button
            style={{ ...actionButtonStyle, fontSize: 'var(--bm-text-xs)', padding: '2px var(--bm-space-2)' }}
            onClick={selectAll}
          >
            全选
          </button>
          <button
            style={{ ...actionButtonStyle, fontSize: 'var(--bm-text-xs)', padding: '2px var(--bm-space-2)' }}
            onClick={clearSelection}
          >
            取消
          </button>
        </div>
      </div>

      {/* Status filter */}
      <div style={filterStyle}>
        <button
          style={invalidFilter === 'all' ? filterActiveBtnStyle : filterBtnStyle}
          onClick={() => setInvalidFilter('all')}
        >
          全部 ({invalidLinks.length})
        </button>
        {availableStatuses.map(s => (
          <button
            key={s}
            style={invalidFilter === s ? filterActiveBtnStyle : filterBtnStyle}
            onClick={() => setInvalidFilter(s)}
          >
            {STATUS_LABELS[s]} ({invalidLinks.filter(l => l.status === s).length})
          </button>
        ))}
      </div>

      {/* Virtualized list */}
      <div ref={listRef} style={listStyle}>
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = flatItems[virtualItem.index];
            if (!item) return null;

            if (item.type === 'header') {
              return (
                <div
                  key={`h-${item.status}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div style={groupHeaderStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: STATUS_COLORS[item.status],
                        marginRight: 'var(--bm-space-2)',
                      }}
                    />
                    {STATUS_LABELS[item.status]} ({item.count})
                  </div>
                </div>
              );
            }

            const link = item.link;
            return (
              <div
                key={link.bookmarkId}
                style={{
                  ...linkItemStyle,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                  backgroundColor: selectedIds.has(link.bookmarkId)
                    ? 'var(--bm-primary-50)'
                    : 'transparent',
                }}
                onClick={() => toggleSelect(link.bookmarkId)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(link.bookmarkId)}
                  onChange={() => {}}
                  style={{ marginRight: 'var(--bm-space-2)', cursor: 'pointer' }}
                />
                <img
                  src={`https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=16`}
                  alt=""
                  style={{ width: '16px', height: '16px', marginRight: 'var(--bm-space-2)' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: 'var(--bm-text-sm)',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {link.title}
                  </div>
                  <div style={{
                    fontSize: 'var(--bm-text-xs)',
                    color: 'var(--bm-gray-400)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {link.url}
                  </div>
                </div>
                <span style={{
                  fontSize: 'var(--bm-text-xs)',
                  color: STATUS_COLORS[link.status],
                  marginLeft: 'var(--bm-space-2)',
                  whiteSpace: 'nowrap',
                }}>
                  {STATUS_LABELS[link.status]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <>
          <div style={overlayStyle} onClick={() => setShowConfirm(false)} />
          <div style={modalStyle}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--bm-space-2)' }}>
              确认删除
            </div>
            <div style={{ fontSize: 'var(--bm-text-sm)', color: 'var(--bm-gray-500)', marginBottom: 'var(--bm-space-4)' }}>
              确定要删除 {selectedIds.size} 个失效书签吗？删除后可在回收站找回（30天内）。
            </div>
            <div style={{ display: 'flex', gap: 'var(--bm-space-2)', justifyContent: 'flex-end' }}>
              <button
                style={{ ...actionButtonStyle, background: 'var(--bm-gray-100)', color: 'var(--bm-gray-600)' }}
                onClick={() => setShowConfirm(false)}
              >
                取消
              </button>
              <button
                style={{ ...actionButtonStyle, background: 'var(--bm-error-500)', color: '#fff' }}
                onClick={handleBatchDelete}
              >
                确认删除
              </button>
            </div>
          </div>
        </>
      )}
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

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--bm-space-2) var(--bm-space-3)',
  borderBottom: '1px solid var(--bm-gray-200)',
};

const filterStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--bm-space-1)',
  padding: 'var(--bm-space-2) var(--bm-space-3)',
  overflowX: 'auto',
  borderBottom: '1px solid var(--bm-gray-200)',
};

const listStyle: React.CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: 'var(--bm-space-2)',
};

const actionButtonStyle: React.CSSProperties = {
  border: '1px solid var(--bm-gray-200)',
  borderRadius: 'var(--bm-radius-sm)',
  background: 'var(--bm-gray-0)',
  color: 'var(--bm-gray-600)',
  fontSize: 'var(--bm-text-xs)',
  fontWeight: 500,
  padding: 'var(--bm-space-1) var(--bm-space-3)',
  cursor: 'pointer',
};

const filterBtnStyle: React.CSSProperties = {
  ...actionButtonStyle,
  whiteSpace: 'nowrap',
  fontSize: 'var(--bm-text-xs)',
  padding: '2px var(--bm-space-2)',
};
const filterActiveBtnStyle: React.CSSProperties = {
  ...filterBtnStyle,
  background: 'var(--bm-primary-50)',
  borderColor: 'var(--bm-primary-500)',
  color: 'var(--bm-primary-500)',
};

const groupHeaderStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-xs)',
  fontWeight: 600,
  color: 'var(--bm-gray-500)',
  padding: 'var(--bm-space-2) 0 var(--bm-space-1)',
  display: 'flex',
  alignItems: 'center',
};

const linkItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--bm-space-2)',
  borderRadius: 'var(--bm-radius-sm)',
  cursor: 'pointer',
  transition: 'background var(--bm-duration-fast)',
};

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  gap: 'var(--bm-space-4)',
  padding: 'var(--bm-space-6)',
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '80%',
  height: '4px',
  background: 'var(--bm-gray-200)',
  borderRadius: '2px',
  overflow: 'hidden',
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  background: 'var(--bm-primary-500)',
  borderRadius: '2px',
  transition: 'width var(--bm-duration-normal) var(--bm-ease-default)',
};

const progressTextStyle: React.CSSProperties = {
  fontSize: 'var(--bm-text-sm)',
  color: 'var(--bm-gray-500)',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.3)',
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: 'var(--bm-gray-0)',
  borderRadius: 'var(--bm-radius-md)',
  padding: 'var(--bm-space-5)',
  boxShadow: 'var(--bm-shadow-panel)',
  zIndex: 10000,
  minWidth: '300px',
  maxWidth: '400px',
};

export default InvalidLinksList;
