/**
 * ULTIMATE SEED — Satu-satunya skrip injeksi database.
 *
 * Alur:
 * 1. Wipe seluruh database (OrderItem → Order → Quest → QuestCategory)
 * 2. Inject 108 Core Quests (Main + Companion + Map Exploration) dari hardcode
 * 3. Inject Side Quests dari CSV (Wuthering_Waves_Side_Quest_Dictionary.csv)
 * 4. Inject Exploration Quests dari CSV (Wuthering_Waves_Exploration_Quest_Dictionary.csv)
 *
 * Jalankan: npx tsx prisma/seed.ts
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { calculateFlatPrice } from '../lib/pricing';
import type { CategoryType } from '../lib/pricing';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// ─── Prisma Client Setup ───
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Category Helper (Anti-Duplikasi) ───
const categoryCache = new Map<string, string>();

async function getOrCreateCategoryId(regionOrLabel: string, type: CategoryType): Promise<string> {
  let cleanName: string;
  switch (type) {
    case 'MAP_EXPLORATION':
      cleanName = `Map Exploration 100% - ${regionOrLabel}`;
      break;
    case 'EXPLORATION':
      cleanName = `Exploration Quests - ${regionOrLabel}`;
      break;
    case 'SIDE':
      cleanName = `Side Quests - ${regionOrLabel}`;
      break;
    case 'COMPANION':
      cleanName = `Companion Story`;
      break;
    case 'MAIN':
      cleanName = `Main Quest - ${regionOrLabel}`;
      break;
    default:
      cleanName = `${type} - ${regionOrLabel}`;
  }

  if (categoryCache.has(cleanName)) return categoryCache.get(cleanName)!;

  const cat = await prisma.questCategory.create({
    data: { name: cleanName, type }
  });
  categoryCache.set(cleanName, cat.id);
  return cat.id;
}

// ─── CSV Reader Helper ───
async function readCsv(filePath: string): Promise<Record<string, string>[]> {
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File CSV tidak ditemukan: ${filePath}, melewati...`);
    return [];
  }
  const rows: Record<string, string>[] = [];
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: Record<string, string>) => rows.push(data))
      .on('end', resolve)
      .on('error', reject);
  });
  return rows;
}

/**
 * Normalisasi priceOverride dari CSV.
 * Format CSV bisa "5.000" (Eropa) atau "20.000" → parseFloat → 5 atau 20 → kalikan 1000.
 */
function normalizePriceOverride(raw: string | undefined): number | null {
  if (!raw || raw.trim() === '' || raw.trim() === '-') return null;
  const parsed = parseFloat(raw);
  if (isNaN(parsed)) return null;
  return parsed < 1000 ? parsed * 1000 : parsed;
}

// ─── 108 Core Quests (Hardcode) ───
const coreQuests: {
  name: string;
  categoryType: CategoryType;
  region: string;
  astriteReward: number;
}[] = [
  // ── 12 Companion Quests ──
  { name: "Daybreak at last (jiyan)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Wild heart's return (Lingyang)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Solitary Path (Yinlin)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Immortal Blaze (Changli)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "True Colors (Zhezi)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Small wooly, Big Adventures (Encore)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Forking Paths Among the Stars (Camellya)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "If On a Rainy Night a Family (Carlotta)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Starry is the Night (Roccia)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Sail Day, Captain! (Brant)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "A Fleeting Night's Dream (Cantarella)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "A Blaze in the Dark (Zani)", categoryType: "COMPANION", region: "Companion Story", astriteReward: 0 },

  // ── 47 Main Quests ──
  { name: "Utterance of Marvels: Part 1", categoryType: "MAIN", region: "Prologue", astriteReward: 100 },
  { name: "Utterance of Marvels: Part 2", categoryType: "MAIN", region: "Prologue", astriteReward: 100 },
  { name: "Chapter I Act I", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act II", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act III", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act IV", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act V", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act VI: Part I", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act VI: Part II", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Segue: A New Companion", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 30 },
  { name: "Chapter I Act VII", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 240 },
  { name: "Chapter I Act VIII", categoryType: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 200 },
  { name: "Chapter II Prologue", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter II Act I", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter II Act II", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act III", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act IV", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act V", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act VI", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act VII", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Segue: Rust, Sword and the Sun", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter II Act VIII", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act IX", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act X", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act XI", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Segue: A Stranger in a Strange Land", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 100 },
  { name: "Chapter II Act XII", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Segue: Flowing Starlight in the Iris", categoryType: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter III Prologue", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 50 },
  { name: "Chapter III Act I", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Act II", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Act III", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: All That Sunlight Touches", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 100 },
  { name: "Chapter III Act IV", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: Rabbit Reflected in Shades", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 100 },
  { name: "Chapter III Segue: Whises in the Bell", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 50 },
  { name: "Chapter III Act V", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: Whises in the Bell Epilogue", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 50 },
  { name: "Chapter III Segue: Beneath a Melting Night Sky", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: We Choose the Sky", categoryType: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter IV Act I", categoryType: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 200 },
  { name: "Chapter IV Act II", categoryType: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 200 },
  { name: "Chapter IV Segue: The Chant of Unseen Ties", categoryType: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 50 },
  { name: "Chapter IV Act III", categoryType: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 200 },
  { name: "Chapter IV Segue: The Nethermancer's Requiem", categoryType: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 50 },

  // ── 49 Map Exploration Quests ──
  { name: "Norfall Barrens", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Desorock Highland", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Dim Forest", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Jinzhou City", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Central Plains", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Tiger's Maw", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Wuming Bay", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Gorges of Spirits", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Port City of Guixu", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Mt. Firmament", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Whining Aix's Mire", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Xuanfang Hold", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Western Fang Peaks", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Eastern Xuan Peaks", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Southern Yuan Hills", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Simulacrum Nexus", categoryType: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Tethys' Deep", categoryType: "MAP_EXPLORATION", region: "Black Shores", astriteReward: 0 },
  { name: "Chronorift Metropolis", categoryType: "MAP_EXPLORATION", region: "Black Shores", astriteReward: 0 },
  { name: "Ragunna City", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Averardo Vault", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Penitent's End", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Hallowed Reach", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Whisperwind Haven", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Nimbus Sanctum", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Fagaceae Peninsula", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Thessaleo Fells", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Riccioli Islands", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Vault Underground", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Avinoleum", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Beohr Waters", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Fabricatorium of the Deep", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Septimont City", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Sanguis Pleatus", categoryType: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Etching Plains", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Startorch Academy", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Starward Riseway", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Fangspire Chasm", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Bjartr Woods", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Stagnant Run", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Rebirth Uplands", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Mawburrow Desert", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Giant's Gaze", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Frostlands Transit Port", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Starblind Crashsite", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Upphaf Forest Ruins", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Mount Gjallar", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Tidelost Forest", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Solisia Landing", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Sealed Fissure", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Dimmr Deep", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Silent Crag", categoryType: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
];

// ─── Main Execution ───
async function main() {
  console.log('🔥 ULTIMATE SEED — Membersihkan seluruh database...');

  // 1. Wipe Database
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.questCategory.deleteMany();
  console.log('✅ Database bersih.');

  let totalCreated = 0;
  let totalUpdated = 0;

  // ─── 2. Inject Core Quests (108 hardcode) ───
  console.log('📦 Menyuntikkan 108 Core Quests (Main + Companion + Map Exploration)...');
  for (const q of coreQuests) {
    const categoryId = await getOrCreateCategoryId(q.region, q.categoryType);
    const flatPrice = calculateFlatPrice({
      name: q.name,
      categoryType: q.categoryType,
      astriteReward: q.astriteReward,
    });

    const result = await prisma.quest.upsert({
      where: { name: q.name },
      update: {
        region: q.region,
        astriteReward: q.astriteReward,
        categoryId,
        flatPrice,
        isChain: false,
        isSequential: false,
      },
      create: {
        name: q.name,
        region: q.region,
        astriteReward: q.astriteReward,
        categoryId,
        flatPrice,
        isChain: false,
        isSequential: false,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      totalCreated++;
    } else {
      totalUpdated++;
    }
  }
  console.log(`   ✅ Core Quests selesai. (Created: ${totalCreated}, Updated: ${totalUpdated})`);

  // ─── 3. Inject Side Quests dari CSV ───
  const sideQuestPath = path.join(__dirname, '../Wuthering_Waves_Side_Quest_Dictionary.csv');
  const sideQuestRows = await readCsv(sideQuestPath);
  console.log(`📖 Membaca CSV: Side Quests... (${sideQuestRows.length} rows)`);

  let sideCreated = 0;
  let sideUpdated = 0;

  for (const data of sideQuestRows) {
    const isChain = data['is_chain'] === 'Yes';
    const seriesName = isChain && data['series_name'] && data['series_name'] !== '-'
      ? data['series_name'] : null;
    const astriteReward = parseInt(data['astrite_reward']) || 0;
    const priceOverride = normalizePriceOverride(data['priceOverride']);

    const categoryId = await getOrCreateCategoryId(data['Region'], 'SIDE');
    const flatPrice = calculateFlatPrice({
      name: data['Quest Name'],
      categoryType: 'SIDE',
      astriteReward,
      priceOverride,
    });

    const result = await prisma.quest.upsert({
      where: { name: data['Quest Name'] },
      update: {
        region: data['Region'],
        isChain,
        seriesName,
        astriteReward,
        priceOverride,
        flatPrice,
        categoryId,
        isSequential: false,
      },
      create: {
        name: data['Quest Name'],
        region: data['Region'],
        isChain,
        seriesName,
        astriteReward,
        priceOverride,
        flatPrice,
        categoryId,
        isSequential: false,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      sideCreated++;
    } else {
      sideUpdated++;
    }
  }
  console.log(`   ✅ Side Quests selesai. (Created: ${sideCreated}, Updated: ${sideUpdated})`);

  // ─── 4. Inject Exploration Quests dari CSV ───
  const explorationPath = path.join(__dirname, '../Wuthering_Waves_Exploration_Quest_Dictionary.csv');
  const explorationRows = await readCsv(explorationPath);
  console.log(`📖 Membaca CSV: Exploration Quests... (${explorationRows.length} rows)`);

  let exploCreated = 0;
  let exploUpdated = 0;

  for (const data of explorationRows) {
    const isChain = data['is_chain'] === 'Yes';
    const seriesName = isChain && data['series_name'] && data['series_name'] !== '-'
      ? data['series_name'] : null;
    const astriteReward = parseInt(data['astrite_reward']) || 0;
    const priceOverride = normalizePriceOverride(data['priceOverride']);

    const categoryId = await getOrCreateCategoryId(data['Region'], 'EXPLORATION');
    const flatPrice = calculateFlatPrice({
      name: data['Quest Name'],
      categoryType: 'EXPLORATION',
      astriteReward,
      priceOverride,
    });

    const result = await prisma.quest.upsert({
      where: { name: data['Quest Name'] },
      update: {
        region: data['Region'],
        isChain,
        seriesName,
        astriteReward,
        priceOverride,
        flatPrice,
        categoryId,
        isSequential: false,
      },
      create: {
        name: data['Quest Name'],
        region: data['Region'],
        isChain,
        seriesName,
        astriteReward,
        priceOverride,
        flatPrice,
        categoryId,
        isSequential: false,
      },
    });

    if (result.createdAt.getTime() === result.updatedAt.getTime()) {
      exploCreated++;
    } else {
      exploUpdated++;
    }
  }
  console.log(`   ✅ Exploration Quests selesai. (Created: ${exploCreated}, Updated: ${exploUpdated})`);

  // ─── Summary ───
  const grandTotal = totalCreated + totalUpdated + sideCreated + sideUpdated + exploCreated + exploUpdated;
  console.log('');
  console.log(`🎉 SEEDING SELESAI! Total: ${grandTotal} quest diproses.`);
  console.log(`   Core: ${totalCreated + totalUpdated} | Side: ${sideCreated + sideUpdated} | Exploration: ${exploCreated + exploUpdated}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
