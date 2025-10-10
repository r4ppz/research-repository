import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist/**", "build/**", "node_modules/**", "eslint.config.js"],
  },

  js.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 2024,
        sourceType: "module",
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
      prettier: prettierPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        alias: {
          map: [["@", "./src"]],
          extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
      },
      react: {
        version: "detect",
      },
    },
    rules: {
      ...(tsPlugin.configs?.recommended?.rules ?? {}),
      ...(reactHooks.configs?.recommended?.rules ?? {}),
      "prettier/prettier": ["error", { endOfLine: "auto" }],
      "react-hooks/exhaustive-deps": "error",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, allowExportNames: ["meta", "links", "headers"] },
      ],
      "import/no-unused-modules": "off",
      "import/no-unresolved": "error",
      "import/no-cycle": ["error", { maxDepth: 10 }],
      "import/no-self-import": "error",
      "import/no-duplicates": ["error", { "prefer-inline": true }],
      "import/consistent-type-specifier-style": ["error", "prefer-inline"],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "never",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": ["error"],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ["vite.config.ts"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        process: "readonly",
        require: "readonly",
      },
    },
  },
];
