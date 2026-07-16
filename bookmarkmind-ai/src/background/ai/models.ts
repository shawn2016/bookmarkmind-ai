// ============================================================
// AI Provider — model list helpers
// ============================================================

export interface ConnectionTestResult {
  success: boolean;
  models: string[];
  message?: string;
}

const ANTHROPIC_FALLBACK_MODELS = [
  'claude-3-5-haiku-20241022',
  'claude-3-5-sonnet-20241022',
  'claude-3-opus-20240229',
  'claude-3-haiku-20240307',
  'claude-3-sonnet-20240229',
];

const OPENAI_FALLBACK_MODELS = [
  'gpt-4o-mini',
  'gpt-4o',
  'gpt-4-turbo',
  'gpt-3.5-turbo',
];

/** Parse OpenAI-compatible /models response */
export function parseOpenAIModelsPayload(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') return [];

  const data = (payload as { data?: unknown }).data;
  if (!Array.isArray(data)) return [];

  const ids = data
    .map((item) => {
      if (!item || typeof item !== 'object') return '';
      const id = (item as { id?: unknown }).id;
      return typeof id === 'string' ? id : '';
    })
    .filter(Boolean);

  return sortAndFilterChatModels(ids);
}

/** Hide embedding / audio / image models from picker */
export function sortAndFilterChatModels(models: string[]): string[] {
  const blocked = /(embed|embedding|tts|whisper|dall-e|transcribe|audio|realtime|moderation)/i;
  const unique = [...new Set(models.filter((id) => id && !blocked.test(id)))];
  unique.sort((a, b) => a.localeCompare(b));
  return unique;
}

export function getAnthropicFallbackModels(): string[] {
  return [...ANTHROPIC_FALLBACK_MODELS];
}

export function getOpenAIFallbackModels(): string[] {
  return [...OPENAI_FALLBACK_MODELS];
}
