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
    user: { findUnique: jest.fn() },
    guestbookEntry: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));
jest.mock("@/utils/badges", () => ({
  awardGuestbookBadge: jest.fn(),
}));

import { GET, POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { awardGuestbookBadge } from "@/utils/badges";
import { makeRequest } from "@/test/route-helpers";
import { setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  guestbookEntry: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
};

const awardGuestbookBadgeMock = awardGuestbookBadge as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/guestbook", () => {
  it("returns entries without exposing ownerToken in the select", async () => {
    db.guestbookEntry.findMany.mockResolvedValue([
      {
        id: "e1",
        name: "A",
        message: "hi",
        color: null,
        createdAt: new Date().toISOString(),
      },
    ]);
    setSession(null);

    const res = await GET();
    const body = await res.json();

    expect(body.entries).toHaveLength(1);
    expect(body.entries[0]).not.toHaveProperty("ownerToken");

    const selectArg = db.guestbookEntry.findMany.mock.calls[0][0]?.select;
    expect(selectArg).toBeDefined();
    expect(selectArg.ownerToken).toBeUndefined();
  });

  it("isAdmin is false when not logged in", async () => {
    db.guestbookEntry.findMany.mockResolvedValue([]);
    setSession(null);

    const res = await GET();
    const body = await res.json();
    expect(body.isAdmin).toBe(false);
  });

  it("isAdmin is true when session user is an admin", async () => {
    db.guestbookEntry.findMany.mockResolvedValue([]);
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ isAdmin: true });

    const res = await GET();
    const body = await res.json();
    expect(body.isAdmin).toBe(true);
  });

  it("isAdmin is false when session user is a non-admin", async () => {
    db.guestbookEntry.findMany.mockResolvedValue([]);
    setSession({ user: { id: "u1" } });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });

    const res = await GET();
    const body = await res.json();
    expect(body.isAdmin).toBe(false);
  });
});

describe("POST /api/guestbook", () => {
  it("returns 400 when name is missing or blank", async () => {
    const res = await POST(
      makeRequest("/api/guestbook", {
        method: "POST",
        body: { message: "hi" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is blank", async () => {
    const res = await POST(
      makeRequest("/api/guestbook", {
        method: "POST",
        body: { name: "A", message: "   " },
      })
    );
    expect(res.status).toBe(400);
  });

  it("trims name and message before persisting", async () => {
    setSession(null);
    db.guestbookEntry.create.mockResolvedValue({
      id: "e1",
      name: "Alice",
      message: "Hello",
      color: "blue",
      createdAt: new Date().toISOString(),
    });

    await POST(
      makeRequest("/api/guestbook", {
        method: "POST",
        body: { name: "  Alice  ", message: "  Hello  ", color: "blue" },
      })
    );

    const data = db.guestbookEntry.create.mock.calls[0][0].data;
    expect(data.name).toBe("Alice");
    expect(data.message).toBe("Hello");
    expect(data.color).toBe("blue");
    expect(typeof data.ownerToken).toBe("string");
    expect(data.ownerToken.length).toBeGreaterThan(0);
  });

  it("returns the entry, ownerToken, and badgeAwarded=false when not logged in", async () => {
    setSession(null);
    db.guestbookEntry.create.mockResolvedValue({
      id: "e1",
      name: "A",
      message: "hi",
      color: null,
      createdAt: new Date().toISOString(),
    });

    const res = await POST(
      makeRequest("/api/guestbook", {
        method: "POST",
        body: { name: "A", message: "hi" },
      })
    );
    const body = await res.json();

    expect(body.entry.id).toBe("e1");
    expect(typeof body.ownerToken).toBe("string");
    expect(body.badgeAwarded).toBe(false);
    expect(awardGuestbookBadgeMock).not.toHaveBeenCalled();
  });

  it("awards GUESTBOOK_SIGNER badge when logged in", async () => {
    setSession({ user: { id: "u1" } });
    db.guestbookEntry.create.mockResolvedValue({
      id: "e1",
      name: "A",
      message: "hi",
      color: null,
      createdAt: new Date().toISOString(),
    });
    awardGuestbookBadgeMock.mockResolvedValue(true);

    const res = await POST(
      makeRequest("/api/guestbook", {
        method: "POST",
        body: { name: "A", message: "hi" },
      })
    );
    const body = await res.json();

    expect(awardGuestbookBadgeMock).toHaveBeenCalledWith("u1");
    expect(body.badgeAwarded).toBe(true);
  });
});

describe("PATCH /api/guestbook", () => {
  it("returns 400 when id or ownerToken is missing", async () => {
    let res = await PATCH(
      makeRequest("/api/guestbook", {
        method: "PATCH",
        body: { name: "A" },
      })
    );
    expect(res.status).toBe(400);

    res = await PATCH(
      makeRequest("/api/guestbook", {
        method: "PATCH",
        body: { id: "e1" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when entry is not found", async () => {
    db.guestbookEntry.findUnique.mockResolvedValue(null);
    const res = await PATCH(
      makeRequest("/api/guestbook", {
        method: "PATCH",
        body: { id: "e1", ownerToken: "tok", name: "A" },
      })
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 when ownerToken does not match", async () => {
    db.guestbookEntry.findUnique.mockResolvedValue({
      id: "e1",
      ownerToken: "real-token",
    });
    const res = await PATCH(
      makeRequest("/api/guestbook", {
        method: "PATCH",
        body: { id: "e1", ownerToken: "wrong-token", name: "A" },
      })
    );
    expect(res.status).toBe(404);
    expect(db.guestbookEntry.update).not.toHaveBeenCalled();
  });

  it("updates only provided fields when ownerToken matches", async () => {
    db.guestbookEntry.findUnique.mockResolvedValue({
      id: "e1",
      ownerToken: "tok",
    });
    db.guestbookEntry.update.mockResolvedValue({
      id: "e1",
      name: "Bob",
      message: "old",
      color: "red",
      createdAt: new Date().toISOString(),
    });

    await PATCH(
      makeRequest("/api/guestbook", {
        method: "PATCH",
        body: {
          id: "e1",
          ownerToken: "tok",
          name: "  Bob  ",
          color: "red",
        },
      })
    );

    const data = db.guestbookEntry.update.mock.calls[0][0].data;
    expect(data.name).toBe("Bob");
    expect(data.color).toBe("red");
    expect(data).not.toHaveProperty("message");
  });

  it("can set color to null explicitly", async () => {
    db.guestbookEntry.findUnique.mockResolvedValue({
      id: "e1",
      ownerToken: "tok",
    });
    db.guestbookEntry.update.mockResolvedValue({
      id: "e1",
      name: "B",
      message: "m",
      color: null,
      createdAt: new Date().toISOString(),
    });

    await PATCH(
      makeRequest("/api/guestbook", {
        method: "PATCH",
        body: { id: "e1", ownerToken: "tok", color: null },
      })
    );

    const data = db.guestbookEntry.update.mock.calls[0][0].data;
    expect(data.color).toBeNull();
  });
});

describe("DELETE /api/guestbook", () => {
  it("returns 400 when id is missing", async () => {
    const res = await DELETE(
      makeRequest("/api/guestbook", { method: "DELETE" })
    );
    expect(res.status).toBe(400);
  });

  describe("admin path", () => {
    it("returns 401 when not logged in", async () => {
      setSession(null);
      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", admin: "true" },
        })
      );
      expect(res.status).toBe(401);
    });

    it("returns 403 when logged in but not an admin", async () => {
      setSession({ user: { id: "u1" } });
      db.user.findUnique.mockResolvedValue({ isAdmin: false });
      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", admin: "true" },
        })
      );
      expect(res.status).toBe(403);
    });

    it("returns 404 when entry doesn't exist", async () => {
      setSession({ user: { id: "u1" } });
      db.user.findUnique.mockResolvedValue({ isAdmin: true });
      db.guestbookEntry.count.mockResolvedValue(0);

      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", admin: "true" },
        })
      );
      expect(res.status).toBe(404);
    });

    it("deletes the entry when admin and entry exists", async () => {
      setSession({ user: { id: "u1" } });
      db.user.findUnique.mockResolvedValue({ isAdmin: true });
      db.guestbookEntry.count.mockResolvedValue(1);
      db.guestbookEntry.delete.mockResolvedValue({});

      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", admin: "true" },
        })
      );
      expect(res.status).toBe(200);
      expect(db.guestbookEntry.delete).toHaveBeenCalledWith({
        where: { id: "e1" },
      });
    });
  });

  describe("owner path", () => {
    it("returns 400 when token is missing", async () => {
      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1" },
        })
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 when entry does not exist", async () => {
      db.guestbookEntry.findUnique.mockResolvedValue(null);
      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", token: "tok" },
        })
      );
      expect(res.status).toBe(404);
    });

    it("returns 401 when token does not match", async () => {
      db.guestbookEntry.findUnique.mockResolvedValue({
        ownerToken: "real-token",
      });
      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", token: "wrong" },
        })
      );
      expect(res.status).toBe(401);
      expect(db.guestbookEntry.delete).not.toHaveBeenCalled();
    });

    it("returns 401 when entry has no ownerToken (legacy)", async () => {
      db.guestbookEntry.findUnique.mockResolvedValue({ ownerToken: null });
      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", token: "anything" },
        })
      );
      expect(res.status).toBe(401);
    });

    it("deletes the entry when token matches", async () => {
      db.guestbookEntry.findUnique.mockResolvedValue({ ownerToken: "tok" });
      db.guestbookEntry.delete.mockResolvedValue({});

      const res = await DELETE(
        makeRequest("/api/guestbook", {
          method: "DELETE",
          searchParams: { id: "e1", token: "tok" },
        })
      );
      expect(res.status).toBe(200);
      expect(db.guestbookEntry.delete).toHaveBeenCalledWith({
        where: { id: "e1" },
      });
    });
  });
});
