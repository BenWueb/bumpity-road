"use client";

import { TodoForm } from "@/components/todos";
import { Todo, TodoStatus } from "@/types/todo";
import { Modal } from "@/components/ui/Modal";

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  editingTodo: Todo | null;
  defaultStatus: TodoStatus;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    details: string | null;
    recurring: string | null;
    status: TodoStatus;
    assignedToId: string | null;
  }) => Promise<void>;
};

export function TodoModal({
  isOpen,
  isSubmitting,
  editingTodo,
  defaultStatus,
  onClose,
  onSubmit,
}: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTodo ? "Edit Task" : "Add Task"}
      panelClassName="w-full max-w-md rounded-lg border bg-background p-4 shadow-xl md:p-6"
    >
      <TodoForm
        key={`${editingTodo?.id ?? "new"}:${defaultStatus}`}
        initialData={{
          title: editingTodo?.title ?? "",
          details: editingTodo?.details ?? "",
          recurring: editingTodo?.recurring ?? null,
          status: editingTodo?.status ?? defaultStatus,
          assignedTo: editingTodo?.assignedTo ?? null,
        }}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        showStatusField
        submitLabel={editingTodo ? "Save" : "Add"}
        submittingLabel={editingTodo ? "Saving..." : "Adding..."}
      />
    </Modal>
  );
}


