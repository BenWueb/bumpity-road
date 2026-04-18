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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    puzzleContribution: {
      upsert: jest.fn(),
    },
  },
}));

import { POST } from "./route";
import { prisma } from "@/utils/prisma";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  puzzleEntry: { findUnique: jest.Mock; update: jest.Mock };
  puzzleContribution: { upsert: jest.Mock };
};

const baseEntry = {
  id: "p1",
  status: "in_progress",
  completedAt: null,
  completedBy: null,
  completedDate: null,
  notes: null,
  imageUrl: "u",
  imagePublicId: "pid",
  color: null,
  userId: "owner",
  user: { id: "owner", name: "Alice" },
  contributions: [],
  createdAt: new Date(),
};

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/puzzles/[id]/contribute", () => {
  it("returns 401 when not signed in", async () => {
    setSession(null);
    const res = await POST(
      makeRequest("/api/puzzles/p1/contribute", { method: "POST", body: {} }),
      ctx("p1"),
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when puzzle not found", async () => {
    setSession({ user: { id: "u2" } });
    db.puzzleEntry.findUnique.mockResolvedValueOnce(null);

    const res = await POST(
      makeRequest("/api/puzzles/p1/contribute", { method: "POST", body: {} }),
      ctx("p1"),
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 when puzzle is already completed", async () => {
    setSession({ user: { id: "u2" } });
    db.puzzleEntry.findUnique.mockResolvedValueOnce({
      id: "p1",
      status: "completed",
    });

    const res = await POST(
      makeRequest("/api/puzzles/p1/contribute", { method: "POST", body: {} }),
      ctx("p1"),
    );
    expect(res.status).toBe(409);
    expect(db.puzzleContribution.upsert).not.toHaveBeenCalled();
  });

  it("upserts a contribution without completing", async () => {
    setSession({ user: { id: "u2" } });
    db.puzzleEntry.findUnique
      .mockResolvedValueOnce({ id: "p1", status: "in_progress" })
      .mockResolvedValueOnce(baseEntry);
    db.user.findUnique.mockResolvedValue({ name: "Bob" });

    const res = await POST(
      makeRequest("/api/puzzles/p1/contribute", { method: "POST", body: {} }),
      ctx("p1"),
    );

    expect(res.status).toBe(200);
    expect(db.puzzleContribution.upsert).toHaveBeenCalledWith({
      where: { puzzleId_userId: { puzzleId: "p1", userId: "u2" } },
      create: { puzzleId: "p1", userId: "u2", userName: "Bob" },
      update: { userName: "Bob" },
    });
    expect(db.puzzleEntry.update).not.toHaveBeenCalled();
  });

  it("marks complete and sets completedAt when markComplete is true", async () => {
    setSession({ user: { id: "u2" } });
    db.puzzleEntry.findUnique
      .mockResolvedValueOnce({ id: "p1", status: "in_progress" })
      .mockResolvedValueOnce({ ...baseEntry, status: "completed" });
    db.user.findUnique.mockResolvedValue({ name: "Bob" });

    const res = await POST(
      makeRequest("/api/puzzles/p1/contribute", {
        method: "POST",
        body: { markComplete: true },
      }),
      ctx("p1"),
    );

    expect(res.status).toBe(200);
    expect(db.puzzleContribution.upsert).toHaveBeenCalled();
    expect(db.puzzleEntry.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: expect.objectContaining({
        status: "completed",
        completedAt: expect.any(Date),
      }),
    });
  });
});
