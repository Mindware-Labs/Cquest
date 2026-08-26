export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: readonly string[] };

export type LegalSection = {
  id: string;
  heading: string;
  blocks: readonly LegalBlock[];
};

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
};

const p = (text: string): LegalBlock => ({ type: "p", text });
const list = (items: readonly string[]): LegalBlock => ({ type: "list", items });

const UPDATED = "August 8, 2026";
/* Mismo dato que UPDATED, en ISO 8601: es lo que consume dateModified en el
   JSON-LD de cada page.tsx. Una sola fuente para las dos representaciones. */
export const UPDATED_ISO = "2026-08-08";

export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  updated: UPDATED,
  intro:
    "At Center Quest we handle the personal data you share with us — when requesting a quote or writing to us — with the same care we bring to our clients' operations. This policy explains what data this site collects, how we use it, who we share it with, and how you can exercise your rights over it.",
  sections: [
    {
      id: "who",
      heading: "Who we are",
      blocks: [
        p(
          "Center Quest is an operations partner built around three business lines: Call Center, BPO (Business Process Outsourcing) and Systems Development for operations.",
        ),
        p(
          "Data controller: Center Quest, located at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic. You can reach us at services@ccquest.do or (829) 734-7450.",
        ),
      ],
    },
    {
      id: "data-we-collect",
      heading: "What data we collect",
      blocks: [
        p(
          "We collect personal data only when you provide it to us directly, mainly through the quote form at /quote:",
        ),
        list([
          "Contact details: full name, company, work email and phone/WhatsApp number.",
          "Your preferred contact channel (email, phone or WhatsApp).",
          "Information about the operation you want a quote for — the questions vary by the service you choose (Call Center, BPO or Systems Development): for example, estimated interaction volume, the channels you currently run, or the kind of system you need.",
        ]),
        p(
          "If you write to us directly by email, WhatsApp or phone, we also process whatever data you choose to share in that conversation.",
        ),
        p(
          "Additionally, the site automatically collects aggregated usage data through Google Analytics (when enabled) and applies anti-spam measures on the quote form — see the Cookies section below.",
        ),
      ],
    },
    {
      id: "how-we-use-it",
      heading: "How we use your data",
      blocks: [
        p(
          "We use quote-form data for a single purpose: understanding your request and responding with a proposal or guidance on the service you're interested in. A member of our sales team receives your request by email and contacts you through the channel you indicated.",
        ),
        p(
          "We do not use your data for purposes other than those described here, and we do not use it for targeted advertising, nor do we sell or rent it to third parties.",
        ),
        p(
          "Aggregated site-usage data (Analytics) is used solely to understand which pages are visited and to improve the site — it does not identify an individual person.",
        ),
      ],
    },
    {
      id: "who-we-share-it-with",
      heading: "Who we share your data with",
      blocks: [
        p(
          "We do not share your personal data with third parties for their own purposes. We do work with a small number of providers that help us run the site and process your request, acting under our instructions:",
        ),
        list([
          "Resend — the service we use to email your quote request to our sales team.",
          "Google reCAPTCHA — protects the quote form against automated (bot) submissions.",
          "Google Analytics — when enabled, measures aggregated site usage.",
        ]),
        p(
          "These providers process data under their own privacy policies and may operate servers outside the Dominican Republic. We only disclose additional personal data if required by law.",
        ),
      ],
    },
    {
      id: "cookies",
      heading: "Cookies",
      blocks: [
        p("This site uses a small number of cookies:"),
        list([
          "Google Analytics cookies (_ga and similar) — only when enabled. Measure aggregated site usage. You can decline them from your browser settings without affecting navigation.",
          "Google reCAPTCHA cookies — only while you're on the quote page (/quote). Help tell a real person from a bot.",
        ]),
        p(
          "You can block or delete cookies from your browser settings at any time; the site will keep working.",
        ),
      ],
    },
    {
      id: "retention",
      heading: "How long we keep your data",
      blocks: [
        p(
          "We keep your quote-request data for as long as needed to follow up commercially and, for as long as it lasts, manage our relationship with you. If no engagement follows, we keep the email record for a reasonable period for commercial-history purposes and then delete it.",
        ),
        p("Aggregated Analytics data is kept per Google Analytics' standard retention."),
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      blocks: [
        p(
          "Under the Dominican Republic's Law No. 172-13 on the Protection of Personal Data, you have the right to access, correct, or request the deletion of your personal data, as well as to object to its processing.",
        ),
        p(
          "To exercise any of these rights, write to us at services@ccquest.do stating your request; we will respond within a reasonable time.",
        ),
      ],
    },
    {
      id: "security",
      heading: "Security",
      blocks: [
        p(
          "The site is served over an encrypted connection (HTTPS/SSL) and the quote form validates and re-checks data server-side before processing it. We apply reasonable measures to protect your data, though no system is completely infallible.",
        ),
      ],
    },
    {
      id: "minors",
      heading: "Minors",
      blocks: [
        p(
          "This site is directed at businesses and professionals interested in our services. We do not knowingly request or collect data from minors.",
        ),
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      blocks: [
        p(
          "We may update this policy as our practices or applicable regulations change. The date at the top of this page shows the last update; if a change is significant, we will note it visibly on the site.",
        ),
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [
        p(
          "Questions about this policy or your data? Write to us at services@ccquest.do, call us at (829) 734-7450, or visit us at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic.",
        ),
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: "Terms and Conditions",
  updated: UPDATED,
  intro:
    "These terms govern the use of this website, operated by Center Quest. By browsing it or submitting the quote form, you agree to the following.",
  sections: [
    {
      id: "acceptance",
      heading: "Acceptance of these terms",
      blocks: [
        p(
          'By accessing or using this site ("the site") you agree to these Terms and Conditions together with our Privacy Policy. If you do not agree, please do not use the site.',
        ),
      ],
    },
    {
      id: "who-we-are",
      heading: "Who we are",
      blocks: [
        p(
          "Center Quest is an operations partner built around three business lines: Call Center, BPO (Business Process Outsourcing) and Systems Development for operations, located at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic.",
        ),
      ],
    },
    {
      id: "site-use",
      heading: "Use of the site",
      blocks: [
        p(
          "The site exists for informational and commercial purposes: presenting our services, showing evidence of our work, and letting you request a quote or contact us. You agree to use it lawfully, without attempting to breach its security, interfere with its operation, or scrape its content in an automated way without our consent.",
        ),
      ],
    },
    {
      id: "quote-requests",
      heading: "Quote requests",
      blocks: [
        p(
          "The quote form (/quote) is a request for information, not a binding contract or a service order. By submitting it, you confirm the data provided is accurate and authorize a Center Quest advisor to contact you through the channel indicated, in accordance with our Privacy Policy.",
        ),
        p(
          "Any service agreement, scope, pricing and specific conditions are formalized separately, in a contract or signed proposal between the parties — this site does not replace that process.",
        ),
        p(
          "The form includes anti-spam checks (including Google reCAPTCHA); we reserve the right not to process submissions we consider fraudulent, automated, or made in bad faith.",
        ),
      ],
    },
    {
      id: "intellectual-property",
      heading: "Intellectual property",
      blocks: [
        p(
          "The Center Quest name, its logo, texts, images, design and other site content are the property of Center Quest or their respective owners and are protected under applicable intellectual property law. You may not reproduce, distribute, or use this content for commercial purposes without our prior written authorization.",
        ),
      ],
    },
    {
      id: "third-party-links",
      heading: "Third-party links",
      blocks: [
        p(
          "The site may include links to third-party channels — for example WhatsApp, email, or social media — to make it easier to reach us. We do not control and are not responsible for the content or privacy practices of those external services, which are governed by their own terms.",
        ),
      ],
    },
    {
      id: "availability",
      heading: "Site availability",
      blocks: [
        p(
          "We work to keep the site available and up to date, but we do not guarantee it will be free of interruptions or errors at all times. We may modify, suspend, or discontinue any part of the site without prior notice.",
        ),
      ],
    },
    {
      id: "liability",
      heading: "Limitation of liability",
      blocks: [
        p(
          'Site content is provided "as is", for informational purposes. To the extent permitted by law, Center Quest will not be liable for indirect, incidental, or consequential damages arising from the use of, or inability to use, this site.',
        ),
      ],
    },
    {
      id: "governing-law",
      heading: "Governing law",
      blocks: [
        p(
          "These Terms are governed by the laws of the Dominican Republic. Any dispute related to the use of the site will be submitted to the competent courts of Santo Domingo, Dominican Republic.",
        ),
      ],
    },
    {
      id: "changes",
      heading: "Changes to these terms",
      blocks: [
        p(
          "We may update these Terms as our services or applicable regulations change. The date at the top of this page shows the last update; continued use of the site after a change constitutes acceptance of it.",
        ),
      ],
    },
    {
      id: "contact",
      heading: "Contact",
      blocks: [
        p(
          "Questions about these Terms? Write to us at services@ccquest.do, call us at (829) 734-7450, or visit us at Paseo de los Periodistas #03, Ens. Miraflores, Santo Domingo, Dominican Republic.",
        ),
      ],
    },
  ],
};
