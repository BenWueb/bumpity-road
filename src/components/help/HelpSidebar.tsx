"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Fuse from "fuse.js";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { HELP_CATEGORIES, getCategoryMeta } from "@/content/help/_categories";
import type { HelpDocMeta } from "@/lib/help-server";

type Props = {
  docs: HelpDocMeta[];
};

export default function HelpSidebar({ docs }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("help-sidebar:collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("help-sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

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

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    return fuse.search(query.trim(), { limit: 20 });
  }, [fuse, query]);

  const docsByCategory = useMemo(() => {
    const map = new Map<string, HelpDocMeta[]>();
    for (const cat of HELP_CATEGORIES) {
      map.set(cat.id, []);
    }
    for (const doc of docs) {
      const existing = map.get(doc.category);
      if (existing) existing.push(doc);
      else map.set(doc.category, [doc]);
    }
    return map;
  }, [docs]);

  const visibleSlugs = useMemo(() => {
    if (searchResults) {
      return searchResults.map((r) => r.item.slug);
    }
    const slugs: string[] = [];
    for (const cat of HELP_CATEGORIES) {
      if (collapsedCats[cat.id]) continue;
      const catDocs = docsByCategory.get(cat.id) ?? [];
      for (const doc of catDocs) slugs.push(doc.slug);
    }
    return slugs;
  }, [searchResults, collapsedCats, docsByCategory]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [visibleSlugs]);

  useEffect(() => {
    if (focusedIndex < 0) return;
    const slug = visibleSlugs[focusedIndex];
    if (!slug || !navRef.current) return;
    const el = navRef.current.querySelector(`[data-slug="${CSS.escape(slug)}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, visibleSlugs]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => (i < visibleSlugs.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => (i > 0 ? i - 1 : visibleSlugs.length - 1));
      } else if (e.key === "Enter" && focusedIndex >= 0) {
        e.preventDefault();
        const slug = visibleSlugs[focusedIndex];
        if (slug) router.push(`/help/${slug}`);
      } else if (e.key === "Escape") {
        if (query) {
          setQuery("");
        } else {
          searchRef.current?.blur();
        }
      }
    },
    [visibleSlugs, focusedIndex, router, query],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
        setMobileOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleCategory = useCallback((catId: string) => {
    setCollapsedCats((prev) => ({ ...prev, [catId]: !prev[catId] }));
  }, []);

  function getSnippet(plainText: string, matchValue?: string): string {
    if (!matchValue) return plainText.slice(0, 100) + "...";
    const idx = plainText.toLowerCase().indexOf(matchValue.toLowerCase());
    if (idx === -1) return plainText.slice(0, 100) + "...";
    const start = Math.max(0, idx - 40);
    const end = Math.min(plainText.length, idx + matchValue.length + 60);
    let snippet = "";
    if (start > 0) snippet += "...";
    snippet += plainText.slice(start, end);
    if (end < plainText.length) snippet += "...";
    return snippet;
  }

  function isActiveDoc(slug: string) {
    return pathname === `/help/${slug}`;
  }

  function renderAccessDot(doc: HelpDocMeta) {
    if (doc.access !== "public" && doc.access !== "loggedin") return null;
    const label = doc.access === "public" ? "Public" : "Login required";
    const classes =
      doc.access === "public"
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
        : "bg-sky-500/15 text-sky-700 dark:text-sky-300";
    return (
      <span
        title={label}
        className={`ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${classes}`}
      >
        {doc.access === "public" ? "Pub" : "Login"}
      </span>
    );
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search help..."
              className="w-full rounded-md border bg-background py-2 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {query ? (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                ⌘K
              </kbd>
            )}
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent md:inline-flex"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav ref={navRef} onKeyDown={handleKeyDown} className="flex-1 overflow-y-auto p-2">
        {searchResults ? (
          <div>
            <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
            </p>
            {searchResults.length === 0 && (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                No documents found
              </p>
            )}
            <ul className="space-y-1">
              {searchResults.map(({ item, matches }) => {
                const catMeta = getCategoryMeta(item.category);
                const contentMatch = matches?.find((m) => m.key === "plainText");
                const matchValue = contentMatch?.value
                  ? contentMatch.value.slice(
                      contentMatch.indices[0]?.[0] ?? 0,
                      (contentMatch.indices[0]?.[1] ?? 0) + 1,
                    )
                  : query;

                const isFocused = visibleSlugs[focusedIndex] === item.slug;
                return (
                  <li key={item.slug}>
                    <button
                      data-slug={item.slug}
                      onClick={() => router.push(`/help/${item.slug}`)}
                      className={`w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-accent ${
                        isFocused
                          ? "bg-accent ring-2 ring-ring"
                          : isActiveDoc(item.slug)
                            ? "bg-accent text-foreground"
                            : "text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                      </div>
                      {catMeta && (
                        <span className="ml-5.5 mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {catMeta.label}
                        </span>
                      )}
                      <p className="ml-5.5 mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {getSnippet(item.plainText, matchValue)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <ul className="space-y-1">
            {HELP_CATEGORIES.map((cat) => {
              const catDocs = docsByCategory.get(cat.id) ?? [];
              if (catDocs.length === 0) return null;
              const collapsed = collapsedCats[cat.id] ?? false;
              const Icon = cat.icon;
              const hasActiveChild = catDocs.some((d) => isActiveDoc(d.slug));

              return (
                <li key={cat.id}>
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent ${
                      hasActiveChild
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className="mr-1 text-xs text-muted-foreground">
                      {catDocs.length}
                    </span>
                    {collapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>

                  {!collapsed && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l pl-3">
                      {catDocs.map((doc) => {
                        const isFocused = visibleSlugs[focusedIndex] === doc.slug;
                        return (
                          <li key={doc.slug}>
                            <button
                              data-slug={doc.slug}
                              onClick={() => router.push(`/help/${doc.slug}`)}
                              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
                                isFocused
                                  ? "bg-accent ring-2 ring-ring font-medium text-foreground"
                                  : isActiveDoc(doc.slug)
                                    ? "bg-accent font-medium text-foreground"
                                    : "text-muted-foreground"
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5 shrink-0" />
                              <span className="min-w-0 truncate">{doc.title}</span>
                              {renderAccessDot(doc)}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-[calc(1rem+env(safe-area-inset-right))] z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background text-foreground shadow-lg md:hidden"
        aria-label="Open help navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r bg-background transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-3 py-3">
            <span className="text-sm font-semibold">Help</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="rounded p-1 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">{sidebarContent}</div>
        </div>
      </aside>

      {collapsed ? (
        <aside className="hidden shrink-0 border-r bg-background md:flex md:w-12 md:flex-col md:items-center md:py-3">
          <button
            onClick={() => setCollapsed(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        </aside>
      ) : (
        <aside className="hidden w-72 shrink-0 border-r bg-background md:block">
          {sidebarContent}
        </aside>
      )}
    </>
  );
}
