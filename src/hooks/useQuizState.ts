import { useCallback, useEffect, useRef, useState } from "react";

import type { Branch, StepId } from "@/lib/quiz";

const STORAGE_KEY = "cp-quiz-state";
const EXPIRA_MS = 30 * 60 * 1000;

type Estado = {
  step: StepId;
  historico: StepId[];
  respostas: Record<string, string>;
  branch: Branch;
  leadId: string | null;
  protocolo: string | null;
  nome: string;
};

const INICIAL: Estado = {
  step: "hero",
  historico: [],
  respostas: {},
  branch: "principal",
  leadId: null,
  protocolo: null,
  nome: "",
};

function carregar(): Estado | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; estado: Estado };
    if (!parsed?.ts || Date.now() - parsed.ts > EXPIRA_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Telas de loading não são retomáveis.
    if (parsed.estado.step === "loading" || parsed.estado.step === "pos-loading") return null;
    return parsed.estado;
  } catch {
    return null;
  }
}

export function useQuizState() {
  const [estado, setEstado] = useState<Estado>(INICIAL);
  const [hidratado, setHidratado] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const salvo = carregar();
    if (salvo) setEstado(salvo);
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), estado }),
      );
    } catch {
      /* storage indisponível */
    }
  }, [estado, hidratado]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const irPara = useCallback((step: StepId, extra?: Partial<Estado>) => {
    setEstado((atual) => ({
      ...atual,
      ...extra,
      step,
      historico: [...atual.historico, atual.step],
    }));
  }, []);

  const voltar = useCallback(() => {
    setEstado((atual) => {
      if (atual.historico.length === 0) return atual;
      const historico = [...atual.historico];
      const anterior = historico.pop() as StepId;
      return { ...atual, step: anterior, historico };
    });
  }, []);

  const responder = useCallback(
    (chave: string, valor: string, proximo: StepId, extra?: Partial<Estado>) => {
      setEstado((atual) => ({
        ...atual,
        respostas: { ...atual.respostas, [chave]: valor },
      }));
      const t = setTimeout(() => irPara(proximo, extra), 400);
      timers.current.push(t);
    },
    [irPara],
  );

  const atualizar = useCallback((patch: Partial<Estado>) => {
    setEstado((atual) => ({ ...atual, ...patch }));
  }, []);

  const reiniciar = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
    setEstado(INICIAL);
  }, []);

  return { estado, hidratado, irPara, voltar, responder, atualizar, reiniciar };
}
