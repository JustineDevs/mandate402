"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

import { useFocusTrap } from "@/hooks/use-focus-trap";

export type OverlayModalVariant = "default" | "danger" | "panel";

const variantEyebrowClass: Record<OverlayModalVariant, string> = {
  default: "text-mandate-green-dark",
  danger: "text-accent-compliance",
  panel: "text-brand-control",
};

const defaultEyebrowLabel: Record<OverlayModalVariant, string> = {
  default: "Confirmation",
  danger: "Destructive action",
  panel: "Inspector",
};

type ModalProps = {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: OverlayModalVariant;
  /** Overrides variant default eyebrow label. */
  eyebrowLabel?: string;
  closeOnBackdrop?: boolean;
};

export function OverlayModal({
  title,
  description,
  open,
  onClose,
  children,
  variant = "default",
  eyebrowLabel,
  closeOnBackdrop = true,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDialogElement>(null);

  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const eyebrow = eyebrowLabel ?? defaultEyebrowLabel[variant];

  return (
    <dialog
      ref={panelRef}
      open
      aria-labelledby={titleId}
      className="fixed inset-0 z-[100] m-0 flex max-h-none w-full max-w-none items-center justify-center border-0 bg-ink/45 p-3 py-8 backdrop:bg-transparent sm:px-4"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-xl rounded-lg border border-hairline-strong bg-canvas shadow-[0_28px_80px_rgba(15,23,32,0.25)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-hairline px-5 py-5 sm:px-6">
          <div className="min-w-0 pr-3">
            <div
              className={`text-[11px] font-bold uppercase tracking-[0.24em] ${variantEyebrowClass[variant]}`}
            >
              {eyebrow}
            </div>
            <h2
              id={titleId}
              className="mt-2 text-xl font-bold text-charcoal sm:text-2xl"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 shrink-0 rounded-full border border-hairline px-3 py-2 text-xs font-bold text-slate hover:bg-surface-soft"
          >
            Close
          </button>
        </div>
        <div className="px-5 py-6 sm:px-6">{children}</div>
      </div>
    </dialog>
  );
}

type DrawerProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: OverlayModalVariant;
  eyebrowLabel?: string;
  closeOnBackdrop?: boolean;
};

export function OverlayDrawer({
  title,
  open,
  onClose,
  children,
  variant = "panel",
  eyebrowLabel,
  closeOnBackdrop = true,
}: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDialogElement>(null);

  useFocusTrap(open, panelRef);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const eyebrow = eyebrowLabel ?? defaultEyebrowLabel[variant];

  return (
    <dialog
      ref={panelRef}
      open
      aria-labelledby={titleId}
      className="fixed inset-0 z-[95] m-0 flex max-h-none w-full max-w-none justify-end border-0 bg-ink/40 p-0 backdrop:bg-transparent"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-hairline-strong bg-canvas shadow-[0_20px_70px_rgba(15,23,32,0.22)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-hairline bg-canvas px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div
                className={`text-[11px] font-bold uppercase tracking-[0.24em] ${variantEyebrowClass[variant]}`}
              >
                {eyebrow}
              </div>
              <h2
                id={titleId}
                className="mt-2 text-xl font-bold text-charcoal sm:text-2xl"
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 shrink-0 rounded-full border border-hairline px-3 py-2 text-xs font-bold text-slate hover:bg-surface-soft"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          {children}
        </div>
      </div>
    </dialog>
  );
}

type PopoverProps = {
  title: string;
  body: string;
};

export function InlinePopover({ title, body }: PopoverProps) {
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-mandate-green-dark">
        {title}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate">{body}</p>
    </div>
  );
}
