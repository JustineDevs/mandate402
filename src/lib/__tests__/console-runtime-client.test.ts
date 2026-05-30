import { describe, expect, it } from "vitest";

import {
  formatConsoleSyncLabel,
  mapRuntimeToConsoleEnvironment,
} from "@/lib/console-runtime-client";
import type { ConsoleRuntimeChrome } from "@/lib/infrastructure/console-runtime";

const chromeBase: ConsoleRuntimeChrome = {
  appEnv: "production",
  environmentLabel: "Production",
  chainLabel: "Morph Mainnet · 2818",
  networkKey: "morph-mainnet",
  apiOrigin: "https://app.example.com",
  status: "ok",
  syncedAt: new Date().toISOString(),
  lastBlock: "12345",
  rpcReachable: true,
  persistenceMode: "postgres",
};

describe("console runtime client", () => {
  it("formats recent sync labels", () => {
    expect(formatConsoleSyncLabel(chromeBase.syncedAt)).toBe("Synced just now");
  });

  it("maps production chrome to production environment", () => {
    expect(mapRuntimeToConsoleEnvironment(chromeBase)).toBe("production");
    expect(
      mapRuntimeToConsoleEnvironment({
        ...chromeBase,
        environmentLabel: "Local",
      }),
    ).toBe("staging");
  });
});
