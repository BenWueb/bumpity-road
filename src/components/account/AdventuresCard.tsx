import Link from "next/link";
import { TentTree } from "lucide-react";
import { AccountCard } from "./AccountCard";
import type { AccountAdventure } from "@/types/account";
import {
  getAdventureSeasons,
  getCategoryInfo,
  getSeasonInfo,
} from "@/lib/adventure-constants";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  adventures: AccountAdventure[];
};

export function AdventuresCard({ adventures }: Props) {
  return (
    <AccountCard
      gradientClassName={CARD_GRADIENTS.emerald}
    >
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <TentTree className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
            <h3 className="text-sm font-semibold md:text-lg">
              Your Adventures
            </h3>
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">
            {adventures.length} adventure{adventures.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="divide-y">
          {adventures.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8">
              <TentTree className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
              <p>No adventures yet.</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Add a destination, a season, and a photo—then you’re set.
              </p>
              <Link
                href="/adventures"
                className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                Create your first adventure
              </Link>
            </div>
          ) : (
            adventures.slice(0, 5).map((a) => (
              (() => {
                const aSeasons = getAdventureSeasons(a);
                const categoryInfo = getCategoryInfo(a.category);
                const CategoryIcon = categoryInfo.icon;

                return (
              <Link
                key={a.id}
                href={`/adventures/${a.id}`}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 md:gap-4 md:px-6 md:py-3"
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-accent md:h-12 md:w-12">
                  <img
                    src={a.headerImage}
                    alt={a.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium md:text-sm">
                    {a.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground md:gap-3 md:text-xs">
                    <span className="truncate">{a.address}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="shrink-0">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {/* Season badge(s) – matches /adventures */}
                    {aSeasons.includes("all")
                      ? (() => {
                          const sInfo = getSeasonInfo("all");
                          const SIcon = sInfo.icon;
                          return (
                            <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium backdrop-blur dark:bg-black/70 md:text-xs">
                              <SIcon className={`h-3 w-3 ${sInfo.color}`} />
                              {sInfo.label}
                            </div>
                          );
                        })()
                      : aSeasons.slice(0, 2).map((sv) => {
                          const sInfo = getSeasonInfo(sv);
                          const SIcon = sInfo.icon;
                          return (
                            <div
                              key={sv}
                              className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium backdrop-blur dark:bg-black/70 md:text-xs"
                            >
                              <SIcon className={`h-3 w-3 ${sInfo.color}`} />
                              {sInfo.label}
                            </div>
                          );
                        })}
                    {!aSeasons.includes("all") && aSeasons.length > 2 && (
                      <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium backdrop-blur dark:bg-black/70 md:text-xs">
                        +{aSeasons.length - 2}
                      </div>
                    )}

                    {/* Category badge – matches /adventures */}
                    <div className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium backdrop-blur dark:bg-black/70 md:text-xs">
                      <CategoryIcon className={`h-3 w-3 ${categoryInfo.color}`} />
                      {categoryInfo.label}
                    </div>
                  </div>
                </div>
              </Link>
                );
              })()
            ))
          )}
          {adventures.length > 0 && (
            <div className="flex justify-center px-4 py-3 md:px-6 md:py-4">
              <Link
                href="/adventures"
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                View all {adventures.length} adventures
              </Link>
            </div>
          )}
        </div>
      </div>
    </AccountCard>
  );
}


