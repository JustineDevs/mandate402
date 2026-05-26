"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GovernanceFacilitator } from "@/lib/domain/types";
import { getMockFacilitators, mockProposeSlash } from "@/lib/mocks/governance";
import { formatUsd } from "@/lib/operator-view-model";

export default function FacilitatorsPage() {
  const [facilitators, setFacilitators] = useState<GovernanceFacilitator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFacilitator, setSelectedFacilitator] =
    useState<GovernanceFacilitator | null>(null);
  const [slashFormData, setSlashFormData] = useState({
    reason: "",
    evidenceLink: "",
    penaltyUsd: "",
  });

  useEffect(() => {
    loadFacilitators();
  }, []);

  const loadFacilitators = async () => {
    setIsLoading(true);
    try {
      const data = await getMockFacilitators();
      setFacilitators(data);
    } catch (error) {
      console.error("Failed to load facilitators:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposeSlash = async (_operatorId: string) => {
    if (!selectedFacilitator) return;
    setIsSubmitting(true);
    try {
      await mockProposeSlash({
        facilitatorAddress: selectedFacilitator.address,
        reason: slashFormData.reason,
        evidenceLink: slashFormData.evidenceLink,
        penaltyCents: Math.round(
          Number.parseFloat(slashFormData.penaltyUsd) * 100,
        ),
      });
      alert("Slashing proposal submitted to governance queue.");
      setSelectedFacilitator(null);
    } catch (error) {
      console.error("Failed to submit proposal:", error);
      alert("Failed to submit. See console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OperatorGate
      title="Facilitator governance"
      description="Manage the network of payment facilitators and propose governance actions."
    >
      {({ data }) => {
        const { operator } = data;
        return (
          <ConsoleShell
            activeTab="Facilitators"
            eyebrow="Governance Control"
            title="Facilitator Registry"
            summary="Register new facilitators or propose penalties for malicious network behavior."
            heroTone="control"
            actions={
              <Link href={"/policy-registry/facilitators/register" as Route}>
                <Button className="rounded-full bg-white font-bold text-brand-control hover:bg-white/90">
                  Register Facilitator
                </Button>
              </Link>
            }
          >
            <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
              <SectionHeader
                eyebrow="Active Network"
                title="Verified Facilitators"
                description="The list of nodes authorized to verify and settle x402 machine payments."
              />

              {isLoading ? (
                <div className="py-20 text-center text-muted-foreground italic">
                  Loading facilitator registry...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facilitator</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Total Stake</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilitators.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-bold text-charcoal">
                          {f.name}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {f.address.slice(0, 10)}...{f.address.slice(-8)}
                        </TableCell>
                        <TableCell>{formatUsd(f.stakeCents)}</TableCell>
                        <TableCell>
                          <StatusPill
                            label={f.status}
                            tone={f.status === "active" ? "success" : "danger"}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog
                            open={selectedFacilitator?.id === f.id}
                            onOpenChange={(open) =>
                              !open && setSelectedFacilitator(null)
                            }
                          >
                            <DialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                                  onClick={() => setSelectedFacilitator(f)}
                                >
                                  Propose Slash
                                </Button>
                              }
                            />
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Propose Slashing</DialogTitle>
                                <DialogDescription>
                                  Initiate a governance proposal to penalize{" "}
                                  {f.name} for protocol violations.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="reason">
                                    Violation Reason
                                  </Label>
                                  <Input
                                    id="reason"
                                    placeholder="e.g. Double spending signature"
                                    value={slashFormData.reason}
                                    onChange={(e) =>
                                      setSlashFormData({
                                        ...slashFormData,
                                        reason: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="evidence">
                                    Evidence Link (IPFS/URL)
                                  </Label>
                                  <Input
                                    id="evidence"
                                    placeholder="https://..."
                                    value={slashFormData.evidenceLink}
                                    onChange={(e) =>
                                      setSlashFormData({
                                        ...slashFormData,
                                        evidenceLink: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="penalty">
                                    Penalty Amount (USD)
                                  </Label>
                                  <Input
                                    id="penalty"
                                    type="number"
                                    placeholder="1000.00"
                                    value={slashFormData.penaltyUsd}
                                    onChange={(e) =>
                                      setSlashFormData({
                                        ...slashFormData,
                                        penaltyUsd: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedFacilitator(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  className="bg-red-600 text-white hover:bg-red-700 font-bold"
                                  onClick={() =>
                                    handleProposeSlash(operator.operatorId)
                                  }
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting
                                    ? "Submitting..."
                                    : "Submit Proposal"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <div className="mt-8 rounded-lg border border-hairline bg-surface-soft p-6">
              <p className="text-xs font-bold text-charcoal mb-2 uppercase tracking-widest">
                Governance Boundary Note
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                John (Transactional UI) owns the registration and slashing
                actions above. Edward (Observability UI) will later implement
                the real-time risk scoring, historical up-time metrics, and
                detailed stake-slashing ledgers.
              </p>
            </div>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
