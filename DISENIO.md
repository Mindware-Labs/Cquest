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
| **Fuente principal (cuerpo de texto)** | Josefin Sans | Regular | [Google Fonts](https://fonts.google.com/specimen/Josefin+Sans) |
| **Fuente secundaria (titulares / énfasis)** | Josefin Sans | Medium | [Google Fonts](https://fonts.google.com/specimen/Josefin+Sans) |

### Notas de uso

- Una sola familia (Josefin Sans) cubre titulares y cuerpo, diferenciados por peso — Medium para títulos y énfasis, Regular para lectura — en vez de dos tipografías distintas.
- Reemplaza a Switzer (manual de marca oficial actualizado).
- Se carga vía `next/font/google` (`Josefin_Sans`) en `layout.tsx` con los pesos 400/500 — Next.js la autohospeda en build, sin dependencia de fonts.googleapis.com en producción.
- Evitar mezclar más de esta familia tipográfica para mantener la coherencia minimalista.

---
*Este documento se irá actualizando a medida que se defina el diseño final del sitio.*
