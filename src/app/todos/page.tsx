import { getTodosServer } from "@/lib/todos-server";
import TodosKanban from "./TodosKanban";
import { Suspense } from "react";

function TodosLoading() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="text-muted-foreground">Loading tasks...</div>
    </div>
  );
}

async function TodosContent() {
  const todos = await getTodosServer();
  return <TodosKanban initialTodos={todos} />;
}

export default function TodosPage() {
  return (
    <Suspense fallback={<TodosLoading />}>
      <TodosContent />
    </Suspense>
  );
}
