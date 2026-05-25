# Rollback Runbook

Use this runbook when a deployment introduces unsafe or broken production
behavior.

## Trigger conditions

- operator auth fails or misroutes users
- mandate creation or revoke paths fail
- attempts are being left in an unsafe or inconsistent state
- worker reconciliation fails broadly after deploy
- `/api/system` turns degraded because of the new release

## Immediate actions

1. Freeze further deploys
2. Record the failing commit SHA and deployment target
3. Capture logs and `/api/system` output
4. Determine whether the issue is:
   - app/runtime only
   - worker/runtime only
   - schema/migration related
   - env/config related

## Rollback order

1. Revert app/runtime to the last known good release
2. Revert worker/runtime if it shipped separately
3. Do **not** roll back schema destructively unless a migration plan exists
4. Re-run smoke checks on the restored version

## Database caution

- Prefer forward fixes over destructive schema rollback
- If a schema rollback is unavoidable, explicitly assess:
  - data loss risk
  - reservation/accounting corruption risk
  - worker task duplication risk

## Post-rollback checks

- operator auth works
- `/api/system` returns expected health
- queued/reconciling attempts are still visible
- no new invalid transitions are being produced

## After action

- open or update the incident issue
- record what failed
- record what was rolled back
- record follow-up hardening work needed before redeploy
