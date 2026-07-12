import Image from "next/image";
import Link from "next/link";

const DEMOS = [
  {
    href: "/hero-particles",
    name: "Hero — Partículas",
    description:
      "Fondo claro con partículas ambientales que reaccionan al mouse, badge en vivo y franja de sectores.",
    preview: "particles" as const,
  },
  {
    href: "/hero-image",
    name: "Hero — Fotografía",
    description:
      "Foto a pantalla completa con scrim cinematográfico, nav propio oscuro, métricas de confianza y tagline editorial.",
    preview: "photo" as const,
  },
  {
    href: "/hero-card",
    name: "Hero — Tarjeta",
    description:
      "Tarjeta blanca flotante sobre gradiente celeste-verde con blobs orgánicos, nav pill interno y foto arqueada.",
    preview: "card" as const,
  },
  {
    href: "/hero-dark",
    name: "Hero — Oscuro",
    description:
      "Tema oscuro con glows de marca, confetti flotante, chips de sectores y grid de servicios con iconos.",
    preview: "dark" as const,
  },
];

function ParticlesPreview() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-background"
      style={{
        backgroundImage:
          "radial-gradient(color-mix(in srgb, var(--brand-petroleo) 35%, transparent) 1.5px, transparent 1.5px)",
        backgroundSize: "26px 26px",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, var(--background) 30%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading text-center text-2xl font-bold leading-tight tracking-tight text-foreground">
          We power operations.
          <span className="block text-petroleo">You drive growth.</span>
        </span>
      </div>
    </div>
  );
}

function PhotoPreview() {
  return (
    <div aria-hidden className="absolute inset-0 bg-ink">
      <Image
        src="/hero-image.jpeg"
        alt=""
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover object-[70%_center]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--ink) 88%, transparent) 0%, color-mix(in srgb, var(--ink) 45%, transparent) 55%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 flex items-center px-8">
        <span className="font-heading max-w-[16ch] text-2xl font-extrabold uppercase leading-tight tracking-tight text-white">
          We power operations.
          <span className="block text-celeste">You drive growth.</span>
        </span>
      </div>
    </div>
  );
}

function CardPreview() {
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(135deg, var(--brand-celeste) 0%, color-mix(in srgb, var(--brand-celeste) 55%, var(--brand-verde)) 48%, color-mix(in srgb, var(--brand-verde) 82%, var(--brand-celeste)) 100%)",
      }}
    >
      {/* Blobs orgánicos en las esquinas */}
      <div
        className="absolute -left-6 -top-6 h-20 w-20"
        style={{
          borderRadius: "62% 38% 46% 54% / 55% 48% 52% 45%",
          background:
            "linear-gradient(160deg, color-mix(in srgb, var(--brand-verde) 55%, #f4f770), color-mix(in srgb, var(--brand-celeste) 70%, white))",
          opacity: 0.85,
        }}
      />
      <div
        className="absolute -bottom-8 -right-6 h-24 w-24"
        style={{
          borderRadius: "58% 42% 50% 50% / 52% 46% 54% 48%",
          background:
            "linear-gradient(250deg, color-mix(in srgb, var(--brand-celeste) 70%, white), color-mix(in srgb, var(--brand-verde) 60%, #eef56a))",
          opacity: 0.9,
        }}
      />
      {/* Mini tarjeta blanca */}
      <div className="absolute inset-x-8 bottom-0 top-8 rounded-t-2xl bg-white p-5 shadow-[0_20px_45px_-18px_color-mix(in_srgb,var(--brand-petroleo)_50%,transparent)]">
        <div className="flex gap-4">
          <div className="flex-1">
            <span className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-verde">
              Business Solutions
            </span>
            <span className="font-heading mt-1 block text-[0.9375rem] font-bold leading-snug tracking-tight text-foreground">
              Center Quest:{" "}
              <span className="text-petroleo">We power operations.</span>
            </span>
            <span className="mt-2 inline-block rounded-full bg-verde px-3 py-1 text-[0.5625rem] font-semibold text-white">
              See our services
            </span>
          </div>
          <div className="relative w-2/5 overflow-hidden rounded-lg rounded-t-[45%_30%]">
            <Image
              src="/hero-image.jpeg"
              alt=""
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DarkPreview() {
  return (
    <div aria-hidden className="absolute inset-0 bg-ink">
      {/* Glows de marca */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 75% 30%, color-mix(in srgb, var(--brand-celeste) 18%, transparent) 0%, transparent 70%), radial-gradient(ellipse 45% 50% at 12% 85%, color-mix(in srgb, var(--brand-verde) 12%, transparent) 0%, transparent 70%)",
        }}
      />
      {/* Confetti */}
      <span className="absolute left-[46%] top-[16%] h-1.5 w-1.5 rounded-full bg-verde" />
      <span className="absolute left-[58%] top-[68%] h-1 w-1 rounded-full bg-celeste" />
      <span className="absolute left-[38%] top-[46%] h-1 w-1 rounded-full bg-gris" />
      <div className="absolute inset-0 flex items-center gap-4 px-8">
        <div className="flex-1">
          <span className="text-[0.5rem] font-semibold uppercase tracking-[0.18em] text-celeste">
            Center Quest CQ
          </span>
          <span className="font-heading mt-1 block max-w-[14ch] text-xl font-bold leading-tight tracking-tight text-white">
            Top-Notch <span className="text-verde">Business Solutions</span>
          </span>
          <span className="mt-2 inline-block rounded-full bg-verde px-3 py-1 text-[0.5625rem] font-semibold text-ink">
            Schedule a Call
          </span>
        </div>
        <div className="relative h-[70%] w-2/5 overflow-hidden rounded-xl border border-white/10">
          <Image
            src="/hero-image.jpeg"
            alt=""
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

const PREVIEWS = {
  particles: ParticlesPreview,
  photo: PhotoPreview,
  card: CardPreview,
  dark: DarkPreview,
} as const;

export default function DemoSelectorPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16">
      <header className="text-center">
        <Image
          src="/logo.png"
          alt="Center Quest"
          width={412}
          height={304}
          priority
          className="mx-auto h-16 w-auto"
        />
        <h1 className="font-heading mt-6 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Demos de Hero
        </h1>
        <p className="mt-3 max-w-md text-pretty text-[1.0625rem] leading-relaxed text-muted">
          hay do
        </p>
        <p className="mt-3 max-w-md text-pretty text-[1.0625rem] leading-relaxed text-muted">
          hay cuatro, mmg
        </p>
      </header>

      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {DEMOS.map((demo) => {
          const Preview = PREVIEWS[demo.preview];
          return (
          <Link
            key={demo.href}
            href={demo.href}
            className="group overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-[0_1px_3px_rgba(15,32,40,0.06)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-petroleo/30 hover:shadow-[0_24px_50px_-24px_rgba(15,32,40,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-petroleo"
          >
            <div className="relative h-52 overflow-hidden">
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.03]">
                <Preview />
              </div>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-border p-6">
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {demo.name}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {demo.description}
                </p>
              </div>
              <span
                aria-hidden
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-foreground/60 transition-[background-color,color,border-color,transform] duration-300 group-hover:translate-x-0.5 group-hover:border-petroleo group-hover:bg-petroleo group-hover:text-white"
              >
                <svg
                  viewBox="0 0 16 16"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 3.5 10.5 8 6 12.5" />
                </svg>
              </span>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
