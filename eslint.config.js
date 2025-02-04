import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import solid from "eslint-plugin-solid";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
      globals: {
        ...globals.browser,
        // ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      solid,
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...solid.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  prettier,
];
