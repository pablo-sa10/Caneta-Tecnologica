"use client";

import type { ComponentProps, PointerEvent } from "react";

/**
 * Cartão da seção 4.3 do DS, variante *flashlight*: um radial de 600px segue o
 * ponteiro por dentro do cartão e some quando o mouse sai.
 *
 * O DS resolve o rastreamento com um `querySelectorAll('.flashlight-card')` no
 * carregamento; aqui é o `onPointerMove` do próprio primitivo escrevendo nas
 * mesmas variáveis, pelo mesmo motivo do `BeamButton`: um seletor global sairia
 * caçando elementos que o React acabou de montar.
 *
 * O `::before` da lanterna vive em `z-index: 2`, então tudo que for conteúdo
 * precisa subir acima disso — daí o `relative z-10` nos filhos.
 */
export function FlashlightCard({
  className = "",
  onPointerMove,
  ...props
}: ComponentProps<"article">) {
  const trackPointer = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
    onPointerMove?.(event);
  };

  return (
    <article
      onPointerMove={trackPointer}
      className={`flashlight-card group flex flex-col justify-between bg-paper p-8 ${className}`}
      {...props}
    />
  );
}
