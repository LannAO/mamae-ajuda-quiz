// ---------------------------------------------------------------------------
// Configuração do funil — troque o número do WhatsApp aqui.
// ---------------------------------------------------------------------------
export const WHATSAPP_NUMERO = "5586994091713";
export const VALOR_BENEFICIO = "R$ 6.484,00";
export const POLITICA_PRIVACIDADE_URL = "/politica-de-privacidade";

export type Branch = "principal" | "pos-parto" | "desqualificado";

export type StepId =
  | "hero"
  | "edu1"
  | "edu2"
  | "semanas"
  | "trabalho"
  | "emo1"
  | "emo2"
  | "emo3"
  | "emo4"
  | "form"
  | "loading"
  | "diagnostico"
  | "advogado"
  | "cta"
  | "pos-prazo"
  | "pos-loading"
  | "desqualificado";

export const PROGRESSO: Partial<Record<StepId, number>> = {
  edu1: 12,
  edu2: 25,
  semanas: 40,
  trabalho: 50,
  emo1: 55,
  emo2: 61,
  emo3: 67,
  emo4: 72,
  form: 75,
  loading: 88,
  diagnostico: 100,
  advogado: 100,
  cta: 100,
  "pos-prazo": 40,
  "pos-loading": 60,
  desqualificado: 100,
};

export type Opcao = { valor: string; emoji: string; texto: string };

export const OPCOES_SEMANAS: Opcao[] = [
  { valor: "0-12", emoji: "🌱", texto: "Menos de 12 semanas" },
  { valor: "12-24", emoji: "🌿", texto: "Entre 12 e 24 semanas" },
  { valor: "24-32", emoji: "🌳", texto: "Entre 24 e 32 semanas" },
  { valor: "32+", emoji: "🤰", texto: "Mais de 32 semanas" },
  { valor: "ja-nasceu", emoji: "👶", texto: "Já tive meu bebê" },
];

export const OPCOES_TRABALHO: Opcao[] = [
  { valor: "empregada", emoji: "💼", texto: "Estou empregada (carteira assinada)" },
  { valor: "desempregada", emoji: "😔", texto: "Estou desempregada" },
];

export const OPCOES_EMO1: Opcao[] = [
  { valor: "apertado", emoji: "😣", texto: "Bem apertado, tá difícil" },
  { valor: "preocupada", emoji: "😟", texto: "Preocupada, uma renda ajudaria demais" },
  { valor: "da-pra-levar", emoji: "🙂", texto: "Dá pra levar, mas todo dinheiro conta" },
  { valor: "tranquila", emoji: "😌", texto: "Tranquila, só me informando" },
];

export const OPCOES_EMO2: Opcao[] = [
  { valor: "contas", emoji: "🏡", texto: "As contas de sempre (aluguel, luz, mercado)" },
  { valor: "enxoval", emoji: "👶", texto: "O enxoval e as coisas do bebê" },
  { valor: "sem-salario", emoji: "💸", texto: "Ficar sem salário na licença" },
  { valor: "tudo", emoji: "😮‍💨", texto: "Sinceramente? Tudo isso junto" },
];

export const OPCOES_EMO3: Opcao[] = [
  { valor: "bastante", emoji: "😥", texto: "Bastante, ando ansiosa" },
  { valor: "perco-sono", emoji: "🌙", texto: "Às vezes perco o sono pensando nisso" },
  { valor: "um-pouco", emoji: "😕", texto: "Um pouco, tento não focar" },
  { valor: "lido-bem", emoji: "💪", texto: "Consigo lidar numa boa" },
];

export const OPCOES_EMO4: Opcao[] = [
  { valor: "mudaria-tudo", emoji: "✨", texto: "Mudaria tudo — seria um alívio enorme" },
  { valor: "preparativos", emoji: "🎁", texto: "Ajudaria muito nos preparativos" },
  { valor: "seguranca", emoji: "🤝", texto: "Mais segurança pra mim e pro bebê" },
];

export const OPCOES_POS_PRAZO: Opcao[] = [
  { valor: "1-2-semanas", emoji: "🍼", texto: "Entre 1 e 2 semanas" },
  { valor: "2-4-semanas", emoji: "📅", texto: "Entre 2 e 4 semanas" },
  { valor: "1-2-meses", emoji: "🗓️", texto: "Entre 1 e 2 meses" },
  { valor: "2-meses+", emoji: "⏳", texto: "Mais de 2 meses" },
];

export function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function telefoneValido(valor: string): boolean {
  return valor.replace(/\D/g, "").length >= 10;
}

export function gerarProtocolo(): string {
  return `CP${Date.now().toString().slice(-8)}`;
}

export function montarMensagemWhatsapp(
  nome: string,
  protocolo: string,
  respostas: Record<string, string>,
): string {
  const linhas = [
    `Oi! Sou ${nome}.`,
    `Fiz o quiz do Auxílio Maternidade (protocolo ${protocolo}) e quero saber se tenho direito. Pode me ajudar?`,
    "",
    "Resumo das minhas respostas:",
  ];
  if (respostas["semanas"]) linhas.push(`• Gestação: ${respostas["semanas"]}`);
  if (respostas["trabalho"]) linhas.push(`• Situação: ${respostas["trabalho"]}`);
  if (respostas["pos-prazo"]) linhas.push(`• Bebê nasceu há: ${respostas["pos-prazo"]}`);
  return linhas.join("\n");
}
