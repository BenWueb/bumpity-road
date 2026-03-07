import { prisma } from "@/utils/prisma";
import LoonGlobalNotice from "./LoonGlobalNotice";

export default async function LoonGlobalNoticeServer() {
  try {
    const notice = await prisma.loonNotice.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { message: true, enabled: true },
    });

    if (!notice?.enabled || !notice.message) return null;

    return <LoonGlobalNotice message={notice.message} />;
  } catch {
    return null;
  }
}
