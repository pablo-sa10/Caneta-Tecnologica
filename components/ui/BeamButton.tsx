"use client";

import type { ComponentProps, PointerEvent } from "react";

/**
 * CTA primário — o botão preenchido da hero do DS: `beam-button` (o feixe que
 * varre no hover), `magnetic` (halo que segue o ponteiro) e `glow-on-hover`
 * empilhados no mesmo elemento.
 *
 * O `magnetic` do DS é um listener solto que escreve `--mx`/`--my` no estilo do
 * botão. Aqui é o `onPointerMove` do próprio primitivo escrevendo nas mesmas
 * variáveis: mesma escrita direta no DOM, sem um `querySelectorAll` global
 * caçando elementos que o React acabou de montar.
 */
export function BeamButton({
  className = "",
  type = "button",
  children,
  onPointerMove,
  ...props
}: ComponentProps<"button">) {
  const trackPointer = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
    onPointerMove?.(event);
  };

  return (
    <button
      type={type}
      onPointerMove={trackPointer}
      className={`group beam-button magnetic glow-on-hover flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-sm font-medium text-bone transition-all ${className}`}
      {...props}
    >
      <span className="mag-glow" />
      {children}
    </button>
  );
}
