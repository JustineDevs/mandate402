import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import type { FallbackAttempt, FallbackGate } from "@/lib/domain/types";

const frontmatterSchema = z.object({
  decision_status: z.enum([
    "primary_only",
    "fallback_not_yet_allowed",
    "fallback_approved",
    "fallback_activated",
  ]),
  reviewed_at: z.string(),
  cutoff_date: z.string(),
  primary_targets: z.array(
    z.object({
      name: z.string(),
      vendor_type: z.string(),
      expected_capabilities: z.array(z.string()),
      integration_owner: z.string(),
      status: z.string(),
    }),
  ),
  attempt_log: z.array(
    z.object({
      target_name: z.string(),
      attempted_at: z.string(),
      channel_or_endpoint: z.string(),
      result: z.string(),
      blocker_type: z.string(),
      blocker_summary: z.string(),
      evidence_ref: z.string(),
      next_action: z.string(),
    }),
  ),
  approval_rationale: z.string(),
  review_owner: z.string(),
  evidence_links: z.array(z.string()),
});

function parseFrontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error("Fallback gate artifact is missing frontmatter.");
  }

  return JSON.parse(match[1]) as FallbackGate;
}

export async function readFallbackGate() {
  const filePath = path.join(
    process.cwd(),
    ".omx",
    "plans",
    "mandate402-fallback-gate.md",
  );
  const raw = await readFile(filePath, "utf8");
  return frontmatterSchema.parse(parseFrontmatter(raw));
}

function attemptIsRecorded(attempt: FallbackAttempt) {
  return (
    attempt.result !== "pending" &&
    attempt.blocker_type !== "not_started" &&
    attempt.evidence_ref.trim().length > 0
  );
}

export function fallbackGateAllowsWrapper(gate: FallbackGate) {
  const cutoff = Date.parse(gate.cutoff_date);
  const afterCutoff = Number.isFinite(cutoff) && cutoff <= Date.now();
  const hasTargets = gate.primary_targets.length >= 2;
  const declaredTargets = new Set(
    gate.primary_targets.map((target) => target.name),
  );
  const attemptedTargets = new Set(
    gate.attempt_log
      .filter(attemptIsRecorded)
      .map((attempt) => attempt.target_name)
      .filter((targetName) => declaredTargets.has(targetName)),
  );
  const hasAttemptEvidence =
    gate.attempt_log.length >= gate.primary_targets.length &&
    gate.attempt_log.every(attemptIsRecorded) &&
    attemptedTargets.size === declaredTargets.size;

  const statusAllows =
    gate.decision_status === "fallback_approved" ||
    gate.decision_status === "fallback_activated";

  return statusAllows && afterCutoff && hasTargets && hasAttemptEvidence;
}
