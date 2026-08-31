/**
 * Dispara um build por dia, e só isso.
 *
 * Motivo em netlify.toml, onde está o agendamento: o site é estático e não tem
 * relógio depois de publicado. As regras de vencimento (peça que sai do
 * destaque, peça esgotada que sai do catálogo) são calculadas no build, então
 * sem um build agendado elas não acontecem.
 *
 * A função não recebe dado, não devolve dado e não tem acesso ao conteúdo do
 * site. Ela bate num endereço secreto que o Netlify guarda e que faz o próprio
 * Netlify começar um build.
 */
const dispararBuild = async () => {
  const hook = process.env.BUILD_HOOK_URL;

  if (!hook) {
    // Sem o hook a função é inofensiva, mas silenciosamente inútil — e o
    // sintoma (data velha no site) aparece semanas depois, longe da causa.
    console.error(
      "BUILD_HOOK_URL não está definida. O build agendado não vai acontecer e as regras de vencimento vão congelar.",
    );
    return new Response("BUILD_HOOK_URL ausente", { status: 500 });
  }

  const resposta = await fetch(hook, { method: "POST" });

  if (!resposta.ok) {
    console.error(`Build hook respondeu ${resposta.status}.`);
    return new Response("Build hook falhou", { status: 502 });
  }

  return new Response("Build disparado");
};

export default dispararBuild;
