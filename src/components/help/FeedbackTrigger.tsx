"use client";

import type { ReactNode } from "react";

type Props = {
  className?: string;
  children: ReactNode;
};

export default function FeedbackTrigger({ className, children }: Props) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("openFeedbackModal"))}
      className={className}
    >
      {children}
    </button>
  );
}
