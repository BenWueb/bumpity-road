import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { getDocBySlug, getAllDocs } from "@/lib/help-server";
import { getCategoryMeta } from "@/content/help/_categories";
import {
  AccessPill,
  helpMdxComponents,
} from "@/components/help/help-mdx-components";

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

export default async function HelpDocPage({ params }: Props) {
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
        <div className="mb-4">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-linear-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-md dark:border-emerald-900/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Help
          </Link>
        </div>

        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/help" className="hover:text-foreground">
            Help
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

        <header className="mb-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">{doc.title}</h1>
            <AccessPill access={doc.access} />
          </div>
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

        <article className="prose-custom">
          <MDXRemote source={doc.source} components={helpMdxComponents} />
        </article>

        <div className="mt-12 flex items-stretch gap-4 border-t pt-6">
          {prevDoc ? (
            <Link
              href={`/help/${prevDoc.slug}`}
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
              href={`/help/${nextDoc.slug}`}
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

        <div className="mt-6 text-center">
          <Link
            href="/help"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to all help docs
          </Link>
        </div>
      </div>
    </div>
  );
}
