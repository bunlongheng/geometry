import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Reading client-only state (localStorage theme, DOM dataset) in a mount
    // effect is the intentional hydration-safe pattern in these 2 components;
    // keep the rule as a warning there only, an error everywhere else.
    files: [
      "components/ThemeToggle.tsx",
      "components/QuizGame.tsx",
      "components/QuizHeaderControls.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
