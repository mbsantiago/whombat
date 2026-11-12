import { fileURLToPath } from "node:url";

import { defineConfig } from "vite-plus";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    tsconfigPaths: true,
  },
  fmt: {
    printWidth: 80,
    singleQuote: false,
    ignorePatterns: [],
    sortImports: {
      newlinesBetween: true,
    },
  },
  lint: {
    plugins: ["nextjs", "react", "import"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      "typescript/unbound-method": "off",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
});
