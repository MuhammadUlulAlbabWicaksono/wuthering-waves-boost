/**
 * SEED KARAKTER — Mengisi tabel `Character` dari lib/data/characters.ts.
 *
 * Aman dijalankan berulang (upsert berdasarkan id/slug) dan TIDAK menyentuh
 * tabel Quest / Order.
 *
 * Jalankan: npx tsx prisma/seed-characters.ts
 */

import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { CHARACTERS, ELEMENTS, CHARACTERS_BY_ELEMENT } from '../lib/data/characters';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log(`🎭 Seeding ${CHARACTERS.length} karakter...`);

  for (const c of CHARACTERS) {
    await prisma.character.upsert({
      where: { id: c.id },
      update: { name: c.name, element: c.element, rarity: c.rarity },
      create: { id: c.id, name: c.name, element: c.element, rarity: c.rarity },
    });
  }

  // Hapus karakter yang sudah tidak ada di master data
  const removed = await prisma.character.deleteMany({
    where: { id: { notIn: CHARACTERS.map((c) => c.id) } },
  });

  for (const el of ELEMENTS) {
    console.log(`   ${el.padEnd(8)} : ${CHARACTERS_BY_ELEMENT[el].map((c) => c.name).join(', ')}`);
  }
  console.log(`✅ Selesai. Total di DB: ${await prisma.character.count()} (dihapus: ${removed.count})`);
}

main()
  .catch((e) => {
    console.error('❌ Seed karakter gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
