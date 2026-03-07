import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { PuzzleEntry } from "@/types/puzzle";

export type PuzzleServerData = {
  entries: PuzzleEntry[];
  isAdmin: boolean;
  currentUserId: string | null;
};

export async function getPuzzleData(): Promise<PuzzleServerData> {
  const entries = await prisma.puzzleEntry.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      completedBy: true,
      completedDate: true,
      notes: true,
      imageUrl: true,
      imagePublicId: true,
      color: true,
      userId: true,
      user: { select: { id: true, name: true } },
      createdAt: true,
    },
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

  return {
    entries: entries.map((e) => ({
      ...e,
      completedDate: e.completedDate.toISOString(),
      createdAt: e.createdAt.toISOString(),
    })),
    isAdmin,
    currentUserId,
  };
}
