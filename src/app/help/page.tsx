import Link from "next/link";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  FileText,
  HelpCircle,
  MessageSquarePlus,
  Rocket,
  Sparkles,
} from "lucide-react";
import FeedbackTrigger from "@/components/help/FeedbackTrigger";
import { PageHeader } from "@/components/PageHeader";
import { getAllDocs } from "@/lib/help-server";
import { HELP_CATEGORIES, getCategoryMeta } from "@/content/help/_categories";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { AccessPill } from "@/components/help/help-mdx-components";
import { getBadgeInfo } from "@/lib/badge-definitions";

const FEATURE_ROUTES: Record<string, string> = {
  "features/home-dashboard": "/",
  "features/guestbook": "/guestbook",
  "features/puzzles": "/puzzles",
  "features/gallery": "/gallery",
  "features/blog": "/blog",
  "features/adventures": "/adventures",
  "features/loons": "/loon",
  "features/tasks": "/todos",
  "features/account-and-badges": "/account",
};

const BADGE_TEASER_IDS = [
  "OG",
  "GUESTBOOK_SIGNER",
  "LOON_SPOTTER",
  "BLOGGER_FIRST",
  "TASK_LEGEND",
  "ADVENTURER_FIRST",
];

export default function HelpPage() {
  const docs = getAllDocs();

  const featureDocs = docs.filter((d) => d.category === "features");
  const gettingStartedDocs = docs.filter((d) => d.category === "getting-started");
  const conceptsDocs = docs.filter((d) => d.category === "concepts");

  const recentDocs = [...docs]
    .filter((d) => d.updatedAt)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Help & Guide"
        subtitle="How to use Bumpity Road"
        icon={<HelpCircle className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg md:h-12 md:w-12"
      />

      <div className="mx-auto max-w-5xl p-4 md:p-6">
        {/* Welcome card */}
        <div className="relative mb-6 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div
            className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.emerald}`}
          />
          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                <Rocket className="h-3.5 w-3.5" />
                New here?
              </div>
              <h2 className="mb-1 text-lg font-semibold">
                Welcome to Bumpity Road
              </h2>
              <p className="text-sm text-muted-foreground">
                A shared online home for the cabin — photos, stories, visitor
                notes, and more.
              </p>
            </div>
            <Link
              href="/help/getting-started/welcome"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Read the welcome guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            All features
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featureDocs.map((doc) => {
              const liveRoute = FEATURE_ROUTES[doc.slug];
              return (
                <div
                  key={doc.slug}
                  className="group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-sky-300 hover:shadow-md dark:hover:border-sky-800"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.sky}`}
                  />
                  <Link
                    href={`/help/${doc.slug}`}
                    aria-label={`Learn about ${doc.title}`}
                    className="absolute inset-0 z-10"
                  />
                  <div className="pointer-events-none relative flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-tight transition-colors group-hover:text-sky-700 dark:group-hover:text-sky-300">
                        {doc.title}
                      </h3>
                      <AccessPill access={doc.access} />
                    </div>
                    {doc.description && (
                      <p className="mb-3 flex-1 text-xs text-muted-foreground">
                        {doc.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-md bg-background/80 px-2.5 py-1 font-medium text-foreground shadow-sm">
                        <FileText className="h-3 w-3" />
                        Learn how
                      </span>
                      {liveRoute && (
                        <Link
                          href={liveRoute}
                          className="pointer-events-auto relative z-20 inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-medium text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges teaser */}
        <div className="relative mb-8 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div
            className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.amber}`}
          />
          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="min-w-0">
              <h2 className="mb-1 text-lg font-semibold">
                Collect badges as you use the site
              </h2>
              <p className="mb-3 text-sm text-muted-foreground">
                Little rewards for signing the guestbook, posting photos,
                logging loon sightings, and more.
              </p>
              <div className="flex flex-wrap gap-2">
                {BADGE_TEASER_IDS.map((id) => {
                  const b = getBadgeInfo(id);
                  return (
                    <span
                      key={id}
                      title={`${b.name} — ${b.description}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-lg shadow-sm"
                    >
                      {b.icon}
                    </span>
                  );
                })}
              </div>
            </div>
            <Link
              href="/help/concepts/badges"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Learn about badges
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Feedback card */}
        <div className="relative mb-8 overflow-hidden rounded-xl border bg-card shadow-sm">
          <div
            className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.rose}`}
          />
          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background/80 shadow-sm">
                <MessageSquarePlus className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h2 className="mb-1 text-lg font-semibold">
                  Something not working? Got an idea?
                </h2>
                <p className="text-sm text-muted-foreground">
                  The cabin is a big place, and so is this site. Send a quick
                  note about bugs, confusing bits, or things you wish it could
                  do — it goes straight to the people who can fix it.
                </p>
              </div>
            </div>
            <FeedbackTrigger className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">
              <MessageSquarePlus className="h-4 w-4" />
              Send feedback
            </FeedbackTrigger>
          </div>
        </div>

        {/* Getting Started + Concepts compact */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {[
            {
              cat: HELP_CATEGORIES.find((c) => c.id === "getting-started"),
              catDocs: gettingStartedDocs,
              gradient: CARD_GRADIENTS.emerald,
            },
            {
              cat: HELP_CATEGORIES.find((c) => c.id === "concepts"),
              catDocs: conceptsDocs,
              gradient: CARD_GRADIENTS.violet,
            },
          ].map(({ cat, catDocs, gradient }) => {
            if (!cat || catDocs.length === 0) return null;
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="relative overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <div
                  className={`pointer-events-none absolute inset-0 ${gradient}`}
                />
                <div className="relative p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background/80 shadow-sm">
                      <Icon className="h-5 w-5 text-foreground" />
                    </div>
                    <h2 className="font-semibold">{cat.label}</h2>
                  </div>
                  <ul className="space-y-1">
                    {catDocs.map((doc) => (
                      <li key={doc.slug}>
                        <Link
                          href={`/help/${doc.slug}`}
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
                    href={`/help/${doc.slug}`}
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
