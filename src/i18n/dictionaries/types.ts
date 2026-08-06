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
    team: string;
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
    team: { departments: string };
  };
  footer: {
    tagline: string;
    backToServices: string;
  };
  hero: {
    /** The page's single <h1>. Rendered word-by-word behind masks. */
    headline: string;
    lead: string;
    primaryCta: string;
    /** Accessible name for the mascot's replay control. */
    replayLabel: string;
    navLinks: {
      services: string;
      team: string;
      sectors: string;
      partnerships: string;
    };
    /**
     * The terminal's rotating lines. [0] is always the mascot's opening
     * line, typed once as part of the intro; after that the bubble cycles
     * through the rest (and back to [0]) on its own, erasing and retyping
     * each in turn. Hovering a Services link in the nav jumps straight to
     * that service's own question — see SERVICE_QUESTION_INDEX in
     * hero/animation.ts, which the array's order has to stay in step with.
     */
    questions: readonly string[];
    /**
     * Suffix for the mascot's speech bubble's accessible name — the
     * component builds the full label as `${currentQuestion} ${suffix}`.
     * A plain string, not a function of the question: the dictionary is
     * loaded server-side and handed to a Client Component as a prop
     * (I18nProvider), and a function can't survive that serialization
     * boundary. WCAG 2.5.3 (Label in Name) still holds — the accessible
     * name is built to always start with whatever's visible.
     */
    sayCtaSuffix: string;
    onlineLabel: string;
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
