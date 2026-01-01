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
  const [collapsed, setCollapsed] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("sidebar:collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

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
      { href: "/about", label: "About", icon: <Info className="h-5 w-5" /> },
      {
        href: "https://www.joanskitchen.app",
        target: "_blank",
        label: "Recipes",
        icon: <UtensilsCrossed className="h-5 w-5" />,
      },
    ],
    []
  );

  return (
    <aside
      className={[
        "sticky top-0 h-screen shrink-0 border-r bg-background transition-[width]",
        collapsed ? "w-12 sm:w-16" : "w-48 sm:w-60",
      ].join(" ")}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 border-b px-2 py-2 sm:px-3 sm:py-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-accent sm:h-9 sm:w-9"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>

        <nav className="flex-1 px-1.5 py-2 sm:px-2 sm:py-3">
          <ul className="space-y-0.5 sm:space-y-1">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    target={item.target}
                    className={[
                      "group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors sm:gap-3 sm:px-3 sm:py-2 sm:text-sm",
                      active
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    ].join(" ")}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {collapsed ? null : (
                      <span className="truncate font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Feedback button */}
        <div className="border-t px-1.5 py-1.5 sm:px-2 sm:py-2">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:gap-3 sm:px-3 sm:py-2 sm:text-sm"
            title={collapsed ? "Send Feedback" : undefined}
          >
            <MessageSquarePlus className="h-5 w-5 shrink-0" />
            {collapsed ? null : (
              <span className="truncate font-medium">Send Feedback</span>
            )}
          </button>
        </div>

        <AccountBar collapsed={collapsed} />
      </div>

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
      />
    </aside>
  );
}
