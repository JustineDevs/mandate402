# Branch Protection Recommendations

Recommended protection for `main` on `JustineDevs/mandate402`:

## Required status checks

- `CI / app`
- `CI / contracts`
- `CI / go`
- `API Smoke / smoke`
- release-related checks must be green when applicable

## Recommended rules

- Require pull request before merging
- Require at least 1 approving review
- Require Justine (`@JustineDevs`) approval on frontend workflow changes when branch protection or CODEOWNERS is available
- Require Justine (`@JustineDevs`) approval on auth, infra, contract, release, and treasury-critical changes
- Dismiss stale approvals on new commits
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Block force pushes
- Block branch deletion
- Restrict direct pushes to maintainers only
- Prefer squash merge only

## Team workflow alignment

For the `v0.1.0` team process:

- Sherwin provides wireframe and design context before implementation starts
- Edward and John work in separate frontend lanes instead of shared screen ownership by default
- Justine performs final integration and merge review

## Release discipline

- Run `pnpm check:repo-safety`
- Run `pnpm check:release-readiness`
- Create a Changeset for user-visible repo changes
- Use semantic-release from `main` only
- Treat `main` as the only branch allowed to produce release tags and notes
