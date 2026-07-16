// ============================================================
// AI 配置就绪判定
// ============================================================

import type { ExtensionConfig, ModelConfig } from '@shared/types';

export function hasApiCredentials(model: ModelConfig): boolean {
  if (model.provider === 'custom') {
    return !!model.baseUrl?.trim();
  }
  return !!model.apiKey?.trim();
}

function isExtensionConfig(
  input: ExtensionConfig | ModelConfig,
): input is ExtensionConfig {
  return 'ball' in input && 'app' in input;
}

export function isAiReady(input: ExtensionConfig | ModelConfig): boolean {
  const model = isExtensionConfig(input) ? input.model : input;
  return hasApiCredentials(model) && !!model.model?.trim();
}

export function getAiNotReadyMessage(config: ExtensionConfig): string {
  if (!hasApiCredentials(config.model)) {
    return config.model.provider === 'custom'
      ? '请先在扩展设置中配置 Base URL'
      : '请先在扩展设置中配置 API Key';
  }
  return '请先在扩展设置中选择模型';
}
