"use client";

import type React from "react";

/**
 * Sidebar Component
 * Reusable navigation for Mandate402
 * Style: Deep Green (#15803D)
 */
export const Sidebar: React.FC<{ activeTab?: string }> = ({
  activeTab = "Mandates",
}) => {
  const navItems = [
    { name: "Dashboard", href: "/" },
    { name: "Mandates", href: "/mandates" },
    { name: "Agents", href: "#" },
    { name: "Vendors", href: "#" },
    { name: "Transactions", href: "#" },
    { name: "Policies", href: "#" },
    { name: "Receipts", href: "#" },
    { name: "Settings", href: "#" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 bg-[#15803D] flex-col fixed h-full z-40">
      <div className="p-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
            <span className="text-white font-bold text-xl">M4</span>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-tight">
            Mandate402
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                item.name === activeTab
                  ? "bg-white/10 text-white shadow-inner border border-white/10"
                  : "text-green-50/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer Status */}
      <div className="mt-auto p-8">
        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs text-green-50/50 mb-1 font-medium uppercase tracking-wider">
            Morph Hoodi
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <p className="text-sm text-white font-mono truncate">Connected</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
