import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { nextFold } from "@/lib/content";

/**
 * Esboço da dobra seguinte. Serve para dois propósitos enquanto o conteúdo
 * real não existe: dar ao scroll um destino depois que o pin da hero solta —
 * sem isso a página termina no meio do gesto — e reservar o lugar da seção na
 * composição.
 *
 * A régua de metadados é a da hero do DS (`flex items-center gap-4` com
 * eyebrow, um traço de 1px e o ponto de radar), e o título usa o lettering
 * vazado. É Server Component: não tem nada de interativo aqui.
 *
 * O `border-t` é a única divisão entre esta dobra e a hero: uma régua de 1px
 * sangrando de ponta a ponta, sem nada de fundo por baixo.
 */
export function NextFold() {
  return (
    <section
      id="proxima-dobra"
      className="relative border-t border-line bg-mist"
    >
      <Container className="relative flex min-h-[70vh] flex-col justify-center gap-8 py-24">
        <div className="flex items-center gap-4">
          <Eyebrow>{nextFold.eyebrow}</Eyebrow>
          <span aria-hidden className="h-px w-16 bg-line" />
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="radar-dot h-1.5 w-1.5 rounded-full bg-ink"
            />
            <Eyebrow>{nextFold.status}</Eyebrow>
          </span>
        </div>

        <h2 className="text-outline text-[13vw] font-semibold leading-[0.9] tracking-tighter lg:text-[6.2rem] xl:text-[7.8rem]">
          {nextFold.title}
        </h2>

        <p className="max-w-xl text-base leading-relaxed text-slate md:text-lg">
          {nextFold.lead}
        </p>
      </Container>
    </section>
  );
}
