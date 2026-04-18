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

export async function getFishingData(): Promise<FishingServerData> {
  const observations = await prisma.fishObservation.findMany({
    orderBy: { date: "desc" },
    select: FISH_SELECT,
  });

  let isAdmin = false;
  let currentUserId: string | null = null;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    if (session?.user?.id) {
      currentUserId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      });
      isAdmin = user?.isAdmin ?? false;
    }
  } catch {
    // Not logged in
  }

  const savedLocations = deriveSavedLocations(observations);

  return {
    observations: observations.map((o) => ({
      ...o,
      date: o.date.toISOString(),
      createdAt: o.createdAt.toISOString(),
    })),
    savedLocations,
    currentUserId,
    isAdmin,
  };
}
