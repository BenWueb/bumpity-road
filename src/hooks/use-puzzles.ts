"use client";

import {
  PuzzleEntry,
  PuzzleCreateInput,
  PuzzleUpdateInput,
} from "@/types/puzzle";
import { useCallback, useState } from "react";

type UsePuzzlesOptions = {
  initialEntries?: PuzzleEntry[];
  initialIsAdmin?: boolean;
  currentUserId?: string | null;
};

export function usePuzzles(options: UsePuzzlesOptions = {}) {
  const [entries, setEntries] = useState<PuzzleEntry[]>(
    options.initialEntries ?? []
  );
  const [isAdmin, setIsAdmin] = useState(options.initialIsAdmin ?? false);
  const [isLoading, setIsLoading] = useState(!options.initialEntries);
  const userId = options.currentUserId ?? null;

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/puzzles");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
        setIsAdmin(data.isAdmin ?? false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (!options.initialEntries && entries.length === 0 && isLoading) {
    loadEntries();
  }

  const createEntry = useCallback(
    async (input: PuzzleCreateInput): Promise<boolean> => {
      try {
        const res = await fetch("/api/puzzles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to add puzzle");
        }

        const data = await res.json();
        setEntries((prev) => [data.entry, ...prev]);
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const updateEntry = useCallback(
    async (input: PuzzleUpdateInput): Promise<boolean> => {
      try {
        const res = await fetch("/api/puzzles", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (res.ok) {
          const data = await res.json();
          setEntries((prev) =>
            prev.map((e) => (e.id === input.id ? data.entry : e))
          );
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const deleteEntry = useCallback(
    async (id: string): Promise<boolean> => {
      const prevEntries = entries;
      setEntries((e) => e.filter((entry) => entry.id !== id));

      try {
        const res = await fetch(`/api/puzzles?id=${id}`, { method: "DELETE" });
        if (res.ok) {
          return true;
        } else {
          setEntries(prevEntries);
          return false;
        }
      } catch {
        setEntries(prevEntries);
        return false;
      }
    },
    [entries]
  );

  const isOwned = useCallback(
    (id: string) => {
      if (!userId) return false;
      const entry = entries.find((e) => e.id === id);
      return entry?.userId === userId;
    },
    [userId, entries]
  );

  const canDelete = useCallback(
    (id: string) => isOwned(id) || isAdmin,
    [isOwned, isAdmin]
  );

  return {
    entries,
    isAdmin,
    isLoading,
    userId,
    createEntry,
    updateEntry,
    deleteEntry,
    isOwned,
    canDelete,
  };
}
