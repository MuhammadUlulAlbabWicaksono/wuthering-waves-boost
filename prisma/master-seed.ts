import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import 'dotenv/config'; // Load .env for DATABASE_URL

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Data 135 Core Quests
const coreQuests = [
  { name: "Daybreak at last (jiyan)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Wild heart's return (Lingyang)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Solitary Path (Yinlin)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Immortal Blaze (Changli)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "True Colors (Zhezi)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Small wooly, Big Adventures (Encore)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Forking Paths Among the Stars (Camellya)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "If On a Rainy Night a Family (Carlotta)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Starry is the Night (Roccia)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Sail Day, Captain! (Brant)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "A Fleeting Night's Dream (Cantarella)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "A Blaze in the Dark (Zani)", categoryGroup: "COMPANION", region: "Companion Story", astriteReward: 0 },
  { name: "Utterance of Marvels: Part 1", categoryGroup: "MAIN", region: "Prologue", astriteReward: 100 },
  { name: "Utterance of Marvels: Part 2", categoryGroup: "MAIN", region: "Prologue", astriteReward: 100 },
  { name: "Chapter I Act I", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act II", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act III", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act IV", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act V", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act VI: Part I", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Act VI: Part II", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 100 },
  { name: "Chapter I Segue: A New Companion", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 30 },
  { name: "Chapter I Act VII", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 240 },
  { name: "Chapter I Act VIII", categoryGroup: "MAIN", region: "Chapter I: Jinzhou Rising", astriteReward: 200 },
  { name: "Chapter II Prologue", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter II Act I", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter II Act II", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act III", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act IV", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act V", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act VI", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act VII", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Segue: Rust, Sword and the Sun", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter II Act VIII", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act IX", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act X", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Act XI", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Segue: A Stranger in a Strange Land", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 100 },
  { name: "Chapter II Act XII", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 200 },
  { name: "Chapter II Segue: Flowing Starlight in the Iris", categoryGroup: "MAIN", region: "Chapter II: All Silent Souls Can Sing", astriteReward: 50 },
  { name: "Chapter III Prologue", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 50 },
  { name: "Chapter III Act I", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Act II", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Act III", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: All That Sunlight Touches", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 100 },
  { name: "Chapter III Act IV", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: Rabbit Reflected in Shades", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 100 },
  { name: "Chapter III Segue: Whises in the Bell", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 50 },
  { name: "Chapter III Act V", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: Whises in the Bell Epilogue", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 50 },
  { name: "Chapter III Segue: Beneath a Melting Night Sky", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter III Segue: We Choose the Sky", categoryGroup: "MAIN", region: "Yet to Shine", astriteReward: 200 },
  { name: "Chapter IV Act I", categoryGroup: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 200 },
  { name: "Chapter IV Act II", categoryGroup: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 200 },
  { name: "Chapter IV Segue: The Chant of Unseen Ties", categoryGroup: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 50 },
  { name: "Chapter IV Act III", categoryGroup: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 200 },
  { name: "Chapter IV Segue: The Nethermancer's Requiem", categoryGroup: "MAIN", region: "Chapter IV: Rebirth From the Depths", astriteReward: 50 },
  { name: "Stygian Lacrimosa", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 100 },
  { name: "Glorious Loong's Pearl", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 40 },
  { name: "Peak of the Arch-Shaped  Rock", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 30 },
  { name: "Where the Waterfalls Meet", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 30 },
  { name: "Among the Shoals and Islands", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 30 },
  { name: "Boundary of Yellow and White", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 30 },
  { name: "Glorious Loong's Pearl: The Last Rite", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Vigil of Endless Night", categoryGroup: "EXPLORATION", region: "Huanglong", astriteReward: 80 },
  { name: "Shadow of The Towers: Twilight Rise", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 30 },
  { name: "Shadow of The Towers: Resounding Rise", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 30 },
  { name: "Shadow of The Towers: Command Rise", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 40 },
  { name: "Where wind Returns to Celestial Realms", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 40 },
  { name: "Hymn of the Sea of Clouds: Rainbow", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 30 },
  { name: "Hymn of the Sea of Clouds: Storm", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 30 },
  { name: "Silent as a Falling Leaf", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 100 },
  { name: "Should the Shooting Stars Blaze", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 30 },
  { name: "Where Sky is Clear and Glory Shines: Trial Grounds", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 30 },
  { name: "Where Sky is Clear and Glory Shines: Guardian Tower", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 50 },
  { name: "When the Sky Watches us Meet", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 50 },
  { name: "Flames in the Deep", categoryGroup: "EXPLORATION", region: "Rinascita", astriteReward: 40 },
  { name: "The Song of Ice and Steel", categoryGroup: "EXPLORATION", region: "Roya Frostlands", astriteReward: 50 },
  { name: "Unfrozen Hope", categoryGroup: "EXPLORATION", region: "Roya Frostlands", astriteReward: 20 },
  { name: "Broken Dimmr Heart", categoryGroup: "EXPLORATION", region: "Roya Frostlands", astriteReward: 30 },
  { name: "A Perfect Day for Flying", categoryGroup: "EXPLORATION", region: "Roya Frostlands", astriteReward: 30 },
  { name: "Faithful Heart Tes-tes at Skyfall", categoryGroup: "EXPLORATION", region: "Mengzhou", astriteReward: 100 },
  { name: "Autopuppets in Fog Veiled Chambers", categoryGroup: "EXPLORATION", region: "Mengzhou", astriteReward: 50 },
  { name: "Code Red: Corehazard", categoryGroup: "EXPLORATION", region: "Mengzhou", astriteReward: 100 },
  { name: "Norfall Barrens", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Desorock Highland", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Dim Forest", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Jinzhou City", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Central Plains", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Tiger's Maw", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Wuming Bay", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Gorges of Spirits", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Port City of Guixu", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Mt. Firmament", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Whining Aix's Mire", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Xuanfang Hold", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Western Fang Peaks", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Eastern Xuan Peaks", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Southern Yuan Hills", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Simulacrum Nexus", categoryGroup: "MAP_EXPLORATION", region: "Huanglong", astriteReward: 0 },
  { name: "Tethys' Deep", categoryGroup: "MAP_EXPLORATION", region: "Black Shores", astriteReward: 0 },
  { name: "Chronorift Metropolis", categoryGroup: "MAP_EXPLORATION", region: "Black Shores", astriteReward: 0 },
  { name: "Ragunna City", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Averardo Vault", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Penitent's End", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Hallowed Reach", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Whisperwind Haven", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Nimbus Sanctum", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Fagaceae Peninsula", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Thessaleo Fells", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Riccioli Islands", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Vault Underground", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Avinoleum", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Beohr Waters", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Fabricatorium of the Deep", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Septimont City", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Sanguis Pleatus", categoryGroup: "MAP_EXPLORATION", region: "Rinascita", astriteReward: 0 },
  { name: "Etching Plains", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Startorch Academy", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Starward Riseway", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Fangspire Chasm", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Bjartr Woods", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Stagnant Run", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Rebirth Uplands", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Mawburrow Desert", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Giant's Gaze", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Frostlands Transit Port", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Starblind Crashsite", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Upphaf Forest Ruins", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Mount Gjallar", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Tidelost Forest", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Solisia Landing", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Sealed Fissure", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Dimmr Deep", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 },
  { name: "Silent Crag", categoryGroup: "MAP_EXPLORATION", region: "Lahai Roi", astriteReward: 0 }
];

async function main() {
  console.log('Menjalankan Nuke & Pave. Membersihkan seluruh database...');
  
  // 1. Hapus Semua Data (Abaikan Foreign Key Constraints dengan urutan yang benar)
  await prisma.orderItem.deleteMany();
  await prisma.quest.deleteMany();
  await prisma.questCategory.deleteMany();
  console.log('Database bersih.');

  // 2. Helper Kategori untuk menghindari duplikasi
  const categoryCache = new Map<string, string>();
  async function getCategoryId(name: string, type: any) {
    // Format nama agar rapi. Contoh: "Exploration Quests - Huanglong"
    let cleanName = name;
    if (type === 'MAP_EXPLORATION') cleanName = `Map Exploration 100% - ${name}`;
    else if (type === 'EXPLORATION') cleanName = `Exploration Quests - ${name}`;
    else if (type === 'SIDE') cleanName = `Side Quests - ${name}`;
    else cleanName = `${type} - ${name}`;
    
    if (categoryCache.has(cleanName)) return categoryCache.get(cleanName)!;
    
    const cat = await prisma.questCategory.create({
      data: { name: cleanName, type: type }
    });
    categoryCache.set(cleanName, cat.id);
    return cat.id;
  }

  // 3. Inject Core Quests
  console.log('Menyuntikkan 135 Core Quests...');
  for (const q of coreQuests) {
    const categoryId = await getCategoryId(q.region, q.categoryGroup);
    
    let flatPrice = 15000;
    if (q.categoryGroup === 'MAIN') flatPrice = q.astriteReward * 250;
    else if (q.categoryGroup === 'COMPANION') flatPrice = 35000;

    await prisma.quest.create({
      data: {
        name: q.name,
        region: q.region,
        astriteReward: q.astriteReward,
        categoryId: categoryId,
        flatPrice: flatPrice,
        isChain: false,
        isSequential: false,
      }
    });
  }

  // 4. Inject Side Quests via CSV
  console.log('Membaca CSV dan menyuntikkan Side Quests...');
  const csvPath = path.join(__dirname, '../Wuthering_Waves_Side_Quest_Dictionary.csv');
  
  if (fs.existsSync(csvPath)) {
    const sideQuests: any[] = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => sideQuests.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const data of sideQuests) {
      const isChain = data['is_chain'] === 'Yes';
      const seriesName = isChain && data['series_name'] && data['series_name'] !== '-' ? data['series_name'] : null;
      let astriteReward = parseInt(data['astrite_reward']) || 0;
      let priceOverride: number | null = parseInt(data['priceOverride']);
      priceOverride = (!isNaN(priceOverride) && priceOverride === 5) ? 5000 : null;

      // Harga dinamis Side Quest
      let flatPrice = 0;
      if (priceOverride !== null) flatPrice = priceOverride;
      else if (astriteReward === 0) flatPrice = 2000;
      else flatPrice = astriteReward * 200;

      // Gunakan tipe SIDE (karena SIDE sudah ada di enum)
      const categoryId = await getCategoryId(data['Region'], 'SIDE');

      await prisma.quest.create({
        data: {
          name: data['Quest Name'],
          region: data['Region'],
          isChain: isChain,
          seriesName: seriesName,
          astriteReward: astriteReward,
          priceOverride: priceOverride,
          flatPrice: flatPrice,
          categoryId: categoryId,
          isSequential: false,
        }
      });
    }
  } else {
    console.log('File CSV Side Quest tidak ditemukan, melewati tahap ini.');
  }

  console.log('RESTORE MASTER SELESAI. Database kini 100% bersih dan rapi.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
