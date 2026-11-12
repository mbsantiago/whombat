import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import { fixupConfigRules } from "@eslint/compat";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: fixupConfigRules(compat.extends(
        "next/core-web-vitals",
        "plugin:import/recommended",
        "plugin:import/typescript",
        "plugin:storybook/recommended",
        "plugin:@tanstack/eslint-plugin-query/recommended",
    )),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    rules: {
        "import/no-unresolved": "error",
    },
}]);