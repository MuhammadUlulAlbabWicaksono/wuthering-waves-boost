"use client";

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Patuhi preferensi OS pengguna (aksesibilitas/emil-design-eng)
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const l = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    
    setLenis(l);

    // Sinkronkan rAF Lenis dengan GSAP Ticker agar animasi dan scroll menyatu mulus
    function onRaf(time: number) {
      l.raf(time * 1000); 
    }

    gsap.ticker.add(onRaf);
    gsap.ticker.lagSmoothing(0); // Cegah frame jump saat pindah tab

    return () => {
      gsap.ticker.remove(onRaf);
      l.destroy();
    };
  }, []);

  return <>{children}</>;
}
