import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Les variables préfixées par _ sont volontairement inutilisées (paramètres imposés).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Pas de console.log oublié ; console.warn et console.error restent permis.
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // Composants du design system Délibéra UI : copiés par la CLI delibera-ui, maintenus dans le
    // dépôt delibera-ui. Ne pas les modifier ici (AGENT.md, section 5).
    "src/components/ui/**",
    "src/lib/utils.ts",
    "src/lib/with-ref.ts",
  ]),
]);

export default eslintConfig;
