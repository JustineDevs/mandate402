"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      title="Create mandate"
      description="Issue a new spending mandate to an autonomous agent."
    >
      {({ data, accessToken }) => {
        return (
          <ConsoleShell
            activeTab="Mandates"
            eyebrow="Mandate Registry"
            title="Create New Mandate"
            summary="Define the scope, budget, and vendors for a new agent spending lane."
          >
            <form
              onSubmit={(e) => handleSubmit(e, accessToken)}
              className="mx-auto max-w-2xl space-y-8 rounded-lg border border-hairline bg-canvas p-6 shadow-sm sm:p-8"
            >
              <SectionHeader
                title="Mandate Configuration"
                description="Configure the spending limits and policy rules for this mandate."
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
                    {data.dashboard.agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} ({agent.id})
                      </option>
                    ))}
                  </select>
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
                  disabled={isSubmitting}
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
