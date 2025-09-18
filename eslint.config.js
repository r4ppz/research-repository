import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked, // stricter TS rules
      tseslint.configs.stylisticTypeChecked, // optional style rules
      reactHooks.configs["recommended-latest"], // React Hooks rules
      reactRefresh.configs.vite, // Fast Refresh rules
      reactX.configs["recommended-typescript"], // React-specific rules
      reactDom.configs.recommended, // React DOM-specific rules
      prettier // disables conflicting ESLint rules
    ],
    plugins: {
      prettier: prettierPlugin, // run prettier as ESLint rule
    },
    rules: {
      "prettier/prettier": "error", // mark prettier issues as lint errors
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
]);
