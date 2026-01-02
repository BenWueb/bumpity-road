"use client";

import { ACTIVITIES, SEASONS } from "@/lib/gallery-constants";
import type { PendingUpload } from "@/types/gallery";
import { CldImage } from "next-cloudinary";
import { X } from "lucide-react";

export type GalleryUploadFormState = {
  photographerName: string;
  description: string;
  season: string;
  activity: string;
};

type Props = {
  pendingUpload: PendingUpload;
  uploadForm: GalleryUploadFormState;
  setUploadForm: React.Dispatch<React.SetStateAction<GalleryUploadFormState>>;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
};

export function GalleryUploadPanel({
  pendingUpload,
  uploadForm,
  setUploadForm,
  submitting,
  onCancel,
  onSubmit,
}: Props) {
  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border bg-card p-4 shadow-sm md:p-6">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-violet-50 via-background to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/10" />
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
            onClick={onCancel}
            className="absolute right-0 top-0 shrink-0 text-muted-foreground hover:text-foreground sm:static"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 md:space-y-4">
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
              onClick={onCancel}
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
  );
}


