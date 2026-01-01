import { Suspense } from "react";
import { NotebookPen } from "lucide-react";
import { fetchPosts } from "@/lib/blog-server";
import { BlogList } from "@/components/blog";

function BlogSkeleton() {
  return (
    <>
      {/* Header skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background shadow-sm">
            <NotebookPen className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="h-7 w-24 animate-pulse rounded bg-accent" />
            <div className="mt-1 h-4 w-48 animate-pulse rounded bg-accent" />
          </div>
        </div>
        <div className="h-10 w-28 animate-pulse rounded-md bg-accent" />
      </div>

      {/* Posts skeleton */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="mb-4 animate-pulse break-inside-avoid rounded-xl border bg-card"
          >
            <div className="h-48 w-full rounded-t-xl bg-accent" />
            <div className="p-4">
              <div className="mb-2 h-3 w-32 rounded bg-accent" />
              <div className="mb-3 h-5 w-3/4 rounded bg-accent" />
              <div className="h-3 w-full rounded bg-accent" />
              <div className="mt-1 h-3 w-2/3 rounded bg-accent" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

async function BlogContent() {
  const posts = await fetchPosts();
  return <BlogList initialPosts={posts} />;
}

export default function BlogPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <Suspense fallback={<BlogSkeleton />}>
        <BlogContent />
      </Suspense>
    </div>
  );
}
