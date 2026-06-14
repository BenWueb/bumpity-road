"use client";

import { useState } from "react";
import { Calendar, Camera, LogOut, Mail, Pencil, X } from "lucide-react";
import { LazyCldUploadButton as CldUploadButton } from "@/components/cloudinary/LazyUpload";
import { AccountCard } from "./AccountCard";
import type { AccountUser } from "@/types/account";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  user: AccountUser;
  createdDate: string;
  loggingOut: boolean;
  onLogout: () => void;
  onUserUpdate: (updates: { name?: string; image?: string | null }) => void;
};

export function ProfileCard({
  user,
  createdDate,
  loggingOut,
  onLogout,
  onUserUpdate,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(updates: { name?: string; image?: string | null }) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to update profile");
      }
      const data = (await res.json()) as { user: AccountUser };
      onUserUpdate({
        name: data.user.name,
        image: data.user.image,
      });
      if (updates.name !== undefined) {
        setName(data.user.name);
      }
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    if (trimmed === user.name) {
      setEditing(false);
      return;
    }
    await saveProfile({ name: trimmed });
  }

  return (
    <AccountCard gradientClassName={CARD_GRADIENTS.violet}>
      <div className="relative p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          <div className="relative shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                className="h-12 w-12 rounded-full border-2 object-cover md:h-16 md:w-16"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-linear-to-br from-violet-100 to-purple-100 text-lg font-bold text-violet-600 dark:from-violet-900/50 dark:to-purple-900/50 dark:text-violet-300 md:h-16 md:w-16 md:text-2xl">
                {user.name?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            {editing && (
              <CldUploadButton
                uploadPreset="bumpity-road"
                onSuccess={(result) => {
                  const info = result.info as { secure_url: string };
                  void saveProfile({ image: info.secure_url });
                }}
                className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-foreground"
              >
                <Camera className="h-3.5 w-3.5" />
              </CldUploadButton>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              {editing ? (
                <div className="min-w-0 flex-1 space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-md border bg-background px-2 py-1 text-sm md:text-base"
                    disabled={saving}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handleSaveName()}
                      disabled={saving}
                      className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setName(user.name);
                        setError(null);
                      }}
                      disabled={saving}
                      className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <h2 className="truncate text-lg font-semibold md:text-xl">
                  {user.name}
                </h2>
              )}
              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label="Edit profile"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>

            {error && (
              <p className="mt-2 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}

            <div className="mt-1 space-y-0.5 md:mt-2 md:space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                <Mail className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground md:text-sm">
                <Calendar className="h-3.5 w-3.5 shrink-0 md:h-4 md:w-4" />
                <span>Joined {createdDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t pt-4">
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="flex w-full items-center justify-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </AccountCard>
  );
}
