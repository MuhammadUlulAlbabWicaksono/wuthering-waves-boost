import { Zap } from "lucide-react";
import PortfolioCarousel from "@/components/ui/PortfolioCarousel";

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-accent-blue/5 blur-3xl" />
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="relative z-10 flex flex-col items-center gap-6 px-4 py-24 text-center sm:px-8">
        <div className="glass-effect flex flex-col items-center gap-6 rounded-2xl px-8 py-12 sm:px-16 sm:py-16">
          {/* Icon */}
          <div className="animate-pulse-glow flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-cyan/10 text-accent-cyan">
            <Zap className="h-8 w-8" />
          </div>

          {/* Title */}
          <h1 className="text-glow text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
            Wuthering Waves
            <br />
            <span className="bg-gradient-to-r from-accent-cyan to-accent-blue bg-clip-text text-transparent">
              Boosting Service
            </span>
          </h1>

          {/* Divider */}
          <div className="divider-glow w-48" />

          {/* Status */}
          <div className="flex items-center gap-2 rounded-full border border-accent-cyan/20 bg-accent-cyan/5 px-4 py-2 text-sm font-mono text-accent-cyan">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-cyan" />
            </span>
            System Initialized
          </div>

          <p className="max-w-md text-text-secondary">
            Layanan boost akun Wuthering Waves profesional, cepat, dan terpercaya.
            Raih pencapaian tertinggi tanpa ribet.
          </p>
        </div>
      </section>

      {/* ========== PORTFOLIO CAROUSEL ========== */}
      <section className="relative z-10 w-full max-w-7xl px-4 pb-16 sm:px-8">
        <PortfolioCarousel />
      </section>

      {/* ========== CTA BUTTON ========== */}
      <section className="relative z-10 pb-24">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-8 py-3 text-sm font-semibold text-accent-cyan transition-colors hover:bg-accent-cyan/20 active:bg-accent-cyan/25"
        >
          Lihat Katalog Jasa
        </a>
      </section>
    </div>
  );
}
