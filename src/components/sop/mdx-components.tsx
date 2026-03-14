import type { ReactNode } from "react";
import { AlertTriangle, Info, AlertCircle, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { ChecklistItem } from "./ChecklistItem";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function HeadingWithAnchor({
  level,
  children,
  className,
}: {
  level: 1 | 2 | 3 | 4;
  children: ReactNode;
  className: string;
}) {
  const text = typeof children === "string" ? children : "";
  const id = slugify(text);
  const Tag = `h${level}` as const;

  return (
    <Tag id={id} className={`group scroll-mt-24 ${className}`}>
      <a
        href={`#${id}`}
        className="inline-flex items-center gap-2 no-underline hover:underline"
      >
        {children}
        <LinkIcon className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-40" />
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
      className="my-3 block rounded-lg border bg-card p-4 no-underline shadow-sm transition-colors hover:bg-accent"
    >
      <p className="mb-0.5 text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="m-0 text-xs text-muted-foreground">{description}</p>
      )}
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
    <HeadingWithAnchor level={2} className="mb-3 mt-8 text-xl font-bold first:mt-0">
      {props.children}
    </HeadingWithAnchor>
  ),
  h3: (props: React.ComponentProps<"h3">) => (
    <HeadingWithAnchor level={3} className="mb-2 mt-6 text-lg font-semibold">
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
  Callout,
  Checklist,
  ChecklistItem,
  Steps,
  Step,
  LinkCard,
};
