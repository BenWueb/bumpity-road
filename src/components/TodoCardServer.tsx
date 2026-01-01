import { getTodosServer } from "@/lib/todos-server";
import TodoCard from "./TodoCard";

export async function TodoCardServer() {
  const todos = await getTodosServer();
  return <TodoCard initialTodos={todos} />;
}

