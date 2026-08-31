import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // O studio/ é um projeto Sanity separado, com package.json, tsconfig e
  // node_modules próprios. Ele se verifica sozinho com `pnpm typecheck` lá
  // dentro; deixá-lo aqui faria o lint do site depender de dependências que
  // uma instalação só da raiz não tem.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
    "studio/**",
  ]),
]);

export default eslintConfig;
