import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import baseConfig from "./base.js";

const nextConfig = defineConfig([
  ...baseConfig,
  ...nextVitals,
  ...nextTs,
  globalIgnores(["next-env.d.ts"]),
]);

export default nextConfig;
