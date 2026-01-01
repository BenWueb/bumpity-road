"use client";

import { authClient } from "@/lib/auth-client";
import { CldUploadButton, CldImage } from "next-cloudinary";
import {
  ImagePlus,
  Trash2,
  X,
  Camera,
  Leaf,
  Sun,
  Snowflake,
  TreeDeciduous,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type GalleryImage = {
  id: string;
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
  caption: string | null;
  description: string | null;
  photographerName: string | null;
  season: string | null;
  activity: string | null;
  createdAt: string;
  user: { id: string; name: string };
};

type PendingUpload = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
};

const SEASONS = [
  { value: "spring", label: "Spring", icon: Leaf, color: "text-green-500" },
  { value: "summer", label: "Summer", icon: Sun, color: "text-yellow-500" },
  { value: "fall", label: "Fall", icon: TreeDeciduous, color: "text-orange-500" },
  { value: "winter", label: "Winter", icon: Snowflake, color: "text-blue-400" },
];

const ACTIVITIES = [
  { value: "fishing", label: "Fishing" },
  { value: "hiking", label: "Hiking" },
  { value: "bird_watching", label: "Bird Watching" },
  { value: "camping", label: "Camping" },
  { value: "boating", label: "Boating" },
  { value: "wildlife", label: "Wildlife" },
  { value: "scenic", label: "Scenic" },
  { value: "other", label: "Other" },
];

function getSeasonIcon(season: string | null) {
  const s = SEASONS.find((x) => x.value === season);
  if (!s) return null;
  const Icon = s.icon;
  return <Icon className={`h-4 w-4 ${s.color}`} />;
}

function getActivityLabel(activity: string | null) {
  return ACTIVITIES.find((a) => a.value === activity)?.label ?? activity;
}

export default function GalleryPage() {
  const { data: session } = authClient.useSession();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Upload form state
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [uploadForm, setUploadForm] = useState({
    photographerName: "",
    description: "",
    season: "",
    activity: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  // Pre-fill photographer name with user's name when session loads
  useEffect(() => {
    if (session?.user?.name && !uploadForm.photographerName) {
      setUploadForm((prev) => ({
        ...prev,
        photographerName: session.user.name,
      }));
    }
  }, [session?.user?.name, uploadForm.photographerName]);

  async function loadImages() {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data.images ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleUploadSuccess(result: unknown) {
    const r = result as {
      info?:
        | {
            public_id?: string;
            secure_url?: string;
            width?: number;
            height?: number;
          }
        | string;
    };
    const info = typeof r.info === "object" ? r.info : null;
    if (!info?.public_id || !info?.secure_url) return;

    // Show the metadata form
    setPendingUpload({
      publicId: info.public_id,
      url: info.secure_url,
      width: info.width,
      height: info.height,
    });
  }

  async function handleSubmitUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingUpload || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: pendingUpload.publicId,
          url: pendingUpload.url,
          width: pendingUpload.width,
          height: pendingUpload.height,
          photographerName: uploadForm.photographerName.trim() || undefined,
          description: uploadForm.description.trim() || undefined,
          season: uploadForm.season || undefined,
          activity: uploadForm.activity || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [data.image, ...prev]);
        setPendingUpload(null);
        setUploadForm({
          photographerName: session?.user?.name || "",
          description: "",
          season: "",
          activity: "",
        });
      }
    } catch {
      loadImages();
    } finally {
      setSubmitting(false);
    }
  }

  function cancelUpload() {
    setPendingUpload(null);
    setUploadForm({
      photographerName: session?.user?.name || "",
      description: "",
      season: "",
      activity: "",
    });
  }

  async function handleDelete(id: string) {
    const prev = images;
    setImages((imgs) => imgs.filter((img) => img.id !== id));
    setSelectedImage(null);

    try {
      await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
    } catch {
      setImages(prev);
    }
  }

  const isLoggedIn = !!session?.user;

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background shadow-sm">
            <Camera className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gallery</h1>
            <p className="text-sm text-muted-foreground">
              {images.length} photo{images.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {isLoggedIn ? (
          !pendingUpload && (
            <CldUploadButton
              uploadPreset="bumpity-road"
              onSuccess={handleUploadSuccess}
              options={{ multiple: false, maxFiles: 1 }}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <ImagePlus className="h-4 w-4" />
              Upload Photo
            </CldUploadButton>
          )
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogIn className="h-4 w-4" />
            Sign in to upload
          </Link>
        )}
      </div>

      {/* Upload Form Modal */}
      {pendingUpload && (
        <div className="mb-6 relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10" />
          <div className="relative">
            <div className="mb-4 flex items-start gap-4">
              {/* Preview */}
              <div className="h-32 w-32 shrink-0 overflow-hidden rounded-lg border bg-muted">
                <CldImage
                  src={pendingUpload.publicId}
                  alt="Upload preview"
                  width={128}
                  height={128}
                  crop="fill"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h2 className="mb-1 text-lg font-semibold">Add Photo Details</h2>
                <p className="text-sm text-muted-foreground">
                  Add some details about this photo to help others discover it.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelUpload}
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Photographer Name */}
                <div>
                  <label
                    htmlFor="photographerName"
                    className="mb-1 block text-sm font-medium"
                  >
                    Your Name
                  </label>
                  <input
                    id="photographerName"
                    type="text"
                    value={uploadForm.photographerName}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        photographerName: e.target.value,
                      }))
                    }
                    placeholder="Enter your name..."
                    maxLength={100}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Activity */}
                <div>
                  <label
                    htmlFor="activity"
                    className="mb-1 block text-sm font-medium"
                  >
                    Activity
                  </label>
                  <select
                    id="activity"
                    value={uploadForm.activity}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        activity: e.target.value,
                      }))
                    }
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select activity...</option>
                    {ACTIVITIES.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Season */}
              <div>
                <label className="mb-2 block text-sm font-medium">Season</label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((s) => {
                    const Icon = s.icon;
                    const isSelected = uploadForm.season === s.value;
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() =>
                          setUploadForm((prev) => ({
                            ...prev,
                            season: isSelected ? "" : s.value,
                          }))
                        }
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-accent"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${s.color}`} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-sm font-medium"
                >
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) =>
                      setUploadForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="What's happening in this photo..."
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-md border bg-background px-3 pb-6 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {uploadForm.description.length}/500
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Photo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-accent"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <ImagePlus className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h2 className="text-lg font-medium">No photos yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLoggedIn
              ? "Upload your first photo to get started!"
              : "Sign in to upload photos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <CldImage
                src={image.publicId}
                alt={image.description || image.caption || "Gallery image"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Gradient overlay - always visible */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Photo info overlay */}
              <div className="absolute inset-x-0 bottom-0 p-2 text-white">
                {/* Photographer name */}
                {image.photographerName && (
                  <p className="truncate text-xs font-medium drop-shadow-md">
                    {image.photographerName}
                  </p>
                )}
                
                {/* Description */}
                {image.description && (
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-white/90 drop-shadow-sm">
                    {image.description}
                  </p>
                )}
                
                {/* Tags row */}
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  {image.season && (
                    <span className="flex items-center gap-0.5 rounded bg-white/20 px-1.5 py-0.5 text-[10px] backdrop-blur-sm">
                      {getSeasonIcon(image.season)}
                      <span className="hidden sm:inline">
                        {SEASONS.find((s) => s.value === image.season)?.label}
                      </span>
                    </span>
                  )}
                  {image.activity && (
                    <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] backdrop-blur-sm">
                      {getActivityLabel(image.activity)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-background shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative">
              <CldImage
                src={selectedImage.publicId}
                alt={selectedImage.description || selectedImage.caption || "Gallery image"}
                width={selectedImage.width || 1200}
                height={selectedImage.height || 800}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="border-t bg-background p-4">
              {/* Tags */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {selectedImage.season && (
                  <span className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium">
                    {getSeasonIcon(selectedImage.season)}
                    {SEASONS.find((s) => s.value === selectedImage.season)?.label}
                  </span>
                )}
                {selectedImage.activity && (
                  <span className="rounded-full border bg-accent px-2.5 py-1 text-xs font-medium">
                    {getActivityLabel(selectedImage.activity)}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedImage.description && (
                <p className="mb-2 text-sm">{selectedImage.description}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedImage.photographerName ? (
                      <>
                        Photo by <span className="font-medium text-foreground">{selectedImage.photographerName}</span>
                      </>
                    ) : (
                      <>
                        Uploaded by <span className="font-medium text-foreground">{selectedImage.user.name}</span>
                      </>
                    )}
                  </p>
                </div>

                {session?.user?.id === selectedImage.user.id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedImage.id)}
                    className="ml-4 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
