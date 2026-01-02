"use client";

import { NotebookText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function SOPPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="SOP"
        subtitle="Coming Soon"
        icon={<NotebookText className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <p className="mx-auto max-w-md text-sm text-muted-foreground md:text-base">
            Standard Operating Procedures for the cabin will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}

