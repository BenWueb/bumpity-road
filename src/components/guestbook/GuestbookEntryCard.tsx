"use client";

import { GuestbookEntry } from "@/types/guestbook";
import { getGradientForColor } from "@/lib/guestbook-constants";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  entry: GuestbookEntry;
  isOwned: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export function GuestbookEntryCard({
  entry,
  isOwned,
  canDelete,
  isAdmin,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border bg-card shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${getGradientForColor(
          entry.color
        )}`}
      />
      <div className="relative p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-semibold">{entry.name}</span>
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
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatDate(entry.createdAt)}
            </span>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
          {entry.message}
        </p>
      </div>
    </div>
  );
}

