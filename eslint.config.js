import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist", "node_modules"],
  },

  // Base TypeScript support
  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],

    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: globals.browser,
    },

    // All plugins registered
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
      prettier,
    },

    rules: {
      // --- General ---
      "no-unused-vars": "warn",
      "no-console": "warn",
      "no-debugger": "error",
      "no-var": "error",

      // --- Import sorting ---
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", ["sibling", "parent"], "index"],
          "newlines-between": "never",
        },
      ],

      // --- React hooks + Fast Refresh (Vite) ---
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // --- Formatting style rules ---
      "max-len": [
        "warn",
        {
          code: 100,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
        },
      ],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "comma-dangle": ["error", "always-multiline"],
      indent: ["error", 2],

      // Enforce Prettier formatting inside ESLint
      "prettier/prettier": "error",
    },
  },
];
