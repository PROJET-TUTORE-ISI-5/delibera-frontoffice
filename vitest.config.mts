import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Tests unitaires et de composants (AGENT.md, section 8). Les Server Components asynchrones ne se
// testent pas ici : leur comportement est vérifié par le test de fumée du pipeline.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: { NEXT_PUBLIC_BASE_PATH: "/app", TZ: "UTC" },
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/modules/**", "src/app/api/**", "src/components/espace/**"],
      exclude: ["**/*.test.*", "src/lib/utils.ts", "src/lib/with-ref.ts"],
      reporter: ["text", "html"],
    },
  },
});
