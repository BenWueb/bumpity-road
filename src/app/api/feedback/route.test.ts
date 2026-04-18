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
    feedback: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock("@/utils/badges", () => ({
  checkAndAwardFeedbackBadges: jest.fn(),
}));

import { GET, POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { checkAndAwardFeedbackBadges } from "@/utils/badges";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  feedback: {
    findMany: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};
const checkAndAwardFeedbackBadgesMock = checkAndAwardFeedbackBadges as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  checkAndAwardFeedbackBadgesMock.mockResolvedValue([]);
});

describe("GET /api/feedback", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns 403 when not a bug admin", async () => {
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: false });
    const res = await GET();
    expect(res.status).toBe(403);
  });

  it("returns feedback when bug admin", async () => {
    setSession({ user: { id: "admin" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: true });
    db.feedback.findMany.mockResolvedValue([{ id: "f1" }]);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.feedback).toHaveLength(1);
  });
});

describe("POST /api/feedback", () => {
  it("returns 400 when type is missing", async () => {
    const res = await POST(
      makeRequest("/api/feedback", {
        method: "POST",
        body: { title: "T", description: "D" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when title or description is blank", async () => {
    let res = await POST(
      makeRequest("/api/feedback", {
        method: "POST",
        body: { type: "bug", title: "  ", description: "D" },
      })
    );
    expect(res.status).toBe(400);

    res = await POST(
      makeRequest("/api/feedback", {
        method: "POST",
        body: { type: "bug", title: "T", description: "  " },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when type is not 'bug' or 'feature'", async () => {
    const res = await POST(
      makeRequest("/api/feedback", {
        method: "POST",
        body: { type: "complaint", title: "T", description: "D" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates feedback with userId=null when not logged in and skips badge award", async () => {
    setSession(null);
    db.feedback.create.mockResolvedValue({ id: "f1" });

    const res = await POST(
      makeRequest("/api/feedback", {
        method: "POST",
        body: { type: "bug", title: "  T  ", description: "  D  " },
      })
    );
    const body = await res.json();

    const data = db.feedback.create.mock.calls[0][0].data;
    expect(data.userId).toBeNull();
    expect(data.title).toBe("T");
    expect(data.description).toBe("D");
    expect(checkAndAwardFeedbackBadgesMock).not.toHaveBeenCalled();
    expect(body.newBadges).toEqual([]);
  });

  it("awards feedback badges when logged in", async () => {
    setSession({ user: { id: "u1" } });
    db.feedback.create.mockResolvedValue({ id: "f1" });
    checkAndAwardFeedbackBadgesMock.mockResolvedValue(["FEEDBACK_FIRST"]);

    const res = await POST(
      makeRequest("/api/feedback", {
        method: "POST",
        body: { type: "feature", title: "T", description: "D" },
      })
    );
    const body = await res.json();

    expect(checkAndAwardFeedbackBadgesMock).toHaveBeenCalledWith("u1");
    expect(body.newBadges).toEqual(["FEEDBACK_FIRST"]);
    const data = db.feedback.create.mock.calls[0][0].data;
    expect(data.userId).toBe("u1");
  });
});

describe("PATCH /api/feedback", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await PATCH(
      makeRequest("/api/feedback", {
        method: "PATCH",
        body: { id: "f1", status: "open" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when not bug admin", async () => {
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: false });
    const res = await PATCH(
      makeRequest("/api/feedback", {
        method: "PATCH",
        body: { id: "f1", status: "open" },
      })
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 when id or status missing", async () => {
    setSession({ user: { id: "admin" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: true });

    let res = await PATCH(
      makeRequest("/api/feedback", { method: "PATCH", body: { id: "f1" } })
    );
    expect(res.status).toBe(400);

    res = await PATCH(
      makeRequest("/api/feedback", {
        method: "PATCH",
        body: { status: "open" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid status values", async () => {
    setSession({ user: { id: "admin" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: true });

    const res = await PATCH(
      makeRequest("/api/feedback", {
        method: "PATCH",
        body: { id: "f1", status: "bogus" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("updates status when bug admin", async () => {
    setSession({ user: { id: "admin" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: true });
    db.feedback.update.mockResolvedValue({ id: "f1", status: "resolved" });

    const res = await PATCH(
      makeRequest("/api/feedback", {
        method: "PATCH",
        body: { id: "f1", status: "resolved" },
      })
    );
    expect(res.status).toBe(200);
    expect(db.feedback.update).toHaveBeenCalledWith({
      where: { id: "f1" },
      data: { status: "resolved" },
      include: expect.any(Object),
    });
  });
});

describe("DELETE /api/feedback", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await DELETE(
      makeRequest("/api/feedback", {
        method: "DELETE",
        searchParams: { id: "f1" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when not bug admin", async () => {
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: false });
    const res = await DELETE(
      makeRequest("/api/feedback", {
        method: "DELETE",
        searchParams: { id: "f1" },
      })
    );
    expect(res.status).toBe(403);
  });

  it("deletes when bug admin", async () => {
    setSession({ user: { id: "admin" } });
    db.user.findUnique.mockResolvedValue({ isBugAdmin: true });
    db.feedback.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/feedback", {
        method: "DELETE",
        searchParams: { id: "f1" },
      })
    );
    expect(res.status).toBe(200);
    expect(db.feedback.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
  });
});
