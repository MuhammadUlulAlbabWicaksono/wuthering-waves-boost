"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Check,
  Search,
  ListFilter,
} from "lucide-react";
import { useStickyState } from "@/hooks/useStickyState";
import Image from "next/image";

// ─── Types ───
interface QuestItem {
  id: string;
  name: string;
  flatPrice: number;
  astriteReward: number;
  isChain: boolean;
  seriesName: string | null;
}

interface ChainSeries {
  seriesName: string;
  quests: QuestItem[];
  totalPrice: number;
  totalAstrite: number;
}

interface RegionData {
  region: string;
  singleQuests: QuestItem[];
  chainSeries: ChainSeries[];
  totalQuests: number;
}

/** Sub-region configuration: which area names belong to which sub-region. */
interface SubRegionConfig {
  id: string;
  label: string;
  areas: string[];
}

/** A leaf in the menu: filterable by selectedRegion (id may be a sub-region id). */
interface MenuLeaf {
  id: string;
  label: string;
  data: RegionData;
}

/** Top-level menu entry. With `subRegions` it acts as an accordion header. */
interface MenuNode extends MenuLeaf {
  subRegions?: MenuLeaf[];
}

// Keyed by formatted region name. Regions not listed here have no sub-regions.
// Areas not listed in any sub-region fall back to the first sub-region.
const SUB_REGION_CONFIG: Record<string, SubRegionConfig[]> = {
  Huanglong: [
    {
      id: "jinzhou",
      label: "Jinzhou",
      areas: [
        "Norfall Barrens", "Desorock Highland", "Dim Forest", "Jinzhou City",
        "Central Plains", "Tiger's Maw", "Wuming Bay", "Gorges of Spirits",
        "Port City of Guixu", "Mt. Firmament",
      ],
    },
    {
      id: "mengzhou",
      label: "Mengzhou",
      areas: [
        "Whining Aix's Mire", "Xuanfang Hold", "Western Fang Peaks",
        "Eastern Xuan Peaks", "Southern Yuan Hills", "Simulacrum Nexus",
      ],
    },
  ],
  "Lahai Roi": [
    {
      id: "lahai-roi",
      label: "Lahai Roi",
      areas: [
        "Etching Plains", "Startorch Academy", "Starward Riseway", "Rebirth Uplands",
        "Solisia Landing", "Sealed Fissure", "Starblind Crashsite",
      ],
    },
    {
      id: "roya-frostland",
      label: "Roya Frostland",
      areas: [
        "Fangspire Chasm", "Bjartr Woods", "Stagnant Run", "Giant's Gaze",
        "Frostlands Transit Port", "Upphaf Forest Ruins", "Mount Gjallar",
      ],
    },
    {
      id: "dimmr-plains",
      label: "Dimmr Plains",
      areas: ["Mawburrow Desert", "Tidelost Forest", "Dimmr Deep", "Silent Crag"],
    },
  ],
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface QuestCatalogUIProps {
  dbCategories: any[];
  storageKeyPrefix: string;
  onTotalChange?: (total: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

// ─── Helpers ───
function formatRupiah(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatRegionName(name: string) {
  return name.replace(/^(Main Quest|Exploration Quests?|Side Quests?|Map Exploration 100%)\s*-\s*/i, "").trim();
}

export default function QuestCatalogUI({
  dbCategories,
  storageKeyPrefix,
  onTotalChange,
  onSelectionChange,
}: QuestCatalogUIProps) {
  // ─── Parse dbCategories into RegionData[] ───
  const regionData = useMemo<RegionData[]>(() => {
    const result: RegionData[] = [];

    dbCategories.forEach((cat: any) => {
      const region = cat.name || "Unknown";
      const singleQuests: QuestItem[] = [];
      const chainMap = new Map<string, QuestItem[]>();

      cat.quests.forEach((q: any) => {
        const item: QuestItem = {
          id: q.id,
          name: q.name,
          flatPrice: q.flatPrice || 0,
          astriteReward: q.astriteReward || 0,
          isChain: q.isChain || false,
          seriesName: q.seriesName || null,
        };

        if (q.isChain) {
          const key = q.seriesName || "Unknown Series";
          const list = chainMap.get(key) || [];
          list.push(item);
          chainMap.set(key, list);
        } else {
          singleQuests.push(item);
        }
      });

      singleQuests.sort((a, b) => a.name.localeCompare(b.name));

      const chainSeries: ChainSeries[] = [];
      for (const [seriesName, seriesQuests] of chainMap) {
        chainSeries.push({
          seriesName,
          quests: seriesQuests.sort((a, b) => a.name.localeCompare(b.name)),
          totalPrice: seriesQuests.reduce((sum, q) => sum + q.flatPrice, 0),
          totalAstrite: seriesQuests.reduce((sum, q) => sum + q.astriteReward, 0),
        });
      }
      chainSeries.sort((a, b) => a.seriesName.localeCompare(b.seriesName));

      result.push({
        region,
        singleQuests,
        chainSeries,
        totalQuests: cat.quests.length,
      });
    });

    // Don't sort result regions alphabetically if we want to preserve category order (like Chapter I, Chapter II)
    // The query in page.tsx already orders by createdAt.
    return result;
  }, [dbCategories]);

  // ─── Menu tree (regions + optional sub-regions) ───
  const menuTree = useMemo<MenuNode[]>(() => {
    return regionData.map((r) => {
      const label = formatRegionName(r.region);
      const subs = SUB_REGION_CONFIG[label];
      if (!subs) return { id: r.region, label, data: r };

      const buckets: MenuLeaf[] = subs.map((s) => ({
        id: `${r.region}::${s.id}`,
        label: s.label,
        data: { region: r.region, singleQuests: [], chainSeries: [], totalQuests: 0 },
      }));
      const bucketFor = (name: string) => {
        const idx = subs.findIndex((s) => s.areas.includes(name));
        return buckets[idx >= 0 ? idx : 0];
      };

      r.singleQuests.forEach((q) => {
        const b = bucketFor(q.name);
        b.data.singleQuests.push(q);
        b.data.totalQuests++;
      });
      r.chainSeries.forEach((s) => {
        const b = bucketFor(s.quests[0]?.name ?? "");
        b.data.chainSeries.push(s);
        b.data.totalQuests += s.quests.length;
      });

      return { id: r.region, label, data: r, subRegions: buckets };
    });
  }, [regionData]);

  const leaves = useMemo<MenuLeaf[]>(
    () => menuTree.flatMap((n) => n.subRegions ?? [n]),
    [menuTree]
  );

  // ─── State ───
  const [selectedRegion, setSelectedRegion] = useStickyState<string>(
    leaves[0]?.id || "",
    `joki_${storageKeyPrefix}_region`
  );
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Keep the parent of a selected sub-region open (also after sticky hydration)
  useEffect(() => {
    const parent = menuTree.find((n) => n.subRegions?.some((s) => s.id === selectedRegion));
    if (parent) setExpandedRegion(parent.id);
  }, [selectedRegion, menuTree]);

  const countSelected = (data: RegionData) =>
    [...data.singleQuests, ...data.chainSeries.flatMap((s) => s.quests)].filter((q) =>
      selectedIds.has(q.id)
    ).length;

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedIds, setSelectedIds] = useStickyState<Set<string>>(
    new Set(),
    `joki_${storageKeyPrefix}_selection_v2`,
    (set: Set<string>) => JSON.stringify(Array.from(set)),
    (str: string) => new Set(JSON.parse(str))
  );

  const [expandedSeries, setExpandedSeries] = useState<Set<string>>(new Set());

  // ─── Derived Data ───
  const currentRegion = useMemo(
    () => (leaves.find((l) => l.id === selectedRegion) || leaves[0])?.data,
    [leaves, selectedRegion]
  );

  // Filter by search
  const filteredSingleQuests = useMemo(() => {
    if (!currentRegion) return [];
    if (!searchQuery.trim()) return currentRegion.singleQuests;
    const q = searchQuery.toLowerCase();
    return currentRegion.singleQuests.filter((quest) =>
      quest.name.toLowerCase().includes(q)
    );
  }, [currentRegion, searchQuery]);

  const filteredChainSeries = useMemo(() => {
    if (!currentRegion) return [];
    if (!searchQuery.trim()) return currentRegion.chainSeries;
    const q = searchQuery.toLowerCase();
    return currentRegion.chainSeries.filter(
      (series) =>
        series.seriesName.toLowerCase().includes(q) ||
        series.quests.some((quest) => quest.name.toLowerCase().includes(q))
    );
  }, [currentRegion, searchQuery]);

  // All quest IDs in current region (for "Select All")
  const allIdsInRegion = useMemo(() => {
    if (!currentRegion) return new Set<string>();
    const ids = new Set<string>();
    currentRegion.singleQuests.forEach((q) => ids.add(q.id));
    currentRegion.chainSeries.forEach((s) =>
      s.quests.forEach((q) => ids.add(q.id))
    );
    return ids;
  }, [currentRegion]);

  const selectedInRegionCount = useMemo(() => {
    let count = 0;
    allIdsInRegion.forEach((id) => {
      if (selectedIds.has(id)) count++;
    });
    return count;
  }, [allIdsInRegion, selectedIds]);

  const isAllRegionSelected =
    allIdsInRegion.size > 0 && selectedInRegionCount === allIdsInRegion.size;

  // ─── Total Price Calculation (with 10% discount if all in region selected) ───
  const totalPrice = useMemo(() => {
    let total = 0;

    regionData.forEach((region) => {
      let regionTotal = 0;
      let regionSelectedCount = 0;
      let regionTotalCount = 0;

      // Count single quests
      region.singleQuests.forEach((q) => {
        regionTotalCount++;
        if (selectedIds.has(q.id)) {
          regionTotal += q.flatPrice;
          regionSelectedCount++;
        }
      });

      // Count chain quests
      region.chainSeries.forEach((series) => {
        series.quests.forEach((q) => {
          regionTotalCount++;
          if (selectedIds.has(q.id)) {
            regionTotal += q.flatPrice;
            regionSelectedCount++;
          }
        });
      });

      // 10% discount if all quests in region are selected
      if (regionSelectedCount > 0 && regionSelectedCount === regionTotalCount) {
        regionTotal = regionTotal * 0.9;
      }

      total += regionTotal;
    });

    return total;
  }, [selectedIds, regionData]);

  // ─── Callbacks to Parent ───
  useEffect(() => {
    if (onTotalChange) onTotalChange(totalPrice);
    if (onSelectionChange) onSelectionChange(Array.from(selectedIds));
  }, [totalPrice, selectedIds, onTotalChange, onSelectionChange]);

  // ─── Handlers ───
  const toggleQuest = (questId: string) => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(questId)) next.delete(questId);
      else next.add(questId);
      return next;
    });
  };

  const toggleSeries = (series: ChainSeries) => {
    const allSelected = series.quests.every((q) => selectedIds.has(q.id));
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      series.quests.forEach((q) => {
        if (allSelected) next.delete(q.id);
        else next.add(q.id);
      });
      return next;
    });
  };

  const toggleSelectAllRegion = () => {
    setSelectedIds((prev: Set<string>) => {
      const next = new Set(prev);
      if (isAllRegionSelected) {
        allIdsInRegion.forEach((id) => next.delete(id));
      } else {
        allIdsInRegion.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleExpandSeries = (seriesName: string) => {
    setExpandedSeries((prev) => {
      const next = new Set(prev);
      if (next.has(seriesName)) next.delete(seriesName);
      else next.add(seriesName);
      return next;
    });
  };

  if (regionData.length === 0) {
    return (
      <div className="p-8 border border-dashed border-slate-700 rounded-xl bg-slate-800/40 text-slate-400 text-center">
        <p>Tidak ada Side Quest ditemukan di database.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* ─── Master-Detail Layout ─── */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* ─── LEFT: Region Sidebar (Desktop) / Horizontal Tabs (Mobile) ─── */}
        <div className="lg:w-1/4 shrink-0">
          {/* Mobile: Horizontal Scroll Tabs */}
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {leaves.map((leaf) => {
              const regionInfo = leaf.data;
              const isActive = leaf.id === selectedRegion;
              const selectedCount = countSelected(regionInfo);
              const parentLabel = formatRegionName(regionInfo.region);
              const mobileLabel = leaf.id.includes("::") ? `${parentLabel} · ${leaf.label}` : leaf.label;

              return (
                <button
                  key={leaf.id}
                  type="button"
                  onClick={() => setSelectedRegion(leaf.id)}
                  className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium border transition-all duration-200 flex items-center ${isActive
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                      : "border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white"
                    }`}
                >
                  <span>{mobileLabel}</span>
                  <div className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                      isActive ? "bg-white/20 text-white" : "bg-white/10 text-slate-200"
                  }`}>
                    {selectedCount > 0 ? `${selectedCount}/${regionInfo?.totalQuests || 0}` : (regionInfo?.totalQuests || 0)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop: Vertical Sidebar */}
          <div className="hidden lg:flex flex-col gap-1.5 rounded-xl border border-slate-700/60 bg-slate-800/40 p-2 sticky top-28">
            <div className="px-3 py-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 flex items-center gap-1.5">
                <ListFilter className="h-3 w-3" />
                Region
              </span>
            </div>
            {menuTree.map((node) => {
              const hasSubs = !!node.subRegions?.length;
              const isExpanded = hasSubs && expandedRegion === node.id;
              const hasActiveChild = !!node.subRegions?.some((s) => s.id === selectedRegion);
              const isActive = !hasSubs && node.id === selectedRegion;
              const selectedCount = countSelected(node.data);
              const badge = selectedCount > 0 ? `${selectedCount}/${node.data.totalQuests}` : node.data.totalQuests;

              return (
                <div key={node.id} className="flex flex-col gap-1">
                  <button
                    type="button"
                    aria-expanded={hasSubs ? isExpanded : undefined}
                    onClick={() => {
                      if (hasSubs) {
                        setExpandedRegion((prev) => (prev === node.id ? null : node.id));
                      } else {
                        setSelectedRegion(node.id);
                      }
                    }}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                        ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                        : "text-slate-300 hover:bg-slate-700/60 hover:text-white border border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`shrink-0 w-2 h-2 rounded-full transition-colors ${isActive || hasActiveChild ? "bg-blue-500" : "bg-slate-600"
                          }`}
                      />
                      <span className="text-left leading-tight">{node.label}</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <div
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-700 text-slate-200"
                        }`}
                      >
                        {badge}
                      </div>
                      {hasSubs && (
                        <ChevronDown
                          className="h-4 w-4 text-slate-400 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                        />
                      )}
                    </div>
                  </button>

                  {hasSubs && (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="sub"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.22, ease: EASE_OUT }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="ml-4 pl-3 border-l border-white/10 mt-2 space-y-1">
                            {node.subRegions!.map((sub) => {
                              const subActive = sub.id === selectedRegion;
                              const subSelected = countSelected(sub.data);
                              return (
                                <button
                                  key={sub.id}
                                  type="button"
                                  onClick={() => setSelectedRegion(sub.id)}
                                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${subActive
                                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                                      : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
                                    }`}
                                >
                                  <span className="text-left leading-tight">{sub.label}</span>
                                  <div
                                    className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                      subActive
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-slate-700 text-slate-200"
                                    }`}
                                  >
                                    {subSelected > 0 ? `${subSelected}/${sub.data.totalQuests}` : sub.data.totalQuests}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT: Content Area (75%) ─── */}
        <div className="lg:w-3/4 flex flex-col gap-4">
          {/* Header: Search + Select All */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari quest atau series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {/* Select All Button */}
            <button
              type="button"
              onClick={toggleSelectAllRegion}
              className={`flex items-center gap-2 shrink-0 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isAllRegionSelected
                  ? "border-emerald-500/50 bg-emerald-900/30 text-emerald-400"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isAllRegionSelected
                    ? "bg-emerald-600 border-emerald-600"
                    : "border-slate-500"
                  }`}
              >
                {isAllRegionSelected && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span>Pilih Semua</span>
              <span className="text-xs opacity-70">
                ({selectedInRegionCount}/{allIdsInRegion.size})
              </span>
              {isAllRegionSelected && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  -10%
                </span>
              )}
            </button>
          </div>

          {/* ─── Single Quests Section ─── */}
          {filteredSingleQuests.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-slate-700/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Quest Individu ({filteredSingleQuests.length})
                </span>
                <div className="h-px flex-1 bg-slate-700/60" />
              </div>

              <div className="flex flex-col gap-2">
                {filteredSingleQuests.map((quest) => {
                  const isSelected = selectedIds.has(quest.id);
                  return (
                    <button
                      key={quest.id}
                      type="button"
                      onClick={() => toggleQuest(quest.id)}
                      className={`group flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-200 ${isSelected
                          ? "border-blue-500/50 bg-blue-900/30 text-white shadow-[0_0_10px_rgba(37,99,235,0.15)]"
                          : "border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
                        }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 shrink-0 text-blue-500" />
                        ) : (
                          <Square className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-slate-400" />
                        )}
                        <span className="text-sm font-medium">
                          {quest.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {quest.astriteReward > 0 && (
                          <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/5">
                            <Image src="/icons/ui icon/astrite.webp" alt="Astrite" width={20} height={20} className="object-contain" unoptimized />
                            <span className="text-xs font-semibold text-slate-200">{quest.astriteReward}</span>
                          </div>
                        )}
                        <span
                          className={`text-sm font-semibold tracking-wide ${isSelected ? "text-blue-400" : "text-amber-400"
                            }`}
                        >
                          {formatRupiah(quest.flatPrice)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Chain Series Section ─── */}
          {filteredChainSeries.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-slate-700/60" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Chain Quest Series ({filteredChainSeries.length})
                </span>
                <div className="h-px flex-1 bg-slate-700/60" />
              </div>

              <div className="flex flex-col gap-3">
                {filteredChainSeries.map((series) => {
                  const allSeriesSelected = series.quests.every((q) =>
                    selectedIds.has(q.id)
                  );
                  const someSeriesSelected =
                    series.quests.some((q) => selectedIds.has(q.id)) &&
                    !allSeriesSelected;
                  const isExpanded = expandedSeries.has(series.seriesName);

                  return (
                    <div
                      key={series.seriesName}
                      className={`rounded-xl border overflow-hidden transition-all duration-200 ${allSeriesSelected
                          ? "border-blue-500/50 bg-blue-900/20"
                          : someSeriesSelected
                            ? "border-blue-500/30 bg-slate-800/60"
                            : "border-slate-700/60 bg-slate-800/40"
                        }`}
                    >
                      {/* Series Header */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Master Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleSeries(series)}
                            className="shrink-0"
                          >
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allSeriesSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : someSeriesSelected
                                    ? "bg-blue-600/50 border-blue-500"
                                    : "border-slate-500 hover:border-slate-400"
                                }`}
                            >
                              {(allSeriesSelected || someSeriesSelected) && (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          </button>

                          {/* Series Info */}
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-slate-100 truncate">
                              {series.seriesName}
                            </span>
                            <span className="text-xs text-slate-400">
                              {series.quests.length} quest dalam seri ini
                            </span>
                          </div>
                        </div>

                        {/* Price + Expand Toggle */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            {series.totalAstrite > 0 && (
                              <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded border border-white/5">
                                <Image src="/icons/ui icon/astrite.webp" alt="Astrite" width={14} height={14} className="object-contain" unoptimized />
                                <span className="text-xs font-semibold text-slate-200">{series.totalAstrite}</span>
                              </div>
                            )}
                            <span
                              className={`text-sm font-bold tracking-wide ${allSeriesSelected
                                  ? "text-blue-400"
                                  : "text-amber-400"
                                }`}
                            >
                              {formatRupiah(series.totalPrice)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              toggleExpandSeries(series.seriesName)
                            }
                            className="p-1 rounded-md hover:bg-slate-700/60 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Series Expanded Content (Accordion) */}
                      {isExpanded && (
                        <div className="border-t border-slate-700/40 px-4 py-3 flex flex-col gap-1.5 animate-in slide-in-from-top-2 fade-in duration-200">
                          {series.quests.map((quest) => {
                            const isSelected = selectedIds.has(quest.id);
                            return (
                              <button
                                key={quest.id}
                                type="button"
                                onClick={() => toggleQuest(quest.id)}
                                className={`group flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all duration-150 ${isSelected
                                    ? "border-blue-500/40 bg-blue-900/20 text-white"
                                    : "border-slate-700/30 bg-slate-900/30 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                                  }`}
                              >
                                <div className="flex items-center gap-2.5 text-left">
                                  {isSelected ? (
                                    <CheckSquare className="h-4 w-4 shrink-0 text-blue-500" />
                                  ) : (
                                    <Square className="h-4 w-4 shrink-0 text-slate-600 group-hover:text-slate-400" />
                                  )}
                                  <span className="text-sm">{quest.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-2">
                                  {quest.astriteReward > 0 && (
                                    <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/5">
                                      <Image src="/icons/ui icon/astrite.webp" alt="Astrite" width={12} height={12} className="object-contain" unoptimized />
                                      <span className="text-[11px] font-semibold text-slate-300">{quest.astriteReward}</span>
                                    </div>
                                  )}
                                  <span
                                    className={`text-xs font-semibold ${isSelected
                                        ? "text-blue-400"
                                        : "text-slate-500 group-hover:text-slate-400"
                                      }`}
                                  >
                                    {formatRupiah(quest.flatPrice)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty Search Results */}
          {filteredSingleQuests.length === 0 &&
            filteredChainSeries.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/40 py-12 text-center">
                <Search className="h-8 w-8 text-slate-500 mb-3" />
                <p className="text-sm text-slate-400">
                  Tidak ada quest yang cocok dengan pencarian{" "}
                  <span className="font-semibold text-slate-300">
                    &quot;{searchQuery}&quot;
                  </span>
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
