import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import { SettingsProvider } from "../context/SettingsContext";

type CustomRenderOptions = Omit<RenderOptions, "wrapper"> & {
  routerProps?: MemoryRouterProps;
  queryClient?: QueryClient;
};

/**
 * Creates a fresh QueryClient configured for testing:
 * - No retries (tests should fail fast).
 * - No garbage collection time (clean up immediately).
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

/**
 * Renders a component wrapped in all required providers:
 * - QueryClientProvider (with a fresh, non-retrying client per test)
 * - SettingsProvider (global settings context)
 * - MemoryRouter (for components that use react-router hooks)
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    routerProps = {},
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: CustomRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <MemoryRouter {...routerProps}>{children}</MemoryRouter>
        </SettingsProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

// Re-export everything from RTL for convenience.
export * from "@testing-library/react";
// Override the default render with our wrapped version.
export { renderWithProviders as render };
