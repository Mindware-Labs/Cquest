import type { Dictionary } from "./types";

export const dictionary: Dictionary = {
  common: {
    contactUs: "Contáctanos",
    skipToMainContent: "Saltar al contenido principal",
  },
  nav: {
    aboutUs: "Nosotros",
    services: "Servicios",
    sectors: "Sectores",
    team: "Equipo",
    contact: "Contacto",
    home: "Inicio",
    overview: "Resumen",
    menuOpen: "Abrir menú",
    menuClose: "Cerrar menú",
    mainNavAriaLabel: "Principal",
    homeLinkAriaLabel: "Inicio de Center Quest",
  },
  serviceSections: {
    callCenter: { capabilities: "Capacidades", process: "Proceso", results: "Resultados", clients: "Clientes" },
    bpo: { disciplines: "Disciplinas", method: "Método", slas: "SLAs", facilities: "Instalaciones" },
    systems: { capabilities: "Capacidades", method: "Método", commitments: "Compromisos", work: "Trabajo" },
  },
  footer: {
    tagline: "Call Center · Operaciones · Desarrollo de Sistemas",
    backToServices: "Volver a todos los servicios",
  },
  hero: {
    /* 71 → 45 caracteres. "Nosotros" sobra: el español no necesita el sujeto
       explícito y "Manejamos" ya lo carga. El contraste que sostiene la frase
       es operaciones ↔ crecimiento, y ése se conserva entero; lo que se fue
       es "haces crecer tu negocio", que el lead de abajo ya recoge. El corte
       tiene que dejar el punto al final de una línea, y para eso la segunda
       oración tiene que empezar con una palabra de cinco letras o más —
       "operaciones." deja ~2em libres y un "Tú" suelto se sube a esa línea. */
    headline: "Manejamos tus operaciones. Mientras tú creces.",
    lead: "Un solo aliado para tus tres prioridades de crecimiento.",
    primaryCta: "Cuéntanos tu misión",
    replayLabel: "Repetir la animación",
    navLinks: {
      services: "Servicios",
      team: "Nuestro equipo",
      sectors: "Sectores",
      partnerships: "Partnerships",
    },
    /* Trimmed against .sayLine's `white-space: nowrap` in
       QuestBotScene.module.css — every line here has to fit the bubble in
       one row, so these read a shade terser than a direct translation of
       the English set would. */
    questions: [
      "¿Cuál es tu misión?",
      "¿Ayuda con tus operaciones?",
      "¿Necesitas soporte al cliente?",
      "¿Necesitas software a la medida?",
      "¿Buscas escalar tu negocio?",
      "¿Listo para automatizar procesos?",
      "¿Buscas reducir costos operativos?",
      "¿Necesitas un socio estratégico?",
    ],
    sayCtaSuffix: "— abrir el formulario de cotización",
    onlineLabel: "cq · online",
  },
  carousel: {
    ariaLabel: "Líneas de negocio de Center Quest",
    slideAriaLabel: "{index} de {total}: {label}",
    businessLinePrefix: "Línea de negocio",
    chooseServiceAriaLabel: "Elegir servicio",
    explorePrefix: "Explorar",
  },
  wizard: {
    ariaLabel: "Solicitud de cotización",
    stepOf: "Paso {n} de 3",
    stepAnnounce: "Paso {n} de 3: {label}.",
    fixFields: "Corrige los campos resaltados.",
    sending: "Enviando tu solicitud de cotización…",
    sent: "Solicitud de cotización enviada.",
    submitError: "No pudimos enviar tu solicitud. Tus respuestas siguen aquí — inténtalo de nuevo.",
    back: "Atrás",
    continue: "Continuar",
    sendingButton: "Enviando…",
    submitButton: "Solicitar cotización",
    step1: {
      eyebrow: "Paso 1 · Servicio",
      title: "¿En qué podemos ayudarte?",
      lead: "Elige la línea de trabajo más cercana a lo que necesitas — afinaremos los detalles después.",
      ariaLabel: "Línea de negocio",
    },
    step2: { eyebrow: "Paso 2 · Detalles" },
    step3: {
      eyebrow: "Paso 3 · Contacto",
      title: "¿A dónde enviamos tu cotización?",
      lead: "Solo usaremos estos datos para preparar y enviarte tu propuesta.",
      preferredChannel: "Mejor forma de contactarte",
      consent: "Al enviar, aceptas que te contactemos sobre tu solicitud. No compartimos tus datos con nadie.",
    },
    confirmation: {
      thanksNamed: "Gracias, {name} — tu solicitud está en camino.",
      thanksGeneric: "Gracias — tu solicitud está en camino.",
      note: "Nuestro equipo revisará tu solicitud de {service} y te responderá en un día hábil.",
      fallbackService: "cotización",
      serviceLabel: "Servicio",
      backHome: "Volver al inicio",
      startAnother: "Iniciar otra solicitud",
    },
    progressRailAriaLabel: "Pasos de la cotización",
  },
  quoteExperience: {
    trust: ["Respuesta en un día hábil", "Sin compromiso, sin costo", "Tus datos se mantienen privados"],
    eyebrow: "Cuéntanos tu misión",
    titleWithService: ["Definamos tu operación de ", "."],
    titleGeneric: "Definamos tu operación.",
    lead: "Responde algunas preguntas rápidas y volveremos con una propuesta a tu medida — normalmente en un día hábil.",
  },
  quoteContact: {
    meta: "3 pasos · unos 2 minutos",
    cta: "Cuéntanos tu misión",
    reassure: "Gratis · sin compromiso",
  },
};

export default dictionary;
