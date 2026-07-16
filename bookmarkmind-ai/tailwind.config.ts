import type { Config } from 'tailwindcss';

/**
 * Marginalia — 个人图书馆设计系统
 * 与 src/shared/styles/tokens.css 保持一致
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx,html}',
  ],
  // Shadow DOM 内使用 CSS 变量模式，不使用 @apply
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        'bm-ink': {
          900: '#0F0E0C',
        },
        'bm-leather': {
          800: '#1C1A17',
        },
        'bm-cloth': {
          700: '#2B2722',
        },
        'bm-amber': {
          50: '#FBF3E5',
          100: '#F2E2C2',
          200: '#E4C99A',
          300: '#D6B172',
          400: '#C8945A',
          500: '#B5824A',
          600: '#9A6E3B',
          700: '#7A582E',
          800: '#5C4220',
          900: '#3E2C16',
        },
        'bm-parchment': {
          400: '#A39A8B',
        },
        'bm-tobacco': {
          600: '#5A5147',
        },
        'bm-primary': {
          50: '#FBF3E5', 100: '#F2E2C2', 200: '#E4C99A', 300: '#D6B172',
          400: '#C8945A', 500: '#B5824A', 600: '#9A6E3B', 700: '#7A582E',
          800: '#5C4220', 900: '#3E2C16',
        },
        'bm-gray': {
          0: '#1C1A17', 50: '#232017', 100: '#2B2722', 200: '#3A352D',
          300: '#4A4338', 400: '#6B6356', 500: '#8B8275', 600: '#A39A8B',
          700: '#C8C0B2', 800: '#E0DACE', 900: '#F0EBE0',
        },
        'bm-success': { 50: '#1E2A14', 100: '#2F4A1F', 500: '#88C66E', 600: '#B0E094' },
        'bm-warning': { 50: '#2E2516', 100: '#4A3A1F', 500: '#E8B86D', 600: '#F5D08C' },
        'bm-error':   { 50: '#2E1A1A', 100: '#4A2828', 500: '#E08585', 600: '#F0A8A8' },
        'bm-info':    { 50: '#1A1F2E', 100: '#28324A', 500: '#8B97D6', 600: '#A8B3E0' },
      },
      fontFamily: {
        display: ['Iowan Old Style', 'Source Serif Pro', 'Charter', 'Georgia', 'Songti SC', 'STSong', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'Cascadia Code', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      fontSize: {
        'bm-xs': '11px', 'bm-sm': '12px', 'bm-base': '13px', 'bm-md': '14px',
        'bm-lg': '16px', 'bm-xl': '20px', 'bm-2xl': '26px', 'bm-3xl': '34px',
      },
      spacing: {
        'bm-1': '4px', 'bm-2': '8px', 'bm-3': '12px', 'bm-4': '16px',
        'bm-5': '20px', 'bm-6': '24px', 'bm-7': '28px', 'bm-8': '32px',
        'bm-10': '40px', 'bm-12': '48px', 'bm-16': '64px',
      },
      borderRadius: {
        'bm-xs': '4px', 'bm-sm': '6px', 'bm-md': '10px', 'bm-lg': '14px',
        'bm-xl': '20px', 'bm-full': '9999px',
      },
      boxShadow: {
        'bm-panel': '0 14px 44px rgba(0,0,0,0.45), 0 4px 14px rgba(0,0,0,0.30), 0 0 0 1px rgba(200,148,90,0.06)',
        'bm-card': '0 6px 20px rgba(0,0,0,0.30), 0 2px 6px rgba(0,0,0,0.20)',
        'bm-ball': '0 4px 16px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,148,90,0.08)',
        'bm-ball-hover': '0 8px 28px rgba(200,148,90,0.25), 0 0 0 1px rgba(200,148,90,0.20)',
        'bm-focus': '0 0 0 3px rgba(200,148,90,0.30)',
        'bm-stamp': '0 0 0 1px rgba(200,148,90,0.35), 0 1px 2px rgba(200,148,90,0.15)',
      },
      zIndex: {
        'bm-base': '1000', 'bm-actionbar': '1001', 'bm-panel': '1002',
        'bm-dropdown': '1003', 'bm-toast': '1004', 'bm-modal': '1005',
      },
      transitionDuration: {
        'bm-fast': '180ms', 'bm-normal': '280ms', 'bm-slow': '420ms', 'bm-slowest': '600ms',
      },
      transitionTimingFunction: {
        'bm-default': 'cubic-bezier(0.4,0,0.2,1)',
        'bm-out': 'cubic-bezier(0.0,0,0.2,1)',
        'bm-in': 'cubic-bezier(0.4,0,1,1)',
        'bm-spring': 'cubic-bezier(0.34,1.56,0.64,1)',
        'bm-drawer': 'cubic-bezier(0.22,1,0.36,1)',
      },
      letterSpacing: {
        'bm-tight': '-0.01em',
        'bm-normal': '0',
        'bm-wide': '0.04em',
        'bm-stamp': '0.18em',
      },
    },
  },
  plugins: [],
};

export default config;