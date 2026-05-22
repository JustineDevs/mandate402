"use client";

import type React from "react";
import { useState } from "react";

interface TopNavProps {
  userAddress?: string;
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
  onWalletClick?: () => void;
}

/**
 * TopNav Component
 * Precise Search and Wallet/Status Pill.
 * Instrumented for event handling and dynamic data hydration.
 */
export const TopNav: React.FC<TopNavProps> = ({
  userAddress = "0x0000...0000",
  onSearch,
  onProfileClick,
  onWalletClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="flex items-center justify-between mb-12 border-b border-[#E4ECE9] pb-4">
      {/* Search Bar (Left-Aligned) */}
      <div className="relative w-full max-w-lg">
        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search mandates, agents, or transactions..."
          className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-sm text-[#1F2937] font-medium focus:outline-none placeholder-gray-500"
          aria-label="Search"
        />
      </div>

      {/* Wallet/Status Pill (Right-Aligned) */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onWalletClick}
          className="flex items-center gap-3 bg-white border border-[#E4ECE9] rounded-full pl-3 pr-4 py-1.5 shadow-sm hover:bg-gray-50 transition-all"
          aria-label="Wallet status and address"
        >
          {/* Coral-Red Status Indicator */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF4D4D]" />

          <span className="text-sm font-mono text-[#222222] font-medium tracking-tight">
            {userAddress}
          </span>

          {/* Gray Chevron Icon */}
          <svg
            className="w-4 h-4 text-gray-400"
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
        </button>

        {/* Profile Icon Shortcut */}
        <button
          type="button"
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-white border border-[#E4ECE9] flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 transition-all"
          aria-label="Profile settings"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};
