"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { sceneState } from "@/lib/scene-state";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollDirector() {
  const init = useRef(false);

  useGSAP(() => {
    if (init.current) return;
    init.current = true;

    // Morph 0 -> 1: Saat masuk section Efisiensi
    ScrollTrigger.create({
      trigger: "#efisiensi",
      start: "top 80%",
      end: "top 20%",
      scrub: 1.5,
      animation: gsap.to(sceneState, {
        morph: 1,
        ease: "none",
      }),
    });

    // Morph 1 -> 2: Saat masuk section CTA
    ScrollTrigger.create({
      trigger: "#cta",
      start: "top 80%",
      end: "top 30%",
      scrub: 1.5,
      animation: gsap.to(sceneState, {
        morph: 2,
        ease: "none",
        immediateRender: false,
      }),
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  });

  return null;
}
