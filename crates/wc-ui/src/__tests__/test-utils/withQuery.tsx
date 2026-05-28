import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Test helper: wrap a `renderHook` or `render` call in a fresh
 * `QueryClientProvider` so TanStack Query hooks can run inside the
 * Vitest jsdom environment. Each call gets its own client so tests
 * stay isolated (no shared cache).
 */
export function makeQueryWrapper() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { client, Wrapper };
}
