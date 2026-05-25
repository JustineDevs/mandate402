# Agent Skills

`.agents/skills/` is the canonical repo-local skill directory for Mandate402.

Agents working in this repository must apply the matching skill before changing a lane.

This is not advisory.
For any meaningful bug fix, feature, hot-fix, refactor, hardening pass, or release-prep change:

1. choose the matching lane skill before edits
2. apply the relevant overlay skills before verification
3. use the skill guidance to prove changed routes, pages, and components are real, wired, and not stubbed or partial

When preparing work for push or PR:

- all applicable `.cursor/commands/*` lenses must also be executed
- all applicable `.agents/skills/*` checks must be executed
- silent skipping is not allowed; non-applicable surfaces must be explicitly justified

## Mandatory Mandate402 Skills

- `mandate402-frontend`
- `mandate402-backend`
- `mandate402-backend-runtime`
- `mandate402-blockchain`
- `mandate402-workers`

## Specialized Mandate402 Overlays

- `mandate402-api-contracts`
- `mandate402-postgres-persistence`
- `mandate402-runtime-security`
- `mandate402-test-harness`
- `mandate402-x402-payment-boundary`
- `mandate402-x402-vendor-go`
- `mandate402-contract-deploy-verify`
- `mandate402-release-ci-safety`
- `mandate402-frontend-testing`
- `mandate402-responsive-qa`
- `mandate402-accessibility-audit`
- `mandate402-oracle-settlement-assets`

## Curated OSS Overlays

- `co-star-ui`
- `web-design-guidelines`
- `ui-ux-pro-max`
- `frontend-design`
- `vercel-react-best-practices`
- `core-engineering`
- `backend-development`
- `cloudflare-workers-testing`
- `typescript-advanced-types`
- `typescript-expert`
- `typescript-best-practices`
- `supabase-postgres-best-practices`
- `playwright`
- `vitest`
- `web3-testing`
- `system-design`
- `architecture-decision`
- `developer-onboarding`
- `test-cases`
- `api-security-hardening`
- `cc-skill-security-review`
- `security-review`
- `software-crypto-web3`

Only the curated allowlist in `.gitignore` is intended for the public repo. Other locally installed collection entries are ignored tool cache and must not be referenced as project guidance.

Each curated skill may expose adapter metadata under `agents/`:

- `openai.yaml`
- `claude.yaml`
- `cursor.yaml`
- `gemini.yaml`
