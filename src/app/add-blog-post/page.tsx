"use client";
import { authClient } from "@/lib/auth-client";
import { CreatePost } from "@/actions/CreatePost";

import { CldUploadButton } from "next-cloudinary";
import { useState } from "react";
import Image from "next/image";

export default function Blog() {
  const { data: session, isPending } = authClient.useSession();
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [imageId, setImageId] = useState<string[]>([]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Please log in to create a post</h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <form
        className="flex flex-col gap-4 m-auto w-full max-w-md"
        action={async (formData: FormData) => {
          if (imageId) {
            formData.append("imageIds", JSON.stringify(imageId));
          }
          await CreatePost(formData);
        }}
      >
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Enter title..."
            required
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            placeholder="Write your content..."
            required
            rows={6}
            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <CldUploadButton
          className="cursor-pointer rounded-md border bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          uploadPreset="bumpity-road"
          onSuccess={(result) => {
            console.log("Upload successful:", result);

            const imageUrl = (
              result.info as { secure_url: string; public_id: string }
            ).secure_url;
            setImageUrl((prev) => [...prev, imageUrl]);
            setImageId((prev) => [
              ...prev,
              (result.info as { secure_url: string; public_id: string })
                .public_id,
            ]);
          }}
        >
          Add Image
        </CldUploadButton>

        {imageUrl &&
          imageUrl.map((image, index) => (
            <Image
              key={index}
              width={800}
              height={600}
              src={image}
              alt="Uploaded image"
              className="rounded-md"
            />
          ))}

        <button
          type="submit"
          className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
