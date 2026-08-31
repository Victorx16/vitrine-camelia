import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? "production",
  },
  // Vira https://camelia.sanity.studio. É o endereço que a dona salva na tela
  // inicial do celular.
  studioHost: "camelia",

  deployment: {
    /**
     * Qual aplicação este `deploy` atualiza.
     *
     * Sem isto a CLI pergunta a cada publicação, e a resposta errada não dá
     * erro: ela cria um SEGUNDO Studio. A dona continuaria usando o primeiro,
     * cadastrando peças que ninguém veria — e o culpado seria uma pergunta
     * respondida no automático meses antes.
     *
     * Não é segredo: identifica a aplicação publicada, não dá acesso a nada.
     */
    appId: "le67ukcnmc1m3htytgf73d72",
  },
})
