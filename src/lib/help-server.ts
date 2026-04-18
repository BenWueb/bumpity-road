import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type HelpAccess = "public" | "loggedin";

export type HelpDocMeta = {
  slug: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  order: number;
  updatedAt: string;
  icon?: string;
  access?: HelpAccess;
  plainText: string;
};

export type HelpDoc = HelpDocMeta & {
  source: string;
};

const CONTENT_DIR = path.join(process.cwd(), "src/content/help");

function stripMdx(content: string): string {
  return content
    .replace(/<[^>]+>/g, "")
    .replace(/import\s+.*?from\s+['"].*?['"]/g, "")
    .replace(/export\s+.*?(?=\n)/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+/g, "")
    .replace(/[*_~`]+/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getMdxFiles(dir: string): string[] {
  const entries: string[] = [];
  if (!fs.existsSync(dir)) return entries;

  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (item.isDirectory()) {
      entries.push(...getMdxFiles(path.join(dir, item.name)));
    } else if (item.name.endsWith(".mdx") && !item.name.startsWith("_")) {
      entries.push(path.join(dir, item.name));
    }
  }
  return entries;
}

export function getAllDocs(): HelpDocMeta[] {
  const files = getMdxFiles(CONTENT_DIR);

  return files
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);
      const relative = path.relative(CONTENT_DIR, filePath);
      const slug = relative.replace(/\\/g, "/").replace(/\.mdx$/, "");

      return {
        slug,
        title: data.title ?? slug,
        category: data.category ?? slug.split("/")[0],
        description: data.description ?? "",
        tags: data.tags ?? [],
        order: data.order ?? 99,
        updatedAt: data.updatedAt ?? "",
        icon: data.icon,
        access: data.access as HelpAccess | undefined,
        plainText: stripMdx(content),
      } satisfies HelpDocMeta;
    })
    .sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.order - b.order;
    });
}

export function getDocBySlug(slug: string): HelpDoc | null {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    category: data.category ?? slug.split("/")[0],
    description: data.description ?? "",
    tags: data.tags ?? [],
    order: data.order ?? 99,
    updatedAt: data.updatedAt ?? "",
    icon: data.icon,
    access: data.access as HelpAccess | undefined,
    plainText: stripMdx(content),
    source: content,
  };
}

export function getDocsByCategory(category: string): HelpDocMeta[] {
  return getAllDocs().filter((doc) => doc.category === category);
}
