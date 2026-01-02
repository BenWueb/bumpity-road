import { render, screen, fireEvent } from "@testing-library/react";
import { KanbanTodoCard } from "./KanbanTodoCard";
import type { Todo } from "@/types/todo";

describe("KanbanTodoCard", () => {
  const baseTodo: Todo = {
    id: "t1",
    title: "Test",
    details: null,
    completed: false,
    completedAt: null,
    status: "todo",
    recurring: null,
    dueDate: null,
    createdAt: new Date().toISOString(),
    userId: "u1",
    user: { id: "u1", name: "Alice" },
    assignedTo: null,
    completedBy: null,
  };

  it("coerces status changes via the dropdown before calling onUpdateStatus", () => {
    const onUpdateStatus = jest.fn();

    render(
      <KanbanTodoCard
        todo={baseTodo}
        cardGradient="bg-white"
        userId="u1"
        isLoggedIn
        isDragging={false}
        canMove
        onUpdateStatus={onUpdateStatus}
      />
    );

    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "done" } });
    expect(onUpdateStatus).toHaveBeenCalledWith("done");

    // Force invalid input; component should coerce to "todo"
    fireEvent.change(select, { target: { value: "invalid_status" } });
    expect(onUpdateStatus).toHaveBeenCalledWith("todo");
  });
});


