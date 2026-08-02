"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/* ── Antigravity field ────────────────────────────────────
   Adapted from the React Bits component (reactbits.dev). The simulation idea
   is theirs — particles swing onto a rippling ring around an attractor — but
   what it is attracted to, and what shape it forms, changed:

     • The ring is PINNED (`followPointer={false}`) rather than centred on the
       cursor, so the field orbits the diagram it sits behind instead of
       chasing the pointer around it.
     • The ring is ELLIPTICAL. Upstream forms a circle, which cannot enclose
       an elliptical arrangement of nodes on a 16:10 stage — it would clear
       them vertically and cut straight through them horizontally. Separate
       x/y radii let the formation follow the same proportions the diagram's
       own ring uses. Omitting `ringRadiusY` gives back upstream's circle.
     • A share of the particles is MAGNETIC. Those break formation to orbit
       the pointer while it is over the stage and settle back when it leaves;
       the rest hold the ring, so the field reacts without dissolving.

   Everything else is host-side plumbing: TypeScript, the brand's celeste,
   an externally driven `frameloop`, and a canvas that takes no pointer events
   so the interactive diagram underneath keeps its own. */

export type ParticleShape = "capsule" | "sphere" | "box" | "tetrahedron";

interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;
  /** Vertical radius. Defaults to `ringRadius`, i.e. a circle. */
  ringRadiusY?: number;
  waveSpeed?: number;
  waveAmplitude?: number;
  particleSize?: number;
  lerpSpeed?: number;
  color?: string;
  autoAnimate?: boolean;
  particleVariance?: number;
  rotationSpeed?: number;
  depthFactor?: number;
  pulseSpeed?: number;
  particleShape?: ParticleShape;
  fieldStrength?: number;
  /**
   * Upstream centres the ring on the pointer. False pins it to the middle of
   * the canvas instead, so the formation orbits a fixed thing and a hover
   * cannot drag it away.
   */
  followPointer?: boolean;
  /** Fraction of particles that answer the pointer, 0–1. */
  pullShare?: number;
  /** How completely a magnetic particle abandons the ring, 0–1. */
  pullStrength?: number;
  /** World-unit reach of the pointer's influence. */
  pullRadius?: number;
  /** World-unit radius magnetic particles orbit the pointer at. */
  pullOrbit?: number;
  /** Element the pointer is tracked on, since the canvas itself is inert. */
  eventSource?: RefObject<HTMLElement | null>;
}

interface CanvasProps extends AntigravityProps {
  eventSource: RefObject<HTMLElement | null>;
  /** False parks the render loop entirely. */
  active: boolean;
  className?: string;
}

interface Particle {
  t: number;
  speed: number;
  mx: number;
  my: number;
  mz: number;
  cx: number;
  cy: number;
  cz: number;
  randomRadiusOffset: number;
  /** 0 holds formation; above that, how strongly the pointer can claim it. */
  magnetic: number;
}

function AntigravityInner({
  count = 300,
  magnetRadius = 60,
  ringRadius = 13,
  ringRadiusY,
  waveSpeed = 0.4,
  waveAmplitude = 1,
  particleSize = 1.2,
  lerpSpeed = 0.05,
  color = "#74c3d5",
  autoAnimate = true,
  particleVariance = 1,
  rotationSpeed = 0.05,
  depthFactor = 1,
  pulseSpeed = 3,
  particleShape = "capsule",
  fieldStrength = 3,
  followPointer = false,
  pullShare = 0.4,
  pullStrength = 0.85,
  pullRadius = 11,
  pullOrbit = 3,
  eventSource,
}: AntigravityProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const lastMouseMoveTime = useRef(0);
  const virtualMouse = useRef({ x: 0, y: 0 });

  /* Whether the pointer is over the stage at all, and the eased 0→1 that
     follows it. Ramping rather than switching is what makes the particles
     look drawn in and released instead of teleported. */
  const engaged = useRef(false);
  const pull = useRef(0);

  useEffect(() => {
    const el = eventSource?.current;
    if (!el) return;
    const enter = () => {
      engaged.current = true;
    };
    const leave = () => {
      engaged.current = false;
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, [eventSource]);

  /* Upstream seeds these in a `useMemo`, which runs during render — and
     `Math.random()` during render is exactly what React's purity rule
     forbids, because a re-render would silently reshuffle the whole field.
     Seeding happens on the first frame instead: `useFrame` is not render, so
     the randomness is legal there, and the reseed condition below reproduces
     the memo's old dependencies without the impurity. */
  const particlesRef = useRef<Particle[] | null>(null);
  const seedRef = useRef({ count: 0, width: 0, height: 0, share: -1 });

  const seed = (targetCount: number, width: number, height: number, share: number): Particle[] => {
    const temp: Particle[] = [];
    for (let i = 0; i < targetCount; i++) {
      const x = (Math.random() - 0.5) * width;
      const y = (Math.random() - 0.5) * height;
      const z = (Math.random() - 0.5) * 20;

      temp.push({
        t: Math.random() * 100,
        speed: 0.01 + Math.random() / 200,
        mx: x,
        my: y,
        mz: z,
        cx: x,
        cy: y,
        cz: z,
        randomRadiusOffset: (Math.random() - 0.5) * 2,
        // Assigned once, so the same particles answer the pointer every time.
        // A field where the responders are re-rolled per pass reads as noise.
        magnetic: Math.random() < share ? 0.55 + Math.random() * 0.45 : 0,
      });
    }
    return temp;
  };

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { viewport: v, pointer: m } = state;

    const width = Math.round(v.width) || 100;
    const height = Math.round(v.height) || 100;
    if (
      !particlesRef.current ||
      seedRef.current.count !== count ||
      seedRef.current.width !== width ||
      seedRef.current.height !== height ||
      seedRef.current.share !== pullShare
    ) {
      particlesRef.current = seed(count, width, height, pullShare);
      seedRef.current = { count, width, height, share: pullShare };
    }
    const particles = particlesRef.current;

    let targetX = 0;
    let targetY = 0;

    if (followPointer) {
      const mouseDist = Math.hypot(m.x - lastMousePos.current.x, m.y - lastMousePos.current.y);
      if (mouseDist > 0.001) {
        lastMouseMoveTime.current = Date.now();
        lastMousePos.current = { x: m.x, y: m.y };
      }

      let destX = (m.x * v.width) / 2;
      let destY = (m.y * v.height) / 2;

      if (autoAnimate && Date.now() - lastMouseMoveTime.current > 2000) {
        const time = state.clock.getElapsedTime();
        destX = Math.sin(time * 0.5) * (v.width / 4);
        destY = Math.cos(time * 0.5 * 2) * (v.height / 4);
      }

      const smoothFactor = 0.05;
      virtualMouse.current.x += (destX - virtualMouse.current.x) * smoothFactor;
      virtualMouse.current.y += (destY - virtualMouse.current.y) * smoothFactor;

      targetX = virtualMouse.current.x;
      targetY = virtualMouse.current.y;
    }
    // Pinned: (0, 0) is the centre of the canvas, which is the diagram's hub.

    // Where the pointer actually is, in world units, regardless of what the
    // formation is centred on.
    const pointerX = (m.x * v.width) / 2;
    const pointerY = (m.y * v.height) / 2;
    pull.current += ((engaged.current ? 1 : 0) - pull.current) * 0.07;
    const pullActive = pull.current > 0.002;

    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;
    const radiusY = ringRadiusY ?? ringRadius;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const { mx, my, mz, cz, randomRadiusOffset } = particle;
      const t = (particle.t += particle.speed / 2);

      const projectionFactor = 1 - cz / 50;
      const projectedTargetX = targetX * projectionFactor;
      const projectedTargetY = targetY * projectionFactor;

      const dx = mx - projectedTargetX;
      const dy = my - projectedTargetY;
      const dist = Math.hypot(dx, dy);

      const targetPos = { x: mx, y: my, z: mz * depthFactor };
      let lookX = projectedTargetX;
      let lookY = projectedTargetY;

      if (dist < magnetRadius) {
        const angle = Math.atan2(dy, dx) + globalRotation;
        const wave = Math.sin(t * waveSpeed + angle) * (0.5 * waveAmplitude);
        const deviation = randomRadiusOffset * (5 / (fieldStrength + 0.1));

        targetPos.x = projectedTargetX + (ringRadius + wave + deviation) * Math.cos(angle);
        targetPos.y = projectedTargetY + (radiusY + wave + deviation) * Math.sin(angle);
        targetPos.z = mz * depthFactor + Math.sin(t) * (waveAmplitude * depthFactor);
      }

      /* The magnet. Only the particles seeded magnetic answer, and only
         within `pullRadius` of the pointer — so what breaks away is a local
         cluster rather than the whole ring lurching sideways. They orbit the
         pointer instead of collapsing onto it, which keeps them legible as
         individual particles at the moment they are most looked at. */
      if (pullActive && particle.magnetic > 0) {
        const toPointer = Math.hypot(targetPos.x - pointerX, targetPos.y - pointerY);
        const falloff = Math.max(0, 1 - toPointer / pullRadius);
        const weight = pull.current * particle.magnetic * falloff * pullStrength;

        if (weight > 0.001) {
          const angle = Math.atan2(targetPos.y - pointerY, targetPos.x - pointerX);
          const orbitX = pointerX + Math.cos(angle) * pullOrbit;
          const orbitY = pointerY + Math.sin(angle) * pullOrbit;
          targetPos.x += (orbitX - targetPos.x) * weight;
          targetPos.y += (orbitY - targetPos.y) * weight;
          // Claimed particles face what claimed them.
          lookX += (pointerX - lookX) * weight;
          lookY += (pointerY - lookY) * weight;
        }
      }

      particle.cx += (targetPos.x - particle.cx) * lerpSpeed;
      particle.cy += (targetPos.y - particle.cy) * lerpSpeed;
      particle.cz += (targetPos.z - particle.cz) * lerpSpeed;

      dummy.position.set(particle.cx, particle.cy, particle.cz);
      dummy.lookAt(lookX, lookY, particle.cz);
      dummy.rotateX(Math.PI / 2);

      /* Upstream shrinks anything far from the ring to nothing, which is how
         it hides the particles the pointer never captured. With a pinned ring
         every particle is in formation by definition, and the ones the magnet
         pulls out of it are precisely the ones that must stay visible — so
         only the pulse modulates scale here. */
      const scaleFactor = followPointer
        ? Math.max(0, Math.min(1, 1 - Math.abs(Math.hypot(particle.cx - projectedTargetX, particle.cy - projectedTargetY) - ringRadius) / 10))
        : 1;
      const finalScale =
        scaleFactor * (0.8 + Math.sin(t * pulseSpeed) * 0.2 * particleVariance) * particleSize;

      dummy.scale.set(finalScale, finalScale, finalScale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {particleShape === "capsule" && <capsuleGeometry args={[0.1, 0.4, 4, 8]} />}
      {particleShape === "sphere" && <sphereGeometry args={[0.2, 16, 16]} />}
      {particleShape === "box" && <boxGeometry args={[0.3, 0.3, 0.3]} />}
      {particleShape === "tetrahedron" && <tetrahedronGeometry args={[0.3]} />}
      <meshBasicMaterial color={color} transparent opacity={0.85} />
    </instancedMesh>
  );
}

export default function Antigravity({ eventSource, active, className, ...props }: CanvasProps) {
  /* The className goes on a wrapper, not on <Canvas>. React Three Fiber
     writes its own inline style onto the element it renders — including
     `position: relative` and a 100% box — and an inline declaration beats
     anything a stylesheet says, so positioning applied through `className`
     is silently discarded. Sizing the wrapper instead leaves the canvas to
     fill it, which puts the box back under CSS control and lets the field
     take a different shape per breakpoint. */
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 35 }}
        // "never" does not merely skip drawing — it stops the whole rAF loop,
        // which is the entire point of gating this from outside.
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
        style={{ pointerEvents: "none" }}
      >
        <AntigravityInner {...props} eventSource={eventSource} />
      </Canvas>
    </div>
  );
}
