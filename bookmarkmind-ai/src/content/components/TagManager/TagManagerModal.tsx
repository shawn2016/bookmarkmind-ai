// ============================================================
// TagManagerModal — 标签管理弹层
// ============================================================

import React from 'react';
import { X } from 'lucide-react';
import { TagManager } from './TagManager';

interface TagManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <span style={{ fontWeight: 600, fontSize: 'var(--bm-text-md)' }}>
            标签管理
          </span>
          <button onClick={onClose} style={closeBtnStyle} aria-label="关闭">
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '12px 16px 16px', maxHeight: '360px', overflowY: 'auto' }}>
          <TagManager showTitle={false} />
        </div>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.35)',
  zIndex: 'var(--bm-z-modal)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
};

const boxStyle: React.CSSProperties = {
  width: '340px',
  maxWidth: '90vw',
  backgroundColor: 'var(--bm-gray-0)',
  borderRadius: 'var(--bm-radius-lg)',
  boxShadow: 'var(--bm-shadow-panel)',
  border: '1px solid var(--bm-gray-200)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid var(--bm-gray-100)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const closeBtnStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: 'var(--bm-gray-400)',
  display: 'flex',
  alignItems: 'center',
};

export default TagManagerModal;
