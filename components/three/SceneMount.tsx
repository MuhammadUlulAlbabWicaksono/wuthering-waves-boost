"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { PARTICLES } from "@/lib/scene-config";
import { ScrollDirector } from "@/components/motion/ScrollDirector";

// `ssr: false` hanya boleh dipakai di Client Component, makanya file ini "use client"
const SceneCanvas = dynamic(() => import("./SceneCanvas"), { ssr: false });

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneMount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !supportsWebGL()) return; // situs tetap normal, hanya tanpa 3D

    const weak = window.innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const start = () => setCount(weak ? PARTICLES.mobile : PARTICLES.desktop);

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 400); // Safari belum punya requestIdleCallback
    return () => clearTimeout(t);
  }, []);

  if (!count) return null;

  return (
    <>
      <ScrollDirector />
      <SceneCanvas count={count} />
    </>
  );
}
