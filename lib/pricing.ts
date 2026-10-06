/**
 * SINGLE SOURCE OF TRUTH — Logika kalkulasi harga untuk seluruh tipe quest.
 *
 * Fungsi utama: calculateFlatPrice()
 * Digunakan oleh: prisma/seed.ts (seeding), app/actions/checkout.ts (checkout)
 */

export type CategoryType = 'MAIN' | 'COMPANION' | 'EXPLORATION' | 'MAP_EXPLORATION' | 'SIDE' | 'EVENT';

/**
 * Menghitung flatPrice berdasarkan tipe kategori, nama quest, astriteReward, dan priceOverride.
 *
 * Aturan:
 * - MAIN: astriteReward <= 100 → astriteReward * 200, sisanya (>100) → astriteReward * 150
 * - COMPANION: astriteReward * 200 (fallback 35000 jika astriteReward === 0)
 * - EXPLORATION, SIDE, MAP_EXPLORATION, default:
 *   1. priceOverride ada → return priceOverride
 *   2. astriteReward === 0 → return 2000 (base fee)
 *   3. Selain itu → astriteReward * 200
 */
export function calculateFlatPrice(quest: {
  name: string;
  categoryType: CategoryType;
  astriteReward: number;
  priceOverride?: number | null;
}): number {
  switch (quest.categoryType) {
    case 'MAIN': {
      // astriteReward <= 100 → astriteReward * 200
      // astriteReward > 100 → astriteReward * 150
      const multiplier = quest.astriteReward <= 100 ? 200 : 150;
      return quest.astriteReward * multiplier;
    }

    case 'COMPANION':
      // astriteReward * 200, fallback 35000 jika astriteReward === 0
      return quest.astriteReward > 0 ? quest.astriteReward * 200 : 35000;

    case 'EXPLORATION':
    case 'SIDE':
    case 'MAP_EXPLORATION':
    default:
      // 1. priceOverride → return langsung
      if (quest.priceOverride !== null && quest.priceOverride !== undefined) {
        return quest.priceOverride;
      }
      // 2. astriteReward === 0 → base fee 2000
      if (quest.astriteReward === 0) {
        return 2000;
      }
      // 3. Kalkulasi standar
      return quest.astriteReward * 200;
  }
}

/**
 * Backward-compatible wrapper — dipakai oleh app/actions/side-quests.ts
 * yang hanya mengirim { priceOverride, astriteReward }.
 */
export function calculateQuestPrice(quest: {
  priceOverride: number | null;
  astriteReward: number;
}): number {
  return calculateFlatPrice({
    name: '',
    categoryType: 'SIDE',
    astriteReward: quest.astriteReward,
    priceOverride: quest.priceOverride,
  });
}

/**
 * Menghitung total harga dari array quest menggunakan calculateQuestPrice.
 */
export function calculateSeriesPrice(
  quests: { priceOverride: number | null; astriteReward: number }[]
): number {
  return quests.reduce((sum, q) => sum + calculateQuestPrice(q), 0);
}
