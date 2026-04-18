import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import type { PuzzleEntry, PuzzleStatus } from "@/types/puzzle";
import { sortPuzzles } from "@/lib/puzzle-utils";

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

export const PUZZLE_SELECT = {
  id: true,
  status: true,
  completedAt: true,
  completedBy: true,
  completedDate: true,
  notes: true,
  imageUrl: true,
  imagePublicId: true,
  color: true,
  userId: true,
  user: { select: { id: true, name: true } },
  contributions: {
    orderBy: { createdAt: "asc" as const },
    select: {
      id: true,
      userId: true,
      userName: true,
      note: true,
      createdAt: true,
    },
  },
  createdAt: true,
} as const;

type RawPuzzleEntry = {
  id: string;
  status: string | null;
  completedAt: Date | null;
  completedBy: string | null;
  completedDate: Date | null;
  notes: string | null;
  imageUrl: string;
  imagePublicId: string;
  color: string | null;
  userId: string;
  user: { id: string; name: string };
  contributions: {
    id: string;
    userId: string;
    userName: string;
    note: string | null;
    createdAt: Date;
  }[];
  createdAt: Date;
};

export function serializePuzzle(entry: RawPuzzleEntry): PuzzleEntry {
  const status: PuzzleStatus =
    entry.status === "in_progress" ? "in_progress" : "completed";
  return {
    id: entry.id,
    status,
    completedAt: entry.completedAt ? entry.completedAt.toISOString() : null,
    completedBy: entry.completedBy,
    completedDate: entry.completedDate
      ? entry.completedDate.toISOString()
      : null,
    notes: entry.notes,
    imageUrl: entry.imageUrl,
    imagePublicId: entry.imagePublicId,
    color: entry.color,
    userId: entry.userId,
    user: entry.user,
    contributions: entry.contributions.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.userName,
      note: c.note,
      createdAt: c.createdAt.toISOString(),
    })),
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function getPuzzleData(): Promise<PuzzleServerData> {
  const [entries, sessionInfo] = await Promise.all([
    prisma.puzzleEntry.findMany({
      orderBy: { createdAt: "desc" },
      select: PUZZLE_SELECT,
    }),
    resolveSessionAdmin(),
  ]);

  return {
    entries: sortPuzzles(
      (entries as unknown as RawPuzzleEntry[]).map(serializePuzzle),
    ),
    isAdmin: sessionInfo.isAdmin,
    currentUserId: sessionInfo.currentUserId,
  };
}
