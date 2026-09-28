"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, CheckSquare, Square, RotateCcw } from "lucide-react";
import { useStickyState } from "@/hooks/useStickyState";
import { mainQuestsData, MainQuest as Quest, MainQuestRegion as RegionData } from "../data/mainQuests";

interface FlattenedQuest extends Quest {
  regionName: string;
  globalIndex: number;
}

interface MainQuestCatalogProps {
  onTotalChange?: (total: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function MainQuestCatalog({
  onTotalChange,
  onSelectionChange,
}: MainQuestCatalogProps) {
  // Data dari JSON
  const regions: RegionData[] = mainQuestsData;

  // Flatten Data & Berikan Global Index
  const flattenedQuests = useMemo<FlattenedQuest[]>(() => {
    let index = 0;
    return regions.flatMap((region) =>
      region.quests.map((quest) => ({
        ...quest,
        regionName: region.region,
        globalIndex: index++,
      }))
    );
  }, [regions]);

  // State selection (Range)
  const [selection, setSelection] = useStickyState<{ start: number | null; end: number | null }>({
    start: null,
    end: null,
  }, "joki_mainQuestSelection");

  // State untuk melacak accordion mana yang terbuka
  const [openRegions, setOpenRegions] = useStickyState<Set<string>>(
    new Set(),
    "joki_mainQuestOpenRegions",
    (set) => JSON.stringify(Array.from(set)),
    (str) => new Set(JSON.parse(str))
  );

  // Kalkulasi harga berdasarkan range (start s.d. end)
  const totalPrice = useMemo(() => {
    if (selection.start === null || selection.end === null) return 0;
    let total = 0;
    flattenedQuests.forEach((quest) => {
      if (quest.globalIndex >= selection.start! && quest.globalIndex <= selection.end!) {
        total += quest.price;
      }
    });
    return total;
  }, [selection, flattenedQuests]);

  // Dapatkan array ID yang terpilih
  const selectedIds = useMemo(() => {
    if (selection.start === null || selection.end === null) return [];
    return flattenedQuests
      .filter(
        (q) => q.globalIndex >= selection.start! && q.globalIndex <= selection.end!
      )
      .map((q) => q.id);
  }, [selection, flattenedQuests]);

  // Beritahu parent component jika ada perubahan total harga atau pilihan
  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalPrice);
    }
    if (onSelectionChange) {
      onSelectionChange(selectedIds);
    }
  }, [totalPrice, selectedIds, onTotalChange, onSelectionChange]);

  const toggleRegion = (regionName: string) => {
    setOpenRegions((prev) => {
      const next = new Set(prev);
      if (next.has(regionName)) {
        next.delete(regionName);
      } else {
        next.add(regionName);
      }
      return next;
    });
  };

  const handleQuestClick = (globalIndex: number) => {
    setSelection((prev) => {
      if (prev.start === null) {
        // Titik awal pelanggan
        return { start: globalIndex, end: globalIndex };
      }
      if (globalIndex > prev.start) {
        // Atur sebagai end
        return { ...prev, end: globalIndex };
      }
      if (globalIndex < prev.start) {
        // Reset start dan end ke index baru
        return { start: globalIndex, end: globalIndex };
      }

      // Jika mengklik start lagi, kita bisa mereset atau tetap sama
      // Untuk UI ini kita bisa anggap tetap sama
      return { start: globalIndex, end: globalIndex };
    });
  };

  const handleReset = () => {
    setSelection({ start: null, end: null });
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-4 text-slate-200">
      {/* Header Aksi (Reset) */}
      <div className="flex items-center justify-between bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-amber-400">Penting:</span> Main Quest harus dikerjakan secara berurutan. Klik pada quest awal, lalu klik pada quest akhir untuk memilih rentang.
        </p>
        <button
          onClick={handleReset}
          disabled={selection.start === null}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${selection.start !== null
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
              : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-50"
            }`}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Pilihan
        </button>
      </div>

      {regions.map((region) => {
        const isOpen = openRegions.has(region.region);
        const regionQuests = flattenedQuests.filter((q) => q.regionName === region.region);

        // Cek berapa quest di region ini yang terpilih
        const selectedCountInRegion = regionQuests.filter(
          (q) =>
            selection.start !== null &&
            selection.end !== null &&
            q.globalIndex >= selection.start &&
            q.globalIndex <= selection.end
        ).length;

        return (
          <div
            key={region.region}
            className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/40 shadow-sm"
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleRegion(region.region)}
              className="flex w-full items-center justify-between bg-slate-800/60 p-4 transition-colors hover:bg-slate-700/60"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="font-semibold text-white">
                  {region.region}
                </span>
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                  {region.quests.length} Quests
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-xs ${selectedCountInRegion > 0 ? "text-emerald-400 font-medium" : "text-slate-400"}`}>
                  {selectedCountInRegion} / {region.quests.length} Dipilih
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="p-4 border-t border-slate-700/50">
                {/* Quest List */}
                <div className="flex flex-col gap-2">
                  {regionQuests.map((quest) => {
                    const isSelected =
                      selection.start !== null &&
                      selection.end !== null &&
                      quest.globalIndex >= selection.start &&
                      quest.globalIndex <= selection.end;

                    const isDisabled =
                      selection.start !== null && quest.globalIndex < selection.start;

                    return (
                      <button
                        key={quest.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleQuestClick(quest.globalIndex)}
                        className={`group flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-200 ${isDisabled
                            ? "border-slate-700/30 bg-slate-900/30 text-slate-500 opacity-50 cursor-not-allowed"
                            : isSelected
                              ? "border-blue-500/50 bg-blue-900/30 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                              : "border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
                          }`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 shrink-0 text-blue-500" />
                          ) : (
                            <Square className={`h-5 w-5 shrink-0 ${isDisabled ? "text-slate-600" : "text-slate-500 group-hover:text-slate-400"}`} />
                          )}
                          <span className={`text-sm font-medium ${isDisabled ? "text-slate-600" : ""}`}>
                            {quest.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold tracking-wide ${isDisabled
                              ? "text-slate-600"
                              : isSelected
                                ? "text-blue-400"
                                : "text-amber-400"
                            }`}
                        >
                          {formatRupiah(quest.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
