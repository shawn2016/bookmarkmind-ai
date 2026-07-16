// ============================================================
// AI 书签管家 — AI Provider Interface & Factory
// ============================================================
import type { ModelConfig, ClassifyResult } from '@shared/types';
import { resolveModelConfig } from '@shared/utils/api-url';
import type { ConnectionTestResult } from './models';

// Static imports — avoids Vite's dynamic-import preload polyfill which
// uses `document` (not available in the Service Worker context).
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { CustomProvider } from './custom';

// ---- Provider Interface ----

export interface ClassifyOptions {
  preferExisting?: boolean;
  maxNewCategories?: number;
}

export interface AIProvider {
  /**
   * Send a chat completion request and stream text chunks.
   * Returns the full concatenated text when done.
   * Throws on error (timeout, network, API error).
   */
  chatStream(
    messages: { role: string; content: string }[],
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<string>;

  /**
   * Classify a bookmark into a category folder.
   */
  classify(
    bookmark: { title: string; url: string; description?: string },
    existingFolders: string[],
    options?: ClassifyOptions,
  ): Promise<ClassifyResult>;

  /**
   * Test credentials and fetch available models when supported.
   */
  testConnection(): Promise<ConnectionTestResult>;
}

// ---- Factory ----

/**
 * Create an AI provider instance based on the model config.
 * Uses static imports to avoid Vite's modulepreload polyfill which
 * references `document` (unavailable in Service Workers).
 */
export function createProvider(config: ModelConfig): AIProvider {
  const resolved = resolveModelConfig(config);
  switch (resolved.provider) {
    case 'openai':
      return new OpenAIProvider(resolved);
    case 'anthropic':
      return new AnthropicProvider(resolved);
    case 'custom':
      return new CustomProvider(resolved);
    default:
      throw new Error(`Unknown AI provider: ${resolved.provider}`);
  }
}

/**
 * Async factory — keeps backward compatibility with code that
 * calls `await createProvider(...)`.
 */
export async function createProviderAsync(config: ModelConfig): Promise<AIProvider> {
  return createProvider(config);
}
