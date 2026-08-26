"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion } from "motion/react";
import styles from "./ShiftClock.module.css";

const TICKS = Array.from({ length: 25 }, (_, i) => i);

const formatter = new Intl.DateTimeFormat("es-DO", {
  timeZone: "America/Santo_Domingo",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
};

const readClock = () => formatter.format(new Date());

// null en servidor: el reloj del visitante y el del build nunca coinciden.
const readServerClock = () => null;

function elapsedHours(label: string): number {
  const [hours, minutes] = label.split(":").map(Number);
  return hours + minutes / 60;
}

export default function ShiftClock() {
  const reduced = useReducedMotion() ?? false;
  const time = useSyncExternalStore(subscribe, readClock, readServerClock);

  const hours = time ? elapsedHours(time) : 0;
  const fraction = hours / 24;

  return (
    <div className={styles.clock}>
      <div className={styles.head}>
        <span className={styles.zone}>Operación 24/7</span>
        <span className={time ? styles.time : `${styles.time} ${styles.pending}`}>
          {time ?? "--:--"}
        </span>
      </div>

      <div className={styles.scale} aria-hidden="true">
        <div className={styles.ticks}>
          {TICKS.map((hour) => (
            <span
              key={hour}
              className={styles.tick}
              data-major={hour % 6 === 0}
              data-past={Boolean(time) && hour <= hours}
            />
          ))}
        </div>
        <div className={styles.rule} />
        {time && (
          <motion.div
            className={styles.marker}
            initial={reduced ? false : { left: "0%", opacity: 0 }}
            animate={{ left: `${fraction * 100}%`, opacity: 1 }}
            transition={{ duration: reduced ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={styles.markerCap} />
          </motion.div>
        )}
        <div className={styles.legend}>
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>
    </div>
  );
}
