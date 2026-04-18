import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { PuzzleEntry } from "@/types/puzzle";

export type PuzzleServerData = {
  entries: PuzzleEntry[];
  isAdmin: boolean;
  currentUserId: string | null;
};

async function resolveSessionAdmin(): Promise<{
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

export async function getPuzzleData(): Promise<PuzzleServerData> {
  const [entries, sessionInfo] = await Promise.all([
    prisma.puzzleEntry.findMany({
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
    }),
    resolveSessionAdmin(),
  ]);

  return {
    entries: entries.map((e) => ({
      ...e,
      completedDate: e.completedDate.toISOString(),
      createdAt: e.createdAt.toISOString(),
    })),
    isAdmin: sessionInfo.isAdmin,
    currentUserId: sessionInfo.currentUserId,
  };
}
