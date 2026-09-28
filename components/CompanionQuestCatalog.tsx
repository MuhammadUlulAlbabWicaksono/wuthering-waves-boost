"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CheckSquare, Square } from "lucide-react";
import { companionQuestsData, CompanionQuest as Quest } from "../data/companionQuests";

interface CompanionQuestCatalogProps {
  onTotalChange?: (total: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function CompanionQuestCatalog({
  onTotalChange,
  onSelectionChange,
}: CompanionQuestCatalogProps) {
  const quests: Quest[] = companionQuestsData;

  const [selectedQuests, setSelectedQuests] = useState<Set<string>>(new Set());

  // Kalkulasi total harga
  const totalPrice = useMemo(() => {
    let total = 0;
    quests.forEach((quest) => {
      if (selectedQuests.has(quest.id)) {
        total += quest.price;
      }
    });
    return total;
  }, [selectedQuests, quests]);

  // Beritahu parent component jika ada perubahan
  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(totalPrice);
    }
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedQuests));
    }
  }, [totalPrice, selectedQuests, onTotalChange, onSelectionChange]);

  const handleToggleQuest = (questId: string) => {
    setSelectedQuests((prev) => {
      const next = new Set(prev);
      if (next.has(questId)) {
        next.delete(questId);
      } else {
        next.add(questId);
      }
      return next;
    });
  };

  const allSelected = quests.length > 0 && selectedQuests.size === quests.length;
  const someSelected = selectedQuests.size > 0 && !allSelected;

  const handleSelectAll = () => {
    setSelectedQuests((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        // Unselect all
        quests.forEach((q) => next.delete(q.id));
      } else {
        // Select all
        quests.forEach((q) => next.add(q.id));
      }
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
    <div className="flex flex-col gap-6 text-slate-200">
      {/* Tombol Pilih Semua */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <button
          type="button"
          onClick={handleSelectAll}
          className="flex items-center gap-2 text-sm font-semibold transition-colors hover:text-white"
        >
          {allSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-500" />
          ) : someSelected ? (
            <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-blue-500 bg-blue-500/20">
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
            </div>
          ) : (
            <Square className="h-5 w-5 text-slate-500" />
          )}
          <span>Pilih Semua Companion Quest</span>
        </button>
        <span className="text-xs font-medium text-slate-400">
          {selectedQuests.size} / {quests.length} Dipilih
        </span>
      </div>

      {/* Grid Katalog Quest */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quests.map((quest) => {
          const isSelected = selectedQuests.has(quest.id);
          return (
            <button
              key={quest.id}
              type="button"
              onClick={() => handleToggleQuest(quest.id)}
              className={`group flex items-center justify-between rounded-xl border px-4 py-4 transition-all duration-200 ${
                isSelected
                  ? "border-blue-500 bg-blue-900/30 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700/80"
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                {isSelected ? (
                  <CheckSquare className="h-5 w-5 shrink-0 text-blue-500" />
                ) : (
                  <Square className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-slate-400" />
                )}
                <span className="text-sm font-medium leading-tight">
                  {quest.name}
                </span>
              </div>
              <span
                className={`text-sm font-semibold tracking-wide shrink-0 ml-2 ${
                  isSelected ? "text-blue-400" : "text-slate-400"
                }`}
              >
                {formatRupiah(quest.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
