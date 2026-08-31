import { LOJA } from "@/lib/constants";
import { preco } from "@/lib/formato";
import type { Peca } from "@/lib/tipos";

/**
 * O único mecanismo de conversão do site, e a medição inteira dele.
 *
 * A mensagem carrega o nome da peça. A dona abre o WhatsApp e vê qual peça
 * gerou cada conversa — mede lead, não clique, não depende de rastreador e não
 * coleta dado de ninguém. Se um dia entrar contagem de visita, ela é adicional
 * a isto, nunca substituta.
 */

function link(mensagem: string) {
  return `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * As duas mensagens são construídas SEM artigo antes do nome da peça.
 *
 * "Tenho interesse no Vestido" está certo e "Tenho interesse no Blusa" está
 * errado, e o gênero não está no dado: `nome` é texto livre e `categoria` só
 * acerta o artigo na maioria das vezes, não sempre. Concordância errada numa
 * mensagem que a cliente lê antes de enviar é exatamente o detalhe que denuncia
 * "site automático" — então a frase foi escrita para não precisar de artigo.
 * Vale para qualquer catálogo: numa adega o problema seria "no Vinho" / "na
 * Cerveja".
 */
export function mensagemPeca(peca: Peca) {
  if (peca.situacao === "esgotada") {
    return link(
      `Oi! Vi que esta peça já saiu do site: ${peca.nome}. Você tem alguma parecida?`,
    );
  }

  return link(
    `Oi! Tenho interesse nesta peça: ${peca.nome}, ${preco(peca.preco)}. Vi no site.`,
  );
}

/** O botão do rodapé e do cabeçalho: conversa sem peça definida. */
export function mensagemLoja() {
  return link(`Oi! Vi o site da ${LOJA.nome} e queria tirar uma dúvida.`);
}
