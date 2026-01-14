import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src', // Look for tests in src
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  // 1. Tell Playwright where your app is running
  use: {
    baseURL: 'http://127.0.0.1:8787', // Matches your Wrangler log
    trace: 'on-first-retry',
  },

  // 2. Define the 'chromium' project explicitly
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // You can uncomment these to test other browsers later
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // 3. Optional: Automatically start your server before testing
  // If you prefer to run 'npm run dev' manually in another tab, 
  // you can comment this 'webServer' block out.
  /*
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:8787',
    reuseExistingServer: !process.env.CI,
  },
  */
});
