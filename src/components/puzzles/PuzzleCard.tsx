"use client";

import { PuzzleEntry } from "@/types/puzzle";
import { getGradientForColor } from "@/lib/guestbook-constants";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  entry: PuzzleEntry;
  isOwned: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onImageClick: () => void;
};

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function PuzzleCard({
  entry,
  isOwned,
  canDelete,
  isAdmin,
  onEdit,
  onDelete,
  onImageClick,
}: Props) {
  return (
    <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border bg-card shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${getGradientForColor(
          entry.color
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
            alt={`Puzzle completed by ${entry.completedBy}`}
            className="w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </button>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-semibold">{entry.completedBy}</span>
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
            Completed {formatDate(entry.completedDate)}
          </span>

          {entry.notes && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {entry.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
