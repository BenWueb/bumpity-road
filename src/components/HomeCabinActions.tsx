"use client";

import { DoorClosed, DoorOpen, Wrench } from "lucide-react";
import IssueReportTrigger from "@/components/IssueReportTrigger";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

const quickActionCardClassName =
  "group relative flex h-16 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border bg-card p-1.5 shadow-sm transition-all hover:shadow-md sm:h-20 sm:gap-1.5 md:h-20 md:flex-row md:justify-start md:gap-3 md:p-4 lg:h-24 lg:gap-4 lg:p-5 xl:h-28";

export function JustArrivedCard() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("openArrivalMode"))}
      className={quickActionCardClassName}
    >
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`} />
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600 transition-transform group-hover:scale-110 dark:bg-sky-900/30 dark:text-sky-400 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
        <DoorOpen className="h-3.5 w-3.5 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
      </div>
      <div className="relative text-center sm:block md:text-left">
        <h3 className="text-xs font-semibold sm:text-sm md:text-base">Just arrived?</h3>
        <p className="hidden text-sm text-muted-foreground lg:block">Get oriented</p>
      </div>
    </button>
  );
}

export function LeavingCard() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("openLeavingMode"))}
      className={quickActionCardClassName}
    >
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.slate}`} />
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-transform group-hover:scale-110 dark:bg-slate-900/30 dark:text-slate-400 sm:h-10 sm:w-10 md:h-10 md:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12">
        <DoorClosed className="h-3.5 w-3.5 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
      </div>
      <div className="relative text-center sm:block md:text-left">
        <h3 className="text-xs font-semibold sm:text-sm md:text-base">Heading out?</h3>
        <p className="hidden text-sm text-muted-foreground lg:block">Closing checklist</p>
      </div>
    </button>
  );
}

export function HomeReportIssueRow() {
  return (
    <IssueReportTrigger className="flex w-full items-center justify-center gap-2 rounded-xl border bg-card px-4 py-3 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground">
      <Wrench className="h-4 w-4 text-amber-700 dark:text-amber-400" />
      Report an issue
    </IssueReportTrigger>
  );
}
