import { ChevronLeft, Scale } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import type { Opcao } from "@/lib/quiz";

export function ProgressBar({
  valor,
  variante = "rosa",
}: {
  valor: number;
  variante?: "rosa" | "ouro";
}) {
  return (
    <div className="h-1 w-full bg-border" role="presentation">
      <div
        className="h-full rounded-r-full transition-[width] duration-500 ease-out"
        style={{
          width: `${valor}%`,
          backgroundColor:
            variante === "ouro" ? "var(--color-gold)" : "var(--color-primary)",
        }}
      />
    </div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
        <Scale className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-sm font-bold tracking-tight text-foreground">
        Hedilma Almeida
        <span className="ml-1 font-medium text-subtle-foreground">Advogada</span>
      </span>
    </div>
  );
}

export function QuizHeader({ onBack }: { onBack?: (() => void) | undefined }) {
  return (
    <header className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center px-4 py-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="grid h-10 w-10 place-items-center rounded-full text-subtle-foreground transition-colors hover:bg-muted"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : (
        <span />
      )}
      <Logo />
      <span />
    </header>
  );
}

export function Screen({
  children,
  scroll = false,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  return (
    <div className="quiz-body" data-scroll={scroll ? "true" : "false"}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  sticky = true,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "success";
  disabled?: boolean;
  type?: "button" | "submit";
  sticky?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant === "success" ? "success" : undefined}
      className={`btn-pill ${sticky ? "mt-auto" : ""}`}
      style={sticky ? { marginTop: "auto" } : undefined}
    >
      {children}
    </button>
  );
}

export function OptionList({
  opcoes,
  selecionada,
  onSelect,
}: {
  opcoes: Opcao[];
  selecionada?: string | undefined;
  onSelect: (valor: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {opcoes.map((op) => (
        <button
          key={op.valor}
          type="button"
          className="option-card"
          aria-pressed={selecionada === op.valor}
          onClick={() => onSelect(op.valor)}
        >
          <span className="text-xl leading-none" aria-hidden="true">
            {op.emoji}
          </span>
          <span className="min-w-0">{op.texto}</span>
        </button>
      ))}
    </div>
  );
}

export function Illustration({
  emoji,
  src,
  label,
}: {
  emoji?: string;
  src?: string;
  label: string;
}) {
  return (
    <div className="flex justify-center">
      <div className="quiz-illustration" role="img" aria-label={label}>
        {src ? (
          <img
            src={src}
            alt={label}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{emoji ?? "🤱"}</span>
        )}
      </div>
    </div>
  );
}

export function LoadingScreen({
  titulo,
  itens,
  variante = "rosa",
  onDone,
}: {
  titulo: string;
  itens: string[];
  variante?: "rosa" | "ouro";
  onDone: () => void;
}) {
  const [pct, setPct] = useState(22);

  useEffect(() => {
    const etapas = [48, 72, 90, 100];
    const timers = etapas.map((v, i) =>
      setTimeout(() => setPct(v), 450 * (i + 1)),
    );
    const fim = setTimeout(onDone, 450 * (etapas.length + 1));
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(fim);
    };
  }, [onDone]);

  const cor = variante === "ouro" ? "var(--color-gold)" : "var(--color-primary)";
  const concluidos = Math.floor((pct / 100) * itens.length);

  return (
    <Screen>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div
          className="text-6xl font-extrabold tabular-nums"
          style={{ color: cor }}
          aria-live="polite"
        >
          {pct}%
        </div>
        <h2 className="quiz-title text-center">{titulo}</h2>
        <ul className="flex w-full flex-col gap-3">
          {itens.map((item, i) => {
            const ok = i < concluidos;
            return (
              <li key={item} className="flex items-center gap-3">
                <span
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors"
                  style={{
                    borderColor: ok ? cor : "var(--color-border)",
                    backgroundColor: ok ? cor : "transparent",
                    color: ok ? "var(--color-primary-foreground)" : "transparent",
                  }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span
                  className="quiz-text min-w-0"
                  style={ok ? { color: "var(--color-foreground)" } : undefined}
                >
                  {item}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Screen>
  );
}
