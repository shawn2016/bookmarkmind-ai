// ============================================================
// AI 书签管家 — Custom OpenAI-Compatible Provider
// (Ollama, LM Studio, vLLM, local-ai, etc.)
// ============================================================
import type { ModelConfig, ClassifyResult } from '@shared/types';
import type { AIProvider } from './provider';
import { parseSSEStream } from './stream';
import { buildClassifyPrompt } from './prompt';
import { normalizeApiBaseUrl } from '@shared/utils/api-url';

export class CustomProvider implements AIProvider {
  private readonly config: ModelConfig;

  constructor(config: ModelConfig) {
    this.config = config;

    if (!config.baseUrl) {
      throw new Error('Custom provider requires a baseUrl');
    }
  }

  private get baseUrl(): string {
    return normalizeApiBaseUrl(this.config.baseUrl!);
  }

  // ---- chatStream ----

  async chatStream(
    messages: { role: string; content: string }[],
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
      stream: true,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Some custom endpoints still need auth
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const hint =
        response.status === 404
          ? '（404 请检查 Base URL，MiniMax 国内用 https://api.minimaxi.com/v1，国际用 https://api.minimax.io/v1）'
          : '';
      throw new Error(`Custom API error (${response.status}): ${errorText}${hint}`);
    }

    let fullText = '';

    await parseSSEStream(response, (data: string) => {
      try {
        const parsed = JSON.parse(data);
        const delta = parsed?.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          onChunk(delta);
        }
      } catch {
        // Skip malformed JSON chunks
      }
    });

    return fullText;
  }

  // ---- classify ----

  async classify(
    bookmark: { title: string; url: string; description?: string },
    existingFolders: string[],
    options?: { preferExisting?: boolean; maxNewCategories?: number },
  ): Promise<ClassifyResult> {
    const prompt = buildClassifyPrompt(bookmark, existingFolders, options);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: 'You are a precise JSON-only API. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 256,
        stream: false,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Custom API classify error (${response.status})`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '{}';

    return this.parseClassifyResult(text);
  }

  // ---- testConnection ----

  async testConnection(): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      // Try the models endpoint first (works for most OpenAI-compatible APIs)
      const response = await fetch(`${this.baseUrl}/models`, {
        headers,
        signal: AbortSignal.timeout(10000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // ---- helpers ----

  private parseClassifyResult(text: string): ClassifyResult {
    try {
      const parsed = JSON.parse(text);
      return {
        category: String(parsed.category || parsed.folder || '未分类'),
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
      };
    } catch {
      return { category: '未分类', confidence: 0.3 };
    }
  }
}
