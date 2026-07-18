import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "BPO | Center Quest",
  description:
    "Business Process Outsourcing: back office, data processing, and omnichannel support run accurately at volume under clear SLAs.",
};

const SERVICES = [
  {
    title: "Back office",
    description: "The repeatable work that keeps an operation moving.",
  },
  {
    title: "Data processing",
    description: "Information handled accurately and consistently at scale.",
  },
  {
    title: "Omnichannel support",
    description: "Support coordinated across your operational channels.",
  },
];

export default function BpoPage() {
  return (
    <section className="mx-auto w-full max-w-[64rem] px-5 py-16 sm:px-8 lg:py-24">
      <p className="text-sm font-semibold text-petroleo">Business line</p>
      <h1 className="mt-2 font-heading text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground text-balance">
        BPO
      </h1>
      <p className="mt-4 max-w-[60ch] text-base leading-7 text-muted">
        The repeatable work behind an operation: back office, data processing,
        and omnichannel support, run accurately at volume under clear SLAs.
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
        href="/#services"
        className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-petroleo"
      >
        ← Back to services
      </Link>
    </section>
  );
}
