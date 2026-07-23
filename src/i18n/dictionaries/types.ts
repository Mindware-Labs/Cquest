// Flat/standalone UI chrome copy — labels, buttons, aria text, section
// headers that don't already live in a structured content data file (see
// components/services/data.ts and the per-page data.ts files for that half).
export interface Dictionary {
  common: {
    contactUs: string;
    skipToMainContent: string;
  };
  nav: {
    aboutUs: string;
    services: string;
    sectors: string;
    contact: string;
    home: string;
    overview: string;
    menuOpen: string;
    menuClose: string;
    mainNavAriaLabel: string;
    homeLinkAriaLabel: string;
  };
  serviceSections: {
    callCenter: { capabilities: string; process: string; results: string; clients: string };
    bpo: { disciplines: string; method: string; slas: string; facilities: string };
    systems: { capabilities: string; method: string; commitments: string; work: string };
  };
  footer: {
    tagline: string;
    backToServices: string;
  };
  hero: {
    lead: string;
    coverageLine: string;
    scrollAriaLabel: string;
    scrollLabel: string;
    primaryCta: string;
    secondaryCta: string;
    accessibleFallback: string;
    rotating: ReadonlyArray<{ top: string; bottom: string }>;
    navLinks: { services: string; successStories: string; about: string; contact: string };
  };
  carousel: {
    ariaLabel: string;
    /** {index}, {total}, {label} — see i18n/format.ts */
    slideAriaLabel: string;
    businessLinePrefix: string;
    chooseServiceAriaLabel: string;
    explorePrefix: string;
  };
  wizard: {
    ariaLabel: string;
    /** {n} — see i18n/format.ts */
    stepOf: string;
    /** {n}, {label} — see i18n/format.ts */
    stepAnnounce: string;
    fixFields: string;
    sending: string;
    sent: string;
    submitError: string;
    back: string;
    continue: string;
    sendingButton: string;
    submitButton: string;
    step1: { eyebrow: string; title: string; lead: string; ariaLabel: string };
    step2: { eyebrow: string };
    step3: {
      eyebrow: string;
      title: string;
      lead: string;
      preferredChannel: string;
      consent: string;
    };
    confirmation: {
      /** {name} — see i18n/format.ts */
      thanksNamed: string;
      thanksGeneric: string;
      /** {service} — see i18n/format.ts */
      note: string;
      fallbackService: string;
      serviceLabel: string;
      backHome: string;
      startAnother: string;
    };
    progressRailAriaLabel: string;
  };
  quoteExperience: {
    trust: readonly [string, string, string];
    eyebrow: string;
    /** [textBeforeServiceLabel, textAfterServiceLabel] — the label itself is
     *  rendered separately (in an accent span), not interpolated into one string. */
    titleWithService: readonly [string, string];
    titleGeneric: string;
    lead: string;
  };
  quoteContact: {
    meta: string;
    cta: string;
    reassure: string;
  };
}
