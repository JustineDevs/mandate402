# mandate402-frontend tests

Use these as golden prompts for validation.

## Should trigger

1. "Update the Mandate402 landing page to use the Sherwin two-column hero with the logo and CTA on the right and auth on the left."
2. "Polish the receipts page and make sure blocked and degraded states are visible on mobile."
3. "Implement the revoke modal and blocked-reason popover for the mandate detail page."
4. "Refactor the dashboard cards and table shells without forking the design system."

## Should not trigger alone

1. "Fix Postgres pooler settings"
2. "Implement worker-owned reconciliation"
3. "Update the contract ABI"

## Expected behavior

- reads project docs before editing
- preserves lane ownership
- uses token and layout references only when needed
- calls out trust-critical state coverage
- avoids generic SaaS styling or fake runtime states
