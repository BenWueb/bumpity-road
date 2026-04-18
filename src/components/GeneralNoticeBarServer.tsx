import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import { cookies, headers } from "next/headers";
import { unstable_cache } from "next/cache";
import GeneralNoticeBar from "./GeneralNoticeBar";

// Cache the notice query — invalidated by `revalidateTag("general-notice")`
// in the admin POST handler. This removes a Prisma round-trip from every
// navigation for both logged-in and anonymous visitors.
const getCachedNotice = unstable_cache(
  () =>
    prisma.generalNotice.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { id: true, message: true, enabled: true },
    }),
  ["general-notice"],
  { tags: ["general-notice"], revalidate: 300 }
);

// Cheap cookie-existence check so anonymous navigations don't pay for
// `auth.api.getSession()` (which decodes/validates the JWT) or a follow-up
// Prisma user lookup. Better-auth uses cookie names prefixed with
// `better-auth.session_token` (and `__Secure-` in production).
async function hasSessionCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .some((c) => c.name.includes("better-auth.session_token"));
}

export default async function GeneralNoticeBarServer() {
  try {
    const [notice, sessionCookieExists] = await Promise.all([
      getCachedNotice(),
      hasSessionCookie(),
    ]);

    let isAdmin = false;
    if (sessionCookieExists) {
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
        // Treat as non-admin
      }
    }

    if (!isAdmin && (!notice || !notice.enabled || !notice.message)) {
      return null;
    }

    return <GeneralNoticeBar notice={notice} canEdit={isAdmin} />;
  } catch {
    return null;
  }
}
