"use client";

import { Post } from "@/types/blog";
import { formatDate, wasEdited } from "@/lib/blog-utils";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import { CldImage } from "next-cloudinary";
import Link from "next/link";
import { Calendar, MessageCircle, Pencil, Trash2 } from "lucide-react";

type Props = {
  post: Post;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function BlogPostCard({ post, isOwner, onEdit, onDelete }: Props) {
  const hasImage = post.images.length > 0;

  const metaItems = (
    <>
      <span>{post.user?.name ?? "Unknown"}</span>
      <span>•</span>
      <span className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        {formatDate(post.createdAt)}
      </span>
      {wasEdited(post) && (
        <>
          <span>•</span>
          <span className="italic">edited {formatDate(post.updatedAt)}</span>
        </>
      )}
      {post._count.comments > 0 && (
        <>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" />
            {post._count.comments}
          </span>
        </>
      )}
    </>
  );

  return (
    <article className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative w-full overflow-hidden">
        {hasImage ? (
          <CldImage
            src={post.images[0].publicId}
            width={post.images[0].width ?? 400}
            height={post.images[0].height ?? 300}
            alt={post.title}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="w-full object-cover"
          />
        ) : (
          <div className={`min-h-48 w-full ${CARD_GRADIENTS.slate}`} />
        )}

        {/* Gradient for text contrast — only at the bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/85 to-transparent" />

        {post.images.length > 1 && (
          <div className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
            +{post.images.length - 1} more
          </div>
        )}

        {isOwner && (
          <div className="absolute right-2 top-2 z-20 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit();
              }}
              className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              title="Edit post"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
              title="Delete post"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/80 drop-shadow">
            {metaItems}
          </div>
          <h2 className="text-base font-semibold leading-tight text-white drop-shadow-md transition-colors group-hover:text-white/90 md:text-lg">
            {post.title}
          </h2>
          {post.content && (
            <p className="mt-1.5 line-clamp-2 text-sm text-white/85 drop-shadow">
              {post.content}
            </p>
          )}
        </div>
      </div>

      {/* Whole-card link overlay (kept below the owner action buttons) */}
      <Link
        href={`/blog/${post.slug}`}
        aria-label={post.title}
        className="absolute inset-0 z-10"
      />
    </article>
  );
}
