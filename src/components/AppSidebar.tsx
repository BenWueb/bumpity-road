"use client";

import AccountBar from "@/components/AccountBar";
import FeedbackModal from "@/components/FeedbackModal";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckSquare,
  Home,
  Images,
  Info,
  Menu,
  MessageSquarePlus,
  NotebookPen,
  UtensilsCrossed,
  NotebookText,
  TentTree,
  Binoculars,
  Panda,
  X,
} from "lucide-react";

type NavPill = {
  label: string;
  title?: string;
  pillClassName: string;
  iconClassName?: string;
  // Optional: override link styling for special "accent" sections (e.g. Adventures)
  linkActiveClassName?: string;
  linkInactiveClassName?: string;
};

const SIDEBAR_PILL_STYLES = {
  NEW: {
    label: "NEW",
    title: "New",
    pillClassName:
      "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300",
    iconClassName: "text-emerald-700 dark:text-emerald-300",
    linkActiveClassName:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    linkInactiveClassName:
      "text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200",
  },
  SOON: {
    label: "SOON",
    title: "Coming soon",
    pillClassName:
      "rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300",
    iconClassName: "text-sky-700 dark:text-sky-300",
  },
  BUILDING: {
    label: "BUILDING",
    title: "Building",
    pillClassName:
      "rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300",
    iconClassName: "text-amber-700 dark:text-amber-300",
  },
} as const satisfies Record<string, NavPill>;

type NavItem = {
  href: string;
  target?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pill?: NavPill;
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true); // Start collapsed on mobile
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Load saved state (only applies to desktop behavior)
  useEffect(() => {
    const saved = window.localStorage.getItem("sidebar:collapsed");
    if (saved === "1") setCollapsed(true);
    else if (saved === "0") setCollapsed(false);
  }, []);

  // Save state
  useEffect(() => {
    window.localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    // Only auto-close on mobile when navigating
    if (window.innerWidth < 768 && !collapsed) {
      setCollapsed(true);
    }
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Allow global UI elements (e.g. announcement bar) to open the feedback modal.
  useEffect(() => {
    function onOpen() {
      setFeedbackOpen(true);
    }
    window.addEventListener("openFeedbackModal", onOpen);
    return () => window.removeEventListener("openFeedbackModal", onOpen);
  }, []);

  const items: NavItem[] = useMemo(
    () => [
      { href: "/", label: "Home", icon: Home },
      {
        href: "/todos",
        label: "Tasks",
        icon: CheckSquare,
      },
      {
        href: "/gallery",
        label: "Gallery",
        icon: Images,
      },
      {
        href: "/guestbook",
        label: "Guestbook",
        icon: BookOpen,
      },
      {
        href: "/blog",
        label: "Blog",
        icon: NotebookPen,
      },
      {
        href: "https://www.joanskitchen.app",
        target: "_blank",
        label: "Recipes",
        icon: UtensilsCrossed,
      },
      {
        href: "/sop",
        label: "SOP",
        icon: NotebookText,
        pill: SIDEBAR_PILL_STYLES.SOON,
      },
      {
        href: "/adventures",
        label: "Adventures",
        icon: TentTree,
        pill: SIDEBAR_PILL_STYLES.NEW,
      },
      {
        href: "/wildlife",
        label: "Wildlife",
        icon: Panda,
        pill: SIDEBAR_PILL_STYLES.SOON,
      },
      {
        href: "/loon",
        label: "Loons",
        icon: Binoculars,
        pill: SIDEBAR_PILL_STYLES.SOON,
      },

      {
        href: "/about",
        label: "About",
        icon: Info,
        pill: SIDEBAR_PILL_STYLES.BUILDING,
      },
    ],
    []
  );

  return (
    <>
      {/* Mobile: Fixed menu button when sidebar is collapsed */}
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className={[
          "fixed bottom-4 right-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white shadow-xl ring-1 ring-black/5 transition-opacity hover:from-emerald-600 hover:to-teal-600 md:hidden dark:ring-white/10",
          collapsed ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop */}
      {!collapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          // Mobile: fixed overlay on right, Desktop: relative on left
          "fixed right-0 top-0 z-50 h-full max-h-full border-l bg-background transition-transform duration-200 md:relative md:left-0 md:right-auto md:z-auto md:h-full md:max-h-full md:translate-x-0 md:border-l-0 md:border-r md:transition-[width]",
          // Mobile: slide in/out from right
          collapsed ? "translate-x-full md:translate-x-0" : "translate-x-0",
          // Width
          collapsed ? "w-56 md:w-16" : "w-56 md:w-60",
        ].join(" ")}
      >
        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-3">
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {/* Show X on mobile when open, Menu otherwise */}
              <span className="md:hidden">
                {collapsed ? (
                  <Menu className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </span>
              <span className="hidden md:block">
                <Menu className="h-5 w-5" />
              </span>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const pill = item.pill;
                // On mobile, always show labels. On desktop, hide when collapsed.
                const showLabel =
                  !collapsed ||
                  (typeof window !== "undefined" && window.innerWidth < 768);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      target={item.target}
                      onClick={() => {
                        // Close on mobile after clicking
                        if (window.innerWidth < 768) {
                          setCollapsed(true);
                        }
                      }}
                      className={[
                        "group flex w-full min-w-0 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pill?.linkActiveClassName || pill?.linkInactiveClassName
                          ? active
                            ? pill.linkActiveClassName ??
                              "bg-accent text-foreground"
                            : pill.linkInactiveClassName ??
                              "text-muted-foreground hover:bg-accent hover:text-foreground"
                          : active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      ].join(" ")}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="shrink-0">
                        <Icon
                          className={[
                            "h-5 w-5",
                            pill?.iconClassName ?? "",
                          ].join(" ")}
                        />
                      </span>
                      {/* Mobile: always show. Desktop: hide when collapsed */}
                      <span
                        className={[
                          "min-w-0 truncate font-medium",
                          collapsed ? "md:hidden" : "",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                      {pill && showLabel && (
                        <span
                          className={`ml-auto shrink-0 ${pill.pillClassName}`}
                          title={pill.title}
                        >
                          {pill.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Feedback button */}
          <div className="shrink-0 border-t px-2 py-2">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title={collapsed ? "Send Feedback" : undefined}
            >
              <MessageSquarePlus className="h-5 w-5 shrink-0" />
              <span
                className={[
                  "truncate font-medium",
                  collapsed ? "md:hidden" : "",
                ].join(" ")}
              >
                Send Feedback
              </span>
            </button>
          </div>

          <AccountBar collapsed={collapsed} />
        </div>

        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
        />
      </aside>
    </>
  );
}
