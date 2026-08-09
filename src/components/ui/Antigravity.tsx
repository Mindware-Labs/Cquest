"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

export type ParticleShape = "capsule" | "sphere" | "box" | "tetrahedron";

interface AntigravityProps {
  count?: number;
  magnetRadius?: number;
  ringRadius?: number;

  ringRadiusY?: number;

  ringScale?: number;
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

  followPointer?: boolean;

  pullShare?: number;

  pullStrength?: number;

  pullRadius?: number;

  pullOrbit?: number;

  eventSource?: RefObject<HTMLElement | null>;
}

interface CanvasProps extends AntigravityProps {
  eventSource: RefObject<HTMLElement | null>;

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

  magnetic: number;
}

function AntigravityInner({
  count = 300,
  magnetRadius = 60,
  ringRadius = 13,
  ringRadiusY,
  ringScale,
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

  const engaged = useRef(false);
  const pull = useRef(0);
  const pointerNdc = useRef({ x: 0, y: 0 });
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const el = eventSource?.current;
    const canvas = gl?.domElement;
    if (!el || !canvas) return;

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerNdc.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.current.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      engaged.current = true;
    };
    const leave = () => {
      engaged.current = false;
    };

    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [eventSource, gl]);

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

        magnetic: Math.random() < share ? 0.55 + Math.random() * 0.45 : 0,
      });
    }
    return temp;
  };

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const { viewport: v } = state;
    const m = pointerNdc.current;

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

    const pointerX = (pointerNdc.current.x * v.width) / 2;
    const pointerY = (pointerNdc.current.y * v.height) / 2;
    pull.current += ((engaged.current ? 1 : 0) - pull.current) * 0.07;
    const pullActive = pull.current > 0.002;

    const globalRotation = state.clock.getElapsedTime() * rotationSpeed;

    const radiusX = ringScale != null ? (v.height / 2) * ringScale : ringRadius;
    const radiusY = ringScale != null ? radiusX : ringRadiusY ?? ringRadius;

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

        targetPos.x = projectedTargetX + (radiusX + wave + deviation) * Math.cos(angle);
        targetPos.y = projectedTargetY + (radiusY + wave + deviation) * Math.sin(angle);
        targetPos.z = mz * depthFactor + Math.sin(t) * (waveAmplitude * depthFactor);
      }

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

      const scaleFactor = followPointer
        ? Math.max(0, Math.min(1, 1 - Math.abs(Math.hypot(particle.cx - projectedTargetX, particle.cy - projectedTargetY) - radiusX) / 10))
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
  return (
    <div className={className} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 35 }}

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
