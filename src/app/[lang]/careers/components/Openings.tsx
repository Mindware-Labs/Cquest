"use client";

import { useRef, useState } from "react";
import { animate, createTimeline, onScroll, stagger } from "animejs";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import ServiceIcon from "@/components/services/ServiceIcon";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import {
  ACTIVE_POSITIONS,
  EMPLOYMENT_LABEL,
  MODE_LABEL,
  TRACK_LABEL,
  departmentLabel,
} from "../data";
import { EASE, EASE_SNAP, useAnimeScope } from "./anime";
import styles from "./Openings.module.css";

const COPY = {
  en: {
    title: ["Every way in.", "Start where you are."],
    lead: "Entry-level roles need no prior call center experience — we train you. Pick a role to see what it involves.",
    listLabel: "Open positions",
    view: "View position and apply",
    talent: "None of these? Send your CV",
    responsibilities: "What you would do",
    emptyTitle: "No openings right now",
    emptyBody: "We open positions across the operation all year. Leave us your CV and we contact you when a role that fits you opens.",
    sendCv: "Send your CV",
  },
  es: {
    title: ["Todas las puertas.", "Entra por la tuya."],
    lead: "Las vacantes de primer empleo no piden experiencia previa en call center — nosotros te formamos. Elige un rol para ver de qué se trata.",
    listLabel: "Vacantes abiertas",
    view: "Ver vacante y postularme",
    talent: "¿Ninguna te calza? Envía tu CV",
    responsibilities: "Lo que harías",
    emptyTitle: "No hay vacantes abiertas ahora mismo",
    emptyBody: "Abrimos posiciones en toda la operación durante el año. Déjanos tu CV y te contactamos cuando salga un rol que te calce.",
    sendCv: "Enviar tu CV",
  },
};

/* Tercera forma de esta sección, y la que se sostiene. Una rejilla de tarjetas
   saturaba; una lista de diez filas seguía siendo un muro. Con seis vacantes y
   cuatro departamentos, lo que el candidato hace de verdad es COMPARAR: mira
   los títulos, entra en uno, vuelve. Así que la sección es un explorador —
   índice a la izquierda, detalle a la derecha — y ocupa una pantalla, no tres. */
export default function Openings({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];
  const root = useRef<HTMLElement>(null);
  const detail = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const items = useRef<Array<HTMLButtonElement | null>>([]);
  const [active, setActive] = useState(0);

  const position = ACTIVE_POSITIONS[active];

  /* El indicador es UN solo elemento que viaja hasta la fila activa, no un
     borde que se enciende en cada fila. Esa continuidad es la que hace que el
     índice se lea como un control y no como seis estados sueltos. */
  const moveMarker = (index: number, animated: boolean) => {
    const node = items.current[index];
    const bar = marker.current;
    if (!node || !bar) return;
    const top = node.offsetTop;
    const height = node.offsetHeight;
    if (!animated || reduced) {
      bar.style.transform = `translateY(${top}px)`;
      bar.style.height = `${height}px`;
      return;
    }
    animate(bar, { y: top, height, duration: 520, ease: EASE_SNAP });
  };

  const select = (index: number) => {
    setActive(index);
    moveMarker(index, true);
    if (reduced || !detail.current) return;
    /* El detalle no hace un fade completo: sus piezas entran escalonadas desde
       abajo. Cambiar de rol tiene que sentirse como pasar una ficha, no como
       recargar un bloque. */
    animate(detail.current.children, {
      opacity: [0, 1],
      y: [14, 0],
      duration: 460,
      delay: stagger(45),
      ease: EASE,
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const total = ACTIVE_POSITIONS.length;
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + total) % total;
    select(next);
    items.current[next]?.focus();
  };

  useAnimeScope(
    root,
    () => {
      moveMarker(active, false);
      if (reduced) return;

      createTimeline({
        defaults: { ease: EASE },
        autoplay: onScroll({ enter: "bottom-=80 top", sync: "play", repeat: false }),
      })
        .add(`.${styles.head} > *`, { opacity: [0, 1], y: [20, 0], duration: 700, delay: stagger(80) })
        .add(
          `.${styles.item}`,
          { opacity: [0, 1], x: [-18, 0], duration: 520, delay: stagger(60) },
          "-=420",
        )
        .add(
          `.${styles.detail} > *`,
          { opacity: [0, 1], y: [18, 0], duration: 560, delay: stagger(60) },
          "-=520",
        );
    },
    [reduced],
  );

  if (ACTIVE_POSITIONS.length === 0) {
    return (
      <section id="openings" ref={root} className={styles.section}>
        <div className={container.container}>
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>{t.emptyTitle}</h2>
            <p className={styles.emptyBody}>{t.emptyBody}</p>
            <LocalizedLink href="/careers/apply" className={styles.emptyCta}>
              {t.sendCv} <Arrow />
            </LocalizedLink>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="openings" ref={root} className={styles.section}>
      <div className={container.container}>
        <div className={styles.head}>
          <h2 className={styles.title}>
            {t.title[0]} <strong>{t.title[1]}</strong>
          </h2>
          <p className={styles.lead}>{t.lead}</p>
        </div>

        <div className={styles.explorer}>
          {/* Patrón de pestañas: el índice manda sobre un único panel, así que
              es lo que un lector de pantalla debe anunciar. */}
          <div
            className={styles.list}
            role="tablist"
            aria-label={t.listLabel}
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
          >
            <span aria-hidden className={styles.markerBar} ref={marker} />

            {ACTIVE_POSITIONS.map((item, index) => (
              <button
                key={item.slug}
                type="button"
                role="tab"
                id={`opening-tab-${item.slug}`}
                aria-selected={index === active}
                aria-controls="opening-panel"
                tabIndex={index === active ? 0 : -1}
                ref={(node) => {
                  items.current[index] = node;
                }}
                className={styles.item}
                onClick={() => select(index)}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") select(index);
                }}
              >
                <span className={styles.itemIcon}>
                  <ServiceIcon name={item.icon} />
                </span>
                <span className={styles.itemText}>
                  <span className={styles.itemTitle}>{item.title[lang]}</span>
                  <span className={styles.itemArea}>{departmentLabel(item.department, lang)}</span>
                </span>
                <span className={styles.itemTrack}>{TRACK_LABEL[item.track][lang]}</span>
              </button>
            ))}
          </div>

          <div
            className={styles.detail}
            ref={detail}
            role="tabpanel"
            id="opening-panel"
            aria-labelledby={`opening-tab-${position.slug}`}
            tabIndex={0}
          >
            <p className={styles.detailArea}>{departmentLabel(position.department, lang)}</p>
            <h3 className={styles.detailTitle}>{position.title[lang]}</h3>
            <p className={styles.detailSummary}>{position.summary[lang]}</p>

            <ul className={styles.detailFacts}>
              <li className={styles.tagTrack}>{TRACK_LABEL[position.track][lang]}</li>
              <li className={styles.tag}>{MODE_LABEL[position.mode][lang]}</li>
              <li className={styles.tag}>{EMPLOYMENT_LABEL[position.employmentType][lang]}</li>
              <li className={styles.tag}>{position.location[lang]}</li>
            </ul>

            <div className={styles.detailBlock}>
              <p className={styles.detailBlockTitle}>{t.responsibilities}</p>
              <ul className={styles.detailList}>
                {position.responsibilities.slice(0, 3).map((line) => (
                  <li key={line.en}>{line[lang]}</li>
                ))}
              </ul>
            </div>

            <div className={styles.detailActions}>
              <LocalizedLink href={`/careers/${position.slug}`} className={styles.detailCta}>
                {t.view} <Arrow />
              </LocalizedLink>
              <LocalizedLink href="/careers/apply" className={styles.detailGhost}>
                {t.talent}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
