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
    headline: string;
    lead: string;
    primaryCta: string;

    replayLabel: string;
    navLinks: {
      services: string;
      team: string;
      sectors: string;
      partnerships: string;
    };

    questions: readonly string[];

    sayCtaSuffix: string;
    onlineLabel: string;
  };
  carousel: {
    ariaLabel: string;

    slideAriaLabel: string;
    businessLinePrefix: string;
    chooseServiceAriaLabel: string;
    explorePrefix: string;
  };
  wizard: {
    ariaLabel: string;

    stepOf: string;

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
      privacyLinkLabel: string;
    };
    confirmation: {
      thanksNamed: string;
      thanksGeneric: string;

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
