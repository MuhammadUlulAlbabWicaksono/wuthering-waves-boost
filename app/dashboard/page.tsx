"use client";

import { useState, useCallback, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Star, ShoppingBag, User, ChevronRight, CreditCard, ShoppingCart, AlertTriangle, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import MainQuestCatalog from "@/components/MainQuestCatalog";
import CompanionQuestCatalog from "@/components/CompanionQuestCatalog";
import ExplorationCatalog from "@/components/ExplorationCatalog";
import ExplorationQuestCatalog from "@/components/QuestCatalog";
import { useStickyState } from "@/hooks/useStickyState";

/* ─────────────────────────────────────
   TYPES & DATA
   ───────────────────────────────────── */

interface Quest {
  id: string;
  chapter: string;
  title: string;
  price: number;
  imageUrl: string;
}

export interface SelectedProduct {
  name: string;
  price: number;
  category: string;
  details?: Record<string, any>;
}

const questData: Quest[] = [
  { id: "q1", chapter: "Chapter III To the Stars Yet to Shine", title: "Main Quest: Fragmented Memories", price: 50000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "q2", chapter: "Chapter III To the Stars Yet to Shine", title: "Main Quest: The Shattered Chord", price: 50000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "q3", chapter: "Chapter III To the Stars Yet to Shine", title: "Side Quest: Echoes of the Past", price: 35000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "q4", chapter: "Chapter IV Unto the Abyss", title: "Main Quest: Descent into Darkness", price: 55000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "q5", chapter: "Chapter IV Unto the Abyss", title: "Main Quest: Whispers of Lament", price: 55000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "q6", chapter: "Chapter IV Unto the Abyss", title: "Side Quest: Lost Wayfarers", price: 40000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "q7", chapter: "Chapter IV Unto the Abyss", title: "Side Quest: Crimson Resonance", price: 40000, imageUrl: "/images/quest-placeholder.webp" },
];

const explorationData: Quest[] = [
  { id: "e1", chapter: "Region: Huanglong", title: "Exploration 100% Huanglong", price: 75000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "e2", chapter: "Region: Huanglong", title: "All Supply Pods Huanglong", price: 45000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "e3", chapter: "Region: Rinascita", title: "Exploration 100% Rinascita", price: 80000, imageUrl: "/images/quest-placeholder.webp" },
  { id: "e4", chapter: "Region: Rinascita", title: "All Viewpoints Rinascita", price: 30000, imageUrl: "/images/quest-placeholder.webp" },
];

const categories = ["Eksplorasi", "Quest", "Maintenance", "End-Game"] as const;
type Category = (typeof categories)[number];

const questTypes = ['Main Quest', 'Exploration Quest', 'Companion Quest', 'Event Quest', 'Side Quest', 'World Side Quest'];

const PAYMENT_METHODS = ["QRIS", "E-Wallet", "Virtual Account", "Transfer Bank"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];
const SERVERS = ["SEA", "ASIA", "AMERICA", "EUROPE", "HK-MO-TW"] as const;

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
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white backdrop-blur-md p-6 sticky top-28">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-slate-300">
            <User className="h-10 w-10" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-slate-100">WuWa Expert</h2>
            <p className="mt-0.5 text-sm text-slate-300">Booster Profesional</p>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-1 text-sm font-medium text-slate-300">5.0</span>
          </div>
        </div>
        <div className="my-6 h-px bg-slate-700/60" />
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
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-medium text-slate-100">{value}</span>
    </div>
  );
}

function CategoryTabs({ active, onChange }: { active: Category; onChange: (c: Category) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`rounded-lg px-4 py-2 text-sm font-medium border transition-colors ${active === cat
            ? "bg-slate-800 text-white border-slate-800 shadow-md"
            : "border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function QuestCard({ quest, category, isSelected, onSelect }: { quest: Quest; category: string; isSelected: boolean; onSelect: (product: SelectedProduct) => void }) {
  return (
    <div
      onClick={() => onSelect({ name: quest.title, price: quest.price, category })}
      className={`group relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-slate-100 shadow-sm border transition-all duration-200 hover:shadow-md ${isSelected ? "border-blue-500 ring-2 ring-blue-500/50" : "border-slate-200"
        }`}
    >
      <Image
        src={quest.imageUrl}
        alt={quest.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
      <div className={`absolute right-2 top-2 z-10 rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm border transition-colors ${isSelected ? "bg-blue-600 text-white border-blue-500" : "bg-white/90 text-slate-900 border-slate-200"
        }`}>
        {formatRupiah(quest.price)}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between gap-2 border-t px-3 py-2.5 backdrop-blur-sm transition-colors ${isSelected ? "bg-blue-600/90 border-blue-500" : "bg-white/90 border-slate-200"
        }`}>
        <span className={`text-sm font-semibold leading-tight ${isSelected ? "text-white" : "text-slate-900"}`}>{quest.title}</span>
        {isSelected ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-blue-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
        )}
      </div>
    </div>
  );
}

function ChapterGroup({ chapter, quests, category, selectedProduct, onSelect }: { chapter: string; quests: Quest[]; category: string; selectedProduct: SelectedProduct | null; onSelect: (product: SelectedProduct) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-slate-500">{chapter}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {quests.map((q) => (
          <QuestCard
            key={q.id}
            quest={q}
            category={category}
            isSelected={selectedProduct?.name === q.title}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function QuestCatalog({ data, category, selectedProduct, onSelect }: { data: Quest[]; category: string; selectedProduct: SelectedProduct | null; onSelect: (product: SelectedProduct) => void }) {
  const grouped = data.reduce<Record<string, Quest[]>>((acc, quest) => {
    if (!acc[quest.chapter]) acc[quest.chapter] = [];
    acc[quest.chapter].push(quest);
    return acc;
  }, {});
  const chapters = Object.keys(grouped);
  return (
    <div className="space-y-8">
      {chapters.map((ch) => (
        <ChapterGroup key={ch} chapter={ch} quests={grouped[ch]} category={category} selectedProduct={selectedProduct} onSelect={onSelect} />
      ))}
    </div>
  );
}

function PlaceholderContent({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-800/40 py-20 text-center">
      <ShoppingBag className="mb-3 h-10 w-10 text-slate-400" />
      <p className="text-sm text-slate-100">
        Katalog <span className="font-medium text-slate-800">{category}</span> segera hadir.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────── */

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /* ── Product State ── */
  const tabParam = searchParams.get("tab");
  const initialCategory = categories.find(
    (c) => c.toLowerCase() === tabParam?.toLowerCase()
  ) || "Eksplorasi";

  const [activeCategory, setActiveCategory] = useState<Category>(initialCategory as Category);
  const [genericProduct, setGenericProduct] = useState<SelectedProduct | null>(null);

  /* ── Quest State ── */
  const [selectedQuestType, setSelectedQuestType] = useStickyState<string>("", "joki_selectedQuestType");
  const [questSelectedIds, setQuestSelectedIds] = useState<string[]>([]);
  const [questTotal, setQuestTotal] = useState<number>(0);

  /* ── Eksplorasi State ── */
  const [explorationSelectedAreas, setExplorationSelectedAreas] = useState<string[]>([]);
  const [explorationTotal, setExplorationTotal] = useState<number>(0);

  /* ── Global Product State ── */
  const selectedProduct = useMemo<SelectedProduct | null>(() => {
    const globalTotal = questTotal + explorationTotal;
    
    if (globalTotal === 0) return genericProduct;

    let productName = "";
    let mode = "";

    if (questTotal > 0 && explorationTotal > 0) {
      productName = "Multiple Services (Quest, Eksplorasi)";
      mode = "Multiple";
    } else if (explorationTotal > 0) {
      productName = `Eksplorasi (${explorationSelectedAreas.length} Area)`;
      mode = "Eksplorasi";
    } else if (questTotal > 0) {
      productName = `Joki ${selectedQuestType || 'Quest'} (${questSelectedIds.length} Quest)`;
      mode = "Quest";
    }

    return {
      name: productName,
      price: globalTotal,
      category: mode,
      details: {
        ...(questSelectedIds.length > 0 && { selectedIds: questSelectedIds }),
        ...(explorationSelectedAreas.length > 0 && { selectedAreas: explorationSelectedAreas }),
      }
    };
  }, [questTotal, explorationTotal, questSelectedIds, explorationSelectedAreas, selectedQuestType, genericProduct]);

  /* ── Form State ── */
  const [loginMethod, setLoginMethod] = useStickyState("Kuro Games", "joki_loginMethod");
  const [accountEmail, setAccountEmail] = useStickyState("", "joki_accountEmail");
  const [server, setServer] = useStickyState("", "joki_server");
  const [paymentMethod, setPaymentMethod] = useStickyState<PaymentMethod | "">("", "joki_paymentMethod");

  /* ── Modal State ── */
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormComplete = selectedProduct && loginMethod && accountEmail && server && paymentMethod;

  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    router.replace(`${pathname}?tab=${cat.toLowerCase()}`, { scroll: false });

    if (cat === "End-Game") {
      router.push("/dashboard/planner");
    }
  };

  const handleSelectProduct = (product: SelectedProduct) => {
    setGenericProduct(product);
  };



  const handleConfirmPurchase = useCallback(async () => {
    if (!selectedProduct) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customerInfo: { loginMethod, accountEmail, server },
        mode: selectedProduct.category,
        productName: selectedProduct.name,
        teams: [],
        bosses: [],
        paymentMethod,
        totalAmount: selectedProduct.price,
        details: selectedProduct.details,
      };

      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.orderId) {
        setIsConfirmOpen(false);
        router.push(`/invoice/${data.orderId}`);
      }
    } catch (err) {
      console.error("Failed to create invoice:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [loginMethod, accountEmail, server, paymentMethod, selectedProduct, router]);

  const catalogData = null;

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/image/background/background.png')" }}
    >
      {/* Overlay Background */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm pointer-events-none" />

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-8 p-4 pt-24 lg:grid-cols-12 lg:p-8 lg:pt-28">
        <SidebarProfile />

        <section className="lg:col-span-9 space-y-6">

          {/* ─── BAGIAN 1: PILIH PRODUK ─── */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white backdrop-blur-md p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-100 flex items-center gap-2 mb-6">
              <ShoppingBag className="h-4 w-4" />
              Pilih Produk
            </h2>
            <div className="mb-8">
              <CategoryTabs active={activeCategory} onChange={handleCategoryChange} />
            </div>
            {activeCategory === "Quest" ? (
              <div className="space-y-8">
                {/* Layer 1: Pilih Jenis Quest */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Pilih Jenis Quest</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {questTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedQuestType(type)}
                        className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${selectedQuestType === type
                          ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400'
                          : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer 2: Katalog Berdasarkan Pilihan */}
                {selectedQuestType && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold text-white mb-4">
                      Katalog {selectedQuestType}
                    </h3>
                    {selectedQuestType === 'Main Quest' ? (
                      <MainQuestCatalog
                        onTotalChange={setQuestTotal}
                        onSelectionChange={setQuestSelectedIds}
                      />
                    ) : selectedQuestType === 'Exploration Quest' ? (
                      <ExplorationCatalog
                        onTotalChange={setQuestTotal}
                        onSelectionChange={setQuestSelectedIds}
                      />
                    ) : selectedQuestType === 'Companion Quest' ? (
                      <CompanionQuestCatalog
                        onTotalChange={setQuestTotal}
                        onSelectionChange={setQuestSelectedIds}
                      />
                    ) : (
                      <div className="p-8 border border-dashed border-slate-700 rounded-xl bg-slate-800/40 text-slate-400 text-center flex flex-col items-center justify-center gap-3">
                        <ShoppingBag className="h-10 w-10 text-slate-500" />
                        <p>Katalog untuk <span className="font-semibold text-slate-300">{selectedQuestType}</span> sedang dalam tahap penyusunan.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : activeCategory === "Eksplorasi" ? (
              <ExplorationCatalog
                onTotalChange={setExplorationTotal}
                onSelectionChange={setExplorationSelectedAreas}
              />
            ) : catalogData ? (
              <QuestCatalog data={catalogData} category={activeCategory} selectedProduct={selectedProduct} onSelect={handleSelectProduct} />
            ) : (
              <PlaceholderContent category={activeCategory} />
            )}
          </div>

          {/* ─── BAGIAN 2: INFORMASI AKUN ─── */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white backdrop-blur-md p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-100 flex items-center gap-2 mb-4">
              <User className="h-4 w-4" />
              Informasi Akun
            </h2>
            <p className="mt-1 text-[11px] text-slate-400 mb-6">
              Masukkan data akun game Anda untuk proses joki
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-100 mb-1.5">Metode Login</label>
                <div className="relative">
                  <select
                    value={loginMethod}
                    onChange={(e) => setLoginMethod(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 pr-8 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="Kuro Games">Kuro Games</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-100 mb-1.5">Email Akun</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-100 mb-1.5">Server</label>
                <div className="relative">
                  <select
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 pr-8 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  >
                    <option value="">Pilih Server...</option>
                    {SERVERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── BAGIAN 3: METODE PEMBAYARAN ─── */}
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/85 shadow-2xl shadow-black/50 text-white backdrop-blur-md p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-100 flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4" />
              Metode Pembayaran
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-semibold transition-all duration-200 ${paymentMethod === method
                    ? "border-blue-500 bg-blue-600/20 text-blue-400 shadow-sm"
                    : "border-slate-700/50 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-700"
                    }`}
                >
                  <CreditCard className={`h-6 w-6 ${paymentMethod === method ? "text-blue-500" : "text-slate-400"}`} />
                  {method}
                </button>
              ))}
            </div>
          </div>

        </section>
      </div>

      {/* ─── STICKY FOOTER NAVIGASI PESANAN ─── */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-blue-700 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.4)]">
        {/* Container Tengah: Membatasi lebar konten agar tidak mentok kiri-kanan */}
        <div className="w-full max-w-5xl mx-auto flex items-center justify-between px-6">

          {/* Bagian Kiri: Info Pesanan & Harga */}
          <div className="flex flex-col">
            <span className="text-slate-200 text-sm font-medium">
              {selectedProduct ? selectedProduct.name : 'Belum ada layanan yang dipilih'}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-200 text-sm">Total:</span>
              {/* Pastikan nominal harga berwarna putih terang dan tebal */}
              <span className="text-white text-xl font-extrabold tracking-wide">
                {selectedProduct ? formatRupiah(selectedProduct.price) : "Rp 0"}
              </span>
            </div>
          </div>

          {/* Bagian Kanan: Tombol Action */}
          <button
            type="button"
            onClick={() => {
              if (!selectedProduct) {
                toast.error("Pilih produk joki terlebih dahulu");
                return;
              }
              if (!isFormComplete) {
                toast.error("Lengkapi semua informasi akun dan pilih metode pembayaran");
                return;
              }
              setIsConfirmOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-2.5 rounded-md transition-colors flex items-center gap-2"
          >
            Order Sekarang!
          </button>
        </div>
      </div>

      {/* ─── MODAL KONFIRMASI ORDER ─── */}
      {isConfirmOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                KONFIRMASI ORDER
              </h3>
              <button type="button" onClick={() => setIsConfirmOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Ringkasan Pesanan</h4>
                <div className="rounded-lg border border-slate-700 bg-slate-800 divide-y divide-slate-700">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-300">Item Pembelian</span>
                    <span className="text-sm font-semibold text-slate-100">{selectedProduct.name}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-300">Kategori</span>
                    <span className="text-sm font-semibold text-slate-100">{selectedProduct.category}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-300">Jumlah</span>
                    <span className="text-sm font-semibold text-slate-100">1</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-300">Server</span>
                    <span className="text-sm font-semibold text-slate-100">{server}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-slate-300">Metode Pembayaran</span>
                    <span className="text-sm font-semibold text-blue-400">{paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">Total Pembayaran</span>
                <span className="text-xl font-bold text-blue-700">{formatRupiah(selectedProduct.price)}</span>
              </div>

              {/* T&C Warning */}
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Dengan menekan &quot;BELI SEKARANG&quot;, Anda menyetujui <span className="font-semibold underline cursor-pointer">Syarat &amp; Ketentuan</span> layanan kami. Proses joki akan dimulai setelah pembayaran berhasil dikonfirmasi. Tidak ada pengembalian dana setelah proses dimulai.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-800 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      BELI SEKARANG
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        Loading...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
