"use client";

import { useState } from "react";
import { CldImage, CldUploadButton } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";
import { CreatePostInput, UploadedImage } from "@/types/blog";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  onSubmit: (input: CreatePostInput) => Promise<void>;
  onCancel: () => void;
};

export function BlogPostForm({ onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
      });
      // Reset form on success
      setTitle("");
      setContent("");
      setImages([]);
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const handleUploadSuccess = (result: unknown) => {
    const info = (result as { info?: { public_id?: string; secure_url?: string; width?: number; height?: number } })?.info;
    if (info?.public_id && info?.secure_url) {
      setImages((prev) => [
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

  const removeImage = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.publicId !== publicId));
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border bg-card p-6 shadow-sm">
      <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.violet}`} />
      <div className="relative">
        <h2 className="mb-4 text-lg font-semibold">Create a New Post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title..."
              required
              maxLength={200}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-1 block text-sm font-medium">
              Content
            </label>
            <div className="relative">
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post..."
                required
                rows={6}
                maxLength={5000}
                className="w-full resize-none rounded-md border bg-background px-3 pb-6 pt-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-muted-foreground">
                {content.length}/5000
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium">Images (optional)</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img) => (
                <div key={img.publicId} className="group relative">
                  <CldImage
                    src={img.publicId}
                    width={100}
                    height={100}
                    alt="Upload preview"
                    crop="fill"
                    className="h-20 w-20 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.publicId)}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
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
          </div>

          {error && <div className="text-sm text-destructive">{error}</div>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setContent("");
                setImages([]);
                setError(null);
                onCancel();
              }}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

