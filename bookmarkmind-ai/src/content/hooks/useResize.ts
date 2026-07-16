// ============================================================
// useResize — right-bottom corner resize hook for panel
// ============================================================

import { useCallback, useRef, useState } from "react";
import { useContentStore } from "@content/store/contentStore";
import { safeStorageSet } from "@shared/utils/chrome-api";

const MIN_SIZE = { width: 320, height: 400 };
const MAX_SIZE = { width: 600, height: 800 };

/**
 * Resize hook that handles right-bottom corner resizing.
 * Clamps between 320x400 and 600x800.
 * Persists size to chrome.storage.local on end.
 */
export function useResize() {
  const [isResizing, setIsResizing] = useState(false);
  const startSize = useRef({ width: 0, height: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  const setPanelSize = useContentStore(s => s.setPanelSize);
  const panelSize = useContentStore(s => s.panelSize);

  const onResizeStart = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      startPos.current = { x: e.clientX, y: e.clientY };
      startSize.current = { ...panelSize };
      setIsResizing(true);

      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startPos.current.x;
        const dy = ev.clientY - startPos.current.y;

        const newWidth = Math.min(
          MAX_SIZE.width,
          Math.max(MIN_SIZE.width, startSize.current.width + dx),
        );
        const newHeight = Math.min(
          MAX_SIZE.height,
          Math.max(MIN_SIZE.height, startSize.current.height + dy),
        );

        setPanelSize({ width: newWidth, height: newHeight });
      };

      const onPointerUp = () => {
        target.removeEventListener("pointermove", onPointerMove);
        target.removeEventListener("pointerup", onPointerUp);
        target.releasePointerCapture(e.pointerId);
        setIsResizing(false);

        const finalSize = useContentStore.getState().panelSize;
        safeStorageSet({ bm_config_panel_size: finalSize });
      };

      target.addEventListener("pointermove", onPointerMove);
      target.addEventListener("pointerup", onPointerUp);
    },
    [panelSize, setPanelSize],
  );

  return { onResizeStart, isResizing };
}
