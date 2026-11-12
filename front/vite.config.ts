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
  lint: {
    plugins: ["nextjs", "react", "import"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    rules: {
      'typescript/unbound-method': "off",
    },
  },
});
