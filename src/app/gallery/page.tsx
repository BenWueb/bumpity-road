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
  ChevronLeft,
  ChevronRight,
  ImageUp,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

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
  {
    value: "fall",
    label: "Fall",
    icon: TreeDeciduous,
    color: "text-orange-500",
  },
  { value: "winter", label: "Winter", icon: Snowflake, color: "text-blue-400" },
];

const ACTIVITIES = [
  { value: "fishing", label: "Fishing" },
  { value: "hiking", label: "Hiking" },
  { value: "bird_watching", label: "Bird Watching" },
  { value: "camping", label: "Camping" },
  { value: "food & drink", label: "Food & Drinks" },

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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settingHeader, setSettingHeader] = useState(false);
  const [headerSet, setHeaderSet] = useState(false);

  // Touch swipe tracking
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Check if user is admin
  useEffect(() => {
    async function checkAdmin() {
      if (!session?.user?.id) {
        setIsAdmin(false);
        return;
      }
      try {
        const res = await fetch(`/api/users?id=${session.user.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.user?.isAdmin ?? false);
        }
      } catch {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [session?.user?.id]);

  async function setAsHeaderImage(image: GalleryImage) {
    if (settingHeader) return;
    setSettingHeader(true);
    setHeaderSet(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "headerImageUrl",
          value: image.url,
        }),
      });

      if (res.ok) {
        setHeaderSet(true);
        setTimeout(() => setHeaderSet(false), 2000);
      }
    } catch {
      // Silently fail
    } finally {
      setSettingHeader(false);
    }
  }

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      setSelectedImage(images[newIndex]);
    }
  }, [selectedIndex, images]);

  const goToNext = useCallback(() => {
    if (selectedIndex < images.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      setSelectedImage(images[newIndex]);
    }
  }, [selectedIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Escape") {
        setSelectedImage(null);
        setSelectedIndex(-1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, goToPrevious, goToNext]);

  // Touch swipe handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }

  function handleTouchEnd() {
    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swiped left -> go to next
        goToNext();
      } else {
        // Swiped right -> go to previous
        goToPrevious();
      }
    }
  }

  function openLightbox(image: GalleryImage, index: number) {
    setSelectedImage(image);
    setSelectedIndex(index);
  }

  function closeLightbox() {
    setSelectedImage(null);
    setSelectedIndex(-1);
  }

  // Upload form state
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(
    null
  );
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
    <div className="flex h-full flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background shadow-sm md:h-10 md:w-10">
            <Camera className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Gallery</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
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
              className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
            >
              <ImagePlus className="h-4 w-4" />
              Upload Photo
            </CldUploadButton>
          )
        ) : (
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
          >
            <LogIn className="h-4 w-4" />
            Sign in to upload
          </Link>
        )}
      </div>

      {/* Mobile action button */}
      {isLoggedIn ? (
        !pendingUpload && (
          <CldUploadButton
            uploadPreset="bumpity-road"
            onSuccess={handleUploadSuccess}
            options={{ multiple: false, maxFiles: 1 }}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-600 md:hidden"
          >
            <ImagePlus className="h-4 w-4" />
            Upload Photo
          </CldUploadButton>
        )
      ) : (
        <Link
          href="/login"
          className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-600 md:hidden"
        >
          <LogIn className="h-4 w-4" />
          Sign in to upload
        </Link>
      )}

      {/* Upload Form Modal */}
      {pendingUpload && (
        <div className="mb-6 relative overflow-hidden rounded-xl border bg-card p-4 shadow-sm md:p-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10" />
          <div className="relative">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
              {/* Preview */}
              <div className="mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-muted sm:mx-0 sm:h-32 sm:w-32">
                <CldImage
                  src={pendingUpload.publicId}
                  alt="Upload preview"
                  width={128}
                  height={128}
                  crop="fill"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="mb-1 text-base font-semibold md:text-lg">
                  Add Photo Details
                </h2>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Add some details about this photo to help others discover it.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelUpload}
                className="absolute right-0 top-0 shrink-0 text-muted-foreground hover:text-foreground sm:static"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitUpload}
              className="space-y-3 md:space-y-4"
            >
              <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
                {/* Photographer Name */}
                <div>
                  <label
                    htmlFor="photographerName"
                    className="mb-1 block text-xs font-medium md:text-sm"
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
                    className="mb-1 block text-xs font-medium md:text-sm"
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
                <label className="mb-1.5 block text-xs font-medium md:mb-2 md:text-sm">
                  Season
                </label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
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
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors md:gap-2 md:px-3 md:py-1.5 md:text-sm ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-accent"
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 md:h-4 md:w-4 ${s.color}`}
                        />
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
                  className="mb-1 block text-xs font-medium md:text-sm"
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
                    rows={2}
                    maxLength={500}
                    className="w-full resize-none rounded-md border bg-background px-3 pb-5 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring md:rows-3 md:pb-6"
                  />
                  <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] text-muted-foreground md:bottom-2 md:text-xs">
                    {uploadForm.description.length}/500
                  </span>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="w-full rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:w-auto"
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-accent"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <ImagePlus className="mb-3 h-12 w-12 text-muted-foreground/50 md:mb-4 md:h-16 md:w-16" />
          <h2 className="text-base font-medium md:text-lg">No photos yet</h2>
          <p className="mt-1 text-xs text-muted-foreground md:text-sm">
            {isLoggedIn
              ? "Upload your first photo to get started!"
              : "Sign in to upload photos."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => openLightbox(image, index)}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 md:p-4"
          onClick={closeLightbox}
        >
          {/* Previous button - hidden on mobile, positioned outside the modal */}
          {selectedIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition-colors hover:bg-black/70 md:block"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next button - hidden on mobile, positioned outside the modal */}
          {selectedIndex < images.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur transition-colors hover:bg-black/70 md:block"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div
            className="relative flex max-h-[95vh] w-full max-w-[95vw] flex-col overflow-hidden rounded-lg bg-background shadow-2xl md:max-h-[90vh] md:w-auto md:max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1.5 text-white backdrop-blur transition-colors hover:bg-black/70 md:right-3 md:top-3 md:p-2"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            {/* Image counter */}
            <div className="absolute left-2 top-2 z-10 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur md:left-3 md:top-3 md:px-3 md:text-sm">
              {selectedIndex + 1} / {images.length}
            </div>

            <div className="relative flex-1 overflow-hidden">
              <CldImage
                src={selectedImage.publicId}
                alt={
                  selectedImage.description ||
                  selectedImage.caption ||
                  "Gallery image"
                }
                width={selectedImage.width || 1200}
                height={selectedImage.height || 800}
                className="max-h-[55vh] w-full object-contain md:max-h-[70vh] md:w-auto"
              />
            </div>

            <div className="shrink-0 border-t bg-background p-3 md:p-4">
              {/* Tags */}
              <div className="mb-2 flex flex-wrap items-center gap-1.5 md:gap-2">
                {selectedImage.season && (
                  <span className="flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium md:gap-1 md:px-2.5 md:py-1 md:text-xs">
                    {getSeasonIcon(selectedImage.season)}
                    {
                      SEASONS.find((s) => s.value === selectedImage.season)
                        ?.label
                    }
                  </span>
                )}
                {selectedImage.activity && (
                  <span className="rounded-full border bg-accent px-2 py-0.5 text-[10px] font-medium md:px-2.5 md:py-1 md:text-xs">
                    {getActivityLabel(selectedImage.activity)}
                  </span>
                )}
              </div>

              {/* Description */}
              {selectedImage.description && (
                <p className="mb-2 line-clamp-3 text-xs md:line-clamp-none md:text-sm">
                  {selectedImage.description}
                </p>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground md:text-sm">
                    {selectedImage.photographerName ? (
                      <>
                        Photo by{" "}
                        <span className="font-medium text-foreground">
                          {selectedImage.photographerName}
                        </span>
                      </>
                    ) : (
                      <>
                        Uploaded by{" "}
                        <span className="font-medium text-foreground">
                          {selectedImage.user.name}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  {/* Set as Header - Admin only */}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setAsHeaderImage(selectedImage)}
                      disabled={settingHeader}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 sm:w-auto md:text-sm"
                    >
                      {headerSet ? (
                        <>
                          <Check className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          Header Set!
                        </>
                      ) : (
                        <>
                          <ImageUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          {settingHeader ? "Setting..." : "Set as Header"}
                        </>
                      )}
                    </button>
                  )}

                  {/* Delete - Owner only */}
                  {session?.user?.id === selectedImage.user.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedImage.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20 sm:w-auto md:text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
