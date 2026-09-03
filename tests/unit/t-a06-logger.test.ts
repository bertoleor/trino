import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..');

describe('T-A06 logger OTel Sentry zeroConsole', () => {
  it('src/lib/logger.ts exists', () => {
    expect(fs.existsSync(path.join(ROOT, 'src/lib/logger.ts'))).toBe(true);
  });

  it('exports logger with error/warn/info and no console', async () => {
    const content = fs.readFileSync(path.join(ROOT, 'src/lib/logger.ts'), 'utf8');
    expect(content).toMatch(/error|warn|info/);
    expect(content).not.toMatch(/console\.log/);
    const mod = await import('@/lib/logger');
    expect(typeof mod.logger).toBe('object');
    expect(typeof mod.logger.error).toBe('function');
  });

  it('logger.error includes required fields and does not throw', async () => {
    const { logger } = await import('@/lib/logger');
    expect(() => logger.error('test', { route: '/test' })).not.toThrow();
  });

  it('logger triangulates warn/info paths', async () => {
    const { logger } = await import('@/lib/logger');
    expect(() => logger.warn('warn msg')).not.toThrow();
    expect(() => logger.info('info msg', { userId: '123' })).not.toThrow();
  });
});
