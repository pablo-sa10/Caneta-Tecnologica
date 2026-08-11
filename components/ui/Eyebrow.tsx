import type { ComponentProps } from "react";

/**
 * Label de metadado: mono, caixa alta, tracking largo. No DS a monoespaçada
 * é reservada a rótulos, números e código — nunca a corpo de texto.
 */
export function Eyebrow({ className = "", ...props }: ComponentProps<"span">) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-[0.28em] text-graphite ${className}`}
      {...props}
    />
  );
}
