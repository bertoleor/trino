/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unused-vars */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('auth-sync W-05 BroadcastChannel + storage fallback <1s', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // @ts-ignore
    globalThis.localStorage = undefined;
    // @ts-ignore
    globalThis.window = undefined;
  });

  it('exports initAuthSync, broadcastLogout, broadcastCart', async () => {
    const m = await import('@/lib/realtime/auth-sync');
    expect(typeof m.initAuthSync).toBe('function');
    expect(typeof m.broadcastLogout).toBe('function');
    expect(typeof m.broadcastCart).toBe('function');
    expect(m.AUTH_CHANNEL).toBe('auth');
    expect(m.AUTH_STORAGE_KEY).toBe('auth:logout');
  });

  it('initAuthSync uses BroadcastChannel auth when available', async () => {
    const postMessage = vi.fn();
    const close = vi.fn();
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    class FakeBC {
      name: string; onmessage: any = null;
      constructor(n: string) { this.name = n; }
      postMessage = postMessage; close = close; addEventListener = addEventListener; removeEventListener = removeEventListener;
    }
    // @ts-ignore
    globalThis.BroadcastChannel = FakeBC;
    // @ts-ignore
    globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn(), localStorage: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() } };
    const { initAuthSync } = await import('@/lib/realtime/auth-sync');
    const cleanup = initAuthSync({ onLogout: vi.fn() });
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('broadcastLogout posts via BroadcastChannel and storage fallback', async () => {
    const postMessage = vi.fn();
    class FakeBC { constructor(_n: string){} postMessage = postMessage; close(){ } addEventListener(){} }
    // @ts-ignore
    globalThis.BroadcastChannel = FakeBC;
    const setItem = vi.fn();
    // @ts-ignore
    globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
    // @ts-ignore
    globalThis.localStorage = { setItem, getItem: vi.fn(), removeItem: vi.fn() };
    const { broadcastLogout } = await import('@/lib/realtime/auth-sync');
    broadcastLogout();
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'logout' }));
    expect(setItem).toHaveBeenCalledWith('auth:logout', expect.any(String));
  });

  it('fallback to storage when BroadcastChannel unavailable (Safari private)', async () => {
    // @ts-ignore
    globalThis.BroadcastChannel = undefined;
    const setItem = vi.fn();
    // @ts-ignore
    globalThis.localStorage = { setItem, getItem: vi.fn(), removeItem: vi.fn() };
    // @ts-ignore
    globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
    const { broadcastLogout } = await import('@/lib/realtime/auth-sync');
    broadcastLogout();
    expect(setItem).toHaveBeenCalledWith('auth:logout', expect.any(String));
  });

  it('storage event triggers onLogout <1s', async () => {
    const listeners: Record<string, Function> = {};
    // @ts-ignore
    globalThis.BroadcastChannel = undefined;
    // @ts-ignore
    globalThis.window = {
      // @ts-ignore
      addEventListener: (ev: string, cb: Function) => { listeners[ev] = cb; },
      removeEventListener: vi.fn(),
    };
    // @ts-ignore
    globalThis.localStorage = { setItem: vi.fn(), getItem: vi.fn(), removeItem: vi.fn() };
    const onLogout = vi.fn();
    const { initAuthSync } = await import('@/lib/realtime/auth-sync');
    initAuthSync({ onLogout });
    // simulate storage event from other tab
    // @ts-ignore
    listeners['storage']?.({ key: 'auth:logout', newValue: String(Date.now()) });
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('cleanup removes listeners and closes channel', async () => {
    const close = vi.fn();
    class FakeBC { constructor(_n:string){} close = close; postMessage(){} addEventListener(){} onmessage=null }
    // @ts-ignore
    globalThis.BroadcastChannel = FakeBC;
    // @ts-ignore
    globalThis.window = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
    const { initAuthSync } = await import('@/lib/realtime/auth-sync');
    const cleanup = initAuthSync({ onLogout: vi.fn() });
    cleanup();
    expect(close).toHaveBeenCalled();
  });
});
