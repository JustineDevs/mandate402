# Contract Deploy Checklist

Before contract-facing changes:

- identify target network: Morph Hoodi, Morph mainnet, or local
- confirm chain ID and explorer URL
- confirm constructor args
- confirm deployer key is env-only
- confirm ABI changes are mirrored to curated app ABI files

After changes:

- run `forge test` with repo-local cache/out envs
- run app tests if ABI-consuming TypeScript changed
- check `contracts/out`, `contracts/cache`, and `contracts/broadcast` are not staged
- update deployment docs only with public-safe metadata

Verification workflow:

- use `.github/workflows/verify-contract.yml` for manual explorer verification
- keep release metadata aligned with actual deployed addresses
