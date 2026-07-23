import { SERVICES } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

export const BPO = SERVICES.find((service) => service.id === "bpo")!;

export const CAPABILITY_DETAIL: Record<
  string,
  { includes: Record<Locale, readonly string[]>; benefit: Record<Locale, string> }
> = {
  "back-office-support": {
    includes: {
      en: [
        "Document management, order processing and account maintenance handled end to end",
        "Runbooks that make every task repeatable, whoever executes it",
        "Volume absorbed without adding headcount on your side",
      ],
      es: [
        "Gestión documental, procesamiento de pedidos y mantenimiento de cuentas gestionados de principio a fin",
        "Manuales operativos que hacen que cada tarea sea repetible, sin importar quién la ejecute",
        "Volumen absorbido sin que tengas que aumentar tu personal",
      ],
    },
    benefit: {
      en: "Your team stays focused on the core business while the repetitive load runs accurately in the background.",
      es: "Tu equipo se mantiene enfocado en el negocio principal mientras la carga repetitiva se ejecuta con precisión en segundo plano.",
    },
  },
  "data-processing": {
    includes: {
      en: [
        "Data entry, validation and cleansing at volume",
        "Double-verification protocols on accuracy-critical records",
        "Structured outputs delivered in your systems and formats",
      ],
      es: [
        "Captura, validación y depuración de datos a gran volumen",
        "Protocolos de doble verificación en registros críticos para la precisión",
        "Resultados estructurados entregados en tus sistemas y formatos",
      ],
    },
    benefit: {
      en: "Reliable information your operation can act on — without the error rates that manual overload produces.",
      es: "Información confiable sobre la que tu operación puede actuar — sin las tasas de error que produce la sobrecarga manual.",
    },
  },
  "omnichannel-support": {
    includes: {
      en: [
        "One coordinated queue across phone, email, chat and messaging",
        "Consistent answers backed by a shared knowledge base",
        "Coverage schedules aligned to your operating hours",
      ],
      es: [
        "Una cola coordinada a través de teléfono, correo, chat y mensajería",
        "Respuestas consistentes respaldadas por una base de conocimiento compartida",
        "Horarios de cobertura alineados a tu horario de operación",
      ],
    },
    benefit: {
      en: "Customers get the same answer on every channel, and nothing falls between the cracks.",
      es: "Tus clientes reciben la misma respuesta en cada canal, y nada se pierde en el camino.",
    },
  },
  "trust-safety": {
    includes: {
      en: [
        "Content and transaction review under clearly documented policies",
        "Proactive risk flagging with defined escalation paths",
        "Audit trails behind every decision taken",
      ],
      es: [
        "Revisión de contenido y transacciones bajo políticas claramente documentadas",
        "Detección proactiva de riesgos con rutas de escalamiento definidas",
        "Registros de auditoría detrás de cada decisión tomada",
      ],
    },
    benefit: {
      en: "Your platform and community stay protected without slowing the operation down.",
      es: "Tu plataforma y comunidad se mantienen protegidas sin frenar la operación.",
    },
  },
  "quality-assurance": {
    includes: {
      en: [
        "Interaction sampling scored against your quality standards",
        "Calibration sessions that keep evaluators aligned",
        "Findings fed back into coaching and process fixes",
      ],
      es: [
        "Muestreo de interacciones evaluado contra tus estándares de calidad",
        "Sesiones de calibración que mantienen alineados a los evaluadores",
        "Hallazgos retroalimentados hacia el coaching y ajustes de proceso",
      ],
    },
    benefit: {
      en: "Quality stops being an opinion — it becomes a measured, improving number.",
      es: "La calidad deja de ser una opinión — se convierte en un número medido que mejora con el tiempo.",
    },
  },
  "consulting-services": {
    includes: {
      en: [
        "Diagnosis of your current processes and cost structure",
        "Redesign proposals with measurable targets",
        "Implementation support alongside your team",
      ],
      es: [
        "Diagnóstico de tus procesos actuales y estructura de costos",
        "Propuestas de rediseño con metas medibles",
        "Acompañamiento en la implementación junto a tu equipo",
      ],
    },
    benefit: {
      en: "An outside operations lens that turns inefficiencies into a concrete improvement plan.",
      es: "Una mirada externa a tus operaciones que convierte ineficiencias en un plan de mejora concreto.",
    },
  },
};

export const PROCESS: ReadonlyArray<{ title: Record<Locale, string>; description: Record<Locale, string> }> = [
  {
    title: { en: "Discovery", es: "Descubrimiento" },
    description: {
      en: "We study the process as it runs today — volumes, systems, exceptions, and the cost of getting it wrong.",
      es: "Estudiamos el proceso tal como funciona hoy — volúmenes, sistemas, excepciones y el costo de que algo salga mal.",
    },
  },
  {
    title: { en: "Process mapping", es: "Mapeo del proceso" },
    description: {
      en: "Every step is documented into a runbook: inputs, outputs, rules and edge cases, so the work is repeatable by design.",
      es: "Cada paso se documenta en un manual operativo: entradas, salidas, reglas y casos límite, para que el trabajo sea repetible por diseño.",
    },
  },
  {
    title: { en: "Pilot", es: "Piloto" },
    description: {
      en: "A controlled slice of real volume runs first, measured against the agreed SLAs before anything scales.",
      es: "Primero corre una porción controlada de volumen real, medida contra los SLAs acordados antes de escalar nada.",
    },
  },
  {
    title: { en: "Scale-up", es: "Escalamiento" },
    description: {
      en: "Volume ramps in stages while accuracy and turnaround hold; staffing flexes with your demand curve.",
      es: "El volumen crece por etapas mientras se mantiene la precisión y el tiempo de entrega; la dotación de personal se ajusta a tu curva de demanda.",
    },
  },
  {
    title: { en: "Continuous improvement", es: "Mejora continua" },
    description: {
      en: "Audits, error analysis and process reviews keep tightening the operation long after launch.",
      es: "Auditorías, análisis de errores y revisiones de proceso siguen ajustando la operación mucho después del lanzamiento.",
    },
  },
];

export const SLAS: ReadonlyArray<{ label: Record<Locale, string>; value: Record<Locale, string>; status: Record<Locale, string> }> = [
  {
    label: { en: "Accuracy target", es: "Meta de precisión" },
    value: { en: "99%+", es: "99%+" },
    status: { en: "Double-verification on critical records", es: "Doble verificación en registros críticos" },
  },
  {
    label: { en: "Turnaround", es: "Tiempo de entrega" },
    value: { en: "Within SLA", es: "Dentro del SLA" },
    status: { en: "Agreed per process, measured daily", es: "Acordado por proceso, medido a diario" },
  },
  {
    label: { en: "Volume capacity", es: "Capacidad de volumen" },
    value: { en: "Elastic", es: "Elástica" },
    status: { en: "Staffing flexes with your demand curve", es: "La dotación de personal se ajusta a tu curva de demanda" },
  },
  {
    label: { en: "Coverage", es: "Cobertura" },
    value: { en: "Up to 24/7", es: "Hasta 24/7" },
    status: { en: "Schedules aligned to your operation", es: "Horarios alineados a tu operación" },
  },
  {
    label: { en: "Reporting", es: "Reportes" },
    value: { en: "Continuous", es: "Continuo" },
    status: { en: "Production and quality always visible to you", es: "Producción y calidad siempre visibles para ti" },
  },
];

export const HERO_LINES: Record<Locale, ReadonlyArray<{ text: string; strong: boolean }>> = {
  en: [
    { text: "The work", strong: false },
    { text: "behind your", strong: false },
    { text: "operation.", strong: true },
  ],
  es: [
    { text: "El trabajo", strong: false },
    { text: "detrás de tu", strong: false },
    { text: "operación.", strong: true },
  ],
};
