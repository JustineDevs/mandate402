# Frontend Testing Checklist

Prioritize:

- form validation feedback
- unauthorized and expired-session states
- blocked policy explanations
- worker queued and leased states
- `execution_unknown`
- treasury not ready
- chain or RPC degraded
- empty mandates/attempts/receipts
- destructive confirmation modals

Assertions should cover:

- visible text that operators rely on
- enabled/disabled action state
- error recovery path
- navigation after successful actions
- no misleading finality before worker or chain truth exists
