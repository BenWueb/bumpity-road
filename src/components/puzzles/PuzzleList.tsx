"use client";

import { PuzzleEntry } from "@/types/puzzle";
import { usePuzzles } from "@/hooks/use-puzzles";
import { LogIn, Plus, Puzzle } from "lucide-react";
import { useCallback, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { PuzzleCard } from "./PuzzleCard";
import { PuzzleEditModal } from "./PuzzleEditModal";
import { PuzzleLightbox } from "./PuzzleLightbox";
import { PuzzleForm } from "./PuzzleForm";
import { useLoginModal } from "@/components/LoginModal";

type Props = {
  initialEntries: PuzzleEntry[];
  initialIsAdmin: boolean;
  currentUserId: string | null;
};

export function PuzzleList({
  initialEntries,
  initialIsAdmin,
  currentUserId,
}: Props) {
  const { openLoginModal } = useLoginModal();
  const {
    entries,
    isAdmin,
    isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    isOwned,
    canDelete,
  } = usePuzzles({
    initialEntries,
    initialIsAdmin,
    currentUserId,
  });

  const isLoggedIn = !!currentUserId;
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PuzzleEntry | null>(null);
  const [lightboxEntry, setLightboxEntry] = useState<PuzzleEntry | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  function openLightbox(entry: PuzzleEntry, index: number) {
    setLightboxEntry(entry);
    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxEntry(null);
    setLightboxIndex(-1);
  }

  const goToPrevious = useCallback(() => {
    if (lightboxIndex > 0) {
      const newIndex = lightboxIndex - 1;
      setLightboxIndex(newIndex);
      setLightboxEntry(entries[newIndex]);
    }
  }, [lightboxIndex, entries]);

  const goToNext = useCallback(() => {
    if (lightboxIndex < entries.length - 1) {
      const newIndex = lightboxIndex + 1;
      setLightboxIndex(newIndex);
      setLightboxEntry(entries[newIndex]);
    }
  }, [lightboxIndex, entries]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Puzzles"
        subtitle="Share your completed puzzles!"
        icon={<Puzzle className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg md:h-12 md:w-12"
        desktopAction={
          isLoggedIn ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
            >
              <Plus className="h-4 w-4" />
              Add a Puzzle
            </button>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
            >
              <LogIn className="h-4 w-4" />
              Sign in to add
            </button>
          )
        }
        mobileAction={
          isLoggedIn ? (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-medium text-white shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add a Puzzle
            </button>
          ) : (
            <button
              type="button"
              onClick={openLoginModal}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              Sign in to add
            </button>
          )
        }
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        {showForm && (
          <PuzzleForm
            onSubmit={async (input) => {
              const success = await createEntry(input);
              if (success) setShowForm(false);
              return success;
            }}
            onCancel={() => setShowForm(false)}
          />
        )}

        {isLoading ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 animate-pulse break-inside-avoid rounded-lg border bg-card"
              >
                <div className="aspect-4/3 rounded-t-lg bg-accent" />
                <div className="p-4">
                  <div className="mb-2 h-4 w-32 rounded bg-accent" />
                  <div className="h-3 w-24 rounded bg-accent" />
                  <div className="mt-2 h-4 w-full rounded bg-accent" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Puzzle className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <h2 className="text-lg font-medium">No puzzles yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLoggedIn
                ? "Be the first to share a completed puzzle!"
                : "Sign in to share a completed puzzle."}
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {entries.map((entry, index) => (
              <PuzzleCard
                key={entry.id}
                entry={entry}
                isOwned={isOwned(entry.id)}
                canDelete={canDelete(entry.id)}
                isAdmin={isAdmin}
                onEdit={() => setEditingEntry(entry)}
                onDelete={() => deleteEntry(entry.id)}
                onImageClick={() => openLightbox(entry, index)}
              />
            ))}
          </div>
        )}
      </div>

      {editingEntry && (
        <PuzzleEditModal
          entry={editingEntry}
          onSave={updateEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}

      {lightboxEntry && (
        <PuzzleLightbox
          entries={entries}
          selectedEntry={lightboxEntry}
          selectedIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </div>
  );
}
