"use client";

import { Send, Wrench, X } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { emitBadgesEarned } from "@/utils/badges-client";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function IssueReportModal({ isOpen, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
          type: "issue",
          title: title.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report");
      }

      const data = await res.json();
      emitBadgesEarned(data.newBadges);
      setSuccess(true);
      setTimeout(handleClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setTitle("");
    setDescription("");
    setError(null);
    setSuccess(false);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={!submitting}
      closeOnEscape={!submitting}
      showCloseButton={false}
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 md:p-4"
      panelClassName="relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl border bg-background p-4 shadow-xl md:max-h-[90vh] md:p-6"
    >
      <div
        className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.amber}`}
      />
      {success ? (
        <div className="relative py-6 text-center md:py-8">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 md:mb-4 md:h-12 md:w-12">
            <Send className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <h2 className="text-base font-semibold md:text-lg">Report received</h2>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            Thanks — someone will take a look.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="mb-3 flex items-center justify-between md:mb-4">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-700 dark:text-amber-400" />
              <h2 className="text-base font-semibold md:text-lg">Report an issue</h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            Something broken or needs attention at the cabin? Let us know here.
            For urgent matters, also call the contacts in the SOP.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label htmlFor="issue-title" className="mb-1 block text-xs font-medium md:text-sm">
                What needs attention?
              </label>
              <input
                id="issue-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kitchen faucet dripping"
                required
                maxLength={200}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="issue-description" className="mb-1 block text-xs font-medium md:text-sm">
                Details
              </label>
              <div className="relative">
                <textarea
                  id="issue-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Where is it, when did you notice, anything we should know..."
                  required
                  rows={4}
                  maxLength={2000}
                  className="w-full resize-none rounded-md border bg-background px-3 pb-5 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring md:pb-6"
                />
                <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] text-muted-foreground md:bottom-2 md:text-xs">
                  {description.length}/2000
                </span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-destructive md:text-sm">{error}</div>
            )}

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
                {submitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
