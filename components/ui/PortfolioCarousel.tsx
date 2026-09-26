"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PortfolioItem {
  title: string;
  description: string;
  gradient: string;
}

const portfolioData: PortfolioItem[] = [
  {
    title: "Endstate Matrix 58,000 Pts",
    description: "Penyelesaian efisien dengan rotasi tim presisi",
    gradient: "from-zinc-800 to-zinc-900",
  },
  {
    title: "Tower of Adversity 36/36 Stars",
    description: "Full clear sempurna di semua lantai tanpa retry",
    gradient: "from-zinc-800 via-zinc-850 to-zinc-900",
  },
  {
    title: "Tactical Hologram Difficulty 6",
    description: "Strategi optimal menggunakan karakter meta terkini",
    gradient: "from-zinc-900 to-zinc-800",
  },
  {
    title: "Illusive Realm 100% Clear",
    description: "Seluruh tantangan diselesaikan dengan skor maksimum",
    gradient: "from-zinc-800 to-zinc-900",
  },
];

export default function PortfolioCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstElementChild
      ? (scrollRef.current.firstElementChild as HTMLElement).offsetWidth + 24 // gap-6 = 24px
      : 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Portofolio &amp; Pencapaian
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll kiri"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll kanan"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-white transition-colors hover:bg-zinc-800 active:bg-zinc-700"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Carousel Track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4"
      >
        {portfolioData.map((item) => (
          <article
            key={item.title}
            className="min-w-[85vw] sm:min-w-[45vw] md:min-w-[30vw] snap-center flex flex-col gap-4 shrink-0"
          >
            {/* Image Placeholder — 4:3 ratio */}
            <div
              className={`aspect-[4/3] w-full rounded-3xl bg-gradient-to-br ${item.gradient} border border-zinc-800`}
            />

            {/* Text */}
            <div className="flex flex-col gap-1 text-center">
              <h3 className="text-base font-semibold text-white sm:text-lg">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-400">
                {item.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
