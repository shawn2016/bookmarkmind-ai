// ============================================================
// App — Content Script Root Component
// ============================================================

import React, { useEffect, useMemo } from 'react';
import { useContentStore } from '@content/store/contentStore';
import { shouldShowBall } from '@shared/utils/url-match';
import { useBallHoverPointer } from '@content/hooks/useBallHover';
import { FloatingBall } from '@content/components/FloatingBall/FloatingBall';
import { MiniActionBar } from '@content/components/MiniActionBar/MiniActionBar';
import { BallClosePanel } from '@content/components/BallClosePanel/BallClosePanel';
import { FloatingPanel } from '@content/components/FloatingPanel/FloatingPanel';
import { ToastContainer } from '@content/components/Toast/ToastContainer';
import { ConfirmModal } from '@content/components/Modal/ConfirmModal';
import { BookmarkSaveModal } from '@content/components/BookmarkSaveModal/BookmarkSaveModal';

const App: React.FC = () => {
  const ballConfig = useContentStore((s) => s.ballConfig);
  const ballState = useContentStore((s) => s.ballState);
  const ballSessionHidden = useContentStore((s) => s.ballSessionHidden);
  const ballClosePanelVisible = useContentStore((s) => s.ballClosePanelVisible);
  const panelVisible = useContentStore((s) => s.panelVisible);
  const modalState = useContentStore((s) => s.modalState);

  const ballVisible = useMemo(() => {
    if (ballSessionHidden) return false;
    return shouldShowBall(ballConfig, window.location.href);
  }, [ballConfig, ballSessionHidden]);

  useBallHoverPointer();

  // Monitor fullscreen changes for auto-hide
  useEffect(() => {
    if (!ballConfig.autoHideFullscreen) return;

    const handler = () => {
      const isFullscreen = !!document.fullscreenElement;
      const store = useContentStore.getState();
      if (isFullscreen && store.panelVisible) {
        store.collapsePanel();
      }
    };

    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [ballConfig.autoHideFullscreen]);

  // Keyboard: ESC to close panel, close modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const store = useContentStore.getState();
        if (store.modalState.open) {
          store.hideModal();
          return;
        }
        if (store.panelVisible) {
          store.collapsePanel();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!ballVisible) return null;

  return (
    <>
      {/* Floating ball — always visible when enabled */}
      <FloatingBall />

      {/* Mini action bar — visible on hover */}
      {ballState === 'hover' && !ballClosePanelVisible && <MiniActionBar />}

      {/* Close / hide options panel */}
      {ballClosePanelVisible && <BallClosePanel />}

      {/* Floating panel — visible when expanded */}
      {panelVisible && <FloatingPanel />}

      {/* Toast notifications */}
      <ToastContainer />

      {/* Confirm modal */}
      {modalState.open && <ConfirmModal />}

      {/* Bookmark save confirmation */}
      <BookmarkSaveModal />
    </>
  );
};

export default App;
