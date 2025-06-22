import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Only target files in the src/e2e directory
  testDir: './src/e2e',
  testMatch: '**/*.spec.ts',
  
  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Base URL for all tests
  use: {
    baseURL: 'http://localhost:5174',
    // Take screenshot on failure
    screenshot: 'only-on-failure',
  },
  
  // Reporter configuration
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
});
