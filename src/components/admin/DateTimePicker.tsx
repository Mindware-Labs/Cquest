"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import Select from "./Select";
import styles from "./DateTimePicker.module.css";

type Props = {
  // Mismo contrato que <input type="datetime-local">: "" o "yyyy-MM-ddTHH:mm"
  // en hora local, sin zona horaria. Reemplazo directo, sin tocar los
  // conversores a ISO que ya tiene cada pantalla (fromLocalInputValue).
  value: string;
  onChange: (value: string) => void;
  label: string;
  width?: string;
  autoFocus?: boolean;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({ value: pad(h), label: pad(h) }));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, m) => ({ value: pad(m), label: pad(m) }));

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function parseValue(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function formatTrigger(date: Date | null): string {
  if (!date) return "Not scheduled";
  const datePart = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
  const timePart = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
  return `${datePart} · ${timePart}`;
}

function Icon({ name }: { name: "calendar" | "chevronLeft" | "chevronRight" }) {
  const c = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  if (name === "chevronLeft")
    return (
      <svg {...c} width="14" height="14" aria-hidden="true">
        <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (name === "chevronRight")
    return (
      <svg {...c} width="14" height="14" aria-hidden="true">
        <path d="M6.2 3.6 10.6 8l-4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg {...c} width="15" height="15" aria-hidden="true">
      <path d="M3.2 3.2h9.6v9.6H3.2z" strokeLinejoin="round" />
      <path d="M3.2 6.2h9.6M5.6 2v2.4M10.4 2v2.4" strokeLinecap="round" />
    </svg>
  );
}

/* Calendario + hora propios: el <input type="datetime-local"> nativo abre un
   selector que pinta el sistema operativo, imposible de estilar (mismo
   problema que resolvió Select.tsx para el <select>). Reutiliza ese mismo
   componente para hora y minuto, en vez de reinventar otro listbox. */
export default function DateTimePicker({ value, onChange, label, width, autoFocus }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dayRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelId = useId();

  const selected = parseValue(value);
  // Fijado una vez al montar: leer el reloj en cada render es una llamada
  // impura durante el render (mismo criterio que en NewVacancyModal/VacancyEditor).
  const [today] = useState(() => new Date());

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const wasOpenRef = useRef(false);
  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return { year: base.getFullYear(), month: base.getMonth() };
  });
  const [drop, setDrop] = useState<"down" | "up">("down");
  const [coords, setCoords] = useState<{ top: number; bottom: number; left: number } | null>(null);

  // Mismo truco que Select.tsx: useLayoutEffect (no useEffect) decide si el
  // panel sigue montado ANTES de que el navegador pinte, para que el cierre
  // anime en vez de desmontarse de golpe por un frame.
  useLayoutEffect(() => {
    if (open) {
      wasOpenRef.current = true;
      setClosing(false);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      setClosing(true);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    function reposition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setCoords({ top: rect.top, bottom: rect.bottom, left: rect.left });
      const needed = 24 * 16; // alto aproximado del panel completo
      setDrop(window.innerHeight - rect.bottom < needed ? "up" : "down");
    }
    reposition();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const showPanel = open || closing;

  function openPanel() {
    const base = selected ?? today;
    setView({ year: base.getFullYear(), month: base.getMonth() });
    setOpen((v) => !v);
  }

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function selectDay(date: Date) {
    const h = selected ? selected.getHours() : 9;
    const m = selected ? selected.getMinutes() : 0;
    onChange(toValue(new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)));
  }

  function setHour(h: string) {
    const base = selected ?? today;
    onChange(toValue(new Date(base.getFullYear(), base.getMonth(), base.getDate(), Number(h), base.getMinutes())));
  }

  function setMinute(m: string) {
    const base = selected ?? today;
    onChange(toValue(new Date(base.getFullYear(), base.getMonth(), base.getDate(), base.getHours(), Number(m))));
  }

  function goToday() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), selected?.getHours() ?? 9, selected?.getMinutes() ?? 0);
    onChange(toValue(next));
    setView({ year: next.getFullYear(), month: next.getMonth() });
  }

  function clear() {
    onChange("");
  }

  function handleGridKeyDown(event: React.KeyboardEvent, index: number, cells: Date[]) {
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const delta = deltas[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= cells.length) return;
    dayRefs.current[nextIndex]?.focus();
  }

  const cells = monthGrid(view.year, view.month);

  // Roving tabindex: una sola celda entra en el recorrido normal de Tab (el
  // día elegido, o si no hay, hoy, o si no, el primero del mes), y ahí
  // aterriza el foco al entrar a la grilla. Las flechas siguen moviendo el
  // foco libremente entre celdas — .focus() no depende de tabIndex.
  const activeIndex = (() => {
    if (selected) {
      const i = cells.findIndex((d) => sameDay(d, selected));
      if (i !== -1) return i;
    }
    const ti = cells.findIndex((d) => sameDay(d, today));
    if (ti !== -1) return ti;
    const fi = cells.findIndex((d) => d.getMonth() === view.month && d.getDate() === 1);
    return fi === -1 ? 0 : fi;
  })();

  return (
    <div className={styles.root} ref={rootRef} style={width ? { width } : undefined}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        type="button"
        autoFocus={autoFocus}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={label}
        onClick={openPanel}
      >
        <span className={styles.triggerText} data-empty={selected ? undefined : ""}>
          {formatTrigger(selected)}
        </span>
        <Icon name="calendar" />
      </button>

      {showPanel && coords && (
        <div
          className={styles.panel}
          id={panelId}
          role="dialog"
          aria-label={label}
          data-drop={drop}
          data-state={closing ? "closing" : "open"}
          style={{
            left: coords.left,
            ...(drop === "down" ? { top: coords.bottom + 6 } : { bottom: window.innerHeight - coords.top + 6 }),
          }}
          onAnimationEnd={() => {
            if (closing) setClosing(false);
          }}
        >
          <div className={styles.calHead}>
            <button type="button" className={styles.navBtn} onClick={() => shiftMonth(-1)} aria-label="Previous month">
              <Icon name="chevronLeft" />
            </button>
            <span className={styles.calTitle}>
              {MONTHS[view.month]} {view.year}
            </span>
            <button type="button" className={styles.navBtn} onClick={() => shiftMonth(1)} aria-label="Next month">
              <Icon name="chevronRight" />
            </button>
          </div>

          <div className={styles.weekdays} aria-hidden="true">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className={styles.dayGrid} role="grid" aria-label="Day">
            {cells.map((date, index) => {
              const inMonth = date.getMonth() === view.month;
              const isSelected = selected ? sameDay(date, selected) : false;
              const isToday = sameDay(date, today);
              return (
                <button
                  key={date.toISOString()}
                  ref={(el) => {
                    dayRefs.current[index] = el;
                  }}
                  type="button"
                  role="gridcell"
                  className={styles.day}
                  tabIndex={index === activeIndex ? 0 : -1}
                  data-in-month={inMonth ? "" : undefined}
                  data-selected={isSelected ? "" : undefined}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(date)}
                  onClick={() => selectDay(date)}
                  onKeyDown={(event) => handleGridKeyDown(event, index, cells)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className={styles.timeRow}>
            <span className={styles.timeLabel}>Time</span>
            <Select value={selected ? pad(selected.getHours()) : "09"} options={HOUR_OPTIONS} onChange={setHour} label="Hour" width="4.5rem" />
            <span className={styles.timeSep}>:</span>
            <Select value={selected ? pad(selected.getMinutes()) : "00"} options={MINUTE_OPTIONS} onChange={setMinute} label="Minute" width="4.5rem" />
          </div>

          <div className={styles.panelFoot}>
            <button type="button" className={styles.textBtn} onClick={clear} disabled={!selected}>
              Clear
            </button>
            <span className={styles.panelFootRight}>
              <button type="button" className={styles.textBtn} onClick={goToday}>
                Today
              </button>
              <button
                type="button"
                className={styles.doneBtn}
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                Done
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
