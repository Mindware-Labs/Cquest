"use client";

import { motion, useReducedMotion } from "motion/react";

/* El fondo del login. La profundidad es TONAL, no decorativa: dos campos de luz
   muy suaves —celeste y petróleo— que derivan lento sobre tinta, más un juego de
   reglas finas que marca el margen como un plano técnico. Es el mismo lenguaje
   que el sitio público (linework preciso, luz contenida), no un degradado
   puesto para tapar un fondo vacío.

   Nada de esto es información, así que todo el bloque es aria-hidden y se
   detiene por completo con prefers-reduced-motion: quien pidió menos movimiento
   recibe la misma composición, quieta. */
export default function LoginBackdrop() {
  const reduced = useReducedMotion();

  const drift = (duration: number, path: { x: number[]; y: number[] }) =>
    reduced
      ? undefined
      : {
          x: path.x,
          y: path.y,
          transition: {
            duration,
            repeat: Infinity,
            repeatType: "mirror" as const,
            ease: "easeInOut" as const,
          },
        };

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Campo celeste: el foco de luz principal, arriba a la izquierda. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -top-[22vh] -left-[12vw] h-[62vh] w-[62vh] rounded-full opacity-[0.22] blur-[90px]"
        style={{ background: "radial-gradient(circle, var(--brand-celeste) 0%, transparent 68%)" }}
      >
        <motion.div className="h-full w-full" animate={drift(26, { x: [0, 40, 0], y: [0, 26, 0] })} />
      </motion.div>

      {/* Campo petróleo: el contrapeso, abajo a la derecha y más grande, para que
          la diagonal de la composición no quede simétrica. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="absolute -right-[16vw] -bottom-[26vh] h-[74vh] w-[74vh] rounded-full opacity-[0.3] blur-[110px]"
        style={{ background: "radial-gradient(circle, var(--brand-petroleo) 0%, transparent 70%)" }}
      >
        <motion.div className="h-full w-full" animate={drift(32, { x: [0, -36, 0], y: [0, -22, 0] })} />
      </motion.div>

      {/* Reglas verticales: el margen de un plano. Fijas, finísimas, y solo
          visibles donde la luz las alcanza. */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 calc(12.5% - 1px), rgb(255 255 255 / 0.045) calc(12.5% - 1px) 12.5%)",
          maskImage: "radial-gradient(120% 80% at 50% 30%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 50% 30%, #000 20%, transparent 75%)",
        }}
      />

      {/* El único movimiento con sentido: una línea que recorre la pantalla de
          arriba abajo, muy lenta. La operación está corriendo aunque nadie mire.
          Una sola, no un enjambre de partículas. */}
      {!reduced && (
        <motion.div
          initial={{ y: "-10%" }}
          animate={{ y: "110%" }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--brand-celeste) 55%, transparent) 35%, color-mix(in srgb, var(--brand-celeste) 55%, transparent) 65%, transparent 100%)",
          }}
        />
      )}
    </div>
  );
}
