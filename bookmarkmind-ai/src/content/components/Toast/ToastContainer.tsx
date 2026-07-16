// ============================================================
// ToastContainer — fixed-position toast notifications
// ============================================================

import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useContentStore } from '@content/store/contentStore';
import type { ToastItem } from '@content/store/contentStore';

const iconMap = {
  success: <CheckCircle size={16} color="var(--bm-success-500)" />,
  error: <AlertCircle size={16} color="var(--bm-error-500)" />,
  warning: <AlertTriangle size={16} color="var(--bm-warning-500)" />,
  info: <Info size={16} color="var(--bm-info-500)" />,
};

const bgMap = {
  success: 'var(--bm-success-50)',
  error: 'var(--bm-error-50)',
  warning: 'var(--bm-warning-50)',
  info: 'var(--bm-info-50)',
};

const borderMap = {
  success: 'var(--bm-success-100)',
  error: 'var(--bm-error-100)',
  warning: 'var(--bm-warning-100)',
  info: 'var(--bm-info-100)',
};

const SingleToast: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({
  toast,
  onDismiss,
}) => {
  const toastStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--bm-space-2)',
    padding: 'var(--bm-space-3) var(--bm-space-4)',
    backgroundColor: bgMap[toast.type] || bgMap.info,
    border: `1px solid ${borderMap[toast.type] || borderMap.info}`,
    borderRadius: 'var(--bm-radius-md)',
    boxShadow: 'var(--bm-shadow-card)',
    fontSize: 'var(--bm-text-sm)',
    fontWeight: 500,
    color: 'var(--bm-gray-700)',
    minWidth: '200px',
    maxWidth: '320px',
    animation:
      'bm-slide-in-right var(--bm-duration-normal) var(--bm-ease-spring)',
    pointerEvents: 'auto',
  };

  const dismissBtnStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    border: 'none',
    background: 'transparent',
    borderRadius: 'var(--bm-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--bm-gray-400)',
    marginLeft: 'auto',
    flexShrink: 0,
    padding: 0,
  };

  return (
    <div style={toastStyle} role="alert" data-testid="toast" data-toast-type={toast.type}>
      {iconMap[toast.type] || iconMap.info}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        style={dismissBtnStyle}
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'var(--bm-gray-200)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            'transparent';
        }}
        aria-label="关闭"
      >
        <X size={12} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useContentStore((s) => s.toasts);
  const removeToast = useContentStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    top: '16px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--bm-space-2)',
    zIndex: 'var(--bm-z-toast)',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      {toasts.map((toast) => (
        <SingleToast
          key={toast.id}
          toast={toast}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
