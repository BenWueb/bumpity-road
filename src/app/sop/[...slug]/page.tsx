import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { getDocBySlug, getAllDocs } from "@/lib/sop-server";
import { getCategoryMeta } from "@/content/sop/_categories";
import { mdxComponents } from "@/components/sop/mdx-components";

type Props = {
  params: Promise<{ slug: string[] }>;
};

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({
    slug: doc.slug.split("/"),
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = getDocBySlug(slug.join("/"));
  if (!doc) return { title: "Not Found" };

  return {
    title: doc.title,
    description: doc.description,
  };
}

export default async function SopDocPage({ params }: Props) {
  const { slug } = await params;
  const slugStr = slug.join("/");
  const doc = getDocBySlug(slugStr);

  if (!doc) notFound();

  const catMeta = getCategoryMeta(doc.category);

  const allDocs = getAllDocs();
  const categoryDocs = allDocs.filter((d) => d.category === doc.category);
  const currentIdx = categoryDocs.findIndex((d) => d.slug === doc.slug);
  const prevDoc = currentIdx > 0 ? categoryDocs[currentIdx - 1] : null;
  const nextDoc =
    currentIdx < categoryDocs.length - 1 ? categoryDocs[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/sop" className="hover:text-foreground">
            SOP
          </Link>
          <span>/</span>
          {catMeta && (
            <>
              <span>{catMeta.label}</span>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{doc.title}</span>
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">{doc.title}</h1>
          {doc.description && (
            <p className="mb-3 text-sm text-muted-foreground md:text-base">
              {doc.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {doc.updatedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Updated {doc.updatedAt}
              </span>
            )}
            {doc.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {doc.tags.join(", ")}
              </span>
            )}
          </div>
        </header>

        {/* MDX Content */}
        <article className="prose-custom">
          <MDXRemote source={doc.source} components={mdxComponents} />
        </article>

        {/* Prev/Next navigation */}
        <div className="mt-12 flex items-stretch gap-4 border-t pt-6">
          {prevDoc ? (
            <Link
              href={`/sop/${prevDoc.slug}`}
              className="flex flex-1 flex-col items-start rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                <ArrowLeft className="h-3 w-3" />
                Previous
              </span>
              <span className="text-sm font-medium">{prevDoc.title}</span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextDoc ? (
            <Link
              href={`/sop/${nextDoc.slug}`}
              className="flex flex-1 flex-col items-end rounded-lg border p-4 text-right transition-colors hover:bg-accent"
            >
              <span className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                Next
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </span>
              <span className="text-sm font-medium">{nextDoc.title}</span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/sop"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to all documents
          </Link>
        </div>
      </div>
    </div>
  );
}
