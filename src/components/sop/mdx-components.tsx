import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
  Phone,
  Mail,
  MapPin,
  StickyNote,
  User,
  Calendar,
  FileText,
  Download,
  Wrench,
  ShieldAlert,
  Tag,
  Flame,
  Sparkles,
  Settings2,
  PackageOpen,
  DoorClosed,
  DoorOpen,
  Droplets,
  CalendarClock,
  History,
  Users,
  Recycle,
  Snowflake,
  Hash,
  PlusCircle,
  BarChart3,
  ThumbsUp,
  Award,
  Lightbulb,
  MessageSquarePlus,
  Bug,
  Menu,
  KeyRound,
  Puzzle,
  Binoculars,
  BookOpen,
  ListChecks,
  LayoutGrid,
  Rocket,
  ExternalLink,
  Battery,
  Monitor,
  Keyboard,
  Thermometer,
  PowerOff,
  Home,
  Plug,
  Building2,
  Wifi,
  Split,
  ShoppingBag,
} from "lucide-react";
import { headers } from "next/headers";
import { ChecklistItem } from "./ChecklistItem";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { auth } from "@/utils/auth";
import { prisma } from "@/utils/prisma";

async function AdminOnly({ children }: { children: ReactNode }) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) return null;

  return <>{children}</>;
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type HeadingIcon = {
  icon: ComponentType<{ className?: string }>;
  color: string;
};

const HEADING_ICON_RULES: { match: RegExp; value: HeadingIcon }[] = [
  // Help / guide vocabulary (specific matches first). Word boundaries keep
  // these from accidentally matching SOP headings (e.g. "add" vs "Address").
  { match: /\bvot/i, value: { icon: ThumbsUp, color: "text-emerald-500 dark:text-emerald-400" } },
  { match: /badge|reward|achievement/i, value: { icon: Award, color: "text-amber-500 dark:text-amber-400" } },
  { match: /feedback/i, value: { icon: MessageSquarePlus, color: "text-rose-500 dark:text-rose-400" } },
  { match: /\bbug|report|issue/i, value: { icon: Bug, color: "text-rose-500 dark:text-rose-400" } },
  { match: /puzzle/i, value: { icon: Puzzle, color: "text-violet-500 dark:text-violet-400" } },
  { match: /sight|observ|loon/i, value: { icon: Binoculars, color: "text-sky-500 dark:text-sky-400" } },
  { match: /note|guestbook/i, value: { icon: BookOpen, color: "text-emerald-500 dark:text-emerald-400" } },
  { match: /account|login|sign[\s-]?in|sign[\s-]?up|token/i, value: { icon: KeyRound, color: "text-sky-500 dark:text-sky-400" } },
  { match: /menu|sidebar|navigat/i, value: { icon: Menu, color: "text-sky-500 dark:text-sky-400" } },
  { match: /profile/i, value: { icon: User, color: "text-indigo-500 dark:text-indigo-400" } },
  { match: /export|download|backup/i, value: { icon: Download, color: "text-teal-500 dark:text-teal-400" } },
  { match: /filter|chart|graph|breakdown/i, value: { icon: BarChart3, color: "text-sky-500 dark:text-sky-400" } },
  { match: /\btabs?\b|\bviews?\b/i, value: { icon: LayoutGrid, color: "text-violet-500 dark:text-violet-400" } },
  { match: /\badd(?:ing)?\b|creat/i, value: { icon: PlusCircle, color: "text-emerald-500 dark:text-emerald-400" } },
  { match: /first step|getting started|get started/i, value: { icon: Rocket, color: "text-emerald-500 dark:text-emerald-400" } },
  { match: /why|useful|benefit/i, value: { icon: Lightbulb, color: "text-amber-500 dark:text-amber-400" } },
  { match: /everything/i, value: { icon: PackageOpen, color: "text-teal-500 dark:text-teal-400" } },

  // SOP equipment & section vocabulary (specific matches first)
  { match: /thermostat/i, value: { icon: Thermometer, color: "text-rose-500 dark:text-rose-400" } },
  { match: /\bheat(?:ing)?\b/i, value: { icon: Thermometer, color: "text-orange-500 dark:text-orange-400" } },
  { match: /batter|component/i, value: { icon: Battery, color: "text-lime-500 dark:text-lime-400" } },
  { match: /display|\blcd\b|screen|monitor/i, value: { icon: Monitor, color: "text-slate-500 dark:text-slate-400" } },
  { match: /\bkeys?\b|\bbuttons?\b/i, value: { icon: Keyboard, color: "text-slate-500 dark:text-slate-400" } },
  { match: /turn(?:ing)?\s+(?:it\s+)?off|power off|switch off/i, value: { icon: PowerOff, color: "text-slate-500 dark:text-slate-400" } },
  { match: /wi-?fi|network|internet/i, value: { icon: Wifi, color: "text-sky-500 dark:text-sky-400" } },
  { match: /landline|phone/i, value: { icon: Phone, color: "text-emerald-500 dark:text-emerald-400" } },
  { match: /\bfamil/i, value: { icon: Users, color: "text-fuchsia-500 dark:text-fuchsia-400" } },
  { match: /neighbor/i, value: { icon: Home, color: "text-emerald-500 dark:text-emerald-400" } },
  { match: /utilit/i, value: { icon: Plug, color: "text-amber-500 dark:text-amber-400" } },
  { match: /\blocal\b|town/i, value: { icon: Building2, color: "text-indigo-500 dark:text-indigo-400" } },
  { match: /practice|guideline/i, value: { icon: Lightbulb, color: "text-amber-500 dark:text-amber-400" } },
  { match: /\bsort|separat|stream/i, value: { icon: Split, color: "text-violet-500 dark:text-violet-400" } },
  { match: /plastic|\bbags?\b/i, value: { icon: ShoppingBag, color: "text-cyan-500 dark:text-cyan-400" } },
  { match: /drop.?off|\bsites?\b/i, value: { icon: MapPin, color: "text-rose-500 dark:text-rose-400" } },

  // SOP domain vocabulary
  { match: /troublesh/i, value: { icon: Wrench, color: "text-amber-500 dark:text-amber-400" } },
  { match: /safety|caution|hazard/i, value: { icon: ShieldAlert, color: "text-rose-500 dark:text-rose-400" } },
  { match: /care|clean|mainten|tip/i, value: { icon: Sparkles, color: "text-cyan-500 dark:text-cyan-400" } },
  { match: /model|manual/i, value: { icon: Tag, color: "text-violet-500 dark:text-violet-400" } },
  { match: /light|fire|flame|putting it out|put it out/i, value: { icon: Flame, color: "text-orange-500 dark:text-orange-400" } },
  { match: /upcoming|due|schedul|recurring/i, value: { icon: CalendarClock, color: "text-amber-500 dark:text-amber-400" } },
  { match: /history|record/i, value: { icon: History, color: "text-indigo-500 dark:text-indigo-400" } },
  { match: /servic/i, value: { icon: Wrench, color: "text-slate-500 dark:text-slate-400" } },
  { match: /load|suppl|rack/i, value: { icon: PackageOpen, color: "text-teal-500 dark:text-teal-400" } },
  { match: /arriv/i, value: { icon: DoorOpen, color: "text-emerald-500 dark:text-emerald-400" } },
  { match: /leav|clos|depart|shut/i, value: { icon: DoorClosed, color: "text-slate-500 dark:text-slate-400" } },
  { match: /water|pressure|tank|well|softener|heater|plumb/i, value: { icon: Droplets, color: "text-sky-500 dark:text-sky-400" } },
  { match: /contact|who|number/i, value: { icon: Users, color: "text-fuchsia-500 dark:text-fuchsia-400" } },
  { match: /recycl|garbage|trash|waste/i, value: { icon: Recycle, color: "text-green-500 dark:text-green-400" } },
  { match: /snow|ice|winter|season|cold|freez/i, value: { icon: Snowflake, color: "text-cyan-500 dark:text-cyan-400" } },
  { match: /start|operation|basic|control|cycle|using|run|step/i, value: { icon: Settings2, color: "text-indigo-500 dark:text-indigo-400" } },

  // Generic guide fallbacks
  { match: /how to|how do|how it works|how does/i, value: { icon: ListChecks, color: "text-indigo-500 dark:text-indigo-400" } },
  { match: /overview|info|about|address|cabin|what|find|here/i, value: { icon: Info, color: "text-sky-500 dark:text-sky-400" } },
];

const DEFAULT_HEADING_ICON: HeadingIcon = {
  icon: Hash,
  color: "text-slate-400 dark:text-slate-500",
};

function getHeadingText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((c) => (typeof c === "string" ? c : "")).join("");
  }
  return "";
}

function getHeadingIcon(text: string): HeadingIcon {
  for (const rule of HEADING_ICON_RULES) {
    if (rule.match.test(text)) return rule.value;
  }
  return DEFAULT_HEADING_ICON;
}

function HeadingWithAnchor({
  level,
  children,
  className,
  withIcon = false,
}: {
  level: 1 | 2 | 3 | 4;
  children: ReactNode;
  className: string;
  withIcon?: boolean;
}) {
  const text = getHeadingText(children);
  const id = slugify(text);
  const Tag = `h${level}` as const;

  const meta = withIcon ? getHeadingIcon(text) : null;
  const Icon = meta?.icon;
  const iconSize = level <= 2 ? "h-5 w-5" : "h-4 w-4";

  return (
    <Tag id={id} className={`group scroll-mt-24 ${className}`}>
      <a
        href={`#${id}`}
        className="inline-flex items-center gap-2.5 no-underline hover:underline"
      >
        {Icon && meta && (
          <Icon className={`${iconSize} shrink-0 ${meta.color}`} />
        )}
        <span className="inline-flex items-center gap-2">
          {children}
          <LinkIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-40" />
        </span>
      </a>
    </Tag>
  );
}

const CALLOUT_STYLES = {
  info: {
    wrapper: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40",
    icon: <Info className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
    title: "text-sky-800 dark:text-sky-300",
  },
  warning: {
    wrapper: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
    title: "text-amber-800 dark:text-amber-300",
  },
  danger: {
    wrapper: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
    icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
    title: "text-red-800 dark:text-red-300",
  },
  success: {
    wrapper: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />,
    title: "text-emerald-800 dark:text-emerald-300",
  },
} as const;

function Callout({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof CALLOUT_STYLES;
  title?: string;
  children: ReactNode;
}) {
  const style = CALLOUT_STYLES[type];
  return (
    <div className={`my-4 rounded-lg border p-4 ${style.wrapper}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{style.icon}</span>
        <div className="min-w-0 flex-1">
          {title && (
            <p className={`mb-1 text-sm font-semibold ${style.title}`}>{title}</p>
          )}
          <div className="text-sm text-foreground [&>p]:m-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ children }: { children: ReactNode }) {
  return <div className="my-4 space-y-1 rounded-lg border bg-card p-3">{children}</div>;
}

function Steps({ children }: { children: ReactNode }) {
  return (
    <div className="my-6 [counter-reset:step] [&>*:last-child]:pb-0 [&>*:last-child_.step-connector]:hidden">
      {children}
    </div>
  );
}

function Step({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex gap-3.5 pb-6 [counter-increment:step]">
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-border bg-background text-xs font-bold text-muted-foreground before:content-[counter(step)]" />
        <div className="step-connector my-1 w-px flex-1 bg-border" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {title && <h4 className="mb-1 font-semibold text-foreground">{title}</h4>}
        <div className="text-sm text-muted-foreground [&>p]:m-0">{children}</div>
      </div>
    </div>
  );
}

function CardGrid({ children }: { children: ReactNode }) {
  return <div className="my-4 grid gap-3 sm:grid-cols-2">{children}</div>;
}

function PdfLink({
  href,
  title,
  description,
  gradient,
}: {
  href: string;
  title: string;
  description?: string;
  gradient?: keyof typeof CARD_GRADIENTS;
}) {
  const bg = gradient
    ? `${CARD_GRADIENTS[gradient]} hover:shadow-md`
    : "bg-card hover:bg-accent";
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex h-full items-center gap-3 rounded-lg border p-4 no-underline shadow-sm transition-all ${bg}`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileText className="h-5 w-5 text-foreground" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {description && (
          <span className="block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
      <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

function Timeline({ children }: { children: ReactNode }) {
  return <div className="my-6 space-y-7">{children}</div>;
}

function TimelineYear({
  year,
  children,
}: {
  year: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-violet-500 via-indigo-500 to-sky-500 px-4 py-1.5 text-sm font-bold text-white shadow-sm">
          <Calendar className="h-4 w-4" />
          {year}
        </span>
      </div>
      <div className="[&>*:last-child_.timeline-connector]:hidden">{children}</div>
    </section>
  );
}

function TimelineItem({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex shrink-0 flex-col items-center pt-2">
        <span className="h-2.5 w-2.5 rounded-full bg-linear-to-br from-violet-400 to-indigo-500" />
        <span className="timeline-connector my-1 w-px flex-1 bg-border" />
      </div>
      <div className="min-w-0 flex-1 pb-3">
        <div className="rounded-lg border bg-card p-3 shadow-sm">
          <p className="font-semibold leading-tight text-foreground">{title}</p>
          {children && <div className="mt-1.5 space-y-1.5">{children}</div>}
        </div>
      </div>
    </div>
  );
}

function DueCard({
  title,
  date,
  overdue,
  children,
}: {
  title: string;
  date?: string;
  overdue?: boolean;
  children?: ReactNode;
}) {
  const chip = overdue
    ? "bg-linear-to-r from-rose-500 to-red-500"
    : "bg-linear-to-r from-amber-500 to-orange-500";
  const wrapper = overdue
    ? `border-rose-200 dark:border-rose-900/60 ${CARD_GRADIENTS.rose}`
    : `border-amber-200 dark:border-amber-900/60 ${CARD_GRADIENTS.amber}`;
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${wrapper}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="font-semibold leading-tight text-foreground">{title}</p>
        {date && (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${chip}`}
          >
            <Calendar className="h-3 w-3" />
            {date}
          </span>
        )}
      </div>
      {children && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

function EntryCard({
  id,
  title,
  subtitle,
  badge,
  gradient,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  gradient?: keyof typeof CARD_GRADIENTS;
  children?: ReactNode;
}) {
  const bg = gradient ? CARD_GRADIENTS[gradient] : "bg-card";
  return (
    <div id={id} className={`h-full scroll-mt-24 rounded-lg border p-4 shadow-sm ${bg}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold leading-tight text-foreground">{title}</p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      {children && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

const FIELD_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
  home: MapPin,
  note: StickyNote,
  user: User,
  calendar: Calendar,
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const EMAIL_SPLIT_RE = /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

function linkifyEmails(children: ReactNode): ReactNode {
  if (typeof children !== "string") return children;
  return children.split(EMAIL_SPLIT_RE).map((part, i) =>
    EMAIL_RE.test(part) ? (
      <a
        key={i}
        href={`mailto:${part}`}
        className="text-primary underline underline-offset-2 hover:text-primary/80"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon?: keyof typeof FIELD_ICONS;
  label?: string;
  children: ReactNode;
}) {
  const Icon = icon ? FIELD_ICONS[icon] : null;
  const content = icon === "email" ? linkifyEmails(children) : children;
  return (
    <div className="flex items-start gap-2 text-sm text-foreground">
      {Icon && <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      <span className="min-w-0 wrap-break-word [&>p]:m-0">
        {label && <span className="text-muted-foreground">{label}: </span>}
        {content}
      </span>
    </div>
  );
}

function LinkCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description?: string;
}) {
  return (
    <a
      href={href}
      className="group my-3 flex items-center justify-between gap-3 rounded-lg border bg-card p-4 no-underline shadow-sm transition-colors hover:bg-accent"
    >
      <div className="min-w-0">
        <p className="mb-0.5 text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="m-0 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
    </a>
  );
}

export const mdxComponents = {
  h1: (props: React.ComponentProps<"h1">) => (
    <HeadingWithAnchor level={1} className="mb-4 mt-8 text-2xl font-bold first:mt-0">
      {props.children}
    </HeadingWithAnchor>
  ),
  h2: (props: React.ComponentProps<"h2">) => (
    <HeadingWithAnchor level={2} withIcon className="mb-3 mt-8 text-xl font-bold first:mt-0">
      {props.children}
    </HeadingWithAnchor>
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <HeadingWithAnchor level={3} withIcon className="mb-2 mt-6 text-lg font-semibold">
      {props.children}
    </HeadingWithAnchor>
  ),
  h4: (props: React.ComponentProps<"h4">) => (
    <HeadingWithAnchor level={4} className="mb-2 mt-4 text-base font-semibold">
      {props.children}
    </HeadingWithAnchor>
  ),
  p: (props: React.ComponentProps<"p">) => (
    <p className="my-3 text-sm leading-relaxed text-foreground" {...props} />
  ),
  ul: (props: React.ComponentProps<"ul">) => (
    <ul className="my-3 list-disc space-y-1 pl-6 text-sm text-foreground" {...props} />
  ),
  ol: (props: React.ComponentProps<"ol">) => (
    <ol className="my-3 list-decimal space-y-1 pl-6 text-sm text-foreground" {...props} />
  ),
  li: (props: React.ComponentProps<"li">) => (
    <li className="leading-relaxed" {...props} />
  ),
  a: (props: React.ComponentProps<"a">) => (
    <a className="text-primary underline underline-offset-2 hover:text-primary/80" {...props} />
  ),
  blockquote: (props: React.ComponentProps<"blockquote">) => (
    <blockquote
      className="my-4 border-l-4 border-border pl-4 text-sm italic text-muted-foreground"
      {...props}
    />
  ),
  code: (props: React.ComponentProps<"code">) => (
    <code
      className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground"
      {...props}
    />
  ),
  pre: (props: React.ComponentProps<"pre">) => (
    <pre
      className="my-4 overflow-x-auto rounded-lg border bg-muted p-4 text-xs"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-border" />,
  table: (props: React.ComponentProps<"table">) => (
    <div className="my-4 overflow-x-auto rounded-lg border">
      <table className="w-full text-sm" {...props} />
    </div>
  ),
  th: (props: React.ComponentProps<"th">) => (
    <th className="border-b bg-muted px-4 py-2 text-left font-semibold text-foreground" {...props} />
  ),
  td: (props: React.ComponentProps<"td">) => (
    <td className="border-b px-4 py-2 text-foreground" {...props} />
  ),
  AdminOnly,
  Callout,
  Checklist,
  ChecklistItem,
  Steps,
  Step,
  LinkCard,
  CardGrid,
  EntryCard,
  Field,
  PdfLink,
  Timeline,
  TimelineYear,
  TimelineItem,
  DueCard,
};
