import type { StoreData } from "@/lib/domain/types";
import { vendorRegistry } from "@/lib/vendor-registry";

export type StoreIntegrityIssue = {
  code: string;
  message: string;
};

export type StoreIntegrityReport = {
  status: "ok" | "degraded";
  issues: StoreIntegrityIssue[];
};

function pushDuplicateIdIssues(
  issues: StoreIntegrityIssue[],
  values: string[],
  code: string,
  label: string,
) {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      issues.push({
        code,
        message: `Duplicate ${label} id detected: ${value}`,
      });
      continue;
    }

    seen.add(value);
  }
}

export function buildStoreIntegrityReport(
  data: StoreData,
): StoreIntegrityReport {
  const issues: StoreIntegrityIssue[] = [];
  const vendorIds = new Set(vendorRegistry.map((vendor) => vendor.id));
  const agentsById = new Map(data.agents.map((agent) => [agent.id, agent]));
  const mandatesById = new Map(
    data.mandates.map((mandate) => [mandate.id, mandate]),
  );
  const attemptsById = new Map(
    data.attempts.map((attempt) => [attempt.id, attempt]),
  );
  const paymentIdentifiers = new Set<string>();

  pushDuplicateIdIssues(
    issues,
    data.agents.map((agent) => agent.id),
    "duplicate_agent_id",
    "agent",
  );
  pushDuplicateIdIssues(
    issues,
    data.mandates.map((mandate) => mandate.id),
    "duplicate_mandate_id",
    "mandate",
  );
  pushDuplicateIdIssues(
    issues,
    data.attempts.map((attempt) => attempt.id),
    "duplicate_attempt_id",
    "attempt",
  );
  pushDuplicateIdIssues(
    issues,
    data.workerTasks.map((workerTask) => workerTask.id),
    "duplicate_worker_task_id",
    "worker task",
  );
  pushDuplicateIdIssues(
    issues,
    data.auditEntries.map((auditEntry) => auditEntry.id),
    "duplicate_audit_id",
    "audit entry",
  );
  pushDuplicateIdIssues(
    issues,
    data.domainEvents.map((event) => event.id),
    "duplicate_domain_event_id",
    "domain event",
  );

  for (const mandate of data.mandates) {
    const agent = agentsById.get(mandate.agentId);
    if (!agent) {
      issues.push({
        code: "missing_agent_reference",
        message: `Mandate ${mandate.id} references missing agent ${mandate.agentId}.`,
      });
    } else if (mandate.agentName !== agent.name) {
      issues.push({
        code: "agent_name_mismatch",
        message: `Mandate ${mandate.id} stores agentName "${mandate.agentName}" but agent ${agent.id} is "${agent.name}".`,
      });
    }

    if (mandate.budgetCapCents <= 0) {
      issues.push({
        code: "invalid_budget_cap",
        message: `Mandate ${mandate.id} has non-positive budgetCapCents ${mandate.budgetCapCents}.`,
      });
    }

    if (mandate.reservedCents < 0 || mandate.consumedCents < 0) {
      issues.push({
        code: "negative_mandate_totals",
        message: `Mandate ${mandate.id} has negative reserved or consumed totals.`,
      });
    }

    if (
      mandate.reservedCents + mandate.consumedCents >
      mandate.budgetCapCents
    ) {
      issues.push({
        code: "budget_overflow",
        message: `Mandate ${mandate.id} exceeds its budget cap through reserved + consumed totals.`,
      });
    }

    const seenApprovedVendorIds = new Set<string>();
    for (const vendorId of mandate.approvedVendorIds) {
      if (seenApprovedVendorIds.has(vendorId)) {
        issues.push({
          code: "duplicate_approved_vendor",
          message: `Mandate ${mandate.id} repeats approved vendor ${vendorId}.`,
        });
        continue;
      }

      seenApprovedVendorIds.add(vendorId);

      if (!vendorIds.has(vendorId)) {
        issues.push({
          code: "unknown_approved_vendor",
          message: `Mandate ${mandate.id} references unknown approved vendor ${vendorId}.`,
        });
      }
    }
  }

  for (const attempt of data.attempts) {
    const mandate = mandatesById.get(attempt.mandateId);
    if (!mandate) {
      issues.push({
        code: "missing_mandate_reference",
        message: `Attempt ${attempt.id} references missing mandate ${attempt.mandateId}.`,
      });
    }

    if (attempt.amountCents <= 0) {
      issues.push({
        code: "invalid_attempt_amount",
        message: `Attempt ${attempt.id} has non-positive amountCents ${attempt.amountCents}.`,
      });
    }

    if (!attempt.paymentIdentifier.trim()) {
      issues.push({
        code: "blank_payment_identifier",
        message: `Attempt ${attempt.id} has a blank paymentIdentifier.`,
      });
    } else if (paymentIdentifiers.has(attempt.paymentIdentifier)) {
      issues.push({
        code: "duplicate_payment_identifier",
        message: `Attempt ${attempt.id} reuses paymentIdentifier ${attempt.paymentIdentifier}.`,
      });
    } else {
      paymentIdentifiers.add(attempt.paymentIdentifier);
    }
  }

  for (const workerTask of data.workerTasks) {
    const mandate = mandatesById.get(workerTask.mandateId);
    if (!mandate) {
      issues.push({
        code: "missing_worker_task_mandate_reference",
        message: `Worker task ${workerTask.id} references missing mandate ${workerTask.mandateId}.`,
      });
    }

    const attempt = attemptsById.get(workerTask.attemptId);
    if (!attempt) {
      issues.push({
        code: "missing_worker_task_attempt_reference",
        message: `Worker task ${workerTask.id} references missing attempt ${workerTask.attemptId}.`,
      });
    } else if (attempt.mandateId !== workerTask.mandateId) {
      issues.push({
        code: "worker_task_attempt_mandate_mismatch",
        message: `Worker task ${workerTask.id} points to attempt ${attempt.id} on mandate ${attempt.mandateId}, not ${workerTask.mandateId}.`,
      });
    } else if (
      workerTask.operatorId !== null &&
      workerTask.operatorId !== attempt.operatorId
    ) {
      issues.push({
        code: "worker_task_operator_mismatch",
        message: `Worker task ${workerTask.id} stores operator ${workerTask.operatorId}, not attempt operator ${attempt.operatorId}.`,
      });
    }
  }

  for (const auditEntry of data.auditEntries) {
    const mandate = mandatesById.get(auditEntry.mandateId);
    if (!mandate) {
      issues.push({
        code: "missing_audit_mandate_reference",
        message: `Audit entry ${auditEntry.id} references missing mandate ${auditEntry.mandateId}.`,
      });
    }

    if (auditEntry.attemptId) {
      const attempt = attemptsById.get(auditEntry.attemptId);
      if (!attempt) {
        issues.push({
          code: "missing_audit_attempt_reference",
          message: `Audit entry ${auditEntry.id} references missing attempt ${auditEntry.attemptId}.`,
        });
      } else if (attempt.mandateId !== auditEntry.mandateId) {
        issues.push({
          code: "audit_attempt_mandate_mismatch",
          message: `Audit entry ${auditEntry.id} points to attempt ${attempt.id} on mandate ${attempt.mandateId}, not ${auditEntry.mandateId}.`,
        });
      }
    }
  }

  for (const event of data.domainEvents) {
    if (event.entityType === "mandate" && !mandatesById.has(event.entityId)) {
      issues.push({
        code: "missing_domain_mandate_reference",
        message: `Domain event ${event.id} references missing mandate ${event.entityId}.`,
      });
    }

    if (
      event.entityType === "payment_attempt" &&
      !attemptsById.has(event.entityId)
    ) {
      issues.push({
        code: "missing_domain_attempt_reference",
        message: `Domain event ${event.id} references missing attempt ${event.entityId}.`,
      });
    }

    if (
      event.entityType === "worker_task" &&
      !data.workerTasks.some((workerTask) => workerTask.id === event.entityId)
    ) {
      issues.push({
        code: "missing_domain_worker_task_reference",
        message: `Domain event ${event.id} references missing worker task ${event.entityId}.`,
      });
    }
  }

  return {
    status: issues.length === 0 ? "ok" : "degraded",
    issues,
  };
}

export function assertStoreIntegrity(data: StoreData) {
  const report = buildStoreIntegrityReport(data);
  if (report.issues.length === 0) {
    return;
  }

  throw new Error(
    `Store integrity validation failed: ${report.issues
      .map((issue) => issue.message)
      .join(" | ")}`,
  );
}
