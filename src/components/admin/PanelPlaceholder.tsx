import styles from "./PanelPlaceholder.module.css";

type Point = { title: string; text: string };

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  points: Point[];
  foot?: string;
};

export default function PanelPlaceholder({ eyebrow, title, lead, points, foot }: Props) {
  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <span className={styles.pending}>
          <span className={styles.pendingDot} aria-hidden="true" />
          En construcción
        </span>
      </div>

      <h1 className={styles.title}>{title}</h1>
      <div className={styles.rule} />
      <p className={styles.lead}>{lead}</p>

      {/* Numerado porque es el orden en que se va a construir, no adorno. */}
      <ol className={styles.points}>
        {points.map((point, index) => (
          <li key={point.title} className={styles.point}>
            <span className={styles.pointIndex}>{String(index + 1).padStart(2, "0")}</span>
            <span>
              <span className={styles.pointTitle}>{point.title}</span>
              <span className={styles.pointText}>{point.text}</span>
            </span>
          </li>
        ))}
      </ol>

      {foot && <p className={styles.foot}>{foot}</p>}
    </div>
  );
}
