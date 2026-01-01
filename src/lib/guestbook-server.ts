import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import { GuestbookEntry } from "@/types/guestbook";

export type GuestbookServerData = {
  entries: GuestbookEntry[];
  isAdmin: boolean;
};

export async function getGuestbookData(): Promise<GuestbookServerData> {
  const entries = await prisma.guestbookEntry.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });

  let isAdmin = false;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      asResponse: false,
    });
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isAdmin: true },
      });
      isAdmin = user?.isAdmin ?? false;
    }
  } catch {
    // Not logged in, that's fine
  }

  return {
    entries: entries.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    isAdmin,
  };
}

