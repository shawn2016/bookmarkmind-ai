// ============================================================
// MiniActionBar — vertical hover actions (close + settings)
// Translation-plugin style: labels on left, buttons below ball
// ============================================================

import React, { useCallback, useState } from "react";
import { X, Settings, Maximize2 } from "lucide-react";
import { useContentStore } from "@content/store/contentStore";
import { BALL_BOTTOM_SAFE } from "@content/hooks/useDrag";
import { safeOpenOptionsPage } from "@shared/utils/chrome-api";
import { getEffectiveBallSize } from "@shared/utils/ball-size";

const BTN_SIZE = 32;
const GAP = 4;

interface ActionBtnProps {
  icon: React.ReactNode;
  label: string;
  btnLeft: number;
  btnTop: number;
  viewW: number;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
  testId: string;
  highlight?: boolean;
}

const ActionBtn: React.FC<ActionBtnProps> = ({
  icon,
  label,
  btnLeft,
  btnTop,
  viewW,
  hovered,
  onHover,
  onLeave,
  onClick,
  testId,
  highlight,
}) => (
  <>
    <div
      style={{
        position: "fixed",
        right: `${viewW - btnLeft + 10}px`,
        top: `${btnTop + BTN_SIZE / 2}px`,
        transform: "translateY(-50%)",
        height: "26px",
        padding: "0 10px",
        backgroundColor: "rgba(0, 0, 0, 0.88)",
        color: "#fff",
        borderRadius: "var(--bm-radius-md)",
        fontSize: "var(--bm-text-sm)",
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        zIndex: "var(--bm-z-actionbar)",
        pointerEvents: "none",
        opacity: hovered ? 1 : 0,
        transition: "opacity var(--bm-duration-fast)",
      }}
    >
      {label}
    </div>
    <button
      style={{
        position: "fixed",
        left: `${btnLeft}px`,
        top: `${btnTop}px`,
        width: `${BTN_SIZE}px`,
        height: `${BTN_SIZE}px`,
        border: `1px solid ${highlight ? "var(--bm-primary-200)" : "var(--bm-gray-200)"}`,
        background: "rgba(255, 255, 255, 0.98)",
        borderRadius: "var(--bm-radius-full)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: highlight ? "var(--bm-primary-500)" : "var(--bm-gray-600)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        zIndex: "var(--bm-z-actionbar)",
        pointerEvents: "auto",
        transition:
          "background var(--bm-duration-fast), transform var(--bm-duration-fast) var(--bm-ease-spring)",
      }}
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      aria-label={label}
      title={label}
      data-testid={testId}
    >
      {icon}
    </button>
  </>
);

export const MiniActionBar: React.FC = () => {
  const ballConfig = useContentStore(s => s.ballConfig);
  const ballShrunk = useContentStore(s => s.ballShrunk);
  const ballLivePos = useContentStore(s => s.ballLivePos);
  const ballDragging = useContentStore(s => s.ballDragging);
  const ballState = useContentStore(s => s.ballState);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const BALL_SIZE = getEffectiveBallSize(ballConfig, ballShrunk);
  const side = ballConfig.side;
  const yPct = ballConfig.verticalPosition;
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;

  const defaultY = Math.max(
    8,
    Math.min((yPct / 100) * viewH, viewH - BALL_SIZE - BALL_BOTTOM_SAFE),
  );
  const defaultX = side === "left" ? 8 : viewW - BALL_SIZE - 8;

  const ballX = ballLivePos?.x ?? defaultX;
  const ballY = ballLivePos?.y ?? defaultY;
  const ballCenterX = ballX + BALL_SIZE / 2;

  const handleCloseClick = useCallback(() => {
    useContentStore.getState().setBallClosePanelVisible(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    safeOpenOptionsPage();
  }, []);

  const handleExpandClick = useCallback(() => {
    useContentStore.getState().expandPanel();
  }, []);

  if (ballDragging || ballConfig.actionBarMode === "hidden") return null;
  if (ballConfig.actionBarMode === "hover" && ballState !== "hover") return null;

  const colTop = ballY + BALL_SIZE + 2;
  const colLeft = ballCenterX - BTN_SIZE / 2;
  const expandTop = colTop;
  const closeTop = colTop + BTN_SIZE + GAP;
  const settingsTop = closeTop + BTN_SIZE + GAP;

  return (
    <div data-testid="mini-action-bar">
      <ActionBtn
        icon={<Maximize2 size={15} />}
        label="展开面板"
        btnLeft={colLeft}
        btnTop={expandTop}
        viewW={viewW}
        hovered={hoveredKey === "expand"}
        onHover={() => setHoveredKey("expand")}
        onLeave={() => setHoveredKey(null)}
        onClick={handleExpandClick}
        testId="action-btn-expand"
        highlight
      />
      <ActionBtn
        icon={<X size={15} />}
        label="关闭"
        btnLeft={colLeft}
        btnTop={closeTop}
        viewW={viewW}
        hovered={hoveredKey === "close"}
        onHover={() => setHoveredKey("close")}
        onLeave={() => setHoveredKey(null)}
        onClick={handleCloseClick}
        testId="action-btn-hide"
      />
      <ActionBtn
        icon={<Settings size={15} />}
        label="设置"
        btnLeft={colLeft}
        btnTop={settingsTop}
        viewW={viewW}
        hovered={hoveredKey === "settings"}
        onHover={() => setHoveredKey("settings")}
        onLeave={() => setHoveredKey(null)}
        onClick={handleSettingsClick}
        testId="action-btn-settings"
        highlight
      />
    </div>
  );
};

export default MiniActionBar;
