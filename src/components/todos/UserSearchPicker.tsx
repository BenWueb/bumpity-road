"use client";

import { useClickOutside } from "@/hooks/use-click-outside";
import { useUserSearch } from "@/hooks/use-user-search";
import { UserInfo } from "@/types/todo";
import { UserPlus, X } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  value: UserInfo | null;
  onChange: (user: UserInfo | null) => void;
  placeholder?: string;
};

export function UserSearchPicker({ value, onChange, placeholder = "Assign to someone (optional)" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, isSearching, reset } = useUserSearch(isOpen);

  useClickOutside(containerRef, () => {
    setIsOpen(false);
    reset();
  }, isOpen);

  function handleSelect(user: UserInfo) {
    onChange(user);
    setIsOpen(false);
    reset();
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
        className="flex w-full items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-sm text-left hover:bg-accent"
      >
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        {value ? (
          <span className="flex-1 truncate">{value.name}</span>
        ) : (
          <span className="flex-1 text-muted-foreground">{placeholder}</span>
        )}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border bg-background p-2 shadow-lg">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            autoFocus
            className="w-full rounded-md border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">
            {isSearching && (
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Searching...
              </div>
            )}
            {!isSearching && query && results.length === 0 && (
              <div className="px-2 py-1 text-xs text-muted-foreground">
                No users found
              </div>
            )}
            {results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleSelect(u)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted text-xs font-medium">
                  {u.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{u.name}</div>
                  {u.email && (
                    <div className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

