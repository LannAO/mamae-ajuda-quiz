import { useCallback, useState } from "react";

import draHedilmaFoto from "@/assets/dra-hedilma-almeida.jpg.asset.json";
import diagGestante from "@/assets/diag-gestante.webp.asset.json";
import heroMaeBebe from "@/assets/hero-mae-bebe.webp.asset.json";
import {
  Illustration,
  LoadingScreen,
  OptionList,
  PrimaryButton,
  ProgressBar,
  QuizHeader,
  Screen,
} from "@/components/quiz/parts";
import { supabase } from "@/integrations/supabase/client";
import { useQuizState } from "@/hooks/useQuizState";
import { capturarAtribuicao } from "@/lib/tracking";
import {
  OPCOES_EMO1,
  OPCOES_EMO2,
  OPCOES_EMO3,
  OPCOES_EMO4,
  OPCOES_POS_PRAZO,
  OPCOES_SEMANAS,
  OPCOES_TRABALHO,
  POLITICA_PRIVACIDADE_URL,
  PROGRESSO,
  VALOR_BENEFICIO,
  WHATSAPP_NUMERO,
  gerarProtocolo,
  mascaraTelefone,
  montarMensagemWhatsapp,
  telefoneValido,
  type Opcao,
  type StepId,
} from "@/lib/quiz";

const DEPOIMENTOS = [
  {
    nome: "Ana Beatriz Souza",
    quando: "há 2 semanas",
    texto:
      "Eu não sabia que tinha direito. A equipe me explicou tudo com muita paciência e recebi o benefício antes do meu bebê nascer. Gratidão!",
  },
  {
    nome: "Camila Ferreira",
    quando: "há 1 mês",
    texto:
      "Atendimento humano de verdade. Me acompanharam em cada etapa pelo WhatsApp e deu tudo certo com o INSS.",
  },
  {
    nome: "Juliana Martins",
    quando: "há 3 meses",
    texto:
      "Estava desempregada e achava que não conseguiria nada. A Dra Hedilma conseguiu meu salário-maternidade e ajudou demais no enxoval.",
  },
];

export function QuizFunnel() {
  const { estado, irPara, voltar, responder, atualizar } = useQuizState();
  const { step, respostas, branch } = estado;

  const [nome, setNome] = useState(estado.nome);
  const [telefone, setTelefone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const progresso = PROGRESSO[step] ?? 0;
  const varianteProgresso = branch === "principal" ? "rosa" : "ouro";
  const podeVoltar =
    estado.historico.length > 0 &&
    step !== "loading" &&
    step !== "pos-loading" &&
    step !== "hero";

  const selecionar = (chave: string, valor: string, proximo: StepId) =>
    responder(chave, valor, proximo);

  const enviarLead = async () => {
    setErro(null);
    if (honeypot) return;
    if (nome.trim().length < 2) {
      setErro("Por favor, informe seu nome completo.");
      return;
    }
    if (!telefoneValido(telefone)) {
      setErro("Informe um celular válido com DDD.");
      return;
    }
    setEnviando(true);
    const protocolo = estado.protocolo ?? gerarProtocolo();
    const leadId = estado.leadId ?? crypto.randomUUID();
    // Inserção sem retorno de dados (a tabela não permite SELECT público)
    await supabase.from("leads").insert({
      id: leadId,
      nome: nome.trim(),
      whatsapp: telefone,
      respostas,
      branch,
      protocolo,
      ...capturarAtribuicao(),
    });
    setEnviando(false);
    irPara("loading", {
      nome: nome.trim(),
      protocolo,
      leadId,
    });
  };

  const concluirAnalise = useCallback(() => {
    if (estado.leadId) {
      void supabase.rpc("atualizar_progresso_lead", {
        p_id: estado.leadId,
        p_completou: true,
        p_respostas: respostas,
      });
    }
    irPara("diagnostico");
  }, [estado.leadId, irPara, respostas]);

  const abrirWhatsapp = () => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as unknown as { fbq?: (...args: unknown[]) => void };
      if (typeof win.fbq === "function" && !sessionStorage.getItem("fb_lead_disparado")) {
        win.fbq("track", "Lead");
        sessionStorage.setItem("fb_lead_disparado", "1");
      }
    }
    if (estado.leadId) {
      void supabase.rpc("atualizar_progresso_lead", {
        p_id: estado.leadId,
        p_clicou: true,
      });
    }
    const msg = montarMensagemWhatsapp(
      estado.nome || nome,
      estado.protocolo ?? gerarProtocolo(),
      respostas,
    );
    window.open(
      `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const perguntaEmocional = (
    chave: string,
    titulo: string,
    sub: string,
    opcoes: Opcao[],
    proximo: StepId,
  ) => (
    <Screen>
      <h2 className="quiz-title">{titulo}</h2>
      <p className="quiz-text mt-2 mb-5">{sub}</p>
      <OptionList
        opcoes={opcoes}
        selecionada={respostas[chave]}
        onSelect={(v) => selecionar(chave, v, proximo)}
      />
    </Screen>
  );

  return (
    <main className="quiz-stage">
      <div className="quiz-card">
        {step !== "hero" && (
          <ProgressBar valor={progresso} variante={varianteProgresso} />
        )}
        <QuizHeader onBack={podeVoltar ? voltar : undefined} />

        {step === "hero" && (
          <Screen>
            <Illustration src={heroMaeBebe.url} label="Ilustração de mãe abraçando o bebê" />
            <h1 className="quiz-title mt-5 text-center">
              Você está grávida e quer saber se tem direito ao{" "}
              <em className="font-extrabold text-primary not-italic">
                Auxílio Maternidade
              </em>
              ?
            </h1>
            <p className="quiz-text mt-3 text-center">
              Descubra em <strong className="text-foreground">2 minutos</strong> se
              você pode receber um benefício do governo de até{" "}
              <strong className="text-foreground">{VALOR_BENEFICIO}</strong> ou mais.
            </p>
            <PrimaryButton onClick={() => irPara("edu1")}>
              Descobrir Meu Direito
            </PrimaryButton>
            <p className="mt-3 text-center text-xs text-subtle-foreground">
              ⏱️ Apenas 2 minutos • 100% gratuito • Sem compromisso
            </p>
          </Screen>
        )}

        {step === "edu1" && (
          <Screen>
            <div className="text-4xl" aria-hidden="true">
              📋
            </div>
            <h2 className="quiz-title mt-3">O que é o Auxílio Maternidade?</h2>
            <p className="quiz-text mt-3">
              É um benefício pago pelo INSS para mulheres que contribuíram com a
              Previdência Social. Ele garante uma renda durante a licença após o
              nascimento do bebê, para que você possa cuidar do seu filho sem ficar
              sem dinheiro.
            </p>
            <div className="alert-soft mt-4">
              💡 <strong>Importante:</strong> Mesmo que você esteja empregada ou tenha
              parado de contribuir, pode ter direito. Vamos descobrir juntas!
            </div>
            <PrimaryButton onClick={() => irPara("edu2")}>Entendi</PrimaryButton>
          </Screen>
        )}

        {step === "edu2" && (
          <Screen>
            <h2 className="quiz-title text-center">Quanto você pode receber?</h2>
            <div className="value-card mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Valor mínimo estimado
              </p>
              <p className="mt-1 text-4xl font-extrabold">{VALOR_BENEFICIO}</p>
              <p className="mt-1 text-xs opacity-90">
                podendo chegar a valores maiores*
              </p>
            </div>
            <div className="alert-soft mt-4">
              ⚠️ <strong>Importante:</strong> o benefício precisa ser solicitado
              durante a gestação — depois do parto as chances caem bastante.
            </div>
            <PrimaryButton onClick={() => irPara("semanas")}>
              Verificar meu direito
            </PrimaryButton>
          </Screen>
        )}

        {step === "semanas" && (
          <Screen>
            <h2 className="quiz-title">De quantas semanas você está grávida?</h2>
            <p className="quiz-text mt-2 mb-5">
              Isso nos ajuda a calcular o melhor momento para agir
            </p>
            <OptionList
              opcoes={OPCOES_SEMANAS}
              selecionada={respostas["semanas"]}
              onSelect={(v) =>
                v === "ja-nasceu"
                  ? responder("semanas", v, "pos-prazo", { branch: "pos-parto" })
                  : responder("semanas", v, "trabalho", { branch: "principal" })
              }
            />
          </Screen>
        )}

        {step === "trabalho" && (
          <Screen>
            <h2 className="quiz-title">Qual sua situação de trabalho?</h2>
            <p className="quiz-text mt-2 mb-5">
              Selecione a opção que melhor descreve seu vínculo (vale para quem está
              em licença)
            </p>
            <OptionList
              opcoes={OPCOES_TRABALHO}
              selecionada={respostas["trabalho"]}
              onSelect={(v) => selecionar("trabalho", v, "emo1")}
            />
          </Screen>
        )}

        {step === "emo1" &&
          perguntaEmocional(
            "emo1",
            "Como estão as contas aí em casa pra chegada do bebê?",
            "Pode ser sincera — isso fica só entre a gente",
            OPCOES_EMO1,
            "emo2",
          )}

        {step === "emo2" &&
          perguntaEmocional(
            "emo2",
            "O que mais tira seu sono hoje, mamãe?",
            "Escolha o que mais pesa no seu coração",
            OPCOES_EMO2,
            "emo3",
          )}

        {step === "emo3" &&
          perguntaEmocional(
            "emo3",
            "Essa preocupação tem pesado na sua gestação?",
            "É normal sentir isso — você não está sozinha",
            OPCOES_EMO3,
            "emo4",
          )}

        {step === "emo4" && (
          <Screen>
            <h2 className="quiz-title">
              Se hoje você soubesse que tem até{" "}
              <span className="text-primary">R$ 6.484</span> garantidos antes do bebê
              nascer, o que mudaria?
            </h2>
            <p className="quiz-text mt-2 mb-5">
              Imagina essa segurança chegando na hora certa
            </p>
            <OptionList
              opcoes={OPCOES_EMO4}
              selecionada={respostas["emo4"]}
              onSelect={(v) => selecionar("emo4", v, "form")}
            />
          </Screen>
        )}

        {step === "form" && (
          <Screen>
            <div className="text-center text-4xl" aria-hidden="true">
              📝
            </div>
            <h2 className="quiz-title mt-2 text-center">Quase lá!</h2>
            <p className="quiz-text mt-2 text-center">
              Precisamos de alguns dados para sua análise
            </p>
            <form
              className="mt-5 flex flex-1 flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                void enviarLead();
              }}
            >
              <div>
                <label
                  htmlFor="nome"
                  className="mb-1.5 block text-sm font-semibold text-foreground"
                >
                  Seu nome
                </label>
                <input
                  id="nome"
                  name="nome"
                  className="quiz-input"
                  autoComplete="name"
                  placeholder="Como podemos te chamar?"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label
                  htmlFor="celular"
                  className="mb-1.5 block text-sm font-semibold text-foreground"
                >
                  Seu celular
                </label>
                <input
                  id="celular"
                  name="celular"
                  type="tel"
                  inputMode="numeric"
                  className="quiz-input"
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                  required
                />
              </div>

              {/* honeypot anti-spam */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
              />

              {erro && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {erro}
                </p>
              )}

              <p className="text-xs leading-relaxed text-subtle-foreground">
                🔒 Seus dados são usados apenas para verificar seu direito ao
                benefício. Não compartilhamos com terceiros.{" "}
                <a
                  href={POLITICA_PRIVACIDADE_URL}
                  className="underline underline-offset-2"
                >
                  Política de privacidade
                </a>
                .
              </p>

              <PrimaryButton type="submit" disabled={enviando}>
                {enviando ? "Enviando..." : "Continuar"}
              </PrimaryButton>
            </form>
          </Screen>
        )}

        {step === "loading" && (
          <LoadingScreen
            titulo="Analisando suas respostas..."
            itens={[
              "Verificando situação de trabalho",
              "Calculando tempo de contribuição",
              "Estimando valor do benefício",
              "Preparando seu resultado...",
            ]}
            onDone={concluirAnalise}
          />
        )}

        {step === "diagnostico" && (
          <Screen scroll>
            <Illustration src={diagGestante.url} label="Ilustração de gestante" />
            <div className="mt-4 flex justify-center">
              <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-success-foreground">
                🎉 Boa notícia!
              </span>
            </div>
            <h2 className="quiz-title mt-3 text-center">
              Pela sua situação, você{" "}
              <em className="not-italic text-primary">pode ter direito</em> ao Auxílio
              Maternidade!
            </h2>
            <div className="value-card mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                Valor aprovado
              </p>
              <p className="mt-1 text-4xl font-extrabold">{VALOR_BENEFICIO}+</p>
              <p className="mt-1 text-xs opacity-90">Aproximadamente</p>
            </div>
            <p className="quiz-text mt-4">
              Para confirmar o valor exato e dar entrada no pedido, precisamos checar
              alguns detalhes do seu histórico com uma especialista do escritório.
            </p>
            <PrimaryButton onClick={() => irPara("advogado")}>
              Ver próximo passo
            </PrimaryButton>
          </Screen>
        )}

        {step === "advogado" && (
          <Screen scroll>
            <div className="rounded-2xl border border-border p-4">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={draHedilmaFoto.url}
                  alt="Foto da Dra. Hedilma Almeida"
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-bold text-foreground">
                    Dra. Hedilma Almeida
                  </p>
                  <p className="text-xs text-subtle-foreground">
                    Especialista em Direito Previdenciário
                  </p>
                </div>
              </div>
              <p className="quiz-text mt-3">
                Nossa missão é simples: garantir que nenhuma mãe deixe de receber o que
                é seu por direito. Cuidamos de todo o processo com o INSS, com
                linguagem clara e acompanhamento próximo.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                ["300+", "Mães atendidas"],
                ["96%", "Aprovação"],
                ["4.6", "Avaliação Google"],
              ].map(([n, l]) => (
                <div key={l} className="rounded-xl bg-primary-soft px-2 py-3">
                  <p className="text-lg font-extrabold text-primary">{n}</p>
                  <p className="text-[11px] leading-tight text-subtle-foreground">{l}</p>
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-base font-bold text-foreground">
              Avaliações reais no Google
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              {DEPOIMENTOS.map((d) => (
                <article key={d.nome} className="rounded-2xl border border-border p-4">
                  <p className="font-semibold text-foreground">{d.nome}</p>
                  <p className="text-[11px] text-subtle-foreground">
                    Google · {d.quando}
                  </p>
                  <p className="mt-1 text-sm" aria-label="5 estrelas">
                    ⭐⭐⭐⭐⭐
                  </p>
                  <p className="quiz-text mt-2">{d.texto}</p>
                </article>
              ))}
            </div>

            <div className="mt-5">
              <PrimaryButton sticky={false} onClick={() => irPara("cta")}>
                Garantir meu benefício
              </PrimaryButton>
            </div>
          </Screen>
        )}

        {step === "cta" && (
          <Screen>
            <div className="text-center text-4xl" aria-hidden="true">
              📱
            </div>
            <h2 className="quiz-title mt-2 text-center">Sua análise está pronta!</h2>
            <p className="quiz-text mt-3 text-center">
              Clique no botão abaixo para falar com nossa equipe e garantir seu
              Auxílio Maternidade antes do prazo.
            </p>
            <ul className="mt-5 flex flex-col gap-2 rounded-2xl border border-border bg-muted p-4">
              {[
                "Atendimento humanizado",
                "Análise completa gratuita",
                "Você só paga se receber",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-success" aria-hidden="true">
                    ✓
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <PrimaryButton variant="success" onClick={abrirWhatsapp}>
              💬 Falar com Especialista
            </PrimaryButton>
            <p className="mt-3 text-center text-xs text-subtle-foreground">
              🔒 Seus dados estão seguros e protegidos
            </p>
          </Screen>
        )}

        {step === "pos-prazo" && (
          <Screen>
            <h2 className="quiz-title">Que linda notícia! Parabéns, mamãe! 💜</h2>
            <p className="quiz-text mt-2 mb-5">Há quanto tempo seu bebê nasceu?</p>
            <OptionList
              opcoes={OPCOES_POS_PRAZO}
              selecionada={respostas["pos-prazo"]}
              onSelect={(v) => selecionar("pos-prazo", v, "pos-loading")}
            />
          </Screen>
        )}

        {step === "pos-loading" && (
          <LoadingScreen
            titulo="Analisando seu caso..."
            variante="ouro"
            itens={[
              "Calculando tempo após nascimento",
              "Conferindo prazos legais",
              "Validando elegibilidade do prazo",
            ]}
            onDone={() =>
              respostas["pos-prazo"] === "1-2-semanas"
                ? irPara("emo1")
                : irPara("desqualificado", { branch: "desqualificado" })
            }
          />
        )}

        {step === "desqualificado" && (
          <Screen>
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="text-6xl" aria-hidden="true">
                🤱
              </div>
              <h2 className="quiz-title mt-4">Obrigada por participar!</h2>
              <p className="quiz-text mt-3">
                O Auxílio Maternidade precisa ser solicitado durante a gestação ou nas
                primeiras duas semanas após o parto. Como seu bebê nasceu há mais
                tempo, não é possível dar entrada nesse benefício específico.
              </p>
              <div className="mt-5 w-full rounded-2xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                Cuide bem do seu pequeno — e desejamos sucesso na sua jornada como
                mãe. 💛
              </div>
            </div>
          </Screen>
        )}
      </div>
    </main>
  );
}
