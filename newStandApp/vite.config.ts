import { defineConfig } from 'vite' // Keep this for Vite config
import { defineConfig as defineVitestConfig, configDefaults } from 'vitest/config'; // For Vitest config
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const viteConfig = defineConfig({
  plugins: [react()],
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true, // Optional: to use vitest globals like describe, it, expect without importing
    environment: 'jsdom', // To simulate a browser environment for React components
        setupFiles: './src/setupTests.ts', // Optional: if you have a test setup file
    exclude: [
      ...configDefaults.exclude,
      '**/*.spec.ts',
      '**/*.e2e.spec.ts',
    ],
  },
});

// Merge the configurations
export default {
  ...viteConfig,
  ...vitestConfig,
};
