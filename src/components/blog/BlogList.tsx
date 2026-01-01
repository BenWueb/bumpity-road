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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background shadow-sm">
            <NotebookPen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Blog</h1>
            <p className="text-sm text-muted-foreground">
              Stories and updates from the Cabin.
            </p>
          </div>
        </div>
        {session?.user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-md border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Sign in to post
          </Link>
        )}
      </div>

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

