"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Props = { to: number; prefix?: string; suffix?: string; className?: string };

export function CountUp({ to, prefix = "", suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const state = { v: 0 };
      el.textContent = `${prefix}0${suffix}`; // kartu ada di bawah fold, jadi tidak terlihat berkedip
      gsap.to(state, {
        v: to,
        duration: 1.4,
        ease: "power2.out",
        snap: { v: 1 },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${state.v}${suffix}`;
        },
      });
    },
    { scope: ref },
  );

  // HTML server berisi nilai akhir, jadi tanpa JS pun angkanya benar
  return (
    <span ref={ref} className={className}>
      {prefix}
      {to}
      {suffix}
    </span>
  );
}
