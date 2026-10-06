"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, Info, Search, Sparkles, Swords, TrendingUp, X, Zap } from "lucide-react";
import { useStickyState } from "@/hooks/useStickyState";
import { ELEMENTS, characterImage, elementIcon, type Sonata } from "@/lib/data/characters";

/* ─────────────────────────────────────
   PRICING DATA
   ───────────────────────────────────── */

/**
 * Harga ascension per Rank (berlaku untuk Resonator & Weapon).
 * Harga bersifat KUMULATIF: target Rank 4 dari Rank 1 = 5k + 5k + 5k = Rp 15.000.
 */
const ASCENSION_RANKS = [
  { rank: 1, level: 40, price: 0 }, // titik awal (baseline)
  { rank: 2, level: 50, price: 5000 },
  { rank: 3, level: 60, price: 5000 },
  { rank: 4, level: 70, price: 5000 },
  { rank: 5, level: 80, price: 10000 },
  { rank: 6, level: 90, price: 10000 },
] as const;

const WEAPON_CONVERTER_DISCOUNT = 5000;

/** Inherent Skill & Bonus Node sudah termasuk di setiap paket skill. */
const FORTE_SKILLS = [
  { id: "basic", label: "Basic Attack", price: 15000 },
  { id: "skill", label: "Resonance Skill", price: 15000 },
  { id: "circuit", label: "Forte Circuit", price: 15000 },
  { id: "liberation", label: "Resonance Liberation", price: 15000 },
  { id: "intro", label: "Intro Skill", price: 15000 },
] as const;

const ECHO_BUILD_PRICE = 25000;

/* ─────────────────────────────────────
   TYPES & HELPERS
   ───────────────────────────────────── */

const ELEMENT_COLORS: Record<string, string> = {
  Aero: "text-emerald-400",
  Electro: "text-fuchsia-400",
  Fusion: "text-rose-400",
  Glacio: "text-sky-400",
  Havoc: "text-violet-400",
  Spectro: "text-amber-400",
};

/** Bentuk data karakter yang dikirim dari tabel `Character` (server). */
export interface ResonatorOption {
  id: string;
  name: string;
  element: Sonata;
  rarity: number;
}

export interface BuildProduct {
  name: string;
  price: number;
  category: string;
  details: Record<string, unknown>;
}

interface BuildConfig {
  resonatorId: string;
  rankFrom: number;
  rankTo: number;
  weaponFrom: number;
  weaponTo: number;
  weaponConverter: boolean;
  forte: string[];
  echoBuild: boolean;
}

const DEFAULT_CONFIG: BuildConfig = {
  resonatorId: "",
  rankFrom: 1,
  rankTo: 1,
  weaponFrom: 1,
  weaponTo: 1,
  weaponConverter: false,
  forte: [],
  echoBuild: false,
};

/** Jumlahkan harga setiap Rank di atas `from` hingga `to` (inklusif). */
function ascensionPrice(from: number, to: number) {
  return ASCENSION_RANKS.filter((r) => r.rank > from && r.rank <= to).reduce((sum, r) => sum + r.price, 0);
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}



/* ─────────────────────────────────────
   UI PRIMITIVES
   ───────────────────────────────────── */

function Select({ id, label, value, onChange, children }: {
  id: string; label: string; value: string | number; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0">
      <label htmlFor={id} className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2.5 pr-9 text-sm text-slate-100 transition-colors hover:border-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
    </div>
  );
}

function CheckRow({ id, checked, onToggle, label, price, discount = false }: {
  id?: string; checked: boolean; onToggle: () => void; label: string; price: number; discount?: boolean;
}) {
  const accent = discount ? "emerald" : "blue";
  return (
    <label
      htmlFor={id}
      className={`group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-[background-color,border-color,transform] duration-150 ease-out active:scale-[0.98] ${
        checked
          ? accent === "emerald" ? "border-emerald-500/40 bg-emerald-600/15 text-white" : "border-blue-500/40 bg-blue-600/15 text-white"
          : "border-white/5 bg-white/[0.02] text-slate-300 hover:border-white/15 hover:bg-white/5 hover:text-white"
      }`}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onToggle}
        className="sr-only"
      />
      <span className="flex items-center gap-2.5">
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? accent === "emerald" ? "border-emerald-500 bg-emerald-600" : "border-blue-500 bg-blue-600"
            : "border-slate-500 group-hover:border-slate-400"
        }`}>
          {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </span>
        {label}
      </span>
      <span className={`shrink-0 text-xs font-semibold tabular-nums text-right min-w-[70px] ${
        checked ? (accent === "emerald" ? "text-emerald-400" : "text-blue-400") : "text-slate-500"
      }`}>
        {discount 
          ? (checked ? `Hemat ${formatRupiah(price)}` : `−${formatRupiah(price)}`) 
          : formatRupiah(price)}
      </span>
    </label>
  );
}

function BuildCard({ icon, title, subtitle, note, price, children, footer }: {
  icon: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode; note?: string; price: number; children: React.ReactNode; footer?: React.ReactNode;
}) {
  const active = price > 0;
  return (
    <div className={`glass flex flex-col rounded-2xl p-5 transition-colors duration-200 ${active ? "!border-blue-500/40" : ""}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-slate-400"}`}>
            {icon}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white leading-tight w-full flex items-center justify-between gap-3">{title}</h4>
            {subtitle && <p className="text-xs text-slate-400 mt-1.5">{subtitle}</p>}
            {note && (
              <p className="flex items-start gap-1.5 mt-2.5 text-xs text-slate-400 not-italic">
                <Info className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{note}</span>
              </p>
            )}
          </div>
        </div>
        <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold tabular-nums transition-colors ${active ? "bg-blue-600 text-white" : "bg-white/5 text-slate-500"}`}>
          {active ? formatRupiah(price) : "—"}
        </span>
      </div>
      <div className="flex-1">
        {children}
      </div>
      {footer && (
        <div className="mt-auto pt-4 border-t border-white/5">
          {footer}
        </div>
      )}
    </div>
  );
}

/** Rincian akumulasi Rank, contoh: R2 5k + R3 5k + R4 5k */
function RankBreakdown({ from, to }: { from: number; to: number }) {
  const steps = ASCENSION_RANKS.filter((r) => r.rank > 1);
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs tabular-nums">
      {steps.map((s) => {
        const isActive = s.rank > from && s.rank <= to;
        return (
          <span key={s.rank} className={`flex items-center gap-1.5 rounded px-2 py-1 transition-colors ${isActive ? "bg-blue-600/20 text-blue-300 border border-blue-500/30" : "bg-slate-800 text-slate-500 border border-transparent"}`}>
            R{s.rank} <span className={isActive ? "text-blue-200 font-medium" : "text-slate-500"}>+{formatRupiah(s.price)}</span>
          </span>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────
   RESONATOR SEARCH (Combobox)
   ───────────────────────────────────── */

function ResonatorSearch({ characters, value, onChange }: {
  characters: ResonatorOption[]; value: string; onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [elementFilter, setElementFilter] = useState<Sonata | "All">("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = characters.find((c) => c.id === value) ?? null;

  /* Filter + kelompokkan per Sonata */
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = characters.filter((c) =>
      (elementFilter === "All" || c.element === elementFilter) &&
      (!q || c.name.toLowerCase().includes(q) || c.element.toLowerCase().startsWith(q)),
    );
    return ELEMENTS
      .map((element) => ({
        element,
        items: matches
          .filter((c) => c.element === element)
          .sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name)),
      }))
      .filter((g) => g.items.length > 0);
  }, [characters, query, elementFilter]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  /* Tutup saat klik di luar */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  /* Jaga item aktif tetap terlihat saat navigasi keyboard */
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const openList = () => {
    setQuery("");
    setActiveIndex(0);
    setOpen(true);
  };

  const pick = (c: ResonatorOption) => {
    onChange(c.id);
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      openList();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[activeIndex]) pick(flat[activeIndex]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  const showSelected = selected && !open;

  return (
    <div ref={rootRef} className="relative flex-1 min-w-0">
      <label htmlFor="build-resonator-search" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        Resonator
      </label>

      {/* Field */}
      <div
        className={`flex items-center gap-2.5 rounded-lg border bg-slate-900/60 px-3 transition-colors ${open ? "border-blue-500 ring-1 ring-blue-500" : "border-white/10 hover:border-white/20"}`}
        onClick={() => { if (!open) openList(); inputRef.current?.focus(); }}
      >
        {showSelected ? (
          <span className={`relative h-7 w-7 shrink-0 overflow-hidden rounded-md border ${selected.rarity === 5 ? "border-yellow-500/70" : "border-purple-500/70"}`}>
            <Image src={characterImage(selected.name)} alt="" fill sizes="28px" className="object-cover" />
          </span>
        ) : (
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center py-1.5">
          <input
            ref={inputRef}
            id="build-resonator-search"
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="build-resonator-listbox"
            aria-autocomplete="list"
            aria-activedescendant={open && flat[activeIndex] ? `build-resonator-opt-${flat[activeIndex].id}` : undefined}
            autoComplete="off"
            spellCheck={false}
            value={showSelected ? selected.name : query}
            placeholder={selected ? `${selected.name} — ketik untuk mengganti` : "Cari nama Resonator atau Sonata…"}
            onFocus={() => { if (!open) openList(); }}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); if (!open) setOpen(true); }}
            onKeyDown={onKeyDown}
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {showSelected && (
            <span className={`uppercase text-[10px] font-bold tracking-widest leading-tight ${ELEMENT_COLORS[selected.element] || "text-slate-400"}`}>
              {selected.element}
            </span>
          )}
        </div>

        {showSelected ? (
          <button
            type="button"
            aria-label="Hapus pilihan Resonator"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="build-pop absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/60 backdrop-blur-md">
          {/* Sonata filter chips */}
          <div className="flex gap-1.5 overflow-x-auto border-b border-white/5 p-2 [scrollbar-width:none]">
            {(["All", ...ELEMENTS] as const).map((el) => (
              <button
                key={el}
                type="button"
                onClick={() => { setElementFilter(el); setActiveIndex(0); inputRef.current?.focus(); }}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${elementFilter === el
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {el !== "All" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={elementIcon(el)} alt="" className="h-3.5 w-3.5 object-contain" />
                )}
                {el === "All" ? "Semua" : el}
              </button>
            ))}
          </div>

          <div ref={listRef} id="build-resonator-listbox" role="listbox" aria-label="Daftar Resonator" className="max-h-72 overflow-y-auto overscroll-contain py-1">
            {flat.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500">Resonator tidak ditemukan.</p>
            ) : (
              groups.map((g) => (
                <div key={g.element} role="group" aria-label={`Sonata ${g.element}`}>
                  <div className="sticky top-0 z-10 flex items-center gap-2 bg-slate-950/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={elementIcon(g.element)} alt="" className="h-3.5 w-3.5 object-contain" />
                    {g.element}
                    <span className="text-slate-600">· {g.items.length}</span>
                  </div>
                  {g.items.map((c) => {
                    const idx = flat.indexOf(c);
                    const isActive = idx === activeIndex;
                    const isSelected = c.id === value;
                    return (
                      <div
                        key={c.id}
                        id={`build-resonator-opt-${c.id}`}
                        role="option"
                        aria-selected={isSelected}
                        data-index={idx}
                        onMouseMove={() => { if (!isActive) setActiveIndex(idx); }}
                        onClick={() => pick(c)}
                        className={`mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-100 ${isActive ? "bg-white/[0.07]" : ""}`}
                      >
                        <span className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-md border ${c.rarity === 5 ? "border-yellow-500/60 bg-yellow-900/30" : "border-purple-500/60 bg-purple-900/30"}`}>
                          <Image src={characterImage(c.name)} alt="" fill sizes="36px" className="object-cover" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className={`truncate text-sm ${isSelected ? "font-semibold text-blue-300" : "text-slate-100"}`}>{c.name}</span>
                          <span className={`uppercase text-[10px] font-bold tracking-widest ${ELEMENT_COLORS[c.element] || "text-slate-400"}`}>
                            {c.element}
                          </span>
                        </span>
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-blue-400" />}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────── */

export default function BuildCatalog({ characters, onProductChange }: {
  characters: ResonatorOption[];
  onProductChange: (p: BuildProduct | null) => void;
}) {
  // Key v2: struktur config berubah (level → rank, echoSet → echoBuild), jangan baca data lama.
  const [config, setConfig] = useStickyState<BuildConfig>(
    DEFAULT_CONFIG,
    "joki_build_config_v2",
    JSON.stringify,
    (s) => ({ ...DEFAULT_CONFIG, ...JSON.parse(s) }),
  );
  const set = <K extends keyof BuildConfig>(key: K, value: BuildConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const resonator = characters.find((c) => c.id === config.resonatorId) ?? null;

  const prices = useMemo(() => {
    const level = ascensionPrice(config.rankFrom, config.rankTo);
    const forte = FORTE_SKILLS.filter((s) => config.forte.includes(s.id)).reduce((sum, s) => sum + s.price, 0);
    const weaponBase = ascensionPrice(config.weaponFrom, config.weaponTo);
    const weaponDiscount = config.weaponConverter && weaponBase > 0 ? Math.min(WEAPON_CONVERTER_DISCOUNT, weaponBase) : 0;
    const weapon = weaponBase - weaponDiscount;
    const echo = config.echoBuild ? ECHO_BUILD_PRICE : 0;
    return { level, forte, weapon, weaponDiscount, echo, total: level + forte + weapon + echo };
  }, [config]);

  useEffect(() => {
    if (prices.total === 0) {
      onProductChange(null);
      return;
    }
    const who = resonator ? `${resonator.name} (${resonator.element})` : "Resonator";
    onProductChange({
      name: `Build Karakter: ${who}`,
      price: prices.total,
      category: "Build Karakter",
      details: {
        ...config,
        resonator: resonator?.name ?? null,
        sonata: resonator?.element ?? null,
        breakdown: prices,
      },
    });
  }, [prices, config, resonator, onProductChange]);

  const toggleForte = (id: string) =>
    set("forte", config.forte.includes(id) ? config.forte.filter((f) => f !== id) : [...config.forte, id]);

  const rankOptions = (min = 1) =>
    ASCENSION_RANKS.filter((r) => r.rank >= min).map((r) => (
      <option key={r.rank} value={r.rank}>Rank {r.rank} · Lv. {r.level}</option>
    ));

  const weaponBase = prices.weapon + prices.weaponDiscount;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Resonator picker */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <ResonatorSearch characters={characters} value={config.resonatorId} onChange={(id) => set("resonatorId", id)} />
        <button
          type="button"
          onClick={() => setConfig(DEFAULT_CONFIG)}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BuildCard 
          icon={<TrendingUp className="h-4 w-4" />} 
          title={
            <span className="flex flex-col gap-1">
              <span>Ascension Resonator</span>
              <span className="text-xs font-semibold text-blue-400">
                Rank {config.rankFrom} → {config.rankTo} · Lv. {ASCENSION_RANKS.find(r => r.rank === config.rankFrom)?.level} → {ASCENSION_RANKS.find(r => r.rank === config.rankTo)?.level}
              </span>
            </span>
          } 
          subtitle="Harga per rank, dijumlahkan sesuai rentang pilihan" 
          price={prices.level}
          footer={config.rankTo > config.rankFrom ? <RankBreakdown from={config.rankFrom} to={config.rankTo} /> : undefined}
        >
          <div className="flex gap-3">
            <Select id="build-rank-from" label="Rank Saat Ini" value={config.rankFrom} onChange={(v) => {
              const from = Number(v);
              setConfig((p) => ({ ...p, rankFrom: from, rankTo: Math.max(from, p.rankTo) }));
            }}>
              {rankOptions()}
            </Select>
            <Select id="build-rank-to" label="Target Rank" value={config.rankTo} onChange={(v) => set("rankTo", Number(v))}>
              {rankOptions(config.rankFrom)}
            </Select>
          </div>
        </BuildCard>

        <BuildCard 
          icon={<Swords className="h-4 w-4" />} 
          title={
            <span className="flex flex-col gap-1">
              <span>Weapon Ascension</span>
              <span className="text-xs font-semibold text-blue-400">
                Rank {config.weaponFrom} → {config.weaponTo} · Lv. {ASCENSION_RANKS.find(r => r.rank === config.weaponFrom)?.level} → {ASCENSION_RANKS.find(r => r.rank === config.weaponTo)?.level}
              </span>
            </span>
          } 
          subtitle="Harga per rank, dijumlahkan sesuai rentang pilihan" 
          price={prices.weapon}
          footer={config.weaponTo > config.weaponFrom ? <RankBreakdown from={config.weaponFrom} to={config.weaponTo} /> : undefined}
        >
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Select id="build-weapon-from" label="Rank Saat Ini" value={config.weaponFrom} onChange={(v) => {
                const from = Number(v);
                setConfig((p) => ({ ...p, weaponFrom: from, weaponTo: Math.max(from, p.weaponTo) }));
              }}>
                {rankOptions()}
              </Select>
              <Select id="build-weapon-to" label="Target Rank" value={config.weaponTo} onChange={(v) => set("weaponTo", Number(v))}>
                {rankOptions(config.weaponFrom)}
              </Select>
            </div>
            <div className={`transition-opacity duration-200 ${weaponBase > 0 ? "opacity-100" : "pointer-events-none opacity-40"}`}>
              <CheckRow
                id="build-weapon-converter"
                label="Bebas menggunakan converter bahan lain"
                price={WEAPON_CONVERTER_DISCOUNT}
                discount
                checked={config.weaponConverter}
                onToggle={() => set("weaponConverter", !config.weaponConverter)}
              />
              <p className="flex items-start gap-1.5 mt-2.5 text-xs text-slate-400 not-italic">
                <Info className="h-4 w-4 shrink-0 text-slate-500" />
                <span>Joki diizinkan menghabiskan Waveplate Crystal atau material sintesis akun Anda.</span>
              </p>
            </div>
          </div>
        </BuildCard>

        <BuildCard 
          icon={<Zap className="h-4 w-4" />} 
          title={
            <>
              <span>Forte / Skill Upgrade</span>
              <button
                type="button"
                onClick={(e) => { 
                  e.preventDefault(); 
                  set("forte", config.forte.length === FORTE_SKILLS.length ? [] : FORTE_SKILLS.map(s => s.id)); 
                }}
                className="rounded border border-white/10 px-2 py-0.5 text-[10px] uppercase font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {config.forte.length === FORTE_SKILLS.length ? "Batalkan" : "Pilih Semua"}
              </button>
            </>
          } 
          subtitle="Max skill Lv. 10 per pilihan · sudah termasuk Inherent Skill" 
          price={prices.forte}
        >
          <div className="flex flex-col gap-1.5">
            {FORTE_SKILLS.map((s) => (
              <CheckRow key={s.id} id={`build-forte-${s.id}`} label={s.label} price={s.price} checked={config.forte.includes(s.id)} onToggle={() => toggleForte(s.id)} />
            ))}
          </div>
        </BuildCard>

        <BuildCard
          icon={<Sparkles className="h-4 w-4" />}
          title="Build Echo Stats"
          note="Durasi proses build tergantung faktor hoki untuk hasil stat sesuai"
          price={prices.echo}
        >
          <div className="flex flex-col gap-1.5">
            <CheckRow
              id="build-echo-stats"
              label="Build Echo"
              price={ECHO_BUILD_PRICE}
              checked={config.echoBuild}
              onToggle={() => set("echoBuild", !config.echoBuild)}
            />
          </div>
        </BuildCard>
      </div>
    </div>
  );
}
