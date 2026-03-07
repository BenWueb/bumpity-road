"use client";

import { useState } from "react";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";

interface Props {
  imageUrls: string[];
  maxHeight?: string;
}

export default function LoonPhotoGrid({
  imageUrls,
  maxHeight = "max-h-64",
}: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (imageUrls.length === 0) return null;

  return (
    <>
      <div
        className={`grid gap-2 ${imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
      >
        {imageUrls.map((url, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(idx);
            }}
            className="overflow-hidden rounded-md border transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`Photo ${idx + 1}`}
              className={`${maxHeight} w-full object-contain`}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <PhotoLightbox
          images={imageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
