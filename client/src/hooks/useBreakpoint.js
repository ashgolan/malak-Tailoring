/**
 * useBreakpoint.js
 * ────────────────
 * מחזיר את breakpoint הנוכחי: "mobile" | "tablet" | "desktop"
 *
 * גבולות:
 *   mobile:  < 768px
 *   tablet:  768px – 1023px
 *   desktop: ≥ 1024px
 *
 * שימוש:
 *   const bp = useBreakpoint();
 *   const isMobile  = bp === "mobile";
 *   const isTablet  = bp === "tablet";
 *   const isDesktop = bp === "desktop";
 *   const isNarrow  = bp !== "desktop";  // mobile + tablet
 */

import { useState, useEffect } from "react";

const getBreakpoint = (w = window.innerWidth) => {
  if (w < 768)  return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
};

export function useBreakpoint() {
  const [bp, setBp] = useState(() => getBreakpoint());

  useEffect(() => {
    const handler = () => setBp(getBreakpoint());
    const mql = window.matchMedia("(max-width: 1023px)");
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return bp;
}

// Convenience booleans hook
export function useBreakpointFlags() {
  const bp = useBreakpoint();
  return {
    bp,
    isMobile:  bp === "mobile",
    isTablet:  bp === "tablet",
    isDesktop: bp === "desktop",
    isNarrow:  bp !== "desktop",   // mobile + tablet
  };
}
