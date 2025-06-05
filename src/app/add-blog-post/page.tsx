"use client";
import { useSession } from "next-auth/react";
import { CreatePost } from "@/actions/CreatePost";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CldUploadButton } from "next-cloudinary";
import { useState } from "react";
import Image from "next/image";

export default function Blog() {
  const { data: session } = useSession();
  const [imageUrl, setImageUrl] = useState<string[]>([]);
  const [imageId, setImageId] = useState<string[]>([]);

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Please log in to create a post</h1>
      </div>
    );
  }

  return (
    <div>
      <form
        className="flex flex-col gap-2 m-auto w-full max-w-md"
        action={async (formData: FormData) => {
          if (imageId) {
            formData.append("imageIds", JSON.stringify(imageId));
          }
          await CreatePost(formData);
        }}
      >
        <label htmlFor="title" />
        <Input
          type="text"
          id="title"
          name="title"
          placeholder="Title"
          required
        />
        <label htmlFor="content" />
        <Textarea
          id="content"
          name="content"
          placeholder="Content"
          required
        ></Textarea>

        <CldUploadButton
          className="cursor-pointer"
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
              alt="Description of my image"
            />
          ))}
        <Button className="cursor-pointer mt-2  ">Submit</Button>
      </form>
    </div>
  );
}
