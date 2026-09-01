/* Todo el copy de cromo del sitio (nav, footer, hero, wizard) en un solo
   módulo estático. El sitio es monolingüe en inglés: sin proveedor de
   contexto ni carga por idioma — se importa `dict` y ya. */

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
    blog: string;
    joinUs: string;
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
    joinUs: { openings: string };
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
      whyUs: string;
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

    /* Salida secundaria del slide: va a la cotización, no a la página del
       servicio. Para quien ya sabe qué necesita. */
    talkToTeam: string;

    /* Solo el registro de móvil: el carrusel de desktop no lleva rótulo. */
    linesEyebrow: string;
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

export const dict: Dictionary = {
  common: {
    contactUs: "Contact us",
    skipToMainContent: "Skip to main content",
  },
  nav: {
    aboutUs: "About us",
    services: "Services",
    sectors: "Sectors",
    team: "Team",
    blog: "Blog",
    joinUs: "Join us",
    contact: "Contact",
    home: "Home",
    overview: "Overview",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    mainNavAriaLabel: "Main",
    homeLinkAriaLabel: "Center Quest home",
  },
  serviceSections: {
    callCenter: { capabilities: "Capabilities", process: "Process", results: "Results", clients: "Clients" },
    bpo: { disciplines: "Disciplines", method: "Method", slas: "SLAs", facilities: "Facilities" },
    systems: { capabilities: "Capabilities", method: "Method", commitments: "Commitments", work: "Work" },
    team: { departments: "Departments" },
    joinUs: { openings: "Open positions" },
  },
  footer: {
    tagline: "Call Center · Operations · Systems Development",
    backToServices: "Back to all services",
  },
  hero: {
    headline: "We run your operations. While you grow your business.",
    lead: "One partner across your three growth priorities.",
    primaryCta: "Give us a quest",
    replayLabel: "Replay the animation",
    navLinks: {
      services: "Services",
      team: "Our team",
      sectors: "Sectors",
      whyUs: "Why us",
      partnerships: "Partnerships",
    },
    questions: [
      "give me your quest",
      "Need help with operations?",
      "Need a customer support team?",
      "Need custom software?",
      "Looking to scale your business?",
      "Ready to automate your workflows?",
      "Looking to reduce operating costs?",
      "Need a strategic partner?",
    ],
    sayCtaSuffix: "— open the quote form",
    onlineLabel: "cq · online",
  },
  carousel: {
    ariaLabel: "Center Quest business lines",
    slideAriaLabel: "{index} of {total}: {label}",
    businessLinePrefix: "Business line",
    chooseServiceAriaLabel: "Choose service",
    explorePrefix: "Explore",
    talkToTeam: "Talk to the team",
    linesEyebrow: "Three business lines",
  },
  wizard: {
    ariaLabel: "Quote request",
    stepOf: "Step {n} of 3",
    stepAnnounce: "Step {n} of 3: {label}.",
    fixFields: "Please fix the highlighted fields.",
    sending: "Sending your quote request…",
    sent: "Quote request sent.",
    submitError: "We couldn't send your request. Your answers are still here — please try again.",
    back: "Back",
    continue: "Continue",
    sendingButton: "Sending…",
    submitButton: "Request my quote",
    step1: {
      eyebrow: "Step 1 · Service",
      title: "What can we help you with?",
      lead: "Pick the line of work closest to what you need — you'll refine the specifics next.",
      ariaLabel: "Business line",
    },
    step2: { eyebrow: "Step 2 · Details" },
    step3: {
      eyebrow: "Step 3 · Contact",
      title: "Where should we send your quote?",
      lead: "We'll only use these details to prepare and send your proposal.",
      preferredChannel: "Best way to reach you",
      consent: "By submitting, you agree to be contacted about your request. We don't share your details with anyone — see our",
      privacyLinkLabel: "Privacy Policy",
    },
    confirmation: {
      thanksNamed: "Thanks, {name} — your request is in.",
      thanksGeneric: "Thanks — your request is in.",
      note: "Our team will review your {service} request and get back to you within one business day.",
      fallbackService: "quote",
      serviceLabel: "Service",
      backHome: "Back to home",
      startAnother: "Start another request",
    },
    progressRailAriaLabel: "Quote steps",
  },
  quoteExperience: {
    trust: ["Reply within one business day", "No commitment, no cost", "Your details stay private"],
    eyebrow: "Give us a quest",
    titleWithService: ["Let's scope your ", " operation."],
    titleGeneric: "Let's scope your operation.",
    lead: "Answer a few quick questions and we'll come back with a tailored proposal — usually within one business day.",
  },
  quoteContact: {
    meta: "3 steps · about 2 minutes",
    cta: "Give us a quest",
    reassure: "Free · no commitment",
  },
};
