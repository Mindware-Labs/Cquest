"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { CQ_EASE, gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/components/about/motion";
import {
  CONTACT,
  COPY,
  getCompanyLinks,
  getSectorLinks,
  getServiceLinks,
  type FooterLink,
} from "./data";
import styles from "./SiteFooter.module.css";

// Same wrapper Navbar uses for its "Contáctanos" CTA — motion.create() on
// LocalizedLink rather than a plain motion.a, so the button keeps locale
// resolution and next/link prefetching while gaining motion props.
const MotionLink = motion.create(LocalizedLink);

/* ── Site footer ──────────────────────────────────────────
   A full closing footer, replacing the three near-identical 3-line footers
   duplicated under each app/[lang]/services/<service>/components/Footer.tsx
   (logo, tagline, one back-link). Structurally this is the familiar big-agency close —
   oversized wordmark, link columns, contact block, legal rule — which is the
   shape hirehoratio.com uses too; the material is entirely ours: About's dark
   band continued one shade deeper, celeste hairlines, Switzer.

   Deliberate departures from that reference:
     • No photography or decorative imagery — the only image is the brand
       logo, kept near its intrinsic 173×128 so it never upscales.
     • No Legal column. Privacy/Terms routes do not exist in this app yet, and
       a footer full of 404s costs more trust than it buys.
     • Sectors resolve to About's #sectors block, not to five invented routes.
     • No "back to top" control: the browser and Lenis already own that
       gesture, and the closing row reads better as a single centred line.

   Why dark: About closes on ValuesSection's `--ab-deep` band. A light footer
   there would read as a seam; this goes one step deeper than Values instead,
   so the page reads as bottoming out rather than restarting. */

function LinkColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div className={styles.column}>
      <h3 className={styles.columnHeading}>{heading}</h3>
      <ul className={styles.columnList}>
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <LocalizedLink href={link.href}>{link.label}</LocalizedLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  const { lang, dict } = useI18n();
  const t = COPY[lang];
  const reduced = useReducedMotion() ?? false;

  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  /* The CTA is the navbar's "Contáctanos" button, verbatim: same magnetic
     pull, same spring, same cq-rect-cta type treatment. Two identical-intent
     buttons on one page that hover differently is the kind of detail that
     reads as sloppy without anyone being able to say why. useMagnetic
     already no-ops under reduced motion, so no extra gate is needed here. */
  const {
    ref: ctaRef,
    style: ctaStyle,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  } = useMagnetic<HTMLAnchorElement>(0.25, 2);

  /* The logo wipes up from its own baseline as the footer enters — the one
     motion beat down here, borrowing About's CURTAIN gesture so the close
     speaks the same language as the sections above it. Everything else in
     the footer is static on purpose: a page's last block should settle, not
     perform. */
  useIsomorphicLayoutEffect(() => {
    if (reduced || !brandRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        brandRef.current,
        { yPercent: 12, autoAlpha: 0, clipPath: "inset(0% 0% 100% 0%)" },
        {
          yPercent: 0,
          autoAlpha: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.1,
          ease: CQ_EASE,
          scrollTrigger: { trigger: footerRef.current, start: "top 92%", once: true },
        },
      );
    }, footerRef);

    return () => ctx.revert();
  }, [reduced]);

  const year = new Date().getFullYear();

  return (
    <footer ref={footerRef} className={styles.footer}>
      {/* A single celeste bloom behind the wordmark — the same one light
          source About uses, seen once more on the way out. */}
      <span aria-hidden className={styles.footerGlow} />

      <div className={`${container.container} ${styles.inner}`}>
        <div className={styles.top}>
          <div ref={brandRef} className={styles.brand}>
            {/* Rendered close to the asset's intrinsic 173×128 rather than
                blown up to display size — the reason the wordmark isn't set
                as giant type here anymore is the same reason it can't be a
                giant PNG: at that scale the logo would be upscaled mush. */}
            <LocalizedLink href="/" aria-label={dict.nav.homeLinkAriaLabel} className={styles.brandLink}>
              <Image
                src="/logo.png"
                alt="Center Quest"
                width={173}
                height={128}
                className={styles.brandLogo}
              />
            </LocalizedLink>
            <p className={styles.tagline}>{dict.footer.tagline}</p>
          </div>

          <div className={styles.ctaCard}>
            <p className={styles.ctaLead}>{t.ctaLead}</p>
            <MotionLink
              ref={ctaRef}
              href="/quote"
              onMouseEnter={onMouseEnter}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              style={ctaStyle}
              whileHover={{ scale: 1.045 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className={`cq-rect-cta ${styles.ctaLink}`}
            >
              {/* The darkening wash on hover, same as the navbar's — a
                  separate layer rather than a background-color change, so it
                  can't fight the magnetic transform for the same property. */}
              <span aria-hidden className={styles.ctaWash} />
              <span className={styles.ctaLabel}>{t.cta}</span>
            </MotionLink>
          </div>
        </div>

        <nav className={styles.columns} aria-label={t.columns.company}>
          <LinkColumn heading={t.columns.company} links={getCompanyLinks(lang)} />
          <LinkColumn heading={t.columns.services} links={getServiceLinks(lang)} />
          <LinkColumn heading={t.columns.sectors} links={getSectorLinks(lang)} />

          <div className={styles.column}>
            <h3 className={styles.columnHeading}>{t.columns.contact}</h3>
            {/* A description list, not a link list: these are labelled facts
                (phone, email, location), and only two of the three are
                actionable. */}
            <dl className={styles.contactList}>
              <dt>{t.phoneLabel}</dt>
              <dd>
                <a href={`tel:${CONTACT.phoneHref}`}>{CONTACT.phone}</a>
              </dd>
              <dt>{t.emailLabel}</dt>
              <dd>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </dd>
              <dt>{t.locationLabel}</dt>
              {/* <address> is the semantic element for contact details of its
                  nearest section — screen readers announce it as such. Its
                  browser default is italic, reset in the stylesheet. */}
              <dd>
                <address className={styles.address}>
                  {CONTACT.street}
                  <br />
                  {CONTACT.city}, {CONTACT.country[lang]}
                </address>
              </dd>
            </dl>
          </div>
        </nav>

        <div className={styles.legal}>
          <p>
            © {year} Center Quest. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
