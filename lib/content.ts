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
     * A caneta flutua até ~3,6s, a caderneta se abre por volta de 4s, a ponta
     * encosta no papel em ~5,6s e a partir daí escreve. Terminar em 6s entrega
     * esse encontro como clímax.
     *
     * O arquivo hoje tem exatamente esses 6s — o material original tinha 8s e
     * foi cortado no reencode, porque prolongar a caligrafia custava peso sem
     * acrescentar cena. O `clip` fica como contrato explícito: se um material
     * mais longo entrar aqui um dia, o scrub continua percorrendo só o trecho
     * que interessa em vez de se esticar sozinho.
     */
    clip: { start: 0, end: 6 },
    /** Descrição do vídeo para leitores de tela. */
    caption:
      "A caneta ARTOOLS flutuando sobre fundo branco; em seguida uma caderneta se abre abaixo dela e a ponta desce até o papel e começa a escrever.",
  },

  scrollHint: "Scroll to control",
} as const;

/**
 * Segunda dobra: o que a caneta é por dentro. Toda a copy — inclusive os
 * números — vem da referência que o cliente passou; nada aqui foi inventado
 * para preencher espaço.
 */
export const technology = {
  eyebrow: "Technology",

  /** Vazado gigante sangrando pela borda. Uma palavra: o corpo é enorme. */
  watermark: "PRECISION",

  /* Duas linhas em tratamentos opostos, como no `#hero-title` do DS: a
     afirmação em tinta cheia, o eco em traço vazado. */
  headline: [
    { text: "Engenharia Suíça.", treatment: "gradient" },
    { text: "Precisão Molecular.", treatment: "outline" },
  ] satisfies HeadlineLine[],

  lead: "Nossa arquitetura de fluxo proprietária sincroniza a deposição de tinta em tempo real. Construída sobre um chassi de alumínio aeroespacial usinado em CNC de 5 eixos.",

  media: {
    src: "/media/artools_tech_feature.png",
    alt: "Detalhe macro da caneta ARTOOLS: a ponta, o anel e o grip texturizado em alumínio escovado.",
  },

  /**
   * Leituras sobrepostas à foto — a dobra como visor de instrumento. A
   * primeira carrega uma barra de preenchimento; a segunda, uma medida.
   */
  readouts: {
    material: { label: "Core_Alu_6061", fill: 0.8 },
    tip: { value: "0.3", unit: "mm", label: "Tip_Precision" },
  },

  features: [
    {
      index: "01",
      title: "Alumínio Aeroespacial",
      body: "Estrutura monobloco usinada em Alumínio 6061-T6. Leveza extrema (14g) com resistência estrutural de nível militar.",
    },
    {
      index: "02",
      title: "Fluxo Híbrido",
      body: "Sistema de tinta de baixa viscosidade com regulação por capilaridade assistida. O traço nunca falha até 15°.",
    },
    {
      index: "03",
      title: "Grip Texturizado",
      body: "Micro-usinagem a laser cria uma superfície de aderência perfeita (Ra 0.8µm) sem acumular resíduos.",
    },
  ],
} as const;

/**
 * Fecho da página: o convite. O fundo é o carrossel da hero do DS — as três
 * fotos dele, em monocromático, trocando devagar atrás de um cartão escuro.
 *
 * As imagens são conteúdo do DS, não do produto: entram como marcador até
 * existir fotografia própria da caneta em ambiente. Trocar aqui basta.
 */
export const signature = {
  /* O fundo é decorativo — o assunto é o cartão —, então os quadros não levam
     `alt`. Descrevê-los faria o leitor de tela narrar cenário enquanto o
     convite, que é o que importa, espera a vez. */
  slides: [
    "/media/signature-01.webp",
    "/media/signature-02.webp",
    "/media/signature-03.webp",
  ],

  /** Tempo em cartaz de cada quadro. O DS usa 5s; o esmaecer leva 1,5s. */
  intervalMs: 5000,

  brand: { name: "Artools", suffix: "Pro" },
  meta: "Signature Series • 2026",
  action: { label: "Get Early Access" },
} as const;

/**
 * Corredor entre a segunda e a terceira dobra: uma faixa fina que corre sozinha
 * enquanto a página respira. Não é uma dobra — é a pausa entre duas.
 *
 * Metade dos itens é qualitativa e metade repete número que já está em
 * `technology`. A mistura é deliberada: só elogio soa a folheto, só
 * especificação soa a ficha técnica. Nenhum dado novo entra aqui — se um
 * número não aparece em outro lugar do arquivo, ele não pode nascer nesta
 * faixa.
 */
export const praise = {
  label: "Características da Artools Precision Pen",
  items: [
    "Peso que desaparece na mão",
    "Alumínio 6061-T6",
    "Traço que não hesita",
    "Usinagem CNC de 5 eixos",
    "Silêncio de instrumento",
    "0,3 mm de precisão",
    "Equilíbrio sem esforço",
    "Objeto antes de ferramenta",
  ],
} as const;

/**
 * Terceira dobra: como é escrever com ela. A anterior fala de material e
 * usinagem; esta fala do gesto — daí o cabeçalho centrado, e não alinhado à
 * esquerda como o das outras.
 *
 * `icon` é a chave do ícone no mapa da seção, não o componente: `content.ts`
 * carrega texto e dados, e importar JSX aqui inverteria a dependência.
 */
export const experience = {
  eyebrow: "Architecture of Thought",

  /* Nesta dobra não há lettering transparente — as duas linhas são tinta
     cheia, a segunda em `--muted`. É o contraponto às duas primeiras, que já
     carregam vazado e foto: três dobras seguidas de letra recortada viram
     maneirismo. */
  headline: { lead: "A ferramenta invisível para", trail: "ideias tangíveis." },

  cards: [
    {
      icon: "pen",
      title: "Fluxo Contínuo",
      body: "A tinta flui sem interrupções, permitindo que seus pensamentos corram livremente para o papel sem fricção.",
    },
    {
      icon: "soundwave",
      title: "Silêncio Absoluto",
      body: "Mecanismo de clique silencioso e ponta amortecida. Escreva em qualquer ambiente sem distrações.",
    },
    {
      icon: "scale",
      title: "Equilíbrio Neutro",
      body: "Centro de gravidade estudado para repousar na junção da mão, reduzindo a fadiga em 40%.",
    },
  ],
} as const;
