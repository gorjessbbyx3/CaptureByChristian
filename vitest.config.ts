import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
    include: ["**/*.{test,spec}.{js,ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "dist/**",
      "build/**",
      "client/**",
      "realest/**",
    ],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "dist/",
        "build/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@server": path.resolve(__dirname, "./server"),
      "@client": path.resolve(__dirname, "./client"),
    },
  },
});
