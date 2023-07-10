import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    dir: './src/',
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
      all: true,
      clean: true,
      cleanOnRerun: true,
      skipFull: false,
      perFile: false,
      reportOnFailure: false,
      include: ['**/src/**'],
      reporter: ['text'],
    },
  },
});
