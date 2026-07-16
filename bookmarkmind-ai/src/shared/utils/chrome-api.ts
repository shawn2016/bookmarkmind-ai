export function isContextValid(): boolean {
  try {
    return !!chrome?.runtime?.id;
  } catch {
    return false;
  }
}

export async function safeSendMessage<T = unknown>(
  message: Record<string, unknown>,
): Promise<T | null> {
  if (!isContextValid()) {
    return null;
  }
  try {
    return await chrome.runtime.sendMessage(message);
  } catch {
    return null;
  }
}

export async function safeStorageGet<T extends Record<string, unknown>>(
  keys: string | string[],
): Promise<T | null> {
  if (!isContextValid()) {
    return null;
  }
  try {
    const result = await chrome.storage.local.get(keys);
    return result as T;
  } catch {
    return null;
  }
}

export async function safeStorageSet(
  items: Record<string, unknown>,
): Promise<boolean> {
  if (!isContextValid()) {
    return false;
  }
  try {
    await chrome.storage.local.set(items);
    return true;
  } catch {
    return false;
  }
}

export function safeOpenOptionsPage(): void {
  if (!isContextValid()) return;
  try {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      chrome.runtime.sendMessage({ type: "OPEN_OPTIONS_PAGE" });
    }
  } catch {
    // ignore
  }
}