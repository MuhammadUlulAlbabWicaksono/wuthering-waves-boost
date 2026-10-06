"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { ParticleField } from "./ParticleField";
import { sceneState } from "@/lib/scene-state";

export default function SceneCanvas({ count }: { count: number }) {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      sceneState.px = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.py = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.4, 7], fov: 50, near: 0.1, far: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      >
        <ParticleField count={count} />
      </Canvas>
    </div>
  );
}
