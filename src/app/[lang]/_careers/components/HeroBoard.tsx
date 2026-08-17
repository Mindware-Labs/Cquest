"use client";

import { useRef } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { animate, createTimeline, stagger } from "animejs";
import { useI18n } from "@/i18n/I18nProvider";
import { EASE, useAnimeScope } from "./anime";
import { DEPARTMENTS } from "../../team/data";
import styles from "./Hero.module.css";

const COPY = {
  en: { title: "Where we hire", note: "Six departments, one operation" },
  es: { title: "Dónde contratamos", note: "Seis departamentos, una operación" },
};

/* Las SEIS áreas reales, sin conteos: el panel dice dónde hay trabajo, no
   cuánto — el número de vacantes vive en el listado, que es donde se puede
   verificar. El contenido sale de team/data.ts, la misma fuente del
   organigrama, así que un departamento nuevo aparece aquí solo. */
export default function HeroBoard({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const root = useRef<HTMLDivElement>(null);

  useAnimeScope(
    root,
    () => {
      if (reduced) return;

      createTimeline({ defaults: { ease: EASE } })
        /* El panel ES la raíz del scope, así que se anima por referencia: un
           selector solo alcanza a sus descendientes. */
        .add(root.current!, { opacity: [0, 1], y: [26, 0], duration: 850 })
        .add(
          `.${styles.boardRow}`,
          { opacity: [0, 1], x: [18, 0], duration: 600, delay: stagger(90) },
          "-=400",
        );

      /* Barrido continuo, lento y de baja opacidad: la única pieza viva del
         hero. Es la lectura de "sala de control", no un adorno parpadeante. */
      /* 406% de su propia altura ≈ recorrer el panel entero: la banda mide 32%
         del alto y arranca 30% por encima del borde. */
      animate(`.${styles.boardScan}`, {
        y: ["0%", "406%"],
        duration: 5200,
        delay: 1400,
        loop: true,
        loopDelay: 1400,
        ease: "linear",
      });
    },
    [reduced],
  );

  return (
    <div ref={root} className={styles.board} aria-label={t.title}>
      <span aria-hidden className={styles.boardScan} />

      <div className={styles.boardHead}>
        <span className={styles.boardTitle}>{t.title}</span>
        <span className={styles.boardNote}>{t.note}</span>
      </div>

      <ul className={styles.boardList}>
        {DEPARTMENTS.map((department) => (
          <li key={department.id} className={styles.boardRow}>
            <span className={styles.boardIcon}>
              <ServiceIcon name={department.icon} />
            </span>
            <span className={styles.boardArea}>{department.shortLabel[lang]}</span>
            <span aria-hidden className={styles.boardRule} />
          </li>
        ))}
      </ul>
    </div>
  );
}
