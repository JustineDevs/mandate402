"use client";

import type { Route } from "next";
import Link from "next/link";
import type React from "react";

export interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  activeTab?: string;
  navigationItems?: NavigationItem[];
  bottomItems?: NavigationItem[];
}

const defaultNavItems: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: (
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
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    name: "Mandates",
    href: "/mandates",
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    name: "Agents",
    href: "/agents",
    icon: (
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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    name: "Vendors",
    href: "/vendors",
    icon: (
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
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: (
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    name: "Receipts",
    href: "/receipts",
    icon: (
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
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
];

const defaultBottomItems: NavigationItem[] = [
  {
    name: "Policies",
    href: "/policies",
    icon: (
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
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    name: "Settings",
    href: "/settings",
    icon: (
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
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
];

const buildItem: NavigationItem = {
  name: "Build",
  href: "/build",
  icon: (
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
        d="M14.7 6.3a1 1 0 010 1.4L12.41 10l2.3 2.3a1 1 0 01-1.42 1.4l-3-3a1 1 0 010-1.4l3-3a1 1 0 011.41 0zM9.29 13.99a1 1 0 010-1.4L11.59 10l-2.3-2.3a1 1 0 011.42-1.4l3 3a1 1 0 010 1.4l-3 3a1 1 0 01-1.42 0z"
      />
    </svg>
  ),
};

/**
 * Sidebar Component
 * Reusable navigation for Mandate402.
 * Strictly adheres to vibrant diagonal linear gradient and glassmorphism states.
 */
export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = "Mandates",
  navigationItems = defaultNavItems,
  bottomItems = [...defaultBottomItems, buildItem],
}) => {
  return (
    <aside
      className="hidden md:flex md:w-72 flex-col fixed h-full z-40 text-white"
      style={{
        background: "linear-gradient(135deg, #16a34a 0%, #14532d 100%)",
      }}
      aria-label="Sidebar navigation"
    >
      <div className="p-8 flex-1 flex flex-col h-full justify-between">
        <div className="flex-1">
          {/* Brand Logo */}
          <div className="mb-12 px-4">
            <h1 className="text-white font-extrabold text-2xl tracking-tight">
              Mandate402
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main links">
            {navigationItems.map((item) => {
              const content = (
                <>
                  <div
                    className={
                      item.name === activeTab ? "text-white" : "text-white/75"
                    }
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  {item.name}
                </>
              );

              const className = `flex items-center gap-4 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
                item.name === activeTab
                  ? "bg-white/10 text-white"
                  : "text-white/75 hover:text-white hover:bg-white/5"
              }`;

              if (!item.href) {
                return (
                  <button key={item.name} type="button" className={className}>
                    {content}
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href as Route}
                  className={className}
                  aria-current={item.name === activeTab ? "page" : undefined}
                >
                  {content}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Links */}
        <nav className="space-y-1" aria-label="Secondary links">
          {bottomItems.map((item) => {
            const content = (
              <>
                <div
                  className={
                    item.name === activeTab ? "text-white" : "text-white/75"
                  }
                  aria-hidden="true"
                >
                  {item.icon}
                </div>
                {item.name}
              </>
            );

            const className = `flex items-center gap-4 py-3 px-4 text-sm font-semibold rounded-xl transition-all ${
              item.name === activeTab
                ? "bg-white/10 text-white"
                : "text-white/75 hover:text-white hover:bg-white/5"
            }`;

            if (!item.href) {
              return (
                <button key={item.name} type="button" className={className}>
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href as Route}
                className={className}
                aria-current={item.name === activeTab ? "page" : undefined}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
