"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogIn, LogOut, Settings, User } from "lucide-react";

function initialsFromName(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "U";
  const parts = n.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export default function AccountBar({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, bottom: 0, width: 0 });

  // Client-side only for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opening
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 8,
        width: collapsed ? 160 : rect.width,
      });
    }
  }, [open, collapsed]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function onLogout() {
    setOpen(false);
    await authClient.signOut();
    router.refresh();
  }

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        left: dropdownPosition.left,
        bottom: dropdownPosition.bottom,
        width: dropdownPosition.width,
        minWidth: 160,
      }}
      className="z-[100] rounded-md border bg-background shadow-lg"
    >
      <div className="p-1">
        {session?.user ? (
          <>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 whitespace-nowrap rounded-sm px-2 py-2 text-sm hover:bg-accent"
            >
              <User className="h-4 w-4 shrink-0" />
              Account
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center gap-2 whitespace-nowrap rounded-sm px-2 py-2 text-left text-sm hover:bg-accent"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Log out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 whitespace-nowrap rounded-sm px-2 py-2 text-sm hover:bg-accent"
            >
              <LogIn className="h-4 w-4 shrink-0" />
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 whitespace-nowrap rounded-sm px-2 py-2 text-sm hover:bg-accent"
            >
              <User className="h-4 w-4 shrink-0" />
              Create account
            </Link>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="shrink-0 border-t p-2">
      {isPending ? (
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="h-9 w-9 animate-pulse rounded-full bg-accent" />
          <div className={["min-w-0 flex-1", collapsed ? "md:hidden" : ""].join(" ")}>
            <div className="h-4 w-28 animate-pulse rounded-md bg-accent" />
            <div className="mt-2 h-3 w-36 animate-pulse rounded-md bg-accent" />
          </div>
        </div>
      ) : (
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={[
              "w-full rounded-md px-2 py-2 transition-colors",
              "flex cursor-pointer items-center gap-3",
              "hover:bg-accent",
            ].join(" ")}
            title={
              collapsed
                ? session?.user?.name ?? session?.user?.email ?? "Account"
                : undefined
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-sm font-semibold">
              {initialsFromName(session?.user?.name)}
            </div>

            <div className={["min-w-0 flex-1 text-left", collapsed ? "md:hidden" : ""].join(" ")}>
              <div className="truncate text-sm font-medium">
                {session?.user?.name ?? "Guest"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {session?.user?.email ?? "Not signed in"}
              </div>
            </div>

            <Settings className={["h-4 w-4 text-muted-foreground", collapsed ? "md:hidden" : ""].join(" ")} />
          </button>

          {open && mounted && createPortal(dropdownContent, document.body)}
        </div>
      )}
    </div>
  );
}
