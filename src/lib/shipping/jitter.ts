import pLimit from 'p-limit';
export async function jitterRetry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
  const limit = pLimit(5);
  return limit(async () => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (e) {
        if (attempt === retries - 1) throw e;
        const jitter = Math.floor(Math.random() * 200);
        const delay = 100 * Math.pow(2, attempt) + jitter;
        const capped = Math.min(delay, 500);
        await new Promise((r) => setTimeout(r, capped));
      }
    }
    throw new Error('retry exhausted');
  });
}
export const jitterConfig = { retries: 5, base: 100, maxJitter: 200, maxDelay: 500 };
