"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  DoorClosed,
  Phone,
  Snowflake,
  Wrench,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import IssueReportTrigger from "@/components/IssueReportTrigger";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function LeavingLink({
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

export default function LeavingModePanel({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      showCloseButton={false}
      panelClassName="relative w-full max-w-md overflow-hidden rounded-xl border bg-background shadow-xl"
    >
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.slate}`} />
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative p-5 md:p-6">
        <h2 className="mb-1 text-xl font-semibold">Heading out?</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Quick links for closing — cleaning, shut-down, and who to call.
        </p>

        <div className="space-y-2">
          <LeavingLink
            href="/sop/visits/closing"
            icon={<DoorClosed className="h-4 w-4" />}
            title="Closing checklist"
            subtitle="Clean, lock up, and turn things off"
            onNavigate={onClose}
          />
          <LeavingLink
            href="/sop/seasonal/winterizing"
            icon={<Snowflake className="h-4 w-4" />}
            title="Winterizing"
            subtitle="Drain pipes before cold weather"
            onNavigate={onClose}
          />
          <LeavingLink
            href="/sop/reference/contacts"
            icon={<Phone className="h-4 w-4" />}
            title="Contacts"
            subtitle="Family and local services"
            onNavigate={onClose}
          />
          <Link
            href="/guestbook"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Leave a guestbook note</div>
              <div className="text-xs text-muted-foreground">Sign off from your trip</div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
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
      </div>
    </Modal>
  );
}
