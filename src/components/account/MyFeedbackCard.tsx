import { Bug, Lightbulb, MessageSquarePlus, Wrench } from "lucide-react";
import { AccountCard } from "./AccountCard";
import type { AccountFeedback } from "@/types/account";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  feedback: AccountFeedback[];
};

function statusClassName(status: string) {
  switch (status) {
    case "resolved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "in_progress":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "closed":
      return "bg-slate-100 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400";
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return "Open";
  }
}

export function MyFeedbackCard({ feedback }: Props) {
  return (
    <AccountCard gradientClassName={CARD_GRADIENTS.violet}>
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
            <h3 className="text-sm font-semibold md:text-lg">My Submissions</h3>
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">
            {feedback.length} total
          </span>
        </div>

        {feedback.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8">
            <MessageSquarePlus className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
            <p>No submissions yet.</p>
            <p className="mt-1 text-xs md:text-sm">
              Report a bug, suggest a feature, or flag a cabin issue from the site.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {feedback.map((item) => {
              const iconClassName =
                item.type === "bug"
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                  : item.type === "issue"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400";

              return (
                <div key={item.id} className="px-4 py-3 md:px-6 md:py-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <div
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full md:h-8 md:w-8 ${iconClassName}`}
                    >
                      {item.type === "bug" ? (
                        <Bug className="h-3 w-3 md:h-4 md:w-4" />
                      ) : item.type === "issue" ? (
                        <Wrench className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs font-medium md:text-sm">
                              {item.title}
                            </h4>
                            {item.type === "issue" && (
                              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                                Cabin issue
                              </span>
                            )}
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                          <p className="mt-1 text-[10px] text-muted-foreground md:text-xs">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 self-start rounded-full px-2 py-0.5 text-[10px] font-medium md:text-xs ${statusClassName(item.status)}`}
                        >
                          {statusLabel(item.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AccountCard>
  );
}
