import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * A ficha da peça, como a dona da loja a vê.
 *
 * Todo rótulo aqui está no vocabulário do balcão: "peça", "grade", "esgotada",
 * "entrou na loja". Nada de "produto", "SKU", "variante" ou "inventário" — ela
 * não fala assim, e cada palavra de e-commerce neste formulário é um instante a
 * mais de dúvida com a peça na mão e cliente esperando.
 *
 * As descrições de campo não explicam o que o campo é (isso o nome já diz).
 * Elas explicam a REGRA — por que a grade não é quantidade, por que a data
 * importa, por que a medida vale a pena. É o único lugar onde essas regras
 * chegam a quem preenche.
 *
 * O espelho deste arquivo é lib/tipos.ts. Mudou um, muda o outro.
 */

const CATEGORIAS = [
  "vestido",
  "blusa",
  "camisa",
  "calça",
  "saia",
  "short",
  "macacão",
  "conjunto",
  "casaco",
  "tricô",
  "acessório",
];

const TAMANHOS = [
  "PP",
  "P",
  "M",
  "G",
  "GG",
  "U",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
];

const CORES = [
  "preto",
  "off-white",
  "cru",
  "areia",
  "caramelo",
  "terracota",
  "ferrugem",
  "vinho",
  "verde-oliva",
  "verde-musgo",
  "azul-marinho",
  "jeans claro",
  "jeans escuro",
  "cinza-mescla",
  "rosa-seco",
  "mostarda",
  "estampado",
  "listrado",
];

const comoLista = (valores: string[]) =>
  valores.map((valor) => ({ title: valor, value: valor }));

export const peca = defineType({
  name: "peca",
  title: "Peça",
  type: "document",

  // A ordem dos grupos é a ordem em que ela preenche com a peça na mão:
  // primeiro o que dá para ver, depois o que precisa de fita métrica.
  groups: [
    { name: "essencial", title: "O básico", default: true },
    { name: "detalhe", title: "Detalhes" },
    { name: "vitrine", title: "Na vitrine" },
  ],

  fields: [
    defineField({
      name: "nome",
      title: "Nome da peça",
      type: "string",
      group: "essencial",
      description:
        "Como você chamaria a peça para uma cliente. Ex.: “Vestido midi de viscose”.",
      validation: (regra) => regra.required().max(60),
    }),

    defineField({
      name: "slug",
      title: "Endereço no site",
      type: "slug",
      group: "essencial",
      description:
        "Gerado a partir do nome. Só mexa se precisar — mudar isso quebra o link que já foi mandado para alguém no WhatsApp.",
      options: { source: "nome", maxLength: 60 },
      validation: (regra) => regra.required(),
    }),

    defineField({
      name: "fotos",
      title: "Fotos",
      type: "array",
      group: "essencial",
      description:
        "De uma a quatro. A primeira é a que aparece na vitrine. Pode mandar a foto do celular do jeito que está — o site reduz sozinho.",
      of: [
        defineArrayMember({
          type: "image",
          // O ponto de interesse decide o que fica no recorte 3:4 da vitrine.
          // Sem ele, uma foto na horizontal perde a peça e sobra parede.
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Descrição da foto",
              type: "string",
              description:
                "Opcional. Para quem usa leitor de tela. Se ficar vazio, o site escreve uma a partir do nome, do tecido e das cores.",
            }),
          ],
        }),
      ],
      validation: (regra) => regra.required().min(1).max(4),
    }),

    defineField({
      name: "preco",
      title: "Preço",
      type: "number",
      group: "essencial",
      description: "Em reais. Só o número: 189 ou 189,90.",
      validation: (regra) => regra.required().positive(),
    }),

    defineField({
      name: "categoria",
      title: "Tipo de peça",
      type: "string",
      group: "essencial",
      options: { list: comoLista(CATEGORIAS) },
      validation: (regra) => regra.required(),
    }),

    defineField({
      name: "tamanhos",
      title: "Grade que a peça veste",
      type: "array",
      group: "essencial",
      description:
        "Os tamanhos em que esta peça existe — NÃO quantas você tem. O site nunca mostra quantidade: quem confirma se ainda tem é você, na conversa.",
      of: [defineArrayMember({ type: "string" })],
      options: { list: comoLista(TAMANHOS) },
      validation: (regra) => regra.required().min(1),
    }),

    defineField({
      name: "cores",
      title: "Cores",
      type: "array",
      group: "essencial",
      description:
        "As mais comuns, para marcar num toque. Se a cor da peça não estiver aqui, deixe em branco e escreva no campo abaixo.",
      of: [defineArrayMember({ type: "string" })],
      options: { list: comoLista(CORES) },
      /**
       * Não é mais obrigatório sozinho.
       *
       * Era, e isso criava um beco: peça amarela, nenhum "amarelo" na lista, e
       * o formulário se recusando a salvar. A regra agora é "pelo menos uma
       * das duas" — e ela vive aqui, no campo de cima, porque é onde a pessoa
       * está olhando quando o problema aparece.
       */
      validation: (regra) =>
        regra.custom((cores, contexto) => {
          const outra = (contexto.document?.outraCor as string | undefined)?.trim();
          if ((cores?.length ?? 0) > 0 || outra) return true;
          return "Marque uma cor na lista, ou escreva a cor em “Outra cor”.";
        }),
    }),

    defineField({
      name: "outraCor",
      title: "Outra cor",
      type: "string",
      group: "essencial",
      description:
        "Só quando a cor não estiver na lista acima. Escreva como você falaria para uma cliente: “lilás”, “amarelo-queimado”, “xadrez vichy”.",
      validation: (regra) => regra.max(40),
    }),

    defineField({
      name: "situacao",
      title: "Situação",
      type: "string",
      group: "essencial",
      description:
        "Peça esgotada não some do site: ela ganha o selo “Já foi” e o botão vira “quero uma parecida”. Depois de trinta dias ela sai sozinha.",
      options: {
        list: [
          { title: "Disponível", value: "disponivel" },
          { title: "Esgotada", value: "esgotada" },
        ],
        layout: "radio",
      },
      initialValue: "disponivel",
      validation: (regra) => regra.required(),
    }),

    defineField({
      name: "tecido",
      title: "Tecido",
      type: "string",
      group: "detalhe",
      description:
        "Uma palavra: viscose, linho, tricoline, malha canelada. É o que responde “é quente?” sem você precisar digitar.",
    }),

    defineField({
      name: "medidas",
      title: "Medidas da peça",
      type: "string",
      group: "detalhe",
      description:
        "O campo que mais economiza conversa: “serve em mim?” é a pergunta que mais trava a compra. Ex.: “Busto 88 · cintura 70 · comprimento 96”. Vale a pena nas peças mais caras.",
    }),

    defineField({
      name: "descricao",
      title: "Observação",
      type: "text",
      rows: 2,
      group: "detalhe",
      description:
        "Uma ou duas linhas, se tiver algo que a foto não mostra. Pode deixar vazio — a maioria das peças não precisa.",
      validation: (regra) => regra.max(220),
    }),

    defineField({
      name: "dataEntrada",
      title: "Entrou na loja em",
      type: "date",
      group: "vitrine",
      description:
        "É esta data que monta a seção “Chegou agora”. Depois de três semanas a peça sai dos destaques sozinha e fica só no catálogo.",
      options: { dateFormat: "DD/MM/YYYY" },
      /**
       * Já vem com a data de hoje.
       *
       * Ela cadastra a peça no dia em que a peça chega — é o caso em
       * praticamente cem por cento das vezes. Abrir um calendário para
       * confirmar o dia de hoje seria um toque a mais na ação que ela mais
       * repete, e o campo que sobra na tela é justamente o que fica errado
       * quando há pressa. Continua editável para quando ela cadastrar atrasado.
       */
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (regra) => regra.required(),
    }),

    defineField({
      name: "destaque",
      title: "Fixar na vitrine",
      type: "boolean",
      group: "vitrine",
      description:
        "Prende a peça no alto da página inicial, como o manequim da porta. Use em no máximo seis — se tudo é destaque, nada é.",
      initialValue: false,
    }),
  ],

  // A lista do painel mostra foto, nome e preço, e avisa quando a peça está
  // esgotada. É a tela que ela mais olha, e ela precisa achar a peça pela foto.
  preview: {
    select: {
      title: "nome",
      preco: "preco",
      situacao: "situacao",
      media: "fotos.0",
    },
    prepare({ title, preco, situacao, media }) {
      const valor =
        typeof preco === "number"
          ? preco.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "sem preço";

      return {
        title: situacao === "esgotada" ? `${title} — JÁ FOI` : title,
        subtitle: valor,
        media,
      };
    },
  },

  orderings: [
    {
      name: "entradaRecente",
      title: "Mais recentes primeiro",
      by: [{ field: "dataEntrada", direction: "desc" }],
    },
  ],
});
