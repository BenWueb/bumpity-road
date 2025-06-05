"use server";

import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function CreatePost(formData: FormData) {
  const session = await auth();

  if (!session || !session.user || !session.user.email) {
    throw new Error("Unauthorized: User not authenticated");
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  const userEmail = session.user.email;

  try {
    await prisma.post.create({
      data: {
        title,
        content,
        slug,
        userEmail,
      },
    });
  } catch (error) {
    console.log("Error creating post:", error);
    throw new Error("Failed to create post");
  }
  redirect(`/blog/${slug}`);
}
