export const AUTH_CHANNEL = 'auth';
export const AUTH_STORAGE_KEY = 'auth:logout';
export const AUTH_CART_KEY = 'auth:cart';

type InitOpts = {
  onLogout?: () => void;
  onCartSync?: (payload: unknown) => void;
};

let channel: BroadcastChannel | null = null;
let storageHandler: ((e: StorageEvent) => void) | null = null;

function getChannel(): BroadcastChannel | null {
  try {
    const Ctor = (globalThis as unknown as { BroadcastChannel?: typeof BroadcastChannel })
      .BroadcastChannel;
    if (!Ctor) return null;
    return new Ctor(AUTH_CHANNEL);
  } catch {
    return null;
  }
}

function safeLocalStorage() {
  try {
    return (globalThis as unknown as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
}

function safeWindow() {
  try {
    return (
      (globalThis as unknown as { window?: Window & typeof globalThis }).window ??
      (globalThis as unknown as Window)
    );
  } catch {
    return null;
  }
}

export function initAuthSync(opts: InitOpts): () => void {
  try {
    channel = getChannel();
  } catch {
    channel = null;
  }

  if (channel) {
    channel.onmessage = (ev: MessageEvent) => {
      const data = ev.data as { type?: string; payload?: unknown };
      if (data?.type === 'logout') opts.onLogout?.();
      if (data?.type === 'cart') opts.onCartSync?.(data.payload);
    };
  }

  storageHandler = (e: StorageEvent) => {
    if (e.key === AUTH_STORAGE_KEY && e.newValue) opts.onLogout?.();
    if (e.key === AUTH_CART_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        opts.onCartSync?.(parsed);
      } catch {
        opts.onCartSync?.(e.newValue);
      }
    }
  };

  const win = safeWindow();
  try {
    win?.addEventListener('storage', storageHandler as EventListener);
  } catch {
    // Safari private ignore
  }

  return () => {
    try {
      channel?.close();
    } catch {
      // ignore
    }
    channel = null;
    try {
      win?.removeEventListener('storage', storageHandler as EventListener);
    } catch {
      // ignore
    }
    storageHandler = null;
  };
}

export function broadcastLogout(): void {
  const payload = { type: 'logout' as const, timestamp: Date.now() };
  try {
    const ch = getChannel();
    if (ch) {
      ch.postMessage(payload);
      try {
        ch.close();
      } catch {
        /* ignore */
      }
    }
  } catch {
    // BC unavailable
  }
  try {
    safeLocalStorage()?.setItem(AUTH_STORAGE_KEY, String(payload.timestamp));
  } catch {
    // Safari private quota
  }
}

export function broadcastCart(payload: unknown): void {
  const msg = { type: 'cart' as const, payload, timestamp: Date.now() };
  try {
    const ch = getChannel();
    if (ch) {
      ch.postMessage(msg);
      try {
        ch.close();
      } catch {
        /* ignore */
      }
    }
  } catch {
    // ignore
  }
  try {
    safeLocalStorage()?.setItem(AUTH_CART_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}
