import { describe, it, expect } from 'vitest';
import { normalizeApiBaseUrl } from './api-url';

describe('normalizeApiBaseUrl', () => {
  it.each([
    // [input, expected]
    ['http://localhost:11434', 'http://localhost:11434/v1'],
    ['http://localhost:11434/', 'http://localhost:11434/v1'],
    ['http://localhost:11434/v1', 'http://localhost:11434/v1'],
    ['http://localhost:11434/v1/', 'http://localhost:11434/v1'],
    ['https://api.openai.com/v1', 'https://api.openai.com/v1'],
    ['https://api.openai.com/v1/', 'https://api.openai.com/v1'],
    [
      'https://api.openai.com/v1/chat/completions',
      'https://api.openai.com/v1',
    ],
    ['  https://api.openai.com/v1/  ', 'https://api.openai.com/v1'],
    [
      'https://custom-proxy.example.com/openai',
      'https://custom-proxy.example.com/openai',
    ],
  ])('归一化 %s → %s', (input, expected) => {
    expect(normalizeApiBaseUrl(input)).toBe(expected);
  });

  it('处理裸 host（Ollama 等本地模型）', () => {
    expect(normalizeApiBaseUrl('http://localhost:1234')).toBe(
      'http://localhost:1234/v1',
    );
  });

  it('保留带路径的自定义 base URL', () => {
    expect(normalizeApiBaseUrl('https://gateway.example.com/llm/v1')).toBe(
      'https://gateway.example.com/llm/v1',
    );
  });

  it('去除多余的尾部斜杠', () => {
    expect(normalizeApiBaseUrl('https://api.example.com/v1///')).toBe(
      'https://api.example.com/v1',
    );
  });

  it('去除前后空白', () => {
    expect(normalizeApiBaseUrl('   https://api.example.com/v1   ')).toBe(
      'https://api.example.com/v1',
    );
  });

  it('MiniMax 旧域名自动修正', () => {
    expect(normalizeApiBaseUrl('https://api.minimax.chat')).toBe(
      'https://api.minimaxi.com/v1',
    );
    expect(normalizeApiBaseUrl('https://api.minimax.chat/v1')).toBe(
      'https://api.minimaxi.com/v1',
    );
  });

  it('MiniMax Anthropic 端点归一化', () => {
    expect(normalizeApiBaseUrl('https://api.minimaxi.com/anthropic')).toBe(
      'https://api.minimaxi.com/anthropic/v1',
    );
    expect(normalizeApiBaseUrl('https://api.minimaxi.com/anthropic/v1/models')).toBe(
      'https://api.minimaxi.com/anthropic/v1',
    );
  });
});