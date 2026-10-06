import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const [categories, characters] = await Promise.all([
    prisma.questCategory.findMany({
      include: {
        quests: {
          orderBy: { sequenceOrder: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    }),
    // Master data karakter untuk search bar menu "Build Karakter"
    prisma.character.findMany({
      select: { id: true, name: true, element: true, rarity: true },
      orderBy: [{ element: 'asc' }, { rarity: 'desc' }, { name: 'asc' }],
    }),
  ]);

  return <DashboardClient dbCategories={categories} dbCharacters={characters} />;
}
