"use client";

import { CldImage } from "next-cloudinary";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { PostImage } from "@/types/blog";

type Props = {
  images: PostImage[];
  title: string;
  author: string;
  date: string;
  headerAction?: React.ReactNode;
};

export default function BlogPostImages({ images, title, author, date, headerAction }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrev();
    if (e.key === "ArrowRight") goToNext();
  };

  const headerImage = images[0];
  const galleryImages = images.slice(1);

  return (
    <>
      {/* Header Image with Title Overlay */}
      <div
        className="relative h-72 w-full cursor-pointer overflow-hidden sm:h-96"
        onClick={() => openLightbox(0)}
      >
        <CldImage
          src={headerImage.publicId}
          width={headerImage.width ?? 800}
          height={headerImage.height ?? 400}
          alt={title}
          crop="fill"
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        {/* Gradient overlay for text contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Title and meta overlay */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span>{author}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
          <h1 className="text-2xl font-bold text-white drop-shadow-lg sm:text-3xl lg:text-4xl">
            {title}
          </h1>
        </div>

        {/* Top bar: counter and actions */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {headerAction}
          {images.length > 1 && (
            <div className="rounded-full bg-black/60 px-3 py-1 text-sm text-white">
              1 of {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Gallery Images in Brick Layout */}
      {galleryImages.length > 0 && (
        <div className="relative border-t p-4">
          <div className="columns-2 gap-3 sm:columns-3">
            {galleryImages.map((img, i) => (
              <div
                key={img.id}
                className="mb-3 cursor-pointer overflow-hidden rounded-lg break-inside-avoid"
                onClick={() => openLightbox(i + 1)}
              >
                <CldImage
                  src={img.publicId}
                  width={img.width ?? 400}
                  height={img.height ?? 300}
                  alt={`${title} image ${i + 2}`}
                  className="w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
                className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} className="max-h-[85vh] max-w-[90vw]">
            <CldImage
              src={images[lightboxIndex].publicId}
              width={images[lightboxIndex].width ?? 1200}
              height={images[lightboxIndex].height ?? 900}
              alt={`${title} image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            />
          </div>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}

