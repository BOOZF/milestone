module.exports = {
  extends: ["next/core-web-vitals", "eslint:recommended"],
  rules: {
    // Change unused variables from errors to warnings
    "no-unused-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn",

    // Optional: You may also want to add these common adjustments
    "no-console": "warn", // Warning for console.log
    "react/prop-types": "off", // Turn off prop-types as we're using TypeScript
  },
};
