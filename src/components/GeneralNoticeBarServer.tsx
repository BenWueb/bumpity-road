import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";
import GeneralNoticeBar from "./GeneralNoticeBar";

export default async function GeneralNoticeBarServer() {
  try {
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
      // Not logged in — treat as non-admin
    }

    const notice = await prisma.generalNotice.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { id: true, message: true, enabled: true },
    });

    // Nothing to render for non-admins when there's no enabled notice
    if (!isAdmin && (!notice || !notice.enabled || !notice.message)) {
      return null;
    }

    return <GeneralNoticeBar notice={notice} canEdit={isAdmin} />;
  } catch {
    return null;
  }
}
