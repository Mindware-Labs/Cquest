import type { Locale } from "@/i18n/config";
import container from "@/components/services/Container.module.css";
import type { LegalDoc } from "./content";

/* Static, unanimated on purpose — unlike the rest of the site, a legal
   document is read, not performed: a visitor arriving here wants to find a
   clause fast, not watch it cascade in. `pt-32` alone clears the fixed
   Navbar (88px) with room to spare; these pages carry no hero, so unlike a
   service page there's nothing else to push the reader's eye down first. */
export default function LegalPage({ doc, lang }: { doc: LegalDoc; lang: Locale }) {
  const updatedLabel = lang === "es" ? "Última actualización" : "Last updated";

  return (
    <article className={`${container.container} pb-24 pt-32 sm:pt-36`}>
      <header className="max-w-[62ch]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-petroleo">
          Center Quest
        </p>
        <h1 className="mt-3 font-heading text-[clamp(2rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-foreground">
          {doc.title[lang]}
        </h1>
        <p className="mt-3 text-sm text-[var(--text-tertiary)]">
          {updatedLabel}: {doc.updated[lang]}
        </p>
        <p className="mt-6 text-pretty text-base leading-relaxed text-[var(--text-secondary)]">
          {doc.intro[lang]}
        </p>
      </header>

      <div className="mt-14 max-w-[62ch] space-y-12">
        {doc.sections.map((section, index) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="font-heading text-lg font-semibold tracking-[-0.01em] text-foreground sm:text-xl">
              {index + 1}. {section.heading[lang]}
            </h2>
            <div className="mt-4 space-y-4">
              {section.blocks.map((block, blockIndex) =>
                block.type === "p" ? (
                  <p
                    key={blockIndex}
                    className="text-pretty text-[0.95rem] leading-relaxed text-[var(--text-secondary)]"
                  >
                    {block.text[lang]}
                  </p>
                ) : (
                  <ul
                    key={blockIndex}
                    className="list-disc space-y-2 pl-5 text-[0.95rem] leading-relaxed text-[var(--text-secondary)] marker:text-petroleo/50"
                  >
                    {block.items[lang].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
