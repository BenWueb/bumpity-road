"use client";

import { authClient } from "@/lib/auth-client";
import { CldImage } from "next-cloudinary";
import { LazyCldUploadButton as CldUploadButton } from "@/components/cloudinary/LazyUpload";
import {
  ImagePlus,
  Plus,
  Camera,
  LogIn,
} from "lucide-react";
import { useLoginModal } from "@/components/LoginModal";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImage, PendingUpload } from "@/types/gallery";
import { GalleryUploadPanel, type GalleryUploadFormState } from "@/components/gallery/GalleryUploadPanel";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import { PageHeader } from "@/components/PageHeader";

export default function GalleryPage() {
  const { data: session } = authClient.useSession();
  const { openLoginModal } = useLoginModal();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

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
    <div className="min-h-full bg-background">
      <PageHeader
        title="Gallery"
        subtitle={`${images.length} photo${images.length !== 1 ? "s" : ""}`}
        icon={<Camera className="h-5 w-5 md:h-6 md:w-6" />}
        iconWrapperClassName="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-rose-500 to-pink-600 text-white shadow-lg md:h-12 md:w-12"
        desktopAction={
          isLoggedIn ? (
            !pendingUpload ? (
              <CldUploadButton
                uploadPreset="bumpity-road"
                onSuccess={handleUploadSuccess}
                options={{ multiple: false, maxFiles: 1 }}
                className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
              >
                <Plus className="h-4 w-4" />
                Upload Photo
              </CldUploadButton>
            ) : null
          ) : (
            <button
              type="button"
              onClick={() => openLoginModal()}
              className="hidden items-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
            >
              <LogIn className="h-4 w-4" />
              Sign in to upload
            </button>
          )
        }
        mobileAction={
          isLoggedIn ? (
            !pendingUpload ? (
              <CldUploadButton
                uploadPreset="bumpity-road"
                onSuccess={handleUploadSuccess}
                options={{ multiple: false, maxFiles: 1 }}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-medium text-white shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Upload Photo
              </CldUploadButton>
            ) : null
          ) : (
            <button
              type="button"
              onClick={() => openLoginModal()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-2 text-sm font-medium text-white shadow-sm"
            >
              <LogIn className="h-4 w-4" />
              Sign in to upload
            </button>
          )
        }
        mobileActionClassName="sticky top-0 z-10 border-b bg-card/80 px-4 py-3 backdrop-blur-sm md:hidden"
      />

      <div className="mx-auto max-w-6xl p-4 md:p-6">

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
          isOwner={session?.user?.id === selectedImage.user.id}
          onDelete={() => handleDelete(selectedImage.id)}
        />
      )}
      </div>
    </div>
  );
}
