"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockRegisterFacilitator } from "@/lib/mocks/governance";

export default function RegisterFacilitatorPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    endpoint: "",
    initialStakeUsd: "",
  });

  const handleSubmit = async (e: React.FormEvent, _operatorId: string) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const initialStakeCents = Math.round(
        Number.parseFloat(formData.initialStakeUsd) * 100,
      );

      await mockRegisterFacilitator({
        name: formData.name,
        address: formData.address,
        endpoint: formData.endpoint,
        initialStakeCents,
      });

      alert("Facilitator registration submitted to network.");
      router.push("/policy-registry/facilitators" as Route);
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to register facilitator.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OperatorGate
      title="Register facilitator"
      description="Add a new node to the authorized payment settlement network."
    >
      {({ data }) => {
        const { operator } = data;
        return (
          <ConsoleShell
            activeTab="Facilitators"
            eyebrow="Governance Control"
            title="Register New Facilitator"
            summary="Initialize a new facilitator node with an authorized address and required network stake."
            heroTone="control"
          >
            <form
              onSubmit={(e) => handleSubmit(e, operator.operatorId)}
              className="mx-auto max-w-2xl space-y-8 rounded-lg border border-hairline bg-canvas p-6 shadow-sm sm:p-8"
            >
              <SectionHeader
                title="Facilitator Configuration"
                description="Provide the technical and financial details for the new facilitator node."
              />

              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Facilitator Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Asia-Pacific Settlement Node"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">On-Chain Address</Label>
                  <Input
                    id="address"
                    placeholder="0x..."
                    className="font-mono"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">Facilitator Endpoint (URL)</Label>
                  <Input
                    id="endpoint"
                    type="url"
                    placeholder="https://..."
                    value={formData.endpoint}
                    onChange={(e) =>
                      setFormData({ ...formData, endpoint: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stake">Initial Stake (USD)</Label>
                  <Input
                    id="stake"
                    type="number"
                    placeholder="0.00"
                    value={formData.initialStakeUsd}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialStakeUsd: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-[11px] text-muted-foreground italic">
                    Note: Stake will be locked in the Mandate402 treasury on
                    Morph upon successful registration.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-hairline">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    router.push("/policy-registry/facilitators" as Route)
                  }
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-control text-white hover:bg-brand-control-deep font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registering..." : "Register Facilitator"}
                </Button>
              </div>
            </form>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
