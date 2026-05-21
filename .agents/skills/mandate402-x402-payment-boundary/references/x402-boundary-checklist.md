# x402 Boundary Checklist

Mandate402 responsibilities:

- authorize operator action
- enforce mandate policy
- enforce treasury guard where configured
- reserve budget before dispatch
- enqueue dispatch/reconciliation work
- persist receipt and audit evidence

Vendor responsibilities:

- expose paid x402 routes
- return paid service result
- expose status/correlation endpoint

Facilitator responsibilities:

- discover, verify, and settle x402 payments
- never act as the paid service endpoint

Reconciliation truth:

- vendor status wins for vendor-side completion
- chain/facilitator evidence supports settlement truth
- caller-supplied final state is never authoritative
