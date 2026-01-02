"use client";

import { getActivityLabel, getSeasonIcon, SEASONS } from "@/lib/gallery-constants";
import type { GalleryImage } from "@/types/gallery";
import { CldImage } from "next-cloudinary";
import { Check, ChevronLeft, ChevronRight, ImageUp, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  images: GalleryImage[];
  selectedImage: GalleryImage;
  selectedIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isAdmin: boolean;
  isOwner: boolean;
  settingHeader: boolean;
  headerSet: boolean;
  onSetAsHeader: () => void;
  onDelete: () => void;
};

export function GalleryLightbox({
  images,
  selectedImage,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
  isAdmin,
  isOwner,
  settingHeader,
  headerSet,
  onSetAsHeader,
  onDelete,
}: Props) {
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious]);

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
        onNext();
      } else {
        // Swiped right -> go to previous
        onPrevious();
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 md:p-4"
      onClick={onClose}
    >
      {/* Previous button - hidden on mobile, positioned outside the modal */}
      {selectedIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
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
            onNext();
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
          onClick={onClose}
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
            alt={selectedImage.description || selectedImage.caption || "Gallery image"}
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
                {SEASONS.find((s) => s.value === selectedImage.season)?.label}
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
                  onClick={onSetAsHeader}
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
              {isOwner && (
                <button
                  type="button"
                  onClick={onDelete}
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
  );
}


