"use client";

import { ANNOUNCEMENT, type AnnouncementColor } from "@/lib/announcement";

const COLOR_CLASSES: Record<AnnouncementColor, { bar: string; link: string }> = {
  amber: {
    bar: "border-b bg-amber-50 text-amber-950 dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-50",
    link: "text-amber-900 underline underline-offset-2 hover:text-amber-950 dark:text-amber-100 dark:hover:text-white",
  },
  green: {
    bar: "border-b bg-emerald-50 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-50",
    link: "text-emerald-900 underline underline-offset-2 hover:text-emerald-950 dark:text-emerald-100 dark:hover:text-white",
  },
  emerald: {
    bar: "border-b bg-emerald-50 text-emerald-950 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-50",
    link: "text-emerald-900 underline underline-offset-2 hover:text-emerald-950 dark:text-emerald-100 dark:hover:text-white",
  },
  sky: {
    bar: "border-b bg-sky-50 text-sky-950 dark:border-sky-500/20 dark:bg-sky-950/40 dark:text-sky-50",
    link: "text-sky-900 underline underline-offset-2 hover:text-sky-950 dark:text-sky-100 dark:hover:text-white",
  },
  violet: {
    bar: "border-b bg-violet-50 text-violet-950 dark:border-violet-500/20 dark:bg-violet-950/40 dark:text-violet-50",
    link: "text-violet-900 underline underline-offset-2 hover:text-violet-950 dark:text-violet-100 dark:hover:text-white",
  },
  rose: {
    bar: "border-b bg-rose-50 text-rose-950 dark:border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-50",
    link: "text-rose-900 underline underline-offset-2 hover:text-rose-950 dark:text-rose-100 dark:hover:text-white",
  },
  slate: {
    bar: "border-b bg-slate-50 text-slate-950 dark:border-slate-500/20 dark:bg-slate-950/40 dark:text-slate-50",
    link: "text-slate-900 underline underline-offset-2 hover:text-slate-950 dark:text-slate-100 dark:hover:text-white",
  },
};

export default function AnnouncementBar() {
  if (!ANNOUNCEMENT.enabled) return null;

  const color = COLOR_CLASSES[ANNOUNCEMENT.color];
  const link = ANNOUNCEMENT.link;

  return (
    <div className={`w-full px-3 py-2 ${color.bar}`}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-medium">
        {ANNOUNCEMENT.message}
        {link?.label ? (
          link.action === "feedbackModal" ? (
            <button
              type="button"
              className={color.link}
              onClick={() => {
                window.dispatchEvent(new CustomEvent("openFeedbackModal"));
              }}
            >
              {link.label}
            </button>
          ) : link.href ? (
            <a
              href={link.href}
              className={color.link}
              target={link.target}
              rel={link.target === "_blank" ? "noreferrer" : undefined}
            >
              {link.label}
            </a>
          ) : null
        ) : null}
      </div>
    </div>
  );
}


