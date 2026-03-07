"use client";

import { useState } from "react";
import { type LoonNotice } from "@/lib/loon-server";
import {
  Megaphone,
  Pencil,
  Check,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

interface Props {
  notice: LoonNotice;
  isLoonAdmin: boolean;
}

export default function LoonNoticeBar({ notice: initial, isLoonAdmin }: Props) {
  const [notice, setNotice] = useState(initial);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(notice?.message ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function save(message: string, enabled: boolean) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/loon-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, enabled }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotice(data.notice);
      setIsEditing(false);
    } catch {
      alert("Failed to save notice");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSave() {
    if (!draft.trim()) return;
    save(draft, true);
  }

  function handleToggle() {
    if (!notice) return;
    save(notice.message, !notice.enabled);
  }

  function startEditing() {
    setDraft(notice?.message ?? "");
    setIsEditing(true);
  }

  // Admin editing state
  if (isLoonAdmin && isEditing) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-950/40">
        <div className="flex items-start gap-2">
          <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter an important update for loon watchers..."
              rows={2}
              maxLength={500}
              className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                {draft.length}/500
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !draft.trim()}
                  className="flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                  {isSaving ? "Saving..." : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin: no notice yet — show "Add notice" button
  if (isLoonAdmin && (!notice || !notice.message)) {
    return (
      <button
        onClick={() => {
          setDraft("");
          setIsEditing(true);
        }}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-amber-300 px-4 py-2.5 text-sm text-amber-600 transition-colors hover:border-amber-400 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-950/30"
      >
        <Megaphone className="h-5 w-5" />
        Add a notice for loon watchers
      </button>
    );
  }

  // No notice or disabled — hide for non-admins
  if (!notice || !notice.enabled || !notice.message) {
    if (isLoonAdmin && notice?.message) {
      // Admin sees hidden notice indicator
      return (
        <div className="flex items-center justify-between rounded-lg border border-dashed border-muted-foreground/20 px-4 py-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <EyeOff className="h-3.5 w-3.5" />
            <span className="italic">Notice hidden: &ldquo;{notice.message}&rdquo;</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggle}
              disabled={isSaving}
              className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
              title="Show notice"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={startEditing}
              className="rounded-md p-1.5 transition-colors hover:bg-accent hover:text-foreground"
              title="Edit notice"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // Visible notice
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-950/40">
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-1 items-center justify-center gap-2.5 text-base font-medium text-amber-900 dark:text-amber-100">
          <Megaphone className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{notice.message}</span>
        </div>
        {isLoonAdmin && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              onClick={startEditing}
              className="rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
              title="Edit notice"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleToggle}
              disabled={isSaving}
              className="rounded-md p-1.5 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
              title="Hide notice"
            >
              <EyeOff className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
