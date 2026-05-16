# Mandate402 Glossary

This document is for anyone who wants one consistent definition for the main terms used across Mandate402 docs and code.

## Terms

### Agent

Software that acts on behalf of a user or organization and may attempt paid actions under a mandate.

### Mandate

A set of spending rules that defines what an agent may do, who it may pay, how much it may spend, and when that permission ends.

### Operator

The human user who creates, reviews, revokes, or reconciles mandates and payment attempts.

### Vendor

The paid service being purchased by the agent.

### Facilitator

The payment infrastructure used to verify or settle the x402 payment flow. It is not the vendor and not the treasury policy layer.

### Treasury

The money or spending authority an organization is trying to protect and govern.

### Receipt Evidence

The proof or post-payment evidence associated with a payment attempt, tracked separately from whether the payment itself succeeded.

### Payment Identifier

The stable identifier used to recognize whether a payment attempt is a retry of the same semantic action or a conflicting reuse.

### Execution Unknown

A state meaning the final payment truth is unresolved. It is neither success nor failure until reconciliation confirms the outcome.

### Reconciliation

The process of checking final truth after an ambiguous or delayed payment outcome.

### Audit Entry

A human-readable record of an important system action or state transition.

### Domain Event

A structured machine-readable event that records a system transition with metadata.

### Fallback Gate

A tracked rule set that controls whether a fallback wrapper path may be used when primary vendor paths are not viable.

### Morph

The blockchain environment used for contract anchoring and treasury-oriented onchain logic in this project.

### x402

The machine-payment interaction pattern used for paid online service requests in this project.

### Pyth

The oracle source used by the treasury contract to reference fiat-like price information for spend limits.
