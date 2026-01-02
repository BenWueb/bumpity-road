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

type NavItem = {
  href: string;
  target?: string;
  label: string;
  icon: React.ReactNode;
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

  const items: NavItem[] = useMemo(
    () => [
      { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
      {
        href: "/todos",
        label: "Tasks",
        icon: <CheckSquare className="h-5 w-5" />,
      },
      {
        href: "/gallery",
        label: "Gallery",
        icon: <Images className="h-5 w-5" />,
      },
      {
        href: "/guestbook",
        label: "Guestbook",
        icon: <BookOpen className="h-5 w-5" />,
      },
      {
        href: "/blog",
        label: "Blog",
        icon: <NotebookPen className="h-5 w-5" />,
      },
      {
        href: "https://www.joanskitchen.app",
        target: "_blank",
        label: "Recipes",
        icon: <UtensilsCrossed className="h-5 w-5" />,
      },
      {
        href: "/sop",
        label: "SOP",
        icon: <NotebookText className="h-5 w-5" />,
      },
      {
        href: "/adventures",
        label: "Adventures",
        icon: <TentTree className="h-5 w-5" />,
      },
      {
        href: "/wildlife",
        label: "Wildlife",
        icon: <Panda className="h-5 w-5" />,
      },
      {
        href: "/loon",
        label: "Loons",
        icon: <Binoculars className="h-5 w-5" />,
      },

      { href: "/about", label: "About", icon: <Info className="h-5 w-5" /> },
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
          "fixed left-2 top-2 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-foreground shadow-md transition-opacity md:hidden",
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
          // Mobile: fixed overlay with dynamic viewport height for mobile browsers
          "fixed left-0 top-0 z-50 h-dvh max-h-dvh border-r bg-background transition-transform duration-200 md:relative md:z-auto md:h-screen md:max-h-screen md:translate-x-0 md:transition-[width]",
          // Mobile: slide in/out
          collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0",
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

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActivePath(pathname, item.href);
                // On mobile, always show labels. On desktop, hide when collapsed.
                const showLabel =
                  !collapsed ||
                  (typeof window !== "undefined" && window.innerWidth < 768);
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
                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      ].join(" ")}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {/* Mobile: always show. Desktop: hide when collapsed */}
                      <span
                        className={[
                          "truncate font-medium",
                          collapsed ? "md:hidden" : "",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
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
