"use client";

import { Post } from "@/types/blog";
import { formatDate, wasEdited } from "@/lib/blog-utils";
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
  return (
    <article className="group relative mb-4 break-inside-avoid overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-background to-gray-50 dark:from-slate-950/20 dark:via-background dark:to-gray-950/10" />

      {/* Featured Image */}
      {post.images.length > 0 && (
        <div className="relative w-full overflow-hidden">
          <CldImage
            src={post.images[0].publicId}
            width={post.images[0].width ?? 400}
            height={post.images[0].height ?? 300}
            alt={post.title}
            className="w-full object-cover"
          />
          {post.images.length > 1 && (
            <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
              +{post.images.length - 1} more
            </div>
          )}
        </div>
      )}

      <div className="relative p-4">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
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
        </div>

        <Link href={`/blog/${post.slug}`}>
          <h2 className="mb-2 font-semibold leading-tight transition-colors hover:text-primary">
            {post.title}
          </h2>
        </Link>

        <p className="line-clamp-4 text-sm text-muted-foreground">{post.content}</p>

        <div className="mt-3 flex items-center justify-between">
          <Link
            href={`/blog/${post.slug}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            Read more →
          </Link>

          {isOwner && (
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={onEdit}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Edit post"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={onDelete}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                title="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

