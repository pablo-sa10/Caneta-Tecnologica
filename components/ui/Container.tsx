import type { ComponentProps } from "react";

/**
 * Ritmo horizontal da página. O DS trabalha com uma grade editorial larga e
 * respiro generoso nas laterais — nada de `max-w-3xl` de blog.
 */
export function Container({
  className = "",
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={`mx-auto w-full max-w-[1600px] px-6 md:px-12 ${className}`}
      {...props}
    />
  );
}
