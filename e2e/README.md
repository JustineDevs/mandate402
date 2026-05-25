# Playwright E2E

Smoke tests for browser-visible flows that Vitest cannot cover (navigation, the
console auth gate, redirects). Configuration lives in `playwright.config.ts`.

## Run locally

```bash
pnpm exec playwright install chromium
# One-time (or after app changes): production build with the same public env CI uses,
# then reuse it so Playwright only runs `next start` (Next 16 allows one `next dev` per checkout).
env APP_ENV=test MANDATE402_PERSISTENCE_MODE=sqlite MANDATE402_SITE_URL=http://127.0.0.1:3001 \
  NEXT_PUBLIC_CONSOLE_AUTH_SESSION_CHECK_MS=1500 \
  NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=e2e-test-anon-key-not-a-real-secret \
  pnpm build
PLAYWRIGHT_NEXT_PREBUILT=1 pnpm run test:e2e
```

Or let Playwright run `next build && next start` for you (slow; uses the env in `playwright.config.ts`):

```bash
pnpm run test:e2e
```

The config starts Next with `APP_ENV=test`, `MANDATE402_PERSISTENCE_MODE=sqlite`,
and placeholder `NEXT_PUBLIC_SUPABASE_*` values so the app boots without Postgres
or a real Supabase project. `NEXT_PUBLIC_CONSOLE_AUTH_SESSION_CHECK_MS` keeps the
console auth gate from waiting indefinitely when Supabase is unreachable.

Artifacts (HTML report, traces on retry) go under `output/playwright/` (gitignored).

## CI

The GitHub Actions `app` job builds with the same public env, installs Chromium
(`--with-deps` on Ubuntu), sets `PLAYWRIGHT_NEXT_PREBUILT=1`, and runs `pnpm run test:e2e`
so the suite attaches to `next start` without a second full build.

For CLI-driven exploratory checks, see `.agents/skills/playwright/SKILL.md`
(`playwright-cli` / snapshot workflow).
