import type { Locale } from "@/i18n/config";

export type LegalBlock =
  | { type: "p"; text: Record<Locale, string> }
  | { type: "list"; items: Record<Locale, readonly string[]> };

export type LegalSection = {
  id: string;
  heading: Record<Locale, string>;
  blocks: readonly LegalBlock[];
};

export type LegalDoc = {
  title: Record<Locale, string>;
  updated: Record<Locale, string>;
  intro: Record<Locale, string>;
  sections: readonly LegalSection[];
};

const p = (es: string, en: string): LegalBlock => ({ type: "p", text: { es, en } });
const list = (es: readonly string[], en: readonly string[]): LegalBlock => ({
  type: "list",
  items: { es, en },
});

const UPDATED: Record<Locale, string> = { es: "8 de agosto de 2026", en: "August 8, 2026" };
/* Mismo dato que UPDATED, en ISO 8601: es lo que consume dateModified en el
   JSON-LD de cada page.tsx. Una sola fuente para las dos representaciones. */
export const UPDATED_ISO = "2026-08-08";

export const PRIVACY: LegalDoc = {
  title: { es: "Política de Privacidad", en: "Privacy Policy" },
  updated: UPDATED,
  intro: {
    es: "En Center Quest tratamos los datos personales que nos confías —al solicitar una cotización o al escribirnos— con el mismo cuidado con el que operamos para nuestros clientes. Esta política explica qué datos recopilamos a través de este sitio, para qué los usamos, con quién los compartimos y cómo puedes ejercer tus derechos sobre ellos.",
    en: "At Center Quest we handle the personal data you share with us — when requesting a quote or writing to us — with the same care we bring to our clients' operations. This policy explains what data this site collects, how we use it, who we share it with, and how you can exercise your rights over it.",
  },
  sections: [
    {
      id: "who",
      heading: { es: "Quiénes somos", en: "Who we are" },
      blocks: [
        p(
          "Center Quest es un aliado de operaciones con tres líneas de negocio: Call Center, BPO (Business Process Outsourcing) y Desarrollo de Sistemas para operaciones.",
          "Center Quest is an operations partner built around three business lines: Call Center, BPO (Business Process Outsourcing) and Systems Development for operations.",
        ),
        p(
          "Responsable del tratamiento de tus datos: Center Quest, con domicilio en Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, República Dominicana. Puedes contactarnos en services@ccquest.do o al (829) 734-7450.",
          "Data controller: Center Quest, located at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic. You can reach us at services@ccquest.do or (829) 734-7450.",
        ),
      ],
    },
    {
      id: "data-we-collect",
      heading: { es: "Qué datos recopilamos", en: "What data we collect" },
      blocks: [
        p(
          "Recopilamos datos personales únicamente cuando nos los proporcionas directamente, principalmente a través del formulario de cotización en /quote:",
          "We collect personal data only when you provide it to us directly, mainly through the quote form at /quote:",
        ),
        list(
          [
            "Datos de contacto: nombre completo, empresa, correo electrónico laboral y teléfono/WhatsApp.",
            "El canal de contacto que prefieres (correo, teléfono o WhatsApp).",
            "Información sobre la operación que quieres cotizar — las preguntas varían según el servicio elegido (Call Center, BPO o Desarrollo de Sistemas): por ejemplo, volumen estimado de interacciones, canales que manejas hoy, o el tipo de sistema que necesitas.",
          ],
          [
            "Contact details: full name, company, work email and phone/WhatsApp number.",
            "Your preferred contact channel (email, phone or WhatsApp).",
            "Information about the operation you want a quote for — the questions vary by the service you choose (Call Center, BPO or Systems Development): for example, estimated interaction volume, the channels you currently run, or the kind of system you need.",
          ],
        ),
        p(
          "Si nos escribes directamente por correo, WhatsApp o teléfono, también tratamos los datos que decidas compartirnos en esa conversación.",
          "If you write to us directly by email, WhatsApp or phone, we also process whatever data you choose to share in that conversation.",
        ),
        p(
          "Adicionalmente, el sitio recopila datos de uso de forma automática y agregada a través de Google Analytics (cuando está activo) y aplica medidas anti-spam en el formulario de cotización — ver la sección de Cookies más abajo.",
          "Additionally, the site automatically collects aggregated usage data through Google Analytics (when enabled) and applies anti-spam measures on the quote form — see the Cookies section below.",
        ),
      ],
    },
    {
      id: "how-we-use-it",
      heading: { es: "Cómo usamos tus datos", en: "How we use your data" },
      blocks: [
        p(
          "Usamos los datos del formulario de cotización con un único fin: entender tu solicitud y responderte con una propuesta u orientación sobre el servicio que te interesa. Un miembro de nuestro equipo comercial recibe tu solicitud por correo y te contacta por el canal que indicaste.",
          "We use quote-form data for a single purpose: understanding your request and responding with a proposal or guidance on the service you're interested in. A member of our sales team receives your request by email and contacts you through the channel you indicated.",
        ),
        p(
          "No usamos tus datos para fines distintos a los descritos aquí, y no los utilizamos para publicidad dirigida ni los vendemos ni alquilamos a terceros.",
          "We do not use your data for purposes other than those described here, and we do not use it for targeted advertising, nor do we sell or rent it to third parties.",
        ),
        p(
          "Los datos agregados de uso del sitio (Analytics) se usan únicamente para entender qué páginas se visitan y mejorar el sitio — no identifican a una persona individualmente.",
          "Aggregated site-usage data (Analytics) is used solely to understand which pages are visited and to improve the site — it does not identify an individual person.",
        ),
      ],
    },
    {
      id: "who-we-share-it-with",
      heading: { es: "Con quién compartimos tus datos", en: "Who we share your data with" },
      blocks: [
        p(
          "No compartimos tus datos personales con terceros para que los usen con sus propios fines. Sí trabajamos con un número reducido de proveedores que nos ayudan a operar el sitio y procesar tu solicitud, actuando bajo nuestras instrucciones:",
          "We do not share your personal data with third parties for their own purposes. We do work with a small number of providers that help us run the site and process your request, acting under our instructions:",
        ),
        list(
          [
            "Resend — el servicio que usamos para enviar el correo con tu solicitud de cotización a nuestro equipo comercial.",
            "Google reCAPTCHA — protege el formulario de cotización contra envíos automatizados (bots).",
            "Google Analytics — cuando está activo, mide de forma agregada el uso del sitio.",
          ],
          [
            "Resend — the service we use to email your quote request to our sales team.",
            "Google reCAPTCHA — protects the quote form against automated (bot) submissions.",
            "Google Analytics — when enabled, measures aggregated site usage.",
          ],
        ),
        p(
          "Estos proveedores procesan datos según sus propias políticas de privacidad y pueden operar servidores fuera de República Dominicana. Solo divulgamos datos personales adicionales si la ley nos lo exige.",
          "These providers process data under their own privacy policies and may operate servers outside the Dominican Republic. We only disclose additional personal data if required by law.",
        ),
      ],
    },
    {
      id: "cookies",
      heading: { es: "Cookies", en: "Cookies" },
      blocks: [
        p("Este sitio usa un número reducido de cookies:", "This site uses a small number of cookies:"),
        list(
          [
            "NEXT_LOCALE — técnica/necesaria. Recuerda si visitaste el sitio en español o inglés, para no preguntarte cada vez. Dura un año.",
            "Cookies de Google Analytics (_ga y similares) — solo si está activo. Miden el uso agregado del sitio. Puedes rechazarlas desde la configuración de tu navegador sin afectar la navegación.",
            "Cookies de Google reCAPTCHA — solo mientras estás en la página de cotización (/quote). Ayudan a distinguir a una persona real de un bot.",
          ],
          [
            "NEXT_LOCALE — technical/necessary. Remembers whether you're browsing in Spanish or English, so we don't ask every time. Lasts one year.",
            "Google Analytics cookies (_ga and similar) — only when enabled. Measure aggregated site usage. You can decline them from your browser settings without affecting navigation.",
            "Google reCAPTCHA cookies — only while you're on the quote page (/quote). Help tell a real person from a bot.",
          ],
        ),
        p(
          "Puedes bloquear o borrar cookies desde la configuración de tu navegador en cualquier momento; el sitio seguirá funcionando, aunque el idioma podría no recordarse entre visitas.",
          "You can block or delete cookies from your browser settings at any time; the site will keep working, though your language choice may not be remembered between visits.",
        ),
      ],
    },
    {
      id: "retention",
      heading: { es: "Cuánto tiempo conservamos tus datos", en: "How long we keep your data" },
      blocks: [
        p(
          "Conservamos los datos de tu solicitud de cotización durante el tiempo necesario para darle seguimiento comercial y, mientras dure, gestionar la relación contigo. Si no se concreta ningún servicio, conservamos el registro del correo por un periodo razonable con fines de historial comercial y luego lo eliminamos.",
          "We keep your quote-request data for as long as needed to follow up commercially and, for as long as it lasts, manage our relationship with you. If no engagement follows, we keep the email record for a reasonable period for commercial-history purposes and then delete it.",
        ),
        p(
          "Los datos agregados de Analytics se conservan según la retención estándar de Google Analytics.",
          "Aggregated Analytics data is kept per Google Analytics' standard retention.",
        ),
      ],
    },
    {
      id: "your-rights",
      heading: { es: "Tus derechos", en: "Your rights" },
      blocks: [
        p(
          "De acuerdo con la Ley No. 172-13 sobre Protección de Datos de Carácter Personal de la República Dominicana, tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales, así como a oponerte a su tratamiento.",
          "Under the Dominican Republic's Law No. 172-13 on the Protection of Personal Data, you have the right to access, correct, or request the deletion of your personal data, as well as to object to its processing.",
        ),
        p(
          "Para ejercer cualquiera de estos derechos, escríbenos a services@ccquest.do indicando tu solicitud; te responderemos en un plazo razonable.",
          "To exercise any of these rights, write to us at services@ccquest.do stating your request; we will respond within a reasonable time.",
        ),
      ],
    },
    {
      id: "security",
      heading: { es: "Seguridad", en: "Security" },
      blocks: [
        p(
          "El sitio se sirve por conexión cifrada (HTTPS/SSL) y el formulario de cotización valida y verifica los datos también del lado del servidor antes de procesarlos. Aplicamos medidas razonables para proteger tus datos, aunque ningún sistema es completamente infalible.",
          "The site is served over an encrypted connection (HTTPS/SSL) and the quote form validates and re-checks data server-side before processing it. We apply reasonable measures to protect your data, though no system is completely infallible.",
        ),
      ],
    },
    {
      id: "minors",
      heading: { es: "Menores de edad", en: "Minors" },
      blocks: [
        p(
          "Este sitio está dirigido a empresas y profesionales interesados en nuestros servicios. No solicitamos ni recopilamos a sabiendas datos de menores de edad.",
          "This site is directed at businesses and professionals interested in our services. We do not knowingly request or collect data from minors.",
        ),
      ],
    },
    {
      id: "changes",
      heading: { es: "Cambios a esta política", en: "Changes to this policy" },
      blocks: [
        p(
          "Podemos actualizar esta política cuando cambien nuestras prácticas o la normativa aplicable. La fecha al inicio de esta página indica la última actualización; si el cambio es significativo, lo indicaremos de forma visible en el sitio.",
          "We may update this policy as our practices or applicable regulations change. The date at the top of this page shows the last update; if a change is significant, we will note it visibly on the site.",
        ),
      ],
    },
    {
      id: "contact",
      heading: { es: "Contacto", en: "Contact" },
      blocks: [
        p(
          "¿Preguntas sobre esta política o sobre tus datos? Escríbenos a services@ccquest.do, llámanos al (829) 734-7450, o visítanos en Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, República Dominicana.",
          "Questions about this policy or your data? Write to us at services@ccquest.do, call us at (829) 734-7450, or visit us at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic.",
        ),
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: { es: "Términos y Condiciones", en: "Terms and Conditions" },
  updated: UPDATED,
  intro: {
    es: "Estos términos rigen el uso de este sitio web, operado por Center Quest. Al navegarlo o al enviar el formulario de cotización, aceptas lo siguiente.",
    en: "These terms govern the use of this website, operated by Center Quest. By browsing it or submitting the quote form, you agree to the following.",
  },
  sections: [
    {
      id: "acceptance",
      heading: { es: "Aceptación de los términos", en: "Acceptance of these terms" },
      blocks: [
        p(
          "Al acceder o usar este sitio (\"el sitio\") aceptas estos Términos y Condiciones junto con nuestra Política de Privacidad. Si no estás de acuerdo, te pedimos no usar el sitio.",
          "By accessing or using this site (\"the site\") you agree to these Terms and Conditions together with our Privacy Policy. If you do not agree, please do not use the site.",
        ),
      ],
    },
    {
      id: "who-we-are",
      heading: { es: "Quiénes somos", en: "Who we are" },
      blocks: [
        p(
          "Center Quest es un aliado de operaciones con tres líneas de negocio: Call Center, BPO (Business Process Outsourcing) y Desarrollo de Sistemas para operaciones, con domicilio en Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, República Dominicana.",
          "Center Quest is an operations partner built around three business lines: Call Center, BPO (Business Process Outsourcing) and Systems Development for operations, located at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic.",
        ),
      ],
    },
    {
      id: "site-use",
      heading: { es: "Uso del sitio", en: "Use of the site" },
      blocks: [
        p(
          "El sitio tiene fines informativos y comerciales: presentar nuestros servicios, mostrar evidencia de nuestro trabajo y permitir que solicites una cotización o nos contactes. Te comprometes a usarlo de forma lícita, sin intentar vulnerar su seguridad, interferir con su funcionamiento, ni extraer su contenido de forma automatizada sin nuestro consentimiento.",
          "The site exists for informational and commercial purposes: presenting our services, showing evidence of our work, and letting you request a quote or contact us. You agree to use it lawfully, without attempting to breach its security, interfere with its operation, or scrape its content in an automated way without our consent.",
        ),
      ],
    },
    {
      id: "quote-requests",
      heading: { es: "Solicitudes de cotización", en: "Quote requests" },
      blocks: [
        p(
          "El formulario de cotización (/quote) es una solicitud de información, no un contrato vinculante ni una orden de servicio. Al enviarlo, confirmas que los datos proporcionados son correctos y autorizas a que un asesor de Center Quest te contacte por el canal indicado, conforme a nuestra Política de Privacidad.",
          "The quote form (/quote) is a request for information, not a binding contract or a service order. By submitting it, you confirm the data provided is accurate and authorize a Center Quest advisor to contact you through the channel indicated, in accordance with our Privacy Policy.",
        ),
        p(
          "Cualquier acuerdo de servicio, alcance, tarifas y condiciones específicas se formaliza por separado, en un contrato o propuesta firmada entre las partes — este sitio no sustituye ese proceso.",
          "Any service agreement, scope, pricing and specific conditions are formalized separately, in a contract or signed proposal between the parties — this site does not replace that process.",
        ),
        p(
          "El formulario incluye validaciones anti-spam (incluyendo Google reCAPTCHA); nos reservamos el derecho de no procesar envíos que consideremos fraudulentos, automatizados o de mala fe.",
          "The form includes anti-spam checks (including Google reCAPTCHA); we reserve the right not to process submissions we consider fraudulent, automated, or made in bad faith.",
        ),
      ],
    },
    {
      id: "intellectual-property",
      heading: { es: "Propiedad intelectual", en: "Intellectual property" },
      blocks: [
        p(
          "El nombre Center Quest, su logotipo, los textos, imágenes, diseño y demás contenido del sitio son propiedad de Center Quest o de sus respectivos titulares y están protegidos por las leyes de propiedad intelectual aplicables. No puedes reproducir, distribuir o usar este contenido con fines comerciales sin nuestra autorización previa por escrito.",
          "The Center Quest name, its logo, texts, images, design and other site content are the property of Center Quest or their respective owners and are protected under applicable intellectual property law. You may not reproduce, distribute, or use this content for commercial purposes without our prior written authorization.",
        ),
      ],
    },
    {
      id: "third-party-links",
      heading: { es: "Enlaces a terceros", en: "Third-party links" },
      blocks: [
        p(
          "El sitio puede incluir enlaces a canales de terceros —por ejemplo WhatsApp, correo o redes sociales— para facilitar el contacto. No controlamos ni somos responsables por el contenido o las prácticas de privacidad de esos servicios externos, que se rigen por sus propios términos.",
          "The site may include links to third-party channels — for example WhatsApp, email, or social media — to make it easier to reach us. We do not control and are not responsible for the content or privacy practices of those external services, which are governed by their own terms.",
        ),
      ],
    },
    {
      id: "availability",
      heading: { es: "Disponibilidad del sitio", en: "Site availability" },
      blocks: [
        p(
          "Nos esforzamos por mantener el sitio disponible y actualizado, pero no garantizamos que esté libre de interrupciones o errores en todo momento. Podemos modificar, suspender o descontinuar cualquier parte del sitio sin previo aviso.",
          "We work to keep the site available and up to date, but we do not guarantee it will be free of interruptions or errors at all times. We may modify, suspend, or discontinue any part of the site without prior notice.",
        ),
      ],
    },
    {
      id: "liability",
      heading: { es: "Limitación de responsabilidad", en: "Limitation of liability" },
      blocks: [
        p(
          "El contenido del sitio se ofrece \"tal cual\", con fines informativos. En la medida permitida por la ley, Center Quest no será responsable por daños indirectos, incidentales o derivados del uso o la imposibilidad de uso de este sitio.",
          "Site content is provided \"as is\", for informational purposes. To the extent permitted by law, Center Quest will not be liable for indirect, incidental, or consequential damages arising from the use of, or inability to use, this site.",
        ),
      ],
    },
    {
      id: "governing-law",
      heading: { es: "Legislación aplicable", en: "Governing law" },
      blocks: [
        p(
          "Estos Términos se rigen por las leyes de la República Dominicana. Cualquier disputa relacionada con el uso del sitio se someterá a los tribunales competentes de Santo Domingo, República Dominicana.",
          "These Terms are governed by the laws of the Dominican Republic. Any dispute related to the use of the site will be submitted to the competent courts of Santo Domingo, Dominican Republic.",
        ),
      ],
    },
    {
      id: "changes",
      heading: { es: "Modificaciones", en: "Changes to these terms" },
      blocks: [
        p(
          "Podemos actualizar estos Términos cuando cambien nuestros servicios o la normativa aplicable. La fecha al inicio de esta página indica la última actualización; el uso continuado del sitio después de un cambio implica su aceptación.",
          "We may update these Terms as our services or applicable regulations change. The date at the top of this page shows the last update; continued use of the site after a change constitutes acceptance of it.",
        ),
      ],
    },
    {
      id: "contact",
      heading: { es: "Contacto", en: "Contact" },
      blocks: [
        p(
          "¿Preguntas sobre estos Términos? Escríbenos a services@ccquest.do, llámanos al (829) 734-7450, o visítanos en Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, República Dominicana.",
          "Questions about these Terms? Write to us at services@ccquest.do, call us at (829) 734-7450, or visit us at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic.",
        ),
      ],
    },
  ],
};
