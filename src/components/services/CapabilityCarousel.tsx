import Link from "next/link";
import { useEffect, useState, type CSSProperties, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT_EXPO, EASE_OUT_QUART } from "./animation";
import { CAPABILITY_DWELL_MS, type Service } from "./data";
import ServiceIcon from "./ServiceIcon";

type CapabilityCarouselProps = {
  service: Service;
  ambient: boolean;
  reduced: boolean;
  selected: boolean;
};

export default function CapabilityCarousel({
  service,
  ambient,
  reduced,
  selected,
}: CapabilityCarouselProps) {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [userDriven, setUserDriven] = useState(false);
  const [previouslySelected, setPreviouslySelected] = useState(selected);

  if (selected !== previouslySelected) {
    setPreviouslySelected(selected);
    if (selected) {
      setActive(0);
      setUserDriven(false);
    }
  }

  const dwellRunning = ambient && !pinned && !reduced && !userDriven;

  useEffect(() => {
    if (!dwellRunning) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % service.details.length),
      CAPABILITY_DWELL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, dwellRunning, service.details.length]);

  return (
    <div
      className="cq-flow relative"
      onPointerEnter={(event) => event.pointerType === "mouse" && setPinned(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setPinned(false)}
    >
      <div
        className="cq-flow-stage"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${service.label} capabilities`}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={service.details[active].title}
            className="cq-flow-entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={
              reduced
                ? { opacity: 0, transition: { duration: 0.12 } }
                : {
                    opacity: 0,
                    y: -8,
                    filter: "blur(4px)",
                    transition: { duration: 0.25, ease: "easeIn" },
                  }
            }
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="cq-flow-body">
              <h3 className="cq-flow-title">
                <motion.span
                  className="cq-flow-title-inner"
                  initial={reduced ? false : { y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={
                    reduced
                      ? { duration: 0.15 }
                      : { duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.05 }
                  }
                >
                  {service.details[active].title}
                </motion.span>
              </h3>
              <motion.p
                className="cq-flow-desc"
                initial={reduced ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={
                  reduced
                    ? { duration: 0.15 }
                    : { duration: 0.5, ease: EASE_OUT_QUART, delay: 0.14 }
                }
              >
                {service.details[active].description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="cq-flow-foot">
        <div className="cq-flow-anchors">
          {service.details.map((detail, index) => (
            <button
              key={detail.title}
              type="button"
              className="cq-flow-anchor"
              style={{ "--ai": index } as CSSProperties}
              data-active={index === active ? "" : undefined}
              aria-label={`Show ${detail.title}`}
              aria-current={index === active}
              onClick={() => {
                setUserDriven(true);
                setActive(index);
              }}
            >
              {index === active && dwellRunning && <DwellIndicator active={active} />}
              <ServiceIcon name={detail.icon} />
              <span aria-hidden className="cq-flow-anchor-tip">{detail.title}</span>
            </button>
          ))}
        </div>
        <Link
          href={service.href}
          className="cq-panel-cta shrink-0"
          onPointerMove={(event) => moveCta(event, reduced)}
          onPointerLeave={(event) => resetCta(event)}
        >
          <span aria-hidden className="cq-panel-cta-sheen" />
          <span>
            Explore<span className="hidden sm:inline">&nbsp;{service.label}</span>
          </span>
          <span aria-hidden className="cq-panel-cta-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}

function DwellIndicator({ active }: { active: number }) {
  return (
    <motion.svg
      key={`dwell-${active}`}
      aria-hidden
      className="cq-flow-anchor-dwell"
      viewBox="0 0 40 40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.circle
        cx="20"
        cy="20"
        r="18.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        transform="rotate(-90 20 20)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: CAPABILITY_DWELL_MS / 1000, ease: "linear" }}
      />
    </motion.svg>
  );
}

function moveCta(event: PointerEvent<HTMLAnchorElement>, reduced: boolean) {
  if (reduced || event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - bounds.left - bounds.width / 2) * 0.14;
  const y = (event.clientY - bounds.top - bounds.height / 2) * 0.26;
  event.currentTarget.style.setProperty("--ctax", `${Math.max(-4, Math.min(4, x)).toFixed(1)}px`);
  event.currentTarget.style.setProperty("--ctay", `${Math.max(-3, Math.min(3, y)).toFixed(1)}px`);
}

function resetCta(event: PointerEvent<HTMLAnchorElement>) {
  event.currentTarget.style.setProperty("--ctax", "0px");
  event.currentTarget.style.setProperty("--ctay", "0px");
}
