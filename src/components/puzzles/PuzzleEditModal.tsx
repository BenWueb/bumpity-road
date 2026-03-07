"use client";

import { PuzzleEntry, PuzzleUpdateInput } from "@/types/puzzle";
import { COLOR_OPTIONS, ColorValue } from "@/lib/guestbook-constants";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { UserSuggestInput } from "./UserSuggestInput";

type Props = {
  entry: PuzzleEntry;
  onSave: (input: PuzzleUpdateInput) => Promise<boolean>;
  onClose: () => void;
};

export function PuzzleEditModal({ entry, onSave, onClose }: Props) {
  const [completedBy, setCompletedBy] = useState(entry.completedBy);
  const [completedDate, setCompletedDate] = useState(
    entry.completedDate.split("T")[0]
  );
  const [notes, setNotes] = useState(entry.notes ?? "");
  const [color, setColor] = useState<ColorValue>(
    (entry.color as ColorValue) ?? "amber"
  );
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!completedBy.trim() || !completedDate || saving) return;

    setSaving(true);
    try {
      const success = await onSave({
        id: entry.id,
        completedBy: completedBy.trim(),
        completedDate,
        notes: notes.trim(),
        color,
      });
      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Puzzle"
      closeOnOverlayClick={!saving}
      closeOnEscape={!saving}
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      panelClassName="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="editCompletedBy"
            className="mb-1 block text-sm font-medium"
          >
            Completed By
          </label>
          <UserSuggestInput
            id="editCompletedBy"
            value={completedBy}
            onChange={setCompletedBy}
            maxLength={100}
            required
          />
        </div>

        <div>
          <label
            htmlFor="editCompletedDate"
            className="mb-1 block text-sm font-medium"
          >
            Date Completed
          </label>
          <input
            id="editCompletedDate"
            type="date"
            value={completedDate}
            onChange={(e) => setCompletedDate(e.target.value)}
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="editNotes" className="mb-1 block text-sm font-medium">
            Fun Notes
          </label>
          <div className="relative">
            <textarea
              id="editNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-md border bg-background px-3 pb-6 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
              {notes.length}/500
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Card Color</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setColor(opt.value)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${opt.bg} ${
                  color === opt.value
                    ? "ring-2 ring-ring ring-offset-2"
                    : "hover:scale-110"
                }`}
                title={opt.label}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !completedBy.trim() || !completedDate}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
