import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // The app loads every screen through an async thunk or fetch in an
      // effect. The React Compiler rule cannot see through that boundary and
      // reports the follow-up setState as if it ran synchronously.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["components/common/data-table.tsx", "components/common/table-grid.tsx", "components/common/table-types.ts"],
    rules: {
      // These primitives are generic over arbitrary row shapes; the column
      // renderer is the one place where the caller narrows the value.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);
