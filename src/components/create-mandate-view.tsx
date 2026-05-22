"use client";

import type React from "react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";

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
 * CreateMandateView Component
 * Instrumented for form control, state management, and backend submission.
 */
export const CreateMandateView: React.FC<CreateMandateViewProps> = ({
  availableAgents = ["Agent Alpha", "Agent Beta", "Agent Gamma"],
  availableVendors = ["OpenAI API", "Tavily", "Perplexity API", "Any..."],
  availableCategories = ["Data/Research", "AI APIs", "Compute", "Content", "Other"],
  onSubmit,
  onCancel
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
    categories: ["Data/Research"],
    receiptRequired: false,
    logReference: false,
    attachPaymentId: false,
    autoRevoke: false,
    manualApproval: false,
    blockOutOfPolicy: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const toggleSelection = (field: 'vendors' | 'categories', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      const next = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    console.log('Submitting Mandate:', formData);
  };

  return (
    <div className="flex min-h-screen bg-[#F7FAF9]">
      <Sidebar activeTab="Mandates" />

      <div className="flex-1 md:ml-72 p-4 md:p-10 flex flex-col min-h-screen overflow-y-auto">
        <TopNav onSearch={(q) => console.log('Search:', q)} />

        <main className="max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-[#1F2937] mb-8">
            Create New Mandate
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            {/* 1. Main Details Card */}
            <section className="bg-white rounded-xl border border-[#E4ECE9] p-8 shadow-sm">
              <div className="space-y-6">
                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <label htmlFor="name" className="text-[#475569] text-sm font-medium">Mandate Name</label>
                  <input 
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="text-[#1F2937] font-semibold text-lg bg-transparent border-none focus:ring-0 p-0 w-full"
                  />
                </div>

                <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                  <label htmlFor="agent" className="text-[#475569] text-sm font-medium">Assigned Agent</label>
                  <div className="relative max-w-xs">
                    <select 
                      id="agent"
                      name="agent"
                      value={formData.agent}
                      onChange={handleInputChange}
                      className="w-full appearance-none bg-white border border-[#E4ECE9] rounded-lg px-4 py-2 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20"
                    >
                      {availableAgents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[180px_1fr] items-start gap-4">
                  <label htmlFor="purpose" className="text-[#475569] text-sm font-medium mt-1">Task / Purpose</label>
                  <textarea 
                    id="purpose"
                    name="purpose"
                    rows={2}
                    value={formData.purpose}
                    onChange={handleInputChange}
                    className="text-[#1F2937] leading-relaxed bg-transparent border-none focus:ring-0 p-0 w-full resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-[#E4ECE9] space-y-6">
                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <label htmlFor="budgetType" className="text-[#475569] text-sm font-medium">Budget Type</label>
                    <div className="relative max-w-xs">
                      <select 
                        id="budgetType"
                        name="budgetType"
                        value={formData.budgetType}
                        onChange={handleInputChange}
                        className="w-full appearance-none bg-white border border-[#E4ECE9] rounded-lg px-4 py-2 text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#15803D]/20"
                      >
                        <option>Fixed Cap</option>
                        <option>Usage-Based</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <label htmlFor="maxSpend" className="text-[#475569] text-sm font-medium">Max Spend</label>
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold text-[#1F2937]">$</span>
                      <input 
                        id="maxSpend"
                        name="maxSpend"
                        type="number"
                        step="0.01"
                        value={formData.maxSpend}
                        onChange={handleInputChange}
                        className="text-2xl font-bold text-[#1F2937] bg-transparent border-none focus:ring-0 p-0 w-32"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[180px_1fr] items-center gap-4">
                    <label className="text-[#475569] text-sm font-medium">Expiry</label>
                    <div className="flex items-center gap-4">
                      <input 
                        name="expiryTime"
                        type="text"
                        value={formData.expiryTime}
                        onChange={handleInputChange}
                        className="font-mono text-[#1F2937] bg-transparent border-none focus:ring-0 p-0 w-24"
                      />
                      <input 
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="bg-[#F7FAF9] border border-[#E4ECE9] px-3 py-1 rounded text-sm text-[#475569] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Allowed Vendors Card */}
            <section className="bg-white rounded-xl border border-[#E4ECE9] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-[#1F2937] mb-4">Allowed Vendors</h3>
              <div className="flex flex-wrap gap-6">
                {availableVendors.map((vendor) => (
                  <label key={vendor} className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      onClick={() => toggleSelection('vendors', vendor)}
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        formData.vendors.includes(vendor) ? "border-[#15803D] bg-[#15803D]" : "border-[#E4ECE9]"
                      }`}
                      aria-checked={formData.vendors.includes(vendor)}
                      role="checkbox"
                    >
                      {formData.vendors.includes(vendor) && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      )}
                    </div>
                    <span className="text-[#475569] text-sm">{vendor}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* 3. Category Rules & Controls Card */}
            <section className="bg-white rounded-xl border border-[#E4ECE9] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#1F2937]">Category Rules</h3>
                <span className="text-xs font-medium text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-full">
                  {formData.categories.length}/11 Selected
                </span>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                {availableCategories.map((cat) => (
                   <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                    <div 
                      onClick={() => toggleSelection('categories', cat)}
                      className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${
                        formData.categories.includes(cat) ? "border-[#15803D] bg-[#15803D]" : "border-[#E4ECE9]"
                      }`}
                      aria-checked={formData.categories.includes(cat)}
                      role="checkbox"
                    >
                      {formData.categories.includes(cat) && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      )}
                    </div>
                    <span className="text-[#475569] text-sm">{cat}</span>
                  </label>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-10 pt-6 border-t border-[#E4ECE9]">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider">Receipt & Audit</h4>
                  {[
                    { label: "Require receipt", name: "receiptRequired" },
                    { label: "Log Reference Key", name: "logReference" },
                    { label: "Attach payment identifier", name: "attachPaymentId" }
                  ].map((rule) => (
                    <label key={rule.name} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name={rule.name}
                        checked={(formData as any)[rule.name]}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 rounded border-[#E4ECE9] text-[#15803D] focus:ring-[#15803D]/20 cursor-pointer" 
                      />
                      <span className="text-[#475569] text-sm">{rule.label}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#666666] uppercase tracking-wider">Risk Controls</h4>
                  {[
                    { label: "Auto-revoke after expiry", name: "autoRevoke" },
                    { label: "Manual approval if > $20", name: "manualApproval" },
                    { label: "Block out-of-policy payments", name: "blockOutOfPolicy" }
                  ].map((rule) => (
                    <label key={rule.name} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name={rule.name}
                        checked={(formData as any)[rule.name]}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 rounded border-[#E4ECE9] text-[#15803D] focus:ring-[#15803D]/20 cursor-pointer" 
                      />
                      <span className="text-[#475569] text-sm">{rule.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            <div className="mt-10 flex items-center justify-end gap-4">
              <button 
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-sm font-semibold text-[#666666] hover:text-[#1F2937] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-10 py-3 bg-[#15803D] text-white rounded-full text-sm font-bold hover:shadow-lg transition-all active:scale-95 shadow-md"
              >
                Create
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
