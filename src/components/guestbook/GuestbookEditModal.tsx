"use client";

import { GuestbookEntry, GuestbookUpdateInput } from "@/types/guestbook";
import { COLOR_OPTIONS, ColorValue } from "@/lib/guestbook-constants";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  entry: GuestbookEntry;
  ownerToken: string;
  onSave: (input: GuestbookUpdateInput) => Promise<boolean>;
  onClose: () => void;
};

export function GuestbookEditModal({ entry, ownerToken, onSave, onClose }: Props) {
  const [name, setName] = useState(entry.name);
  const [message, setMessage] = useState(entry.message);
  const [color, setColor] = useState<ColorValue>((entry.color as ColorValue) ?? "amber");
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim() || saving) return;

    setSaving(true);
    try {
      const success = await onSave({
        id: entry.id,
        name: name.trim(),
        message: message.trim(),
        color,
        ownerToken,
      });
      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit Entry</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editName" className="mb-1 block text-sm font-medium">
              Your Name
            </label>
            <input
              id="editName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="editMessage" className="mb-1 block text-sm font-medium">
              Message
            </label>
            <div className="relative">
              <textarea
                id="editMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                maxLength={500}
                className="w-full resize-none rounded-md border bg-background px-3 pb-6 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
                {message.length}/500
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
              disabled={saving || !name.trim() || !message.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

