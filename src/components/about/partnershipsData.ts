export const PARTNER_SLOTS: ReadonlyArray<{
  slug: string;
  name: string;
  logo: {
    src: string;
    width: number;
    height: number;
  };
}> = [
  {
    slug: "mindware-labs",
    name: "Mindware Labs",
    logo: {
      src: "/mindware-labs/logo_white_background.jpg",
      /* Dimensiones reales del archivo (verificadas por header binario), no
         las que llegaron con el asset original: un ratio equivocado hace
         que next/image calcule el srcset mal, aunque el CSS del frame lo
         disimule visualmente. */
      width: 3400,
      height: 1171,
    },
  },
];
