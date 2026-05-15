"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Mandate, PaymentAttempt, Vendor } from "@/lib/domain/types";
import { DEMO_OPERATOR_TOKEN } from "@/lib/infrastructure/env";

type OperatorConsoleProps = {
  mandate: Mandate;
  attempts: PaymentAttempt[];
  vendors: Vendor[];
};

export function OperatorConsole({
  mandate,
  attempts,
  vendors,
}: OperatorConsoleProps) {
  const router = useRouter();
  const [token, setToken] = useState(DEMO_OPERATOR_TOKEN);
  const [mandateName, setMandateName] = useState("Fresh Research Mandate");
  const [agentName, setAgentName] = useState("Research Beta");
  const [budgetCapCents, setBudgetCapCents] = useState("3000");
  const [expiresAt, setExpiresAt] = useState("2026-05-21T12:00:00.000Z");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>(
    vendors
      .filter((vendor) => vendor.mode === "primary")
      .map((vendor) => vendor.id),
  );
  const [agentId] = useState(mandate.agentId);
  const [vendorId, setVendorId] = useState(
    mandate.approvedVendorIds[0] ?? vendors[0]?.id ?? "",
  );
  const [amountCents, setAmountCents] = useState("1200");
  const [message, setMessage] = useState("Ready.");
  const [isPending, startTransition] = useTransition();
  const latestUnknownAttempt = attempts.find(
    (attempt) =>
      attempt.mandateId === mandate.id &&
      attempt.status === "execution_unknown",
  );

  const call = async (url: string, init: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-operator-token": token,
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed with ${response.status}`);
    }

    return response.json();
  };

  return (
    <div className="form-grid" style={{ marginTop: 18 }}>
      <div className="field">
        <label htmlFor="operator-token">Operator token</label>
        <input
          id="operator-token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
        />
      </div>
      <div className="inline-grid">
        <div className="field">
          <label htmlFor="new-mandate-name">New mandate name</label>
          <input
            id="new-mandate-name"
            value={mandateName}
            onChange={(event) => setMandateName(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="agent-name">Agent name</label>
          <input
            id="agent-name"
            value={agentName}
            onChange={(event) => setAgentName(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="budget-cap-cents">Budget cap (cents)</label>
          <input
            id="budget-cap-cents"
            value={budgetCapCents}
            onChange={(event) => setBudgetCapCents(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="expiry-iso">Expiry ISO timestamp</label>
          <input
            id="expiry-iso"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="approved-primary-vendors">
          Approved primary vendors
        </label>
        <div className="chip-grid">
          {vendors
            .filter((vendor) => vendor.mode === "primary")
            .map((vendor) => {
              const selected = selectedVendorIds.includes(vendor.id);
              return (
                <button
                  className="chip"
                  key={vendor.id}
                  type="button"
                  onClick={() =>
                    setSelectedVendorIds((current) =>
                      current.includes(vendor.id)
                        ? current.filter((id) => id !== vendor.id)
                        : [...current, vendor.id],
                    )
                  }
                  style={{
                    opacity: selected ? 1 : 0.55,
                  }}
                >
                  {vendor.name}
                </button>
              );
            })}
        </div>
      </div>
      <div className="inline-grid">
        <div className="field">
          <label htmlFor="attempt-vendor">Vendor</label>
          <select
            id="attempt-vendor"
            value={vendorId}
            onChange={(event) => setVendorId(event.target.value)}
          >
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="attempt-amount-cents">Amount (cents)</label>
          <input
            id="attempt-amount-cents"
            value={amountCents}
            onChange={(event) => setAmountCents(event.target.value)}
          />
        </div>
      </div>
      <div className="actions">
        <button
          className="pill pill-primary"
          disabled={isPending}
          type="button"
          onClick={() =>
            startTransition(async () => {
              try {
                const result = await call("/api/mandates", {
                  method: "POST",
                  body: JSON.stringify({
                    name: mandateName,
                    agentId,
                    agentName,
                    budgetCapCents: Number(budgetCapCents),
                    expiresAt,
                    approvedVendorIds: selectedVendorIds,
                    requiresReceiptCapability: true,
                  }),
                });
                setMessage(`Mandate ${result.mandate.id} created.`);
                router.refresh();
              } catch (error) {
                setMessage(
                  error instanceof Error
                    ? error.message
                    : "Create mandate failed.",
                );
              }
            })
          }
        >
          Create Mandate
        </button>
        <button
          className="pill pill-secondary"
          disabled={isPending}
          type="button"
          onClick={() =>
            startTransition(async () => {
              try {
                const result = await call(
                  `/api/mandates/${mandate.id}/attempts`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      vendorId,
                      amountCents: Number(amountCents),
                    }),
                  },
                );
                setMessage(
                  `Attempt ${result.attempt.id}: ${result.attempt.financialOutcome}`,
                );
                router.refresh();
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Attempt failed.",
                );
              }
            })
          }
        >
          Run Attempt
        </button>
        <button
          className="pill pill-secondary"
          disabled={isPending}
          type="button"
          onClick={() =>
            startTransition(async () => {
              try {
                await call(`/api/mandates/${mandate.id}/revoke`, {
                  method: "POST",
                });
                setMessage("Mandate revoked.");
                router.refresh();
              } catch (error) {
                setMessage(
                  error instanceof Error ? error.message : "Revoke failed.",
                );
              }
            })
          }
        >
          Revoke
        </button>
        {latestUnknownAttempt ? (
          <button
            className="pill pill-secondary"
            disabled={isPending}
            type="button"
            onClick={() =>
              startTransition(async () => {
                try {
                  const result = await call(
                    `/api/mandates/${mandate.id}/attempts/${latestUnknownAttempt.id}/reconcile`,
                    {
                      method: "POST",
                      body: JSON.stringify({}),
                    },
                  );
                  setMessage(
                    `Attempt ${result.attempt.id} reconciled: ${result.attempt.financialOutcome}`,
                  );
                  router.refresh();
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Reconcile attempt failed.",
                  );
                }
              })
            }
          >
            Reconcile Unknown
          </button>
        ) : null}
      </div>
      <div className="footer-note">{message}</div>
    </div>
  );
}
