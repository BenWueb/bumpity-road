"use client";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Calendar,
  Compass,
  Hammer,
  Home,
  ImagePlus,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  X,
} from "lucide-react";
import { InfoCard } from "@/components/ui/InfoCard";

type AboutData = {
  title: string;
  content: string;
  heroImageUrl: string | null;
  heroImagePublicId: string | null;
  updatedAt: string | null;
};

type Props = {
  initialAbout: AboutData;
  canEdit: boolean;
};

export default function AboutContent({ initialAbout, canEdit }: Props) {
  const [about, setAbout] = useState<AboutData>(initialAbout);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hardcoded About location info (no DB). Edit these values as needed.
  const ABOUT_LOCATION = {
    name: "Bumpity Road",
    address: "Backus, MN",
    phone: "(000) 000-0000",
    builtIn: "19XX",
    rebuiltIn: "20XX",
  };

  const [editTitle, setEditTitle] = useState(about.title);
  const [editContent, setEditContent] = useState(about.content);
  const [editHeroUrl, setEditHeroUrl] = useState<string | null>(
    about.heroImageUrl
  );
  const [editHeroPublicId, setEditHeroPublicId] = useState<string | null>(
    about.heroImagePublicId
  );

  const formattedUpdatedAt = useMemo(() => {
    if (!about.updatedAt) return null;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(about.updatedAt));
  }, [about.updatedAt]);

  function openEdit() {
    setEditTitle(about.title);
    setEditContent(about.content);
    setEditHeroUrl(about.heroImageUrl);
    setEditHeroPublicId(about.heroImagePublicId);
    setIsEditing(true);
  }

  function closeEdit() {
    setIsEditing(false);
  }

  async function save() {
    if (!editTitle.trim() || !editContent.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          heroImageUrl: editHeroUrl,
          heroImagePublicId: editHeroPublicId,
        }),
      });

      if (res.ok) {
        const refreshed = await fetch("/api/about").then((r) => r.json());
        setAbout(refreshed.about);
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  const editButton = canEdit ? (
    <button
      type="button"
      onClick={openEdit}
      className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
    >
      <Pencil className="h-4 w-4" />
      Edit
    </button>
  ) : null;

  return (
    <article className="relative min-w-0 flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-slate-50 via-background to-gray-50 dark:from-slate-950/20 dark:via-background dark:to-gray-950/10" />

      <div className="relative">
        {/* Hero */}
        {about.heroImageUrl ? (
          <div className="relative h-56 w-full overflow-hidden bg-accent sm:h-80 lg:h-96">
            <Image
              src={about.heroImageUrl}
              alt={about.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
              <div className="mb-2 flex items-center justify-between gap-3">
                {editButton}
              </div>
              {formattedUpdatedAt && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-white/90 sm:text-sm">
                  <Calendar className="h-4 w-4" />
                  Updated {formattedUpdatedAt}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                {formattedUpdatedAt && (
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground md:text-sm">
                    <Calendar className="h-4 w-4" />
                    Updated {formattedUpdatedAt}
                  </div>
                )}
                <h1 className="text-xl font-bold md:text-3xl">{about.title}</h1>
              </div>
              {editButton}
            </div>
          </div>
        )}

        {/* Info cards (hardcoded) */}
        <div className="mt-6 px-4 pb-2 sm:px-6 sm:pb-3 md:px-8 md:pb-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoCard
              title="What is Bumpity Road?"
              icon={
                <Home className="h-7 w-7 shrink-0 text-amber-600 dark:text-amber-400" />
              }
              className="bg-background/40"
            >
              A place to consolidate and share our thoughts, projects,
              experiences and ideas.
            </InfoCard>
            <InfoCard
              title="At a glance"
              icon={
                <MapPin className="h-7 w-7 shrink-0 text-emerald-600 dark:text-emerald-400" />
              }
              className="bg-background/70"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{ABOUT_LOCATION.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{ABOUT_LOCATION.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hammer className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Built in {ABOUT_LOCATION.builtIn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>Rebuilt in {ABOUT_LOCATION.rebuiltIn}</span>
                </div>
              </div>
            </InfoCard>

            <InfoCard
              title="What you’ll find here"
              icon={
                <Compass className="h-7 w-7 shrink-0 text-indigo-600 dark:text-indigo-400" />
              }
              className="bg-background/40"
            >
              Adventures, photos, wildlife sightings, and puzzles...lots of
              puzzles.
            </InfoCard>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="space-y-3 text-sm leading-relaxed text-foreground md:space-y-4 md:text-base">
            {about.content
              .split("\n")
              .map((p, i) =>
                p.trim() ? <p key={i}>{p}</p> : <div key={i} className="h-2" />
              )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-4"
          onClick={closeEdit}
        >
          <div
            className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-4 shadow-xl md:max-h-[90vh] md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <h2 className="text-base font-semibold md:text-lg">Edit About</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Content
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={10}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Header Image
                </label>

                {editHeroUrl ? (
                  <div className="relative h-40 overflow-hidden rounded-lg border">
                    <Image
                      src={editHeroUrl}
                      alt="About header"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEditHeroUrl(null);
                        setEditHeroPublicId(null);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <CldUploadWidget
                    uploadPreset="bumpity-road"
                    options={{ maxFiles: 1 }}
                    onSuccess={(result) => {
                      if (typeof result.info === "object" && result.info) {
                        const info = result.info as {
                          secure_url: string;
                          public_id: string;
                        };
                        setEditHeroUrl(info.secure_url);
                        setEditHeroPublicId(info.public_id);
                      }
                    }}
                  >
                    {({ open }) => (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-accent"
                      >
                        <ImagePlus className="h-4 w-4" />
                        Upload header image
                      </button>
                    )}
                  </CldUploadWidget>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-lg border bg-background px-4 py-2 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving || !editTitle.trim() || !editContent.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
