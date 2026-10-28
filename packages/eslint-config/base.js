import { defineConfig, globalIgnores } from "eslint/config";

const baseConfig = defineConfig([
  globalIgnores([
    "dist/**",
    "build/**",
    ".next/**",
    "out/**",
    "node_modules/**",
  ]),
]);

export default baseConfig;
