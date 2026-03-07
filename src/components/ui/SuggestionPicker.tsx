"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { Search, X } from "lucide-react";
import { useRef, useState, useMemo } from "react";

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  suggestions: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  activeClassName?: string;
};

export function SuggestionPicker({
  value,
  onChange,
  suggestions,
  placeholder = "Search...",
  icon,
  activeClassName = "bg-primary text-primary-foreground",
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    containerRef,
    () => {
      setIsOpen(false);
      setQuery("");
    },
    isOpen
  );

  const filtered = useMemo(() => {
    if (!query) return suggestions;
    const q = query.toLowerCase();
    return suggestions.filter((s) => s.toLowerCase().includes(q));
  }, [suggestions, query]);

  function handleSelect(item: string) {
    onChange(item);
    setIsOpen(false);
    setQuery("");
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  return (
    <div ref={containerRef} className={`relative ${isOpen ? "z-50" : ""}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
          value
            ? `${activeClassName} border-transparent`
            : "bg-background hover:bg-accent"
        }`}
      >
        {icon ?? <Search className="h-3.5 w-3.5 shrink-0 opacity-60" />}
        {value ? (
          <span className="flex-1 truncate">{value}</span>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
        {value && (
          <span
            role="button"
            tabIndex={0}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClear(e as unknown as React.MouseEvent);
            }}
            className="opacity-70 hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-background p-2 shadow-lg">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full rounded-md border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-2 max-h-40 space-y-0.5 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                No matches
              </div>
            )}
            {filtered.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className={`flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-accent ${
                  value === item ? "font-medium text-primary" : ""
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
