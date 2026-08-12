import type { ComponentProps } from "react";

/**
 * Ritmo horizontal da página. O DS trabalha com uma grade editorial larga e
 * respiro generoso nas laterais — nada de `max-w-3xl` de blog.
 *
 * A largura máxima é a do `MAIN CONTAINER` do DS (1400px). Superfícies e
 * réguas sangram de ponta a ponta — quem entra na grade é só o conteúdo —,
 * então este é o único lugar que decide onde a coluna de texto começa: a barra
 * fixa e as seções usam o mesmo `Container`, e é só por isso que a marca
 * alinha com o título da hero.
 */
export function Container({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`mx-auto w-full max-w-[1400px] px-6 md:px-12 ${className}`}
      {...props}
    />
  );
}
