import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['app/tests/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    reporters: ['default'],
    env: { NODE_ENV: 'test' },
  },
});
