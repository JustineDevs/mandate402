---
{
  "decision_status": "fallback_not_yet_allowed",
  "reviewed_at": "2026-05-15T13:10:00.000Z",
  "cutoff_date": "2026-05-21",
  "primary_targets": [
    {
      "name": "Morph Market Data",
      "vendor_type": "x402-paid HTTP API",
      "expected_capabilities": ["payment execution", "receipt evidence", "Morph-native positioning"],
      "integration_owner": "policy-payment-lane",
      "status": "env_path_ready_pending_live_validation"
    },
    {
      "name": "Morph Research Net",
      "vendor_type": "x402-paid HTTP API",
      "expected_capabilities": ["payment execution", "receipt evidence", "Morph-native positioning"],
      "integration_owner": "policy-payment-lane",
      "status": "env_path_ready_pending_live_validation"
    }
  ],
  "attempt_log": [
    {
      "target_name": "Morph Market Data",
      "attempted_at": "2026-05-15T13:10:00.000Z",
      "channel_or_endpoint": "http://localhost:8000/x402_demo/api/market-data",
      "result": "demo_local_vendor_ready",
      "blocker_type": "awaiting_third_party_vendor",
      "blocker_summary": "Local controlled x402 vendor is working; third-party live vendor replacement is still pending.",
      "evidence_ref": "README.md",
      "next_action": "Replace with a real third-party Morph-compatible x402 vendor when available."
    },
    {
      "target_name": "Morph Research Net",
      "attempted_at": "2026-05-15T13:10:00.000Z",
      "channel_or_endpoint": "http://localhost:8000/x402_demo/api/research",
      "result": "demo_local_vendor_ready",
      "blocker_type": "awaiting_third_party_vendor",
      "blocker_summary": "Local controlled x402 vendor is working; third-party live vendor replacement is still pending.",
      "evidence_ref": "README.md",
      "next_action": "Replace with a real third-party Morph-compatible x402 vendor when available."
    }
  ],
  "approval_rationale": "The local controlled x402 merchant provides a valid demo path while third-party vendor discovery remains open. Fallback wrappers remain governed and visible.",
  "review_owner": "ralph-execution-v1",
  "evidence_links": [
    "README.md",
    "RELEASE_CHECKLIST.md",
    ".github/workflows/api-smoke.yml"
  ]
}
---

# Mandate402 Fallback Gate

This tracked file is the canonical runtime fallback-governance artifact for the public repository.

- Primary vendor path remains preferred.
- Local controlled x402 vendors are allowed for demo and smoke coverage.
- Any move to a different fallback path must update this file in version control.
