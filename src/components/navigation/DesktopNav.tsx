import { useState } from "react";
import { motion } from "motion/react";
import { NAV_LINKS } from "./data";

export default function DesktopNav({ reduced, inverse = false }: { reduced: boolean; inverse?: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <ul
      className="hidden items-center gap-1 md:flex"
      onMouseLeave={() => setHovered(null)}
    >
      {NAV_LINKS.map(({ label, href }) => (
        <li key={label} className="relative">
          {hovered === label && (
            <motion.span
              layoutId="nav-hover"
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 400, damping: 32 }
              }
              className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--brand-celeste)_16%,transparent)]"
            />
          )}
          <a
            href={href}
            onClick={(event) => href === "#" && event.preventDefault()}
            onMouseEnter={() => setHovered(label)}
            onFocus={() => setHovered(label)}
            className={`relative z-10 block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${inverse ? "text-white/78 hover:text-white focus-visible:outline-celeste" : "text-foreground/80 hover:text-petroleo focus-visible:outline-petroleo"}`}
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}
