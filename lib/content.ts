/**
 * Todo o texto da página vive aqui. Componentes de seção só fazem layout —
 * trocar copy nunca deve exigir abrir um `.tsx`.
 */

/** Uma linha do título, com o tratamento de lettering que o DS aplica a ela. */
export type HeadlineLine = {
  text: string;
  /**
   * `outline` = traço vazado; `gradient` = preenchimento em --grad-ink;
   * `photo` = a foto recortada dentro da letra, passeando devagar.
   */
  treatment: "outline" | "gradient" | "photo";
};


/**
 * Barra fixa do topo. Os itens do meio são só rótulos: a página ainda não tem
 * destinos, então eles não navegam para lugar nenhum (`<button>` inerte, não
 * `<a href="#">` — âncora vazia sequestra o histórico e mente para o leitor
 * de tela). Quando as seções existirem, troque cada item por `{ label, href }`.
 */
export const nav = {
  logo: { name: "ARTOOLS", suffix: ".PRO" },

  links: ["Design", "Technology", "Specs"],

  theme: {
    label: "Alternar entre tema claro e escuro",
    toDark: "Mudar para o tema escuro",
    toLight: "Mudar para o tema claro",
  },

  bag: { label: "Sacola de compras" },
} as const;

export const hero = {
  /* A foto corre pelas duas últimas linhas como uma fotografia só — o recorte
     de uma continua no da outra — e o vazado abre a frase.

     O DS dá um tratamento diferente para cada uma das três linhas porque a
     hero dele é um mostruário: está ali para exibir os três de uma vez. Aqui o
     título é o título, então o acabamento se repete onde faz sentido repetir.
     O campo continua sendo por linha: trocar um valor muda o arranjo. */
  headline: [
    { text: "A caneta", treatment: "outline" },
    { text: "+tecnológica", treatment: "photo" },
    { text: "do mundo.", treatment: "photo" },
  ] satisfies HeadlineLine[],

  lead: "A Artools Precision Pen redefine o equilíbrio entre peso, fluxo e design. Feita para criadores que exigem perfeição em cada traço.",

  /* Sem destino ainda — por isso os dois são `<button>` inerte, como no DS,
     e não `<a href="#">`. Quando as seções existirem, acrescente o `href`. */
  actions: {
    primary: { label: "Comprar agora" },
    secondary: { label: "Explorar" },
  },

  media: {
    src: "/media/precision-series.mp4",
    poster: "/media/precision-series-poster.jpg",
    /**
     * O material tem 8s e o scrub percorre até 6s: a caneta flutua até ~3,6s,
     * a caderneta se abre por volta de 4s, a ponta encosta no papel em ~5,6s
     * e a partir daí escreve. Terminar em 6s entrega esse encontro como
     * clímax; o resto do arquivo só prolonga a caligrafia. Para percorrer o
     * vídeo inteiro, apague o `clip`.
     */
    clip: { start: 0, end: 6 },
    /** Descrição do vídeo para leitores de tela. */
    caption:
      "A caneta ARTOOLS flutuando sobre fundo branco; em seguida uma caderneta se abre abaixo dela e a ponta desce até o papel e começa a escrever.",
  },

  scrollHint: "Scroll to control",
} as const;

/**
 * Esboço da dobra que vem depois da hero — existe para o scroll ter para onde
 * ir quando o vídeo termina, e para marcar o lugar dela na composição. O texto
 * aqui é deliberadamente sobre o próprio estado do trabalho: nada de
 * característica de produto inventada para preencher espaço.
 */
export const nextFold = {
  eyebrow: "02 / Próxima dobra",
  status: "Rascunho",
  title: "Em construção",
  lead: "O espaço da próxima seção já está reservado na composição. O conteúdo entra aqui.",
} as const;
