"use client";

import type { Route } from "next";
import { useParams } from "next/navigation";
import type React from "react";
import { useMemo, useState } from "react";

import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCodeSurface } from "@/components/console-card";
import type { GlobalSearchItem } from "@/components/global-search";
import {
  InlinePopover,
  OverlayDrawer,
  OverlayModal,
} from "@/components/overlay-primitives";
import { Sidebar } from "@/components/sidebar";
import { TopNav } from "@/components/top-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { brandHex } from "@/lib/brand-inline-colors";
import type { Activity, MandateStatus, TransactionStatus } from "@/lib/types";

interface MandateDetailViewProps {
  mandate?: {
    id: string;
    name: string;
    approvedVendors: string[];
    categories: string[];
    softLimit: string | number;
    status: MandateStatus;
    agent: string;
    budgetUsed: string | number;
    budgetTotal: string | number;
    expiresIn: string;
  };
  activities?: Activity[];
  isLoading?: boolean;
  onPause?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRevoke?: (id: string) => void;
  onExportCsv?: () => void;
  onExportPdf?: () => void;
}

const transactionStatusColorMap: Record<TransactionStatus, string> = {
  Success: brandHex.mandateGreen,
  Blocked: brandHex.semanticBlockedText,
};

const defaultActivities: Activity[] = [
  {
    id: "a1",
    time: "10:12",
    desc: "Attempt queued for OpenAI API",
    amount: "$12",
    status: "Success",
    lane: "payments",
  },
  {
    id: "a2",
    time: "10:14",
    desc: "Vendor allowlist gate — Vendor X blocked",
    amount: "$0",
    status: "Blocked",
    lane: "governance",
  },
  {
    id: "a3",
    time: "10:18",
    desc: "Agent Alpha dispatch lease renewed",
    amount: "—",
    status: "Success",
    lane: "agents",
  },
];

/** Mandate detail layout with timeline, destructive flows, and breadcrumbs. */
export const MandateDetailView: React.FC<MandateDetailViewProps> = ({
  mandate = {
    id: "m1",
    name: "Procurement - Market Research",
    approvedVendors: ["OpenAI API", "Tavily", "Perplexity API"],
    categories: ["Data / Research", "AI APIs"],
    softLimit: 20,
    status: "Active",
    agent: "Agent Alpha",
    budgetUsed: 18,
    budgetTotal: 50,
    expiresIn: "2 days",
  },
  activities,
  isLoading,
  onPause,
  onEdit,
  onRevoke,
  onExportCsv,
  onExportPdf,
}) => {
  const params = useParams();
  const routeId = typeof params?.id === "string" ? params.id : mandate.id;

  const resolvedMandate = useMemo(
    () => ({ ...mandate, id: routeId }),
    [mandate, routeId],
  );

  const activityRows = activities?.length ? activities : defaultActivities;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [rotateKeysOpen, setRotateKeysOpen] = useState(false);
  const [bulkReviewOpen, setBulkReviewOpen] = useState(false);
  const [exportBundleOpen, setExportBundleOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [showExportNotes, setShowExportNotes] = useState(false);

  const searchExtraItems: GlobalSearchItem[] = useMemo(
    () => [
      {
        id: `mandate-${resolvedMandate.id}`,
        label: `Mandate ${resolvedMandate.id}`,
        description: resolvedMandate.name,
        href: `/mandates/${resolvedMandate.id}` as Route,
        keywords: [resolvedMandate.id, resolvedMandate.name, "detail"],
      },
    ],
    [resolvedMandate.id, resolvedMandate.name],
  );

  return (
    <div className="relative flex min-h-screen bg-surface">
      <Sidebar activeTab="Mandates" />

      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col p-3 pb-36 sm:p-4 md:ml-72 md:p-10">
        <TopNav searchExtraItems={searchExtraItems} />

        <main className="mx-auto w-full max-w-5xl pb-32">
          <div className="mb-6">
            <AppBreadcrumbs
              items={[
                { label: "Operator", href: "/operator" },
                { label: "Mandates", href: "/mandates" },
                { label: resolvedMandate.id },
              ]}
            />
          </div>

          <Tabs defaultValue="snapshot" className="w-full">
            <TabsList variant="line" className="mb-6 w-full sm:w-auto">
              <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="snapshot" className="w-full">
              <section
                className={`mb-10 overflow-hidden rounded-lg border border-hairline bg-canvas shadow-sm ${isLoading ? "animate-pulse" : ""}`}
              >
                <div className="p-5 sm:p-8">
                  <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-mandate-green-dark">
                        Mandate Detail
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-charcoal sm:text-2xl">
                        Mandate: {resolvedMandate.name}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => onPause?.(resolvedMandate.id)}
                        className="min-h-11 rounded-full border border-hairline-strong bg-canvas px-4 py-2 text-sm font-bold text-charcoal transition-colors hover:bg-surface-soft sm:px-5"
                      >
                        Pause
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onEdit?.(resolvedMandate.id);
                          setIsEditOpen(true);
                        }}
                        className="min-h-11 rounded-full border border-hairline-strong bg-canvas px-4 py-2 text-sm font-bold text-charcoal transition-colors hover:bg-surface-soft sm:px-5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setRotateKeysOpen(true)}
                        className="min-h-11 rounded-full border border-brand-control/40 bg-surface-soft px-4 py-2 text-sm font-bold text-brand-control transition-colors hover:bg-surface sm:px-5"
                      >
                        Rotate keys
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkReviewOpen(true)}
                        className="min-h-11 rounded-full border border-hairline-strong bg-canvas px-4 py-2 text-sm font-bold text-charcoal transition-colors hover:bg-surface-soft sm:px-5"
                      >
                        Bulk actions
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRevokeOpen(true)}
                        className="flex min-h-11 items-center gap-2 rounded-full border border-accent-compliance/45 bg-semantic-blocked-bg px-4 py-2 text-sm font-bold text-semantic-blocked-text transition-colors hover:opacity-90 sm:px-5"
                      >
                        <span className="text-xs" aria-hidden="true">
                          ✕
                        </span>
                        Revoke
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
                    <ConsoleCodeSurface
                      title="Mandate summary"
                      className="h-auto min-h-[8rem] shrink-0 lg:w-48"
                    >
                      <div className="text-center text-[11px] font-bold uppercase tracking-wider text-on-dark-muted">
                        ID · {resolvedMandate.id}
                      </div>
                    </ConsoleCodeSurface>

                    <div className="grid min-w-0 flex-1 grid-cols-1 gap-y-4 sm:grid-cols-[minmax(0,10rem)_1fr]">
                      <span className="text-sm font-medium text-steel">
                        Mandate Name
                      </span>
                      <span className="font-bold text-charcoal">
                        {resolvedMandate.name}
                      </span>

                      <span className="text-sm font-medium text-steel">
                        Approved vendors
                      </span>
                      <span className="font-bold text-charcoal">
                        {resolvedMandate.approvedVendors.join(", ")}
                      </span>

                      <span className="text-sm font-medium text-steel">
                        Categories
                      </span>
                      <span className="flex flex-wrap gap-2 font-bold text-charcoal">
                        {resolvedMandate.categories.map((c) => (
                          <CategoryAccentChip
                            key={c}
                            lane="governance"
                            label={c}
                          />
                        ))}
                      </span>

                      <span className="text-sm font-medium text-steel">
                        Per-payment soft limit
                      </span>
                      <span className="font-bold text-charcoal">
                        ${resolvedMandate.softLimit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-hairline bg-surface/30 md:grid-cols-4">
                  <div className="flex flex-col gap-1 border-b border-hairline px-4 py-3 md:border-b-0 md:border-r md:px-6 md:py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-steel">
                      Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${resolvedMandate.status === "Active" ? "bg-mandate-green" : "bg-accent-compliance"}`}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-bold text-charcoal">
                        {resolvedMandate.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-hairline px-4 py-3 md:border-b-0 md:border-r md:px-6 md:py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-steel">
                      Agent
                    </span>
                    <span className="text-sm font-bold text-charcoal">
                      {resolvedMandate.agent}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 border-r border-hairline px-4 py-3 md:px-6 md:py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-steel">
                      Budget Used
                    </span>
                    <span className="text-sm font-bold text-charcoal">
                      ${resolvedMandate.budgetUsed} / $
                      {resolvedMandate.budgetTotal}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 px-4 py-3 md:px-6 md:py-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-steel">
                      Expires
                    </span>
                    <span className="text-sm font-bold text-charcoal">
                      {resolvedMandate.expiresIn}
                    </span>
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="activity" className="w-full space-y-6">
              <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-charcoal sm:text-xl">
                  Activity Timeline
                </h3>
                <div className="flex flex-wrap gap-2">
                  <CategoryAccentChip lane="governance" />
                  <CategoryAccentChip lane="payments" />
                  <CategoryAccentChip lane="compliance" />
                  <CategoryAccentChip lane="agents" />
                </div>
              </div>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg
                      className="h-4 w-4 text-stone"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search activities…"
                    className="w-full rounded-lg border border-hairline bg-canvas py-2.5 pl-9 pr-4 text-sm text-charcoal focus:outline-none sm:pl-10"
                    aria-label="Search activities"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-hairline bg-canvas shadow-sm">
                <div className="divide-y divide-hairline">
                  {activityRows.length === 0 ? (
                    <div className="p-10 text-center text-sm text-steel italic">
                      No activity recorded for this mandate.
                    </div>
                  ) : (
                    activityRows.map((item) => (
                      <div
                        key={item.id}
                        className="group flex flex-col gap-3 p-4 transition-colors hover:bg-surface-soft sm:flex-row sm:items-center sm:justify-between sm:p-5"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                          <span className="w-16 shrink-0 text-sm font-medium text-steel">
                            {item.time}
                          </span>
                          <span className="min-w-0 text-sm font-bold text-charcoal">
                            {item.desc}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                          {item.lane ? (
                            <CategoryAccentChip lane={item.lane} />
                          ) : null}
                          <span className="text-sm font-bold text-charcoal">
                            {item.amount}
                          </span>
                          <div className="flex items-center gap-2 rounded-full bg-surface-soft px-3 py-1">
                            <div
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                backgroundColor:
                                  transactionStatusColorMap[item.status],
                              }}
                              aria-hidden="true"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-tight text-slate">
                              {item.status}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedReason(
                                item.status === "Blocked"
                                  ? "Vendor X is not allowlisted for this mandate. No treasury value left the system, and the blocked reason should remain operator-visible."
                                  : "This activity completed successfully and retained its receipt and audit trace.",
                              )
                            }
                            className="text-stone group-hover:text-steel"
                            aria-label="Transaction details"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {selectedReason ? (
                <section className="mt-6">
                  <InlinePopover title="Policy Blocked" body={selectedReason} />
                </section>
              ) : null}
            </TabsContent>
          </Tabs>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-hairline-dark bg-canvas-dark p-4 shadow-[0_-8px_30px_rgba(15,23,32,0.18)] sm:p-6 md:left-72">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
              <div>
                <h4 className="mb-1 text-sm font-bold text-on-dark">
                  Receipts
                </h4>
                <p className="text-xs font-medium text-on-dark-muted">
                  2/11 Selected
                </p>
              </div>
              <div
                className="flex flex-wrap gap-2"
                aria-label="Selected receipts"
              >
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-on-dark/15 bg-on-dark/10 px-3 py-2 text-xs font-bold text-on-dark transition-colors hover:bg-on-dark/15 sm:px-4 sm:text-sm"
                >
                  Receipt #1842
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-lg border border-on-dark/15 bg-on-dark/10 px-3 py-2 text-xs font-bold text-on-dark transition-colors hover:bg-on-dark/15 sm:px-4 sm:text-sm"
                >
                  Receipt #1843
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setExportBundleOpen(true)}
                className="rounded-lg border border-on-dark/35 bg-transparent px-4 py-2 text-xs font-bold text-on-dark transition-colors hover:bg-on-dark/10 sm:px-6 sm:text-sm"
              >
                Export bundle
              </button>
              <button
                type="button"
                onClick={onExportCsv}
                className="rounded-lg border border-on-dark/35 bg-transparent px-4 py-2 text-xs font-bold text-on-dark transition-colors hover:bg-on-dark/10 sm:px-6 sm:text-sm"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportPdf?.();
                  setShowExportNotes((current) => !current);
                }}
                className="rounded-lg border border-on-dark/35 bg-transparent px-4 py-2 text-xs font-bold text-on-dark transition-colors hover:bg-on-dark/10 sm:px-6 sm:text-sm"
              >
                Export PDF
              </button>
            </div>
          </div>
        </footer>

        <OverlayDrawer
          title="Edit Mandate"
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-hairline p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-steel">
                Approved Vendors
              </div>
              <p className="mt-2 text-sm leading-7 text-slate">
                Preserve explicit vendor naming and do not widen authority
                without a visible operator edit.
              </p>
            </div>
            <div className="grid gap-3">
              {resolvedMandate.approvedVendors.map((vendor) => (
                <label
                  key={vendor}
                  className="flex items-center justify-between rounded-lg border border-hairline px-4 py-3 text-sm text-charcoal"
                >
                  <span>{vendor}</span>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </label>
              ))}
            </div>
          </div>
        </OverlayDrawer>

        <OverlayModal
          variant="danger"
          eyebrowLabel="Revoke authority"
          title="Revoke Mandate"
          description="This action immediately removes spend authority from the selected mandate and records a revoke event."
          open={isRevokeOpen}
          onClose={() => setIsRevokeOpen(false)}
        >
          <div className="space-y-6">
            <div className="rounded-lg border border-semantic-blocked-text/20 bg-semantic-blocked-bg p-4 text-sm leading-7 text-semantic-blocked-text">
              Impact: queued and future attempts are blocked while prior audit
              and receipt history remains visible.
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRevokeOpen(false)}
                className="rounded-full border border-hairline px-5 py-3 text-sm font-bold text-slate"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRevoke?.(resolvedMandate.id);
                  setIsRevokeOpen(false);
                }}
                className="rounded-full bg-semantic-blocked-text px-5 py-3 text-sm font-bold text-canvas"
              >
                Revoke Mandate
              </button>
            </div>
          </div>
        </OverlayModal>

        <OverlayModal
          variant="danger"
          eyebrowLabel="Signing material"
          title="Rotate signing keys"
          description="Rotates worker-facing signing material. In-flight attempts may fail closed until new credentials propagate."
          open={rotateKeysOpen}
          onClose={() => setRotateKeysOpen(false)}
        >
          <div className="space-y-6">
            <div className="rounded-lg border border-accent-compliance/25 bg-semantic-blocked-bg/80 p-4 text-sm leading-7 text-semantic-blocked-text">
              Coordinate with security before rotating in production. Downstream
              vendors must trust the new key material.
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setRotateKeysOpen(false)}
                className="rounded-full border border-hairline px-5 py-3 text-sm font-bold text-slate"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setRotateKeysOpen(false)}
                className="rounded-full bg-accent-compliance px-5 py-3 text-sm font-bold text-canvas"
              >
                Confirm rotation
              </button>
            </div>
          </div>
        </OverlayModal>

        <OverlayModal
          variant="default"
          eyebrowLabel="Bulk selection"
          title="Bulk operator actions"
          description="Apply a single audited action to every selected receipt row in this mandate."
          open={bulkReviewOpen}
          onClose={() => setBulkReviewOpen(false)}
        >
          <div className="space-y-4">
            <ul className="list-inside list-disc text-sm text-slate">
              <li>Mark selected receipts as reviewed (audit only).</li>
              <li>Re-queue export jobs for stale bundles.</li>
              <li>
                Detach invalid receipt links (does not change financial truth).
              </li>
            </ul>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setBulkReviewOpen(false)}
                className="rounded-full border border-hairline px-5 py-3 text-sm font-bold text-slate"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setBulkReviewOpen(false)}
                className="rounded-full bg-mandate-green px-5 py-3 text-sm font-bold text-canvas"
              >
                Apply to selection
              </button>
            </div>
          </div>
        </OverlayModal>

        <OverlayModal
          variant="panel"
          eyebrowLabel="Signed export"
          title="Export signed receipt bundle"
          description="Produces a cryptographically signed archive for compliance handoff. Does not mutate ledger state."
          open={exportBundleOpen}
          onClose={() => setExportBundleOpen(false)}
        >
          <div className="space-y-4">
            <ConsoleCodeSurface title="Manifest preview">
              <pre className="whitespace-pre-wrap text-xs leading-6 text-on-dark-muted">{`bundle_id: bnd_9f2a…
receipts: 2
mandate: ${resolvedMandate.id}
signed_by: mandate402-export-key-v1`}</pre>
            </ConsoleCodeSurface>
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setExportBundleOpen(false)}
                className="rounded-full border border-hairline px-5 py-3 text-sm font-bold text-slate"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setExportBundleOpen(false)}
                className="rounded-full bg-brand-control px-5 py-3 text-sm font-bold text-canvas"
              >
                Start export
              </button>
            </div>
          </div>
        </OverlayModal>

        {showExportNotes ? (
          <div className="fixed bottom-28 right-3 z-[105] w-[min(380px,calc(100%-1.5rem))] sm:right-10">
            <InlinePopover
              title="Export Options"
              body="Use CSV for ledger review and PDF for operator-facing receipt bundles. Export should not imply final settlement truth on its own."
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
