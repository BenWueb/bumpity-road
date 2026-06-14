export type AccountTab = "overview" | "tasks" | "content" | "wildlife" | "puzzles";

export type ActivityNavTarget = AccountTab;

export const ACCOUNT_TABS: { id: AccountTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "tasks", label: "Tasks" },
  { id: "content", label: "Content" },
  { id: "wildlife", label: "Wildlife" },
  { id: "puzzles", label: "Puzzles" },
];
