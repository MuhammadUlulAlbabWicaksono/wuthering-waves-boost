"use client";

import { useState } from "react";
import { Star, ShoppingBag, User, ChevronRight } from "lucide-react";
import Image from "next/image";

/* ─────────────────────────────────────
   DATA
   ───────────────────────────────────── */

interface Quest {
  id: string;
  chapter: string;
  title: string;
  price: number;
  imageUrl: string;
}

const questData: Quest[] = [
  {
    id: "q1",
    chapter: "Chapter III To the Stars Yet to Shine",
    title: "Main Quest: Fragmented Memories",
    price: 50000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "q2",
    chapter: "Chapter III To the Stars Yet to Shine",
    title: "Main Quest: The Shattered Chord",
    price: 50000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "q3",
    chapter: "Chapter III To the Stars Yet to Shine",
    title: "Side Quest: Echoes of the Past",
    price: 35000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "q4",
    chapter: "Chapter IV Unto the Abyss",
    title: "Main Quest: Descent into Darkness",
    price: 55000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "q5",
    chapter: "Chapter IV Unto the Abyss",
    title: "Main Quest: Whispers of Lament",
    price: 55000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "q6",
    chapter: "Chapter IV Unto the Abyss",
    title: "Side Quest: Lost Wayfarers",
    price: 40000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "q7",
    chapter: "Chapter IV Unto the Abyss",
    title: "Side Quest: Crimson Resonance",
    price: 40000,
    imageUrl: "/images/quest-placeholder.webp",
  },
];

const explorationData: Quest[] = [
  {
    id: "e1",
    chapter: "Region: Huanglong",
    title: "Exploration 100% Huanglong",
    price: 75000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "e2",
    chapter: "Region: Huanglong",
    title: "All Supply Pods Huanglong",
    price: 45000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "e3",
    chapter: "Region: Rinascita",
    title: "Exploration 100% Rinascita",
    price: 80000,
    imageUrl: "/images/quest-placeholder.webp",
  },
  {
    id: "e4",
    chapter: "Region: Rinascita",
    title: "All Viewpoints Rinascita",
    price: 30000,
    imageUrl: "/images/quest-placeholder.webp",
  },
];

const categories = ["Eksplorasi", "Quest", "Maintenance", "End-Game"] as const;
type Category = (typeof categories)[number];

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

/* ─────────────────────────────────────
   SUB-COMPONENTS
   ───────────────────────────────────── */

function SidebarProfile() {
  return (
    <aside className="lg:col-span-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
            <User className="h-10 w-10" />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">WuWa Expert</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Booster Profesional</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-amber-400 text-amber-400"
              />
            ))}
            <span className="ml-1 text-sm font-medium text-zinc-300">5.0</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-zinc-800" />

        {/* Stats */}
        <div className="space-y-4">
          <StatRow label="Total Pesanan" value="1,247" />
          <StatRow label="Selesai Bulan Ini" value="89" />
          <StatRow label="Rating Kepuasan" value="99.8%" />
          <StatRow label="Waktu Respon" value="< 5 menit" />
        </div>
      </div>
    </aside>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm font-medium text-zinc-200">{value}</span>
    </div>
  );
}

function CategoryTabs({
  active,
  onChange,
}: {
  active: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            active === cat
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function QuestCard({ quest }: { quest: Quest }) {
  return (
    <div className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-zinc-800">
      {/* Background image */}
      <Image
        src={quest.imageUrl}
        alt={quest.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        unoptimized
      />

      {/* Fallback gradient when image doesn't load */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 to-zinc-900" />

      {/* Price badge — top right */}
      <div className="absolute right-2 top-2 z-10 rounded-md bg-zinc-950/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
        {formatRupiah(quest.price)}
      </div>

      {/* Title bar — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-2 bg-zinc-200/90 px-3 py-2.5 backdrop-blur-sm">
        <span className="text-sm font-semibold leading-tight text-zinc-900">
          {quest.title}
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
      </div>
    </div>
  );
}

function ChapterGroup({
  chapter,
  quests,
}: {
  chapter: string;
  quests: Quest[];
}) {
  return (
    <div className="space-y-4">
      {/* Chapter divider with label */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-zinc-500">
          {chapter}
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Quest grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quests.map((q) => (
          <QuestCard key={q.id} quest={q} />
        ))}
      </div>
    </div>
  );
}

function QuestCatalog({ data }: { data: Quest[] }) {
  // Group by chapter
  const grouped = data.reduce<Record<string, Quest[]>>((acc, quest) => {
    if (!acc[quest.chapter]) acc[quest.chapter] = [];
    acc[quest.chapter].push(quest);
    return acc;
  }, {});

  const chapters = Object.keys(grouped);

  return (
    <div className="space-y-8">
      {chapters.map((ch) => (
        <ChapterGroup key={ch} chapter={ch} quests={grouped[ch]} />
      ))}
    </div>
  );
}

function PlaceholderContent({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 py-20 text-center">
      <ShoppingBag className="mb-3 h-10 w-10 text-zinc-700" />
      <p className="text-sm text-zinc-500">
        Katalog <span className="font-medium text-zinc-400">{category}</span>{" "}
        segera hadir.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────── */

export default function DashboardPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Quest");

  const catalogData =
    activeCategory === "Quest"
      ? questData
      : activeCategory === "Eksplorasi"
        ? explorationData
        : null;

  return (
    <div className="min-h-screen bg-zinc-950 p-4 lg:p-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar */}
        <SidebarProfile />

        {/* Main Area */}
        <section className="lg:col-span-9">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            {/* Category Tabs */}
            <div className="mb-8">
              <CategoryTabs
                active={activeCategory}
                onChange={setActiveCategory}
              />
            </div>

            {/* Catalog Content */}
            {catalogData ? (
              <QuestCatalog data={catalogData} />
            ) : (
              <PlaceholderContent category={activeCategory} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
