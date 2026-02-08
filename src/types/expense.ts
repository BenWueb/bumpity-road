export type ExpenseCategory = "kitchen" | "bathroom" | "exterior" | "interior" | "utilities" | "landscaping" | "other";

export interface ExpenseComment {
  id: string;
  content: string;
  expenseId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseVote {
  id: string;
  value: number; // 1 = upvote, -1 = downvote
  expenseId: string;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  date: string | null; // ISO string, null for planned expenses without a date
  category: ExpenseCategory;
  isPlanned: boolean;
  userId: string;
  user: {
    id: string;
    name: string;
  };
  comments: ExpenseComment[];
  votes: ExpenseVote[];
  voteScore: number; // computed: sum of vote values
  userVote: number | null; // current user's vote value (1, -1, or null)
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export const EXPENSE_CATEGORIES = [
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "utilities", label: "Utilities" },
  { value: "landscaping", label: "Landscaping" },
  { value: "other", label: "Other" },
] as const;
