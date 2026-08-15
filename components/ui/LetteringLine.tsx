import type { CSSProperties } from "react";
import type { HeadlineLine } from "@/lib/content";

/** Tratamento de lettering do `content.ts` → classe-assinatura do DS. */
const TREATMENT_CLASS: Record<HeadlineLine["treatment"], string> = {
  outline: "text-outline",
  gradient: "gradient-text",
  photo: "text-photo",
};

/**
 * Folga que a linha de texto ganha para além da própria caixa, em `em`.
 *
 * `background-clip: text` — que é o que pinta o `gradient-text` e o
 * `text-photo` — não recorta só na forma das letras: ele pinta **dentro da
 * caixa do elemento**, e o que a letra tiver para fora dela simplesmente não
 * recebe tinta. Com `leading` fechado a caixa é mais baixa que o desenho do
 * tipo (a área de conteúdo do Inter mede 1.21em), então a perna do "g" cai do
 * lado de fora e some — cortada em linha reta, na altura exata da borda.
 *
 * Não adianta mexer na máscara, nem na ordem de pintura, nem afastar as
 * linhas: enquanto a entrelinha for menor que 1.21em, a caixa é menor que a
 * letra. O que resolve é dar caixa. O padding aqui estica a área de pintura
 * para os dois lados e a margem negativa devolve o espaço, então o desenho
 * fica inteiro sem que nada se mova.
 *
 * 0.3em cobre a sobra de qualquer entrelinha a partir de 0.61.
 */
const GLYPH_BLEED_EM = 0.3;

type Props = {
  line: HeadlineLine;
  /**
   * Folga vertical da máscara, em `em`.
   *
   * Com `leading` fechado a meia-entrelinha é negativa nas duas pontas: a caixa
   * de conteúdo nasce *por dentro* do desenho da letra, e sem folga o corte
   * come o acento em cima e a perna do "g" embaixo.
   *
   * O valor não é para ser afinado no olho — calibrar por estimativa de
   * métrica erra, porque a área de conteúdo do Inter (1.21em) e a profundidade
   * real de cada glifo não são o mesmo número. Use o limite:
   *
   *     pad ≥ (1.21 - leading) / 2 + 0.25
   *
   * O primeiro termo recupera o que a entrelinha comeu; o 0.25 cobre o glifo
   * mais fundo do latino com sobra. Em `leading-[1]` dá 0.36 (usamos 0.5); em
   * `0.95`, 0.38 (usamos 0.4).
   *
   * Isto é a folga da *máscara*, e não resolve dois desenhos se cruzando: se a
   * perna de um "g" está passando por dentro da palavra de baixo, o problema é
   * a entrelinha, não o padding — ver o comentário do `h1` na hero.
   *
   * Passar do necessário não custa nada: a margem negativa devolve o padding
   * inteiro, então o espaço entre as linhas não muda. O único efeito é as
   * caixas vizinhas se sobreporem mais — e como nenhuma tem fundo, isso não
   * aparece. Quando estiver em dúvida, arredonde para cima.
   */
  pad: number;
  /**
   * Ordem de pintura da linha. Só importa quando a entrelinha é apertada a
   * ponto de os desenhos se cruzarem: com `leading` abaixo do piso, a perna do
   * "g" desce até dentro das letras da linha seguinte, e quem é pintado por
   * último ganha. Sem isto a ordem é a do DOM — a linha de baixo por cima —, e
   * a perna aparece interrompida.
   *
   * Dando à linha de cima o número maior, a perna passa por cima em vez de
   * sumir. É escolha de composição, não conserto: os dois desenhos continuam
   * ocupando o mesmo espaço. Quem não quiser cruzamento nenhum precisa abrir a
   * entrelinha até o piso (0.969em para o par "g" sobre haste alta).
   */
  layer?: number;
  /** Vai no elemento interno — é ele que o GSAP move e que leva o tratamento. */
  className?: string;
  style?: CSSProperties;
};

/**
 * Uma linha de título dentro de uma máscara: o wrapper corta, o filho desliza
 * de baixo. É o `.text-reveal-wrapper` / `.text-reveal-content` do DS, com a
 * diferença de que lá o movimento é uma `transition` de CSS e aqui quem move é
 * o GSAP — por isso o `className` do interno é um gancho, não uma animação.
 *
 * A margem negativa devolve exatamente o que o padding tomou, para o espaço
 * entre as linhas continuar sendo só a entrelinha. Isso **exige** que o
 * elemento pai seja `flex`: entre irmãos em fluxo normal as margens verticais
 * colapsam, e duas de `-pad` viram uma de `-pad`, não `-2*pad`. O padding
 * somaria `2*pad` e a margem devolveria metade — daí um vão a mais por linha,
 * que parece culpa do padding e não é. Em contexto flex não há colapso: as
 * duas margens contam e o cancelamento é exato.
 */
export function LetteringLine({
  line,
  pad,
  layer,
  className = "",
  style,
}: Props) {
  return (
    <span
      className="relative block overflow-hidden"
      style={{
        paddingBlock: `${pad}em`,
        marginBlock: `-${pad}em`,
        zIndex: layer,
      }}
    >
      <span
        className={`block ${TREATMENT_CLASS[line.treatment]} ${className}`}
        style={{
          paddingBlock: `${GLYPH_BLEED_EM}em`,
          marginBlock: `-${GLYPH_BLEED_EM}em`,
          ...style,
        }}
      >
        {line.text}
      </span>
    </span>
  );
}
