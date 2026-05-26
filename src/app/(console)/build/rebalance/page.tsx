"use client";

import { useState } from "react";

import { ConsoleShell } from "@/components/console-shell";
import { OperatorGate } from "@/components/operator-gate";
import { SectionHeader } from "@/components/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BridgeQuoteResponse } from "@/lib/domain/types";
import { executeBridge, getBridgeQuote } from "@/lib/mocks/bridging";
import { formatUsd } from "@/lib/operator-view-model";

type Step = "selection" | "quoting" | "review" | "executing" | "success";

const SUPPORTED_CHAINS = [
  { id: 1, name: "Ethereum Mainnet" },
  { id: 2818, name: "Morph Mainnet" },
  { id: 42161, name: "Arbitrum One" },
  { id: 10, name: "Optimism" },
  { id: 8453, name: "Base" },
];

const SUPPORTED_ASSETS = [
  { address: "0xusdc", symbol: "USDC", name: "USD Coin" },
  { address: "0xusdt", symbol: "USDT", name: "Tether" },
  { address: "0xweth", symbol: "WETH", name: "Wrapped Ether" },
];

export default function RebalancePage() {
  const [step, setStep] = useState<Step>("selection");
  const [formData, setFormData] = useState({
    fromChainId: 1,
    toChainId: 2818,
    tokenAddress: "0xusdc",
    amountUsd: "",
  });
  const [quote, setQuote] = useState<BridgeQuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleGetQuote = async () => {
    setError(null);
    setStep("quoting");
    try {
      const amountCents = Math.round(
        Number.parseFloat(formData.amountUsd) * 100,
      );
      const response = await getBridgeQuote({
        fromChainId: formData.fromChainId,
        toChainId: formData.toChainId,
        tokenAddress: formData.tokenAddress,
        amountCents,
      });
      setQuote(response);
      setStep("review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch quote.");
      setStep("selection");
    }
  };

  const handleExecute = async (operatorId: string) => {
    if (!quote) return;
    setError(null);
    setStep("executing");
    try {
      const result = await executeBridge(quote.quoteId, operatorId);
      setTxHash(result.txHash);
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Execution failed.");
      setStep("review");
    }
  };

  return (
    <OperatorGate
      title="Treasury rebalance"
      description="Execute cross-chain treasury moves to optimize liquidity and facilitate agent spend."
    >
      {({ data }) => {
        const { operator } = data;
        return (
          <ConsoleShell
            activeTab="Treasury"
            eyebrow="Liquidity Management"
            title="Treasury Rebalance"
            summary="Move governed treasury funds between chains using LI.FI bridging infrastructure."
            heroTone="control"
          >
            <div className="mx-auto max-w-2xl space-y-8 rounded-lg border border-hairline bg-canvas p-6 shadow-sm sm:p-8">
              <SectionHeader
                title={
                  step === "success"
                    ? "Bridge Initialized"
                    : "Rebalance Transaction"
                }
                description={
                  step === "success"
                    ? "Your cross-chain transfer has been submitted to the network."
                    : "Configure and review your cross-chain treasury move."
                }
              />

              {error && (
                <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {step === "selection" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fromChain">Source Chain</Label>
                      <select
                        id="fromChain"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.fromChainId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fromChainId: Number.parseInt(e.target.value),
                          })
                        }
                      >
                        {SUPPORTED_CHAINS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toChain">Target Chain</Label>
                      <select
                        id="toChain"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.toChainId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            toChainId: Number.parseInt(e.target.value),
                          })
                        }
                      >
                        {SUPPORTED_CHAINS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="asset">Asset</Label>
                      <select
                        id="asset"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.tokenAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tokenAddress: e.target.value,
                          })
                        }
                      >
                        {SUPPORTED_ASSETS.map((a) => (
                          <option key={a.address} value={a.address}>
                            {a.symbol}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amountUsd}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amountUsd: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full bg-brand-control text-white hover:bg-brand-control-deep font-bold"
                    onClick={handleGetQuote}
                    disabled={
                      !formData.amountUsd ||
                      Number.parseFloat(formData.amountUsd) <= 0
                    }
                  >
                    Fetch Bridge Quote
                  </Button>
                </div>
              )}

              {step === "quoting" && (
                <div className="py-20 text-center space-y-4">
                  <div className="animate-pulse text-brand-control font-bold">
                    Finding optimal bridge path...
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    Querying LI.FI for real-time rates and route safety.
                  </p>
                </div>
              )}

              {step === "review" && quote && (
                <div className="space-y-6">
                  <div className="rounded-lg bg-surface-soft p-5 space-y-4 border border-hairline">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Route
                      </span>
                      <span className="text-sm font-bold text-charcoal">
                        {
                          SUPPORTED_CHAINS.find(
                            (c) => c.id === formData.fromChainId,
                          )?.name
                        }{" "}
                        {" → "}
                        {
                          SUPPORTED_CHAINS.find(
                            (c) => c.id === formData.toChainId,
                          )?.name
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Transfer Amount
                      </span>
                      <span className="text-sm font-bold text-charcoal">
                        {formatUsd(
                          Math.round(
                            Number.parseFloat(formData.amountUsd) * 100,
                          ),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Estimated Fees
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        -{formatUsd(quote.estimatedFeesCents)}
                      </span>
                    </div>
                    <div className="border-t border-hairline pt-4 flex justify-between items-center">
                      <span className="text-sm text-charcoal font-bold">
                        Estimated Arrival
                      </span>
                      <span className="text-sm font-bold text-mandate-green">
                        ~{quote.estimatedTimeMinutes} minutes
                      </span>
                    </div>
                  </div>

                  <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700 border border-blue-100 italic">
                    Quote expires at{" "}
                    {new Date(quote.expiresAt).toLocaleTimeString()}. Bridging
                    involves cross-chain message passing and depends on target
                    chain finality.
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep("selection")}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-mandate-green text-white hover:bg-mandate-green-dark font-bold"
                      onClick={() => handleExecute(operator.operatorId)}
                    >
                      Confirm & Execute
                    </Button>
                  </div>
                </div>
              )}

              {step === "executing" && (
                <div className="py-20 text-center space-y-4">
                  <div className="animate-bounce text-mandate-green font-bold text-xl">
                    Executing Bridge...
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Signing treasury transaction and dispatching cross-chain
                    payload. Do not close this window.
                  </p>
                </div>
              )}

              {step === "success" && (
                <div className="space-y-6">
                  <div className="rounded-lg bg-green-50 p-6 text-center space-y-3 border border-green-200">
                    <div className="text-2xl">✅</div>
                    <div className="font-bold text-green-800">
                      Transaction Submitted
                    </div>
                    <p className="text-xs text-green-700 font-mono break-all">
                      Hash: {txHash}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The cross-chain move has been initiated. Funds will arrive
                    on the target chain once the bridge provider confirms
                    source-chain finality.
                  </p>

                  <div className="rounded border border-hairline bg-surface-soft p-4">
                    <p className="text-xs font-bold text-charcoal mb-1 uppercase tracking-wider">
                      Observability Note
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      Per ADR-0005, historical bridging records and real-time
                      status tracking will be available on the Treasury
                      Dashboard (Edward's Lane) once implemented.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => setStep("selection")}
                  >
                    Return to Rebalance
                  </Button>
                </div>
              )}
            </div>
          </ConsoleShell>
        );
      }}
    </OperatorGate>
  );
}
