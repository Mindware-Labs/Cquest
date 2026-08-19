import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { PARTNER_SLOTS } from "@/components/about/partnershipsData";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import type { Locale } from "@/i18n/config";
import MindwareLabsProfile, { SOCIAL_LINKS } from "./components/MindwareLabsProfile";
import JsonLd from "@/components/JsonLd";
import { graph, breadcrumbNode, SITE_URL } from "@/lib/schema";
import styles from "./partnership.module.css";

const CUSTOM_PROFILES: Record<string, true> = {
  "mindware-labs": true,
};

const COPY = {
  en: {
    status: "In development",
    note: "This partnership profile is being developed. Its final content will be added in a later phase.",
    back: "Back to partnerships",
  },
  es: {
    status: "En desarrollo",
    note: "Este perfil de alianza está en desarrollo. Su contenido final se incorporará en una fase posterior.",
    back: "Volver a partnerships",
  },
};

const MINDWARE_META = {
  en: {
    title: "Mindware Labs | Center Quest",
    description:
      "Mindware Labs is Center Quest's software engineering partner, building and maintaining the systems behind our operations.",
  },
  es: {
    title: "Mindware Labs | Center Quest",
    description:
      "Mindware Labs es el aliado de ingeniería de software de Center Quest, y construye y mantiene los sistemas detrás de nuestras operaciones.",
  },
};

export function generateStaticParams() {
  return PARTNER_SLOTS.map((partner) => ({ slug: partner.slug }));
}

/* Solo para el perfil real (mindware-labs): un Organization con los datos
   que la página de verdad muestra (logo, redes, descripción) — nunca para
   los slots placeholder, que ya van robots:{index:false}. */
function mindwareLabsGraph(lang: Locale) {
  const partner = PARTNER_SLOTS.find((entry) => entry.slug === "mindware-labs");
  if (!partner) return graph();

  const pageUrl = `${SITE_URL}/${lang}/partnerships/mindware-labs`;
  return graph(
    {
      "@type": "Organization",
      "@id": `${pageUrl}#organization`,
      name: partner.name[lang],
      url: pageUrl,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${partner.logo.src}`,
        width: partner.logo.width,
        height: partner.logo.height,
      },
      email: SOCIAL_LINKS.email,
      sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.linkedin],
      description: MINDWARE_META[lang].description,
    },
    breadcrumbNode(lang, [
      { name: "Center Quest", path: "" },
      { name: partner.name[lang], path: "/partnerships/mindware-labs" },
    ]),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const lang = await resolveLang(params);
  const { slug } = await params;
  const partner = PARTNER_SLOTS.find((entry) => entry.slug === slug);

  /* Sin esto la página hereda el `alternates` del layout, que apunta a la raíz:
     un perfil indexable declarándose canónico hacia la home es una invitación
     a que Google lo descarte y no lo indexe nunca. */
  const alternates = localeAlternates(lang, `/partnerships/${slug}`);

  if (partner && CUSTOM_PROFILES[slug]) {
    return {
      title: MINDWARE_META[lang].title,
      description: MINDWARE_META[lang].description,
      alternates,
      openGraph: {
        title: MINDWARE_META[lang].title,
        description: MINDWARE_META[lang].description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: MINDWARE_META[lang].title,
        description: MINDWARE_META[lang].description,
      },
      robots: { index: true, follow: true },
    };
  }

  const title = partner ? `${partner.name[lang]} | Center Quest` : `Partnerships | Center Quest`;

  return {
    title,
    description: COPY[lang].note,
    alternates,
    twitter: { card: "summary_large_image", title, description: COPY[lang].note },
    robots: { index: false, follow: true },
  };
}

export default async function PartnershipPlaceholderPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const lang = await resolveLang(params);
  const { slug } = await params;
  const partner = PARTNER_SLOTS.find((entry) => entry.slug === slug);

  if (!partner) notFound();

  if (CUSTOM_PROFILES[slug]) {
    return (
      <>
        <JsonLd data={mindwareLabsGraph(lang)} />
        <MindwareLabsProfile />
      </>
    );
  }

  const t = COPY[lang];

  return (
    <section className={styles.placeholderPage}>
      <div className={`${container.container} ${styles.inner}`}>
        <div className={styles.logoFrame}>
          <Image
            src={partner.logo.src}
            alt={`${partner.name[lang]} logo`}
            width={partner.logo.width}
            height={partner.logo.height}
            sizes="(max-width: 672px) 224px, 352px"
            className={styles.logoImage}
            preload
          />
        </div>

        <div className={styles.copy}>
          <h1>{partner.name[lang]}</h1>
          <span className={styles.status}>{t.status}</span>
          <p>{t.note}</p>
          <LocalizedLink href="/#partnerships" className={styles.backLink}>
            {t.back}
            <Arrow />
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
