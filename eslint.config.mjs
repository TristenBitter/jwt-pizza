import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import jestPlugin from "eslint-plugin-jest";

export default [
  // Base JS rules
  js.configs.recommended,

  // TypeScript support
  ...tseslint.configs.recommended,

  // React support
  {
    files: ["**/*.jsx", "**/*.tsx"],
    plugins: { react: reactPlugin },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed for React 17+
      "react/prop-types": "off", // You use TypeScript for props
    },
  },

  // Jest test support
  {
    files: ["**/*.test.js", "**/*.test.ts", "**/*.test.jsx", "**/*.test.tsx"],
    plugins: { jest: jestPlugin },
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      "jest/expect-expect": "warn",
    },
  },

  // Node support
  {
    files: ["*.js", "*.cjs", "service.js", "index.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
