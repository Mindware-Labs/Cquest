# Cambios — últimos dos commits (`3484ce9..b263445`)

Resumen para replicar el estado del proyecto en otra máquina.

| Commit | Mensaje |
|---|---|
| `e9a79a9` | `fix: meet the team` |
| `b263445` | `refactor: commit to deploy` |

**Diff total:** 11 archivos, +298 / −247.

Dos bloques de trabajo independientes:

1. **Departamentos: de 4 a 6** — cambia la fuente única `team/data.ts` y todo lo que la consume (organigrama, careers, metadata).
2. **PhotoDeck: de rueda 3D a fila plana** — se reescribe la animación del hero de `/team`.

---

## 1. Departamentos: 4 → 6

### `src/app/[lang]/team/data.ts` (fuente única)

`DEPARTMENTS` pasa de 4 a 6 entradas. Alimenta el organigrama de `/team` y el panel de áreas de `/careers`, así que ningún otro archivo define departamentos.

**Antes (4):** `operations`, `technology`, `human-resources`, `accounting`.

**Ahora (6):**

| `id` | `icon` | ES | EN |
|---|---|---|---|
| `customer-experience` | `headset` | Departamento de Experiencia del Cliente | Customer Experience Department |
| `business-operations` | `workflow` | Departamento de Operaciones de Negocio | Business Operations Department |
| `back-office` | `database` | Departamento de Servicios de Back Office | Back Office Services Department |
| `technology-innovation` | `code` | Departamento de Tecnología e Innovación | Technology & Innovation Department |
| `quality-assurance` | `shield` | Departamento de Aseguramiento de Calidad | Quality Assurance Department |
| `human-capital` | `userplus` | Departamento de Capital Humano | Human Capital Department |

Cada uno con 4 `responsibilities` bilingües. Iconos nuevos usados: `database` y `shield` — ya existen en `src/components/services/ServiceIcon.tsx`, no hubo que agregarlos.

### `src/app/[lang]/team/components/OrgChart.module.css`

Rejilla del directorio pasa de 2×2 a 3×2:

```css
.directory { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

Bordes interiores recalculados: sin borde derecho en `:nth-child(3n)`, sin borde inferior en `:nth-child(n + 4)`. El marco exterior lo pone `.directory`.

En el breakpoint de 2 columnas se restituye el borde derecho de `:nth-child(3n)`, se quita en `:nth-child(even)`, y el corte inferior pasa a `:nth-child(n + 5)` (última fila = tarjetas 5 y 6).

### `src/app/[lang]/team/page.tsx`

Metadata description ES/EN: "cuatro departamentos: Operaciones, Tecnología, …" → "seis departamentos: Experiencia del Cliente, Operaciones de Negocio, Servicios de Back Office, Tecnología e Innovación, Aseguramiento de Calidad y Capital Humano".

### `src/app/[lang]/team/components/Hero.tsx`

- Título: "Cuatro departamentos." → "Seis departamentos." (y `Four` → `Six` en EN).
- Se borró el comentario muerto sobre el mapa de departamentos que vivía en el hero (esa eliminación es el commit `b263445`).

### `src/app/[lang]/_careers/components/HeroBoard.tsx`

Nota del panel: "Cuatro departamentos, una operación" → "Seis departamentos, una operación" (`Four` → `Six` en EN). El contenido de las áreas sigue saliendo de `team/data.ts`.

### `src/app/[lang]/_careers/data/positions.ts`

Remapeo de `department` en 10 vacantes, porque los IDs viejos ya no existen:

| slug | antes | ahora |
|---|---|---|
| `agente-de-servicio-al-cliente` | `operations` | `customer-experience` |
| `agente-de-ventas` | `operations` | `customer-experience` |
| `agente-de-cobros` | `operations` | `customer-experience` |
| `agente-bilingue` | `operations` | `customer-experience` |
| `supervisor-de-operaciones` | `operations` | `business-operations` |
| `analista-workforce` | `operations` | `business-operations` |
| `analista-de-calidad` | `operations` | `quality-assurance` |
| `desarrollador-full-stack` | `technology` | `technology-innovation` |
| `auxiliar-de-contabilidad` | `accounting` | `back-office` |
| `especialista-de-reclutamiento` | `human-resources` | `human-capital` |

> Si se agregan vacantes en la otra PC, el `department` debe ser uno de los 6 IDs nuevos.

---

## 2. PhotoDeck: rueda 3D → fila plana de 3 cuadros

`src/app/[lang]/team/components/PhotoDeck.tsx` + `PhotoDeck.module.css`. Es el cambio más grande (+234/−125 líneas combinadas).

### Qué cambió conceptualmente

**Antes:** pila de 5 cartas en 3D. `perspective: 900px` en el escenario, `transform-style: preserve-3d`, `transform-origin: 50% 100%`, cada carta desplazada en Z/Y con `rotateX` — basculaba como cangilón de rueda. Barra de progreso CSS abajo.

**Ahora:** 3 cuadros rectos en un plano, sin perspectiva ni rotación. Uno grande al centro y uno a cada lado, casi ocultos detrás del central, de los que solo asoma una franja. El avance corre los cuadros de lado, no dobla una curva.

Razón técnica del abandono del 3D (queda documentada en el CSS): en contexto 3D el navegador ordena por geometría en vez de por `z-index`, así que el plano del lateral cruzaba el del central y cada mitad se pintaba de un lado distinto.

### Constantes nuevas en `PhotoDeck.tsx`

```ts
const VISIBLE = 3;         // antes 5
const SIDE_OFFSET = 0.36;  // corrimiento lateral, en anchos del cuadro central
const SIDE_SCALE = 0.58;   // el lateral se encoge por número, no por perspectiva
const OUTER_OFFSET = 0.72; // puesto invisible: entrada y salida
const OUTER_SCALE = 0.5;
const CARD_RATIO = 0.78;   // ancho del cuadro central sobre la columna
const CARD_ASPECT = 0.75;  // 4/3 apaisado
const SIDE_ZOOM = 1.4;     // zoom extra del lateral para que la franja caiga sobre caras
```

Eliminadas: `Z_STEP`, `Y_STEP`, `TILT_STEP`. `INTERVAL_MS = 4200` y las curvas (`ADVANCE_TRANSITION`, `EXIT_TRANSITION`, `ENTRANCE_TRANSITION`, delays) no cambian.

### `depthStyle(depth)` → `slotPose(slot, cardWidth)`

`slot` es la distancia al centro con signo: `-1` izquierda, `0` frente, `+1` derecha, `±2` el tramo invisible. Devuelve `{ x, scale, opacity, filter, zIndex }` — sin `y`, sin `z`, sin `rotateX`. El lateral se distingue con `opacity: 0.72` y `filter: saturate(0.82)`.

En el render: `const slot = 1 - position` (la posición 0 de la baraja es la que sale por la derecha).

### Medición del escenario

Nuevo: `useRef` + `useLayoutEffect` con `ResizeObserver` sobre `.stage`; `stageWidth` arranca en `620` para el render de servidor y se corrige en el primer pintado del cliente.

```ts
const cardWidth = stageWidth * CARD_RATIO;
const cardHeight = cardWidth * CARD_ASPECT;
```

El alto del `.stage` y el `width`/`height`/`marginLeft`/`marginTop` de cada `.card` ahora se calculan en JS (los márgenes negativos centran desde `top:50% / left:50%`). Por eso el CSS perdió `aspect-ratio`, `inset: 0` y los márgenes del escenario.

### Trampa de `motion` que hubo que evitar

`zIndex` **no** puede viajar en `initial` si no está también en `animate`: motion lo adopta como valor propio y lo congela en el de entrada, pisando el de `style` en cada render — el lateral quedaba siempre encima del central. `initial`/`animate`/`exit` sólo llevan `x`, `scale`, `opacity`, `filter`.

### Encuadre de las fotos

`objectPosition` por puesto: `center 40%` al centro, `72% 40%` a la izquierda, `28% 40%` a la derecha. El lateral suma `transform: scale(1.4)` con `transformOrigin` igual al `objectPosition` — si el origen quedaba en `50%`, el encuadre se iba a la pared en vez de las caras. `transform` se agregó a la `transition` de `.photo` (misma curva de 520 ms que `object-position`) para que no se note el salto al volver a `scale(1)`.

`sizes` pasa de `(max-width: 70rem) 70vw, 26rem` a `(max-width: 70rem) 62vw, 25rem`. `priority` ahora sobre `slot === 0`.

### Eliminado del CSS

- `.progress` y `.progressBar` + `@keyframes fill` (barra de progreso) — y con ellos el state `cycle` en el TSX.
- Media queries `70rem` / `42rem` que ajustaban `margin-block-start` del escenario (ya no hay márgenes fijos que ajustar).
- `perspective`, `perspective-origin`, `transform-style`, `aspect-ratio` en `.stage`.

### Ajustes de valor en el CSS

- `.deck` ancho: `min(100%, 26rem)` → `min(100%, 40rem)`.
- `.glow` inset `-14% -10%` → `-16% -8%`; gradiente `56% 54%` → `52% 56%`.
- `.card` fondo `rgba(7,20,27,0.85)` → `#07141b` opaco — si las fotos traen alfa, un fondo translúcido dejaba asomar el cuadro de atrás por los huecos.
- `.card` `transform-origin: 50% 100%` → `50% 50%`.
- `.sheen` velo más suave: `0.08/0.58` → `0.06/0.5`, y el celeste `0.16` → `0.14`.

### `src/app/[lang]/team/components/Hero.module.css`

La columna del deck crece porque la escena es más ancha:

```css
grid-template-columns: minmax(0, 0.78fr) minmax(36rem, 1.22fr); /* antes 0.9fr / minmax(34rem, 1.1fr) */
gap: clamp(3rem, 5vw, 5rem);                                    /* antes clamp(3.5rem, 7vw, 7rem) */
```

---

## 3. Archivos de tooling (opcional replicar)

- **`.claude/settings.json`** — 3 permisos nuevos: un `git grep` puntual, `PowerShell(npx next build 2>&1)` y `PowerShell(npx tsc --noEmit -p tsconfig.json)`. Local de la máquina; replicar sólo si se quiere el mismo allowlist.
- **`.impeccable/surfaces/src-app-lang-team-page-tsx.md`** — una palabra ("six" → "Six") en la línea de Action. Sin efecto funcional.

---

## Checklist para la otra PC

1. Aplicar `team/data.ts` primero — es la fuente de la que dependen los demás.
2. Verificar que todo `department` en `_careers/data/positions.ts` use uno de los 6 IDs nuevos.
3. Confirmar que `ServiceIcon.tsx` resuelve `database` y `shield`.
4. Correr `npx tsc --noEmit -p tsconfig.json` y `npx next build`.
5. Revisar `/team` en móvil: la rejilla 3×2 cae a 2 columnas y el PhotoDeck se mide con `ResizeObserver`.
