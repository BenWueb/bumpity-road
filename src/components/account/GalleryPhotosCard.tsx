import Link from "next/link";
import { Camera } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { AccountCard } from "./AccountCard";
import type { AccountGalleryImage } from "@/types/account";

type Props = {
  galleryImages: AccountGalleryImage[];
};

export function GalleryPhotosCard({ galleryImages }: Props) {
  return (
    <AccountCard
      gradientClassName="bg-gradient-to-br from-rose-50 via-background to-pink-50 dark:from-rose-950/30 dark:via-background dark:to-pink-950/20"
    >
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
            <h3 className="text-sm font-semibold md:text-base">Your Photos</h3>
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">
            {galleryImages.length} photo{galleryImages.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="p-3 md:p-4">
          {galleryImages.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground md:py-8 md:text-base">
              <Camera className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
              <p>No photos uploaded yet.</p>
              <Link
                href="/gallery"
                className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                Upload your first photo
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6 md:gap-2 lg:grid-cols-8">
                {galleryImages.slice(0, 16).map((img) => (
                  <Link
                    key={img.id}
                    href="/gallery"
                    className="group aspect-square overflow-hidden rounded-lg bg-accent"
                  >
                    <CldImage
                      src={img.publicId}
                      width={100}
                      height={100}
                      alt={img.caption ?? "Gallery photo"}
                      crop="fill"
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                  </Link>
                ))}
              </div>
              {galleryImages.length > 16 && (
                <Link
                  href="/gallery"
                  className="mt-3 block text-center text-xs text-primary hover:underline md:mt-4 md:text-sm"
                >
                  View all {galleryImages.length} photos →
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </AccountCard>
  );
}


