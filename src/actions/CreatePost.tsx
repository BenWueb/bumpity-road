"use server";

import { prisma } from "@/utils/prisma";
import { auth } from "@/utils/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function CreatePost(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  });

  if (!session?.user?.email) {
    throw new Error("Unauthorized: User not authenticated");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const userEmail = session.user.email;
  const imageIds = formData.get("imageIds")
    ? JSON.parse(formData.get("imageIds") as string)
    : [];
  try {
    await prisma.post.create({
      data: {
        title,
        content,
        slug,
        userEmail,
        images: {
          createMany: {
            data: imageIds.map((imageId: string) => ({ imageId })),
          },
        },
      },
    });
  } catch (error) {
    console.log("Error creating post:", error);
    throw new Error("Failed to create post");
  }
  redirect(`/blog/${slug}`);
}
