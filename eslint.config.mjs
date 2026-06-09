import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs", // Matches your Express setup
      globals: {
        ...globals.node, // Tells ESLint about process.env, __dirname, etc.
        ...globals.jest, // Prevents errors when we set up Jest tests next
      },
    },
    rules: {
      "no-unused-vars": "warn", // Warns if you declare a variable but never use it
      "no-console": "off",      // Allows console.log for your backend debugging
      "no-undef": "error"       // Blocks using undeclared variables
    },
  },
];