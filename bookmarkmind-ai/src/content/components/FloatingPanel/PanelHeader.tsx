// ============================================================
// PanelHeader — title bar with drag handle & close/minimize
// ============================================================

import React, { useCallback } from 'react';
import { Bookmark, Minus, X, Maximize2, Minimize2 } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';

interface PanelHeaderProps {
  onPointerDown?: (e: React.PointerEvent) => void;
  isDragging: boolean;
  onClose: () => void;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  onPointerDown,
  isDragging,
  onClose,
}) => {
  const collapsePanel = useContentStore((s) => s.collapsePanel);
  const panelFullscreen = useContentStore((s) => s.panelFullscreen);
  const togglePanelFullscreen = useContentStore((s) => s.togglePanelFullscreen);

  const handleMinimize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      collapsePanel();
    },
    [collapsePanel],
  );

  const handleToggleFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      togglePanelFullscreen();
    },
    [togglePanelFullscreen],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onClose();
    },
    [onClose],
  );

  const stopPointer = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const headerStyle: React.CSSProperties = {
    height: '46px',
    minHeight: '46px',
    backgroundColor: 'var(--bm-gray-50)',
    borderBottom: '1px solid var(--bm-tobacco-600)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 var(--bm-space-3)',
    userSelect: 'none',
  };

  const dragAreaStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-2)',
    cursor: isDragging ? 'grabbing' : 'grab',
    height: '100%',
  };

  // Title uses display serif — 整个设计里唯一一个签名时刻的字形变化
  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-display)',
    fontSize: 'var(--bm-text-lg)',
    fontWeight: 600,
    color: 'var(--bm-gray-800)',
    letterSpacing: 'var(--bm-tracking-tight)',
    lineHeight: 1,
    fontStyle: 'italic',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-1)',
    flexShrink: 0,
  };

  const btnBaseStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--bm-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--bm-gray-500)',
    transition: 'background var(--bm-duration-fast), color var(--bm-duration-fast)',
    pointerEvents: 'auto',
  };

  return (
    <div style={headerStyle}>
      <div
        style={dragAreaStyle}
        onPointerDown={onPointerDown}
      >
        <Bookmark size={16} color="var(--bm-primary-500)" strokeWidth={2.5} />
        <span style={titleStyle}>AI 书签管家</span>
      </div>
      <div
        style={actionsStyle}
        onPointerDown={stopPointer}
      >
        <button
          style={btnBaseStyle}
          onClick={handleMinimize}
          onPointerDown={stopPointer}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--bm-gray-200)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }}
          aria-label="最小化"
          title="最小化"
          data-testid="panel-minimize-btn"
        >
          <Minus size={14} />
        </button>
        <button
          style={btnBaseStyle}
          onClick={handleToggleFullscreen}
          onPointerDown={stopPointer}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'var(--bm-gray-200)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'transparent';
          }}
          aria-label={panelFullscreen ? '退出全屏' : '全屏'}
          title={panelFullscreen ? '退出全屏' : '全屏'}
          data-testid="panel-fullscreen-btn"
          data-active={panelFullscreen}
        >
          {panelFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
        <button
          style={btnBaseStyle}
          onClick={handleClose}
          onPointerDown={stopPointer}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'var(--bm-error-50)';
            el.style.color = 'var(--bm-error-500)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = 'transparent';
            el.style.color = 'var(--bm-gray-500)';
          }}
          aria-label="关闭"
          title="关闭"
          data-testid="panel-close-btn"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default PanelHeader;
