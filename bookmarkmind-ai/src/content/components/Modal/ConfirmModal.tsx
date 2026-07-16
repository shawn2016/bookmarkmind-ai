// ============================================================
// ConfirmModal — confirmation dialog for destructive actions
// ============================================================

import React, { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';

export const ConfirmModal: React.FC = () => {
  const { modalState, hideModal } = useContentStore();

  const handleConfirm = useCallback(() => {
    modalState.onConfirm?.();
  }, [modalState]);

  const handleCancel = useCallback(() => {
    hideModal();
  }, [hideModal]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        hideModal();
      }
    },
    [hideModal],
  );

  const isDanger = modalState.confirmVariant === 'danger';

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 'var(--bm-z-modal)',
    pointerEvents: 'auto',
    animation: 'bm-fade-in var(--bm-duration-fast) var(--bm-ease-out)',
  };

  const dialogStyle: React.CSSProperties = {
    backgroundColor: 'var(--bm-gray-0)',
    borderRadius: 'var(--bm-radius-lg)',
    boxShadow: 'var(--bm-shadow-panel)',
    minWidth: '280px',
    maxWidth: '380px',
    padding: 'var(--bm-space-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--bm-space-4)',
    animation: 'bm-panel-enter var(--bm-duration-normal) var(--bm-ease-out)',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--bm-space-3)',
  };

  const iconWrapStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    minWidth: '36px',
    borderRadius: 'var(--bm-radius-full)',
    backgroundColor: isDanger ? 'var(--bm-error-50)' : 'var(--bm-warning-50)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-md)',
    fontWeight: 600,
    color: 'var(--bm-gray-800)',
  };

  const contentStyle: React.CSSProperties = {
    fontSize: 'var(--bm-text-sm)',
    color: 'var(--bm-gray-500)',
    lineHeight: 'var(--bm-leading-normal)',
  };

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--bm-space-2)',
  };

  const cancelBtnStyle: React.CSSProperties = {
    padding: '7px 16px',
    border: '1px solid var(--bm-gray-200)',
    background: 'var(--bm-gray-0)',
    borderRadius: 'var(--bm-radius-md)',
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 500,
    color: 'var(--bm-gray-600)',
    cursor: 'pointer',
    transition: 'background var(--bm-duration-fast)',
  };

  const confirmBtnStyle: React.CSSProperties = {
    padding: '7px 16px',
    border: 'none',
    background: isDanger ? 'var(--bm-error-500)' : 'var(--bm-primary-500)',
    borderRadius: 'var(--bm-radius-md)',
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 500,
    color: 'white',
    cursor: 'pointer',
    transition: 'opacity var(--bm-duration-fast)',
  };

  return (
    <div style={overlayStyle} onClick={handleBackdropClick}>
      <div style={dialogStyle} role="alertdialog" aria-modal="true">
        <div style={headerStyle}>
          <div style={iconWrapStyle}>
            <AlertTriangle
              size={18}
              color={
                isDanger ? 'var(--bm-error-500)' : 'var(--bm-warning-500)'
              }
            />
          </div>
          <div style={titleStyle}>{modalState.title}</div>
        </div>

        <div style={contentStyle}>{modalState.content}</div>

        <div style={actionsStyle}>
          <button
            style={cancelBtnStyle}
            onClick={handleCancel}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--bm-gray-100)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'var(--bm-gray-0)';
            }}
          >
            取消
          </button>
          <button
            style={confirmBtnStyle}
            onClick={handleConfirm}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '0.85';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.opacity = '1';
            }}
          >
            {modalState.confirmText ?? '确定'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
