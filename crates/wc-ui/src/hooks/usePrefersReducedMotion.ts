import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Returns true when the OS-level "Reduce motion" preference is on.
 * Polish callers use this to swap variant durations from
 * DURATION_BASE → DURATION_FAST (or drop variants entirely).
 *
 * Lives outside src/lib/ because it is a hook (Rule 4 — hooks in
 * src/hooks/, one per file).
 */
export function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(QUERY);
    const handler = (event: MediaQueryListEvent) => setPrefers(event.matches);

    // addEventListener is preferred over the deprecated addListener but
    // the older API ships on some older WebView2 builds; fall back if so.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    // Fallback for legacy MediaQueryList implementations.
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, []);

  return prefers;
}
