import { Suspense } from "react";
import Link from "next/link";
import { NotebookText, FileText, Clock } from "lucide-react";
import { headers } from "next/headers";
import { PageHeader } from "@/components/PageHeader";
import { getAllDocs } from "@/lib/sop-server";
import { SOP_CATEGORIES, getCategoryMeta } from "@/content/sop/_categories";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";
import NoticeBar from "@/components/ui/NoticeBar";

const CATEGORY_GRADIENTS: Record<string, string> = {
  appliances: CARD_GRADIENTS.amber,
  cleaning: CARD_GRADIENTS.sky,
  seasonal: CARD_GRADIENTS.emerald,
  systems: CARD_GRADIENTS.slate,
};

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

  const recentDocs = [...docs]
    .filter((d) => d.updatedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Standard Operating Procedures"
        subtitle="Cabin guides, checklists, and reference documents"
        icon={<NotebookText className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="mx-auto max-w-5xl p-4 md:p-6">
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

        {/* Recently updated */}
        {recentDocs.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recently Updated
            </h2>
            <div className="space-y-1">
              {recentDocs.map((doc) => {
                const catMeta = getCategoryMeta(doc.category);
                return (
                  <Link
                    key={doc.slug}
                    href={`/sop/${doc.slug}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {doc.title}
                    </span>
                    {catMeta && (
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {catMeta.label}
                      </span>
                    )}
                    {doc.updatedAt && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {doc.updatedAt}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
