# Branch Protection Recommendations

Recommended protection for `main` on `JustineDevs/mandate402`:

## Required status checks

- `CI / app`
- `CI / contracts`
- `CI / go`
- `API Smoke / smoke`

## Recommended rules

- Require pull request before merging
- Require at least 1 approving review
- Dismiss stale approvals on new commits
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Block force pushes
- Block branch deletion
- Restrict direct pushes to maintainers only

## Release discipline

- Run `pnpm check:repo-safety`
- Run `pnpm check:release-readiness`
- Create a Changeset for user-visible repo changes
- Use semantic-release from `main` only
