import type { AppSettings, ThemeMode } from '@shared/types';

const FONT_SCALE: Record<AppSettings['fontSize'], number> = {
  small: 0.9,
  medium: 1,
  large: 1.12,
};

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
}

/** Apply theme, font size to a root element (documentElement or shadow host). */
export function applyAppSettings(
  settings: AppSettings,
  root: HTMLElement = document.documentElement,
): void {
  const theme = resolveTheme(settings.theme);
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-lang', settings.language);
  root.style.setProperty(
    '--bm-text-scale',
    String(FONT_SCALE[settings.fontSize]),
  );

  const scale = FONT_SCALE[settings.fontSize];
  root.style.setProperty('--bm-text-xs', `${Math.round(11 * scale)}px`);
  root.style.setProperty('--bm-text-sm', `${Math.round(12 * scale)}px`);
  root.style.setProperty('--bm-text-base', `${Math.round(13 * scale)}px`);
  root.style.setProperty('--bm-text-md', `${Math.round(14 * scale)}px`);
  root.style.setProperty('--bm-text-lg', `${Math.round(15 * scale)}px`);
  root.style.setProperty('--bm-text-xl', `${Math.round(18 * scale)}px`);
  root.style.setProperty('--bm-text-2xl', `${Math.round(22 * scale)}px`);
}

let systemThemeListener: (() => void) | null = null;

/** Watch system theme changes when mode is "system". */
export function watchSystemTheme(
  settings: AppSettings,
  root: HTMLElement = document.documentElement,
): void {
  if (systemThemeListener) {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener(
      'change',
      systemThemeListener,
    );
    systemThemeListener = null;
  }

  if (settings.theme !== 'system') return;

  systemThemeListener = () => applyAppSettings(settings, root);
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', systemThemeListener);
}
