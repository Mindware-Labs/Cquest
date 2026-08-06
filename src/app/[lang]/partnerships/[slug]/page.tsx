import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { PARTNER_SLOTS } from "@/components/about/partnershipsData";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { resolveLang } from "@/i18n/resolveLangParam";
import styles from "./partnership.module.css";

const COPY = {
  en: {
    label: "Partnership profile",
    status: "In development",
    note: "This partnership profile is being developed. Its final content will be added in a later phase.",
    back: "Back to partnerships",
  },
  es: {
    label: "Perfil de alianza",
    status: "En desarrollo",
    note: "Este perfil de alianza está en desarrollo. Su contenido final se incorporará en una fase posterior.",
    back: "Volver a partnerships",
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

  const t = COPY[lang];

  return (
    <section className={styles.placeholderPage}>
      <div className={`${container.container} ${styles.inner}`}>
        <div className={styles.logoFrame} aria-label={t.label}>
          <span>Logo</span>
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
