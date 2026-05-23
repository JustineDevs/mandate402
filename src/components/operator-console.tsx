"use client";

import { useState, useTransition } from "react";

import type { Mandate, PaymentAttempt, Vendor } from "@/lib/domain/types";

type OperatorConsoleProps = {
  accessToken: string;
  mandate: Mandate;
  onChanged: () => Promise<void>;
  attempts: PaymentAttempt[];
  vendors: Vendor[];
};

export function OperatorConsole({
  accessToken,
  mandate,
  onChanged,
  attempts,
  vendors,
}: OperatorConsoleProps) {
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
        authorization: `Bearer ${accessToken}`,
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
    <div className="form-grid mt-5">
      <div className="field">
        <p className="m-0 font-semibold text-charcoal">Operator session</p>
        <p className="m-0 text-sm text-steel">
          Authenticated operator session required. This console no longer
          accepts a shared token in the UI.
        </p>
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
                  className={`chip ${selected ? "opacity-100" : "opacity-55"}`}
                  key={vendor.id}
                  type="button"
                  onClick={() =>
                    setSelectedVendorIds((current) =>
                      current.includes(vendor.id)
                        ? current.filter((id) => id !== vendor.id)
                        : [...current, vendor.id],
                    )
                  }
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
                await onChanged();
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
                await onChanged();
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
                await onChanged();
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
                  await onChanged();
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
