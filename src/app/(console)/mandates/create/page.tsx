"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  agentIdentityLabel,
  agentIdentityTone,
  formatAgentChain,
  formatAgentWalletProvider,
  formatShortAddress,
  isAgentOnchainIdentityVerified,
} from "@/lib/agent-identity-view";

export default function CreateMandatePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    agentId: "",
    budgetCapUsd: "",
    expiresAtDate: "",
    expiresAtTime: "23:59",
    approvedVendorIds: [] as string[],
    requiresReceiptCapability: true,
  });

  const handleSubmit = async (e: React.FormEvent, token: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const budgetCapCents = Math.round(
        Number.parseFloat(formData.budgetCapUsd) * 100,
      );
      const expiresAt = new Date(
        `${formData.expiresAtDate}T${formData.expiresAtTime}:00Z`,
      ).toISOString();

      const response = await fetch("/api/mandates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          agentId: formData.agentId,
          budgetCapCents,
          expiresAt,
          approvedVendorIds: formData.approvedVendorIds,
          requiresReceiptCapability: formData.requiresReceiptCapability,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create mandate");
      }

      router.push("/mandates");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleVendor = (vendorId: string) => {
    setFormData((prev) => ({
      ...prev,
      approvedVendorIds: prev.approvedVendorIds.includes(vendorId)
        ? prev.approvedVendorIds.filter((id) => id !== vendorId)
        : [...prev.approvedVendorIds, vendorId],
    }));
  };

  return (
    <OperatorGate
      title="Sign in to create a mandate"
      description="Issue a new spending mandate for an agent."
    >
      {({ data, accessToken }) => {
        const activeAgents = data.dashboard.agents.filter(
          (agent) => agent.status === "active",
        );
        const selectedAgent =
          activeAgents.find((agent) => agent.id === formData.agentId) ?? null;
        const treasuryEnforcementEnabled =
          data.dashboard.systemStatus.blockchain.treasuryEnforcementMode ===
          "enabled";
        const selectedAgentVerified = selectedAgent
          ? isAgentOnchainIdentityVerified(selectedAgent)
          : false;

        return (
          <ConsoleShell
            activeTab="Mandates"
            eyebrow="Mandates"
            title="Create mandate"
            summary="Set scope, budget, vendors, and expiry for a new mandate."
          >
            <form
              onSubmit={(e) => handleSubmit(e, accessToken)}
              className="w-full space-y-8 rounded-lg border border-hairline bg-canvas p-6 shadow-sm sm:p-8"
            >
              <SectionHeader
                title="Configuration"
                description="Spending limits and policy rules for this mandate."
              />

              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Mandate Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Procurement - Market Research"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentId">Assigned Agent</Label>
                  <select
                    id="agentId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.agentId}
                    onChange={(e) =>
                      setFormData({ ...formData, agentId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select an agent</option>
                    {activeAgents.map((agent) => (
                      <option
                        key={agent.id}
                        value={agent.id}
                        disabled={
                          treasuryEnforcementEnabled &&
                          !isAgentOnchainIdentityVerified(agent)
                        }
                      >
                        {agent.name} ({agent.id}) -{" "}
                        {isAgentOnchainIdentityVerified(agent)
                          ? "treasury verified"
                          : "identity unmapped"}
                      </option>
                    ))}
                  </select>
                  {selectedAgent ? (
                    <div className="rounded-md border border-hairline bg-surface-soft p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill
                          label={agentIdentityLabel(selectedAgent)}
                          tone={agentIdentityTone(selectedAgent)}
                        />
                        <span className="text-sm font-semibold text-charcoal">
                          {formatAgentWalletProvider(selectedAgent)}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 text-xs text-steel sm:grid-cols-2">
                        <span>
                          Address:{" "}
                          {formatShortAddress(selectedAgent.onchainAddress)}
                        </span>
                        <span>Chain: {formatAgentChain(selectedAgent)}</span>
                      </div>
                      {treasuryEnforcementEnabled && !selectedAgentVerified ? (
                        <p className="mt-3 text-sm leading-relaxed text-semantic-warning-text">
                          Treasury enforcement is enabled. Bind and verify this
                          agent&apos;s on-chain identity before issuing a
                          production spend mandate.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-steel">
                      Agent rows come from the live runtime store. If this list
                      is empty, seed the production agent registry before
                      issuing mandates.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budgetCapUsd">Max Spend (USD)</Label>
                    <Input
                      id="budgetCapUsd"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.budgetCapUsd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetCapUsd: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiresAtDate">Expiry Date</Label>
                    <Input
                      id="expiresAtDate"
                      type="date"
                      value={formData.expiresAtDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiresAtDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allowed Vendors</Label>
                  <div className="grid grid-cols-1 gap-2 rounded-md border border-hairline p-4 sm:grid-cols-2">
                    {data.dashboard.vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`vendor-${vendor.id}`}
                          checked={formData.approvedVendorIds.includes(
                            vendor.id,
                          )}
                          onChange={() => toggleVendor(vendor.id)}
                          className="h-4 w-4 rounded border-gray-300 text-mandate-green focus:ring-mandate-green"
                        />
                        <label
                          htmlFor={`vendor-${vendor.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-opacity-70"
                        >
                          {vendor.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <input
                    type="checkbox"
                    id="requiresReceipt"
                    checked={formData.requiresReceiptCapability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requiresReceiptCapability: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-mandate-green focus:ring-mandate-green"
                  />
                  <Label htmlFor="requiresReceipt">
                    Require receipt for all attempts
                  </Label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-hairline">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/mandates")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-mandate-green text-white hover:bg-mandate-green-dark"
                  disabled={
                    isSubmitting ||
                    (treasuryEnforcementEnabled &&
                      selectedAgent !== null &&
                      !selectedAgentVerified)
                  }
                >
                  {isSubmitting ? "Creating..." : "Create Mandate"}
                </Button>
              </div>
            </form>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
