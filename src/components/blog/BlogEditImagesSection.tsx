"use client";

import { CldImage } from "next-cloudinary";
import { LazyCldUploadButton as CldUploadButton } from "@/components/cloudinary/LazyUpload";
import { ImagePlus, Trash2, X } from "lucide-react";
import type { PostImage, UploadedImage } from "@/types/blog";

type Props = {
  existingImages: PostImage[];
  newImages: UploadedImage[];
  headerKey: string | null;
  imagesToRemoveCount: number;
  remainingImages: number;
  onHeaderChange: (key: string) => void;
  onRemoveExisting: (imageId: string) => void;
  onRemoveNew: (publicId: string) => void;
  onUploadSuccess: (result: unknown) => void;
};

export function BlogEditImagesSection({
  existingImages,
  newImages,
  headerKey,
  imagesToRemoveCount,
  remainingImages,
  onHeaderChange,
  onRemoveExisting,
  onRemoveNew,
  onUploadSuccess,
}: Props) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        Photos <span className="text-destructive">*</span>
      </label>
      <p className="mb-2 text-xs text-muted-foreground">
        Click a photo to use it as the header image.
      </p>
      <div className="flex flex-wrap gap-3">
        {existingImages.map((img) => {
          const key = `existing:${img.id}`;
          const isHeader = headerKey === key;
          return (
            <div key={img.id} className="group relative">
              <button
                type="button"
                onClick={() => onHeaderChange(key)}
                className={`relative block overflow-hidden rounded-lg border-2 transition-colors ${
                  isHeader
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                title={isHeader ? "Header photo" : "Set as header photo"}
              >
                <CldImage
                  src={img.publicId}
                  width={100}
                  height={100}
                  alt="Post image"
                  crop="fill"
                  className="h-20 w-20 object-cover"
                />
                {isHeader && (
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Header
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemoveExisting(img.id)}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                title="Remove image"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        {newImages.map((img) => {
          const key = `new:${img.publicId}`;
          const isHeader = headerKey === key;
          return (
            <div key={img.publicId} className="group relative">
              <button
                type="button"
                onClick={() => onHeaderChange(key)}
                className={`relative block overflow-hidden rounded-lg border-2 transition-colors ${
                  isHeader
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                title={isHeader ? "Header photo" : "Set as header photo"}
              >
                <CldImage
                  src={img.publicId}
                  width={100}
                  height={100}
                  alt="New image"
                  crop="fill"
                  className="h-20 w-20 object-cover"
                />
                {isHeader && (
                  <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    Header
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRemoveNew(img.publicId)}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                title="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}

        <CldUploadButton
          uploadPreset="bumpity-road"
          onSuccess={onUploadSuccess}
          className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <ImagePlus className="h-6 w-6" />
        </CldUploadButton>
      </div>
      {imagesToRemoveCount > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {imagesToRemoveCount} image(s) will be removed on save
        </p>
      )}
      {remainingImages === 0 && (
        <p className="mt-2 text-xs text-destructive">
          At least one photo is required.
        </p>
      )}
    </div>
  );
}
