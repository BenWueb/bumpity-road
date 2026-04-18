import type { PuzzleEntry, PuzzleContribution } from "@/types/puzzle";

export function isCompleted(entry: PuzzleEntry): boolean {
  return entry.status === "completed";
}

export function isInProgress(entry: PuzzleEntry): boolean {
  return entry.status === "in_progress";
}

/**
 * Returns the contributor names as a human-friendly comma-separated string.
 * Falls back to the legacy `completedBy` text for entries created before the
 * contributions model was introduced.
 */
export function formatContributorNames(entry: PuzzleEntry): string {
  if (entry.contributions.length > 0) {
    const names = entry.contributions.map((c) => c.userName);
    return joinNames(names);
  }
  return entry.completedBy ?? "";
}

export function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

export function getStarterContribution(
  entry: PuzzleEntry,
): PuzzleContribution | null {
  if (entry.contributions.length === 0) return null;
  return entry.contributions[0];
}

export function getCompletedDate(entry: PuzzleEntry): string | null {
  return entry.completedAt ?? entry.completedDate;
}

export function hasUserContributed(
  entry: PuzzleEntry,
  userId: string | null,
): boolean {
  if (!userId) return false;
  return entry.contributions.some((c) => c.userId === userId);
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

/**
 * Sort order: in-progress puzzles first (newest first), then completed puzzles
 * ordered by completion date (or creation date as a fallback).
 */
export function sortPuzzles(entries: PuzzleEntry[]): PuzzleEntry[] {
  return [...entries].sort((a, b) => {
    const aInProgress = a.status === "in_progress";
    const bInProgress = b.status === "in_progress";
    if (aInProgress !== bInProgress) return aInProgress ? -1 : 1;

    const aTime = a.completedAt ?? a.completedDate ?? a.createdAt;
    const bTime = b.completedAt ?? b.completedDate ?? b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

export function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
