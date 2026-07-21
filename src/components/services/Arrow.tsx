import styles from "./Arrow.module.css";

/**
 * Shared across every service page. `className` merges onto the base arrow
 * class so a caller can apply its own context-specific tweak (an active/hover
 * shift, hiding it on mobile) without reaching into this component's own
 * CSS-Modules-hashed class from another file.
 */
export default function Arrow({
  direction = "right",
  className,
}: {
  direction?: "right" | "down";
  className?: string;
}) {
  const base = direction === "down" ? styles.arrowDown : styles.arrow;
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={className ? `${base} ${className}` : base}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}
