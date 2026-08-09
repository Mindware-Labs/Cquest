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
