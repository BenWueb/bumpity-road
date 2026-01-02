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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg md:h-12 md:w-12">
                <NotebookPen className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold md:text-2xl">Blog</h1>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Stories and updates from the Cabin
                </p>
              </div>
            </div>

            {session?.user ? (
              <button
                onClick={() => setShowForm(!showForm)}
                className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
              >
                <Plus className="h-4 w-4" />
                New Post
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 md:flex"
              >
                Sign in to post
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile action button */}
      <div className="border-b bg-card/30 px-4 py-3 md:hidden">
        {session?.user ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        ) : (
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm"
          >
            Sign in to post
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-6xl p-4 md:p-6">

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
      </div>
    </div>
  );
}

