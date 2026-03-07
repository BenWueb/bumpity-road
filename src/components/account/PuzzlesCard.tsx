"use client";

import Link from "next/link";
import { Puzzle } from "lucide-react";
import { AccountCard } from "./AccountCard";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { useEffect, useState } from "react";
import type { PuzzleEntry } from "@/types/puzzle";

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PuzzlesCard() {
  const [puzzles, setPuzzles] = useState<PuzzleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/puzzles");
        if (res.ok) {
          const data = await res.json();
          const currentUserId = data.currentUserId;
          if (!currentUserId) {
            setLoading(false);
            return;
          }
          const owned = (data.entries ?? []).filter(
            (e: PuzzleEntry) => e.userId === currentUserId
          );
          setPuzzles(owned);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AccountCard gradientClassName={CARD_GRADIENTS.emerald}>
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <Puzzle className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
            <h3 className="text-sm font-semibold md:text-lg">Your Puzzles</h3>
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">
            {loading
              ? "..."
              : `${puzzles.length} puzzle${puzzles.length !== 1 ? "s" : ""}`}
          </span>
        </div>
        <div className="p-3 md:p-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-accent">
                  <div className="aspect-4/3" />
                  <div className="p-2">
                    <div className="h-3 w-20 rounded bg-accent" />
                  </div>
                </div>
              ))}
            </div>
          ) : puzzles.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground md:py-8">
              <Puzzle className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
              <p>No puzzles posted yet.</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Share a completed puzzle with the family!
              </p>
              <Link
                href="/puzzles"
                className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                Add your first puzzle
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
                {puzzles.slice(0, 8).map((puzzle) => (
                  <Link
                    key={puzzle.id}
                    href="/puzzles"
                    className="group overflow-hidden rounded-lg border bg-background shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-4/3 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={puzzle.imageUrl}
                        alt={`Puzzle by ${puzzle.completedBy}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium">
                        {puzzle.completedBy}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(puzzle.completedDate)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-3 flex justify-center md:mt-4">
                <Link
                  href="/puzzles"
                  className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                >
                  View all puzzles
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </AccountCard>
  );
}
