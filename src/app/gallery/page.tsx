"use client";

import { authClient } from "@/lib/auth-client";
import { CldUploadButton, CldImage } from "next-cloudinary";
import { getActivityLabel, getSeasonIcon, SEASONS } from "@/lib/gallery-constants";
import {
  ImagePlus,
  Camera,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImage, PendingUpload } from "@/types/gallery";
import { GalleryUploadPanel, type GalleryUploadFormState } from "@/components/gallery/GalleryUploadPanel";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";

export default function GalleryPage() {
  const { data: session } = authClient.useSession();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settingHeader, setSettingHeader] = useState(false);
  const [headerSet, setHeaderSet] = useState(false);

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

  // (Keyboard + swipe navigation is encapsulated in <GalleryLightbox />)

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
  const [uploadForm, setUploadForm] = useState<GalleryUploadFormState>({
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg md:h-12 md:w-12">
                <Camera className="h-5 w-5 md:h-6 md:w-6" />
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
                  className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
                >
                  <ImagePlus className="h-4 w-4" />
                  Upload Photo
                </CldUploadButton>
              )
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
              >
                <LogIn className="h-4 w-4" />
                Sign in to upload
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4 md:p-6">

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
        <GalleryUploadPanel
          pendingUpload={pendingUpload}
          uploadForm={uploadForm}
          setUploadForm={setUploadForm}
          submitting={submitting}
          onCancel={cancelUpload}
          onSubmit={handleSubmitUpload}
        />
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
        <GalleryLightbox
          images={images}
          selectedImage={selectedImage}
          selectedIndex={selectedIndex}
          onClose={closeLightbox}
          onPrevious={goToPrevious}
          onNext={goToNext}
          isAdmin={isAdmin}
          isOwner={session?.user?.id === selectedImage.user.id}
          settingHeader={settingHeader}
          headerSet={headerSet}
          onSetAsHeader={() => setAsHeaderImage(selectedImage)}
          onDelete={() => handleDelete(selectedImage.id)}
        />
      )}
      </div>
    </div>
  );
}
