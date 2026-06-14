"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, Pencil, User, X } from "lucide-react";
import { PostDetail } from "@/types/blog";
import { wasEdited, formatLongDate } from "@/lib/blog-utils";
import {
  getInitialHeaderKey,
  parseHeaderKey,
} from "@/lib/blog-images";
import { BlogEditImagesSection } from "@/components/blog/BlogEditImagesSection";
import BlogPostImages from "./BlogPostImages";

type Props = {
  post: PostDetail;
  formattedDate: string;
};

export default function BlogPostContent({ post: initialPost, formattedDate }: Props) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail>(initialPost);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editImages, setEditImages] = useState(post.images);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<
    { publicId: string; url: string; width?: number; height?: number }[]
  >([]);
  const [headerKey, setHeaderKey] = useState<string | null>(
    getInitialHeaderKey(post.images),
  );
  const [saving, setSaving] = useState(false);

  const isOwner = session?.user?.id === post.user?.id;

  function openEditModal() {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImages(post.images);
    setImagesToRemove([]);
    setNewImages([]);
    setHeaderKey(getInitialHeaderKey(post.images));
    setIsEditing(true);
  }

  function pickFallbackHeader(
    nextExisting: typeof editImages,
    nextNew: typeof newImages,
  ) {
    if (nextExisting[0]) return `existing:${nextExisting[0].id}`;
    if (nextNew[0]) return `new:${nextNew[0].publicId}`;
    return null;
  }

  function closeEditModal() {
    setIsEditing(false);
  }

  function handleRemoveExistingImage(imageId: string) {
    setImagesToRemove((prev) => [...prev, imageId]);
    const nextExisting = editImages.filter((img) => img.id !== imageId);
    setEditImages(nextExisting);
    if (headerKey === `existing:${imageId}`) {
      setHeaderKey(pickFallbackHeader(nextExisting, newImages));
    }
  }

  function handleRemoveNewImage(publicId: string) {
    const nextNew = newImages.filter((img) => img.publicId !== publicId);
    setNewImages(nextNew);
    if (headerKey === `new:${publicId}`) {
      setHeaderKey(pickFallbackHeader(editImages, nextNew));
    }
  }

  const handleUploadSuccess = (result: unknown) => {
    const info = (result as { info?: { public_id?: string; secure_url?: string; width?: number; height?: number } })?.info;
    if (info?.public_id && info?.secure_url) {
      const uploaded = {
        publicId: info.public_id!,
        url: info.secure_url!,
        width: info.width,
        height: info.height,
      };
      setNewImages((prev) => [...prev, uploaded]);
      if (!headerKey && editImages.length === 0 && newImages.length === 0) {
        setHeaderKey(`new:${uploaded.publicId}`);
      }
    }
  };

  const remainingImages = editImages.length + newImages.length;

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim() || saving) return;
    if (remainingImages === 0) return;

    setSaving(true);

    try {
      const header = parseHeaderKey(headerKey);
      const res = await fetch("/api/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          title: editTitle.trim(),
          content: editContent.trim(),
          removeImageIds: imagesToRemove.length > 0 ? imagesToRemove : undefined,
          addImages: newImages.length > 0 ? newImages : undefined,
          ...header,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
        closeEditModal();
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  const isEdited = wasEdited(post);

  const editButton = isOwner ? (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openEditModal();
      }}
      className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
    >
      <Pencil className="h-4 w-4" />
      Edit
    </button>
  ) : null;

  return (
    <>
      {/* Header Images with edit button */}
      {post.images.length > 0 && (
        <BlogPostImages
          images={post.images}
          title={post.title}
          author={post.user?.name ?? "Unknown"}
          date={formattedDate}
          headerAction={editButton}
        />
      )}

      <div className="relative p-4 sm:p-6 md:p-8">
        {/* Meta & Title - only show if no images */}
        {post.images.length === 0 && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground md:mb-4 md:gap-3 md:text-sm">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {post.user?.name ?? "Unknown"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                {formattedDate}
              </span>
              {isEdited && (
                <>
                  <span>•</span>
                  <span className="italic">edited {formatLongDate(post.updatedAt)}</span>
                </>
              )}
            </div>
            <h1 className="mb-4 text-xl font-bold md:mb-6 md:text-3xl">{post.title}</h1>
          </>
        )}

        {/* Edit button for owner - only when no header image */}
        {isOwner && post.images.length === 0 && (
          <button
            onClick={openEditModal}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-accent md:right-4 md:top-4 md:gap-2 md:px-3 md:py-1.5 md:text-sm"
          >
            <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
            Edit
          </button>
        )}

        {/* Content */}
        <div className="space-y-3 text-sm leading-relaxed text-foreground md:space-y-4 md:text-base md:leading-relaxed">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Edited indicator for posts with images */}
        {post.images.length > 0 && isEdited && (
          <p className="mt-4 text-xs italic text-muted-foreground md:mt-6 md:text-sm">
            Edited {formatLongDate(post.updatedAt)}
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 md:p-4"
          onClick={closeEditModal}
        >
          <div
            className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-4 shadow-xl md:max-h-[90vh] md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between md:mb-4">
              <h2 className="text-base font-semibold md:text-lg">Edit Post</h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="editTitle" className="mb-1 block text-sm font-medium">
                  Title
                </label>
                <input
                  id="editTitle"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  maxLength={200}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="editContent" className="mb-1 block text-sm font-medium">
                  Content
                </label>
                <div className="relative">
                  <textarea
                    id="editContent"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                    rows={10}
                    maxLength={5000}
                    className="w-full resize-none rounded-md border bg-background px-3 pb-6 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {editContent.length}/5000
                  </span>
                </div>
              </div>

              {/* Images Section */}
              <BlogEditImagesSection
                existingImages={editImages}
                newImages={newImages}
                headerKey={headerKey}
                imagesToRemoveCount={imagesToRemove.length}
                remainingImages={remainingImages}
                onHeaderChange={setHeaderKey}
                onRemoveExisting={handleRemoveExistingImage}
                onRemoveNew={handleRemoveNewImage}
                onUploadSuccess={handleUploadSuccess}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !editTitle.trim() ||
                    !editContent.trim() ||
                    remainingImages === 0
                  }
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

