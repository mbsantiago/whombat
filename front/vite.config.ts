import { defineConfig } from "vite-plus";

export default defineConfig({
  fmt: {
    printWidth: 80,
    singleQuote: false,
    ignorePatterns: [],
    sortImports: {
      newlinesBetween: true,
    },
  },
});
