# mandate402-backend tests

Use these as golden prompts for validation.

## Should trigger

1. "Refactor the mandate attempt route so dispatch is worker-owned instead of request-path owned."
2. "Make the Postgres adapter safe for Supabase transaction pooler runtime and direct schema connections."
3. "Add health reporting for worker queue backlog and reconciliation lease state."
4. "Implement strict validation around vendor endpoints, queue invariants, and payment identifiers."

## Should not trigger alone

1. "Restyle the landing page hero"
2. "Adjust the receipts page spacing"
3. "Change a button color in the dashboard"

## Expected behavior

- reads architecture and runtime docs first
- plans before editing
- keeps request path and worker path responsibilities distinct
- calls out trust boundaries and failure modes
- verifies with tests, typecheck, lint, and build as needed
