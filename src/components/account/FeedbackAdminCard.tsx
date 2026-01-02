import {
  Bug,
  Lightbulb,
  MessageSquarePlus,
  Trash2,
} from "lucide-react";
import { AccountCard } from "./AccountCard";
import type { AccountFeedback } from "@/types/account";

type Props = {
  feedback: AccountFeedback[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
};

export function FeedbackAdminCard({ feedback, onUpdateStatus, onDelete }: Props) {
  return (
    <AccountCard
      gradientClassName="bg-gradient-to-br from-amber-50 via-background to-orange-50 dark:from-amber-950/30 dark:via-background dark:to-orange-950/20"
    >
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
            <h3 className="text-sm font-semibold md:text-base">
              Feedback & Bug Reports
            </h3>
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">
            {feedback.length} item{feedback.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="divide-y">
          {feedback.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8 md:text-base">
              <MessageSquarePlus className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
              <p>No feedback submitted yet.</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="group px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full md:h-8 md:w-8 ${
                      item.type === "bug"
                        ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400"
                        : "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                    }`}
                  >
                    {item.type === "bug" ? (
                      <Bug className="h-3 w-3 md:h-4 md:w-4" />
                    ) : (
                      <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="text-xs font-medium md:text-sm">
                          {item.title}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground md:gap-2 md:text-xs">
                          <span>{item.user?.name ?? "Anonymous"}</span>
                          <span>•</span>
                          <span>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                          className={`rounded-full border-0 px-2 py-0.5 text-[10px] font-medium focus:outline-none focus:ring-2 focus:ring-ring md:px-2 md:py-1 md:text-xs ${
                            item.status === "resolved"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : item.status === "in_progress"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                              : item.status === "closed"
                              ? "bg-slate-100 text-slate-500 dark:bg-slate-900/40 dark:text-slate-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                          }`}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="rounded p-1 text-muted-foreground transition-opacity hover:bg-accent hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground md:mt-2 md:text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AccountCard>
  );
}


