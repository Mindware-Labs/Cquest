"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/components/services/motion";
import styles from "./PhotoDeck.module.css";

const PHOTOS = [
  "/Personal/FotoEmpleado1.png",
  "/Personal/FotoEmpleado2.png",
  "/Personal/FotoEmpleado3.png",
  "/Personal/FotoEmpleado4.png",
  "/Personal/FotoEmpleado5.png",
  "/Personal/FotoEmpleado6.png",
  "/Personal/FotoEmpleado7.png",
  "/Personal/FotoEmpleado8.png",
] as const;

const INTERVAL_MS = 4200;

/* Tres cuadros en escena: el grande de cara al centro y uno a cada lado, los
   dos RECTOS —sin giro ni escorzo— y metidos casi enteros detrás del central,
   de modo que solo asome una franja por el costado. El movimiento es en línea
   recta, no en arco: los cuadros se corren de lado, no doblan una curva. */
const VISIBLE = 3;

/* Cuánto se corre el cuadro lateral, en anchos del cuadro central. Lo que
   asoma es la diferencia entre su borde de afuera y el del central: a 0.36 son
   unos quince centésimos del cuadro grande, la franja del ejemplo. */
const SIDE_OFFSET = 0.36;

/* El lateral se encoge por número, no por perspectiva: sin giro no hay eje Z
   que lo haga por su cuenta. Ninguno pasa de 1, porque mostrar una foto por
   encima de su tamaño natural es lo que despinta las caras. */
const SIDE_SCALE = 0.58;

/* El puesto que no se ve: por ahí entra el cuadro nuevo y por ahí se va el que
   sale, corriéndose derecho hacia afuera. */
const OUTER_OFFSET = 0.72;
const OUTER_SCALE = 0.5;

/* Ancho del cuadro central como fracción de la columna, y su proporción: el 4/3
   apaisado del cuadro original. */
const CARD_RATIO = 0.78;
const CARD_ASPECT = 0.75;

/* El recorte de `object-fit: cover` casi no desborda (el 4/3 original ya
   encaja parecido al cuadro), así que la franja del lateral cae siempre pegada
   al borde real de la foto: ahí suele haber pared o piso vacío, no gente. Con
   este zoom extra el desborde crece y el borde visible se corre hacia el
   centro de la foto, donde sí hay algo que mirar — igual que en el cuadro
   central, solo que un poco más cerca. */
const SIDE_ZOOM = 1.4;

/* El avance no acompaña: engancha. Sale disparado, frena de golpe y remata con
   un rebote corto, como el trinquete de una rueda que cae en su muesca. Un
   ease-out suave leía como deslizamiento; esto lee como mecanismo.
   El sobrepaso vive en el tercer punto de control (>1). */
const ADVANCE_TRANSITION = {
  duration: 0.52,
  ease: [0.2, 1.32, 0.32, 1],
} as const;

/* La salida NO rebota: el cuadro se va y no vuelve. Un rebote en algo que
   abandona la escena delata el truco. */
const EXIT_TRANSITION = { duration: 0.42, ease: [0.4, 0, 0.9, 0.45] } as const;

/* La primera aparición no usa el trinquete: la escena se arma con la misma
   suavidad con la que entra el titular, y recién después empieza a girar duro.
   Un rebote mecánico en la carga chocaría con "Una operación coordinada". */
const ENTRANCE_TRANSITION = { duration: 0.95, ease: EASE_OUT } as const;

/* Los laterales entran después del central: la escena se construye del frente
   hacia los costados y se lee como profundidad, no como tres elementos
   apareciendo a la vez. */
const ENTRANCE_DELAY_S = 0.24;
const ENTRANCE_STAGGER_S = 0.11;

/* Cuánto hay que arrastrar, en anchos del cuadro central, para que la baraja
   pase de foto. Por debajo de esto la escena vuelve a su sitio: un roce al
   hacer scroll no tiene que cambiar nada. */
const DRAG_THRESHOLD = 0.18;

/* El escenario no sigue al dedo uno a uno: acompaña a media máquina y con tope.
   Un arrastre elástico deja claro que la escena se agarra sin dejar que se
   despegue del hero. */
const DRAG_FOLLOW = 0.45;
const DRAG_MAX = 0.22;

/* Postura de cada puesto. `slot` es la distancia al centro con signo: -1 el de
   la izquierda, 0 el de cara, +1 el de la derecha, ±2 el tramo que no se ve.
   Solo cambian el corrimiento lateral y el tamaño —nada de rotaciones—, así que
   los tres cuadros quedan siempre a escuadra. */
function slotPose(slot: number, cardWidth: number) {
  const side = Math.sign(slot);
  const distance = Math.abs(slot);

  if (distance === 0) {
    return {
      x: 0,
      scale: 1,
      opacity: 1,
      filter: "saturate(1)",
      zIndex: 3,
    };
  }

  if (distance === 1) {
    return {
      x: side * SIDE_OFFSET * cardWidth,
      scale: SIDE_SCALE,
      /* Algo apagado y desaturado: es lo único que separa al lateral del
         central ahora que no hay perspectiva que lo haga. */
      opacity: 0.72,
      filter: "saturate(0.82)",
      zIndex: 2,
    };
  }

  return {
    x: side * OUTER_OFFSET * cardWidth,
    scale: OUTER_SCALE,
    opacity: 0,
    filter: "saturate(0.75)",
    zIndex: 1,
  };
}

export default function PhotoDeck({
  reduced,
  label,
}: {
  reduced: boolean;
  label: string;
}) {
  /* El orden de la baraja: la posición 0 es el cuadro más viejo del ciclo, el
     que ocupa el puesto de la derecha y está por salir. Avanzar es mandarlo al
     final, así que el ciclo nunca se queda sin fotos. */
  const [order, setOrder] = useState<readonly number[]>(() =>
    PHOTOS.map((_, i) => i),
  );
  /* Solo cambia el aspecto (velo y filo), no el reloj: el aro sigue girando con
     el puntero encima. */
  const [hovered, setHovered] = useState(false);
  /* False durante el primer render y true en cuanto el efecto corre: separa la
     puesta en escena del giro normal, que usan curvas distintas. */
  const [entered, setEntered] = useState(false);
  /* Hacia dónde va el ciclo: +1 el avance de siempre (entra por la izquierda,
     sale por la derecha) y -1 el que se pide arrastrando al revés. De acá salen
     los puestos de entrada y salida, porque un cuadro que retrocede tiene que
     irse por donde vino. */
  const [direction, setDirection] = useState(1);
  /* Cuánto se corrió el escenario con el dedo encima, en píxeles ya amortiguados. */
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  /* Dónde empezó el gesto y si ya se decidió que es horizontal. En ref y no en
     estado: cambia en cada `pointermove` y no pinta nada por sí mismo. */
  const gesture = useRef<{ id: number; x: number; y: number; axis: "" | "x" | "y" } | null>(null);

  const stage = useRef<HTMLDivElement>(null);
  /* Ancho de partida razonable para el render del servidor; el observador lo
     corrige en el primer pintado del cliente. */
  const [stageWidth, setStageWidth] = useState(620);

  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry.contentRect.width));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const cardWidth = stageWidth * CARD_RATIO;
  const cardHeight = cardWidth * CARD_ASPECT;

  const advance = useCallback(() => {
    setDirection(1);
    setOrder((current) => [...current.slice(1), current[0]]);
  }, []);

  /* El paso al revés: el último de la baraja vuelve al frente de la cola, así
     que la foto que acababa de salir es la que reaparece. */
  const retreat = useCallback(() => {
    setDirection(-1);
    setOrder((current) => [
      current[current.length - 1],
      ...current.slice(0, -1),
    ]);
  }, []);

  /* El cambio de régimen espera a que termine el último cuadro en entrar. Si se
     marcara al montar, la curva del avance pisaría la animación de entrada. */
  useEffect(() => {
    const settle =
      (ENTRANCE_DELAY_S +
        (VISIBLE - 1) * ENTRANCE_STAGGER_S +
        ENTRANCE_TRANSITION.duration) *
      1000;
    const timer = setTimeout(() => setEntered(true), settle);
    return () => clearTimeout(timer);
  }, []);

  /* `dragging` en las dependencias hace dos cosas de una: para el reloj
     mientras la mano manda y, al soltar, lo vuelve a arrancar desde cero — si
     no, el avance automático podía caer justo encima del paso manual. */
  useEffect(() => {
    if (reduced || dragging) return;
    let timer: ReturnType<typeof setInterval> | undefined;

    const start = () => {
      if (timer === undefined) timer = setInterval(advance, INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    };
    /* Los timers de una pestaña de fondo se estrangulan y vuelven en ráfaga:
       sin esto, al volver la baraja dispara varios avances de golpe. */
    const onVisibility = () => (document.hidden ? stop() : start());

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [advance, reduced, dragging]);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    /* Solo el botón principal: con el secundario se abre el menú del navegador
       y el gesto quedaría colgado sin su `pointerup`. */
    if (event.button !== 0) return;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, axis: "" };
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = gesture.current;
      if (!start || start.id !== event.pointerId) return;

      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;

      /* Hasta que el gesto no se define no se roba nada: si el dedo va más
         hacia abajo que hacia el costado, es scroll y la baraja se aparta. */
      if (start.axis === "") {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        start.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (start.axis === "x") {
          /* Capturar el puntero es lo que hace que el gesto siga vivo cuando la
             mano se sale del escenario a mitad de arrastre. */
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }
      }
      if (start.axis !== "x") return;

      const limit = cardWidth * DRAG_MAX;
      setDragOffset(Math.max(-limit, Math.min(limit, dx * DRAG_FOLLOW)));
    },
    [cardWidth],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const start = gesture.current;
      gesture.current = null;
      if (!start || start.id !== event.pointerId) return;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setDragOffset(0);
      setDragging(false);
      if (start.axis !== "x") return;

      const dx = event.clientX - start.x;
      if (Math.abs(dx) < cardWidth * DRAG_THRESHOLD) return;
      /* Los cuadros se corren hacia la derecha cuando el ciclo avanza, así que
         arrastrar en ese sentido es pedir la foto siguiente. */
      if (dx > 0) advance();
      else retreat();
    },
    [advance, cardWidth, retreat],
  );

  const visible = order.slice(0, VISIBLE);
  /* Entra por el lado opuesto al que sale, y ambos se dan vuelta cuando el
     ciclo va marcha atrás. */
  const enterPose = slotPose(-2 * direction, cardWidth);
  const exitPose = slotPose(2 * direction, cardWidth);

  return (
    <div
      className={styles.deck}
      role="img"
      aria-label={label}
      data-hovered={hovered ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <span aria-hidden className={styles.glow} />

      <div
        ref={stage}
        className={styles.stage}
        data-dragging={dragging ? "true" : "false"}
        style={{
          height: Math.round(cardHeight),
          transform: dragOffset === 0 ? undefined : `translate3d(${dragOffset}px, 0, 0)`,
        }}
      >
        {/* `initial` habilitado: es lo que hace que la escena se anime también
            en la carga y no aparezca de golpe bajo un titular que sí entra. */}
        <AnimatePresence>
          {visible.map((photo, position) => {
            /* La posición 0 sale por la derecha, así que su puesto es +1 y el
               del recién llegado, -1. */
            const slot = 1 - position;
            const pose = slotPose(slot, cardWidth);

            return (
              <motion.div
                key={photo}
                className={styles.card}
                style={{
                  zIndex: pose.zIndex,
                  width: cardWidth,
                  height: cardHeight,
                  marginLeft: -cardWidth / 2,
                  marginTop: -cardHeight / 2,
                }}
                /* Entra corriéndose desde el tramo que no se ve, no surgiendo
                   de la nada en su sitio. Solo x/scale/opacity/filter: si
                   `zIndex` viaja en `initial` sin estar también en `animate`,
                   motion lo adopta como valor propio y lo congela en el de
                   entrada para siempre, pisando el de `style` en cada
                   render — el lateral quedaba siempre encima del central. */
                initial={
                  reduced
                    ? false
                    : {
                        x: enterPose.x,
                        scale: enterPose.scale,
                        opacity: enterPose.opacity,
                        filter: enterPose.filter,
                      }
                }
                animate={{
                  x: pose.x,
                  scale: pose.scale,
                  opacity: pose.opacity,
                  filter: pose.filter,
                }}
                /* Y sale por el otro extremo, derecho hacia afuera: el ciclo se
                   cierra corriendo la fila, no doblando una curva. */
                exit={
                  reduced
                    ? { opacity: 0 }
                    : {
                        x: exitPose.x,
                        scale: exitPose.scale,
                        opacity: exitPose.opacity,
                        filter: exitPose.filter,
                        transition: EXIT_TRANSITION,
                      }
                }
                /* Dos regímenes: la puesta en escena entra suave y escalonada
                   desde el centro; de ahí en adelante, cada avance engancha. */
                transition={
                  entered
                    ? ADVANCE_TRANSITION
                    : {
                        ...ENTRANCE_TRANSITION,
                        delay: ENTRANCE_DELAY_S + Math.abs(slot) * ENTRANCE_STAGGER_S,
                      }
                }
              >
                <Image
                  src={PHOTOS[photo]}
                  alt=""
                  fill
                  quality={82}
                  className={styles.photo}
                  /* Del lateral solo asoma la franja de afuera, y con el
                     encuadre del central ahí suele haber pared. Corriendo la
                     ventana del recorte hacia ese lado, la franja cae sobre las
                     caras; al llegar al centro vuelve al encuadre normal, y la
                     transición de object-position hace el viaje a la vista. */
                  style={{
                    objectPosition:
                      slot === 0 ? "center 40%" : slot < 0 ? "72% 40%" : "28% 40%",
                    /* El zoom tiene que crecer desde el mismo punto que marca
                       object-position, si no el centro del cuadro (50%) tira
                       el encuadre lejos de ese punto y el lateral izquierdo
                       termina mostrando pared en vez de cara. */
                    transformOrigin:
                      slot === 0 ? "50% 40%" : slot < 0 ? "72% 40%" : "28% 40%",
                    transform: slot === 0 ? "scale(1)" : `scale(${SIDE_ZOOM})`,
                  }}
                  sizes="(max-width: 70rem) 62vw, 25rem"
                  priority={slot === 0}
                />
                <span aria-hidden className={styles.sheen} />
                <span aria-hidden className={styles.edge} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
