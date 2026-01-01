export type PostImage = {
  id: string;
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
};

export type PostDetail = {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; image: string | null } | null;
  images: PostImage[];
};

export type Post = {
  id: string;
  title: string;
  content: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; image: string | null } | null;
  images: PostImage[];
  _count: { comments: number };
};

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
  user: { name: string } | null;
  images: { url: string }[];
};

export type UploadedImage = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
};

export type CreatePostInput = {
  title: string;
  content: string;
  images?: UploadedImage[];
};

export type UpdatePostInput = {
  id: string;
  title: string;
  content: string;
  addImages?: UploadedImage[];
  removeImageIds?: string[];
};

