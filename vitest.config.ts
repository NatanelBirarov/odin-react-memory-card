/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: "v8",
      include: ["src/scripts/**", "src/components/**", "server/src/**"],
      exclude: [
        "**/__tests__/**",
        "**/*.test.{ts,tsx}",
        "src/test/**",
        "**/*.d.ts",
      ],
      reporter: ["text", "html", "lcov"],
    },
    projects: [
      {
        test: {
          name: "client",
          globals: true,
          environment: "jsdom",
          setupFiles: ["./src/test/setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["e2e/**", "node_modules", "dist"],
        },
      },
      {
        test: {
          name: "server",
          globals: true,
          environment: "node",
          include: ["server/**/*.test.ts"],
          exclude: ["e2e/**", "node_modules", "dist"],
        },
      },
    ],
  },
});
