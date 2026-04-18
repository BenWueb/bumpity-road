"use client";

import { PuzzleEntry } from "@/types/puzzle";
import { getGradientForColor } from "@/lib/guestbook-constants";
import {
  formatContributorNames,
  formatDate,
  formatDateTime,
  getCompletedDate,
  hasUserContributed,
  isInProgress,
} from "@/lib/puzzle-utils";
import { CheckCircle2, Hourglass, Pencil, Trash2, UserPlus } from "lucide-react";

type Props = {
  entry: PuzzleEntry;
  isOwned: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  isLoggedIn: boolean;
  currentUserId: string | null;
  contributing: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
  onContribute: (markComplete: boolean) => void;
};

export function PuzzleCard({
  entry,
  isOwned,
  canDelete,
  isAdmin,
  isLoggedIn,
  currentUserId,
  contributing,
  onEdit,
  onDelete,
  onImageClick,
  onContribute,
}: Props) {
  const inProgress = isInProgress(entry);
  const hasJoined = hasUserContributed(entry, currentUserId);
  const completedDate = getCompletedDate(entry);
  const contributorNames = formatContributorNames(entry);

  return (
    <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border bg-card shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${getGradientForColor(
          entry.color,
        )}`}
      />
      <div className="relative">
        <button
          type="button"
          onClick={onImageClick}
          className="block w-full overflow-hidden rounded-t-lg focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.imageUrl}
            alt={
              inProgress
                ? "In-progress puzzle"
                : `Puzzle completed by ${contributorNames || "the cabin"}`
            }
            className="w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </button>

        {/* Status badge */}
        <div className="absolute left-2 top-2">
          {inProgress ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur">
              <Hourglass className="h-3 w-3" />
              In progress
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2 py-0.5 text-[11px] font-medium text-white shadow-sm backdrop-blur">
              <CheckCircle2 className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="min-w-0">
              {inProgress ? (
                <span className="font-semibold">
                  {contributorNames
                    ? `Started by ${contributorNames}`
                    : "Open puzzle"}
                </span>
              ) : (
                <span className="font-semibold">
                  {contributorNames
                    ? `Completed by ${contributorNames}`
                    : "Completed"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isOwned && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-destructive group-hover:opacity-100"
                  title={isAdmin && !isOwned ? "Delete (Admin)" : "Delete"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <span className="text-xs text-muted-foreground">
            {inProgress
              ? `Started ${formatDate(entry.createdAt)}`
              : completedDate
                ? `Completed ${formatDate(completedDate)}`
                : `Added ${formatDate(entry.createdAt)}`}
          </span>

          {entry.notes && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {entry.notes}
            </p>
          )}

          {/* Contributors timeline */}
          {entry.contributions.length > 0 && (
            <div className="mt-3 rounded-md border border-border/60 bg-background/50 p-2">
              <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {entry.contributions.length === 1
                  ? "Contributor"
                  : `${entry.contributions.length} contributors`}
              </div>
              <ul className="space-y-1">
                {entry.contributions.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-2 text-xs"
                  >
                    <span className="truncate font-medium">{c.userName}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatDateTime(c.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons for in-progress puzzles */}
          {inProgress && isLoggedIn && (
            <div className="mt-3 flex flex-wrap gap-2">
              {!hasJoined && (
                <button
                  type="button"
                  onClick={() => onContribute(false)}
                  disabled={contributing}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/60 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-300"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  I&apos;m working on this
                </button>
              )}
              <button
                type="button"
                onClick={() => onContribute(true)}
                disabled={contributing}
                className="inline-flex items-center gap-1.5 rounded-md bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {contributing ? "Saving..." : "Mark Complete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
