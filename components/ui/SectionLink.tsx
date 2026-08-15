"use client";

import type { ComponentProps, MouseEvent } from "react";
import { scrollToSection } from "@/components/providers/SmoothScrollProvider";

/**
 * Âncora para uma seção da página, percorrida em vez de saltada.
 *
 * Continua sendo `<a href="#secao">` de verdade — clique do meio abre em outra
 * guia, o endereço aparece na barra de status, o leitor de tela anuncia um
 * link e, se o JavaScript falhar, o salto nativo ainda leva ao lugar certo. O
 * `preventDefault` só troca o salto pelo percurso do Lenis.
 *
 * Modificador de teclado ou botão que não seja o principal passam direto: quem
 * segura Ctrl quer abrir noutro lugar, não rolar aqui.
 */
export function SectionLink({
  href = "",
  onClick,
  ...props
}: ComponentProps<"a">) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    const modified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || modified || event.button !== 0) return;
    if (!href.startsWith("#")) return;

    event.preventDefault();
    scrollToSection(href);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
