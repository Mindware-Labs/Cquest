import styles from "./BusyBar.module.css";

/* Línea de progreso indeterminada en el borde superior de una tabla mientras
   se resuelve un cambio de página, orden o filtro. */
export default function BusyBar({ active }: { active: boolean }) {
  return <span className={styles.bar} data-active={active || undefined} aria-hidden="true" />;
}
