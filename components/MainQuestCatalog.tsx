"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, CheckSquare, Square, Check } from "lucide-react";
import { useStickyState } from "@/hooks/useStickyState";


const MAIN_QUEST_RATE = 250;

interface FlattenedQuest {
  id: string;
  name: string;
  astrite?: number;
  price: number;
  regionName: string;
  globalIndex: number;
}

interface MainQuestCatalogProps {
  dbCategories: any[];
  onTotalChange?: (total: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function MainQuestCatalog({
  dbCategories,
  onTotalChange,
  onSelectionChange,
}: MainQuestCatalogProps) {
  const regions = useMemo(() => {
    return dbCategories.map((c: any) => ({
      region: c.name,
      quests: c.quests.map((q: any) => ({
        id: q.id,
        name: q.name,
        astrite: q.astriteReward,
        price: q.flatPrice || 0
      }))
    }));
  }, [dbCategories]);

  const flattenedQuests = useMemo<FlattenedQuest[]>(() => {
    let index = 0;
    return regions.flatMap((region: any) =>
      region.quests.map((quest: any) => ({
        ...quest,
        regionName: region.region,
        globalIndex: index++,
      }))
    );
  }, [regions]);

  const [selectedIds, setSelectedIds] = useStickyState<Set<string>>(
    new Set(),
    "joki_mainQuestSelectionSet_v2",
    (set) => JSON.stringify(Array.from(set)),
    (str) => new Set(JSON.parse(str))
  );

  const [openRegions, setOpenRegions] = useStickyState<Set<string>>(
    new Set(),
    "joki_mainQuestOpenRegions_v2",
    (set) => JSON.stringify(Array.from(set)),
    (str) => new Set(JSON.parse(str))
  );

  const minSelectedIndex = useMemo(() => {
    if (selectedIds.size === 0) return -1;
    let min = Infinity;
    selectedIds.forEach((id) => {
      const quest = flattenedQuests.find(q => q.id === id);
      if (quest && quest.globalIndex < min) {
        min = quest.globalIndex;
      }
    });
    return min;
  }, [selectedIds, flattenedQuests]);

  const getQuestPrice = (quest: FlattenedQuest) => {
    return 'astrite' in quest ? (quest as any).astrite * MAIN_QUEST_RATE : quest.price;
  };

  const totalPrice = useMemo(() => {
    let total = 0;
    
    regions.forEach((region) => {
      const regionQuests = flattenedQuests.filter((q) => q.regionName === region.region);
      const selectedInRegion = regionQuests.filter((q) => selectedIds.has(q.id));
      
      if (selectedInRegion.length > 0) {
        let regionPrice = 0;
        selectedInRegion.forEach((q) => {
          regionPrice += getQuestPrice(q);
        });

        if (selectedInRegion.length === regionQuests.length) {
          regionPrice = regionPrice * 0.9;
        }

        total += regionPrice;
      }
    });
    
    return total;
  }, [selectedIds, flattenedQuests, regions]);

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalPrice);
    }
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedIds));
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

  const handleQuestClick = (questId: string, isDisabled: boolean, targetIndex: number) => {
    if (isDisabled) return;
    
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const isSelected = next.has(questId);

      if (isSelected) {
        // Hapus quest ini dan SEMUA quest yang memiliki index lebih besar
        flattenedQuests.forEach((q) => {
          if (q.globalIndex >= targetIndex) {
            next.delete(q.id);
          }
        });
      } else {
        if (next.size === 0) {
          next.add(questId);
        } else {
          // Cari maxSelectedIndex
          let maxIndex = -1;
          next.forEach((id) => {
            const q = flattenedQuests.find(q => q.id === id);
            if (q && q.globalIndex > maxIndex) {
              maxIndex = q.globalIndex;
            }
          });

          // Auto-Fill Gap
          if (targetIndex > maxIndex) {
            for (let i = maxIndex + 1; i <= targetIndex; i++) {
              const q = flattenedQuests.find(q => q.globalIndex === i);
              if (q) next.add(q.id);
            }
          } else {
            next.add(questId);
          }
        }
      }
      return next;
    });
  };

  const handleSelectAll = (chapterQuests: FlattenedQuest[], isAllSelected: boolean) => {
    if (chapterQuests.length === 0) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      chapterQuests.forEach((q) => {
        if (isAllSelected) {
          next.delete(q.id);
        } else {
          next.add(q.id);
        }
      });
      return next;
    });
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
      {regions.map((region) => {
        const isOpen = openRegions.has(region.region);
        const regionQuests = flattenedQuests.filter((q) => q.regionName === region.region);
        
        const selectedCountInRegion = regionQuests.filter((q) => selectedIds.has(q.id)).length;
        const isAllSelected = selectedCountInRegion === regionQuests.length && regionQuests.length > 0;

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
              <div className="border-t border-slate-700/50">
                {/* Select All Bar */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-700/50 bg-[#131C31]/50 cursor-pointer hover:bg-slate-700/30 transition-colors" onClick={() => handleSelectAll(regionQuests, isAllSelected)}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAllSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
                    {isAllSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm font-bold text-slate-200">Pilih Semua {region.region}</span>
                  {isAllSelected && (
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      -10% Diskon
                    </span>
                  )}
                </div>

                {/* Quest List */}
                <div className="flex flex-col gap-2 p-4">
                  {regionQuests.map((quest) => {
                    const isSelected = selectedIds.has(quest.id);
                    const isDisabled = selectedIds.size > 0 && quest.globalIndex < minSelectedIndex;

                    return (
                      <button
                        key={quest.id}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleQuestClick(quest.id, isDisabled, quest.globalIndex)}
                        className={`group flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-200 ${
                            isDisabled
                              ? "border-slate-700/30 bg-slate-900/30 opacity-50 cursor-not-allowed"
                              : isSelected
                                ? "border-blue-500/50 bg-blue-900/30 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                                : "border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
                          }`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          {isSelected ? (
                            <CheckSquare className="h-5 w-5 shrink-0 text-blue-500" />
                          ) : (
                            <Square className={`h-5 w-5 shrink-0 ${isDisabled ? 'text-slate-500' : 'text-slate-500 group-hover:text-slate-400'}`} />
                          )}
                          <span className={`text-sm font-medium ${isDisabled ? 'text-slate-500' : ''}`}>
                            {quest.name}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-semibold tracking-wide ${
                              isDisabled
                                ? "text-slate-500"
                                : isSelected
                                  ? "text-blue-400"
                                  : "text-amber-400"
                            }`}
                        >
                          {formatRupiah(getQuestPrice(quest))}
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
