"use client";

import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import type { Group, Mesh } from "three";

const MODEL_URL = "/models/brain.glb";

/* Diámetro objetivo en unidades de mundo tras el auto-encaje. La cámara en z=5
   con fov 35 muestra ~3.15 unidades; 2.6 deja margen para modelos asimétricos. */
const TARGET_SIZE = 2.6;

function BrainModelInner() {
  const groupRef = useRef<Group>(null);
  /* El GLB va comprimido con meshopt (16.3 MB -> 2.1 MB); drei trae el decoder
     empaquetado. Draco off: su loader apunta a un CDN de Google que acá no hace
     falta. */
  const { scene } = useGLTF(MODEL_URL, false);

  const fitScale = useMemo(() => {
    scene.traverse((obj) => {
      const mesh = obj as Mesh;
      /* Sin esto el modelo desaparece en ciertos ángulos: al re-centrar, la
         caja de alguna submalla queda fuera del frustum. */
      if (mesh.isMesh) mesh.frustumCulled = false;
    });

    const bbox = new Box3().setFromObject(scene);
    const size = new Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return TARGET_SIZE / maxDim;
  }, [scene]);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    group.rotation.y = t * 0.08;
    group.position.y = Math.sin(t * 0.6) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <group scale={fitScale}>
        <Center>
          <primitive object={scene} />
        </Center>
      </group>
    </group>
  );
}

export const BrainModel = memo(BrainModelInner);

useGLTF.preload(MODEL_URL, false);
