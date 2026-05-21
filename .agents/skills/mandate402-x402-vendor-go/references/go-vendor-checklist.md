# Go Vendor Checklist

Routes:

- `POST /x402_vendor/api/market-data`
- `POST /x402_vendor/api/research`
- `POST /x402_vendor/api/market-data/status`
- `POST /x402_vendor/api/research/status`

Config:

- facilitator URL
- Morph x402 access key
- Morph x402 secret key
- chain ID
- settlement asset details
- upstream provider key

Rules:

- provider behavior must be explicit
- slow route behavior may produce unknown execution, but must remain correlatable
- paid route response shape should remain stable for receipts
- status routes should not require caller-supplied final truth
