import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-unused-vars": "error", // Disallows unused variables and functions
      "no-console": "error", // Disallows console.log statements
      "prefer-const": "error", // Disallows let if variables are not reassigned
      quotes: ["error", "double"], // Enforces the use of double quotes over single quotes
      semi: ["error", "always"], // Enforces semicolons at the end of statements
      "no-multiple-empty-lines": ["error", { max: 1 }], // Disallows multiple empty lines
      "no-extra-semi": "error", // Disallows unnecessary semicolons
      "react/no-array-index-key": "warn",
      "react/react-in-jsx-scope": "off",
      "no-undef": "off",
    },
  },
]);

export default eslintConfig;
