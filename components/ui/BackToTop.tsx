"use client";

import { scrollToTop } from "@/components/providers/SmoothScrollProvider";
import { IconArrowUp } from "@/components/ui/icons";

/**
 * A pílula "voltar ao topo" do rodapé do DS.
 *
 * É `<button>` e não `<a href="#topo">` porque o Lenis não intercepta rolagem
 * programática: uma âncora nativa muda a posição por fora e ele só descobre no
 * frame seguinte, o que aparece como tranco. Pedir ao Lenis devolve o mesmo
 * gesto do resto da página.
 *
 * Vive sozinho num arquivo client para que o rodapé continue Server Component
 * — ele é o único pedaço de lá que precisa de JavaScript.
 */
export function BackToTop({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="group inline-flex items-center gap-3 rounded-full border border-line px-8 py-4 text-base transition-all duration-300 hover:border-ink hover:bg-ink hover:text-bone"
    >
      {label}
      <IconArrowUp className="text-xl transition-transform group-hover:-translate-y-1 group-[.is-on]:-translate-y-1" />
    </button>
  );
}
