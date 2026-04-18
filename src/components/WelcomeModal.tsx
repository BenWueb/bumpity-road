"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, HelpCircle, Sparkles, UserPlus, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

const STORAGE_KEY = "bumpity-road:welcome-seen";

export default function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(STORAGE_KEY);
      if (!seen) setOpen(true);
    } catch {
      // ignore (storage might be unavailable in private modes)
    }
  }, []);

  function handleClose() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      showCloseButton={false}
      panelClassName="relative w-full max-w-md overflow-hidden rounded-xl border bg-background shadow-xl"
    >
      <div
        className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.emerald}`}
      />
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative p-5 md:p-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          <Sparkles className="h-3.5 w-3.5" />
          First time here?
        </div>
        <h2 className="mb-2 text-xl font-semibold">Welcome to Bumpity Road</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          A shared online home for the cabin — photos, stories, visitor notes,
          and more. Take a quick look around, or jump straight in.
        </p>

        <div className="space-y-2">
          <Link
            href="/signup"
            onClick={handleClose}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              <UserPlus className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Create an account</div>
              <div className="text-xs text-muted-foreground">
                Unlocks photos, blog, badges, and more
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>

          <Link
            href="/help"
            onClick={handleClose}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
              <HelpCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Visit the help page</div>
              <div className="text-xs text-muted-foreground">
                A quick tour of every feature
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Maybe later — just let me look around
          </button>
        </div>
      </div>
    </Modal>
  );
}
