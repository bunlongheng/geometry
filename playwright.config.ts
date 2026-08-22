import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  // The full 10-question quiz spec spends ~2.3s per wrong answer on the
  // auto-advance, so a full run legitimately takes ~30s.
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3035",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3035",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
