# Key Compromise Runbook

Use this runbook when a sensitive credential may have been exposed or misused.

## Keys in scope

- `MORPH_PRIVATE_KEY`
- `MANDATE402_DEPLOYER_PRIVATE_KEY`
- `MORPH_X402_ACCESS_KEY`
- `MORPH_X402_SECRET_KEY`
- `MANDATE402_WORKER_TOKEN`
- Supabase service or environment secrets used for production auth/runtime

## Immediate actions

1. Treat the credential as compromised
2. Stop using the affected credential
3. Rotate it in the backing provider
4. Update deployment secrets
5. Redeploy the affected runtime surfaces

## Containment checks

- check whether unauthorized actions were performed
- inspect recent worker executions and reconciliation events
- inspect Morph anchor activity if signer keys were exposed
- inspect vendor/facilitator logs if x402 credentials were exposed

## Special handling

### Morph signer compromise

- rotate the signer
- assess whether contract ownership or treasury permissions need follow-up
- verify future issue/revoke actions are using the new signer

### Worker token compromise

- rotate `MANDATE402_WORKER_TOKEN`
- confirm internal worker routes reject the old token

### Supabase/runtime secret compromise

- rotate affected keys
- review operator access and recent auth events

## Evidence to capture

- what key was exposed
- how exposure was discovered
- whether unauthorized use was observed
- when rotation completed
- what deployments were restarted
