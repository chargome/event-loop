/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
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
        "drizzle.config.ts",
        "**/*.test.ts",
        "**/*.spec.ts",
      ],
    },
  },
});
