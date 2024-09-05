import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    dir: './src/',
    cache: false,
    isolate: true,
    passWithNoTests: true,
    bail: 1,
    logHeapUsage: false,
    watch: false,
    css: false,
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    reporters: 'default',
    coverage: {
      provider: 'v8',
      enabled: true,
      include: ['**/src/**'],
      all: true,
      clean: true,
      cleanOnRerun: true,
      skipFull: false,
      reportOnFailure: false,
      reporter: ['text'],
      thresholds: {
        perFile: false,
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
