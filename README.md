# Maternidade Descomplicada

Quero criar uma landing page tipo QUIZ (funil de captação de leads) para um escritório de advocacia especializado em Direito Previdenciário, chamado "Castro Pereira Advogados". O produto é o "Auxílio Maternidade" (benefício do INSS). O objetivo é qualificar a visitante ao longo de um quiz de múltiplas etapas e capturar nome + WhatsApp, terminando em um CTA para WhatsApp.

## PRIORIDADE #1: 100% MOBILE-FIRST
- Este é o requisito mais importante do projeto. A imensa maioria do tráfego vem de anúncios (Meta/Google Ads) em celular.
- Layout deve ser um "cartão" único, largura máxima 480px, centralizado na tela, ocupando 100dvh (usar `100dvh` com fallback `100vh`, e `viewport-fit=cover` + `env(safe-area-inset-*)` para notch/home-indicator do iPhone).
- Em desktop (>=768px), o card fica centralizado com fundo decorativo suave (gradiente radial rosa/dourado bem sutil) e sombra, mas TODO o design é pensado primeiro pra tela pequena.
- Botões com altura mínima de 48px (área de toque confortável), textos legíveis sem precisar dar zoom, nada de scroll horizontal em nenhuma tela.
- Usar media queries por ALTURA de viewport (max-height: 700px e 600px) para compactar paddings/fontes em celulares pequenos ou com teclado aberto, para que os botões de ação nunca fiquem cortados.
- Testar mentalmente em 360x640 (Android pequeno) e 390x844 (iPhone).

## DESIGN SYSTEM
- Fonte: Inter (Google Fonts ou similar).
- Cores: rosa principal #e11d48, rosa escuro #9f1239, rosa claro fundo #fff1f2/#ffe4e6, verde sucesso #22c55e, fundo geral creme #fef7ed, texto #1a1a1a, texto secundário #4b5563/#6b7280, bordas #e5e7eb.
- Botão primário: pill (border-radius 100px), fundo rosa, texto branco, sombra suave rosa, negrito, full-width, sticky no rodapé do "body" do card (margin-top:auto).
- Botão CTA final: mesmo estilo mas verde (WhatsApp).
- Cards de opção (múltipla escolha): fundo branco, borda 1.5px cinza clara, ícone emoji + texto, ao selecionar fica com borda e fundo rosa clarinho + texto rosa em negrito (estado aria-pressed).
- Barra de progresso fina (4px) no topo de cada tela (exceto a primeira), preenchimento rosa que cresce conforme o step (usar variante dourada/âmbar #a16207 para o sub-fluxo de "já tive o bebê").
- Cabeçalho de cada tela: logo horizontal centralizada (enviarei o logo depois, por ora usar um placeholder de texto "Castro Pereira" com um ícone circular simples), com botão "←" de voltar à esquerda quando aplicável.
- Cards de destaque de valor: gradiente rosa→rosa escuro, texto branco, valor grande em destaque (ex: R$ 6.484,00).
- Ilustrações: usar ilustrações fofas em estilo "storybook"/aquarela de mãe com bebê (posso gerar depois); por enquanto pode usar um círculo com gradiente suave rosa como placeholder circular de 180x180px.

## FLUXO DO QUIZ (state machine single-page, sem reload entre telas, com histórico para o botão "voltar")

**Tela 1 — Hero**
Ilustração circular (mãe abraçando bebê). Título: "Você está grávida e quer saber se tem direito ao *Auxílio Maternidade*?" (a palavra em itálico/destaque rosa). Texto: "Descubra em **2 minutos** se você pode receber um benefício do governo de até **R$ 6.484,00** ou mais." Botão: "Descobrir Meu Direito". Rodapé pequeno: "⏱️ Apenas 2 minutos • 100% gratuito • Sem compromisso".

**Tela 2 — Educativa 1** (progresso 12%)
Ícone 📋. H2: "O que é o Auxílio Maternidade?". Texto explicando que é um benefício pago pelo INSS para mulheres que contribuíram com a Previdência, garantindo renda durante a licença após o nascimento. Alerta rosa: "💡 Importante: Mesmo que você esteja empregada ou tenha parado de contribuir, pode ter direito. Vamos descobrir juntas!". Botão "Entendi".

**Tela 3 — Educativa 2 / valor** (progresso 25%)
H2 centralizado: "Quanto você pode receber?". Card de valor: "Valor mínimo estimado" / "R$ 6.484,00" / "podendo chegar a valores maiores*". Alerta: "⚠️ Importante: o benefício precisa ser solicitado durante a gestação — depois do parto as chances caem bastante." Botão "Verificar meu direito".

**Tela 4 — Pergunta: semanas de gestação** (progresso 40%)
H2: "De quantas semanas você está grávida?" Subtexto: "Isso nos ajuda a calcular o melhor momento para agir". Opções (single-select, ao clicar avança automaticamente após ~400ms com micro-delay visual de seleção):
- 🌱 Menos de 12 semanas (valor: 0-12)
- 🌿 Entre 12 e 24 semanas (valor: 12-24)
- 🌳 Entre 24 e 32 semanas (valor: 24-32)
- 🤰 Mais de 32 semanas (valor: 32+)
- 👶 Já tive meu bebê (valor: ja-nasceu) → esta opção direciona para um SUB-FLUXO diferente (branch "pós-parto", ver Tela 11 abaixo) em vez de seguir o fluxo principal.

**Tela 5 — Pergunta: situação de trabalho** (progresso 50%, só quem está grávida)
H2: "Qual sua situação de trabalho?" Subtexto: "Selecione a opção que melhor descreve seu vínculo (vale para quem está em licença)". Opções:
- 💼 Estou empregada (carteira assinada)
- 😔 Estou desempregada

**Telas 6-9 — "Escada emocional" (perguntas de qualificação/rapport), progresso 55% → 72%**
6. "Como estão as contas aí em casa pra chegada do bebê?" / "Pode ser sincera — isso fica só entre a gente" — opções: 😣 Bem apertado, tá difícil / 😟 Preocupada, uma renda ajudaria demais / 🙂 Dá pra levar, mas todo dinheiro conta / 😌 Tranquila, só me informando.
7. "O que mais tira seu sono hoje, mamãe?" / "Escolha o que mais pesa no seu coração" — opções: 🏡 As contas de sempre (aluguel, luz, mercado) / 👶 O enxoval e as coisas do bebê / 💸 Ficar sem salário na licença / 😮‍💨 Sinceramente? Tudo isso junto.
8. "Essa preocupação tem pesado na sua gestação?" / "É normal sentir isso — você não está sozinha" — opções: 😥 Bastante, ando ansiosa / 🌙 Às vezes perco o sono pensando nisso / 😕 Um pouco, tento não focar / 💪 Consigo lidar numa boa.
9. "Se hoje você soubesse que tem até **R$ 6.484** garantidos antes do bebê nascer, o que mudaria?" / "Imagina essa segurança chegando na hora certa" — opções: ✨ Mudaria tudo — seria um alívio enorme / 🎁 Ajudaria muito nos preparativos / 🤝 Mais segurança pra mim e pro bebê.

**Tela 10 — Captura de dados** (progresso 75%)
Ícone 📝. H2 centralizado: "Quase lá!" Subtexto: "Precisamos de alguns dados para sua análise". Formulário: campo "Seu nome" (texto, obrigatório, min 2 caracteres) e campo "Seu celular" (tel, obrigatório, com máscara automática brasileira (00) 00000-0000 enquanto digita). Incluir um honeypot invisível anti-spam (campo "website" escondido). Aviso de privacidade: "🔒 Seus dados são usados apenas para verificar seu direito ao benefício. Não compartilhamos com terceiros." com link para política de privacidade. Botão "Continuar" que salva o lead no banco de dados (Supabase) antes de avançar — desabilitar o botão durante o envio e mostrar estado de carregando.

**Tela 11 — Loading / análise** (progresso 88%)
Percentual grande animado contando (22% → 48% → 72% → 90% → 100%, ~450ms entre cada). H2 centralizado: "Analisando suas respostas...". Lista de 4 itens com checkbox circular que vai marcando ✓ conforme o percentual avança: "Verificando situação de trabalho", "Calculando tempo de contribuição", "Estimando valor do benefício", "Preparando seu resultado...". Ao terminar, avança automaticamente.

**Tela 12 — Diagnóstico (resultado positivo)** — esta tela tem scroll permitido (as outras não)
Ilustração circular de gestante. Badge verde: "🎉 Boa notícia!". H2: "Pela sua situação, você *pode ter direito* ao Auxílio Maternidade!" Card de valor "Valor aprovado" "R$ 6.484,00+" "Aproximadamente". Texto explicando que precisam confirmar detalhes com uma especialista. Botão "Ver próximo passo".

**Tela 13 — Sobre o advogado + depoimentos** (scroll permitido)
Card do advogado: foto circular, nome "Dr. Thiago de Castro Pereira", título "Especialista em Direito Previdenciário", bio curta sobre a missão do escritório. Linha de estatísticas em 3 colunas: "300+ Mães atendidas", "96% Aprovação", "4.6 Avaliação Google". Título "Avaliações reais no Google". 3 cards de depoimento (nome, "Google · há X tempo", 5 estrelas, texto do depoimento) — pode inventar depoimentos plausíveis nesse mesmo tom. Botão "Garantir meu benefício".

**Tela 14 — CTA final WhatsApp**
Ícone 📱. H2 centralizado: "Sua análise está pronta!" Texto: "Clique no botão abaixo para falar com nossa equipe e garantir seu Auxílio Maternidade antes do prazo." Lista de 3 checks em caixa verde: "✓ Atendimento humanizado", "✓ Análise completa gratuita", "✓ Você só paga se receber". Botão verde grande: "💬 Falar com Especialista" que abre `https://wa.me/<NUMERO>?text=<mensagem pré-preenchida com nome e respostas>` (deixe o número de WhatsApp como uma variável de configuração fácil de trocar, ex: constante no topo do arquivo, valor placeholder "5562981159968"). Rodapé: "🔒 Seus dados estão seguros e protegidos".

**SUB-FLUXO "já tive o bebê" (branch pós-parto)**

**Tela B1 — Filtro de prazo**
H2: "Que linda notícia! Parabéns, mamãe! 💜" Subtexto: "Há quanto tempo seu bebê nasceu?" Opções: "Entre 1 e 2 semanas" (única que QUALIFICA e segue fluxo), "Entre 2 e 4 semanas", "Entre 1 e 2 meses", "Mais de 2 meses" (estas 3 últimas DESQUALIFICAM).

**Tela B2 — Loading** (variante âmbar/dourada na barra de progresso e no percentual)
Mesmo estilo da Tela 11 mas com textos: "Calculando tempo após nascimento", "Conferindo prazos legais", "Validando elegibilidade do prazo". H2: "Analisando seu caso..."

Se qualificou (1-2 semanas): segue para as telas 6-9 (escada emocional) e depois captura normalmente, como no fluxo principal.

Se desqualificou: vai para uma **Tela Final de Desqualificação**: emoji 🤱 grande, H2 centralizado "Obrigada por participar!", texto explicando educadamente que o Auxílio Maternidade precisa ser solicitado durante a gestação ou nas primeiras duas semanas após o parto, e que como o bebê nasceu há mais tempo não é possível dar entrada nesse benefício específico. Caixa neutra: "Cuide bem do seu pequeno — e desejamos sucesso na sua jornada como mãe. 💛". SEM botão de WhatsApp aqui (lead não qualificada).

## COMPORTAMENTO TÉCNICO
- Implementar como uma state machine em React (hook customizado tipo useQuizState) controlando: step atual, histórico de steps (para o botão voltar funcionar corretamente inclusive atravessando os branches), respostas acumuladas num objeto, e branch atual ("principal" | "pos-parto" | "desqualificado").
- Botão "voltar" (←) no header de cada tela (exceto a primeira e as telas de loading) volta ao step anterior do histórico.
- Barra de progresso com % específico por tela conforme listado acima.
- Ao clicar numa opção de múltipla escolha: marcar visualmente como selecionada, habilitar/mostrar o botão continuar (ou, no padrão que prefiro, avançar automaticamente depois de ~400ms para dar feedback visual antes de trocar de tela) — pode implementar com avanço automático como no funil original.
- Persistir o progresso em sessionStorage (com expiração de 30 min) para não perder o quiz se a pessoa atualizar a página sem querer.
- Salvar o lead no Supabase (criar tabela `leads`) assim que o formulário de captura for enviado, com colunas: nome, whatsapp, respostas (jsonb com todas as respostas do quiz), branch, completou_quiz (boolean), clicou_whatsapp (boolean), created_at. Atualizar `completou_quiz=true` quando chegar na tela de diagnóstico, e `clicou_whatsapp=true` quando clicar no CTA final.
- Gerar um número de protocolo simples (ex: baseado em timestamp) para exibir/usar na mensagem do WhatsApp.
- SEO: title "Auxílio Maternidade — Castro Pereira Advogados", meta description, Open Graph básico.
- Acessibilidade: aria-pressed nos botões de opção selecionados, labels nos inputs, alt text nas imagens.

Pode usar emojis e ilustrações placeholder simples (círculos com gradiente, ou ícones de lucide-react) onde eu ainda não tiver enviado imagens reais — depois eu envio o logo e as ilustrações para você trocar. Comece criando a estrutura completa do funil funcionando de ponta a ponta com dados mockados/placeholder, priorizando a experiência mobile perfeita antes de qualquer polimento extra.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/41b417eb-3ffb-4ec1-ab1b-77a102e1c575).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
