"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckSquare, Square, Star } from 'lucide-react';
import { explorationQuestData } from '../data/explorationQuest';
import { useStickyState } from '@/hooks/useStickyState';


const AST_RATE = 200;

interface QuestCatalogProps {
  onTotalChange?: (total: number) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
}

export default function QuestCatalog({ onTotalChange, onSelectionChange }: QuestCatalogProps) {
  const regions = Object.keys(explorationQuestData);
  // Default to having the first region expanded
  const [expandedRegions, setExpandedRegions] = useStickyState<Set<string>>(
    new Set([regions[0]]),
    "joki_questOpenRegions",
    (set) => JSON.stringify(Array.from(set)),
    (str) => new Set(JSON.parse(str))
  );
  const [selectedQuests, setSelectedQuests] = useStickyState<Set<string>>(
    new Set(),
    "joki_questSelection",
    (set) => JSON.stringify(Array.from(set)),
    (str) => new Set(JSON.parse(str))
  );

  const toggleRegionExpansion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) {
        next.delete(region);
      } else {
        next.add(region);
      }
      return next;
    });
  };

  const handleToggleQuest = (regionName: string, questName: string) => {
    const questId = `${regionName}|${questName}`;
    setSelectedQuests(prev => {
      const next = new Set(prev);
      if (next.has(questId)) {
        next.delete(questId);
      } else {
        next.add(questId);
      }
      return next;
    });
  };



  const summary = useMemo(() => {
    let finalPrice = 0;

    regions.forEach(region => {
      const questsInRegion = explorationQuestData[region];
      const selectedInRegion = questsInRegion.filter(q => selectedQuests.has(`${region}|${q.name}`));

      if (selectedInRegion.length > 0) {
        let regionAstrite = 0;
        selectedInRegion.forEach(q => {
          regionAstrite += q.astrite;
        });

        const regionOriginalPrice = regionAstrite * AST_RATE;

        finalPrice += regionAstrite * AST_RATE;
      }
    });

    return { finalPrice };
  }, [selectedQuests, regions]);

  useEffect(() => {
    if (onTotalChange) {
      onTotalChange(summary.finalPrice);
    }
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedQuests));
    }
  }, [summary.finalPrice, selectedQuests, onTotalChange, onSelectionChange]);

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
      {regions.map(region => {
        const questsInRegion = explorationQuestData[region];
        const isExpanded = expandedRegions.has(region);
        const selectedInRegion = questsInRegion.filter(q => selectedQuests.has(`${region}|${q.name}`));
        const allSelected = selectedInRegion.length === questsInRegion.length;

        return (
          <div key={region} className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-800/40 shadow-sm mb-4">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleRegionExpansion(region)}
              className="flex w-full items-center justify-between bg-slate-800/60 p-4 transition-colors hover:bg-slate-700/60"
            >
              <div className="flex items-center">
                <h3 className="font-bold text-slate-200 text-lg">{region}</h3>
                <span className="bg-slate-700/50 text-slate-400 text-xs px-2 py-1 rounded-full ml-3">
                  {questsInRegion.length} Quests
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${selectedInRegion.length > 0 ? "text-emerald-400 font-medium" : "text-slate-400"}`}>
                  {selectedInRegion.length} / {questsInRegion.length} Dipilih
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </div>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div className="mb-6 px-1 animate-in slide-in-from-top-2 fade-in duration-200">


                {/* Single Column Layout */}
                <div className="flex flex-col gap-2 border-t border-slate-700/50 p-4">
                  {questsInRegion.map(quest => {
                    const questId = `${region}|${quest.name}`;
                    const isSelected = selectedQuests.has(questId);
                    const price = quest.astrite * AST_RATE;

                    return (
                      <button
                        key={quest.name}
                        type="button"
                        onClick={() => handleToggleQuest(region, quest.name)}
                        className={`group flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-200 ${isSelected
                          ? "border-blue-500/50 bg-blue-900/30 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                          : "border-slate-700/50 bg-slate-900/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/80"
                          }`}
                      >
                        {/* Bagian Kiri */}
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

                        {/* Bagian Kanan */}
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="flex items-center gap-1 bg-slate-900/50 px-2 py-1 rounded-md border border-slate-700/50">
                            <Star className="text-amber-500 fill-amber-500 w-3.5 h-3.5" />
                            <span className="text-amber-500 font-bold text-sm">{quest.astrite}</span>
                          </div>
                          <span className={`text-sm font-semibold tracking-wide w-20 text-right ${isSelected ? 'text-blue-400' : 'text-slate-400'}`}>
                            Rp {price.toLocaleString('id-ID')}
                          </span>
                        </div>
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
