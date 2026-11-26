import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  cacheDir: 'E:/Hermes/projects/TRINO/.vite-cache',
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary', 'lcov'],
      // Global floors ratcheted to the measured CI baseline; raise as suites land.
      // 2026-11-26: lines 65.42, functions 63.87, branches 54.84, statements 62.59.
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50,
        statements: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
