"use client";

import { GuestbookEntry } from "@/types/guestbook";
import { useGuestbook } from "@/hooks/use-guestbook";
import { getTokenForEntry } from "@/lib/guestbook-ownership";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { GuestbookEntryCard } from "./GuestbookEntryCard";
import { GuestbookEditModal } from "./GuestbookEditModal";
import { GuestbookForm } from "./GuestbookForm";

type Props = {
  initialEntries: GuestbookEntry[];
  initialIsAdmin: boolean;
};

export function GuestbookList({ initialEntries, initialIsAdmin }: Props) {
  const {
    entries,
    isAdmin,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    isOwned,
    canDelete,
  } = useGuestbook({
    initialEntries,
    initialIsAdmin,
  });

  const [editingEntry, setEditingEntry] = useState<GuestbookEntry | null>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr,400px]">
      {/* Entries list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border bg-card p-4">
                <div className="mb-2 h-4 w-32 rounded bg-accent" />
                <div className="h-4 w-full rounded bg-accent" />
                <div className="mt-1 h-4 w-3/4 rounded bg-accent" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <BookOpen className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-lg font-medium">No entries yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Be the first to sign the guestbook!
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {entries.map((entry) => (
              <GuestbookEntryCard
                key={entry.id}
                entry={entry}
                isOwned={isOwned(entry.id)}
                canDelete={canDelete(entry.id)}
                isAdmin={isAdmin}
                onEdit={() => setEditingEntry(entry)}
                onDelete={() => deleteEntry(entry.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sign form */}
      <GuestbookForm onSubmit={createEntry} />

      {/* Edit modal */}
      {editingEntry && (
        <GuestbookEditModal
          entry={editingEntry}
          ownerToken={getTokenForEntry(editingEntry.id) ?? ""}
          onSave={updateEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}

