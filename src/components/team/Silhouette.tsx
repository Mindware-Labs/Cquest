/**
 * The stand-in for a photograph that does not exist yet.
 *
 * Head and shoulders in a 64-box, filled rather than monoline: at portrait
 * sizes the site's 1.7px icon stroke reads as a pictogram OF a person, and
 * what this has to read as is the ABSENCE of one — the shape a real headshot
 * will occupy. Shared across all three places that show it (the home band's
 * miniature chart, the /team hero's wall, the org chart's roster) so the
 * placeholder is visibly one object at three sizes, and so the day the real
 * portraits land there is exactly one file to stop importing.
 *
 * `Shape` is the bare geometry, for callers that need to place it inside
 * their own SVG coordinate space. `Silhouette` is the standalone element.
 */
export function SilhouetteShape() {
  return (
    <>
      <circle cx="32" cy="25" r="11.5" />
      <path d="M32 40c-11.6 0-21 7.6-21 17v3h42v-3c0-9.4-9.4-17-21-17Z" />
    </>
  );
}

export default function Silhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <SilhouetteShape />
    </svg>
  );
}
