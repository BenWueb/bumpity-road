import type { ReactNode } from "react";
import { CheckSquare2 } from "lucide-react";
import { mdxComponents as sopMdxComponents } from "@/components/sop/mdx-components";
import { BADGE_DEFINITIONS, getBadgeInfo } from "@/lib/badge-definitions";
import type { HelpAccess } from "@/lib/help-server";

function StaticChecklist({ children }: { children: ReactNode }) {
  return (
    <div className="my-4 space-y-1 rounded-lg border bg-card p-3">
      {children}
    </div>
  );
}

function StaticCheckItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-md px-2 py-1.5">
      <CheckSquare2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      <span className="text-sm leading-relaxed text-foreground">
        {children}
      </span>
    </div>
  );
}

export function AccessPill({ access }: { access?: HelpAccess }) {
  if (access !== "public" && access !== "loggedin") return null;

  if (access === "public") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
        Public
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
      Login required
    </span>
  );
}

function BadgeShowcase({ ids }: { ids?: string[] | string }) {
  const idList = Array.isArray(ids)
    ? ids
    : typeof ids === "string"
      ? ids.split(",").map((s) => s.trim()).filter(Boolean)
      : Object.keys(BADGE_DEFINITIONS).slice(0, 8);
  const valid = idList.filter((id) => BADGE_DEFINITIONS[id]);

  return (
    <div className="my-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {valid.map((id) => {
        const badge = getBadgeInfo(id);
        return (
          <div
            key={id}
            className="relative overflow-hidden rounded-xl border bg-card p-4 text-center shadow-sm"
          >
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-emerald-50 via-background to-teal-50 dark:from-emerald-950/30 dark:via-background dark:to-teal-950/20" />
            <div className="relative">
              <div className="mb-2 text-3xl leading-none">{badge.icon}</div>
              <div className="text-sm font-semibold text-foreground">
                {badge.name}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {badge.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const helpMdxComponents = {
  ...sopMdxComponents,
  Checklist: StaticChecklist,
  ChecklistItem: StaticCheckItem,
  BadgeShowcase,
  AccessPill,
};
