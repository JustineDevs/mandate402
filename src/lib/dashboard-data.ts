import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";
import {
  listAgents,
  listAttempts,
  listDomainEvents,
  listMandates,
} from "@/lib/modules/mandates";
import { listAuditEntries } from "@/lib/modules/mandates";
import { vendorRegistry } from "@/lib/vendor-registry";

export type DashboardData = {
  agents: Awaited<ReturnType<typeof listAgents>>;
  mandates: Awaited<ReturnType<typeof listMandates>>;
  attempts: Awaited<ReturnType<typeof listAttempts>>;
  auditEntries: Awaited<ReturnType<typeof listAuditEntries>>;
  domainEvents: Awaited<ReturnType<typeof listDomainEvents>>;
  vendors: typeof vendorRegistry;
  fallbackGate: Awaited<ReturnType<typeof readFallbackGate>>;
  metrics: {
    liveMandates: number;
    spendReservedPlusConsumed: number;
    blockedAttempts: number;
  };
};

export async function getDashboardData(): Promise<DashboardData> {
  const [agents, mandates, attempts, auditEntries, domainEvents, fallbackGate] =
    await Promise.all([
      listAgents(),
      listMandates(),
      listAttempts(),
      listAuditEntries(),
      listDomainEvents(),
      readFallbackGate(),
    ]);

  return {
    agents,
    mandates,
    attempts,
    auditEntries,
    domainEvents,
    vendors: vendorRegistry,
    fallbackGate,
    metrics: {
      liveMandates: mandates.filter((entry) => entry.status === "issued_active")
        .length,
      spendReservedPlusConsumed: mandates.reduce(
        (sum, entry) => sum + entry.consumedCents + entry.reservedCents,
        0,
      ),
      blockedAttempts: attempts.filter(
        (entry) => entry.status === "policy_denied",
      ).length,
    },
  };
}
