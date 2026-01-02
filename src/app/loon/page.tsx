"use client";

import { Binoculars } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function LoonPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Loons"
        subtitle="Coming Soon"
        icon={<Binoculars className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-blue-600 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6">
        <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
          <p className="mx-auto max-w-md text-sm text-muted-foreground md:text-base">
            Learn about the loons on the lake - their calls, behaviors, and how to spot them.
          </p>
        </div>
      </div>
    </div>
  );
}

