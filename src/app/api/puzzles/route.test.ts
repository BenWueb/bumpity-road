/**
 * @jest-environment node
 */
jest.mock("next/headers", () => ({ headers: async () => new Headers() }));
jest.mock("@/utils/auth", () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock("@/utils/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    puzzleEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    puzzleContribution: {
      upsert: jest.fn(),
    },
  },
}));
jest.mock("@/utils/cloudinary", () => ({
  deleteCloudinaryImage: jest.fn(),
}));

import { GET, POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  puzzleEntry: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  puzzleContribution: { upsert: jest.Mock };
};
const deleteCloudinaryImageMock = deleteCloudinaryImage as jest.Mock;

const baseEntry = {
  id: "p1",
  status: "completed",
  completedAt: new Date("2024-01-02T00:00:00Z"),
  completedBy: null,
  completedDate: null,
  notes: null,
  imageUrl: "u",
  imagePublicId: "pid",
  color: null,
  userId: "u1",
  user: { id: "u1", name: "Alice" },
  contributions: [],
  createdAt: new Date("2024-01-01T00:00:00Z"),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/puzzles", () => {
  it("returns entries with isAdmin=false and currentUserId=null when not logged in", async () => {
    db.puzzleEntry.findMany.mockResolvedValue([baseEntry]);
    setSession(null);

    const res = await GET();
    const body = await res.json();
    expect(body.entries).toHaveLength(1);
    expect(body.entries[0].status).toBe("completed");
    expect(body.isAdmin).toBe(false);
    expect(body.currentUserId).toBeNull();
  });

  it("includes currentUserId and isAdmin when admin is logged in", async () => {
    db.puzzleEntry.findMany.mockResolvedValue([]);
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ isAdmin: true });

    const res = await GET();
    const body = await res.json();
    expect(body.isAdmin).toBe(true);
    expect(body.currentUserId).toBe("u1");
  });

  it("normalizes legacy entries with null status to 'completed'", async () => {
    db.puzzleEntry.findMany.mockResolvedValue([
      { ...baseEntry, status: null },
    ]);
    setSession(null);

    const res = await GET();
    const body = await res.json();
    expect(body.entries[0].status).toBe("completed");
  });
});

describe("POST /api/puzzles", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await POST(
      makeRequest("/api/puzzles", {
        method: "POST",
        body: { status: "completed", imageUrl: "u", imagePublicId: "p" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when imageUrl or imagePublicId is missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/puzzles", {
        method: "POST",
        body: { status: "completed" },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("creates a completed entry tied to the session user with creator as first contributor", async () => {
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ name: "Alice" });
    db.puzzleEntry.create.mockResolvedValue(baseEntry);

    await POST(
      makeRequest("/api/puzzles", {
        method: "POST",
        body: {
          status: "completed",
          notes: "  fun  ",
          imageUrl: "u",
          imagePublicId: "pid",
          color: "blue",
        },
      }),
    );

    const data = db.puzzleEntry.create.mock.calls[0][0].data;
    expect(data.status).toBe("completed");
    expect(data.completedAt).toBeInstanceOf(Date);
    expect(data.notes).toBe("fun");
    expect(data.userId).toBe("u1");
    expect(data.color).toBe("blue");
    expect(data.contributions.create[0]).toEqual({
      userId: "u1",
      userName: "Alice",
    });
  });

  it("creates an in-progress entry without completedAt", async () => {
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ name: "Alice" });
    db.puzzleEntry.create.mockResolvedValue({
      ...baseEntry,
      status: "in_progress",
      completedAt: null,
    });

    await POST(
      makeRequest("/api/puzzles", {
        method: "POST",
        body: {
          status: "in_progress",
          imageUrl: "u",
          imagePublicId: "pid",
        },
      }),
    );

    const data = db.puzzleEntry.create.mock.calls[0][0].data;
    expect(data.status).toBe("in_progress");
    expect(data.completedAt).toBeNull();
  });
});

describe("PATCH /api/puzzles", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await PATCH(
      makeRequest("/api/puzzles", { method: "PATCH", body: { id: "p1" } }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await PATCH(
      makeRequest("/api/puzzles", { method: "PATCH", body: {} }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when entry not owned by session user", async () => {
    setSession({ user: { id: "stranger" } });
    db.puzzleEntry.findUnique.mockResolvedValue({ userId: "owner" });

    const res = await PATCH(
      makeRequest("/api/puzzles", {
        method: "PATCH",
        body: { id: "p1", notes: "hi" },
      }),
    );
    expect(res.status).toBe(404);
    expect(db.puzzleEntry.update).not.toHaveBeenCalled();
  });

  it("updates only notes/color for the owner", async () => {
    setSession({ user: { id: "owner" } });
    db.puzzleEntry.findUnique.mockResolvedValue({ userId: "owner" });
    db.puzzleEntry.update.mockResolvedValue(baseEntry);

    await PATCH(
      makeRequest("/api/puzzles", {
        method: "PATCH",
        body: { id: "p1", notes: "  some notes  ", color: "rose" },
      }),
    );

    const data = db.puzzleEntry.update.mock.calls[0][0].data;
    expect(data.notes).toBe("some notes");
    expect(data.color).toBe("rose");
  });

  it("can set notes to null when passed empty string", async () => {
    setSession({ user: { id: "owner" } });
    db.puzzleEntry.findUnique.mockResolvedValue({ userId: "owner" });
    db.puzzleEntry.update.mockResolvedValue(baseEntry);

    await PATCH(
      makeRequest("/api/puzzles", {
        method: "PATCH",
        body: { id: "p1", notes: "" },
      }),
    );

    const data = db.puzzleEntry.update.mock.calls[0][0].data;
    expect(data.notes).toBeNull();
  });
});

describe("DELETE /api/puzzles", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await DELETE(
      makeRequest("/api/puzzles", {
        method: "DELETE",
        searchParams: { id: "p1" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await DELETE(
      makeRequest("/api/puzzles", { method: "DELETE" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when entry not found", async () => {
    setSession({ user: { id: "u1" } });
    db.puzzleEntry.findUnique.mockResolvedValue(null);

    const res = await DELETE(
      makeRequest("/api/puzzles", {
        method: "DELETE",
        searchParams: { id: "p1" },
      }),
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when neither owner nor admin", async () => {
    setSession({ user: { id: "stranger" } });
    db.puzzleEntry.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicId: "pid",
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });

    const res = await DELETE(
      makeRequest("/api/puzzles", {
        method: "DELETE",
        searchParams: { id: "p1" },
      }),
    );
    expect(res.status).toBe(403);
    expect(db.puzzleEntry.delete).not.toHaveBeenCalled();
    expect(deleteCloudinaryImageMock).not.toHaveBeenCalled();
  });

  it("deletes when owner: removes from cloudinary then DB", async () => {
    setSession({ user: { id: "owner" } });
    db.puzzleEntry.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicId: "pid",
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });
    db.puzzleEntry.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/puzzles", {
        method: "DELETE",
        searchParams: { id: "p1" },
      }),
    );
    expect(res.status).toBe(200);
    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("pid");
    expect(db.puzzleEntry.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });

  it("deletes when admin even if not owner", async () => {
    setSession({ user: { id: "admin" } });
    db.puzzleEntry.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicId: "pid",
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: true });
    db.puzzleEntry.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/puzzles", {
        method: "DELETE",
        searchParams: { id: "p1" },
      }),
    );
    expect(res.status).toBe(200);
    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("pid");
  });
});
