---
name: "Center Quest"
description: "Sistema institucional preciso para presentar operaciones con confianza, control y contención premium."
colors:
  celeste: "#74c3d5"
  petroleo: "#3f738d"
  verde-web: "#6aaa00"
  gris-calido: "#d6d1ca"
  page: "#f8f7f4"
  foreground: "#0d1e29"
  muted: "#4a5c6a"
  border: "#e2ddd6"
  surface-raised: "#ffffff"
  surface-sunken: "#f0ede8"
  ink: "#0a1116"
typography:
  display:
    fontFamily: "Josefin Sans, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.05rem, 3.9vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Josefin Sans, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2rem, 3.1vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Josefin Sans, Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Josefin Sans, Arial, Helvetica, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.12em"
rounded:
  control: "2px"
  panel: "4px"
  circular: "999px"
components:
  button-primary:
    backgroundColor: "{colors.celeste}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.375rem 0.75rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.375rem 0.75rem 1.5rem"
  button-dark:
    backgroundColor: "{colors.petroleo}"
    textColor: "{colors.surface-raised}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.5rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0 1.2rem"
  input:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.6rem 0.8rem"
  choice-chip:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    padding: "0.48rem 0.8rem"
---

# Design System: Center Quest

## Overview

**Creative North Star: "La sala de control institucional"**

Center Quest se presenta como una operación coordinada que ya está en marcha: precisa, serena y capaz. El mundo visual combina campos de tinta, superficies cálidas y luz celeste para transmitir control sin caer en la estética de software genérico ni en el lujo decorativo.

La interfaz trabaja con contención premium. La jerarquía nace de la tipografía, el contraste, las reglas finas y el espacio; los acentos aparecen donde orientan una decisión o explican un estado. La profundidad es mayormente tonal y las sombras solo hacen visible una elevación, un cambio de estado o una superficie que necesita separarse.

El lenguaje técnico es institucional, no futurista: linework preciso, bordes casi cuadrados, paneles sobrios y movimiento con peso. Las experiencias pueden expresar cada servicio de forma propia, pero deben seguir compartiendo la paleta, la voz tipográfica, la cuadrícula y la ruta clara hacia una cotización.

**Key Characteristics:**

- Dos azules institucionales con funciones distintas, no un campo de acentos intercambiables.
- Josefin Sans como única voz tipográfica.
- Superficies marfil cálido y campos de tinta casi negros.
- Reglas finas, cuadrícula compartida y linework técnico contenido.
- Controles comerciales casi cuadrados con estados táctiles claros.

## Colors

La paleta separa autoridad, atención y soporte: petróleo estructura, celeste ilumina, verde se reserva como acento secundario y los neutros permanecen cálidos.

### Primary

- **Celeste institucional:** luz de marca para llamadas a la acción, reglas activas, iconos y focos sobre superficies oscuras.
- **Azul petróleo institucional:** autoridad sobre superficies claras; se usa en acciones principales, enlaces activos, contornos de foco y estructura cromática.

### Secondary

- **Verde web accesible:** acento secundario para estados o identidades de servicio. La implementación web usa la variante profundizada y contrastada definida en los tokens, no el verde de impresión sin ajuste.
- **Gris cálido:** apoyo institucional para separación y fondos suaves sin introducir grises fríos genéricos.

### Neutral

- **Marfil de página:** fondo base cálido de la experiencia.
- **Tinta de contenido:** texto principal de alto contraste sobre superficies claras.
- **Texto atenuado:** información secundaria que conserva contraste de lectura.
- **Borde cálido:** hairlines, divisores y contornos discretos.
- **Superficie elevada:** blanco para campos, paneles y celdas que necesitan separación limpia.
- **Superficie hundida:** estrato tonal para estados inactivos y regiones subordinadas.
- **Ink:** campo oscuro para aperturas, cierres, overlays y momentos institucionales de alto contraste.

**The Two-Blue Rule.** El celeste atrae y señala; el petróleo estructura y afirma. No intercambiar sus papeles por conveniencia local.

## Typography

**Display Font:** Josefin Sans (con Arial, Helvetica y sans-serif como respaldo)  
**Body Font:** Josefin Sans (con Arial, Helvetica y sans-serif como respaldo)

**Character:** Una sola familia geométrica sostiene toda la interfaz. El contraste viene del peso, la escala, el tracking y la medida; no de mezclar voces tipográficas.

### Hierarchy

- **Display:** titulares de apertura, con escala fluida y medida controlada; el peso medio conserva autoridad sin hacerse pesado.
- **Headline:** encabezados de sección, compactos y ligeramente cerrados para construir bloques editoriales claros.
- **Body:** lectura principal con ritmo abierto y contraste alto; los párrafos de apoyo suelen mantenerse alrededor de 42–64 caracteres por línea.
- **Label:** CTAs, estados y microetiquetas en mayúsculas con tracking amplio; nunca sustituye al cuerpo de lectura.

**The One-Family Rule.** Toda la voz visual usa Josefin Sans; la jerarquía se resuelve dentro de sus pesos 400 y 500/600, no añadiendo otra familia.

## Layout

El sitio se alinea sobre un contenedor compartido de hasta 84rem. El gutter lateral es de 1.25rem en pantallas amplias y 1rem en pantallas compactas. Las secciones usan ritmo vertical fluido con `clamp()` y combinan columnas editoriales asimétricas o equilibradas cuando el contenido lo exige.

Las composiciones de dos y tres columnas colapsan a una columna antes de que el texto pierda una medida legible. Los cambios recurrentes aparecen alrededor de 64rem para simplificar estructuras complejas y 42rem para el apilado compacto. En móvil, las acciones importantes ocupan el ancho disponible y las zonas táctiles conservan un mínimo de 2.75rem.

La alineación compartida entre navegación, titulares, reglas y cierres comerciales tiene prioridad sobre centrar cada bloque de forma aislada. El espacio en blanco comunica capacidad operativa: no debe rellenarse con tarjetas o adornos sin función.

## Elevation & Depth

El sistema es plano por defecto. La separación nace de cambios tonales, bordes de un píxel, scrims, blur y luz localizada; las sombras son ambientales, de baja opacidad y gran difusión. Se reservan para menús flotantes, superficies interactivas elevadas y la respuesta de hover de controles comerciales.

### Shadow Vocabulary

- **CTA en reposo:** sombra celeste corta y contenida para separar una acción primaria sin volverla brillante.
- **CTA elevada:** difusión más amplia cuando el puntero confirma interactividad.
- **Panel flotante:** sombra oscura y amplia para dropdowns, sidebars y diálogos que se separan del plano de lectura.
- **Superficie de formulario:** combinación de hairline interior y sombras muy comprimidas para que el wizard se perciba como un instrumento, no como una tarjeta decorativa.

**The Flat-by-Default Rule.** Una superficie en reposo no recibe sombra por estilo; solo la obtiene cuando su elevación o estado necesita explicarse.

## Shapes

Los controles comerciales, campos y chips son casi cuadrados. Los paneles flotantes reciben una curva apenas perceptible, mientras que los círculos completos se reservan para controles de icono, indicadores de estado y geometría intrínsecamente circular. Las reglas de uno o dos píxeles y los cortes rectos definen el carácter más que los contenedores redondeados.

**The Precision-before-Rounding Rule.** Usar primero alineación, hairlines y contraste; la curvatura nunca debe convertir navegación, filtros o CTAs en una colección de píldoras.

## Components

### Buttons

- **Shape:** controles rectangulares compactos, con esquinas casi cuadradas y una zona táctil mínima clara.
- **Primary:** celeste sobre campos de tinta y petróleo sobre superficies claras. Los CTAs comerciales usan etiqueta compacta en mayúsculas y tracking amplio.
- **Hover / Focus:** elevación breve, cambio tonal o barrido de superficie; el foco siempre conserva un contorno visible y contrastado respecto del fondo.
- **Secondary / Ghost:** borde cálido y fondo transparente. Gana contraste tonal al interactuar sin competir con la acción principal.
- **Motion:** el hover puede elevar uno o dos píxeles; el press comprime con respuesta inmediata. Todo estado respeta `prefers-reduced-motion`.

### Chips

- **Style:** superficie blanca, borde cálido y geometría casi cuadrada; el contenido puede combinar icono y etiqueta.
- **State:** la selección adopta el color del servicio como borde, tinte de fondo y refuerzo tipográfico. El foco envuelve el chip completo, no el input oculto.

### Cards / Containers

- **Corner Style:** paneles utilitarios discretamente curvos o casi cuadrados según su función; no existe una tarjeta genérica que deba envolver todo.
- **Background:** superficies claras sobre el marfil de página; tinta para aperturas, cierres y capas modales.
- **Shadow Strategy:** seguir la filosofía de elevación; los listados planos prefieren hairlines y cambios tonales.
- **Border:** un píxel, cálido y de bajo contraste. Un acento lineal de uno o dos píxeles puede indicar identidad o estado.

### Inputs / Fields

- **Style:** campos blancos, borde cálido, esquinas casi cuadradas y texto heredado de la familia principal.
- **Focus:** el borde adopta el color contextual y recibe un halo exterior contenido.
- **Error / Disabled:** el error conserva texto, icono y contorno; el estado inactivo baja contraste sin parecer inaccesible o desaparecer.
- **Touch:** los campos usan texto de al menos 16px en punteros gruesos para evitar zoom involuntario en iOS.

### Navigation

- **Desktop:** barra transparente sobre aperturas oscuras y chrome marfil translúcido al entrar en contenido claro. Los enlaces usan color y una regla celeste deslizante para estado activo o hover, no fondos tipo píldora.
- **Dropdowns:** paneles compactos con borde tenue, blur y sombra ambiental; su apertura es corta y direccional.
- **Mobile:** sidebar modal desde la derecha, con backdrop oscuro, scroll bloqueado, acordeones lineales y CTA comercial al final.
- **Focus:** los fondos claros usan petróleo; los oscuros usan celeste.

## Do's and Don'ts

### Do:

- **Do** alinear navegación y secciones al contenedor compartido de 84rem y conservar sus gutters responsivos.
- **Do** reservar el celeste para acciones, focos y señales que realmente orientan la lectura.
- **Do** construir jerarquía con Josefin Sans, contraste, medida y espacio antes de introducir contenedores.
- **Do** mantener zonas táctiles de al menos 2.75rem y foco visible sobre superficies claras y oscuras.
- **Do** usar linework fino y cambios tonales para explicar estructura operativa.

### Don't:

- **Don't** introducir otras familias tipográficas ni pesos extremos ajenos al sistema.
- **Don't** sustituir reglas activas o divisores por píldoras de color sin una necesidad funcional.
- **Don't** redondear cada bloque o convertir listados editoriales en mosaicos de tarjetas genéricas.
- **Don't** usar sombras decorativas permanentes donde un borde o cambio tonal comunica la misma jerarquía.
- **Don't** recurrir a grises fríos genéricos, colores sin fuente o composiciones dominadas por fotografía de stock.

---

## Excepción documentada: el Blog

El **índice del blog** (`/[lang]/blog`) se aparta del sistema institucional por decisión explícita del cliente, tomando como referencia el blog de Notion. No es deriva: es una excepción acotada a esta sección, y no autoriza las mismas licencias en el resto del sitio.

Qué se aparta, y hasta dónde:

- **Hoja blanca sin acentos de color.** No hay campos de tinta ni celeste ni petróleo en la interfaz. El único color de la página lo ponen las portadas de los artículos. El celeste sigue siendo el acento del resto del sitio.
- **Radios de 12px** en portadas y miniaturas, contra los 2–4px de `rounded.control` / `rounded.panel`. Aplica solo a las imágenes del blog.
- **Grilla de tres columnas** con imagen sobre texto. El sistema desaconseja los mosaicos de tarjetas para listados editoriales; acá se acepta porque la portada de cada artículo es contenido real, no un contenedor decorativo — no hay borde, sombra ni fondo alrededor del texto.
- **Contenedor de 70rem** en vez del compartido de 84rem: con tres columnas, 84rem deja cada portada tan ancha que el título queda flotando bajo una imagen desproporcionada.
- **Grises neutros propios** (`--text-secondary` / `--text-tertiary` redefinidos en `.cq-blog-surface`). Los grises del sistema salen del azul institucional y ese tinte ensucia una hoja sin color.

Lo que **sí** se conserva: Josefin Sans como única voz tipográfica, la escala y los pesos del sistema, la navegación y el footer del sitio, las zonas táctiles y el foco visible.
