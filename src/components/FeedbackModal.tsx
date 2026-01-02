"use client";

import { Bug, Lightbulb, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ isOpen, onClose }: Props) {
  const [type, setType] = useState<"bug" | "feature">("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Track mount state for portal (SSR safety)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setType("bug");
    setTitle("");
    setDescription("");
    setError(null);
    setSuccess(false);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-2 md:p-4"
      onClick={handleClose}
    >
      <div
        className="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl border bg-background p-4 shadow-xl md:max-h-[90vh] md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {success ? (
          <div className="py-6 text-center md:py-8">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 md:mb-4 md:h-12 md:w-12">
              <Send className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <h2 className="text-base font-semibold md:text-lg">Thank you!</h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Your feedback has been submitted successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <h2 className="text-base font-semibold md:text-lg">Send Feedback</h2>
              <button
                type="button"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              {/* Type selector */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("bug")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors md:gap-2 md:px-4 md:py-3 md:text-sm ${
                    type === "bug"
                      ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                      : "hover:bg-accent"
                  }`}
                >
                  <Bug className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Report Bug
                </button>
                <button
                  type="button"
                  onClick={() => setType("feature")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors md:gap-2 md:px-4 md:py-3 md:text-sm ${
                    type === "feature"
                      ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                      : "hover:bg-accent"
                  }`}
                >
                  <Lightbulb className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Suggest Feature
                </button>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-xs font-medium md:text-sm"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    type === "bug"
                      ? "Brief description of the bug..."
                      : "What feature would you like?"
                  }
                  required
                  maxLength={200}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-xs font-medium md:text-sm"
                >
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={
                      type === "bug"
                        ? "Steps to reproduce, expected vs actual behavior..."
                        : "Describe the feature and why it would be useful..."
                    }
                    required
                    rows={4}
                    maxLength={2000}
                    className="w-full resize-none rounded-md border bg-background px-3 pb-5 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring md:rows-5 md:pb-6"
                  />
                  <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] text-muted-foreground md:bottom-2 md:text-xs">
                    {description.length}/2000
                  </span>
                </div>
              </div>

              {error && <div className="text-xs text-destructive md:text-sm">{error}</div>}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end md:pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !description.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
