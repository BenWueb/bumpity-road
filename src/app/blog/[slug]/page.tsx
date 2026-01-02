import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { fetchPostBySlug, fetchOtherPosts } from "@/lib/blog-server";
import { formatShortDate } from "@/lib/blog-utils";
import { CARD_GRADIENTS } from "@/lib/ui-gradients";
import BlogPostContent from "./BlogPostContent";

type Props = {
  params: Promise<{ slug: string }>;
};

function PostSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 min-[1440px]:flex-row min-[1440px]:gap-8">
      <article className="min-w-0 flex-1 animate-pulse overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="h-96 w-full bg-accent" />
        <div className="p-6 sm:p-8">
          <div className="mb-4 h-4 w-48 rounded bg-accent" />
          <div className="mb-6 h-8 w-3/4 rounded bg-accent" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-accent" />
            <div className="h-4 w-full rounded bg-accent" />
            <div className="h-4 w-2/3 rounded bg-accent" />
          </div>
        </div>
      </article>
      <aside className="w-full shrink-0 min-[1440px]:w-72">
        <div className="animate-pulse rounded-xl border bg-card p-5">
          <div className="mb-4 h-6 w-32 rounded bg-accent" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-16 w-16 shrink-0 rounded-lg bg-accent" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full rounded bg-accent" />
                  <div className="h-3 w-24 rounded bg-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

async function PostContent({ slug }: { slug: string }) {
  const [post, otherPosts] = await Promise.all([
    fetchPostBySlug(slug),
    fetchOtherPosts(slug),
  ]);

  if (!post) {
    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(post.createdAt));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 min-[1440px]:flex-row min-[1440px]:gap-8">
      {/* Main Article */}
      <article className="relative min-w-0 flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.slate}`} />

        <BlogPostContent post={post} formattedDate={formattedDate} />
      </article>

      {/* Sidebar - Other Posts */}
      <aside className="w-full shrink-0 min-[1440px]:sticky min-[1440px]:top-6 min-[1440px]:w-72 min-[1440px]:self-start">
        <div className="relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm">
          <div className={`pointer-events-none absolute inset-0 ${CARD_GRADIENTS.violet}`} />
          <div className="relative">
            <h2 className="mb-4 text-lg font-semibold">More Posts</h2>

            {otherPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No other posts yet.</p>
            ) : (
              <div className="space-y-4">
                {otherPosts.map((p) => (
                  <Link key={p.id} href={`/blog/${p.slug}`} className="group flex gap-3">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-accent">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url}
                          alt={p.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground/50">
                          📝
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-medium leading-tight transition-colors group-hover:text-primary">
                        {p.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{p.user?.name ?? "Unknown"}</span>
                        <span>•</span>
                        <span>{formatShortDate(p.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/blog"
              className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
            >
              View all posts →
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="p-4 md:p-6">
      {/* Back Link */}
      <div className="mx-auto max-w-6xl">
        <Link
          href="/blog"
          className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground md:mb-6 md:text-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
          Back to Blog
        </Link>
      </div>

      <Suspense fallback={<PostSkeleton />}>
        <PostContent slug={slug} />
      </Suspense>
    </div>
  );
}
