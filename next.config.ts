import type { NextConfig } from "next";

// Cabeçalhos de segurança em modo de desenvolvimento.
//
// No build de produção este bloco é ignorado: com `output: "export"` não existe
// servidor Next para aplicar cabeçalho nenhum. Em produção quem manda é o
// `netlify.toml`, e é lá que eles precisam ser editados.
//
// A duplicação existe para que um recurso bloqueado em produção não passe
// despercebido no desenvolvimento. 'unsafe-eval' entra só aqui, porque o Fast
// Refresh depende de eval().
const cspDesenvolvimento = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  /**
   * Export estático. O site não tem nada que precise de servidor: sem carrinho,
   * sem checkout, sem rota de API, sem conta de cliente. O catálogo inteiro é
   * conhecido no build.
   *
   * Isto não muda quando o CMS entrar. A Sanity publica, um webhook dispara o
   * build, o build lê o conteúdo e cospe HTML. Migrar para SSR para "ficar
   * dinâmico" seria trocar um site que abre instantaneamente por um que depende
   * de servidor para mostrar um vestido.
   */
  output: "export",

  /**
   * O otimizador de imagem do Next é um serviço de servidor e não existe num
   * site exportado. Antes, o projeto usava `unoptimized: true` — uma imagem só,
   * do mesmo tamanho para todo mundo.
   *
   * O `loader` custom devolve o srcset de verdade sem servidor nenhum: quem
   * redimensiona é o CDN da Sanity, por parâmetro de URL, e o navegador escolhe
   * a largura que precisa. É por isso que a Sanity foi escolhida em vez de um
   * CMS baseado em git — ver DECISOES.md.
   *
   * O mesmo loader deixa passar intocado o que não vem do CDN, então as fotos
   * locais de /public/pecas continuam funcionando enquanto a Sanity não existe.
   */
  images: {
    loader: "custom",
    loaderFile: "./lib/sanity/loader.ts",
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: cspDesenvolvimento },
        ],
      },
    ];
  },
};

export default nextConfig;
