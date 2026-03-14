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
  chicksCount: true,
  juvenilesCount: true,
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

export async function getLoonData(): Promise<LoonServerData> {
  const observations = await prisma.loonObservation.findMany({
    orderBy: { date: "desc" },
    select: LOON_SELECT,
  });

  let isAdmin = false;
  let isLoonAdmin = false;
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
        select: { isAdmin: true, isLoonAdmin: true },
      });
      isAdmin = user?.isAdmin ?? false;
      isLoonAdmin = user?.isLoonAdmin ?? false;
    }
  } catch {
    // Not logged in
  }

  const savedLocations = deriveSavedLocations(observations);

  const noticeRecord = await prisma.loonNotice.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { id: true, message: true, enabled: true },
  });

  return {
    observations: observations.map((o) => ({
      ...o,
      date: o.date.toISOString(),
      createdAt: o.createdAt.toISOString(),
    })),
    savedLocations,
    currentUserId,
    isAdmin,
    isLoonAdmin,
    notice: noticeRecord,
  };
}
