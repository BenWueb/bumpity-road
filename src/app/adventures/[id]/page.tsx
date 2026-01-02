import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin, Tag } from "lucide-react";
import { fetchAdventureById, fetchOtherAdventures } from "@/lib/adventures-server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

const SEASON_LABELS: Record<string, string> = {
  all: "All Seasons",
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

const CATEGORY_LABELS: Record<string, string> = {
  fishing: "Fishing",
  hiking: "Hiking",
  shopping: "Shopping",
  wildlife: "Wildlife",
  boating: "Boating",
  camping: "Camping",
  swimming: "Swimming",
  other: "Other",
};

function getAdventureSeasons(a: { seasons: string[]; season: string | null }): string[] {
  if (Array.isArray(a.seasons) && a.seasons.length > 0) return a.seasons;
  if (a.season) return [a.season];
  return ["all"];
}

function AdventureSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 min-[1440px]:flex-row min-[1440px]:gap-8">
      <article className="min-w-0 flex-1 animate-pulse overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="h-96 w-full bg-accent" />
        <div className="p-6 sm:p-8">
          <div className="mb-4 h-4 w-48 rounded bg-accent" />
          <div className="mb-6 h-8 w-3/4 rounded bg-accent" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-accent" />
            <div className="h-4 w-full rounded bg-accent" />
            <div className="h-4 w-2/3 rounded bg-accent" />
          </div>
        </div>
      </article>
      <aside className="w-full shrink-0 min-[1440px]:w-72">
        <div className="animate-pulse rounded-xl border bg-card p-5">
          <div className="mb-4 h-6 w-32 rounded bg-accent" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-accent" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full rounded bg-accent" />
                  <div className="h-3 w-24 rounded bg-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

async function AdventureContent({ id }: { id: string }) {
  const [adventure, other] = await Promise.all([
    fetchAdventureById(id),
    fetchOtherAdventures(id),
  ]);

  if (!adventure) notFound();

  const seasons = getAdventureSeasons({
    seasons: adventure.seasons ?? [],
    season: adventure.season,
  });

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(adventure.createdAt));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:gap-6 min-[1440px]:flex-row min-[1440px]:gap-8">
      <article className="relative min-w-0 flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/10" />

        <div className="relative">
          {/* Hero */}
          <div className="relative h-56 w-full overflow-hidden bg-accent sm:h-80 lg:h-96">
            <Image
              src={adventure.headerImage}
              alt={adventure.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              <div className="mb-2 flex flex-wrap gap-1.5 sm:mb-3 sm:gap-2">
                {seasons.includes("all") ? (
                  <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur dark:bg-black/70 sm:px-3 sm:text-xs">
                    {SEASON_LABELS.all}
                  </span>
                ) : (
                  seasons.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur dark:bg-black/70 sm:px-3 sm:text-xs"
                    >
                      {SEASON_LABELS[s] ?? s}
                    </span>
                  ))
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur dark:bg-black/70 sm:px-3 sm:text-xs">
                  <Tag className="h-3.5 w-3.5" />
                  {CATEGORY_LABELS[adventure.category] ?? adventure.category}
                </span>
              </div>

              <h1 className="text-xl font-bold leading-tight text-white drop-shadow sm:text-3xl">
                {adventure.title}
              </h1>
              <div className="mt-2 flex flex-col gap-1.5 text-xs text-white/90 sm:mt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2 sm:text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formattedDate}
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="line-clamp-2">{adventure.address}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="prose prose-slate max-w-none text-sm dark:prose-invert sm:prose-base sm:text-base">
              <p className="whitespace-pre-wrap">{adventure.description}</p>
            </div>

            <div className="mt-6 overflow-hidden rounded-xl border bg-muted/20 sm:mt-8">
              <iframe
                title={`Map for ${adventure.title}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  adventure.address
                )}&output=embed`}
                className="h-56 w-full sm:h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="flex flex-col gap-2 px-3 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:text-sm">
                <span className="text-muted-foreground">
                  Shared by{" "}
                  <span className="font-medium text-foreground">
                    {adventure.user.name}
                  </span>
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    adventure.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-lg border bg-background px-3 py-2 text-xs font-medium hover:bg-accent sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-sm sm:text-primary sm:hover:bg-transparent sm:hover:underline"
                >
                  Open in Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Sidebar */}
      <aside className="w-full shrink-0 min-[1440px]:sticky min-[1440px]:top-6 min-[1440px]:w-72 min-[1440px]:self-start">
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/10" />
          <div className="relative">
            <h2 className="mb-4 text-lg font-semibold">More Adventures</h2>

            {other.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other adventures yet.</p>
            ) : (
              <div className="space-y-4">
                {other.map((a) => (
                  <Link
                    key={a.id}
                    href={`/adventures/${a.id}`}
                    className="group flex gap-3"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-accent sm:h-16 sm:w-16">
                      <Image
                        src={a.headerImage}
                        alt={a.title}
                        width={64}
                        height={64}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
                        {a.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{a.user?.name ?? "Unknown"}</span>
                        <span>•</span>
                        <span>
                          {new Intl.DateTimeFormat(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(new Date(a.createdAt))}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/adventures"
              className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
            >
              View all adventures →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default async function AdventurePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/adventures"
          className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground md:mb-6 md:text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Back to Adventures
        </Link>
      </div>

      <Suspense fallback={<AdventureSkeleton />}>
        <AdventureContent id={id} />
      </Suspense>
    </div>
  );
}


