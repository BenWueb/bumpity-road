"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Post } from "@/types/blog";
import { useBlog } from "@/hooks/use-blog";
import { NotebookPen, Plus } from "lucide-react";
import Link from "next/link";
import { BlogPostCard } from "./BlogPostCard";
import { BlogPostForm } from "./BlogPostForm";
import { BlogEditModal } from "./BlogEditModal";

type Props = {
  initialPosts: Post[];
};

export function BlogList({ initialPosts }: Props) {
  const { data: session } = authClient.useSession();
  const { posts, createPost, updatePost, deletePost } = useBlog({ initialPosts });

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await deletePost(id);
  }

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background shadow-sm md:h-10 md:w-10">
            <NotebookPen className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Blog</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Stories and updates from the Cabin.
            </p>
          </div>
        </div>
        {session?.user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        ) : (
          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
          >
            Sign in to post
          </Link>
        )}
      </div>

      {/* Mobile action button */}
      {session?.user ? (
        <button
          onClick={() => setShowForm(!showForm)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-600 md:hidden"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      ) : (
        <Link
          href="/login"
          className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-emerald-600 hover:to-teal-600 md:hidden"
        >
          Sign in to post
        </Link>
      )}

      {/* New Post Form */}
      {showForm && (
        <BlogPostForm
          onSubmit={async (input) => {
            await createPost(input);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <NotebookPen className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <h2 className="text-lg font-medium">No posts yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {session?.user ? "Be the first to write a post!" : "Sign in to write a post."}
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {posts.map((post) => (
            <BlogPostCard
              key={post.id}
              post={post}
              isOwner={post.user?.id === session?.user?.id}
              onEdit={() => setEditingPost(post)}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <BlogEditModal
          post={editingPost}
          onSave={async (input) => {
            await updatePost(input);
          }}
          onClose={() => setEditingPost(null)}
        />
      )}
    </>
  );
}

