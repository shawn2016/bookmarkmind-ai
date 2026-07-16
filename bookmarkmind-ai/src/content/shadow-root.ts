// ============================================================
// Shadow DOM container factory
// ============================================================

const HOST_ID = "bookmarkmind-ai-host";

/**
 * Creates the Shadow DOM host element, attaches an open shadow root,
 * injects CSS tokens + component styles, and returns a mount point.
 */
export function createShadowContainer(): {
  shadow: ShadowRoot;
  mountPoint: HTMLDivElement;
} {
  // Remove any existing host (shouldn't happen but guard)
  const existing = document.getElementById(HOST_ID);
  if (existing) {
    existing.remove();
  }

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.top = "0";
  host.style.left = "0";
  host.style.zIndex = "var(--bm-z-base, 1000)";
  host.style.pointerEvents = "none";
  host.style.width = "100vw";
  host.style.height = "100vh";

  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Inject CSS: tokens first, then component styles
  const style = document.createElement("style");
  style.textContent = getShadowCSS();
  shadow.appendChild(style);

  // Create mount point
  const mountPoint = document.createElement("div");
  mountPoint.id = "bookmarkmind-mount";
  mountPoint.style.position = "fixed";
  mountPoint.style.top = "0";
  mountPoint.style.left = "0";
  mountPoint.style.width = "100vw";
  mountPoint.style.height = "100vh";
  mountPoint.style.pointerEvents = "none";
  shadow.appendChild(mountPoint);

  return { shadow, mountPoint };
}

/**
 * Returns the complete CSS for the shadow root.
 * Combines design tokens and component keyframe styles.
 */
function getShadowCSS(): string {
  return /* css */ `
    /* ---- Design Tokens — Marginalia 个人图书馆 ---- */
    :host {
      /* 主色（衍生自灯琥珀 #C8945A） */
      --bm-primary-50:  #FBF3E5;
      --bm-primary-100: #F2E2C2;
      --bm-primary-200: #E4C99A;
      --bm-primary-300: #D6B172;
      --bm-primary-400: #C8945A;
      --bm-primary-500: #B5824A;
      --bm-primary-600: #9A6E3B;
      --bm-primary-700: #7A582E;
      --bm-primary-800: #5C4220;
      --bm-primary-900: #3E2C16;

      /* 中性（暗色默认） */
      --bm-gray-0:   #1C1A17;
      --bm-gray-50:  #232017;
      --bm-gray-100: #2B2722;
      --bm-gray-200: #3A352D;
      --bm-gray-300: #4A4338;
      --bm-gray-400: #6B6356;
      --bm-gray-500: #8B8275;
      --bm-gray-600: #A39A8B;
      --bm-gray-700: #C8C0B2;
      --bm-gray-800: #E0DACE;
      --bm-gray-900: #F0EBE0;

      /* 语义 */
      --bm-success-50:  #1E2A14;
      --bm-success-100: #2F4A1F;
      --bm-success-500: #88C66E;
      --bm-success-600: #B0E094;

      --bm-warning-50:  #2E2516;
      --bm-warning-100: #4A3A1F;
      --bm-warning-500: #E8B86D;
      --bm-warning-600: #F5D08C;

      --bm-error-50:  #2E1A1A;
      --bm-error-100: #4A2828;
      --bm-error-500: #E08585;
      --bm-error-600: #F0A8A8;

      --bm-info-50:  #1A1F2E;
      --bm-info-100: #28324A;
      --bm-info-500: #8B97D6;
      --bm-info-600: #A8B3E0;

      /* 字体 */
      --bm-font-display: 'Iowan Old Style', 'Source Serif Pro', 'Charter', 'Georgia', 'Songti SC', 'STSong', serif;
      --bm-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
      --bm-font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, 'Cascadia Code', Consolas, 'Liberation Mono', monospace;

      /* 类型尺度 */
      --bm-text-xs:   11px;
      --bm-text-sm:   12px;
      --bm-text-base: 13px;
      --bm-text-md:   14px;
      --bm-text-lg:   16px;
      --bm-text-xl:   20px;
      --bm-text-2xl:  26px;
      --bm-text-3xl:  34px;

      --bm-font-normal:   400;
      --bm-font-medium:   500;
      --bm-font-semibold: 600;
      --bm-font-bold:     700;

      --bm-leading-tight:   1.25;
      --bm-leading-snug:    1.35;
      --bm-leading-normal:  1.5;
      --bm-leading-relaxed: 1.65;

      --bm-tracking-tight:  -0.01em;
      --bm-tracking-normal: 0;
      --bm-tracking-wide:   0.04em;
      --bm-tracking-stamp:  0.18em;

      /* 间距 */
      --bm-space-1:   4px;
      --bm-space-2:   8px;
      --bm-space-3:   12px;
      --bm-space-4:   16px;
      --bm-space-5:   20px;
      --bm-space-6:   24px;
      --bm-space-7:   28px;
      --bm-space-8:   32px;
      --bm-space-10: 40px;
      --bm-space-12: 48px;
      --bm-space-16: 64px;

      /* 圆角 */
      --bm-radius-xs:   4px;
      --bm-radius-sm:   6px;
      --bm-radius-md:   10px;
      --bm-radius-lg:   14px;
      --bm-radius-xl:   20px;
      --bm-radius-full: 9999px;

      /* 阴影 — 暖色台灯侧光 */
      --bm-shadow-panel: 0 14px 44px rgba(0,0,0,0.45), 0 4px 14px rgba(0,0,0,0.30), 0 0 0 1px rgba(200,148,90,0.06);
      --bm-shadow-card: 0 6px 20px rgba(0,0,0,0.30), 0 2px 6px rgba(0,0,0,0.20);
      --bm-shadow-ball: 0 4px 16px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,148,90,0.08);
      --bm-shadow-ball-hover: 0 8px 28px rgba(200,148,90,0.25), 0 0 0 1px rgba(200,148,90,0.20);
      --bm-shadow-focus: 0 0 0 3px rgba(200,148,90,0.30);
      --bm-shadow-stamp: 0 0 0 1px rgba(200,148,90,0.35), 0 1px 2px rgba(200,148,90,0.15);

      /* Z-index */
      --bm-z-base:        1000;
      --bm-z-actionbar:   1001;
      --bm-z-panel:       1002;
      --bm-z-dropdown:    1003;
      --bm-z-toast:       1004;
      --bm-z-modal:       1005;

      /* 动效 — 比之前稍慢，翻书感 */
      --bm-duration-fast:    180ms;
      --bm-duration-normal:  280ms;
      --bm-duration-slow:    420ms;
      --bm-duration-slowest: 600ms;

      --bm-ease-default: cubic-bezier(0.4, 0, 0.2, 1);
      --bm-ease-out:     cubic-bezier(0.0, 0, 0.2, 1);
      --bm-ease-in:      cubic-bezier(0.4, 0, 1, 1);
      --bm-ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);
      --bm-ease-drawer:  cubic-bezier(0.22, 1, 0.36, 1);

      /* ---- Semantic aliases (设计师思考层) ---- */
      --bm-bg-canvas:    var(--bm-ink-900);
      --bm-bg-surface:   var(--bm-leather-800);
      --bm-bg-elevated:  var(--bm-cloth-700);
      --bm-bg-input:     var(--bm-leather-800);
      --bm-bg-overlay:   var(--bm-cloth-700);
      --bm-border-subtle:  var(--bm-tobacco-600);
      --bm-border-strong:  var(--bm-gray-300);
      --bm-border-accent:  var(--bm-primary-400);
      --bm-text-primary:    var(--bm-gray-700);
      --bm-text-secondary:  var(--bm-gray-500);
      --bm-text-muted:      var(--bm-gray-400);
      --bm-text-heading:    var(--bm-gray-800);
      --bm-text-on-accent:  var(--bm-ink-900);
      --bm-text-accent:     var(--bm-primary-400);
      --bm-state-success:   var(--bm-success-500);
      --bm-state-warning:   var(--bm-warning-500);
      --bm-state-error:     var(--bm-error-500);
      --bm-state-info:      var(--bm-info-500);

      --bm-accent-04: rgba(200, 148, 90, 0.04);
      --bm-accent-06: rgba(200, 148, 90, 0.06);
      --bm-accent-10: rgba(200, 148, 90, 0.10);
      --bm-accent-18: rgba(200, 148, 90, 0.18);
      --bm-accent-20: rgba(200, 148, 90, 0.20);
      --bm-accent-25: rgba(200, 148, 90, 0.25);
      --bm-accent-30: rgba(200, 148, 90, 0.30);
      --bm-accent-40: rgba(200, 148, 90, 0.40);
      --bm-accent-55: rgba(200, 148, 90, 0.55);
    }

    /* ---- Global Reset ---- */
    :host *,
    :host *::before,
    :host *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      font-family: var(--bm-font-sans);
      font-size: var(--bm-text-base);
      font-weight: var(--bm-font-normal);
      line-height: var(--bm-leading-normal);
      color: var(--bm-gray-700);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* ---- Custom Scrollbar — 暖色 ---- */
    .bm-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .bm-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }

    .bm-scrollbar::-webkit-scrollbar-thumb {
      background: var(--bm-gray-300);
      border-radius: 3px;
    }

    .bm-scrollbar::-webkit-scrollbar-thumb:hover {
      background: var(--bm-amber-500, var(--bm-primary-500));
    }

    /* ---- Text Truncation ---- */
    .bm-truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .bm-line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* ---- 浅色变体 — Vlog Prompt 风格 ---- */
    :host([data-theme="light"]) {
      --bm-ink-900: #FAFAF9;
      --bm-leather-800: #FFFFFF;
      --bm-cloth-700: #F5F5F4;
      --bm-amber-500: #EA580C;
      --bm-tobacco-600: #E7E5E4;

      --bm-gray-0:   #FFFFFF;
      --bm-gray-50:  #FAFAF9;
      --bm-gray-100: #F5F5F4;
      --bm-gray-200: #E7E5E4;
      --bm-gray-300: #D6D3D1;
      --bm-gray-400: #A8A29E;
      --bm-gray-500: #78716C;
      --bm-gray-600: #57534E;
      --bm-gray-700: #44403C;
      --bm-gray-800: #1C1917;
      --bm-gray-900: #0C0C0C;

      --bm-primary-50:  #FFF7ED;
      --bm-primary-100: #FFEDD5;
      --bm-primary-200: #FED7AA;
      --bm-primary-300: #FDBA74;
      --bm-primary-400: #FB923C;
      --bm-primary-500: #EA580C;
      --bm-primary-600: #C2410C;
      --bm-primary-700: #9A3412;
      --bm-primary-800: #7C2D12;
      --bm-primary-900: #431407;

      --bm-font-display: 'Songti SC', 'STSong', 'Noto Serif SC', 'Source Han Serif SC',
        'Georgia', serif;
      --bm-font-sans: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC',
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;

      --bm-radius-md: 12px;
      --bm-radius-lg: 16px;
      --bm-radius-xl: 24px;

      --bm-accent-04: rgba(234, 88, 12, 0.04);
      --bm-accent-06: rgba(234, 88, 12, 0.06);
      --bm-accent-10: rgba(234, 88, 12, 0.10);
      --bm-accent-18: rgba(234, 88, 12, 0.18);
      --bm-accent-20: rgba(234, 88, 12, 0.20);
      --bm-accent-25: rgba(234, 88, 12, 0.25);
      --bm-accent-30: rgba(234, 88, 12, 0.30);
      --bm-accent-40: rgba(234, 88, 12, 0.40);
      --bm-accent-55: rgba(234, 88, 12, 0.55);

      --bm-success-50:  #EAF3DE;
      --bm-success-100: #C0DD97;
      --bm-success-500: #3B6D11;
      --bm-success-600: #27500A;
      --bm-warning-50:  #FAEEDA;
      --bm-warning-100: #FAC775;
      --bm-warning-500: #BA7517;
      --bm-warning-600: #854F0B;
      --bm-error-50:  #FCEBEB;
      --bm-error-100: #F7C1C1;
      --bm-error-500: #E24B4A;
      --bm-error-600: #A32D2D;
      --bm-info-50:  #EEEDFE;
      --bm-info-100: #CECBF6;
      --bm-info-500: #534AB7;
      --bm-info-600: #3C3489;

      --bm-shadow-panel: 0 20px 60px rgba(12, 12, 12, 0.06), 0 4px 16px rgba(12, 12, 12, 0.04);
      --bm-shadow-card: 0 4px 20px rgba(12, 12, 12, 0.05), 0 1px 4px rgba(12, 12, 12, 0.03);
      --bm-shadow-ball: 0 4px 16px rgba(12, 12, 12, 0.08), 0 0 0 1px rgba(12, 12, 12, 0.04);
      --bm-shadow-ball-hover: 0 8px 28px rgba(234, 88, 12, 0.22), 0 0 0 1px rgba(234, 88, 12, 0.18);
      --bm-shadow-focus: 0 0 0 3px rgba(234, 88, 12, 0.25);
      --bm-shadow-stamp: 0 0 0 1px rgba(234, 88, 12, 0.20), 0 1px 2px rgba(234, 88, 12, 0.12);

      --bm-text-on-accent: #FFFFFF;
      --bm-bg-canvas: var(--bm-ink-900);
      --bm-bg-surface: var(--bm-leather-800);
      --bm-bg-elevated: #FBF7F2;
      --bm-bg-input: #FFFFFF;
      --bm-bg-overlay: var(--bm-cloth-700);
      --bm-border-subtle: rgba(12, 12, 12, 0.08);
      --bm-border-strong: var(--bm-gray-200);
      --bm-border-accent: var(--bm-amber-500);
      --bm-text-primary: var(--bm-gray-800);
      --bm-text-secondary: var(--bm-gray-600);
      --bm-text-muted: var(--bm-gray-400);
      --bm-text-heading: var(--bm-gray-900);
      --bm-text-accent: var(--bm-amber-500);
    }

    /* ---- Keyframe Animations ---- */

    @keyframes bm-blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    @keyframes bm-bounce-dot {
      0% { transform: scale(0.8); opacity: 0.5; }
      50% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(0.8); opacity: 0.5; }
    }

    @keyframes bm-slide-in-right {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes bm-slide-out-right {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(20px); opacity: 0; }
    }

    @keyframes bm-slide-up {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes bm-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Panel 抽屉式入场 — 替代旧的 scale */
    @keyframes bm-panel-enter {
      from {
        opacity: 0;
        transform: translateY(-12px) scale(0.96);
        filter: blur(2px);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
        filter: blur(0);
      }
    }

    @keyframes bm-actionbar-enter {
      from { opacity: 0; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* 馆藏编号入场 — 烫金盖章感 */
    @keyframes bm-stamp-in {
      0% {
        opacity: 0;
        transform: scale(1.4) rotate(-3deg);
        letter-spacing: 0.4em;
      }
      60% {
        opacity: 1;
        transform: scale(0.95) rotate(-0.5deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(0deg);
        letter-spacing: var(--bm-tracking-stamp, 0.18em);
      }
    }

    /* 行 hover lift — 像把卡片稍微抬起来看 */
    @keyframes bm-row-lift {
      from { transform: translateY(0); }
      to { transform: translateY(-1px); }
    }

    /* ---- Catalog Stamp 样式类（签名元素） ---- */
    .bm-stamp {
      font-family: var(--bm-font-mono);
      font-size: 9px;
      font-weight: var(--bm-font-medium);
      letter-spacing: var(--bm-tracking-stamp);
      text-transform: uppercase;
      color: var(--bm-primary-400);
      padding: 2px 6px;
      border: 1px solid rgba(200, 148, 90, 0.35);
      border-radius: var(--bm-radius-xs);
      box-shadow: var(--bm-shadow-stamp);
      background: rgba(200, 148, 90, 0.04);
      animation: bm-stamp-in 320ms var(--bm-ease-drawer) both;
      animation-delay: var(--bm-stamp-delay, 0ms);
      display: inline-flex;
      align-items: center;
      line-height: 1;
      white-space: nowrap;
    }

    .bm-stamp--fade {
      animation: bm-stamp-in 320ms var(--bm-ease-drawer) both,
                 bm-stamp-pulse 1.8s var(--bm-ease-default) infinite 320ms;
    }

    @keyframes bm-stamp-pulse {
      0%, 100% { box-shadow: var(--bm-shadow-stamp); }
      50%      { box-shadow: 0 0 0 1px rgba(200,148,90,0.55), 0 0 6px rgba(200,148,90,0.25); }
    }

    /* Reduced motion respect — 用户偏好减少动效时全部退化为瞬时 */
    @media (prefers-reduced-motion: reduce) {
      .bm-stamp,
      .bm-stamp--fade {
        animation: none;
      }
    }

    /* ---- Utility: visually hidden (screen reader only) ---- */
    .bm-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;
}
