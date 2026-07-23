"use client";

import Image from "next/image";
import container from "@/components/services/Container.module.css";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import styles from "./Footer.module.css";

export default function Footer() {
  const { dict } = useI18n();
  return (
    <footer className={`${container.container} ${styles.footer}`}>
      <LocalizedLink href="/" aria-label={dict.nav.homeLinkAriaLabel}><Image src="/logo.png" alt="Center Quest" width={173} height={128} className={styles.footerLogo} /></LocalizedLink>
      <p>{dict.footer.tagline}</p>
      <LocalizedLink href="/#services">{dict.footer.backToServices}</LocalizedLink>
    </footer>
  );
}
