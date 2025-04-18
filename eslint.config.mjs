import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";

const cleanBrowserGlobals = Object.fromEntries(
  Object.entries(globals.browser).map(([key, value]) => [key.trim(), value])
);

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: cleanBrowserGlobals,
    },
  },
  {
    files: ["webpack.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/__tests__/**/*.js"],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);
