import { describe, it, expect, vi } from 'vitest';
import { parseSSEStream } from './stream';

function makeResponse(
  chunks: string[],
  ok = true,
  status = 200,
  errorBody = '',
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
      controller.close();
    },
  });
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Internal Server Error',
    body: stream,
    text: async () => errorBody,
  } as unknown as Response;
}

describe('parseSSEStream', () => {
  it('解析多个完整 data 行', async () => {
    const onChunk = vi.fn();
    await parseSSEStream(
      makeResponse(['data: {"x":1}\ndata: {"x":2}\n']),
      onChunk,
    );
    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk.mock.calls[0][0]).toBe('{"x":1}');
    expect(onChunk.mock.calls[1][0]).toBe('{"x":2}');
  });

  it('解析跨 chunk 边界的数据', async () => {
    const onChunk = vi.fn();
    await parseSSEStream(
      makeResponse(['data: {"x":', '1}\ndata: {"x":2}\n']),
      onChunk,
    );
    expect(onChunk).toHaveBeenCalledTimes(2);
    expect(onChunk.mock.calls[0][0]).toBe('{"x":1}');
  });

  it('最后一行无 \\n 仍能解析', async () => {
    const onChunk = vi.fn();
    await parseSSEStream(makeResponse(['data: end-no-newline']), onChunk);
    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk.mock.calls[0][0]).toBe('end-no-newline');
  });

  it('遇到 [DONE] 终止后续解析', async () => {
    const onChunk = vi.fn();
    await parseSSEStream(
      makeResponse(['data: a\ndata: [DONE]\ndata: b\n']),
      onChunk,
    );
    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk.mock.calls[0][0]).toBe('a');
  });

  it('跳过空行与注释行（以 : 开头）', async () => {
    const onChunk = vi.fn();
    await parseSSEStream(
      makeResponse(['\n:keepalive\ndata: real\n']),
      onChunk,
    );
    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk.mock.calls[0][0]).toBe('real');
  });

  it('跳过空的 data 负载', async () => {
    const onChunk = vi.fn();
    await parseSSEStream(
      makeResponse(['data: \ndata: real\n']),
      onChunk,
    );
    expect(onChunk).toHaveBeenCalledTimes(1);
    expect(onChunk.mock.calls[0][0]).toBe('real');
  });

  it('非 ok 响应抛错', async () => {
    await expect(
      parseSSEStream(makeResponse([], false, 500), vi.fn()),
    ).rejects.toThrow(/SSE stream error \(500\)/);
  });

  it('正确释放 reader lock', async () => {
    const release = vi.fn();
    const reader = {
      read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
      releaseLock: release,
    };
    const response = {
      ok: true,
      status: 200,
      statusText: 'OK',
      body: { getReader: () => reader },
    } as unknown as Response;

    await parseSSEStream(response, vi.fn());
    expect(release).toHaveBeenCalledTimes(1);
  });
});