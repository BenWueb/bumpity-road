import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { Info } from "lucide-react";
import AboutContent from "./AboutContent";
import { prisma } from "@/utils/prisma";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { PageHeader } from "@/components/PageHeader";

const KEYS = {
  title: "aboutTitle",
  content: "aboutContent",
  heroUrl: "aboutHeroImageUrl",
  heroPublicId: "aboutHeroImagePublicId",
} as const;

// Cache the four siteSetting reads — invalidated by the PATCH handler in
// `/api/about` via `revalidateTag("about-settings")`.
const getCachedAboutSettings = unstable_cache(
  () =>
    Promise.all([
      prisma.siteSetting.findUnique({ where: { key: KEYS.title } }),
      prisma.siteSetting.findUnique({ where: { key: KEYS.content } }),
      prisma.siteSetting.findUnique({ where: { key: KEYS.heroUrl } }),
      prisma.siteSetting.findUnique({ where: { key: KEYS.heroPublicId } }),
    ]),
  ["about-settings"],
  { tags: ["about-settings"], revalidate: 600 }
);

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="About"
        subtitle="Details about Bumpity Road"
        icon={<Info className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-slate-500 to-gray-700 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="p-4 md:p-6">
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl animate-pulse overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="h-72 w-full bg-accent sm:h-96" />
              <div className="p-4 sm:p-6 md:p-8">
                <div className="mb-4 h-4 w-48 rounded bg-accent" />
                <div className="mb-6 h-8 w-3/4 rounded bg-accent" />
                <div className="space-y-3">
                  <div className="h-4 w-full rounded bg-accent" />
                  <div className="h-4 w-full rounded bg-accent" />
                  <div className="h-4 w-2/3 rounded bg-accent" />
                </div>
              </div>
            </div>
          }
        >
          <AboutData />
        </Suspense>
      </div>
    </div>
  );
}

async function AboutData() {
  const [[title, content, heroUrl, heroPublicId], session] = await Promise.all([
    getCachedAboutSettings(),
    auth.api.getSession({ headers: await headers(), asResponse: false }),
  ]);

  const about = {
    title: "About",
    content: "Coming soon...",
    heroImageUrl: null,
    heroImagePublicId: null,
    updatedAt: null,
  };

  // `unstable_cache` serializes its return value, so Date fields come back
  // as ISO strings on cache hits. Normalize to a string either way.
  const toIso = (v: Date | string | null | undefined): string | null => {
    if (!v) return null;
    return v instanceof Date ? v.toISOString() : String(v);
  };

  const mergedAbout = {
    title: title?.value || about.title,
    content: content?.value || about.content,
    heroImageUrl: heroUrl?.value || null,
    heroImagePublicId: heroPublicId?.value || null,
    updatedAt:
      toIso(content?.updatedAt) ??
      toIso(title?.updatedAt) ??
      toIso(heroUrl?.updatedAt) ??
      null,
  };

  const canEdit = session?.user?.id
    ? await prisma.user
        .findUnique({
          where: { id: session.user.id },
          select: { isAboutAdmin: true },
        })
        .then((u) => !!u?.isAboutAdmin)
    : false;

  return (
    <div className="mx-auto max-w-6xl">
      <AboutContent initialAbout={mergedAbout} canEdit={canEdit} />
    </div>
  );
}
