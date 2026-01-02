"use client";

import { useState } from "react";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Post, PostImage, UpdatePostInput, UploadedImage } from "@/types/blog";
import { Modal } from "@/components/ui/Modal";

type Props = {
  post: Post;
  onSave: (input: UpdatePostInput) => Promise<void>;
  onClose: () => void;
};

export function BlogEditModal({ post, onSave, onClose }: Props) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [existingImages, setExistingImages] = useState<PostImage[]>(post.images);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;

    setSaving(true);
    try {
      await onSave({
        id: post.id,
        title: title.trim(),
        content: content.trim(),
        removeImageIds: imagesToRemove.length > 0 ? imagesToRemove : undefined,
        addImages: newImages.length > 0 ? newImages : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }

  function handleRemoveExistingImage(imageId: string) {
    setImagesToRemove((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
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

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit Post"
      closeOnOverlayClick={!saving}
      closeOnEscape={!saving}
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      panelClassName="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editTitle" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="editTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={8}
                maxLength={5000}
                className="w-full resize-none rounded-md border bg-background px-3 pb-6 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
                {content.length}/5000
              </span>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="mb-2 block text-sm font-medium">Images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((img) => (
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

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
    </Modal>
  );
}

