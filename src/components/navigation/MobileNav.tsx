import MobileSidebar from "./MobileSidebar";
import type { NavLink } from "./data";

type MobileNavProps = {
  open: boolean;
  reduced: boolean;
  onClose: () => void;
  links: readonly NavLink[];
  ctaHref?: string;
};

export default function MobileNav({ open, reduced, onClose, links, ctaHref = "#" }: MobileNavProps) {
  return (
    <MobileSidebar
      id="mobile-menu"
      open={open}
      reduced={reduced}
      onClose={onClose}
      links={links}
      ctaHref={ctaHref}
      theme="light"
    />
  );
}
