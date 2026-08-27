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

type PixelEvent = { event: string; params?: Record<string, unknown>; timestamp: string };

const PIXEL_QUEUE_KEY = "fbq_fallback_queue";
const PIXEL_DEDUP_PREFIX = "fb_pixel_";

function logPixel(stage: "init" | "fire" | "fallback" | "skip", event: string, details?: unknown) {
  const label = `[Meta Pixel Helper]`;
  const payload = { stage, event, details, url: typeof window !== "undefined" ? window.location.href : null };
  // eslint-disable-next-line no-console
  console.log(label, payload);
}

function queueFallback(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    const queue: PixelEvent[] = JSON.parse(window.sessionStorage.getItem(PIXEL_QUEUE_KEY) || "[]");
    queue.push({ event, params, timestamp: new Date().toISOString() });
    window.sessionStorage.setItem(PIXEL_QUEUE_KEY, JSON.stringify(queue.slice(-20)));
    logPixel("fallback", event, { reason: "fbq indisponível", queued: true });
  } catch {
    logPixel("fallback", event, { reason: "sessionStorage indisponível" });
  }
}

/**
 * Dispara um evento do Meta Pixel com log no console, deduplicação por sessão
 * e fallback em fila caso o SDK ainda não tenho carregado.
 */
export function dispararPixel(
  event: string,
  params?: Record<string, unknown>,
  options?: { once?: boolean; onceKey?: string },
): boolean {
  if (typeof window === "undefined") {
    logPixel("skip", event, { reason: "SSR" });
    return false;
  }

  const dedupKey = options?.onceKey || `${PIXEL_DEDUP_PREFIX}${event}`;
  if (options?.once !== false && window.sessionStorage.getItem(dedupKey)) {
    logPixel("skip", event, { reason: "evento já disparado nesta sessão", dedupKey });
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as unknown as { fbq?: (...args: unknown[]) => void };

  if (typeof win.fbq !== "function") {
    logPixel("init", event, { reason: "fbq não carregado ainda", fallback: "queue" });
    queueFallback(event, params);
    return false;
  }

  try {
    if (params) {
      win.fbq("track", event, params);
    } else {
      win.fbq("track", event);
    }
    if (options?.once !== false) {
      window.sessionStorage.setItem(dedupKey, "1");
    }
    logPixel("fire", event, { params, dedupKey, status: "success" });
    return true;
  } catch (err) {
    logPixel("fallback", event, { reason: "erro ao chamar fbq", error: String(err) });
    queueFallback(event, params);
    return false;
  }
}

/**
 * Reenvia eventos que ficaram na fila de fallback quando o fbq estava indisponível.
 * Ideal para ser chamado após confirmar que o SDK carregou.
 */
export function processarFilaPixel(): void {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (typeof win.fbq !== "function") return;

  try {
    const raw = window.sessionStorage.getItem(PIXEL_QUEUE_KEY);
    if (!raw) return;
    const queue: PixelEvent[] = JSON.parse(raw);
    window.sessionStorage.removeItem(PIXEL_QUEUE_KEY);
    queue.forEach(({ event, params }) => {
      try {
        if (params) win.fbq!("track", event, params);
        else win.fbq!("track", event);
        logPixel("fire", event, { source: "fallback_queue", params });
      } catch (err) {
        logPixel("fallback", event, { reason: "falha ao reenviar", error: String(err) });
      }
    });
  } catch {
    // ignora fila corrompida
  }
}
