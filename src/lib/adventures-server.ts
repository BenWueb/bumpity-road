import { prisma } from "@/utils/prisma";

export type AdventureDetail = {
  id: string;
  title: string;
  description: string;
  address: string;
  seasons: string[];
  season: string | null;
  category: string;
  headerImage: string;
  userId: string;
  user: { id: string; name: string; image: string | null };
  createdAt: string;
  updatedAt: string;
};

export type AdventureSummary = {
  id: string;
  title: string;
  address: string;
  seasons: string[];
  season: string | null;
  category: string;
  headerImage: string;
  createdAt: string;
  user: { name: string | null };
};

export async function fetchAdventureById(id: string): Promise<AdventureDetail | null> {
  const a = await prisma.adventure.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      address: true,
      seasons: true,
      season: true,
      category: true,
      headerImage: true,
      userId: true,
      user: { select: { id: true, name: true, image: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!a) return null;

  return {
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

export async function fetchOtherAdventures(excludeId: string): Promise<AdventureSummary[]> {
  const list = await prisma.adventure.findMany({
    where: { id: { not: excludeId } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      address: true,
      seasons: true,
      season: true,
      category: true,
      headerImage: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return list.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
  }));
}


