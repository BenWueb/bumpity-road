import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { GuestbookEntry } from "@/types/guestbook";

export type GuestbookServerData = {
  entries: GuestbookEntry[];
  isAdmin: boolean;
};

export async function getRecentGuestbookEntries(
  limit = 5
): Promise<GuestbookEntry[]> {
  const entries = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });

  return entries.map((e) => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  }));
}

async function resolveAdminFlag(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    if (!session?.user?.id) return false;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    return user?.isAdmin ?? false;
  } catch {
    return false;
  }
}

export async function getGuestbookData(): Promise<GuestbookServerData> {
  // Run the entries query and the auth/admin lookup in parallel — they are
  // independent and the auth chain is the slower of the two.
  const [entries, isAdmin] = await Promise.all([
    prisma.guestbookEntry.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        message: true,
        color: true,
        createdAt: true,
      },
    }),
    resolveAdminFlag(),
  ]);

  return {
    entries: entries.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    isAdmin,
  };
}

