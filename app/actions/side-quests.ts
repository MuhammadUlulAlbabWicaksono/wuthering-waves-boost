'use server'

import prisma from '@/lib/prisma';
import { calculateQuestPrice, calculateSeriesPrice } from '@/lib/pricing';

// ─── Type Definitions ───

export type QuestWithPrice = {
  id: string;
  name: string;
  region: string;
  isChain: boolean;
  seriesName: string | null;
  astriteReward: number;
  priceOverride: number | null;
  calculatedPrice: number;
};

export type ChainSeries = {
  seriesName: string;
  quests: QuestWithPrice[];
  totalSeriesPrice: number;
};

export type RegionGroup = {
  region: string;
  singleQuests: QuestWithPrice[];
  chainSeries: ChainSeries[];
};

// ─── Server Action ───

/**
 * Mengambil semua side quest dari database, lalu melakukan grouping:
 * - Per region (Huanglong, The Black Shores, Rinascita, Roya Frostlands)
 * - Dalam tiap region: singleQuests (isChain=false) vs chainSeries (isChain=true, grouped by seriesName)
 * - Setiap quest diberi field `calculatedPrice`
 * - Setiap chain series diberi field `totalSeriesPrice`
 */
export async function getSideQuestsGrouped(): Promise<RegionGroup[]> {
  // 1. Fetch side quests — quest yang punya region (dari CSV) bukan string kosong
  const quests = await prisma.quest.findMany({
    where: {
      region: { not: '' },
    },
    orderBy: [
      { region: 'asc' },
      { name: 'asc' },
    ],
  });

  // 2. Attach calculatedPrice ke setiap quest
  const questsWithPrice: QuestWithPrice[] = quests.map((q) => ({
    id: q.id,
    name: q.name,
    region: q.region,
    isChain: q.isChain,
    seriesName: q.seriesName,
    astriteReward: q.astriteReward,
    priceOverride: q.priceOverride,
    calculatedPrice: calculateQuestPrice(q),
  }));

  // 3. Group by region
  const regionMap = new Map<string, QuestWithPrice[]>();
  for (const q of questsWithPrice) {
    const list = regionMap.get(q.region) || [];
    list.push(q);
    regionMap.set(q.region, list);
  }

  // 4. Per region: split singleQuests vs chainSeries
  const result: RegionGroup[] = [];

  for (const [region, regionQuests] of regionMap) {
    // Single quests = isChain false
    const singleQuests = regionQuests.filter((q) => !q.isChain);

    // Chain quests grouped by seriesName
    const chainMap = new Map<string, QuestWithPrice[]>();
    for (const q of regionQuests.filter((q) => q.isChain)) {
      const key = q.seriesName || 'Unknown Series';
      const list = chainMap.get(key) || [];
      list.push(q);
      chainMap.set(key, list);
    }

    const chainSeries: ChainSeries[] = [];
    for (const [seriesName, seriesQuests] of chainMap) {
      chainSeries.push({
        seriesName,
        quests: seriesQuests,
        totalSeriesPrice: calculateSeriesPrice(seriesQuests),
      });
    }

    result.push({ region, singleQuests, chainSeries });
  }

  return result;
}
