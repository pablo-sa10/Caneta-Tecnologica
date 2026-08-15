import { Eyebrow } from "@/components/ui/Eyebrow";
import { praise } from "@/lib/content";

/**
 * Corredor entre a dobra de tecnologia e a de experiência: a faixa em marquee
 * da seção 5 do DS, com as marcas trocadas por características da caneta.
 *
 * O tratamento do texto é o da *outra* faixa do DS — a de rótulos, em mono
 * caixa alta com o `◦` separando —, porque é dela que este conteúdo se
 * aproxima. Da faixa de logos vem a mecânica: duas cópias correndo e o
 * apagamento das pontas.
 *
 * Server Component. A animação é toda CSS, o hover que pausa é CSS, e não há
 * estado nenhum para guardar — não há o que hidratar aqui.
 */
export function Ticker() {
  return (
    <section
      aria-label={praise.label}
      className="relative overflow-hidden border-t border-line bg-paper py-6 md:py-7"
    >
      <div className="marquee-container marquee-mask">
        <Track />
        {/* A segunda cópia é só a emenda do laço: para o leitor de tela ela
            seria a lista repetida sem motivo. */}
        <Track aria-hidden />
      </div>
    </section>
  );
}

function Track({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) {
  return (
    <ul className="marquee-content items-center" aria-hidden={ariaHidden}>
      {praise.items.map((item) => (
        <li key={item} className="flex items-center gap-8 px-8">
          <Eyebrow className="whitespace-nowrap transition-colors duration-300 hover:text-ink">
            {item}
          </Eyebrow>
          {/* Separador do DS. Decorativo: quem lê em voz alta não precisa
              ouvir um losango entre cada item. */}
          <span aria-hidden className="text-[10px] text-muted">
            ◦
          </span>
        </li>
      ))}
    </ul>
  );
}
