import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const categories = await prisma.questCategory.findMany({
    include: {
      quests: {
        orderBy: { sequenceOrder: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return <DashboardClient dbCategories={categories} />;
}
