import path from "node:path";
import type { NextConfig } from "next";

/*
 * next-intl sem o plugin `next-intl/plugin`.
 * O plugin carrega @swc/core no topo do arquivo, e o binário nativo do SWC se recusa a
 * rodar quando a pasta de cache herda permissão de escrita de "Usuários autenticados"
 * (padrão em pastas criadas na raiz do C:\ no Windows). Para o nosso uso, o plugin só
 * faz o alias abaixo — então configuramos direto.
 */
const requestConfig = "./src/i18n/request.ts";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "next-intl/config": requestConfig,
    },
  },
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias = { ...config.resolve.alias, "next-intl/config": path.resolve(requestConfig) };
    return config;
  },
};

export default nextConfig;
