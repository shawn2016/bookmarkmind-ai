// ============================================================
// BallClosePanel — close / hide / shrink options below floating ball
// ============================================================

import React, { useCallback } from "react";
import { X, EyeOff, Globe, Minimize2, Maximize2 } from "lucide-react";
import { useContentStore, syncConfigToStore } from "@content/store/contentStore";
import { BALL_BOTTOM_SAFE } from "@content/hooks/useDrag";
import { safeSendMessage } from "@shared/utils/chrome-api";
import { generateSitePattern } from "@shared/utils/url-match";
import { getEffectiveBallSize } from "@shared/utils/ball-size";

export const BallClosePanel: React.FC = () => {
  const ballConfig = useContentStore(s => s.ballConfig);
  const ballShrunk = useContentStore(s => s.ballShrunk);
  const ballLivePos = useContentStore(s => s.ballLivePos);
  const {
    setBallClosePanelVisible,
    setBallSessionHidden,
    setBallShrunk,
    setBallState,
  } = useContentStore.getState();

  const size = getEffectiveBallSize(ballConfig, ballShrunk);
  const side = ballConfig.side;
  const yPct = ballConfig.verticalPosition;
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;

  const defaultY = Math.max(
    8,
    Math.min((yPct / 100) * viewH, viewH - size - BALL_BOTTOM_SAFE),
  );
  const defaultX = side === "left" ? 8 : viewW - size - 8;

  const ballX = ballLivePos?.x ?? defaultX;
  const ballY = ballLivePos?.y ?? defaultY;
  const ballCenterX = ballX + size / 2;

  const panelWidth = 240;
  const panelLeft = Math.max(
    8,
    Math.min(ballCenterX - panelWidth / 2, viewW - panelWidth - 8),
  );
  const panelTop = ballY + size + 12;

  const handleClose = useCallback(() => {
    setBallClosePanelVisible(false);
    setBallState("collapsed");
  }, [setBallClosePanelVisible, setBallState]);

  const handleSessionHide = useCallback(() => {
    setBallSessionHidden(true);
    setBallClosePanelVisible(false);
    useContentStore.getState().pushToast({
      type: "info",
      message: "本次访问已隐藏悬浮球，刷新页面后恢复",
    });
  }, [setBallSessionHidden, setBallClosePanelVisible]);

  const handlePermanentHide = useCallback(async () => {
    try {
      const pattern = generateSitePattern(window.location.href);
      if (!pattern) {
        throw new Error('invalid url');
      }
      const hostname = new URL(window.location.href).hostname;
      const response = await safeSendMessage<{
        config?: { ball: { disabledSites: string[] } };
      }>({ type: "SETTINGS_GET_ALL" });

      if (response?.config) {
        const sites = [...(response.config.ball.disabledSites || [])];
        if (!sites.includes(pattern)) {
          sites.push(pattern);
        }
        await safeSendMessage({
          type: "SETTINGS_SET",
          payload: { key: "ball.disabledSites", value: sites },
        });
        syncConfigToStore({
          ...response.config,
          ball: { ...response.config.ball, disabledSites: sites },
        } as import('@shared/types').ExtensionConfig);
      }

      setBallSessionHidden(true);
      setBallClosePanelVisible(false);
      useContentStore.getState().pushToast({
        type: "success",
        message: `已在 ${hostname} 永久隐藏，可在设置→悬浮球中恢复`,
      });
    } catch {
      useContentStore.getState().pushToast({
        type: "error",
        message: "隐藏失败，请重试",
      });
    }
  }, [setBallSessionHidden, setBallClosePanelVisible]);

  const handleToggleShrink = useCallback(() => {
    setBallShrunk(!ballShrunk);
    useContentStore.getState().pushToast({
      type: "info",
      message: ballShrunk ? "已恢复悬浮球大小" : "已缩小悬浮球",
    });
  }, [ballShrunk, setBallShrunk]);

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: `${panelLeft}px`,
    top: `${panelTop}px`,
    width: `${panelWidth}px`,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    backdropFilter: "blur(16px) saturate(150%)",
    WebkitBackdropFilter: "blur(16px) saturate(150%)",
    border: "1px solid var(--bm-gray-200)",
    borderRadius: "var(--bm-radius-lg)",
    boxShadow: "var(--bm-shadow-panel)",
    zIndex: "var(--bm-z-actionbar)",
    pointerEvents: "auto",
    animation: "bm-panel-enter var(--bm-duration-normal) var(--bm-ease-out)",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 14px",
    borderBottom: "1px solid var(--bm-gray-100)",
  };

  const optionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 14px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "var(--bm-text-sm)",
    color: "var(--bm-gray-700)",
    textAlign: "left",
    transition: "background var(--bm-duration-fast)",
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <span
          style={{
            fontSize: "var(--bm-text-md)",
            fontWeight: 600,
            color: "var(--bm-gray-800)",
          }}
        >
          悬浮球选项
        </span>
        <button
          onClick={handleClose}
          style={{
            width: "24px",
            height: "24px",
            border: "none",
            background: "var(--bm-gray-100)",
            borderRadius: "var(--bm-radius-sm)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--bm-gray-500)",
          }}
          aria-label="关闭"
        >
          <X size={14} />
        </button>
      </div>

      <button
        style={optionStyle}
        onClick={handleToggleShrink}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--bm-gray-50)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {ballShrunk ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        <div>
          <div style={{ fontWeight: 500 }}>
            {ballShrunk ? "恢复悬浮球大小" : "缩小悬浮球"}
          </div>
          <div style={{ fontSize: "var(--bm-text-xs)", color: "var(--bm-gray-400)" }}>
            减小占用空间，仍可点击操作
          </div>
        </div>
      </button>

      <button
        style={optionStyle}
        onClick={handleSessionHide}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--bm-primary-50)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <EyeOff size={16} color="var(--bm-primary-500)" />
        <div>
          <div style={{ fontWeight: 500 }}>本次隐藏</div>
          <div style={{ fontSize: "var(--bm-text-xs)", color: "var(--bm-gray-400)" }}>
            仅当前页面，刷新后恢复显示
          </div>
        </div>
      </button>

      <button
        style={{
          ...optionStyle,
          borderTop: "1px solid var(--bm-gray-100)",
        }}
        onClick={handlePermanentHide}
        onMouseEnter={e => {
          e.currentTarget.style.background = "var(--bm-error-50)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Globe size={16} color="var(--bm-error-500)" />
        <div>
          <div style={{ fontWeight: 500, color: "var(--bm-error-600)" }}>
            在此网站永久隐藏
          </div>
          <div style={{ fontSize: "var(--bm-text-xs)", color: "var(--bm-gray-400)" }}>
            加入禁用列表，可在设置中恢复
          </div>
        </div>
      </button>
    </div>
  );
};

export default BallClosePanel;
