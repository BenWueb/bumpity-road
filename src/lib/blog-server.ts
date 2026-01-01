import { prisma } from "@/utils/prisma";
import { Post, PostSummary } from "@/types/blog";

export async function fetchPosts(): Promise<Post[]> {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, image: true } },
      images: {
        select: { id: true, publicId: true, url: true, width: true, height: true },
      },
      _count: { select: { comments: true } },
    },
  });

  return posts.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function fetchPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      content: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, image: true } },
      images: {
        select: { id: true, publicId: true, url: true, width: true, height: true },
      },
    },
  });

  if (!post) return null;

  return {
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function fetchOtherPosts(excludeSlug: string): Promise<PostSummary[]> {
  return prisma.post.findMany({
    where: { slug: { not: excludeSlug } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      user: { select: { name: true } },
      images: { take: 1, select: { url: true } },
    },
  });
}

