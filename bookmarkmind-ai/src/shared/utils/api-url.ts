import type { ModelConfig } from '@shared/types';

/** 是否为 MiniMax Anthropic 兼容端点 */
export function isMinimaxAnthropicUrl(url: string): boolean {
  return /minimaxi\.com\/anthropic|minimax\.io\/anthropic/i.test(url);
}

/** 归一化 Anthropic 兼容 Base URL */
export function normalizeAnthropicBaseUrl(raw: string): string {
  let base = raw.trim().replace(/\/+$/, '');

  if (base.endsWith('/messages')) {
    base = base.slice(0, -'/messages'.length).replace(/\/+$/, '');
  }
  if (base.endsWith('/models')) {
    base = base.slice(0, -'/models'.length).replace(/\/+$/, '');
  }

  if (/\/anthropic$/i.test(base)) {
    base = `${base}/v1`;
  }

  return base.replace(/\/+$/, '');
}

/** Normalize OpenAI-compatible API base URL. */
export function normalizeApiBaseUrl(raw: string): string {
  let base = raw.trim().replace(/\/+$/, '');

  if (base.endsWith('/chat/completions')) {
    base = base.slice(0, -'/chat/completions'.length).replace(/\/+$/, '');
  }

  // MiniMax Anthropic 路径不走 OpenAI 归一化
  if (isMinimaxAnthropicUrl(base)) {
    return normalizeAnthropicBaseUrl(base);
  }

  // MiniMax 旧域名 / 错误域名修正
  base = base
    .replace(/^https?:\/\/api\.minimax\.chat\b/i, 'https://api.minimaxi.com')
    .replace(/^https?:\/\/api\.minimax\.io\b/i, 'https://api.minimax.io');

  // Bare host like http://localhost:11434 → append /v1 for Ollama compat
  if (/^https?:\/\/[^/]+$/.test(base)) {
    base = `${base}/v1`;
  }

  return base;
}

/**
 * 根据 Base URL 自动选择 Provider（如 MiniMax Anthropic 端点）。
 */
export function resolveModelConfig(config: ModelConfig): ModelConfig {
  const baseUrl = config.baseUrl?.trim();
  if (!baseUrl) return config;

  if (isMinimaxAnthropicUrl(baseUrl)) {
    return {
      ...config,
      provider: 'anthropic',
      baseUrl: normalizeAnthropicBaseUrl(baseUrl),
    };
  }

  if (config.provider === 'custom') {
    return { ...config, baseUrl: normalizeApiBaseUrl(baseUrl) };
  }

  if (config.provider === 'anthropic' && baseUrl) {
    return { ...config, baseUrl: normalizeAnthropicBaseUrl(baseUrl) };
  }

  return config;
}

/** MiniMax 推荐 Base URL */
export function getMinimaxBaseUrlHint(): string {
  return 'Anthropic 兼容: https://api.minimaxi.com/anthropic/v1（推荐）；OpenAI 兼容: https://api.minimaxi.com/v1';
}
