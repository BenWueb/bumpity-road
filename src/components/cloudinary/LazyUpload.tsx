"use client";

import dynamic from "next/dynamic";
import type {
  CldUploadWidgetProps,
  CldUploadButtonProps,
} from "next-cloudinary";

// Defer the Cloudinary upload chunk until after hydration. The widget JS is
// only needed once the user actually interacts with the upload control, so
// shipping it in the initial bundle slows down every visit to /adventures
// and /gallery for no benefit.
export const LazyCldUploadWidget = dynamic<CldUploadWidgetProps>(
  () => import("next-cloudinary").then((m) => m.CldUploadWidget),
  { ssr: false }
);

export const LazyCldUploadButton = dynamic<CldUploadButtonProps>(
  () => import("next-cloudinary").then((m) => m.CldUploadButton),
  { ssr: false }
);
