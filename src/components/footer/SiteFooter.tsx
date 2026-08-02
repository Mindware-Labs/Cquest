"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import container from "@/components/services/Container.module.css";
import { useIsomorphicLayoutEffect } from "@/components/about/motion";
import QuestCta from "@/components/ui/QuestCta";
import { useI18n } from "@/i18n/I18nProvider";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { CQ_EASE, gsap } from "@/lib/gsap";
import { BRAND_LINE, CONTACT, COPY, getBaseLinks, getServiceRows } from "./data";
import styles from "./SiteFooter.module.css";

/* ── Site footer ──────────────────────────────────────────
   The hero opens the site as a lit dark stage; the services sheet is lifted
   white over it. This closes the loop on the same stage — the hero's own
   field gradient, its grain tile, its accent hairline, its button — so the
   page reads as bottoming out where it began rather than ending on an
   unrelated dark band.

   What it dropped, and why:
     • The Sectors column. Its five labels all resolved to the same
       /#sectors anchor: link-shaped decoration, not navigation.
     • The Company column. Four of its links now sit inline in the closing
       row, where they cost one line instead of a quarter of the footer.
     • The pill CTA with its lone darkening wash. It is the hero's button
       now, shared from ui/QuestCta rather than re-approximated here.
     • The oversized logo. The closing statement carries the brand weight;
       the wordmark sits above it at signature scale.

   Structurally: one statement + one action on the left, a directory of the
   three business lines and the three ways to reach us on the right, and a
   single closing rule. Rows and hairlines rather than cards — the three
   business lines are a list, and boxing them would say otherwise. */

export default function SiteFooter() {
  const { lang, dict } = useI18n();
  const t = COPY[lang];
  const reduced = useReducedMotion() ?? false;

  const footerRef = useRef<HTMLElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const statementRef = useRef<HTMLHeadingElement>(null);

  /* The footer's one orchestrated beat, and the hero's gesture verbatim: the
     rule draws along its length, then the statement's words lift from behind
     their own clip edges, then the directory sharpens out of blur behind it.
     Three cues on one timeline, not three independent reveals — a page's last
     block should land, not perform.

     All GSAP `fromTo`, and no `whileInView` variants, on purpose: fromTo
     writes the from-state in JS before paint (hence the layout effect), so a
     run where the script never executes ships a fully visible footer rather
     than a blank one. Variants would have serialised opacity: 0 into the
     HTML and depended on hydration to undo it.

     Played from an IntersectionObserver rather than a ScrollTrigger, and
     that distinction is the whole bug fix. This footer lives in the locale
     layout, outside <main>, so it mounts once and survives every client-side
     route change. A ScrollTrigger caches its start as a pixel offset at
     creation time, and nothing here refreshed it on navigation: land on a
     page without scrolling to the bottom, move to a shorter one, and the
     cached start now sits past that page's maximum scroll. It can never be
     reached, the tween never fires, and the from-state stays written — a
     footer showing its logo, its button and its base row over an empty
     middle. An observer caches nothing; the browser evaluates it against
     live layout, so it stays correct across route changes, late-loading
     content and any page height. */
  useIsomorphicLayoutEffect(() => {
    const footer = footerRef.current;
    if (reduced || !footer || !statementRef.current) return;

    let observer: IntersectionObserver | undefined;

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
        /* The services motion language's `softRiseVariants`, in GSAP: opacity
           plus a focus-pull out of blur, no y-rise. The two blocks own CSS
           hover transitions on their rows, and presence — never a flat fade —
           is how everything else on this site arrives. */
        .fromTo(
          footer.querySelectorAll(`.${styles.block}`),
          { autoAlpha: 0, filter: "blur(10px)" },
          { autoAlpha: 1, filter: "blur(0px)", duration: 0.85, ease: CQ_EASE, stagger: 0.12 },
          0.26,
        );

      // -12% on the bottom edge is the old `start: "top 88%"` expressed as a
      // shrunken root: the reveal begins when the footer's top crosses 88% of
      // the viewport. The observer fires its first callback on observe(), so a
      // page that loads already scrolled to the bottom reveals immediately
      // instead of waiting for a scroll event that never comes.
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
    <footer ref={footerRef} className={styles.footer}>
      {/* The hero's field, reprised: static grain over the gradient, a corner
          falloff so it reads as a lit stage rather than a flat rectangle of
          colour, and one celeste bloom in the corner that carries the
          statement — the same single light source, seen once more on the way
          out. */}
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
              {/* Height-constrained, width auto. logo.png is 173×128, so
                  128 CSS px is the asset's ceiling; at 2.25rem it has pixels
                  to spare on any display. Whitened with the same
                  `brightness(0) invert(1)` pair Navbar and HeroNav use on
                  this exact PNG — brightness(0) crushes every colour to
                  black, invert(1) flips that to pure white, which is why it
                  works regardless of the logo's own colours and why the
                  order matters. */}
              <Image
                src="/logo.png"
                alt="Center Quest"
                width={173}
                height={128}
                className={styles.brandLogo}
              />
            </LocalizedLink>

            <span aria-hidden ref={ruleRef} className={`cq-hero-rule ${styles.rule}`} />

            {/* Two deliberate lines, each word in its own clipping box. The
                padding/negative-margin pair on .word gives descenders
                somewhere to live so the mask never shaves a "p" or a "y". */}
            <h2 ref={statementRef} className={styles.statement}>
              {BRAND_LINE[lang].map((line, lineIndex) => (
                <span key={line} className={styles.statementLine}>
                  {line.split(" ").map((word, wordIndex) => (
                    // The space is a sibling of the clipping box, never inside it:
                    // a trailing space within an `overflow: hidden` inline-block is
                    // collapsed away, and a non-breaking one would stop the
                    // statement wrapping at all on a narrow screen.
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
              {/* A description list, not a link list: these are labelled
                  facts, and only two of the three are actionable. */}
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
                {/* <address> is the semantic element for the contact details
                    of its nearest section — screen readers announce it as
                    such. Its browser default is italic, reset in the
                    stylesheet. */}
                <dd>
                  <address className={styles.address}>
                    {CONTACT.street}
                    <br />
                    {CONTACT.city}, {CONTACT.country[lang]}
                  </address>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={styles.base}>
          <nav className={styles.baseNav} aria-label={t.navAriaLabel}>
            {getBaseLinks(lang).map((link) => (
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

/* The hero CTA's glyph, at readout scale — the site has one chevron. */
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
