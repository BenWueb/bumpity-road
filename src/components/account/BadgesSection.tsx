import {
  getAccountBadgeInfo,
  getBadgesForDisplay,
} from "@/lib/account-badges";
import {
  getBadgeProgressHint,
  type BadgeProgressStats,
} from "@/lib/badge-progress";

type Props = {
  badges: string[];
  progressStats: BadgeProgressStats;
};

export function BadgesSection({ badges, progressStats }: Props) {
  const earnedCount = badges.length;

  return (
    <div>
      <div className="mb-2 text-center md:mb-3">
        <h2 className="text-sm font-semibold md:text-lg">Badges</h2>
        <p className="text-[10px] text-muted-foreground md:text-sm">
          {earnedCount} badge{earnedCount !== 1 ? "s" : ""} earned
        </p>
      </div>
      <div className="flex flex-wrap items-start justify-center gap-x-1.5 gap-y-2 md:gap-x-3 md:gap-y-3">
        {getBadgesForDisplay(badges).map(({ badge, earned }) => {
          const info = getAccountBadgeInfo(badge);
          const progressHint = earned
            ? null
            : getBadgeProgressHint(badge, progressStats);
          const mysteryTitle = progressHint
            ? `${info?.name ?? "Mystery badge"} — ${progressHint}`
            : "Mystery badge - keep exploring!";

          return earned ? (
            <div
              key={badge}
              className="group relative flex items-center gap-1 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-2 py-1 text-xs font-medium text-white shadow-md transition-transform hover:scale-105 md:gap-2 md:px-4 md:py-2 md:text-sm"
              title={info?.description}
            >
              <span className="text-sm md:text-base">
                {info?.icon || "🏅"}
              </span>
              <span>{info?.name || badge}</span>
            </div>
          ) : (
            <div
              key={badge}
              className="flex w-14 flex-col items-center gap-0.5 md:w-28"
              title={mysteryTitle}
            >
              <div className="h-6 w-14 shrink-0 rounded-full border-2 border-dashed border-amber-300 bg-amber-50/30 dark:border-amber-700 dark:bg-amber-950/20 md:h-10 md:w-28" />
              {info?.name && (
                <span className="w-full truncate text-center text-[9px] font-medium text-muted-foreground md:text-[10px]">
                  {info.name}
                </span>
              )}
              <span className="w-full text-center text-[9px] leading-tight text-muted-foreground md:text-[10px]">
                {progressHint ?? "Keep exploring"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
