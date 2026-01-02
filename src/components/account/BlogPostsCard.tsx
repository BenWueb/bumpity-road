import Link from "next/link";
import { MessageCircle, NotebookPen } from "lucide-react";
import { AccountCard } from "./AccountCard";
import type { AccountPost } from "@/types/account";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";

type Props = {
  posts: AccountPost[];
};

export function BlogPostsCard({ posts }: Props) {
  return (
    <AccountCard
      gradientClassName={CARD_GRADIENTS.violet}
    >
      <div className="relative">
        <div className="flex items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-muted-foreground md:h-5 md:w-5" />
            <h3 className="text-sm font-semibold md:text-lg">
              Your Blog Posts
            </h3>
          </div>
          <span className="text-xs text-muted-foreground md:text-sm">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="divide-y">
          {posts.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground md:px-6 md:py-8">
              <NotebookPen className="mx-auto mb-2 h-6 w-6 opacity-50 md:h-8 md:w-8" />
              <p>No blog posts yet.</p>
              <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                Start by writing a quick update or a full story.
              </p>
              <Link
                href="/blog"
                className="mt-3 inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                Write your first post
              </Link>
            </div>
          ) : (
            posts.slice(0, 5).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-accent/50 md:gap-4 md:px-6 md:py-3"
              >
                {/* Thumbnail */}
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-accent md:h-12 md:w-12">
                  {post.thumbnail ? (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/50 md:text-lg">
                      📝
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium md:text-sm">
                    {post.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground md:gap-3 md:text-xs">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.commentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-2.5 w-2.5 md:h-3 md:w-3" />
                        {post.commentCount}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
          {posts.length > 0 && (
            <div className="flex justify-center px-4 py-3 md:px-6 md:py-4">
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-lg border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                View all {posts.length} posts
              </Link>
            </div>
          )}
        </div>
      </div>
    </AccountCard>
  );
}


