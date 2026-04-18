export type PuzzleStatus = "in_progress" | "completed";

export type PuzzleContribution = {
  id: string;
  userId: string;
  userName: string;
  note: string | null;
  createdAt: string;
};

export type PuzzleEntry = {
  id: string;
  status: PuzzleStatus;
  completedAt: string | null;
  // Legacy free-text fields, populated only on entries created before the
  // contributions model existed. Display logic falls back to these when no
  // contributions are present.
  completedBy: string | null;
  completedDate: string | null;
  notes: string | null;
  imageUrl: string;
  imagePublicId: string;
  color: string | null;
  userId: string;
  user: { id: string; name: string };
  contributions: PuzzleContribution[];
  createdAt: string;
};

export type PuzzleCreateInput = {
  status: PuzzleStatus;
  notes: string;
  imageUrl: string;
  imagePublicId: string;
  color: string;
};

export type PuzzleUpdateInput = {
  id: string;
  notes?: string;
  color?: string;
};

export type PuzzleContributeInput = {
  id: string;
  markComplete: boolean;
};
