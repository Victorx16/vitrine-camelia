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

/** O endereço da peça, absoluto. Vai dentro da mensagem, para ser clicável. */
function enderecoDaPeca(peca: Peca) {
  return `${LOJA.url}/pecas/${peca.slug}`;
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
 *
 * ------------------------------------------------------------------------
 * **O endereço da peça vai junto, em linha própria.** Três motivos, e o
 * terceiro só apareceu ao descobrir que a loja usa uma assistente de IA da Meta
 * atendendo antes da dona:
 *
 * 1. A dona abre a peça exata enquanto responde, em vez de procurar pelo nome
 *    num catálogo de cento e cinquenta.
 * 2. A cliente encaminha a conversa para uma amiga e a peça vai junto — hoje
 *    ela teria de descrever de novo.
 * 3. A assistente que responde primeiro não conhece o catálogo. Com o endereço
 *    na mensagem, ela tem para onde apontar em vez de adivinhar preço — e
 *    preço divergente entre o site e o WhatsApp da mesma loja destrói confiança
 *    mais rápido do que qualquer coisa que o site construa.
 *
 * Linha própria porque o WhatsApp só transforma em link o que consegue separar
 * do texto; grudado numa frase, com ponto final logo depois, o endereço vira
 * texto morto em alguns aparelhos.
 * ------------------------------------------------------------------------
 */
export function mensagemPeca(peca: Peca) {
  if (peca.situacao === "esgotada") {
    return link(
      `Oi! Vi que esta peça já saiu do site: ${peca.nome}. Você tem alguma parecida?` +
        `\n${enderecoDaPeca(peca)}`,
    );
  }

  // "Vi no site" saiu: o endereço logo abaixo já diz de onde veio, e repetir a
  // origem em duas formas é o tipo de gordura que faz uma mensagem pré-escrita
  // parecer escrita por máquina.
  return link(
    `Oi! Tenho interesse nesta peça: ${peca.nome}, ${preco(peca.preco)}.` +
      `\n${enderecoDaPeca(peca)}`,
  );
}

/** O botão do rodapé e do cabeçalho: conversa sem peça definida. */
export function mensagemLoja() {
  return link(`Oi! Vi o site da ${LOJA.nome} e queria tirar uma dúvida.`);
}
