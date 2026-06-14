import { prisma } from "@/utils/prisma";

export const postImageOrderBy = [
  { sortOrder: "asc" as const },
  { createdAt: "asc" as const },
];

export function getInitialHeaderKey(
  images: { id: string }[],
): string | null {
  return images[0] ? `existing:${images[0].id}` : null;
}

export function parseHeaderKey(key: string | null): {
  headerImageId?: string;
  headerImagePublicId?: string;
} {
  if (!key) return {};
  if (key.startsWith("existing:")) {
    return { headerImageId: key.slice("existing:".length) };
  }
  if (key.startsWith("new:")) {
    return { headerImagePublicId: key.slice("new:".length) };
  }
  return {};
}

export async function reorderPostImagesForHeader(
  postId: string,
  options: { headerImageId?: string; headerImagePublicId?: string },
) {
  const images = await prisma.postImage.findMany({
    where: { postId },
    orderBy: postImageOrderBy,
  });

  if (images.length === 0) return;

  let headerIndex = 0;
  if (options.headerImageId) {
    const idx = images.findIndex((img) => img.id === options.headerImageId);
    if (idx >= 0) headerIndex = idx;
  } else if (options.headerImagePublicId) {
    const idx = images.findIndex(
      (img) => img.publicId === options.headerImagePublicId,
    );
    if (idx >= 0) headerIndex = idx;
  }

  const reordered = [...images];
  if (headerIndex > 0) {
    const [header] = reordered.splice(headerIndex, 1);
    reordered.unshift(header);
  }

  await Promise.all(
    reordered.map((img, index) =>
      img.sortOrder === index
        ? Promise.resolve()
        : prisma.postImage.update({
            where: { id: img.id },
            data: { sortOrder: index },
          }),
    ),
  );
}
