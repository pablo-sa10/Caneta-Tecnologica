"use client";

import type { ComponentProps } from "react";
import { SectionLink } from "@/components/ui/SectionLink";

/**
 * CTA secundário — o botão de borda cônica da hero do DS. A moldura é um
 * `p-[1px]` com um `span.ring` girando atrás: o recorte de 1px é o que vira
 * borda. Por cima, um brilho em `shimmer` atravessa o corpo no hover.
 *
 * O corpo é opaco (`bg-bone`) de propósito, como no original — sobre o vídeo é
 * o que garante que a borda girando continue legível.
 *
 * Com `href` ele vira âncora de seção em vez de botão. A troca é de elemento,
 * não de aparência: um controle que leva a algum lugar é um link, e fingir de
 * botão custaria o clique do meio, o endereço na barra de status e o anúncio
 * certo no leitor de tela.
 */
type Props = ComponentProps<"button"> & { href?: string };

export function ConicButton({
  className = "",
  type = "button",
  href,
  children,
  ...props
}: Props) {
  const shell = `conic-ring group relative z-10 inline-flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none ${className}`;

  const body = (
    <>
      <span className="ring" />
      <span className="relative flex items-center rounded-full bg-bone px-8 py-[15px] ring-1 ring-line">
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <span className="absolute left-0 top-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-ink/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
        </span>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <SectionLink href={href} className={shell}>
        {body}
      </SectionLink>
    );
  }

  return (
    <button type={type} className={shell} {...props}>
      {body}
    </button>
  );
}
