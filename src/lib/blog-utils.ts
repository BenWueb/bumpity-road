import { Post } from "@/types/blog";

export function formatDate(isoDate: string | Date) {
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatLongDate(isoDate: string | Date) {
  const date = typeof isoDate === "string" ? new Date(isoDate) : isoDate;
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function wasEdited(post: Pick<Post, "createdAt" | "updatedAt">): boolean {
  const created = new Date(post.createdAt).getTime();
  const updated = new Date(post.updatedAt).getTime();
  return updated - created > 60000; // 1 minute threshold
}

