import { defineConfig, globalIgnores } from "eslint/config";
import NEXT_VITALS from "eslint-config-next/core-web-vitals";
import NEXT_TYPESCRIPT from "eslint-config-next/typescript";

export default defineConfig([
  ...NEXT_VITALS,
  ...NEXT_TYPESCRIPT,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
