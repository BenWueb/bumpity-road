import type { Todo } from "./todo";

export type AccountUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isBugAdmin: boolean;
  badges?: string[] | null;
  createdAt: string;
};

export type AccountPost = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  thumbnail: string | null;
  commentCount: number;
};

export type AccountAdventure = {
  id: string;
  title: string;
  address: string;
  category: string;
  seasons: string[];
  season: string | null;
  headerImage: string;
  createdAt: string;
};

export type AccountGalleryImage = {
  id: string;
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
  caption: string | null;
  createdAt: string;
};

export type AccountFeedback = {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
};

export type AccountTodo = Todo;


