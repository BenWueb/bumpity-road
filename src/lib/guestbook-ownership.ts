import { OwnedEntry } from "@/types/guestbook";

const STORAGE_KEY = "guestbook:owned";

export function getOwnedEntries(): OwnedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveOwnedEntry(id: string, token: string): void {
  const entries = getOwnedEntries();
  entries.push({ id, token });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function removeOwnedEntry(id: string): void {
  const entries = getOwnedEntries().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getTokenForEntry(id: string): string | null {
  const entries = getOwnedEntries();
  return entries.find((e) => e.id === id)?.token ?? null;
}

export function getOwnedIds(): Set<string> {
  return new Set(getOwnedEntries().map((e) => e.id));
}

