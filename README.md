# Camélia — vitrine de boutique

Modelo de demonstração da Code VX. Loja fictícia; não é trabalho entregue a
cliente e não conta no placar de projetos no ar do estúdio.

O porquê de cada decisão está em [DECISOES.md](DECISOES.md). Este arquivo é só
como rodar e como ligar as contas.

```bash
pnpm install && pnpm dev
```

Sem nenhuma variável de ambiente, o site roda inteiro: o catálogo vem de
`content/pecas.ts` e as fotos de `public/pecas/`. É assim que a demonstração do
portfólio funciona, e é assim que ela continua funcionando se a Sanity sair do
ar.

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Export estático em `out/` |
| `pnpm lint` | ESLint |
| `pnpm contrast` | Audita o contraste da paleta; sai com erro se algum par com texto reprovar em AA |

O build gera também `/sitemap.xml`, `/robots.txt` e uma imagem de
compartilhamento por peça — abra `out/opengraph-image` depois de um `pnpm build`
para ver o cartão da home.

---

## Ligar as contas

Nada abaixo é necessário para o site rodar. Cada bloco liga uma capacidade, e
cada um pode ser feito separado.

### 1. Painel de conteúdo (Sanity)

O Studio não fica dentro do site — é hospedado de graça pela Sanity e roda em
navegador de celular, que é onde a dona da loja vai usá-lo.

1. Crie um projeto em [sanity.io/manage](https://sanity.io/manage) com o dataset
   `production`. Anote o **Project ID**.
2. No `studio/`, copie `.env.example` para `.env` e preencha
   `SANITY_STUDIO_PROJECT_ID`.
3. Na raiz, copie `.env.example` para `.env.local` e preencha
   `NEXT_PUBLIC_SANITY_PROJECT_ID` com o mesmo valor.
4. Publique o painel:

```bash
cd studio && pnpm install && pnpm deploy
```

Ele vai para `https://camelia.sanity.studio` (o nome está em `sanity.cli.ts`).

5. **CORS não é necessário**, e vale saber por quê: o site nunca fala com a
   Sanity pelo navegador. A busca do catálogo acontece no build, em Node, onde
   CORS não existe; e as fotos entram por `<img>` a partir do CDN, que também
   não passa por CORS. Se um dia alguma tela do site consultar a API ao vivo,
   aí sim.
6. **Carregue as 18 peças de demonstração.** Crie um token com permissão de
   *Editor* em **API → Tokens**, ponha em `.env.local` como `SANITY_WRITE_TOKEN`
   e rode:

```bash
pnpm importar
```

   Isso é um ensaio: lista o que faria e não escreve nada. Para valer:

```bash
pnpm importar --sim
```

   **O script sobrescreve.** O `_id` de cada peça vem do slug, então rodar duas
   vezes atualiza as mesmas dezoito em vez de criar trinta e seis — mas também
   desfaz qualquer edição feita no painel naquelas peças. É carga inicial, não
   sincronização.

   Enquanto não houver peça publicada, o build cai para o catálogo local **e
   grita no log** — resposta vazia quase sempre é configuração errada, não loja
   sem peças.

### 2. Publicação (Netlify)

1. Conecte o repositório. `netlify.toml` já traz comando, pasta e cabeçalhos.
2. Em **Site configuration → Environment variables**, repita
   `NEXT_PUBLIC_SANITY_PROJECT_ID` e `NEXT_PUBLIC_SANITY_DATASET`.
3. Em **Build & deploy → Build hooks**, crie um hook. Guarde a URL como variável
   de ambiente **`BUILD_HOOK_URL`** — nunca no repositório.

**Sem o `BUILD_HOOK_URL` o site envelhece em silêncio.** A função agendada em
`netlify/functions/vencimento-diario.mts` roda todo dia às 5h de São Paulo e só
existe para disparar um build: é ela que faz "chegou essa semana" deixar de ser
essa semana. Site estático não tem relógio depois de publicado.

4. Na Sanity, em **API → Webhooks**, aponte um webhook para o mesmo
   `BUILD_HOOK_URL`. É o que faz a publicação dela chegar ao ar em um ou dois
   minutos.

   **O filtro precisa excluir rascunho:**

   ```
   _type == "peca" && !(_id in path("drafts.**"))
   ```

   Só `_type == "peca"` parece certo e não é. A Sanity salva rascunho sozinha
   enquanto ela digita, e cada gravação dessas é um evento — o webhook
   dispararia um build a cada poucos segundos com o formulário aberto. O plano
   gratuito da Netlify tem 300 minutos de build por mês, e uma tarde de
   cadastro consumiria o mês inteiro. Com o filtro, só publicar dispara.

### 3. Contagem de visita (Cloudflare)

Opcional. A medição principal é a mensagem do WhatsApp, que já diz qual peça
gerou cada conversa.

1. Em [dash.cloudflare.com](https://dash.cloudflare.com) → **Web Analytics** →
   *Add a site*, pegue o token.
2. Defina `NEXT_PUBLIC_CF_BEACON_TOKEN` no Netlify.

Sem o token o contador não é escrito no HTML — é assim que desenvolvimento e
prévia de branch ficam fora do número. Não põe cookie e não faz fingerprint, por
isso o site não precisa de aviso de cookie.

---

## Antes de apontar para uma loja de verdade

- `LOJA` em `lib/constants.ts`: nome, WhatsApp, endereço, horário. **O WhatsApp
  hoje é o do Victor**, de propósito — ver DECISOES.md §10.
- Tire a tarja de demonstração (`AVISO_MODELO`) do cabeçalho e do rodapé.
- Aí sim declare `LocalBusiness` nos dados estruturados. Hoje não existe, porque
  a loja não existe.
- Troque as fotos: as atuais são do Pexels. Numa loja real elas seriam feitas na
  própria loja, com o celular.
