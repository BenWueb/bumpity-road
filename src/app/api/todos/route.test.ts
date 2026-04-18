/**
 * @jest-environment node
 */
jest.mock("next/headers", () => ({ headers: async () => new Headers() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("@/utils/auth", () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock("@/utils/prisma", () => ({
  prisma: {
    todo: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock("@/utils/badges", () => ({
  checkAndAwardTaskBadges: jest.fn(),
}));

import { GET, POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { checkAndAwardTaskBadges } from "@/utils/badges";
import { revalidatePath } from "next/cache";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  todo: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};
const checkAndAwardTaskBadgesMock = checkAndAwardTaskBadges as jest.Mock;
const revalidatePathMock = revalidatePath as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  checkAndAwardTaskBadgesMock.mockResolvedValue([]);
});

describe("GET /api/todos", () => {
  it("normalizes status via coerceTodoStatus and forces completed=true when status=done", async () => {
    db.todo.findMany.mockResolvedValue([
      {
        id: "t1",
        status: "weird_status",
        completed: false,
      },
      {
        id: "t2",
        status: "done",
        completed: false,
      },
      {
        id: "t3",
        status: "in_progress",
        completed: false,
      },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(body.todos[0]).toMatchObject({
      id: "t1",
      status: "todo",
      completed: false,
    });
    expect(body.todos[1]).toMatchObject({
      id: "t2",
      status: "done",
      completed: true,
    });
    expect(body.todos[2]).toMatchObject({
      id: "t3",
      status: "in_progress",
      completed: false,
    });
  });
});

describe("POST /api/todos", () => {
  it("returns 401 when unauthenticated", async () => {
    setSession(null);
    const res = await POST(
      makeRequest("/api/todos", { method: "POST", body: { title: "x" } })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when title is empty", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/todos", { method: "POST", body: { title: "   " } })
    );
    expect(res.status).toBe(400);
  });

  it("coerces invalid status to 'todo' and trims fields", async () => {
    setSession({ user: { id: "u1" } });
    db.todo.create.mockResolvedValue({ id: "t1" });

    await POST(
      makeRequest("/api/todos", {
        method: "POST",
        body: {
          title: "  Hello  ",
          details: "  Details  ",
          status: "weird",
        },
      })
    );

    const data = db.todo.create.mock.calls[0][0].data;
    expect(data.title).toBe("Hello");
    expect(data.details).toBe("Details");
    expect(data.status).toBe("todo");
    expect(data.userId).toBe("u1");
  });

  it("revalidates affected paths", async () => {
    setSession({ user: { id: "u1" } });
    db.todo.create.mockResolvedValue({ id: "t1" });

    await POST(
      makeRequest("/api/todos", {
        method: "POST",
        body: { title: "Hello" },
      })
    );

    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/todos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/account");
  });
});

describe("PATCH /api/todos", () => {
  it("returns 401 when unauthenticated", async () => {
    setSession(null);
    const res = await PATCH(
      makeRequest("/api/todos", { method: "PATCH", body: { id: "t1" } })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await PATCH(
      makeRequest("/api/todos", { method: "PATCH", body: {} })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when neither owner nor assignee", async () => {
    setSession({ user: { id: "stranger" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: "assignee",
      completed: false,
      status: "todo",
    });

    const res = await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: { id: "t1", status: "done" },
      })
    );
    expect(res.status).toBe(404);
    expect(db.todo.update).not.toHaveBeenCalled();
  });

  it("assignee can change status but NOT title/recurring/assignedToId", async () => {
    setSession({ user: { id: "assignee" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: "assignee",
      completed: false,
      status: "todo",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });

    await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: {
          id: "t1",
          status: "in_progress",
          title: "Should be ignored",
          recurring: "weekly",
          assignedToId: "someone-else",
        },
      })
    );

    const data = db.todo.update.mock.calls[0][0].data;
    expect(data.status).toBe("in_progress");
    expect(data).not.toHaveProperty("title");
    expect(data).not.toHaveProperty("recurring");
    expect(data).not.toHaveProperty("assignedToId");
  });

  it("owner can change title/recurring/assignedToId/details", async () => {
    setSession({ user: { id: "owner" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: null,
      completed: false,
      status: "todo",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });

    await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: {
          id: "t1",
          title: "  New title  ",
          details: "  details  ",
          recurring: "weekly",
          assignedToId: "u2",
        },
      })
    );

    const data = db.todo.update.mock.calls[0][0].data;
    expect(data.title).toBe("New title");
    expect(data.details).toBe("details");
    expect(data.recurring).toBe("weekly");
    expect(data.assignedToId).toBe("u2");
  });

  it("sets completedById/completedAt when transitioning to completed via status=done", async () => {
    setSession({ user: { id: "assignee" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: "assignee",
      completed: false,
      status: "todo",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });

    await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: { id: "t1", status: "done" },
      })
    );

    const data = db.todo.update.mock.calls[0][0].data;
    expect(data.status).toBe("done");
    expect(data.completed).toBe(true);
    expect(data.completedById).toBe("assignee");
    expect(data.completedAt).toBeInstanceOf(Date);
  });

  it("sets completedById/completedAt when transitioning to completed via completed=true", async () => {
    setSession({ user: { id: "owner" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: null,
      completed: false,
      status: "todo",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });

    await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: { id: "t1", completed: true },
      })
    );

    const data = db.todo.update.mock.calls[0][0].data;
    expect(data.completedById).toBe("owner");
    expect(data.completedAt).toBeInstanceOf(Date);
  });

  it("clears completedById/completedAt when uncompleting", async () => {
    setSession({ user: { id: "owner" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: null,
      completed: true,
      status: "done",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });

    await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: { id: "t1", status: "todo" },
      })
    );

    const data = db.todo.update.mock.calls[0][0].data;
    expect(data.status).toBe("todo");
    expect(data.completed).toBe(false);
    expect(data.completedById).toBeNull();
    expect(data.completedAt).toBeNull();
  });

  it("calls checkAndAwardTaskBadges only on the completion transition", async () => {
    setSession({ user: { id: "owner" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: null,
      completed: false,
      status: "todo",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });
    checkAndAwardTaskBadgesMock.mockResolvedValue(["TASK_ROOKIE"]);

    const res = await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: { id: "t1", status: "done" },
      })
    );

    expect(checkAndAwardTaskBadgesMock).toHaveBeenCalledWith("owner");
    const body = await res.json();
    expect(body.newBadges).toEqual(["TASK_ROOKIE"]);
  });

  it("does NOT call checkAndAwardTaskBadges when not transitioning to completed", async () => {
    setSession({ user: { id: "owner" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: null,
      completed: false,
      status: "todo",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });

    await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: { id: "t1", status: "in_progress" },
      })
    );

    expect(checkAndAwardTaskBadgesMock).not.toHaveBeenCalled();
  });

  it("does NOT re-award badges when already completed", async () => {
    setSession({ user: { id: "owner" } });
    db.todo.findUnique.mockResolvedValue({
      id: "t1",
      userId: "owner",
      assignedToId: null,
      completed: true,
      status: "done",
    });
    db.todo.update.mockResolvedValue({ id: "t1" });

    await PATCH(
      makeRequest("/api/todos", {
        method: "PATCH",
        body: { id: "t1", status: "done" },
      })
    );

    expect(checkAndAwardTaskBadgesMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/todos", () => {
  it("returns 401 when unauthenticated", async () => {
    setSession(null);
    const res = await DELETE(
      makeRequest("/api/todos", {
        method: "DELETE",
        searchParams: { id: "t1" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await DELETE(
      makeRequest("/api/todos", { method: "DELETE" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when not the owner", async () => {
    setSession({ user: { id: "stranger" } });
    db.todo.findUnique.mockResolvedValue({ userId: "owner" });

    const res = await DELETE(
      makeRequest("/api/todos", {
        method: "DELETE",
        searchParams: { id: "t1" },
      })
    );
    expect(res.status).toBe(404);
    expect(db.todo.delete).not.toHaveBeenCalled();
  });

  it("deletes when owner and revalidates paths", async () => {
    setSession({ user: { id: "owner" } });
    db.todo.findUnique.mockResolvedValue({ userId: "owner" });
    db.todo.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/todos", {
        method: "DELETE",
        searchParams: { id: "t1" },
      })
    );
    expect(res.status).toBe(200);
    expect(db.todo.delete).toHaveBeenCalledWith({ where: { id: "t1" } });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/todos");
    expect(revalidatePathMock).toHaveBeenCalledWith("/account");
  });
});
