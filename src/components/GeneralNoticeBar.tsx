"use client";

import { useState } from "react";
import { Megaphone, Pencil, Check, X, Eye, EyeOff, Plus } from "lucide-react";

export type GeneralNotice = {
  id: string;
  message: string;
  enabled: boolean;
} | null;

interface Props {
  notice: GeneralNotice;
  canEdit: boolean;
}

export default function GeneralNoticeBar({ notice: initial, canEdit }: Props) {
  const [notice, setNotice] = useState(initial);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(notice?.message ?? "");
  const [isSaving, setIsSaving] = useState(false);

  async function save(message: string, enabled: boolean) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/general-notice", {
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

  // Edit mode (admin only)
  if (canEdit && isEditing) {
    return (
      <div className="w-full border-b bg-sky-50 px-3 py-2 dark:border-sky-500/20 dark:bg-sky-950/40">
        <div className="mx-auto flex max-w-6xl items-start gap-2">
          <Megaphone className="mt-1.5 h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
          <div className="flex-1 space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share an announcement for everyone at the cabin..."
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
                  className="flex items-center gap-1 rounded-md bg-sky-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
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

  // Admin, no message yet: tiny add button bar
  if (canEdit && (!notice || !notice.message)) {
    return (
      <div className="w-full border-b bg-muted/30 px-3 py-1">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <button
            onClick={() => {
              setDraft("");
              setIsEditing(true);
            }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground md:text-xs"
          >
            <Plus className="h-3 w-3" />
            Add a site announcement
          </button>
        </div>
      </div>
    );
  }

  // No notice or disabled (and not admin): show nothing
  if (!notice || !notice.enabled || !notice.message) {
    // Admin with a hidden notice: compact hidden-state bar with restore controls
    if (canEdit && notice?.message) {
      return (
        <div className="w-full border-b bg-muted/30 px-3 py-1.5">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 text-xs text-muted-foreground">
            <EyeOff className="h-3.5 w-3.5" />
            <span className="italic">
              Notice hidden: &ldquo;{notice.message}&rdquo;
            </span>
            <button
              onClick={handleToggle}
              disabled={isSaving}
              className="rounded-md p-1 transition-colors hover:bg-accent hover:text-foreground"
              title="Show notice"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={startEditing}
              className="rounded-md p-1 transition-colors hover:bg-accent hover:text-foreground"
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

  // Display bar (visible to everyone when enabled)
  return (
    <div className="w-full border-b bg-sky-50 px-3 py-2 dark:border-sky-500/20 dark:bg-sky-950/40">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <Megaphone className="h-4 w-4 shrink-0 text-sky-700 dark:text-sky-300" />
        <span className="flex-1 text-center text-xs font-medium text-sky-950 md:text-sm dark:text-sky-50">
          {notice.message}
        </span>
        {canEdit && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              onClick={startEditing}
              className="rounded-md p-1.5 text-sky-700 transition-colors hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900/30"
              title="Edit notice"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleToggle}
              disabled={isSaving}
              className="rounded-md p-1.5 text-sky-700 transition-colors hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900/30"
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
