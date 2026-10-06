import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  // Naikkan versi key setiap kali schema berubah agar dev server tidak memakai client lama
  var prisma_v3: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma_v3 ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma_v3 = prisma;
