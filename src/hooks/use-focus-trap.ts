"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside `containerRef` while `active` is true.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
) {
  const prevActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) {
      return;
    }

    prevActiveElement.current = document.activeElement as HTMLElement | null;
    const root = containerRef.current;
    if (!root) {
      return;
    }

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter(
      (el) =>
        !el.hasAttribute("disabled") &&
        el.getAttribute("aria-hidden") !== "true",
    );

    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || nodes.length === 0) {
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }

    root.addEventListener("keydown", onKeyDown);
    return () => {
      root.removeEventListener("keydown", onKeyDown);
      prevActiveElement.current?.focus?.();
    };
  }, [active, containerRef]);
}
