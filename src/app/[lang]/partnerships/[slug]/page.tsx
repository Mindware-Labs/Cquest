import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { PARTNER_SLOTS } from "@/components/about/partnershipsData";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { resolveLang } from "@/i18n/resolveLangParam";
import MindwareLabsProfile from "./components/MindwareLabsProfile";
import styles from "./partnership.module.css";

// Mindware Labs is the one partner with a real profile so far; every other
// slug still falls through to the generic placeholder below. Special-cased
// here rather than split into its own static route so generateStaticParams/
// generateMetadata stay centralized for the whole [slug] segment.
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const lang = await resolveLang(params);
  const { slug } = await params;
  const partner = PARTNER_SLOTS.find((entry) => entry.slug === slug);

  if (partner && CUSTOM_PROFILES[slug]) {
    return {
      title: MINDWARE_META[lang].title,
      description: MINDWARE_META[lang].description,
      robots: { index: true, follow: true },
    };
  }

  const title = partner ? `${partner.name[lang]} | Center Quest` : `Partnerships | Center Quest`;

  return {
    title,
    description: COPY[lang].note,
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
    return <MindwareLabsProfile />;
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
            priority
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
