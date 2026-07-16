// ============================================================
// AI 书签管家 — OpenAI Provider
// ============================================================
import type { ModelConfig, ClassifyResult } from '@shared/types';
import type { AIProvider } from './provider';
import { parseSSEStream } from './stream';
import { buildClassifyPrompt } from './prompt';
import { normalizeApiBaseUrl } from '@shared/utils/api-url';

export class OpenAIProvider implements AIProvider {
  private readonly config: ModelConfig;
  private readonly baseUrl: string;

  constructor(config: ModelConfig) {
    this.config = config;
    this.baseUrl = normalizeApiBaseUrl(
      config.baseUrl || 'https://api.openai.com/v1',
    );
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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
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

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
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
      throw new Error(`OpenAI classify error (${response.status})`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '{}';

    return this.parseClassifyResult(text);
  }

  // ---- testConnection ----

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
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
