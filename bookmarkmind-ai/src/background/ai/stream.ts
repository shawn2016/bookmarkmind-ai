// ============================================================
// AI 书签管家 — SSE Stream Parser
// ============================================================

/**
 * Parse an SSE (Server-Sent Events) stream from a fetch Response.
 *
 * Reads line by line, extracts "data: ..." payloads, and calls `onChunk`
 * with each decoded chunk. Stops when the stream ends or the "[DONE]"
 * sentinel is encountered.
 */
export async function parseSSEStream(
  response: Response,
  onChunk: (data: string) => void,
): Promise<void> {
  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(`SSE stream error (${response.status}): ${text || response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const flushBuffer = () => {
    const trimmed = buffer.trim();
    if (!trimmed) return;
    if (trimmed === 'data: [DONE]') return;
    if (trimmed.startsWith('data: ')) {
      const payload = trimmed.slice(6);
      if (payload) onChunk(payload);
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      const lines = buffer.split('\n');
      // The last element might be incomplete — keep it in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith(':')) continue;

        // Check for [DONE] sentinel
        if (trimmed === 'data: [DONE]') return;

        // Extract data payload
        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.slice(6);
          // Skip empty data payloads (some SSE implementations send "data: " alone)
          if (payload) {
            onChunk(payload);
          }
        }
      }
    }

    // Stream ended — flush whatever is left in the buffer.
    // Without this, the final line (which often has no trailing \n)
    // would be silently dropped.
    flushBuffer();
  } finally {
    reader.releaseLock();
  }
}
