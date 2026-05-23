import { CategoryAccentChip } from "@/components/category-accent";
import { ConsoleCard, ConsoleCodeSurface } from "@/components/console-card";
import { ConsoleShell } from "@/components/console-shell";
import { SubtleDotGrid } from "@/components/landing/subtle-dot-grid";
import { SectionHeader } from "@/components/section-header";
import { StatusPill } from "@/components/status-pill";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CategoryLane } from "@/lib/types";

const summaryCards = [
  {
    title: "Approved primary vendors",
    value: "2",
    body: "Named and operator-visible before any mandate dispatch treats them as trusted.",
  },
  {
    title: "Vendor health",
    value: "1 / 1",
    body: "One reachable and one degraded endpoint remain visible instead of hidden behind a generic healthy badge.",
  },
  {
    title: "Receipt capability",
    value: "2 ready",
    body: "Receipt support remains visible because proof of delivery is separate from financial truth.",
  },
];

const vendors: {
  id: string;
  name: string;
  mode: string;
  status: string;
  receipt: string;
  endpoint: string;
  lane: CategoryLane;
}[] = [
  {
    id: "morph-market-data",
    name: "Morph Market Data",
    mode: "Primary",
    status: "Reachable",
    receipt: "Yes",
    endpoint: "vendor-a.example",
    lane: "payments",
  },
  {
    id: "morph-research-net",
    name: "Morph Research Net",
    mode: "Primary",
    status: "Slow",
    receipt: "Yes",
    endpoint: "vendor-b.example",
    lane: "agents",
  },
];

export default function VendorsPage() {
  return (
    <ConsoleShell
      activeTab="Vendors"
      eyebrow="Vendor Registry"
      title="Vendors"
      summary="The vendor layer stays visible as its own system boundary, separate from facilitator, treasury, and oracle responsibilities."
      toolbar={
        <>
          <StatusPill label="Filter" tone="neutral" />
          <StatusPill label="Export" tone="neutral" />
        </>
      }
    >
      <div className="relative min-w-0">
        <SubtleDotGrid className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(22rem,55vh)] opacity-[0.12] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative z-[1] flex flex-col gap-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {summaryCards.map((card) => (
              <ConsoleCard
                key={card.title}
                eyebrow={card.title}
                value={card.value}
              >
                {card.body}
              </ConsoleCard>
            ))}
          </div>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <SectionHeader
                  eyebrow="Registry"
                  title="Registry summary"
                  description="Public-facing vendor identity, status, and receipt support stay explicit before operators widen trust."
                  className="mb-0"
                />
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lane</TableHead>
                      <TableHead>Vendor Name</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead>Endpoint</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <CategoryAccentChip lane={vendor.lane} />
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-charcoal">
                            {vendor.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vendor.mode}
                        </TableCell>
                        <TableCell>
                          <StatusPill
                            label={vendor.status}
                            tone={
                              vendor.status === "Reachable"
                                ? "success"
                                : "warning"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vendor.receipt}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {vendor.endpoint}
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            className="rounded-full border border-hairline-strong px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal"
                          >
                            View
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <ConsoleCodeSurface title="Boundary legend">
              <div className="space-y-4 text-sm leading-7 text-on-dark-muted">
                <p>vendor = paid service endpoint</p>
                <p>facilitator = payment infrastructure</p>
                <p>treasury = governed value movement</p>
                <p>oracle = fiat conversion reference</p>
              </div>
            </ConsoleCodeSurface>
          </section>
        </div>
      </div>
    </ConsoleShell>
  );
}
