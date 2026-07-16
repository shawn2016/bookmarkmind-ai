import React from 'react';
import { X } from 'lucide-react';
import Icon from './Icon';
import Button from './Button';
import type { ButtonVariant } from './Button';

export interface ModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Modal title */
  title: string;
  /** Modal body content */
  children: React.ReactNode;
  /** Called when the user closes the modal (overlay click / ESC / cancel) */
  onClose: () => void;
  /** Called when the user clicks the confirm button */
  onConfirm?: () => void;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Confirm button variant (default: 'primary') */
  confirmVariant?: ButtonVariant;
  /** Additional CSS classes for the modal panel */
  className?: string;
}

/**
 * Modal — Confirmation dialog with overlay and spring animation.
 *
 * Overlay: fixed, rgba(0,0,0,0.4), backdrop-filter blur(4px), z-index --bm-z-modal-overlay
 * Panel:  white bg, border-radius --bm-radius-xl, shadow --bm-shadow-panel,
 *         max-width 400px, padding 24px, z-index --bm-z-modal
 *
 * Appear: scale(0.95) → 1 + opacity 0 → 1 with var(--bm-ease-spring) 250ms.
 * ESC key closes. Outer click on overlay closes.
 */
export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  className = '',
}) => {
  const [visible, setVisible] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Animate in / out
  React.useEffect(() => {
    if (open) {
      setVisible(true);
      return;
    }
    // Wait for exit animation before removing from DOM
    const timer = setTimeout(() => setVisible(false), 250);
    return () => clearTimeout(timer);
  }, [open]);

  // ESC key handler
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!visible && !open) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    zIndex: 'var(--bm-z-modal-overlay)',
    opacity: open ? 1 : 0,
    transition: `opacity var(--bm-duration-normal) var(--bm-ease-out)`,
  };

  const panelStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    margin: 'var(--bm-space-4)',
    padding: '24px',
    backgroundColor: 'var(--bm-gray-0)',
    borderRadius: 'var(--bm-radius-xl)',
    boxShadow: 'var(--bm-shadow-panel)',
    zIndex: 'var(--bm-z-modal)',
    transform: open ? 'scale(1)' : 'scale(0.95)',
    opacity: open ? 1 : 0,
    transition: `transform var(--bm-duration-normal) var(--bm-ease-spring), opacity var(--bm-duration-fast) var(--bm-ease-out)`,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 'var(--bm-space-4)',
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-lg)',
    fontWeight: 'var(--bm-font-semibold)',
    color: 'var(--bm-gray-800)',
    lineHeight: 'var(--bm-leading-tight)',
    margin: 0,
  };

  const closeBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: 'var(--bm-gray-400)',
    borderRadius: 'var(--bm-radius-sm)',
    padding: 0,
    transition: `color var(--bm-duration-fast) var(--bm-ease-out), background var(--bm-duration-fast) var(--bm-ease-out)`,
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-base)',
    color: 'var(--bm-gray-600)',
    lineHeight: 'var(--bm-leading-normal)',
    marginBottom: 'var(--bm-space-6)',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--bm-space-2)',
    justifyContent: 'flex-end',
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div ref={panelRef} className={className} style={panelStyle} role="dialog" aria-modal="true" aria-label={title}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button
            type="button"
            style={closeBtnStyle}
            onClick={onClose}
            aria-label="Close"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bm-gray-100)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Icon name={X} size={16} />
          </button>
        </div>
        <div style={bodyStyle}>{children}</div>
        <div style={footerStyle}>
          <Button variant="secondary" size="md" onClick={onClose}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} size="md" onClick={onConfirm}>
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
