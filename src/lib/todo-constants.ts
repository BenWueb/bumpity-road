import { Circle, CircleCheck, Clock } from "lucide-react";
import type { TodoStatus } from "@/types/todo";

export const RECURRING_OPTIONS = [
  { value: null, label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

export const KANBAN_COLUMNS = [
  {
    id: "todo",
    label: "To Do",
    icon: Circle,
    color: "border-t-slate-400",
    cardGradient: "bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-800/20",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: Clock,
    color: "border-t-blue-400",
    cardGradient: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/40 dark:to-blue-800/20",
  },
  {
    id: "done",
    label: "Done",
    icon: CircleCheck,
    color: "border-t-emerald-400",
    cardGradient: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/40 dark:to-emerald-800/20",
  },
] as const satisfies readonly {
  id: TodoStatus;
  label: string;
  icon: typeof Circle;
  color: string;
  cardGradient: string;
}[];

export type KanbanColumnId = (typeof KANBAN_COLUMNS)[number]["id"];

