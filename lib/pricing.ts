/**
 * Utility fungsi kalkulasi harga untuk Side Quest boosting service.
 *
 * Urutan prioritas logika:
 * 1. Jika quest.priceOverride ada nilainya (tidak null) → return nilai tersebut
 * 2. Jika quest.astriteReward === 0 → return 2000 (Base fee)
 * 3. Selain kondisi di atas → return quest.astriteReward * 200
 */

export function calculateQuestPrice(quest: {
  priceOverride: number | null;
  astriteReward: number;
}): number {
  // Prioritas 1: priceOverride
  if (quest.priceOverride !== null && quest.priceOverride !== undefined) {
    return quest.priceOverride;
  }

  // Prioritas 2: Base fee jika tidak ada astrite reward
  if (quest.astriteReward === 0) {
    return 2000;
  }

  // Prioritas 3: Kalkulasi standar
  return quest.astriteReward * 200;
}

/**
 * Menghitung total harga dari array quest menggunakan calculateQuestPrice.
 */
export function calculateSeriesPrice(
  quests: { priceOverride: number | null; astriteReward: number }[]
): number {
  return quests.reduce((sum, q) => sum + calculateQuestPrice(q), 0);
}
