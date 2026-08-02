export default function QuestLogoMark({ className }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <svg viewBox="-215 -235 430 710" aria-hidden className="h-7 w-auto sm:h-8">
        <g fill="none" stroke="#3080a2" strokeWidth="54">
          <circle cx="0" cy="0" r="179.5" />
          <path d="M -155.4 164.25 A 179.5 179.5 0 1 0 155.4 164.25" strokeLinecap="butt" />
        </g>
        <rect x="152.5" y="-223.5" width="54" height="235" fill="#3080a2" />
      </svg>
      <span className="text-xs font-bold uppercase tracking-[0.24em] text-white">Center Quest</span>
    </span>
  );
}
