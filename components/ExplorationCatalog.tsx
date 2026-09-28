"use client";

import React, { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronUp, CheckSquare, Square, Star } from "lucide-react";
import Image from "next/image";
import { useStickyState } from "@/hooks/useStickyState";
import { explorationData, type AreaItem, type RegionContent } from "../data/exploration";

interface ExplorationCatalogProps {
  onTotalChange?: (total: number) => void;
  onSelectionChange?: (selectedAreas: string[]) => void;
}

export default function ExplorationCatalog({
  onTotalChange,
  onSelectionChange,
}: ExplorationCatalogProps) {
  const regions = Object.keys(explorationData);

  // State untuk melacak accordion mana yang terbuka
  const [openRegions, setOpenRegions] = useStickyState<Set<string>>(
    new Set([regions[0]]),
    "joki_explorationOpenRegions",
    (set) => JSON.stringify(Array.from(set)),
    (str) => new Set(JSON.parse(str))
  );

  // State untuk melacak area yang dipilih (menggunakan nama area)
  const [selectedAreas, setSelectedAreas] = useStickyState<Set<string>>(
    new Set(),
    "joki_explorationSelection",
    (set) => JSON.stringify(Array.from(set)),
    (str) => new Set(JSON.parse(str))
  );

  // Helper untuk menormalisasi data area
  const normalizeArea = (item: AreaItem) => {
    if (typeof item === "string") {
      return { name: item, price: 60000 };
    }
    return item;
  };

  // Helper untuk mendapatkan semua area dalam satu region (mendukung sub-region seperti Lahai-Roi)
  const getRegionAreas = (regionName: string) => {
    const content = explorationData[regionName];
    let areas: { name: string; price: number }[] = [];

    if (Array.isArray(content)) {
      areas = content.map(normalizeArea);
    } else {
      Object.values(content).forEach((subArr) => {
        areas = [...areas, ...(subArr as AreaItem[]).map(normalizeArea)];
      });
    }
    return areas;
  };

  // Hitung total harga dengan logika diskon 10% jika memilih semua di 1 region
  const totalPrice = useMemo(() => {
    let total = 0;

    regions.forEach((regionName) => {
      const areas = getRegionAreas(regionName);
      let regionTotal = 0;
      let selectedCount = 0;

      areas.forEach((area) => {
        if (selectedAreas.has(area.name)) {
          regionTotal += area.price;
          selectedCount++;
        }
      });

      // Aplikasikan diskon 10% jika semua quest di region ini dipilih
      if (selectedCount === areas.length && areas.length > 0) {
        regionTotal = regionTotal * 0.9;
      }

      total += regionTotal;
    });

    return total;
  }, [selectedAreas, regions]);

  // Beritahu parent component jika ada perubahan total harga atau pilihan
  useEffect(() => {
    if (onTotalChange) onTotalChange(totalPrice);
    if (onSelectionChange) onSelectionChange(Array.from(selectedAreas));
  }, [totalPrice, selectedAreas, onTotalChange, onSelectionChange]);

  // Fungsi Buka/Tutup Accordion
  const toggleRegion = (regionName: string) => {
    setOpenRegions((prev) => {
      const next = new Set(prev);
      if (next.has(regionName)) next.delete(regionName);
      else next.add(regionName);
      return next;
    });
  };

  // Fungsi Pilih 1 Area
  const handleToggleArea = (areaName: string) => {
    setSelectedAreas((prev) => {
      const next = new Set(prev);
      if (next.has(areaName)) next.delete(areaName);
      else next.add(areaName);
      return next;
    });
  };

  // Fungsi Pilih Semua Area di Region tertentu
  const handleSelectAllRegion = (regionName: string) => {
    const areas = getRegionAreas(regionName);
    const allSelected = areas.every((a) => selectedAreas.has(a.name));

    setSelectedAreas((prev) => {
      const next = new Set(prev);
      areas.forEach((a) => {
        if (allSelected) {
          next.delete(a.name); // Deselect All
        } else {
          next.add(a.name); // Select All
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

  // Sub-Komponen UI untuk Kartu Area (List Item)
  const AreaCard = ({ area }: { area: { name: string; price: number } }) => {
    const isSelected = selectedAreas.has(area.name);
    const price = area.price;

    return (
      <button
        type="button"
        onClick={() => handleToggleArea(area.name)}
        className={`group flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-200 ${isSelected
          ? "border-blue-500/50 bg-blue-900/30 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]"
          : "border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
          }`}
      >
        {/* Kiri: Checkbox & Nama Quest */}
        <div className="flex items-center gap-3 text-left">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 shrink-0 text-blue-500" />
          ) : (
            <Square className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-slate-400" />
          )}
          <span className="text-sm font-medium">
            {area.name}
          </span>
        </div>

        {/* Kanan: Badge & Harga */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center justify-center bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50">
            <span className="text-xs font-semibold tracking-wide text-slate-400">100% Clear</span>
          </div>
          <span className={`text-sm font-semibold tracking-wide w-20 text-right ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
            {formatRupiah(price)}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4 text-slate-200">
      {regions.map((regionName) => {
        const isOpen = openRegions.has(regionName);
        const allAreas = getRegionAreas(regionName);
        const selectedCountInRegion = allAreas.filter((a) => selectedAreas.has(a.name)).length;
        const isAllSelected = selectedCountInRegion === allAreas.length && allAreas.length > 0;

        return (
          <div
            key={regionName}
            className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/40 shadow-sm"
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleRegion(regionName)}
              className="flex w-full items-center justify-between bg-slate-800/60 p-4 transition-colors hover:bg-slate-700/60"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="font-bold text-slate-200 text-lg">
                  {regionName}
                </span>
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300 ml-2">
                  {allAreas.length} Quests
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`text-sm ${selectedCountInRegion > 0 ? "text-emerald-400 font-medium" : "text-slate-400"}`}>
                  {selectedCountInRegion} / {allAreas.length} Dipilih
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

                {/* Baris "Select All" */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <button
                    onClick={() => handleSelectAllRegion(regionName)}
                    className="flex items-center gap-3 group"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Square className="h-5 w-5 text-slate-500 group-hover:text-slate-400" />
                    )}
                    <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                      Pilih Semua {regionName}
                    </span>
                    {isAllSelected && (
                      <span className="ml-3 text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md border border-emerald-500/30">
                        -10% Diskon
                      </span>
                    )}
                  </button>
                </div>

                {/* List Quest (Satu Kolom - Flex Col) */}
                <div className="flex flex-col gap-2">
                  {Array.isArray(explorationData[regionName]) ? (
                    // Render untuk Region Normal (Huanglong, Rinascita)
                    (explorationData[regionName] as AreaItem[]).map((item, idx) => (
                      <AreaCard key={idx} area={normalizeArea(item)} />
                    ))
                  ) : (
                    // Render untuk Region yang memiliki Sub-Region (Lahai-Roi)
                    Object.entries(explorationData[regionName] as Record<string, AreaItem[]>).map(([subRegion, items]) => (
                      <div key={subRegion} className="flex flex-col gap-2 mt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mt-2">
                          {subRegion}
                        </span>
                        {items.map((item, idx) => (
                          <AreaCard key={`${subRegion}-${idx}`} area={normalizeArea(item)} />
                        ))}
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}