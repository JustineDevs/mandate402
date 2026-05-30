import type { ConsoleRuntimeChrome } from "@/lib/infrastructure/console-runtime";

const LOCAL_DEV_ORIGIN = "http://localhost:3000";

export function getConsoleApiBases(): string[] {
  const bases: string[] = [];
  const configured = process.env.NEXT_PUBLIC_MANDATE402_API_BASE_URL?.trim();

  if (configured) {
    bases.push(configured.replace(/\/$/, ""));
  }

  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (!bases.includes(origin)) {
      bases.push(origin);
    }

    const onLocal =
      /localhost|127\.0\.0\.1/i.test(origin) ||
      /localhost|127\.0\.0\.1/i.test(window.location.hostname);
    if (!onLocal && !bases.includes(LOCAL_DEV_ORIGIN)) {
      bases.push(LOCAL_DEV_ORIGIN);
    }
  } else if (!configured) {
    bases.push("");
  }

  return bases;
}

export function formatConsoleSyncLabel(
  syncedAt: string,
  nowMs = Date.now(),
): string {
  const parsed = Date.parse(syncedAt);
  if (!Number.isFinite(parsed)) {
    return "Sync unavailable";
  }

  const ageMs = Math.max(0, nowMs - parsed);
  if (ageMs < 45_000) {
    return "Synced just now";
  }
  if (ageMs < 3_600_000) {
    const minutes = Math.max(1, Math.floor(ageMs / 60_000));
    return `Synced ${minutes}m ago`;
  }
  const hours = Math.max(1, Math.floor(ageMs / 3_600_000));
  return `Synced ${hours}h ago`;
}

export function mapRuntimeToConsoleEnvironment(
  chrome: ConsoleRuntimeChrome,
): "production" | "staging" {
  if (chrome.environmentLabel === "Production") {
    return "production";
  }
  return "staging";
}

type FetchConsoleRuntimeResult = {
  chrome: ConsoleRuntimeChrome;
  apiOrigin: string;
};

export async function fetchConsoleRuntimeChrome(): Promise<FetchConsoleRuntimeResult> {
  const bases = getConsoleApiBases();
  let lastError: unknown;

  for (const base of bases) {
    const url = `${base}/api/console/runtime`;
    try {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        lastError = new Error(`Runtime chrome failed (${response.status})`);
        continue;
      }

      const json = (await response.json()) as {
        ok: boolean;
        data?: ConsoleRuntimeChrome;
      };

      if (!json.ok || !json.data) {
        lastError = new Error("Runtime chrome response was invalid.");
        continue;
      }

      return {
        chrome: json.data,
        apiOrigin: base || json.data.apiOrigin,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to reach the Mandate402 runtime API.");
}
