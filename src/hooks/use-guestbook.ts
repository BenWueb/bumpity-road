"use client";

import { GuestbookEntry, GuestbookCreateInput, GuestbookUpdateInput } from "@/types/guestbook";
import {
  getOwnedIds,
  getTokenForEntry,
  removeOwnedEntry,
  saveOwnedEntry,
} from "@/lib/guestbook-ownership";
import { useCallback, useEffect, useState } from "react";

type UseGuestbookOptions = {
  initialEntries?: GuestbookEntry[];
  initialIsAdmin?: boolean;
};

export function useGuestbook(options: UseGuestbookOptions = {}) {
  const [entries, setEntries] = useState<GuestbookEntry[]>(options.initialEntries ?? []);
  const [isAdmin, setIsAdmin] = useState(options.initialIsAdmin ?? false);
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(!options.initialEntries);

  // Initialize owned IDs from localStorage
  useEffect(() => {
    setOwnedIds(getOwnedIds());
  }, []);

  // Load entries if not provided via SSR
  useEffect(() => {
    if (!options.initialEntries) {
      loadEntries();
    }
  }, [options.initialEntries]);

  const loadEntries = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
        setIsAdmin(data.isAdmin ?? false);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createEntry = useCallback(async (input: GuestbookCreateInput): Promise<boolean> => {
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sign guestbook");
      }

      const data = await res.json();
      setEntries((prev) => [data.entry, ...prev]);

      // Save ownership token
      saveOwnedEntry(data.entry.id, data.ownerToken);
      setOwnedIds((prev) => new Set([...prev, data.entry.id]));

      return true;
    } catch {
      return false;
    }
  }, []);

  const updateEntry = useCallback(async (input: GuestbookUpdateInput): Promise<boolean> => {
    try {
      const res = await fetch("/api/guestbook", {
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
  }, []);

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    const token = getTokenForEntry(id);
    const useAdminDelete = isAdmin;

    // If not admin and no token, can't delete
    if (!useAdminDelete && !token) {
      return false;
    }

    const prevEntries = entries;
    setEntries((e) => e.filter((entry) => entry.id !== id));

    const url = useAdminDelete
      ? `/api/guestbook?id=${id}&admin=true`
      : `/api/guestbook?id=${id}&token=${token}`;

    try {
      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        if (token) {
          removeOwnedEntry(id);
          setOwnedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
        return true;
      } else {
        setEntries(prevEntries);
        return false;
      }
    } catch {
      setEntries(prevEntries);
      return false;
    }
  }, [entries, isAdmin]);

  const isOwned = useCallback((id: string) => ownedIds.has(id), [ownedIds]);
  const canDelete = useCallback((id: string) => isOwned(id) || isAdmin, [isOwned, isAdmin]);
  const canEdit = useCallback((id: string) => isOwned(id), [isOwned]);

  return {
    entries,
    isAdmin,
    isLoading,
    ownedIds,
    createEntry,
    updateEntry,
    deleteEntry,
    isOwned,
    canDelete,
    canEdit,
    getTokenForEntry,
  };
}

