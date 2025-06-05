"use server";

import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GetPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        slug: slug,
      },
      include: {
        user: true,
        comments: true,
        images: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("Error fetching post:", error);
    throw new Error("Failed to fetch post");
  }
}
