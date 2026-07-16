// ============================================================
// AI 书签管家 — Anthropic Provider
// ============================================================
import type { ModelConfig, ClassifyResult } from '@shared/types';
import type { AIProvider } from './provider';
import { parseSSEStream } from './stream';
import { buildClassifyPrompt } from './prompt';

export class AnthropicProvider implements AIProvider {
  private readonly config: ModelConfig;
  private readonly baseUrl: string;

  constructor(config: ModelConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  /** MiniMax 等代理使用 Bearer，官方 Anthropic 使用 x-api-key */
  private useBearerAuth(): boolean {
    return /minimaxi\.com|minimax\.io/i.test(this.baseUrl);
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    };
    if (this.useBearerAuth()) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    } else {
      headers['x-api-key'] = this.config.apiKey;
    }
    return headers;
  }

  // ---- chatStream ----

  async chatStream(
    messages: { role: string; content: string }[],
    onChunk: (text: string) => void,
    signal?: AbortSignal,
  ): Promise<string> {
    const url = `${this.baseUrl}/messages`;

    // Anthropic uses a system param separate from messages
    let systemContent = '';
    const chatMessages: { role: string; content: string }[] = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemContent += (systemContent ? '\n' : '') + msg.content;
      } else {
        // Anthropic expects "user" or "assistant" roles
        chatMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        });
      }
    }

    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: chatMessages,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      stream: true,
    };

    if (systemContent) {
      body.system = systemContent;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
    }

    let fullText = '';

    await parseSSEStream(response, (data: string) => {
      try {
        const parsed = JSON.parse(data);

        // Anthropic SSE event types
        if (parsed.type === 'content_block_delta') {
          const delta = parsed?.delta?.text;
          if (delta) {
            fullText += delta;
            onChunk(delta);
          }
        }
        // content_block_start may also contain text for some models
        if (parsed.type === 'content_block_start') {
          const text = parsed?.content_block?.text;
          if (text) {
            fullText += text;
            onChunk(text);
          }
        }
      } catch {
        // Skip malformed chunks
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

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.authHeaders(),
      body: JSON.stringify({
        model: this.config.model,
        system: 'You are a precise JSON-only API. Always respond with valid JSON and nothing else.',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 256,
        temperature: 0.1,
        stream: false,
      }),
      signal: AbortSignal.timeout(this.config.timeout),
    });

    if (!response.ok) {
      throw new Error(`Anthropic classify error (${response.status})`);
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || '{}';

    return this.parseClassifyResult(text);
  }

  // ---- testConnection ----

  async testConnection(): Promise<boolean> {
    try {
      if (this.useBearerAuth()) {
        const response = await fetch(`${this.baseUrl}/models`, {
          headers: { Authorization: `Bearer ${this.config.apiKey}` },
          signal: AbortSignal.timeout(10000),
        });
        return response.ok;
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.authHeaders(),
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
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
      // Anthropic may wrap JSON in markdown fences
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        category: String(parsed.category || parsed.folder || '未分类'),
        confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5)),
      };
    } catch {
      return { category: '未分类', confidence: 0.3 };
    }
  }
}
