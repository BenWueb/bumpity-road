import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { FishObservation, SavedLocation } from "@/types/fishing";
import { deriveSavedLocations } from "@/lib/fishing-utils";

export type FishingServerData = {
  observations: FishObservation[];
  savedLocations: SavedLocation[];
  currentUserId: string | null;
  isAdmin: boolean;
};

const FISH_SELECT = {
  id: true,
  date: true,
  time: true,
  lakeName: true,
  lakeArea: true,
  latitude: true,
  longitude: true,
  species: true,
  totalCount: true,
  notableCatches: true,
  behaviors: true,
  baits: true,
  weather: true,
  windCondition: true,
  disturbance: true,
  notes: true,
  imageUrls: true,
  imagePublicIds: true,
  userId: true,
  user: { select: { id: true, name: true } },
  createdAt: true,
} as const;

async function resolveFishingSession(): Promise<{
  currentUserId: string | null;
  isAdmin: boolean;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    if (!session?.user?.id) {
      return { currentUserId: null, isAdmin: false };
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    return { currentUserId: session.user.id, isAdmin: user?.isAdmin ?? false };
  } catch {
    return { currentUserId: null, isAdmin: false };
  }
}

export async function getFishingData(): Promise<FishingServerData> {
  const [observations, sessionInfo] = await Promise.all([
    prisma.fishObservation.findMany({
      orderBy: { date: "desc" },
      select: FISH_SELECT,
    }),
    resolveFishingSession(),
  ]);

  const savedLocations = deriveSavedLocations(observations);

  return {
    observations: observations.map((o) => ({
      ...o,
      date: o.date.toISOString(),
      createdAt: o.createdAt.toISOString(),
    })),
    savedLocations,
    currentUserId: sessionInfo.currentUserId,
    isAdmin: sessionInfo.isAdmin,
  };
}
