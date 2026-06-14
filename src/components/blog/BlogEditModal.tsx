"use client";

import { useState } from "react";
import { Post, UpdatePostInput, UploadedImage } from "@/types/blog";
import { Modal } from "@/components/ui/Modal";
import {
  getInitialHeaderKey,
  parseHeaderKey,
} from "@/lib/blog-images";
import { BlogEditImagesSection } from "./BlogEditImagesSection";

type Props = {
  post: Post;
  onSave: (input: UpdatePostInput) => Promise<void>;
  onClose: () => void;
};

export function BlogEditModal({ post, onSave, onClose }: Props) {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [existingImages, setExistingImages] = useState(post.images);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<UploadedImage[]>([]);
  const [headerKey, setHeaderKey] = useState<string | null>(
    getInitialHeaderKey(post.images),
  );
  const [saving, setSaving] = useState(false);

  const remainingImages = existingImages.length + newImages.length;

  function pickFallbackHeader(
    nextExisting: typeof existingImages,
    nextNew: typeof newImages,
  ) {
    if (nextExisting[0]) return `existing:${nextExisting[0].id}`;
    if (nextNew[0]) return `new:${nextNew[0].publicId}`;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    if (remainingImages === 0) return;

    setSaving(true);
    try {
      const header = parseHeaderKey(headerKey);
      await onSave({
        id: post.id,
        title: title.trim(),
        content: content.trim(),
        removeImageIds: imagesToRemove.length > 0 ? imagesToRemove : undefined,
        addImages: newImages.length > 0 ? newImages : undefined,
        ...header,
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
    const nextExisting = existingImages.filter((img) => img.id !== imageId);
    setExistingImages(nextExisting);
    if (headerKey === `existing:${imageId}`) {
      setHeaderKey(pickFallbackHeader(nextExisting, newImages));
    }
  }

  function handleRemoveNewImage(publicId: string) {
    const nextNew = newImages.filter((img) => img.publicId !== publicId);
    setNewImages(nextNew);
    if (headerKey === `new:${publicId}`) {
      setHeaderKey(pickFallbackHeader(existingImages, nextNew));
    }
  }

  const handleUploadSuccess = (result: unknown) => {
    const info = (result as {
      info?: {
        public_id?: string;
        secure_url?: string;
        width?: number;
        height?: number;
      };
    })?.info;
    if (info?.public_id && info?.secure_url) {
      const uploaded = {
        publicId: info.public_id,
        url: info.secure_url,
        width: info.width,
        height: info.height,
      };
      setNewImages((prev) => [...prev, uploaded]);
      if (!headerKey && existingImages.length === 0 && newImages.length === 0) {
        setHeaderKey(`new:${uploaded.publicId}`);
      }
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

        <BlogEditImagesSection
          existingImages={existingImages}
          newImages={newImages}
          headerKey={headerKey}
          imagesToRemoveCount={imagesToRemove.length}
          remainingImages={remainingImages}
          onHeaderChange={setHeaderKey}
          onRemoveExisting={handleRemoveExistingImage}
          onRemoveNew={handleRemoveNewImage}
          onUploadSuccess={handleUploadSuccess}
        />

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
            disabled={
              saving || !title.trim() || !content.trim() || remainingImages === 0
            }
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
