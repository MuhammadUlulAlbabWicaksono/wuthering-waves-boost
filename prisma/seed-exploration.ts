import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai injeksi khusus untuk Exploration Quest dari CSV...');
  
  const csvPath = path.join(__dirname, '../Wuthering_Waves_Exploration_Quest_Dictionary.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('Peringatan: File Wuthering_Waves_Exploration_Quest_Dictionary.csv tidak ditemukan di root folder!');
    return;
  }

  // 1. Baca data dari CSV
  const quests: any[] = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => quests.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`Berhasil membaca ${quests.length} baris Exploration Quest. Memulai sinkronisasi...`);

  // Helper untuk mendapatkan/membuat Category ID yang tepat secara dinamis
  const categoryCache = new Map<string, string>();
  async function getCategoryId(regionName: string) {
    const cleanName = `Exploration Quests - ${regionName}`;
    if (categoryCache.has(cleanName)) return categoryCache.get(cleanName)!;
    
    let cat = await prisma.questCategory.findFirst({
      where: { name: cleanName, type: 'EXPLORATION' }
    });
    
    if (!cat) {
      cat = await prisma.questCategory.create({
        data: { name: cleanName, type: 'EXPLORATION' }
      });
    }
    categoryCache.set(cleanName, cat.id);
    return cat.id;
  }

  let createdCount = 0;
  let updatedCount = 0;

  // 2. Lakukan Upsert satu per satu
  for (const data of quests) {
    const isChain = data['is_chain'] === 'Yes';
    const seriesName = isChain && data['series_name'] && data['series_name'] !== '-' ? data['series_name'] : null;
    let astriteReward = parseInt(data['astrite_reward']) || 0;
    
    let priceOverride: number | null = parseFloat(data['priceOverride']);
    // Normalisasi harga (misal 20 menjadi 20000)
    priceOverride = (!isNaN(priceOverride)) ? (priceOverride < 1000 ? priceOverride * 1000 : priceOverride) : null;

    // Logika kalkulasi harga
    let flatPrice = 0;
    if (priceOverride !== null) flatPrice = priceOverride;
    else if (astriteReward === 0) flatPrice = 2000;
    else flatPrice = astriteReward * 200;

    const categoryId = await getCategoryId(data['Region']);

    const upsertedQuest = await prisma.quest.upsert({
      where: { name: data['Quest Name'] },
      update: {
        region: data['Region'],
        isChain: isChain,
        seriesName: seriesName,
        astriteReward: astriteReward,
        priceOverride: priceOverride,
        flatPrice: flatPrice,
        categoryId: categoryId,
        isSequential: false,
      },
      create: {
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

    if (upsertedQuest.createdAt.getTime() === upsertedQuest.updatedAt.getTime()) {
      createdCount++;
    } else {
      updatedCount++;
    }
  }

  console.log(`Update AMAN selesai! Exploration Quest Dibuat baru: ${createdCount}, Diperbarui: ${updatedCount}.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
