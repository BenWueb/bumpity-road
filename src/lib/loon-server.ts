import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { LoonObservation, SavedLocation } from "@/types/loon";
import { deriveSavedLocations } from "@/lib/loon-utils";

import { type Notice } from "@/components/ui/NoticeBar";

export type LoonServerData = {
  observations: LoonObservation[];
  savedLocations: SavedLocation[];
  currentUserId: string | null;
  isAdmin: boolean;
  isLoonAdmin: boolean;
  notice: Notice;
};

const LOON_SELECT = {
  id: true,
  date: true,
  time: true,
  lakeName: true,
  lakeArea: true,
  latitude: true,
  longitude: true,
  adultsCount: true,
  pairedAdultsCount: true,
  unpairedAdultsCount: true,
  chicksCount: true,
  juvenilesCount: true,
  duration: true,
  loonIds: true,
  nestingActivity: true,
  behaviors: true,
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

async function resolveLoonSession(): Promise<{
  currentUserId: string | null;
  isAdmin: boolean;
  isLoonAdmin: boolean;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    if (!session?.user?.id) {
      return { currentUserId: null, isAdmin: false, isLoonAdmin: false };
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true, isLoonAdmin: true },
    });
    return {
      currentUserId: session.user.id,
      isAdmin: user?.isAdmin ?? false,
      isLoonAdmin: user?.isLoonAdmin ?? false,
    };
  } catch {
    return { currentUserId: null, isAdmin: false, isLoonAdmin: false };
  }
}

export async function getLoonData(): Promise<LoonServerData> {
  // Run the three independent reads in parallel.
  const [observations, sessionInfo, noticeRecord] = await Promise.all([
    prisma.loonObservation.findMany({
      orderBy: { date: "desc" },
      select: LOON_SELECT,
    }),
    resolveLoonSession(),
    prisma.loonNotice.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { id: true, message: true, enabled: true },
    }),
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
    isLoonAdmin: sessionInfo.isLoonAdmin,
    notice: noticeRecord,
  };
}
