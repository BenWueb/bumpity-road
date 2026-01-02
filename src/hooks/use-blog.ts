"use client";

import { useState, useCallback } from "react";
import { Post, CreatePostInput, UpdatePostInput } from "@/types/blog";

type UseBlogOptions = {
  initialPosts: Post[];
};

export function useBlog({ initialPosts }: UseBlogOptions) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);

  const createPost = useCallback(async (input: CreatePostInput): Promise<Post | null> => {
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      const data = await res.json();
      setPosts((prev) => [data.post, ...prev]);

      // Emit badge event if new badges were earned
      if (data.newBadges && data.newBadges.length > 0) {
        window.dispatchEvent(
          new CustomEvent("badgesEarned", { detail: { badges: data.newBadges } })
        );
      }

      return data.post;
    } catch (error) {
      console.error("Failed to create post:", error);
      throw error;
    }
  }, []);

  const updatePost = useCallback(async (input: UpdatePostInput): Promise<Post | null> => {
    try {
      const res = await fetch("/api/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update post");
      }

      const data = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === input.id ? data.post : p)));
      return data.post;
    } catch (error) {
      console.error("Failed to update post:", error);
      throw error;
    }
  }, []);

  const deletePost = useCallback(async (id: string): Promise<boolean> => {
    const prev = posts;
    setPosts((p) => p.filter((post) => post.id !== id));

    try {
      const res = await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        setPosts(prev);
        return false;
      }
      return true;
    } catch {
      setPosts(prev);
      return false;
    }
  }, [posts]);

  const refreshPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/blog");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    posts,
    isLoading,
    createPost,
    updatePost,
    deletePost,
    refreshPosts,
  };
}

