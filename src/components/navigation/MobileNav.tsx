import MobileSidebar from "./MobileSidebar";
import type { NavLink } from "./data";

type MobileNavProps = {
  open: boolean;
  reduced: boolean;
  onClose: () => void;
  links: readonly NavLink[];
  ctaHref?: string;
  ctaLabel?: string;

  /* Lo decide la página, no el componente: sobre una página oscura entera un
     panel blanco es el mismo salto de superficie que la barra clara. */
  theme?: "light" | "dark";
};

export default function MobileNav({
  open,
  reduced,
  onClose,
  links,
  ctaHref = "#",
  ctaLabel,
  theme = "light",
}: MobileNavProps) {
  return (
    <MobileSidebar
      id="mobile-menu"
      open={open}
      reduced={reduced}
      onClose={onClose}
      links={links}
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      theme={theme}
    />
  );
}
