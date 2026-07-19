# Center Quest — Guía de Diseño

## Paleta de Colores

Paleta institucional oficial de Center Quest (manual de marca), con valores exactos en Pantone, CMYK, RGB y HEX. Esta paleta **reemplaza** la estimación visual tomada del mockup inicial.

### Colores principales

| Color | Pantone (Solid Coated) | CMYK | RGB | HEX |
|---|---|---|---|---|
| **Celeste institucional** | 630C | C52 M5 Y14 K0 | R116 G195 B213 | `#74C3D5` |
| **Azul petróleo institucional** | 7698C | C79 M47 Y32 K6 | R63 G115 B141 | `#3F738D` |

### Colores secundarios

| Color | Pantone (Solid Coated) | CMYK | RGB | HEX |
|---|---|---|---|---|
| **Verde institucional** | 376C | C56 M3 Y100 K10 | R128 G188 B0 | `#80BC00` |
| **Gris cálido** | Warm Gray 1 C | C15 M14 Y17 K0 | R214 G209 B202 | `#D6D1CA` |

### Notas de uso

- El **celeste institucional** (`#74C3D5`) y el **azul petróleo** (`#3F738D`) son los colores principales de marca: base para header/footer, fondos de sección y elementos de identidad.
- El **verde institucional** (`#80BC00`) es un color secundario de acento, útil para CTAs, badges o elementos que requieran destacar sin competir con el azul principal.
- El **gris cálido** (`#D6D1CA`) funciona como color neutro secundario, ideal para fondos suaves, separadores o texto de apoyo, evitando el uso de grises fríos genéricos.
- Cada color cuenta con su escala de tintas (90% a 10%) para variaciones de fondo, hover states y jerarquía visual sin salir de la paleta institucional.

## Tipografía

Estilo objetivo: premium minimalista, inspirado en Stripe.

| Uso | Fuente | Peso | Fuente de descarga |
|---|---|---|---|
| **Titulares (headlines)** | Switzer | Bold / Semibold | [Fontshare](https://www.fontshare.com/fonts/switzer) |
| **Cuerpo de texto** | Switzer | Regular / Medium | [Fontshare](https://www.fontshare.com/fonts/switzer) |

### Notas de uso

- Una sola familia (Switzer) cubre titulares y cuerpo, diferenciados por peso — Bold/Semibold para títulos, Regular/Medium para lectura — en vez de dos tipografías distintas.
- Se reemplazó la pareja anterior (Geist + Inter): es la combinación "premium-Stripe" más repetida en sitios asistidos por IA, y no diferenciaba a la marca. Switzer mantiene el mismo carácter neutro-premium (es prima cercana de Söhne/Suisse Int'l, la familia que usa Stripe) sin caer en ese mismo lugar común.
- Los archivos (`.woff2`, licencia Fontshare Free — gratis para uso comercial) viven en `src/fonts/switzer/` y se cargan vía `next/font/local` en `layout.tsx`, autohospedados (sin depender del CDN de Fontshare en producción).
- Evitar mezclar más de esta familia tipográfica para mantener la coherencia minimalista.

---
*Este documento se irá actualizando a medida que se defina el diseño final del sitio.*
