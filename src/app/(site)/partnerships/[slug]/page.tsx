import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Arrow from "@/components/services/Arrow";
import container from "@/components/services/Container.module.css";
import { PARTNER_SLOTS } from "@/components/about/partnershipsData";
import { TransitionLink } from "@/components/TransitionLink";
import MindwareLabsProfile, { SOCIAL_LINKS } from "./components/MindwareLabsProfile";
import JsonLd from "@/components/JsonLd";
import { graph, breadcrumbNode, SITE_URL } from "@/lib/schema";
import styles from "./partnership.module.css";

const CUSTOM_PROFILES: Record<string, true> = {
  "mindware-labs": true,
};

const COPY = {
  status: "In development",
  note: "This partnership profile is being developed. Its final content will be added in a later phase.",
  back: "Back to partnerships",
};

const MINDWARE_META = {
  title: "Mindware Labs | Center Quest",
  description:
    "Mindware Labs is Center Quest's software engineering partner, building and maintaining the systems behind our operations.",
};

export function generateStaticParams() {
  return PARTNER_SLOTS.map((partner) => ({ slug: partner.slug }));
}

/* Solo para el perfil real (mindware-labs): un Organization con los datos
   que la página de verdad muestra (logo, redes, descripción) — nunca para
   los slots placeholder, que ya van robots:{index:false}. */
function mindwareLabsGraph() {
  const partner = PARTNER_SLOTS.find((entry) => entry.slug === "mindware-labs");
  if (!partner) return graph();

  const pageUrl = `${SITE_URL}/partnerships/mindware-labs`;
  return graph(
    {
      "@type": "Organization",
      "@id": `${pageUrl}#organization`,
      name: partner.name,
      url: pageUrl,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}${partner.logo.src}`,
        width: partner.logo.width,
        height: partner.logo.height,
      },
      email: SOCIAL_LINKS.email,
      sameAs: [SOCIAL_LINKS.instagram, SOCIAL_LINKS.linkedin],
      description: MINDWARE_META.description,
    },
    breadcrumbNode([
      { name: "Center Quest", path: "" },
      { name: partner.name, path: "/partnerships/mindware-labs" },
    ]),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const partner = PARTNER_SLOTS.find((entry) => entry.slug === slug);

  /* Sin esto la página hereda el `alternates` del layout, que apunta a la raíz:
     un perfil indexable declarándose canónico hacia la home es una invitación
     a que Google lo descarte y no lo indexe nunca. */
  const alternates = { canonical: `/partnerships/${slug}` };

  if (partner && CUSTOM_PROFILES[slug]) {
    return {
      title: MINDWARE_META.title,
      description: MINDWARE_META.description,
      alternates,
      openGraph: {
        title: MINDWARE_META.title,
        description: MINDWARE_META.description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: MINDWARE_META.title,
        description: MINDWARE_META.description,
      },
      robots: { index: true, follow: true },
    };
  }

  const title = partner ? `${partner.name} | Center Quest` : `Partnerships | Center Quest`;

  return {
    title,
    description: COPY.note,
    alternates,
    twitter: { card: "summary_large_image", title, description: COPY.note },
    robots: { index: false, follow: true },
  };
}

export default async function PartnershipPlaceholderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = PARTNER_SLOTS.find((entry) => entry.slug === slug);

  if (!partner) notFound();

  if (CUSTOM_PROFILES[slug]) {
    return (
      <>
        <JsonLd data={mindwareLabsGraph()} />
        <MindwareLabsProfile />
      </>
    );
  }

  return (
    <section className={styles.placeholderPage}>
      <div className={`${container.container} ${styles.inner}`}>
        <div className={styles.logoFrame}>
          <Image
            src={partner.logo.src}
            alt={`${partner.name} logo`}
            width={partner.logo.width}
            height={partner.logo.height}
            sizes="(max-width: 672px) 224px, 352px"
            className={styles.logoImage}
            preload
          />
        </div>

        <div className={styles.copy}>
          <h1>{partner.name}</h1>
          <span className={styles.status}>{COPY.status}</span>
          <p>{COPY.note}</p>
          <TransitionLink href="/#partnerships" className={styles.backLink}>
            {COPY.back}
            <Arrow />
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
