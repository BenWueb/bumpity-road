"use client";

import { useState, type ReactNode } from "react";

export function ChecklistItem({
  children,
  defaultChecked = false,
}: {
  children: ReactNode;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-accent">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked((v) => !v)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
      />
      <span
        className={`text-sm transition-colors ${checked ? "text-muted-foreground line-through" : "text-foreground"}`}
      >
        {children}
      </span>
    </label>
  );
}
