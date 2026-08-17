"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
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

/* Cinco cartas montadas: la del frente y cuatro de fondo escalonadas hacia
   arriba. Es la profundidad de pila que se pidió — ver la segunda, la tercera y
   la cuarta asomando por detrás. */
const VISIBLE = 5;

/* Separación en Z entre niveles. El encogimiento NO se declara: lo calcula la
   perspectiva a partir de esta distancia, que es lo que hace que las cartas se
   lean viniendo hacia la pantalla en vez de simplemente ser más chicas. */
const Z_STEP = 150;

/* Cuánto sube cada carta respecto de la de adelante. Tiene que superar lo que
   la perspectiva ya encoge la tarjeta, o el borde superior de la de atrás cae
   dentro de la frontal y la pila no asoma. */
const Y_STEP = 58;

/* Inclinación de cada peldaño. Es lo que convierte la pila en rueda: las cartas
   de arriba se ven en escorzo, girando hacia el espectador, y solo la del
   frente llega aplomada de cara. */
const TILT_STEP = 9;

/* El avance no acompaña: engancha. Sale disparado, frena de golpe y remata con
   un rebote corto, como el trinquete de una rueda que cae en su muesca. Un
   ease-out suave leía como deslizamiento; esto leía como mecanismo.
   El sobrepaso vive en el tercer punto de control (>1). */
const ADVANCE_TRANSITION = {
  duration: 0.52,
  ease: [0.2, 1.32, 0.32, 1],
} as const;

/* La caída de la carta saliente NO rebota: se va y no vuelve. Un rebote en algo
   que abandona la escena delata el truco. */
const EXIT_TRANSITION = { duration: 0.42, ease: [0.4, 0, 0.9, 0.45] } as const;

/* La primera aparición no usa el trinquete: la rueda se arma con la misma
   suavidad con la que entra el titular, y recién después empieza a girar duro.
   Un rebote mecánico en la carga chocaría con "Una operación coordinada". */
const ENTRANCE_TRANSITION = { duration: 0.95, ease: EASE_OUT } as const;

/* Las cartas del fondo entran después de la frontal: la pila se construye de
   adelante hacia atrás y el escalonado se lee como profundidad, no como cinco
   elementos apareciendo a la vez. */
const ENTRANCE_DELAY_S = 0.24;
const ENTRANCE_STAGGER_S = 0.11;

/* Cada nivel está más arriba y más al fondo del aro, inclinado hacia adelante y
   con algo menos de nitidez. La caída de opacidad es suave a propósito:
   apagarlas rápido esconde justo la pila que se quiere ver asomar. */
function depthStyle(depth: number) {
  return {
    y: depth * -Y_STEP,
    z: depth * -Z_STEP,
    opacity: 1 - depth * 0.08,
    filter: `blur(${depth * 0.9}px) saturate(${1 - depth * 0.12})`,
    rotateX: depth * TILT_STEP,
    zIndex: VISIBLE - depth,
  };
}

export default function PhotoDeck({
  reduced,
  label,
}: {
  reduced: boolean;
  label: string;
}) {
  /* El orden de la baraja: la posición 0 es la carta del frente. Avanzar es
     mandar la primera al fondo, así que el ciclo nunca se queda sin cartas. */
  const [order, setOrder] = useState<readonly number[]>(() =>
    PHOTOS.map((_, i) => i),
  );
  /* Solo cambia el aspecto (velo y filo), no el reloj: la rueda sigue girando
     con el puntero encima. */
  const [hovered, setHovered] = useState(false);
  /* Cambia en cada avance para reiniciar la animación de la barra de progreso,
     que es CSS y necesita un remonte para volver a empezar. */
  const [cycle, setCycle] = useState(0);
  /* False durante el primer render y true en cuanto el efecto corre: separa la
     entrada en escena del giro normal, que usan curvas distintas. */
  const [entered, setEntered] = useState(false);

  const advance = useCallback(() => {
    setOrder((current) => [...current.slice(1), current[0]]);
    setCycle((c) => c + 1);
  }, []);

  /* El cambio de régimen espera a que termine la última carta en entrar. Si se
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

  useEffect(() => {
    if (reduced) return;
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
  }, [advance, reduced]);

  const visible = order.slice(0, VISIBLE);

  return (
    <div
      className={styles.deck}
      role="img"
      aria-label={label}
      data-hovered={hovered ? "true" : "false"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span aria-hidden className={styles.glow} />

      <div className={styles.stage}>
        {/* `initial` habilitado: es lo que hace que la pila se anime también en
            la carga y no aparezca de golpe bajo un titular que sí entra. */}
        <AnimatePresence>
          {visible.map((photo, depth) => {
            const style = depthStyle(depth);
            return (
              <motion.div
                key={photo}
                className={styles.card}
                style={{ zIndex: style.zIndex }}
                /* Entra por arriba, un peldaño más atrás del que le toca: la
                   carta nueva aparece bajando por el aro, no surgiendo de la
                   nada en su sitio. */
                initial={
                  reduced
                    ? false
                    : {
                        y: VISIBLE * -Y_STEP,
                        z: VISIBLE * -Z_STEP,
                        opacity: 0,
                        rotateX: VISIBLE * TILT_STEP,
                      }
                }
                animate={{
                  y: style.y,
                  z: style.z,
                  opacity: style.opacity,
                  filter: style.filter,
                  rotateX: style.rotateX,
                }}
                /* Y sale por abajo, pasando por delante de la cámara y girando
                   en el mismo sentido: la cara se aleja del espectador mientras
                   cae. Ese es el medio giro que cierra la rueda. */
                exit={
                  reduced
                    ? { opacity: 0 }
                    : {
                        y: 300,
                        z: 240,
                        rotateX: -26,
                        opacity: 0,
                        /* Más corta que el avance a propósito: mientras cae, la
                           carta saliente tapa a la que acaba de llegar al
                           frente, y esa oclusión no debe durar. */
                        transition: EXIT_TRANSITION,
                      }
                }
                /* Dos regímenes: la puesta en escena entra suave y escalonada
                   por profundidad; de ahí en adelante, cada avance engancha. */
                transition={
                  entered
                    ? ADVANCE_TRANSITION
                    : {
                        ...ENTRANCE_TRANSITION,
                        delay: ENTRANCE_DELAY_S + depth * ENTRANCE_STAGGER_S,
                      }
                }
              >
                <Image
                  src={PHOTOS[photo]}
                  alt=""
                  fill
                  quality={82}
                  className={styles.photo}
                  /* De las cartas de atrás solo asoma la franja de arriba, y
                     con el encuadre de la frontal ahí solo hay techo y paredes.
                     Bajando la ventana del recorte, esa franja cae sobre las
                     caras; al llegar al frente vuelve al encuadre normal, y la
                     transición de object-position hace el viaje a la vista. */
                  style={{
                    objectPosition: depth === 0 ? "center 40%" : "center 66%",
                  }}
                  sizes="(max-width: 70rem) 70vw, 26rem"
                  priority={depth === 0}
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
