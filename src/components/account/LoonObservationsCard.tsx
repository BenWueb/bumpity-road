import Link from "next/link";
import { Origami } from "lucide-react";
import { AccountCard } from "./AccountCard";
import type { AccountLoonObservation } from "@/types/account";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  loonObservations: AccountLoonObservation[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LoonObservationsCard({ loonObservations }: Props) {
  return (
    <AccountCard gradientClassName={CARD_GRADIENTS.sky}>
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <Origami className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
            <h3 className="text-sm font-semibold md:text-lg">
              Your Loon Observations
            </h3>
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">
            {loonObservations.length} observation
            {loonObservations.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="divide-y">
          {loonObservations.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8">
              <Origami className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
              <p>No loon observations yet.</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Head to the lake and log your first sighting!
              </p>
              <Link
                href="/loon"
                className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                Log your first observation
              </Link>
            </div>
          ) : (
            loonObservations.slice(0, 5).map((obs) => {
              const totalLoons =
                obs.adultsCount + obs.chicksCount + obs.juvenilesCount;
              return (
                <Link
                  key={obs.id}
                  href="/loon"
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 md:gap-4 md:px-6 md:py-3"
                >
                  {obs.imageUrls.length > 0 ? (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-accent md:h-12 md:w-12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={obs.imageUrls[0]}
                        alt={obs.lakeName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30 md:h-12 md:w-12">
                      <Origami className="h-5 w-5 text-sky-500 md:h-6 md:w-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium md:text-sm">
                      {obs.lakeName}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground md:gap-3 md:text-xs">
                      <span>{formatDate(obs.date)}</span>
                      <span>•</span>
                      <span>
                        {totalLoons} loon{totalLoons !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      {obs.adultsCount > 0 && (
                        <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur dark:bg-black/70 md:text-xs">
                          {obs.adultsCount} adult
                          {obs.adultsCount !== 1 ? "s" : ""}
                        </div>
                      )}
                      {obs.chicksCount > 0 && (
                        <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur dark:bg-black/70 md:text-xs">
                          {obs.chicksCount} chick
                          {obs.chicksCount !== 1 ? "s" : ""}
                        </div>
                      )}
                      {obs.juvenilesCount > 0 && (
                        <div className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium backdrop-blur dark:bg-black/70 md:text-xs">
                          {obs.juvenilesCount} juvenile
                          {obs.juvenilesCount !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
          {loonObservations.length > 0 && (
            <div className="flex justify-center px-4 py-3 md:px-6 md:py-4">
              <Link
                href="/loon"
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                View all {loonObservations.length} observations
              </Link>
            </div>
          )}
        </div>
      </div>
    </AccountCard>
  );
}
