import { BackToTop } from "@/components/ui/BackToTop";
import { Container } from "@/components/ui/Container";
import { SectionLink } from "@/components/ui/SectionLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { IconGlobe, IconPenSquare } from "@/components/ui/icons";
import { footer } from "@/lib/content";

/**
 * Rodapé, portado do `<footer>` do design system: luz nascendo na borda de
 * cima, chamada centrada, régua sangrando de ponta a ponta, grade de doze
 * colunas repartida em 4/3/3/2 e o lettering gigante fechando por baixo. Só o
 * texto mudou.
 *
 * Carrega `.on-dark` como a dobra da assinatura, e pelo mesmo motivo que o DS
 * escreve `bg-stone-900` fixo ali: esta banda é escura nos dois temas, de
 * propósito — é o escuro que fecha a página. Dentro do escopo os tokens são os
 * da banda escura do DS, então `bg-bone` já é a superfície certa e `text-ink`
 * já é a tinta certa, sem nenhuma cor literal.
 *
 * É Server Component. O único pedaço que precisa de JavaScript é o botão de
 * voltar ao topo, e ele mora em `BackToTop` justamente para não arrastar o
 * resto do rodapé para o cliente.
 */
export function Footer() {
  return (
    <footer className="on-dark relative z-10 overflow-hidden bg-bone pb-10 pt-24 text-slate">
      <div
        aria-hidden
        className="footer-glow pointer-events-none absolute inset-0 opacity-40"
      />

      {/* ---------- Chamada ---------- */}
      <Container className="relative mb-20 text-center">
        <h2 className="mb-8 text-5xl font-medium leading-[0.95] tracking-tighter text-ink md:text-7xl">
          {footer.cta.lead}
          <br />
          {footer.cta.trail}
        </h2>

        <BackToTop label={footer.cta.action} />
      </Container>

      {/* A régua atravessa a tela; quem respeita a grade é o conteúdo. */}
      <div aria-hidden className="relative mb-12 w-full border-t border-line" />

      {/* ---------- Grade ---------- */}
      <Container className="relative grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-0">
        {/* Marca e descrição */}
        <div className="md:col-span-4">
          <div className="mb-5 flex items-center gap-2">
            <IconPenSquare className="text-xl text-ink" />
            <span className="text-lg font-semibold tracking-tighter text-ink">
              {footer.brand.name}
              <span className="text-muted">{footer.brand.suffix}</span>
            </span>
          </div>
          <p className="max-w-[280px] text-sm leading-relaxed">
            {footer.blurb}
          </p>
        </div>

        {/* Seções — estas levam a algum lugar. O `scroll-margin-top` global
            cuida de não parar debaixo da barra fixa. */}
        <nav className="md:col-span-3" aria-label={footer.sections.title}>
          <Eyebrow className="mb-5 block">{footer.sections.title}</Eyebrow>
          <ul className="space-y-3 text-sm font-medium">
            {footer.sections.links.map((link) => (
              <li key={link.href}>
                <SectionLink
                  href={link.href}
                  className="link-draw transition-colors hover:text-ink"
                >
                  {link.label}
                </SectionLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Legal — sem destino ainda, então botão inerte e não âncora vazia. */}
        <div className="md:col-span-3">
          <Eyebrow className="mb-5 block">{footer.legal.title}</Eyebrow>
          <ul className="space-y-3 text-sm font-medium">
            {footer.legal.links.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  className="link-draw transition-colors hover:text-ink"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Globo e metadados */}
        <div className="flex flex-col justify-between md:col-span-2">
          <div className="hidden text-right md:block">
            <IconGlobe className="inline-block text-4xl text-line motion-safe:animate-[spin_12s_linear_infinite]" />
          </div>
          <div className="mt-4 flex flex-col gap-1 text-left md:mt-0 md:text-right">
            {footer.meta.map((line) => (
              <span key={line} className="font-mono text-[10px] text-muted">
                {line}
              </span>
            ))}
          </div>
        </div>
      </Container>

      {/* ---------- Lettering de fecho ----------
          Fora do `Container` de propósito: ele é largo demais para caber na
          grade e sangra pelos dois lados, cortado pelo `overflow-hidden` do
          rodapé. No DS o traço é mais fino que o do `.text-outline` e quase
          apagado; a opacidade reproduz essa presença. */}
      <div
        aria-hidden
        className="pointer-events-none relative mt-20 select-none overflow-hidden text-center"
      >
        <span className="text-outline block whitespace-nowrap text-[18vw] font-semibold leading-[0.8] tracking-tighter opacity-20">
          {footer.wordmark}
        </span>
      </div>
    </footer>
  );
}
