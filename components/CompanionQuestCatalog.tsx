"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CheckSquare, Square, Check } from "lucide-react";

interface CompanionQuestCatalogProps {
  dbCategories: any[];
  onTotalChange?: (total: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function CompanionQuestCatalog({
  dbCategories,
  onTotalChange,
  onSelectionChange,
}: CompanionQuestCatalogProps) {
  const quests = useMemo(() => {
    return dbCategories.flatMap(c => 
      c.quests.map((q: any) => ({
        id: q.id,
        name: q.name,
        price: q.flatPrice || 0
      }))
    );
  }, [dbCategories]);

  const [selectedQuests, setSelectedQuests] = useState<Set<string>>(new Set());

  // Kalkulasi total harga
  const totalPrice = useMemo(() => {
    let total = 0;
    quests.forEach((quest) => {
      if (selectedQuests.has(quest.id)) {
        total += quest.price;
      }
    });

    if (quests.length > 0 && selectedQuests.size === quests.length) {
      total = total * 0.9;
    }

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
      <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-700/60 bg-slate-800/40 cursor-pointer hover:bg-slate-700/60 transition-colors" onClick={handleSelectAll}>
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${allSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}`}>
          {allSelected && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm font-bold text-slate-200 flex-1">Pilih Semua Companion Quest</span>
        {allSelected && (
          <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            -10% Diskon
          </span>
        )}
        <span className="text-xs font-medium text-slate-400 ml-4">
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
