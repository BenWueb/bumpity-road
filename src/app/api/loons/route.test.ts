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
    loonObservation: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock("@/utils/badges", () => ({
  checkAndAwardLoonBadges: jest.fn(),
}));
jest.mock("@/utils/cloudinary", () => ({
  deleteCloudinaryImage: jest.fn(),
}));

import { GET, POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { checkAndAwardLoonBadges } from "@/utils/badges";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  loonObservation: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};
const checkAndAwardLoonBadgesMock = checkAndAwardLoonBadges as jest.Mock;
const deleteCloudinaryImageMock = deleteCloudinaryImage as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  checkAndAwardLoonBadgesMock.mockResolvedValue([]);
});

describe("POST /api/loons", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await POST(
      makeRequest("/api/loons", {
        method: "POST",
        body: { lakeName: "L", date: "2024-01-01" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when lakeName is blank", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/loons", {
        method: "POST",
        body: { lakeName: "  ", date: "2024-01-01" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when date is missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/loons", {
        method: "POST",
        body: { lakeName: "L" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when paired+unpaired exceeds total adults", async () => {
    setSession({ user: { id: "u1" } });
    const res = await POST(
      makeRequest("/api/loons", {
        method: "POST",
        body: {
          lakeName: "L",
          date: "2024-01-01",
          adultsCount: 2,
          pairedAdultsCount: 2,
          unpairedAdultsCount: 1,
        },
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates the observation and awards loon badges", async () => {
    setSession({ user: { id: "u1" } });
    db.loonObservation.create.mockResolvedValue({ id: "o1" });
    checkAndAwardLoonBadgesMock.mockResolvedValue(["LOON_SPOTTER"]);

    const res = await POST(
      makeRequest("/api/loons", {
        method: "POST",
        body: {
          lakeName: "  Trout Lake  ",
          date: "2024-01-01",
          adultsCount: 2,
          chicksCount: 1,
        },
      })
    );
    const body = await res.json();

    const data = db.loonObservation.create.mock.calls[0][0].data;
    expect(data.lakeName).toBe("Trout Lake");
    expect(data.userId).toBe("u1");
    expect(data.adultsCount).toBe(2);
    expect(data.chicksCount).toBe(1);

    expect(checkAndAwardLoonBadgesMock).toHaveBeenCalledWith("u1");
    expect(body.newBadges).toEqual(["LOON_SPOTTER"]);
  });
});

describe("PATCH /api/loons", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await PATCH(
      makeRequest("/api/loons", { method: "PATCH", body: { id: "o1" } })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await PATCH(
      makeRequest("/api/loons", { method: "PATCH", body: {} })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when not the observation owner", async () => {
    setSession({ user: { id: "stranger" } });
    db.loonObservation.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicIds: [],
      adultsCount: 0,
      pairedAdultsCount: null,
      unpairedAdultsCount: null,
    });

    const res = await PATCH(
      makeRequest("/api/loons", {
        method: "PATCH",
        body: { id: "o1", lakeName: "x" },
      })
    );
    expect(res.status).toBe(404);
    expect(db.loonObservation.update).not.toHaveBeenCalled();
  });

  it("removes specific images from cloudinary when removedImagePublicIds provided", async () => {
    setSession({ user: { id: "owner" } });
    db.loonObservation.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicIds: ["pid1", "pid2"],
      adultsCount: 0,
      pairedAdultsCount: null,
      unpairedAdultsCount: null,
    });
    db.loonObservation.update.mockResolvedValue({ id: "o1" });

    await PATCH(
      makeRequest("/api/loons", {
        method: "PATCH",
        body: {
          id: "o1",
          removedImagePublicIds: ["pid1", "not-on-record"],
        },
      })
    );

    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("pid1");
    expect(deleteCloudinaryImageMock).not.toHaveBeenCalledWith("not-on-record");
  });
});

describe("DELETE /api/loons", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await DELETE(
      makeRequest("/api/loons", {
        method: "DELETE",
        searchParams: { id: "o1" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when id missing", async () => {
    setSession({ user: { id: "u1" } });
    const res = await DELETE(
      makeRequest("/api/loons", { method: "DELETE" })
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 when observation not found", async () => {
    setSession({ user: { id: "u1" } });
    db.loonObservation.findUnique.mockResolvedValue(null);
    const res = await DELETE(
      makeRequest("/api/loons", {
        method: "DELETE",
        searchParams: { id: "o1" },
      })
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when neither owner nor admin", async () => {
    setSession({ user: { id: "stranger" } });
    db.loonObservation.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicIds: ["pid1"],
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });

    const res = await DELETE(
      makeRequest("/api/loons", {
        method: "DELETE",
        searchParams: { id: "o1" },
      })
    );
    expect(res.status).toBe(403);
    expect(db.loonObservation.delete).not.toHaveBeenCalled();
    expect(deleteCloudinaryImageMock).not.toHaveBeenCalled();
  });

  it("deletes when owner: removes all images from cloudinary then DB row", async () => {
    setSession({ user: { id: "owner" } });
    db.loonObservation.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicIds: ["pid1", "pid2"],
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });
    db.loonObservation.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/loons", {
        method: "DELETE",
        searchParams: { id: "o1" },
      })
    );
    expect(res.status).toBe(200);
    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("pid1");
    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("pid2");
    expect(db.loonObservation.delete).toHaveBeenCalledWith({
      where: { id: "o1" },
    });
  });

  it("admin can delete another user's observation", async () => {
    setSession({ user: { id: "admin" } });
    db.loonObservation.findUnique.mockResolvedValue({
      userId: "owner",
      imagePublicIds: [],
    });
    db.user.findUnique.mockResolvedValue({ isAdmin: true });
    db.loonObservation.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/loons", {
        method: "DELETE",
        searchParams: { id: "o1" },
      })
    );
    expect(res.status).toBe(200);
  });
});
