import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? "3001");
const baseURL = `http://127.0.0.1:${port}`;

/** CI runs `pnpm build` first, then only `next start` (avoids a second slow build). */
const usePrebuiltNext = process.env.PLAYWRIGHT_NEXT_PREBUILT === "1";

const webServerCommand = usePrebuiltNext
  ? `pnpm exec next start --hostname 127.0.0.1 --port ${port}`
  : `pnpm exec next build && pnpm exec next start --hostname 127.0.0.1 --port ${port}`;

const webServerTimeout = usePrebuiltNext ? 120_000 : 600_000;

const webServerEnv = {
  APP_ENV: "test",
  MANDATE402_PERSISTENCE_MODE: "sqlite",
  MANDATE402_NEXT_DIST_DIR: "tmp/mandate402-next-build",
  MANDATE402_SITE_URL: baseURL,
  // Short client-side cap so E2E does not wait on a real Supabase host.
  NEXT_PUBLIC_CONSOLE_AUTH_SESSION_CHECK_MS: "1500",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "e2e-test-anon-key-not-a-real-secret",
};

/**
 * E2E smoke: boots Next with test-mode env (sqlite store, placeholder Supabase)
 * so console routes load without Postgres or a real Supabase project.
 *
 * Next.js 16 allows only one `next dev` per checkout; we use `next start` so
 * Playwright does not fight a developer's running dev server.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "output/playwright/test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "output/playwright/report" }],
  ],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: webServerTimeout,
    env: webServerEnv,
  },
});
