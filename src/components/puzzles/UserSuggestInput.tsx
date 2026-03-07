"use client";

import { useUserSearch } from "@/hooks/use-user-search";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useRef, useState } from "react";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  className?: string;
};

export function UserSuggestInput({
  id,
  value,
  onChange,
  placeholder,
  maxLength,
  required,
  className,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { query, setQuery, results, isSearching, reset } =
    useUserSearch(isFocused);

  useClickOutside(
    containerRef,
    () => {
      setIsFocused(false);
      reset();
    },
    isFocused
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    setQuery(val);
  }

  function handleSelect(name: string) {
    onChange(name);
    setIsFocused(false);
    reset();
  }

  function handleFocus() {
    setIsFocused(true);
    if (value.trim()) setQuery(value);
  }

  const showDropdown =
    isFocused && value.trim().length > 0 && (results.length > 0 || isSearching);

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={
          className ??
          "w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        }
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-40 overflow-y-auto rounded-lg border bg-background p-1 shadow-lg">
          {isSearching && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              Searching...
            </div>
          )}
          {results.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => handleSelect(u.name)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium">
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
      )}
    </div>
  );
}
