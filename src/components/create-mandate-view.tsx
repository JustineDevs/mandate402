"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

const selectFieldClass = cn(
  "flex h-8 w-full max-w-xs appearance-none rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
);

const textareaFieldClass = cn(
  "min-h-20 w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-foreground outline-none transition-colors",
  "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:opacity-50 md:text-sm",
);

interface CreateMandateViewProps {
  availableAgents?: string[];
  availableVendors?: string[];
  availableCategories?: string[];
  onSubmit?: (data: MandateFormData) => void;
  onCancel?: () => void;
}

interface MandateFormData {
  name: string;
  agent: string;
  purpose: string;
  budgetType: string;
  maxSpend: string;
  expiryDate: string;
  expiryTime: string;
  vendors: string[];
  categories: string[];
  receiptRequired: boolean;
  logReference: boolean;
  attachPaymentId: boolean;
  autoRevoke: boolean;
  manualApproval: boolean;
  blockOutOfPolicy: boolean;
}

/**
 * Multi-step mandate creation form (wireframe).
 */
export const CreateMandateView: React.FC<CreateMandateViewProps> = ({
  availableAgents = ["Agent Alpha", "Agent Beta", "Agent Gamma"],
  availableVendors = [
    "OpenAI API",
    "Tavily",
    "Perplexity API",
    "Any verified x402 vendor",
  ],
  availableCategories = [
    "Data/Research",
    "AI APIs",
    "Compute",
    "Content",
    "Other",
  ],
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<MandateFormData>({
    name: "Procurement - Market Research",
    agent: "Agent Alpha",
    purpose: "Find and purchase research/report/API access",
    budgetType: "Fixed Cap",
    maxSpend: "50.00",
    expiryDate: "2026-05-20",
    expiryTime: "23:59 UTC",
    vendors: ["OpenAI API", "Tavily"],
    categories: ["Data/Research", "AI APIs"],
    receiptRequired: true,
    logReference: true,
    attachPaymentId: true,
    autoRevoke: true,
    manualApproval: true,
    blockOutOfPolicy: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const toggleSelection = (field: "vendors" | "categories", value: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar activeTab="Mandates" />

      <div className="flex min-h-screen flex-1 flex-col overflow-y-auto p-4 md:ml-72 md:p-10">
        <TopNav />

        <main className="mx-auto w-full max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold text-charcoal">
            Create New Mandate
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Mandate details</CardTitle>
                <CardDescription>
                  Identity, agent assignment, purpose, and budget envelope for
                  this mandate.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Label htmlFor="name" className="text-slate">
                    Mandate Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-10 text-lg font-semibold text-charcoal"
                  />
                </div>

                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <Label htmlFor="agent" className="text-slate">
                    Assigned Agent
                  </Label>
                  <div className="relative max-w-xs">
                    <select
                      id="agent"
                      name="agent"
                      value={formData.agent}
                      onChange={handleInputChange}
                      className={selectFieldClass}
                    >
                      {availableAgents.map((agent) => (
                        <option key={agent} value={agent}>
                          {agent}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[180px_1fr] items-start gap-4">
                  <Label htmlFor="purpose" className="mt-1 text-slate">
                    Task / Purpose
                  </Label>
                  <textarea
                    id="purpose"
                    name="purpose"
                    rows={3}
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className={textareaFieldClass}
                  />
                </div>

                <Separator />

                <div className="space-y-6">
                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Label htmlFor="budgetType" className="text-slate">
                      Budget Type
                    </Label>
                    <div className="relative max-w-xs">
                      <select
                        id="budgetType"
                        name="budgetType"
                        value={formData.budgetType}
                        onChange={handleInputChange}
                        className={selectFieldClass}
                      >
                        <option value="Fixed Cap">Fixed Cap</option>
                        <option value="Usage-Based">Usage-Based</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <Label htmlFor="maxSpend" className="text-slate">
                      Max Spend
                    </Label>
                    <div className="flex max-w-xs items-center gap-1">
                      <span className="text-2xl font-bold text-charcoal">
                        $
                      </span>
                      <Input
                        id="maxSpend"
                        name="maxSpend"
                        type="number"
                        step="0.01"
                        value={formData.maxSpend}
                        onChange={handleInputChange}
                        className="h-10 text-2xl font-bold text-charcoal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <span className="text-sm font-medium text-slate">
                      Expiry
                    </span>
                    <div className="flex max-w-md flex-wrap items-center gap-3">
                      <Input
                        id="expiryTime"
                        name="expiryTime"
                        type="text"
                        value={formData.expiryTime}
                        onChange={handleInputChange}
                        className="h-8 max-w-[10rem] font-mono text-sm"
                        aria-label="Expiry time"
                      />
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="h-8 max-w-[11rem] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Allowed vendors</CardTitle>
                <CardDescription>
                  Only checked vendors may receive spend attempts under this
                  mandate.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {availableVendors.map((vendor) => {
                    const vendorId = `vendor-${vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

                    return (
                      <label
                        key={vendor}
                        htmlFor={vendorId}
                        className="group flex cursor-pointer items-center gap-2"
                      >
                        <input
                          id={vendorId}
                          type="checkbox"
                          checked={formData.vendors.includes(vendor)}
                          onChange={() => toggleSelection("vendors", vendor)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                            formData.vendors.includes(vendor)
                              ? "border-primary bg-primary"
                              : "border-input"
                          }`}
                        >
                          {formData.vendors.includes(vendor) ? (
                            <svg
                              className="h-3.5 w-3.5 text-primary-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : null}
                        </span>
                        <span className="text-sm text-slate">{vendor}</span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Category rules</CardTitle>
                  <CardDescription>
                    Spend categories and downstream controls.
                  </CardDescription>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                  {formData.categories.length}/11 Selected
                </span>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex flex-wrap gap-4">
                  {availableCategories.map((cat) => {
                    const categoryId = `category-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

                    return (
                      <label
                        key={cat}
                        htmlFor={categoryId}
                        className="group flex cursor-pointer items-center gap-2"
                      >
                        <input
                          id={categoryId}
                          type="checkbox"
                          checked={formData.categories.includes(cat)}
                          onChange={() => toggleSelection("categories", cat)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                            formData.categories.includes(cat)
                              ? "border-primary bg-primary"
                              : "border-input"
                          }`}
                        >
                          {formData.categories.includes(cat) ? (
                            <svg
                              className="h-3.5 w-3.5 text-primary-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : null}
                        </span>
                        <span className="text-sm text-slate">{cat}</span>
                      </label>
                    );
                  })}
                </div>

                <Separator />

                <div className="grid gap-10 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-steel">
                      Receipt & Audit
                    </h4>
                    {[
                      { label: "Require receipt", name: "receiptRequired" },
                      { label: "Log Reference Key", name: "logReference" },
                      {
                        label: "Attach payment identifier",
                        name: "attachPaymentId",
                      },
                    ].map((rule) => (
                      <label
                        key={rule.name}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          name={rule.name}
                          checked={
                            formData[
                              rule.name as
                                | "receiptRequired"
                                | "logReference"
                                | "attachPaymentId"
                            ]
                          }
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 cursor-pointer rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                        <span className="text-sm text-slate">{rule.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-steel">
                      Risk Controls
                    </h4>
                    {[
                      { label: "Auto-revoke after expiry", name: "autoRevoke" },
                      {
                        label: "Manual approval if > $20",
                        name: "manualApproval",
                      },
                      {
                        label: "Block out-of-policy payments",
                        name: "blockOutOfPolicy",
                      },
                    ].map((rule) => (
                      <label
                        key={rule.name}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <input
                          type="checkbox"
                          name={rule.name}
                          checked={
                            formData[
                              rule.name as
                                | "autoRevoke"
                                | "manualApproval"
                                | "blockOutOfPolicy"
                            ]
                          }
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 cursor-pointer rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                        <span className="text-sm text-slate">{rule.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-10 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-full px-10 text-sm font-bold shadow-md hover:shadow-lg"
              >
                Create
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
