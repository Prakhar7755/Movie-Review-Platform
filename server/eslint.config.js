export default [
  {
    files: ["**/*.js"], // only check .js files
    rules: {
      semi: "error", // force semicolon
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
