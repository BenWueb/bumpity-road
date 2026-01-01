"use client";

import { authClient } from "@/lib/auth-client";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Calendar, ImagePlus, Pencil, Trash2, User, X } from "lucide-react";
import { PostDetail, PostImage, UploadedImage } from "@/types/blog";
import { wasEdited, formatLongDate } from "@/lib/blog-utils";
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
  const [editImages, setEditImages] = useState<PostImage[]>(post.images);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [saving, setSaving] = useState(false);

  const isOwner = session?.user?.id === post.user?.id;

  function openEditModal() {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImages(post.images);
    setImagesToRemove([]);
    setNewImages([]);
    setIsEditing(true);
  }

  function closeEditModal() {
    setIsEditing(false);
  }

  function handleRemoveExistingImage(imageId: string) {
    setImagesToRemove((prev) => [...prev, imageId]);
    setEditImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  function handleRemoveNewImage(publicId: string) {
    setNewImages((prev) => prev.filter((img) => img.publicId !== publicId));
  }

  const handleUploadSuccess = (result: unknown) => {
    const info = (result as { info?: { public_id?: string; secure_url?: string; width?: number; height?: number } })?.info;
    if (info?.public_id && info?.secure_url) {
      setNewImages((prev) => [
        ...prev,
        {
          publicId: info.public_id!,
          url: info.secure_url!,
          width: info.width,
          height: info.height,
        },
      ]);
    }
  };

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || !editContent.trim() || saving) return;

    setSaving(true);

    try {
      const res = await fetch("/api/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          title: editTitle.trim(),
          content: editContent.trim(),
          removeImageIds: imagesToRemove.length > 0 ? imagesToRemove : undefined,
          addImages: newImages.length > 0 ? newImages : undefined,
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

      <div className="relative p-6 sm:p-8">
        {/* Meta & Title - only show if no images */}
        {post.images.length === 0 && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.user?.name ?? "Unknown"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              {isEdited && (
                <>
                  <span>•</span>
                  <span className="italic">edited {formatLongDate(post.updatedAt)}</span>
                </>
              )}
            </div>
            <h1 className="mb-6 text-3xl font-bold">{post.title}</h1>
          </>
        )}

        {/* Edit button for owner - only when no header image */}
        {isOwner && post.images.length === 0 && (
          <button
            onClick={openEditModal}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        )}

        {/* Content */}
        <div className="prose prose-slate max-w-none dark:prose-invert">
          {post.content.split("\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Edited indicator for posts with images */}
        {post.images.length > 0 && isEdited && (
          <p className="mt-6 text-sm italic text-muted-foreground">
            Edited {formatLongDate(post.updatedAt)}
          </p>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeEditModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Post</h2>
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
              <div>
                <label className="mb-2 block text-sm font-medium">Images</label>
                <div className="flex flex-wrap gap-3">
                  {/* Existing images */}
                  {editImages.map((img) => (
                    <div key={img.id} className="group relative">
                      <CldImage
                        src={img.publicId}
                        width={100}
                        height={100}
                        alt="Post image"
                        crop="fill"
                        className="h-20 w-20 rounded-lg border object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(img.id)}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                        title="Remove image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* New images to add */}
                  {newImages.map((img) => (
                    <div key={img.publicId} className="group relative">
                      <CldImage
                        src={img.publicId}
                        width={100}
                        height={100}
                        alt="New image"
                        crop="fill"
                        className="h-20 w-20 rounded-lg border object-cover ring-2 ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(img.publicId)}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {/* Upload button */}
                  <CldUploadButton
                    uploadPreset="bumpity-road"
                    onSuccess={handleUploadSuccess}
                    className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <ImagePlus className="h-6 w-6" />
                  </CldUploadButton>
                </div>
                {imagesToRemove.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {imagesToRemove.length} image(s) will be removed on save
                  </p>
                )}
              </div>

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
                  disabled={saving || !editTitle.trim() || !editContent.trim()}
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

