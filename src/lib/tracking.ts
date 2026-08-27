const STORAGE_KEY = "quiz-atribuicao";

export type Atribuicao = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  gclid: string | null;
  referrer: string | null;
  landing_url: string | null;
};

const VAZIO: Atribuicao = {
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_content: null,
  utm_term: null,
  fbclid: null,
  gclid: null,
  referrer: null,
  landing_url: null,
};

const limpar = (valor: string | null): string | null => {
  if (!valor) return null;
  const texto = valor.trim().slice(0, 300);
  return texto.length > 0 ? texto : null;
};

/**
 * Captura os parâmetros de campanha na primeira visita da sessão e mantém
 * o valor guardado, para que o lead seja atribuído ao anúncio de origem
 * mesmo depois de o visitante navegar pelo quiz.
 */
export function capturarAtribuicao(): Atribuicao {
  if (typeof window === "undefined") return VAZIO;

  try {
    const salvo = window.sessionStorage.getItem(STORAGE_KEY);
    if (salvo) return { ...VAZIO, ...(JSON.parse(salvo) as Partial<Atribuicao>) };
  } catch {
    // sessionStorage indisponível — segue com a captura direta
  }

  const params = new URLSearchParams(window.location.search);
  const atual: Atribuicao = {
    utm_source: limpar(params.get("utm_source")),
    utm_medium: limpar(params.get("utm_medium")),
    utm_campaign: limpar(params.get("utm_campaign")),
    utm_content: limpar(params.get("utm_content")),
    utm_term: limpar(params.get("utm_term")),
    fbclid: limpar(params.get("fbclid")),
    gclid: limpar(params.get("gclid")),
    referrer: limpar(document.referrer || null),
    landing_url: limpar(window.location.href),
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(atual));
  } catch {
    // ignora falha de persistência
  }

  return atual;
}
