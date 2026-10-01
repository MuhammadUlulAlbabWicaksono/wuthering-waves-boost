import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const results: any[] = [];
  // Pastikan nama file CSV sesuai dengan yang Anda miliki
  const filePath = path.join(__dirname, '../Wuthering_Waves_Side_Quest_Dictionary.csv');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File CSV tidak ditemukan: ${filePath}`);
    console.error('   Pastikan file "Wuthering_Waves_Side_Quest_Dictionary.csv" ada di root project.');
    process.exit(1);
  }

  console.log('📖 Membaca dan membersihkan data CSV...');

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      // 1. Bersihkan is_chain & seriesName
      const isChain = data['is_chain'] === 'Yes';
      const seriesName = isChain && data['series_name'] && data['series_name'] !== '-'
        ? data['series_name']
        : null;

      // 2. Bersihkan astrite_reward (Kosong = 0)
      let astriteReward = parseInt(data['astrite_reward']);
      if (isNaN(astriteReward)) {
        astriteReward = 0;
      }

      // 3. Bersihkan priceOverride (5 = 5000)
      let priceOverride: number | null = parseInt(data['priceOverride']);
      if (!isNaN(priceOverride) && priceOverride === 5) {
        priceOverride = 5000;
      } else if (isNaN(priceOverride)) {
        priceOverride = null;
      }

      results.push({
        name: data['Quest Name'],        // field "name" di schema
        region: data['Region'],
        isChain: isChain,
        seriesName: seriesName,
        astriteReward: astriteReward,
        priceOverride: priceOverride,
        categoryId: null,                 // CSV quests belum punya category
      });
    })
    .on('end', async () => {
      console.log(`✅ Berhasil memproses ${results.length} baris quest dari CSV.`);
      console.log('🔄 Memulai sinkronisasi data (Upsert) ke database...');

      try {
        let createdCount = 0;
        let updatedCount = 0;

        for (const q of results) {
          const upsertedQuest = await prisma.quest.upsert({
            where: { name: q.name },
            update: {
              region: q.region,
              isChain: q.isChain,
              seriesName: q.seriesName,
              astriteReward: q.astriteReward,
              priceOverride: q.priceOverride,
            },
            create: {
              name: q.name,
              region: q.region,
              isChain: q.isChain,
              seriesName: q.seriesName,
              astriteReward: q.astriteReward,
              priceOverride: q.priceOverride,
            },
          });

          if (upsertedQuest.createdAt.getTime() === upsertedQuest.updatedAt.getTime()) {
            createdCount++;
          } else {
            updatedCount++;
          }
        }

        console.log(`🎉 Seeding AMAN selesai! Dibuat baru: ${createdCount}, Diperbarui: ${updatedCount}.`);
      } catch (error) {
        console.error('❌ Terjadi kesalahan saat sinkronisasi:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
