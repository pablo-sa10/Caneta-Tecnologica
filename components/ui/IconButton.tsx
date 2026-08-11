import type { ComponentProps } from "react";

/**
 * Botão redondo de ícone da barra. As classes são as mesmas do toggle de tema
 * do DS (`w-9 h-9 grid place-items-center rounded-full border border-stone-300
 * text-stone-500 hover:text-stone-900 hover:border-stone-900 transition-all
 * duration-500`), com as cores trocadas pelos tokens equivalentes. A curva é a
 * padrão do Tailwind, como no original — o `--ease` do DS não entra aqui.
 */
export function IconButton({
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={`grid h-9 w-9 place-items-center rounded-full border border-line text-graphite transition-all duration-500 hover:border-ink hover:text-ink ${className}`}
      {...props}
    />
  );
}
