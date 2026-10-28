import baseConfig from "@avenro/prettier-config";

const prettierConfig = {
  ...baseConfig,
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  tailwindStylesheet: "app/globals.css",
  tailwindFunctions: ["cn", "cva"],
  importOrder: [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]",
  ],
};

export default prettierConfig;
