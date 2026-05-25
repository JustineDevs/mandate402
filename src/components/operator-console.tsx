"use client";

import { useState, useTransition } from "react";

import type {
  Agent,
  Mandate,
  PaymentAttempt,
  Vendor,
} from "@/lib/domain/types";

type OperatorConsoleProps = {
  accessToken: string;
  agents: Agent[];
  mandates: Mandate[];
  onChanged: () => Promise<void>;
  attempts: PaymentAttempt[];
  vendors: Vendor[];
};

export function OperatorConsole({
  accessToken,
  agents,
  mandates,
  onChanged,
  attempts,
  vendors,
}: OperatorConsoleProps) {
  const activeMandates = mandates.filter(
    (entry) =>
      entry.status === "issued_active" || entry.status === "issued_reserved",
  );
  const selectableAgents = agents.filter((entry) => entry.status === "active");
  const primaryVendors = vendors.filter((vendor) => vendor.mode === "primary");
  const [selectedMandateId, setSelectedMandateId] = useState(
    activeMandates[0]?.id ?? "",
  );
  const selectedMandate =
    activeMandates.find((entry) => entry.id === selectedMandateId) ?? null;
  const allowedAttemptVendors = selectedMandate
    ? primaryVendors.filter((vendor) =>
        selectedMandate.approvedVendorIds.includes(vendor.id),
      )
    : [];
  const [selectedAgentId, setSelectedAgentId] = useState(
    selectableAgents[0]?.id ?? "",
  );
  const [mandateName, setMandateName] = useState("Fresh Research Mandate");
  const [budgetCapCents, setBudgetCapCents] = useState("3000");
  const [expiresAt, setExpiresAt] = useState("2026-05-21T12:00:00.000Z");
  const [selectedVendorIds, setSelectedVendorIds] = useState<string[]>(
    primaryVendors.map((vendor) => vendor.id),
  );
  const [vendorId, setVendorId] = useState(allowedAttemptVendors[0]?.id ?? "");
  const [amountCents, setAmountCents] = useState("1200");
  const [message, setMessage] = useState("Ready.");
  const [isPending, startTransition] = useTransition();
  const latestUnknownAttempt = attempts.find(
    (attempt) =>
      attempt.mandateId === selectedMandateId &&
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

  const createMandateDisabled =
    isPending ||
    !selectedAgentId ||
    !mandateName.trim() ||
    selectedVendorIds.length === 0;
  const attemptActionDisabled =
    isPending || !selectedMandate || !vendorId || !amountCents.trim();

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
          <label htmlFor="agent-id">Assigned agent</label>
          <select
            id="agent-id"
            value={selectedAgentId}
            onChange={(event) => setSelectedAgentId(event.target.value)}
          >
            {selectableAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
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
          {primaryVendors.map((vendor) => {
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
      <div className="field">
        <p className="m-0 font-semibold text-charcoal">Mandate actions</p>
        <p className="m-0 text-sm text-steel">
          Select an active mandate to run a payment attempt, reconcile an
          unresolved attempt, or revoke authority.
        </p>
      </div>
      <div className="inline-grid">
        <div className="field">
          <label htmlFor="selected-mandate">Active mandate</label>
          <select
            id="selected-mandate"
            value={selectedMandateId}
            onChange={(event) => setSelectedMandateId(event.target.value)}
          >
            {activeMandates.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="attempt-vendor">Vendor</label>
          <select
            id="attempt-vendor"
            value={vendorId}
            onChange={(event) => setVendorId(event.target.value)}
            disabled={!selectedMandate}
          >
            {allowedAttemptVendors.map((vendor) => (
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
          disabled={createMandateDisabled}
          type="button"
          onClick={() =>
            startTransition(async () => {
              try {
                const selectedAgent = selectableAgents.find(
                  (agent) => agent.id === selectedAgentId,
                );
                if (!selectedAgent) {
                  throw new Error(
                    "Select an active agent before issuing a mandate.",
                  );
                }
                const result = await call("/api/mandates", {
                  method: "POST",
                  body: JSON.stringify({
                    name: mandateName,
                    agentId: selectedAgent.id,
                    agentName: selectedAgent.name,
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
          disabled={attemptActionDisabled}
          type="button"
          onClick={() =>
            startTransition(async () => {
              try {
                if (!selectedMandate) {
                  throw new Error(
                    "Select an active mandate before running an attempt.",
                  );
                }
                const result = await call(
                  `/api/mandates/${selectedMandate.id}/attempts`,
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
          disabled={isPending || !selectedMandate}
          type="button"
          onClick={() =>
            startTransition(async () => {
              try {
                if (!selectedMandate) {
                  throw new Error("Select an active mandate before revoking.");
                }
                await call(`/api/mandates/${selectedMandate.id}/revoke`, {
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
            disabled={isPending || !selectedMandate}
            type="button"
            onClick={() =>
              startTransition(async () => {
                try {
                  if (!selectedMandate) {
                    throw new Error(
                      "Select an active mandate before reconciling.",
                    );
                  }
                  const result = await call(
                    `/api/mandates/${selectedMandate.id}/attempts/${latestUnknownAttempt.id}/reconcile`,
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
