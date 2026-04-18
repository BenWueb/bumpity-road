"use client";

import { PuzzleCreateInput, PuzzleStatus } from "@/types/puzzle";
import {
  COLOR_OPTIONS,
  DEFAULT_COLOR,
  ColorValue,
} from "@/lib/guestbook-constants";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { CldImage } from "next-cloudinary";
import { LazyCldUploadButton as CldUploadButton } from "@/components/cloudinary/LazyUpload";
import { CheckCircle2, Hourglass, ImagePlus, X } from "lucide-react";
import { useState } from "react";

type Props = {
  onSubmit: (input: PuzzleCreateInput) => Promise<boolean>;
  onCancel: () => void;
};

export function PuzzleForm({ onSubmit, onCancel }: Props) {
  const [status, setStatus] = useState<PuzzleStatus>("in_progress");
  const [notes, setNotes] = useState("");
  const [color, setColor] = useState<ColorValue>(DEFAULT_COLOR);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleUploadSuccess(result: unknown) {
    const r = result as {
      info?: { public_id?: string; secure_url?: string } | string;
    };
    const info = typeof r.info === "object" ? r.info : null;
    if (!info?.public_id || !info?.secure_url) return;

    setImageUrl(info.secure_url);
    setImagePublicId(info.public_id);
  }

  function clearImage() {
    setImageUrl("");
    setImagePublicId("");
  }

  function resetForm() {
    setStatus("in_progress");
    setNotes("");
    setColor(DEFAULT_COLOR);
    setImageUrl("");
    setImagePublicId("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const success = await onSubmit({
        status,
        notes: notes.trim(),
        imageUrl,
        imagePublicId,
        color,
      });

      if (success) {
        resetForm();
      } else {
        setError("Failed to add puzzle");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
      <div
        className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.emerald}`}
      />
      <div className="relative">
        <h2 className="mb-4 text-lg font-semibold">Add a Puzzle</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium">Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("in_progress")}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  status === "in_progress"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                <Hourglass className="h-4 w-4" />
                Not finished
              </button>
              <button
                type="button"
                onClick={() => setStatus("completed")}
                className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  status === "completed"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                Finished
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {status === "in_progress"
                ? "Other signed-in users will be able to join in and finish it later."
                : "This puzzle is done. Your name will be recorded as a contributor."}
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Puzzle Photo
            </label>
            {imagePublicId ? (
              <div className="relative inline-block">
                <CldImage
                  src={imagePublicId}
                  alt="Puzzle preview"
                  width={200}
                  height={150}
                  crop="fill"
                  className="rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white shadow-md hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <CldUploadButton
                uploadPreset="bumpity-road"
                onSuccess={handleUploadSuccess}
                options={{ multiple: false, maxFiles: 1 }}
                className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed bg-background px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
              >
                <ImagePlus className="h-5 w-5" />
                Upload Puzzle Photo
              </CldUploadButton>
            )}
          </div>

          <div>
            <label htmlFor="notes" className="mb-1 block text-sm font-medium">
              Fun Notes
            </label>
            <div className="relative">
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any fun notes about this puzzle..."
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

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCancel();
              }}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !imageUrl}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting
                ? "Adding..."
                : status === "in_progress"
                  ? "Start Puzzle"
                  : "Add Completed Puzzle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
