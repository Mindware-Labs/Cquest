import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Call Center | Center Quest",
  description:
    "Inbound and outbound contact-center operations: customer service, sales, collections, surveys and onboarding.",
};

const SERVICES = [
  {
    title: "Customer service",
    description: "Inbound support across phone, email, chat and social.",
  },
  {
    title: "Sales",
    description: "Outbound campaigns, telesales, and lead generation & closing.",
  },
  {
    title: "Collections",
    description: "Portfolio recovery and collections with professional, compliant protocols.",
  },
  {
    title: "Surveys",
    description: "Satisfaction studies, market polls and NPS measurement.",
  },
  {
    title: "Onboarding",
    description: "Welcome, activation and early follow-up for the client's new customers.",
  },
];

export default function CallCenterPage() {
  return (
    <section className="mx-auto w-full max-w-[64rem] px-5 py-16 sm:px-8 lg:py-24">
      <p className="text-sm font-semibold text-petroleo">Business line</p>
      <h1 className="mt-2 font-heading text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground text-balance">
        Call Center
      </h1>
      <p className="mt-4 max-w-[60ch] text-base leading-7 text-muted">
        Inbound and outbound contact-center operations, presented as individual
        services — each designed around the moments that matter to your
        customers.
      </p>

      <ul className="mt-10 max-w-[44rem]">
        {SERVICES.map((service) => (
          <li
            key={service.title}
            className="border-b border-foreground/10 py-5 first:border-t"
          >
            <h2 className="text-[1.05rem] font-semibold text-foreground">{service.title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted">{service.description}</p>
          </li>
        ))}
      </ul>

      <Link
        href="/servicios"
        className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-petroleo"
      >
        ← Back to services
      </Link>
    </section>
  );
}
