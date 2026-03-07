export type PuzzleEntry = {
  id: string;
  completedBy: string;
  completedDate: string;
  notes: string | null;
  imageUrl: string;
  imagePublicId: string;
  color: string | null;
  userId: string;
  user: { id: string; name: string };
  createdAt: string;
};

export type PuzzleCreateInput = {
  completedBy: string;
  completedDate: string;
  notes: string;
  imageUrl: string;
  imagePublicId: string;
  color: string;
};

export type PuzzleUpdateInput = {
  id: string;
  completedBy: string;
  completedDate: string;
  notes: string;
  color: string;
};
