export type UserInfo = {
  id: string;
  name: string;
  email?: string;
  image?: string;
};

export type Todo = {
  id: string;
  title: string;
  details: string | null;
  completed: boolean;
  completedAt: string | null;
  status: string;
  recurring: string | null;
  dueDate: string | null;
  createdAt: string;
  userId: string;
  user: { id: string; name: string };
  assignedTo: UserInfo | null;
  completedBy: { id: string; name: string } | null;
};

export type TodoCreateInput = {
  title: string;
  details?: string | null;
  recurring?: string | null;
  status?: string;
  assignedToId?: string | null;
};

export type TodoUpdateInput = {
  id: string;
  title?: string;
  details?: string | null;
  recurring?: string | null;
  status?: string;
  completed?: boolean;
  assignedToId?: string | null;
};

