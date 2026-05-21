# Security Review Skill Tests

- Given an API route auth change, the agent loads `mandate402-runtime-security` and validates server-side enforcement.
- Given a Morph contract integration change, the agent loads `mandate402-blockchain` and checks signer, RPC, ABI, and contract-address boundaries.
- Given a payment reconciliation change, the agent preserves `execution_unknown` semantics until correlation proves final truth.
- Given docs or logs, the agent rejects secrets, local paths, and generated artifacts.
