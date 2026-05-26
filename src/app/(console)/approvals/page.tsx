"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GroupedApproval } from "@/lib/domain/types";
import {
  executeApproval,
  getPendingApprovals,
  signApproval,
} from "@/lib/mocks/approvals";

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<GroupedApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      const data = await getPendingApprovals();
      setApprovals(data);
    } catch (error) {
      console.error("Failed to load approvals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string, operatorId: string) => {
    setActioningId(id);
    try {
      await signApproval(id, operatorId);
      await loadApprovals();
    } catch (error) {
      console.error("Failed to sign approval:", error);
      alert("Failed to sign. See console.");
    } finally {
      setActioningId(null);
    }
  };

  const handleExecute = async (id: string, operatorId: string) => {
    setActioningId(id);
    try {
      await executeApproval(id, operatorId);
      await loadApprovals();
      router.refresh();
    } catch (error) {
      console.error("Failed to execute action:", error);
      alert("Failed to execute. See console.");
    } finally {
      setActioningId(null);
    }
  };

  return (
    <OperatorGate
      title="Grouped approvals"
      description="Review and sign pending governed actions that require multi-operator consensus."
    >
      {({ data }) => {
        const { operator } = data;
        return (
          <ConsoleShell
            activeTab="Approvals"
            eyebrow="Consensus Queue"
            title="Grouped Approvals"
            summary="Multi-operator threshold control for high-value payments and policy modifications."
            heroTone="control"
            toolbar={
              <>
                <StatusPill label={`${approvals.length} Pending`} tone="info" />
                <StatusPill
                  label={`${approvals.filter((a) => a.status === "ready_to_execute").length} Ready`}
                  tone="success"
                />
              </>
            }
          >
            <div className="grid gap-6 lg:grid-cols-3">
              <ConsoleCard
                eyebrow="Consensus Required"
                value={String(approvals.length)}
              >
                These actions are currently blocked until the required operator
                signatures are collected.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="Threshold Status"
                value={`${approvals.filter((a) => a.status === "ready_to_execute").length} Ready`}
              >
                Actions that have met their signature threshold and are waiting
                for final execution dispatch.
              </ConsoleCard>
              <ConsoleCard
                eyebrow="My Active Tasks"
                value={String(
                  approvals.filter(
                    (a) => !a.signatures.includes(operator.operatorId),
                  ).length,
                )}
              >
                The number of pending actions that require your specific
                authorization signature.
              </ConsoleCard>
            </div>

            <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-lg border border-hairline bg-canvas p-6 shadow-sm">
                <SectionHeader
                  eyebrow="Approval Queue"
                  title="Pending governed actions"
                  description="Each row represents a blocked action that requires multi-sig consensus."
                />

                {isLoading ? (
                  <div className="py-20 text-center text-muted-foreground italic">
                    Loading consensus queue...
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {approvals.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            No pending approvals found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        approvals.map((approval) => {
                          const hasSigned = approval.signatures.includes(
                            operator.operatorId,
                          );
                          const isReady =
                            approval.status === "ready_to_execute";

                          return (
                            <TableRow key={approval.id}>
                              <TableCell>
                                <CategoryAccentChip
                                  lane={
                                    approval.actionType === "high_value_payment"
                                      ? "payments"
                                      : "governance"
                                  }
                                />
                              </TableCell>
                              <TableCell className="max-w-xs font-medium text-charcoal">
                                {approval.description}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold">
                                    {approval.signatures.length} /{" "}
                                    {approval.threshold}
                                  </span>
                                  <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-surface-soft">
                                    <div
                                      className="h-full bg-mandate-green transition-all"
                                      style={{
                                        width: `${Math.min(100, (approval.signatures.length / approval.threshold) * 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <StatusPill
                                  label={approval.status.replaceAll("_", " ")}
                                  tone={isReady ? "success" : "warning"}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {!hasSigned && !isReady && (
                                    <Button
                                      size="sm"
                                      className="bg-mandate-green text-xs font-bold text-white hover:bg-mandate-green-dark"
                                      onClick={() =>
                                        handleApprove(
                                          approval.id,
                                          operator.operatorId,
                                        )
                                      }
                                      disabled={!!actioningId}
                                    >
                                      {actioningId === approval.id
                                        ? "..."
                                        : "Approve"}
                                    </Button>
                                  )}
                                  {isReady && (
                                    <Button
                                      size="sm"
                                      className="bg-brand-control text-xs font-bold text-white hover:bg-brand-control-deep"
                                      onClick={() =>
                                        handleExecute(
                                          approval.id,
                                          operator.operatorId,
                                        )
                                      }
                                      disabled={!!actioningId}
                                    >
                                      {actioningId === approval.id
                                        ? "..."
                                        : "Execute"}
                                    </Button>
                                  )}
                                  {hasSigned && !isReady && (
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-steel italic">
                                      Signed
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              <ConsoleCodeSurface title="Consensus Rule Note">
                <div className="space-y-4 text-sm leading-7 text-on-dark-muted">
                  <p>
                    <strong className="text-on-dark">Governed Actions:</strong>{" "}
                    High-value transactions or policy changes are automatically
                    diverted here by the policy engine.
                  </p>
                  <p>
                    <strong className="text-on-dark">Thresholds:</strong> Each
                    action defines a required number of unique operator
                    signatures before it can be executed.
                  </p>
                  <p>
                    <strong className="text-on-dark">Fail-Closed:</strong>{" "}
                    Treasury funds remain locked and policy changes remain in
                    'Draft' state until consensus is achieved.
                  </p>
                  <div className="rounded border border-white/10 bg-white/5 p-3 text-xs italic">
                    Note: This interface is currently wired to a mock consensus
                    engine (V3-003 pending) but uses production-grade data
                    contracts.
                  </div>
                </div>
              </ConsoleCodeSurface>
            </section>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
