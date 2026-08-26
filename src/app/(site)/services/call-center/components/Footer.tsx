"use client";

import Image from "next/image";
import container from "@/components/services/Container.module.css";
import { dict } from "@/lib/dictionary";
import { TransitionLink } from "@/components/TransitionLink";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={`${container.container} ${styles.footer}`}>
      <TransitionLink href="/" aria-label={dict.nav.homeLinkAriaLabel}><Image src="/logo.png" alt="Center Quest" width={692} height={512} sizes="54px" className={styles.footerLogo} /></TransitionLink>
      <p>{dict.footer.tagline}</p>
      <TransitionLink href="/#services">{dict.footer.backToServices}</TransitionLink>
    </footer>
  );
}
