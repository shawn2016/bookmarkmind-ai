import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle } from './debounce';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('延迟执行', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced('a');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('连续调用只执行最后一次', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('a');
    vi.advanceTimersByTime(50);
    debounced('b');
    vi.advanceTimersByTime(50);
    debounced('c');

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('多次间隔足够长的调用会多次执行', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('a');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced('b');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[1][0]).toBe('b');
  });

  it('仅保留参数（不绑定 this）', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1, 'two', { three: 3 });
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith(1, 'two', { three: 3 });
    // 注意：当前实现 fn(...args) 是普通调用，不绑定 this。
    // 若调用方依赖 this，应在外层用箭头函数包一层。
  });
});

describe('throttle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('首次调用立即执行', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a');
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('节流窗口内的后续调用被忽略', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a'); // 执行
    throttled('b'); // 忽略
    throttled('c'); // 忽略

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('窗口结束后允许再次执行', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('a'); // 执行
    vi.advanceTimersByTime(100);
    throttled('b'); // 窗口结束，再次执行

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn.mock.calls[1][0]).toBe('b');
  });
});