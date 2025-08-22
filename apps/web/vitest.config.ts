/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    css: false, // Disable CSS processing for faster tests
    coverage: {
      provider: "v8",
      reporter: ["text"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "coverage/",
        "**/*.d.ts",
        "vitest.config.ts",
        "vite.config.ts",
        "tailwind.config.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
  },
});
