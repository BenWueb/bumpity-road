export type GalleryImage = {
  id: string;
  publicId: string;
  url: string;
  width: number | null;
  height: number | null;
  caption: string | null;
  description: string | null;
  photographerName: string | null;
  season: string | null;
  activity: string | null;
  createdAt: string;
  user: { id: string; name: string };
};

export type PendingUpload = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
};


