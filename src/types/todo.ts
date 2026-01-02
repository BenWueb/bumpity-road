export type UserInfo = {
  id: string;
  name: string;
  email?: string;
  image?: string;
};

export const TODO_STATUSES = ["todo", "in_progress", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export function coerceTodoStatus(value: unknown): TodoStatus {
  return (TODO_STATUSES as readonly string[]).includes(value as string)
    ? (value as TodoStatus)
    : "todo";
}

export type Todo = {
  id: string;
  title: string;
  details: string | null;
  completed: boolean;
  completedAt: string | null;
  status: TodoStatus;
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
  status?: TodoStatus;
  assignedToId?: string | null;
};

export type TodoUpdateInput = {
  id: string;
  title?: string;
  details?: string | null;
  recurring?: string | null;
  status?: TodoStatus;
  completed?: boolean;
  assignedToId?: string | null;
};

