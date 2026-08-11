/**
 * Todo o texto da página vive aqui. Componentes de seção só fazem layout —
 * trocar copy nunca deve exigir abrir um `.tsx`.
 */

/** Uma linha do título, com o tratamento de lettering que o DS aplica a ela. */
export type HeadlineLine = {
  text: string;
  /** `outline` = traço vazado; `gradient` = preenchimento em --grad-ink */
  treatment: "outline" | "gradient";
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
  /* Três linhas, como o título da hero do DS. O vazado fica na do meio: é a
     afirmação da frase, e sobre o vídeo o traço aberto deixa o produto
     aparecer por dentro das letras. */
  headline: [
    { text: "A caneta", treatment: "gradient" },
    { text: "mais tecnológica", treatment: "outline" },
    { text: "do mundo.", treatment: "gradient" },
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
