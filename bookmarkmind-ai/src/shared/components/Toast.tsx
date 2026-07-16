import React from 'react';
import { X } from 'lucide-react';
import Icon from './Icon';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  /** Duration in ms before auto-dismiss. Default 3000. */
  duration?: number;
  /** Optional action button rendered at the bottom */
  action?: React.ReactNode;
}

interface ToastInternal extends ToastItem {
  timer: ReturnType<typeof setTimeout>;
  entering: boolean;
}

/* ------------------------------------------------------------------ */
/*  Context + Hook                                                     */
/* ------------------------------------------------------------------ */

interface ToastContextValue {
  show: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

/** Generate a unique toast id */
function nextId(): string {
  toastIdCounter += 1;
  return `bm-toast-${toastIdCounter}-${Date.now()}`;
}

/**
 * Hook to access the toast system from any child of <ToastContainer />.
 * Returns { show, dismiss }.
 */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastContainer>');
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Standalone imperative helper                                       */
/* ------------------------------------------------------------------ */

/**
 * Imperative toast function. Requires a <ToastContainer /> mounted
 * somewhere in the tree. Safe to call from outside React components
 * as long as `setContainer` was called during mount.
 */
let containerActions: ToastContextValue | null = null;

export const toast = {
  show: (t: Omit<ToastItem, 'id'>) => {
    if (containerActions) {
      containerActions.show(t);
    } else {
      console.warn('[Toast] No <ToastContainer /> mounted. Call toast.show after mount.');
    }
  },
  dismiss: (id: string) => {
    containerActions?.dismiss(id);
  },
};

/* ------------------------------------------------------------------ */
/*  Icon Helpers                                                       */
/* ------------------------------------------------------------------ */

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bm-success-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bm-error-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bm-warning-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bm-primary-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  ToastItem Component                                                */
/* ------------------------------------------------------------------ */

interface ToastEntryProps {
  toast: ToastInternal;
  onDismiss: (id: string) => void;
}

const ToastEntry: React.FC<ToastEntryProps> = ({ toast: t, onDismiss }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [entered, setEntered] = React.useState(false);

  // Trigger enter animation on mount
  React.useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--bm-space-3)',
    padding: '12px 16px',
    maxWidth: '320px',
    backgroundColor: 'var(--bm-gray-0)',
    borderRadius: 'var(--bm-radius-md)',
    boxShadow: 'var(--bm-shadow-card)',
    borderLeft: `4px solid var(--bm-${t.type}-500)`,
    transform: entered ? 'translateX(0)' : 'translateX(100%)',
    opacity: entered ? 1 : 0,
    transition: `transform var(--bm-duration-normal) var(--bm-ease-spring), opacity var(--bm-duration-fast) var(--bm-ease-out)`,
    pointerEvents: 'auto',
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-md)',
    fontWeight: 'var(--bm-font-semibold)',
    color: 'var(--bm-gray-800)',
    lineHeight: 'var(--bm-leading-tight)',
    margin: 0,
  };

  const messageStyle: React.CSSProperties = {
    fontFamily: 'var(--bm-font-sans)',
    fontSize: 'var(--bm-text-sm)',
    color: 'var(--bm-gray-500)',
    lineHeight: 'var(--bm-leading-normal)',
    marginTop: t.message ? 'var(--bm-space-1)' : 0,
  };

  const closeBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '20px',
    height: '20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--bm-gray-400)',
    padding: 0,
    borderRadius: 'var(--bm-radius-sm)',
    transition: `color var(--bm-duration-fast) var(--bm-ease-out)`,
  };

  return (
    <div ref={ref} style={containerStyle} role="alert">
      <div style={{ display: 'flex', alignItems: 'center', paddingTop: '2px' }}>
        {typeIcons[t.type]}
      </div>
      <div style={contentStyle}>
        <p style={titleStyle}>{t.title}</p>
        {t.message && <p style={messageStyle}>{t.message}</p>}
        {t.action && <div style={{ marginTop: 'var(--bm-space-2)' }}>{t.action}</div>}
      </div>
      <button
        type="button"
        style={closeBtnStyle}
        onClick={() => onDismiss(t.id)}
        aria-label="Dismiss"
      >
        <Icon name={X} size={14} />
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  ToastContainer                                                     */
/* ------------------------------------------------------------------ */

export interface ToastContainerProps {
  /** Max number of visible toasts (default 5) */
  maxToasts?: number;
}

/**
 * ToastContainer — Renders a toast stack fixed to the top-right of the viewport.
 *
 * Slides in from right with spring easing. Auto-dismisses after `duration` ms
 * (default 3000). Stacks vertically with 8px gap.
 *
 * Usage:
 * ```tsx
 * <ToastContainer />
 * // Then anywhere in the tree:
 * const { show } = useToast();
 * show({ type: 'success', title: 'Saved!' });
 * ```
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ maxToasts = 5 }) => {
  const [toasts, setToasts] = React.useState<ToastInternal[]>([]);

  const show = React.useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = nextId();
      const duration = item.duration ?? 3000;

      const internal: ToastInternal = {
        ...item,
        id,
        duration,
        entering: false,
        timer: setTimeout(() => {
          dismiss(id);
        }, duration),
      };

      setToasts((prev) => {
        const next = [...prev, internal];
        // Enforce max
        if (next.length > maxToasts) {
          const overflow = next.splice(0, next.length - maxToasts);
          overflow.forEach((t) => clearTimeout(t.timer));
        }
        return next;
      });
    },
    [maxToasts],
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      clearTimeout(prev[idx].timer);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  // Expose actions imperatively
  React.useEffect(() => {
    containerActions = { show, dismiss };
    return () => {
      containerActions = null;
    };
  }, [show, dismiss]);

  const contextValue = React.useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  const stackStyle: React.CSSProperties = {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 'var(--bm-z-toast)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'none',
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {toasts.length > 0 && (
        <div style={stackStyle}>
          {toasts.map((t) => (
            <ToastEntry key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastContainer;
