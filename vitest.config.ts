import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['src/**/*.ts'],
      exclude: ['src/cli.ts'],
      thresholds: {
        100: true,
      },
    },
  },
})
