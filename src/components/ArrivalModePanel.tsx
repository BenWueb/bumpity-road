"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  MapPin,
  Phone,
  Wrench,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import IssueReportTrigger from "@/components/IssueReportTrigger";

const DISMISS_PREFIX = "bumpity-road:arrival-dismissed";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function dismissKeyForToday() {
  return `${DISMISS_PREFIX}-${new Date().toISOString().slice(0, 10)}`;
}

export function markArrivalModeDismissed() {
  try {
    window.localStorage.setItem(dismissKeyForToday(), "1");
  } catch {
    // ignore
  }
}

export function isArrivalModeDismissedToday() {
  try {
    return window.localStorage.getItem(dismissKeyForToday()) === "1";
  } catch {
    return false;
  }
}

function ArrivalLink({
  href,
  icon,
  title,
  subtitle,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

export default function ArrivalModePanel({ isOpen, onClose }: Props) {
  function handleClose() {
    markArrivalModeDismissed();
    onClose();
  }

  function handleNavigate() {
    markArrivalModeDismissed();
    onClose();
  }

  function openAmbience() {
    window.dispatchEvent(new Event("openAmbiencePlayer"));
    handleNavigate();
  }

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      showCloseButton={false}
      panelClassName="relative w-full max-w-md overflow-hidden rounded-xl border bg-background shadow-xl"
    >
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`} />
      <button
        type="button"
        onClick={handleClose}
        className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative p-5 md:p-6">
        <h2 className="mb-1 text-xl font-semibold">Welcome to the cabin</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Quick links for arrival — heat, water, wifi, and who to call.
        </p>

        <div className="space-y-2">
          <ArrivalLink
            href="/sop/visits/arriving"
            icon={<MapPin className="h-4 w-4" />}
            title="Arriving checklist"
            subtitle="Heat, water, and first checks"
            onNavigate={handleNavigate}
          />
          <ArrivalLink
            href="/sop/reference/cabin-info"
            icon={<BookOpen className="h-4 w-4" />}
            title="Cabin info"
            subtitle="Wifi, address, and essentials"
            onNavigate={handleNavigate}
          />
          <ArrivalLink
            href="/sop/reference/contacts"
            icon={<Phone className="h-4 w-4" />}
            title="Contacts"
            subtitle="Family and local services"
            onNavigate={handleNavigate}
          />
          <Link
            href="/guestbook"
            onClick={handleNavigate}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Leave a guestbook note</div>
              <div className="text-xs text-muted-foreground">Say hi from your trip</div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
          <button
            type="button"
            onClick={openAmbience}
            className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
              <Headphones className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Set the mood</div>
              <div className="text-xs text-muted-foreground">
                Open Ambience in the sidebar
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
          <IssueReportTrigger className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left shadow-sm transition-colors hover:bg-accent">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
              <Wrench className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Report an issue</div>
              <div className="text-xs text-muted-foreground">
                Something broken or needs attention
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </IssueReportTrigger>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss for today
          </button>
        </div>
      </div>
    </Modal>
  );
}
