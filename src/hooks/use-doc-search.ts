"use client";

import { useMemo } from "react";
import Fuse, { type FuseResult } from "fuse.js";

/**
 * Minimal shape required to search a doc. Both SOP and Help doc metadata
 * satisfy this, so they can share the same search behavior.
 */
export type SearchableDoc = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  plainText: string;
};

/**
 * Fuzzy search over docs (title/description/tags/plainText).
 *
 * Fuse fuzzy-matches scattered characters, which can surface docs that don't
 * literally contain the query (e.g. "pete" matching "complete"). Those have
 * nothing to highlight, so results are filtered to keep only docs that actually
 * contain one of the searched tokens — keeping the result list aligned with the
 * substring-based highlighting used on the doc pages.
 *
 * Returns `null` when the query is empty (i.e. "not searching").
 */
export function useDocSearch<T extends SearchableDoc>(
  docs: T[],
  query: string,
): FuseResult<T>[] | null {
  const fuse = useMemo(
    () =>
      new Fuse(docs, {
        keys: [
          { name: "title", weight: 3 },
          { name: "description", weight: 2 },
          { name: "tags", weight: 2 },
          { name: "plainText", weight: 1 },
        ],
        threshold: 0.35,
        includeMatches: true,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [docs],
  );

  return useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    const results = fuse.search(q, { limit: 20 });

    const tokens = q
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length >= 2);
    if (tokens.length === 0) return results;

    return results.filter(({ item }) => {
      const haystack = [
        item.title,
        item.description ?? "",
        Array.isArray(item.tags) ? item.tags.join(" ") : "",
        item.plainText ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return tokens.some((t) => haystack.includes(t));
    });
  }, [fuse, query]);
}
