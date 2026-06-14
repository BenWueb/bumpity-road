import { Suspense } from "react";
import Link from "next/link";
import {
  NotebookText,
  FileText,
  BookText,
  Download,
  Info,
  MessageSquarePlus,
} from "lucide-react";
import FeedbackTrigger from "@/components/help/FeedbackTrigger";
import IssueReportTrigger from "@/components/IssueReportTrigger";
import { headers } from "next/headers";
import { PageHeader } from "@/components/PageHeader";
import { getAllDocs } from "@/lib/sop-server";
import { SOP_CATEGORIES } from "@/content/sop/_categories";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import NoticeBar from "@/components/ui/NoticeBar";

const CATEGORY_GRADIENTS: Record<string, string> = {
  reference: CARD_GRADIENTS.violet,
  visits: CARD_GRADIENTS.emerald,
  systems: CARD_GRADIENTS.slate,
  appliances: CARD_GRADIENTS.amber,
  seasonal: CARD_GRADIENTS.sky,
};

const OWNERS_MANUALS: { label: string; model: string; href: string }[] = [
  {
    label: "Bosch Dishwasher",
    model: "SHP65CM5N",
    href: "/manuals/bosch-dishwasher-shp65cm5n.pdf",
  },
  {
    label: "GE Gas Range",
    model: "PGS930YP8FS",
    href: "/manuals/ge-oven-pgs930yp8fs.pdf",
  },
  {
    label: "GE Refrigerator",
    model: "GSL25JGDELS",
    href: "/manuals/ge-refrigerator-gsl25jgdels.pdf",
  },
  {
    label: "Whirlpool Washer",
    model: "WTW5057LW1",
    href: "/manuals/whirlpool-washer-wtw5057lw1.pdf",
  },
  {
    label: "Weber Grill",
    model: "E-325",
    href: "/manuals/weber-grill-e-325.pdf",
  },
  {
    label: "Big Green Egg",
    model: "Charcoal grill / smoker",
    href: "/manuals/big-green-egg.pdf",
  },
  {
    label: "Amtrol Well Tank",
    model: "WX-202",
    href: "/manuals/amtrol-well-tank-wx-202.pdf",
  },
];

async function SopNotice() {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  let isAdmin = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });
    isAdmin = user?.isAdmin ?? false;
  }

  const notice = await prisma.sopNotice.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { id: true, message: true, enabled: true },
  });

  return (
    <NoticeBar
      notice={notice}
      canEdit={isAdmin}
      apiEndpoint="/api/sop-notice"
      placeholder="Enter an announcement for cabin visitors..."
      addLabel="Add an announcement"
    />
  );
}

export default function SopPage() {
  const docs = getAllDocs();

  return (
    <div className="min-h-full bg-background">
      <PageHeader
        title="Standard Operating Procedures"
        subtitle="Cabin guides, checklists, and reference documents"
        icon={<NotebookText className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="mx-auto max-w-5xl p-4 md:p-6">
        {/* If something needs attention */}
        <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-900 dark:bg-sky-950/40">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-semibold text-sky-800 dark:text-sky-300">
                If something needs attention
              </p>
              <p className="mb-2 text-sm text-foreground">
                If something is broken or needs attention, report it here or call{" "}
                <Link
                  href="/sop/reference/contacts#family"
                  className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                >
                  Jenny, Scott, or Teri
                </Link>
                .
              </p>
              <IssueReportTrigger className="inline-flex items-center rounded-md border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent">
                Report an issue
              </IssueReportTrigger>
            </div>
          </div>
        </div>

        {/* Submit a ticket for updates */}
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="flex items-start gap-3">
            <MessageSquarePlus className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-semibold text-amber-800 dark:text-amber-300">
                See something out of date?
              </p>
              <p className="text-sm text-foreground">
                If any guide or info here needs updating,{" "}
                <FeedbackTrigger className="font-medium text-primary underline underline-offset-2 hover:text-primary/80">
                  submit a ticket
                </FeedbackTrigger>{" "}
                and we&apos;ll get it fixed.
              </p>
            </div>
          </div>
        </div>

        {/* Announcement */}
        <div className="mb-6">
          <Suspense fallback={null}>
            <SopNotice />
          </Suspense>
        </div>

        {/* Category cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {SOP_CATEGORIES.map((cat) => {
            const catDocs = docs.filter((d) => d.category === cat.id);
            if (catDocs.length === 0) return null;
            const Icon = cat.icon;
            const gradient = CATEGORY_GRADIENTS[cat.id] ?? CARD_GRADIENTS.slate;

            return (
              <div
                key={cat.id}
                className="group relative overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <div
                  className={`pointer-events-none absolute inset-0 ${gradient}`}
                />
                <div className="relative p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 shadow-sm">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{cat.label}</h2>
                      <p className="text-xs text-muted-foreground">
                        {catDocs.length} document{catDocs.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {catDocs.map((doc) => (
                      <li key={doc.slug}>
                        <Link
                          href={`/sop/${doc.slug}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{doc.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Owner's manuals */}
        <div className="mt-4">
          <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
            <div
              className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.rose}`}
            />
            <div className="relative p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 shadow-sm">
                  <BookText className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold">Owner&apos;s Manuals</h2>
                  <p className="text-xs text-muted-foreground">
                    {OWNERS_MANUALS.length} PDF manuals
                  </p>
                </div>
              </div>
              <ul className="grid gap-1 sm:grid-cols-2">
                {OWNERS_MANUALS.map((manual) => (
                  <li key={manual.href}>
                    <a
                      href={manual.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">
                        {manual.label}
                        <span className="ml-1 text-xs text-muted-foreground/80">
                          {manual.model}
                        </span>
                      </span>
                      <Download className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
