# Oracle Settlement Checklist

Settlement model must define:

- settlement token address
- settlement token decimals
- facilitator address
- treasury contract address
- Pyth oracle address
- ETH/USD feed ID
- USDC/USD or stable asset feed ID
- stale price threshold
- agent onchain address mapping

Runtime readiness must expose:

- configured versus missing addresses
- mapped versus unmapped agents
- treasury mode: enabled, prepared-only, or not configured
- settlement amount conversion assumptions

Tests should cover:

- missing feed
- stale price
- wrong decimals
- unmapped agent
- treasury rejection before vendor dispatch
