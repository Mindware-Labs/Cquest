"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { useIsomorphicLayoutEffect } from "@/components/about/motion";
import { NO_FOOTER_PAGES } from "@/components/navigation/data";
import QuestCta from "@/components/ui/QuestCta";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink, useLocalizedPathname } from "@/i18n/LocalizedLink";
import { CQ_EASE, gsap } from "@/lib/gsap";
import { BRAND_LINE, CONTACT, COPY, getBaseLinks, getServiceRows } from "./data";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const { lang, dict } = useI18n();
  const t = COPY[lang];
  const reduced = useReducedMotion() ?? false;
  const pathname = useLocalizedPathname();

  /* Algunas rutas cierran con su propio bloque de contacto y no quieren un
     segundo cierre encima. */
  const footerHidden = (NO_FOOTER_PAGES as readonly string[]).includes(pathname);

  const footerRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);

  useIsomorphicLayoutEffect(() => {
    const footer = footerRef.current;
    if (reduced || !footer || !statementRef.current) return;

    let observer: IntersectionObserver | undefined;

    /* gsap.context para que el cleanup revierta todo de una: este bloque monta
     y desmonta con la ruta. */
    const ctx = gsap.context(() => {
      const reveal = gsap.timeline({ paused: true });

      reveal
        .fromTo(ruleRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: CQ_EASE }, 0)
        .fromTo(
          statementRef.current!.querySelectorAll(`.${styles.word} > span`),
          { yPercent: 118 },
          { yPercent: 0, duration: 1.05, ease: CQ_EASE, stagger: 0.055 },
          0.12,
        )

        .fromTo(
          footer.querySelectorAll(`.${styles.block}`),
          { autoAlpha: 0, filter: "blur(10px)" },
          { autoAlpha: 1, filter: "blur(0px)", duration: 0.85, ease: CQ_EASE, stagger: 0.12 },
          0.26,
        );

      observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer?.disconnect();
          reveal.play();
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      observer.observe(footer);
    }, footerRef);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, [reduced]);

  const year = new Date().getFullYear();
  const services = getServiceRows(lang);

  return (
    <footer ref={footerRef} className={styles.footer} hidden={footerHidden}>

      <span aria-hidden className={styles.glow} />
      <span aria-hidden className={`cq-field-grain ${styles.grain}`} />
      <span aria-hidden className={styles.vignette} />

      <div className={`${container.container} ${styles.inner}`}>
        <div className={styles.close}>
          <div className={styles.statementBlock}>
            <LocalizedLink
              href="/"
              aria-label={dict.nav.homeLinkAriaLabel}
              className={styles.brandLink}
            >

              <Image
                src="/logo.png"
                alt="Center Quest"
                width={692}
                height={512}
                className={styles.brandLogo}
              />
            </LocalizedLink>

            <span aria-hidden ref={ruleRef} className={`cq-hero-rule ${styles.rule}`} />

            <h2 ref={statementRef} className={styles.statement}>
              {BRAND_LINE[lang].map((line, lineIndex) => (
                <span key={line} className={styles.statementLine}>
                  {line.split(" ").map((word, wordIndex) => (
                    <span key={`${lineIndex}-${wordIndex}-${word}`}>
                      <span className={styles.word}>
                        <span>{word}</span>
                      </span>{" "}
                    </span>
                  ))}
                </span>
              ))}
            </h2>

            <div className={styles.ctaRow}>
              <QuestCta href="/quote" label={t.cta} strength={0.25} maxDistance={2} />
            </div>
          </div>

          <div className={styles.directory}>
            <nav className={styles.block} aria-label={t.headings.services}>
              <h3 className={styles.blockHeading}>{t.headings.services}</h3>
              <ul className={styles.serviceList}>
                {services.map((service) => (
                  <li key={service.id}>
                    <LocalizedLink
                      href={service.href}
                      className={styles.serviceRow}
                      style={{ "--svc": service.accent } as CSSProperties}
                    >
                      <span className={styles.serviceName}>{service.label}</span>
                      <span className={styles.serviceLead}>{service.lead}</span>
                      <span aria-hidden className={styles.serviceChevron}>
                        <Chevron />
                      </span>
                    </LocalizedLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.block}>
              <h3 className={styles.blockHeading}>{t.headings.contact}</h3>

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

                <dd>
                  <address className={styles.address}>
                    <LocalizedLink href="/location">
                      {CONTACT.street}
                      <br />
                      {CONTACT.city}, {CONTACT.country[lang]}
                    </LocalizedLink>
                  </address>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={styles.base}>
          <nav className={styles.baseNav} aria-label={t.navAriaLabel}>
            {getBaseLinks(dict, lang).map((link) => (
              <LocalizedLink key={link.href} href={link.href}>
                {link.label}
              </LocalizedLink>
            ))}
          </nav>
          <p className={styles.copyright}>
            © {year} Center Quest. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}
