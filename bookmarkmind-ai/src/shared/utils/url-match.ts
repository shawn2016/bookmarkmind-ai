/**
 * URL 通配符匹配 — 支持 Chrome URL 匹配模式
 * 支持格式: *://*.example.com/*  https://example.com/path  etc.
 */
export function matchUrlPattern(pattern: string, url: string): boolean {
  // 将通配符模式转为正则
  const regexStr = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')  // 转义特殊字符
    .replace(/\*/g, '.*')                      // * → .*
    .replace(/\\\./g, '\\.');                  // . 保持转义

  const regex = new RegExp(`^${regexStr}$`, 'i');
  return regex.test(url);
}

/** 检查 URL 是否匹配任一规则 */
export function matchAnyPattern(patterns: string[], url: string): boolean {
  return patterns.some((p) => matchUrlPattern(p, url));
}

/** 获取当前页面的域名 */
export function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname;
  } catch {
    return '';
  }
}

/** 生成当前网站的通配符规则 */
export function generateSitePattern(url: string): string {
  try {
    const u = new URL(url);
    return `*://${u.hostname}/*`;
  } catch {
    return '';
  }
}

/** 检查是否为 Chrome 内置页面 */
export function isChromeInternalPage(url: string): boolean {
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('chrome-web-store://') ||
    url.startsWith('about:') ||
    url.startsWith('edge://') ||
    url.startsWith('brave://')
  );
}

/** 检查是否为 PDF 页面 */
export function isPdfPage(): boolean {
  return document.contentType === 'application/pdf';
}

/** 检查是否为全屏模式 */
export function isFullscreen(): boolean {
  return !!document.fullscreenElement;
}

/** 检查是否在 iframe 中 */
export function isInIframe(): boolean {
  return window !== window.top;
}

/** 检查是否为编辑器类网站 */
export function isEditorSite(url: string): boolean {
  const editorPatterns = [
    '*://figma.com/*',
    '*://*.figma.com/*',
    '*://codepen.io/*',
    '*://jsfiddle.net/*',
    '*://codesandbox.io/*',
    '*://stackblitz.com/*',
  ];
  return matchAnyPattern(editorPatterns, url);
}
