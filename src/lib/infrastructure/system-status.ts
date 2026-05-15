import { readFallbackGate } from "@/lib/infrastructure/fallback-gate";
import { readStore } from "@/lib/infrastructure/store";

export async function getSystemStatus() {
  const [store, fallbackGate] = await Promise.all([
    readStore(),
    readFallbackGate(),
  ]);

  const unknownAttempts = store.attempts.filter(
    (attempt) => attempt.status === "execution_unknown",
  ).length;

  return {
    status: "ok",
    agents: store.agents.length,
    mandates: store.mandates.length,
    attempts: store.attempts.length,
    auditEntries: store.auditEntries.length,
    domainEvents: store.domainEvents.length,
    unknownAttempts,
    fallbackDecision: fallbackGate.decision_status,
  };
}
