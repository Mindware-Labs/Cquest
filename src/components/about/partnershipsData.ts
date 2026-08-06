import type { Locale } from "@/i18n/config";

export const PARTNER_SLOTS: ReadonlyArray<{
  slug: string;
  name: Record<Locale, string>;
  logo: {
    src: string;
    width: number;
    height: number;
  };
}> = [
  {
    slug: "mindware-labs",
    name: { en: "Mindware Labs", es: "Mindware Labs" },
    logo: {
      src: "/mindware-labs/logo_white_background.jpg",
      width: 2048,
      height: 737,
    },
  },
];
