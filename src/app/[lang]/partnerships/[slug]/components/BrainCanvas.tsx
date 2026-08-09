"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { BrainModel } from "./BrainModel";

export default function BrainCanvas({ reduced, active }: { reduced: boolean; active: boolean }) {
  return (
    <Canvas
      /* 1.5 basta para una pieza de 22rem y ahorra ~44% de píxeles frente a 2. */
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 5], fov: 35, near: 0.01, far: 100 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      /* El bucle solo corre con el bloque en pantalla. Fuera de vista, o con
         movimiento reducido, se pinta un cuadro y se apaga. */
      frameloop={reduced || !active ? "demand" : "always"}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 3]} intensity={1.6} color="#FFFFFF" />
      {/* Contraluz morado de marca: es lo que da el borde de color a la silueta. */}
      <directionalLight position={[-4, 2, -3]} intensity={1.0} color="#AD74C3" />

      {/* Obligatorio: useGLTF suspende mientras baja el GLB. */}
      <Suspense fallback={null}>
        <BrainModel />
      </Suspense>
    </Canvas>
  );
}
