"use client";

import { UserInfo } from "@/types/todo";
import { useEffect, useState } from "react";

export function useUserSearch(enabled: boolean = true, debounceMs: number = 300) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      return;
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/users?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.users ?? []);
        }
      } finally {
        setIsSearching(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [query, enabled, debounceMs]);

  function reset() {
    setQuery("");
    setResults([]);
  }

  return {
    query,
    setQuery,
    results,
    isSearching,
    reset,
  };
}

