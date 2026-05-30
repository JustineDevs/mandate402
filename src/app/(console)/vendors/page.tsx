"use client";

import { CategoryAccentChip } from "@/components/category-accent";
import {
  ConsoleCard,
  ConsoleCodeSurface,
  ConsolePanel,
} from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { consoleSplitSection, consoleStatGrid3 } from "@/lib/console-layout";
import { fallbackGateTone } from "@/lib/operator-display-labels";
import { formatVendorMode, vendorStatusTone } from "@/lib/operator-view-model";

export default function VendorsPage() {
  return (
    <OperatorGate
      title="Sign in to view vendors"
      description="Open the vendor registry."
    >
      {({ data }) => (
        <ConsoleShell
          activeTab="Vendors"
          eyebrow="Vendors"
          title="Vendor registry"
          summary="Named endpoints with mode, fallback posture, and receipt support."
          toolbar={
            <>
              <StatusPill
                label={data.dashboard.fallbackGate.decision_status}
                tone={fallbackGateTone(
                  data.dashboard.fallbackGate.decision_status,
                )}
              />
              <StatusPill
                label={`${data.dashboard.vendors.filter((vendor) => vendor.mode === "primary").length} primary vendors`}
                humanize={false}
                tone="success"
              />
            </>
          }
        >
          <div className={consoleStatGrid3()}>
            <ConsoleCard
              eyebrow="Primary Path"
              value={String(
                data.dashboard.vendors.filter(
                  (vendor) => vendor.mode === "primary",
                ).length,
              )}
            >
              The approved path is limited to the named vendor set configured
              for the current runtime.
            </ConsoleCard>
            <ConsoleCard
              eyebrow="Fallback Wrapper"
              value={String(
                data.dashboard.vendors.filter(
                  (vendor) => vendor.mode === "fallback-only",
                ).length,
              )}
            >
              Fallback-only adapters stay explicit so operators understand when
              a route is a guarded backup path rather than the primary
              configured supplier set.
            </ConsoleCard>
            <ConsoleCard
              eyebrow="Receipt-Capable"
              value={String(
                data.dashboard.vendors.filter(
                  (vendor) => vendor.receiptCapability,
                ).length,
              )}
            >
              Receipt support is visible in the registry before a mandate is
              widened to a vendor.
            </ConsoleCard>
          </div>

          <section className={consoleSplitSection()}>
            <ConsolePanel>
              <SectionHeader
                eyebrow="Named Targets"
                title="Vendor registry summary"
                description="This registry makes the payment destination explicit before any machine payment is attempted."
              />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lane</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Adapter</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.dashboard.vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <CategoryAccentChip
                          lane={
                            vendor.mode === "primary"
                              ? "payments"
                              : "governance"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-charcoal">
                          {vendor.name}
                        </div>
                        <div className="text-xs text-steel">{vendor.id}</div>
                      </TableCell>
                      <TableCell>{formatVendorMode(vendor.mode)}</TableCell>
                      <TableCell>
                        <StatusPill
                          label={vendor.status}
                          tone={vendorStatusTone(vendor.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {vendor.receiptCapability ? "Yes" : "No"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {vendor.adapterKey}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ConsolePanel>

            <ConsoleCodeSurface
              title="How vendors fit"
              summary="Vendors deliver services, facilitators move money, and treasury enforces spend limits before anything executes."
              className="min-w-0"
            >
              <div className="space-y-3 text-sm leading-7 text-on-dark-muted">
                <p>
                  A vendor is the paid service the agent is trying to use (for
                  example an API or data provider).
                </p>
                <p>
                  A facilitator is payment infrastructure — it is not the
                  service itself.
                </p>
                <p>
                  Treasury is the budget guardrail that approves or denies
                  spend.
                </p>
                <p>
                  The fallback gate controls when backup vendor adapters may be
                  used instead of primary paths.
                </p>
              </div>
            </ConsoleCodeSurface>
          </section>
        </ConsoleShell>
      )}
    </OperatorGate>
  );
}
