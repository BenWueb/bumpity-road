"use client";

import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

export default function IssueReportTrigger({ className, children }: Props) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("openIssueReportModal"))}
      className={className}
    >
      {children}
    </button>
  );
}
