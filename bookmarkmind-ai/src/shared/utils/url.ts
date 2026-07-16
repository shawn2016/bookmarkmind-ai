// ============================================================
// AI 书签管家 v2 — URL 工具函数
// ============================================================

/** Tracking 参数列表（常见 UTM 和追踪参数） */
const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'utm_id', 'utm_reader', 'ref', 'referrer', 'source', 'fbclid',
  'gclid', 'gclsrc', 'dclid', 'msclkid', 'twclid', 'igshid',
  'mc_cid', 'mc_eid', 'mkt_tok', 'wickedid', 'yclid',
  '_ga', '_gl', '_openstat', 'spm', 'scm',
  'tracking', 'trk', 'campaign_id', 'ad_id', 'affiliate_id',
]);

/**
 * URL 归一化：去除 tracking 参数、去除尾部斜杠、标准化协议
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // 清理 tracking 参数
    const cleanParams = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      if (!TRACKING_PARAMS.has(key.toLowerCase())) {
        cleanParams.append(key, value);
      }
    });

    // 重建 URL
    const clean = new URL(parsed.origin + parsed.pathname);
    const sorted = Array.from(cleanParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    if (sorted) {
      clean.search = sorted;
    }

    // 去除尾部斜杠（保留根路径 /）
    let pathname = clean.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    clean.pathname = pathname;

    // 标准化协议为小写
    return clean.toString().toLowerCase();
  } catch {
    return url;
  }
}

/**
 * 提取域名（不含 www 前缀）
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * 构建 favicon URL
 */
export function buildFaviconUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`;
  } catch {
    return '';
  }
}

/**
 * 判断两个 URL 是否相同（归一化后比较）
 */
export function urlsAreEqual(a: string, b: string): boolean {
  return normalizeUrl(a) === normalizeUrl(b);
}

/**
 * 去除 tracking 参数后判断 URL 是否疑似重复
 */
export function urlsAreSuspectedDuplicates(a: string, b: string): boolean {
  const na = normalizeUrl(a);
  const nb = normalizeUrl(b);
  if (na === nb) return true;

  // 去除所有查询参数后比较
  try {
    const ua = new URL(a);
    const ub = new URL(b);
    return `${ua.origin}${ua.pathname}`.toLowerCase() === `${ub.origin}${ub.pathname}`.toLowerCase();
  } catch {
    return false;
  }
}
