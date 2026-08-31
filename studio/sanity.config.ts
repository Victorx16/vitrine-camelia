import { ptBRLocale } from "@sanity/locale-pt-br";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";

/**
 * O painel da Camélia.
 *
 * Ele NÃO mora dentro do site. O site é exportado como HTML estático e não tem
 * servidor; embutir o Studio numa rota exigiria voltar a ter runtime, que é
 * exatamente o que o projeto abre mão de propósito. O Studio é hospedado de
 * graça pela própria Sanity, em camelia.sanity.studio, e roda bem em navegador
 * de celular — que é onde a dona vai usá-lo, de dentro da loja.
 *
 * Fluxo completo: ela publica aqui → um webhook bate no build hook da Netlify →
 * a Netlify gera o site → um ou dois minutos depois a peça está no ar.
 */
export default defineConfig({
  name: "camelia",
  title: "Camélia",

  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",

  plugins: [
    /**
     * O painel inteiro em português.
     *
     * Os rótulos dos campos já estavam no vocabulário dela, mas tudo em volta —
     * "Publish", "Create new", "Discard changes" — vinha em inglês, que é o
     * padrão da Sanity. Metade do formulário na língua dela e metade não é pior
     * do que tudo em inglês: parece defeito.
     */
    ptBRLocale(),
    structureTool({ title: "Peças" }),
    // Console de consulta GROQ. Fica fora da publicação para não aparecer como
    // uma aba incompreensível no painel dela.
    ...(process.env.NODE_ENV === "development" ? [visionTool()] : []),
  ],

  schema: { types: schemaTypes },

  document: {
    // Ela não cria mais nada além de peça. Um menu "criar novo" com um item só
    // é um menu a menos para entender.
    newDocumentOptions: (itens) =>
      itens.filter((item) => item.templateId === "peca"),
  },
})
