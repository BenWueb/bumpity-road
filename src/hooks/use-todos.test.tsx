import { renderHook, act, waitFor } from "@testing-library/react";
import { useTodos } from "./use-todos";
import type { Todo } from "@/types/todo";

function okJson(data: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => data,
  } as Response);
}

describe("useTodos", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("loads todos from /api/todos", async () => {
    const todo: Todo = {
      id: "t1",
      title: "Hello",
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

    (global.fetch as jest.Mock).mockImplementation(() => okJson({ todos: [todo] }));

    const { result } = renderHook(() => useTodos("u1"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe("t1");
  });

  it("optimistically updates status and emits badgesEarned when server returns newBadges", async () => {
    const todo: Todo = {
      id: "t1",
      title: "Hello",
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

    // First call: initial GET
    (global.fetch as jest.Mock).mockImplementationOnce(() => okJson({ todos: [todo] }));
    // Second call: PATCH update status
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      okJson({
        todo: { ...todo, status: "done", completed: true, completedBy: { id: "u1", name: "Alice" } },
        newBadges: ["TASK_ROOKIE"],
      })
    );

    const dispatchSpy = jest.spyOn(window, "dispatchEvent");

    const { result } = renderHook(() => useTodos("u1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.updateStatus("t1", "done");
    });

    // Optimistic update happens immediately
    expect(result.current.todos[0].status).toBe("done");
    expect(result.current.todos[0].completed).toBe(true);

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalled();
    });

    const evt = dispatchSpy.mock.calls.find((c) => (c[0] as Event).type === "badgesEarned")?.[0] as
      | CustomEvent
      | undefined;
    expect(evt).toBeDefined();
    expect((evt as CustomEvent).detail).toEqual({ badges: ["TASK_ROOKIE"] });
  });
});


