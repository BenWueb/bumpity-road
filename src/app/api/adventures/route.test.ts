/**
 * @jest-environment node
 */
jest.mock("next/headers", () => ({ headers: async () => new Headers() }));
jest.mock("next/cache", () => ({ revalidateTag: jest.fn() }));
jest.mock("@/utils/auth", () => ({
  auth: { api: { getSession: jest.fn() } },
}));
jest.mock("@/utils/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    adventure: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock("@/utils/badges", () => ({
  checkAndAwardAdventureBadges: jest.fn(),
}));
jest.mock("@/utils/cloudinary", () => ({
  deleteCloudinaryImage: jest.fn(),
}));
jest.mock("@/lib/adventures-server", () => ({
  ADVENTURES_CACHE_TAG: "adventures",
}));

import { POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { checkAndAwardAdventureBadges } from "@/utils/badges";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  adventure: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};
const checkAndAwardAdventureBadgesMock =
  checkAndAwardAdventureBadges as jest.Mock;
const deleteCloudinaryImageMock = deleteCloudinaryImage as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  checkAndAwardAdventureBadgesMock.mockResolvedValue([]);
});

const validBody = {
  title: "Trail",
  description: "Nice trail",
  address: "123 Pine St",
  seasons: ["summer"],
  category: "hiking",
  headerImage: "url",
  headerImagePublicId: "pid",
};

describe("POST /api/adventures", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await POST(
      makeRequest("/api/adventures", { method: "POST", body: validBody })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when title/description/address blank", async () => {
    setSession({ user: { id: "u1" } });

    let res = await POST(
      makeRequest("/api/adventures", {
        method: "POST",
        body: { ...validBody, title: "  " },
      })
    );
    expect(res.status).toBe(400);

    res = await POST(
      makeRequest("/api/adventures", {
        method: "POST",
        body: { ...validBody, description: "  " },
      })
    );
    expect(res.status).toBe(400);

    res = await POST(
      makeRequest("/api/adventures", {
        method: "POST",
        body: { ...validBody, address: "  " },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when no seasons provided", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/adventures", {
        method: "POST",
        body: { ...validBody, seasons: [], season: undefined },
      })
    );
    expect(res.status).toBe(400);
  });

  it("accepts a single legacy 'season' string", async () => {
    setSession({ user: { id: "u1" } });
    db.adventure.create.mockResolvedValue({ id: "a1" });
    const res = await POST(
      makeRequest("/api/adventures", {
        method: "POST",
        body: { ...validBody, seasons: undefined, season: "spring" },
      })
    );
    expect(res.status).toBe(200);
    const data = db.adventure.create.mock.calls[0][0].data;
    expect(data.seasons).toEqual(["spring"]);
    expect(data.season).toBe("spring");
  });

  it("returns 400 when category missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/adventures", {
        method: "POST",
        body: { ...validBody, category: undefined },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when header image missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/adventures", {
        method: "POST",
        body: { ...validBody, headerImage: undefined },
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates the adventure and awards badges", async () => {
    setSession({ user: { id: "u1" } });
    db.adventure.create.mockResolvedValue({ id: "a1" });
    checkAndAwardAdventureBadgesMock.mockResolvedValue(["ADVENTURER_FIRST"]);

    const res = await POST(
      makeRequest("/api/adventures", { method: "POST", body: validBody })
    );
    const body = await res.json();

    const data = db.adventure.create.mock.calls[0][0].data;
    expect(data.title).toBe("Trail");
    expect(data.userId).toBe("u1");
    expect(checkAndAwardAdventureBadgesMock).toHaveBeenCalledWith("u1");
    expect(body.newBadges).toEqual(["ADVENTURER_FIRST"]);
  });
});

describe("PATCH /api/adventures", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await PATCH(
      makeRequest("/api/adventures", { method: "PATCH", body: { id: "a1" } })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await PATCH(
      makeRequest("/api/adventures", { method: "PATCH", body: {} })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when not the owner", async () => {
    setSession({ user: { id: "stranger" } });
    db.adventure.findUnique.mockResolvedValue({
      id: "a1",
      userId: "owner",
      headerImagePublicId: "pid",
    });

    const res = await PATCH(
      makeRequest("/api/adventures", {
        method: "PATCH",
        body: { id: "a1", title: "x" },
      })
    );
    expect(res.status).toBe(404);
    expect(db.adventure.update).not.toHaveBeenCalled();
  });

  it("deletes the old header image when a new headerImagePublicId is provided", async () => {
    setSession({ user: { id: "owner" } });
    db.adventure.findUnique.mockResolvedValue({
      id: "a1",
      userId: "owner",
      headerImagePublicId: "old-pid",
    });
    db.adventure.update.mockResolvedValue({ id: "a1" });

    await PATCH(
      makeRequest("/api/adventures", {
        method: "PATCH",
        body: {
          id: "a1",
          headerImagePublicId: "new-pid",
          headerImage: "new-url",
        },
      })
    );

    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("old-pid");
  });

  it("does NOT delete the header image when publicId is unchanged", async () => {
    setSession({ user: { id: "owner" } });
    db.adventure.findUnique.mockResolvedValue({
      id: "a1",
      userId: "owner",
      headerImagePublicId: "same-pid",
    });
    db.adventure.update.mockResolvedValue({ id: "a1" });

    await PATCH(
      makeRequest("/api/adventures", {
        method: "PATCH",
        body: {
          id: "a1",
          headerImagePublicId: "same-pid",
        },
      })
    );

    expect(deleteCloudinaryImageMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/adventures", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await DELETE(
      makeRequest("/api/adventures", {
        method: "DELETE",
        searchParams: { id: "a1" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await DELETE(
      makeRequest("/api/adventures", { method: "DELETE" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when adventure not found", async () => {
    setSession({ user: { id: "u1" } });
    db.adventure.findUnique.mockResolvedValue(null);
    const res = await DELETE(
      makeRequest("/api/adventures", {
        method: "DELETE",
        searchParams: { id: "a1" },
      })
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when neither owner nor admin", async () => {
    setSession({ user: { id: "stranger" } });
    db.adventure.findUnique.mockResolvedValue({
      userId: "owner",
      headerImagePublicId: "pid",
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });

    const res = await DELETE(
      makeRequest("/api/adventures", {
        method: "DELETE",
        searchParams: { id: "a1" },
      })
    );
    expect(res.status).toBe(403);
    expect(db.adventure.delete).not.toHaveBeenCalled();
  });

  it("deletes the cloudinary header image then the DB row when owner", async () => {
    setSession({ user: { id: "owner" } });
    db.adventure.findUnique.mockResolvedValue({
      userId: "owner",
      headerImagePublicId: "pid",
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });
    db.adventure.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/adventures", {
        method: "DELETE",
        searchParams: { id: "a1" },
      })
    );
    expect(res.status).toBe(200);
    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("pid");
    expect(db.adventure.delete).toHaveBeenCalledWith({ where: { id: "a1" } });
  });

  it("admin can delete another user's adventure", async () => {
    setSession({ user: { id: "admin" } });
    db.adventure.findUnique.mockResolvedValue({
      userId: "owner",
      headerImagePublicId: "pid",
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: true });
    db.adventure.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/adventures", {
        method: "DELETE",
        searchParams: { id: "a1" },
      })
    );
    expect(res.status).toBe(200);
  });
});
