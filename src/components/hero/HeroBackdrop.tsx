import Image from "next/image";
import { motion, type MotionValue } from "motion/react";
import heroImage from "../../../public/hero-image.jpeg";
import heroImageMobile from "../../../public/hero-mobile.jpg";

type HeroBackdropProps = {
  imageY: MotionValue<number>;
  imageScale: MotionValue<number>;
};

export default function HeroBackdrop({ imageY, imageScale }: HeroBackdropProps) {
  return (
    <>
      <motion.div
        aria-hidden
        style={{ y: imageY, scale: imageScale }}
        className="absolute -inset-y-8 inset-x-0 will-change-transform"
      >
        {/* Both images share this box (CSS hidden/md:block toggles which one
            renders per breakpoint, not a conditional mount) — preload-ing
            both would fetch both at once. The fork's own docs flag this
            exact case and recommend fetchPriority over preload here. */}
        <Image
          src={heroImageMobile}
          alt=""
          fill
          fetchPriority="high"
          quality={82}
          placeholder="blur"
          sizes="100vw"
          className="block object-cover object-center md:hidden"
        />
        <Image
          src={heroImage}
          alt=""
          fill
          fetchPriority="high"
          quality={82}
          placeholder="blur"
          sizes="100vw"
          className="hidden object-cover object-[70%_center] md:block"
        />
      </motion.div>
      <div
        aria-hidden
        className="cq-hero-bloom absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in srgb, var(--ink) 90%, transparent) 0%, color-mix(in srgb, var(--ink) 78%, transparent) 20%, color-mix(in srgb, var(--ink) 50%, transparent) 38%, color-mix(in srgb, var(--ink) 20%, transparent) 54%, color-mix(in srgb, var(--ink) 6%, transparent) 66%, transparent 78%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--ink) 60%, transparent) 0%, transparent 24%, transparent 74%, color-mix(in srgb, var(--ink) 38%, transparent) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 42% 55% at 78% 42%, color-mix(in srgb, var(--brand-celeste) 12%, transparent) 0%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
}
