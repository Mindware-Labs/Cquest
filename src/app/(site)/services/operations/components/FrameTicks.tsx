import styles from "./Frame.module.css";

export default function FrameTicks() {
  return (
    <>
      <span className={styles.tick} data-pos="tl" aria-hidden />
      <span className={styles.tick} data-pos="tr" aria-hidden />
      <span className={styles.tick} data-pos="bl" aria-hidden />
      <span className={styles.tick} data-pos="br" aria-hidden />
    </>
  );
}
