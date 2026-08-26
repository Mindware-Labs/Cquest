/* Los campos SEO son opcionales: vacíos, la página cae en el título y el
   extracto. La derivación vive aquí para que el panel prometa exactamente lo
   que la página publica, y no dos textos parecidos que se separan con el tiempo. */

export function seoTitleFor(title: string, seoTitle?: string | null): string {
  return seoTitle?.trim() || `${title} | Center Quest`;
}

export function seoDescriptionFor(excerpt: string, seoDescription?: string | null): string {
  return seoDescription?.trim() || excerpt;
}
