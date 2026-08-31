/**
 * Contagem de visita — Cloudflare Web Analytics.
 *
 * É a MEDIDA SECUNDÁRIA. A principal é a mensagem do WhatsApp, que carrega o
 * nome da peça e diz qual peça gerou cada conversa: isso mede gente falando com
 * a loja, que é o que o site existe para produzir. Esta aqui mede gente
 * passando, que é bom saber e não é a mesma coisa.
 *
 * Por que esta e não outra:
 *
 * · Não põe cookie e não faz fingerprint. O site não precisa de aviso de
 *   cookie, e nenhum dado pessoal é coletado — LGPD resolvida por não coletar,
 *   não por consentir.
 * · Grátis sem teto de visitas.
 * · Netlify Analytics foi descartada: mede do lado do servidor e não carrega
 *   script nenhum, o que seria melhor, mas custa por site e por mês.
 *
 * O preço desta escolha, e é real: o site deixa de ser "não carrega nada de
 * terceiro". Passa a buscar um arquivo no domínio da Cloudflare a cada visita.
 *
 * Sem o token, nada é renderizado. Isso é de propósito: em desenvolvimento e em
 * prévia de branch, medir seria sujar o número com a nossa própria navegação.
 */

const TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export function Cloudflare() {
  if (!TOKEN) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      // O beacon lê a configuração deste atributo, não de uma chamada de
      // função. Se a CSP barrar o arquivo, o site continua perfeito e a
      // contagem simplesmente não acontece — em silêncio, que é o modo mais
      // caro de falhar. Os dois domínios da Cloudflare estão liberados em
      // netlify.toml; mexer num sem mexer no outro quebra isso.
      data-cf-beacon={JSON.stringify({ token: TOKEN })}
    />
  );
}
