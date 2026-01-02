import { Suspense } from "react";
import { fetchPosts } from "@/lib/blog-server";
import { BlogList } from "@/components/blog";

function BlogSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-muted-foreground">Loading posts...</div>
    </div>
  );
}

async function BlogContent() {
  const posts = await fetchPosts();
  return <BlogList initialPosts={posts} />;
}

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <BlogContent />
    </Suspense>
  );
}
