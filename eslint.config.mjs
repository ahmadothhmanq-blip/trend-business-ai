import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local audit / temp artifacts
    ".tmp/**",
  ]),
  {
    rules: {
      // Legitimate client data-fetch / URL-sync patterns trip this React Compiler rule.
      // Keep immutability and other hooks rules; avoid mass-rewriting unrelated panels.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
