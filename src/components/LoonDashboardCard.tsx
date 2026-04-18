import { prisma } from "@/utils/prisma";
import { unstable_cache } from "next/cache";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { Origami, Baby, Eye, MapPin } from "lucide-react";
import Link from "next/link";

export const LOON_STATS_CACHE_TAG = "loon-dashboard-stats";

interface LoonStats {
  totalObservations: number;
  uniqueLoonIds: string[];
  totalAdults: number;
  totalChicks: number;
  recentObservations: {
    id: string;
    date: Date;
    lakeName: string;
    lakeArea: string | null;
    adultsCount: number;
    chicksCount: number;
    juvenilesCount: number;
    loonIds: string[];
    weather: string | null;
  }[];
  lastObservationDate: Date | string | null;
}

function getWeatherEmoji(weather: string | null): string {
  switch (weather) {
    case "clear":
      return "☀️";
    case "partly_cloudy":
      return "⛅";
    case "overcast":
      return "☁️";
    case "light_rain":
    case "rain":
      return "🌧️";
    case "fog":
      return "🌫️";
    case "snow":
      return "❄️";
    default:
      return "";
  }
}

function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const getLoonStats = unstable_cache(
  async (): Promise<LoonStats> => {
    const observations = await prisma.loonObservation.findMany({
      orderBy: { date: "desc" },
      select: {
        id: true,
        date: true,
        lakeName: true,
        lakeArea: true,
        adultsCount: true,
        chicksCount: true,
        juvenilesCount: true,
        loonIds: true,
        weather: true,
      },
    });

    const allLoonIds = new Set<string>();
    let totalAdults = 0;
    let totalChicks = 0;

    for (const obs of observations) {
      for (const id of obs.loonIds) {
        if (id.trim()) allLoonIds.add(id.trim());
      }
      totalAdults += obs.adultsCount;
      totalChicks += obs.chicksCount;
    }

    return {
      totalObservations: observations.length,
      uniqueLoonIds: Array.from(allLoonIds),
      totalAdults,
      totalChicks,
      recentObservations: observations.slice(0, 3),
      lastObservationDate:
        observations.length > 0 ? observations[0].date : null,
    };
  },
  ["loon-dashboard-stats"],
  { tags: [LOON_STATS_CACHE_TAG], revalidate: 120 },
);

export function LoonDashboardCardSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`}
      />
      <div className="relative px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="h-5 w-32 animate-pulse rounded-md bg-accent" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded-md bg-accent" />
          </div>
          <div className="h-10 w-10 animate-pulse rounded-xl bg-accent sm:h-12 sm:w-12" />
        </div>
      </div>
      <div className="relative space-y-3 px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 animate-pulse rounded-lg bg-accent" />
          <div className="h-16 animate-pulse rounded-lg bg-accent" />
          <div className="h-16 animate-pulse rounded-lg bg-accent" />
        </div>
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded-lg bg-accent" />
          <div className="h-10 animate-pulse rounded-lg bg-accent" />
        </div>
      </div>
    </div>
  );
}

export default async function LoonDashboardCard() {
  let stats: LoonStats;
  try {
    stats = await getLoonStats();
  } catch (error) {
    console.error("Error fetching loon stats:", error);
    return (
      <div className="relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div
          className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`}
        />
        <div className="relative px-6 pt-6">
          <div className="text-sm font-semibold leading-none md:text-lg">
            Loon Watch
          </div>
        </div>
        <div className="relative px-6 pb-6 text-sm text-muted-foreground">
          Failed to load loon data.
        </div>
      </div>
    );
  }

  const {
    totalObservations,
    uniqueLoonIds,
    totalChicks,
    recentObservations,
    lastObservationDate,
  } = stats;

  return (
    <div className="group relative w-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`}
      />

      {/* Header */}
      <Link
        href="/loon"
        className="relative block px-4 pt-4 transition-colors hover:bg-accent/30 sm:px-6 sm:pt-6"
      >
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-none sm:text-base md:text-lg">
              Loon Watch
            </div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {lastObservationDate
                ? `Last sighting ${formatRelativeDate(lastObservationDate)}`
                : "No observations yet"}
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-background/60 shadow-sm backdrop-blur sm:h-12 sm:w-12">
            <Origami className="h-5 w-5 text-sky-600 dark:text-sky-400 sm:h-6 sm:w-6" />
          </div>
        </div>
      </Link>

      {/* Stats */}
      <div className="relative px-4 pb-4 pt-3 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg border bg-background/60 px-2 py-2.5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
            </div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
              {totalObservations}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Sightings
            </div>
          </div>
          <div className="flex flex-col items-center rounded-lg border bg-background/60 px-2 py-2.5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Origami className="h-3 w-3" />
            </div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
              {uniqueLoonIds.length > 0 ? uniqueLoonIds.length : "—"}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Tracked
            </div>
          </div>
          <div className="flex flex-col items-center rounded-lg border bg-background/60 px-2 py-2.5 shadow-sm backdrop-blur">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Baby className="h-3 w-3" />
            </div>
            <div className="mt-0.5 text-xl font-bold tabular-nums text-foreground">
              {totalChicks}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Chicks
            </div>
          </div>
        </div>

        {/* Recent observations */}
        {recentObservations.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {recentObservations.map((obs) => {
              const total =
                obs.adultsCount + obs.chicksCount + obs.juvenilesCount;
              return (
                <Link
                  key={obs.id}
                  href={`/loon?obs=${obs.id}`}
                  className="flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 text-sm shadow-sm backdrop-blur transition-colors hover:bg-accent/50"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <span className="font-medium text-foreground">
                      {obs.lakeName}
                    </span>
                    {obs.lakeArea && (
                      <span className="text-muted-foreground">
                        {" "}
                        &middot; {obs.lakeArea}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    {obs.weather && <span>{getWeatherEmoji(obs.weather)}</span>}
                    <span className="font-medium tabular-nums text-foreground">
                      {total}
                    </span>
                    <Origami className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
