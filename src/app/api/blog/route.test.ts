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
    post: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    postImage: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));
jest.mock("@/utils/badges", () => ({
  checkAndAwardBlogBadges: jest.fn(),
}));
jest.mock("@/utils/cloudinary", () => ({
  deleteCloudinaryImages: jest.fn(),
}));

import { POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { checkAndAwardBlogBadges } from "@/utils/badges";
import { deleteCloudinaryImages } from "@/utils/cloudinary";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  post: {
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  postImage: {
    findMany: jest.Mock;
    createMany: jest.Mock;
    deleteMany: jest.Mock;
  };
};
const checkAndAwardBlogBadgesMock = checkAndAwardBlogBadges as jest.Mock;
const deleteCloudinaryImagesMock = deleteCloudinaryImages as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  checkAndAwardBlogBadgesMock.mockResolvedValue([]);
});

describe("POST /api/blog", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await POST(
      makeRequest("/api/blog", {
        method: "POST",
        body: { title: "T", content: "C" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when title or content is blank", async () => {
    setSession({ user: { id: "u1" } });
    let res = await POST(
      makeRequest("/api/blog", {
        method: "POST",
        body: { title: "  ", content: "C" },
      })
    );
    expect(res.status).toBe(400);

    res = await POST(
      makeRequest("/api/blog", {
        method: "POST",
        body: { title: "T", content: "  " },
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates the post with trimmed fields and a generated slug", async () => {
    setSession({ user: { id: "u1", email: "u1@example.com" } });
    db.post.create.mockResolvedValue({ id: "p1", slug: "hello-world-abc" });

    await POST(
      makeRequest("/api/blog", {
        method: "POST",
        body: {
          title: "  Hello World  ",
          content: "  body  ",
        },
      })
    );

    const data = db.post.create.mock.calls[0][0].data;
    expect(data.title).toBe("Hello World");
    expect(data.content).toBe("body");
    expect(typeof data.slug).toBe("string");
    expect(data.slug.startsWith("hello-world")).toBe(true);
    expect(data.userId).toBe("u1");
  });

  it("calls checkAndAwardBlogBadges with the session user and returns newBadges", async () => {
    setSession({ user: { id: "u1" } });
    db.post.create.mockResolvedValue({ id: "p1", slug: "s" });
    checkAndAwardBlogBadgesMock.mockResolvedValue(["BLOGGER_FIRST"]);

    const res = await POST(
      makeRequest("/api/blog", {
        method: "POST",
        body: { title: "T", content: "C" },
      })
    );
    const body = await res.json();
    expect(checkAndAwardBlogBadgesMock).toHaveBeenCalledWith("u1");
    expect(body.newBadges).toEqual(["BLOGGER_FIRST"]);
  });
});

describe("PATCH /api/blog", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await PATCH(
      makeRequest("/api/blog", { method: "PATCH", body: { id: "p1" } })
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when not the post owner", async () => {
    setSession({ user: { id: "stranger" } });
    db.post.findUnique.mockResolvedValue({ id: "p1", userId: "owner" });

    const res = await PATCH(
      makeRequest("/api/blog", {
        method: "PATCH",
        body: { id: "p1", title: "x" },
      })
    );
    expect(res.status).toBe(403);
    expect(db.post.update).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/blog", () => {
  it("returns 401 when not logged in", async () => {
    setSession(null);
    const res = await DELETE(
      makeRequest("/api/blog", {
        method: "DELETE",
        searchParams: { id: "p1" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when post not found", async () => {
    setSession({ user: { id: "u1" } });
    db.post.findUnique.mockResolvedValue(null);
    const res = await DELETE(
      makeRequest("/api/blog", {
        method: "DELETE",
        searchParams: { id: "p1" },
      })
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 when neither owner nor admin", async () => {
    setSession({ user: { id: "stranger" } });
    db.post.findUnique.mockResolvedValue({ id: "p1", userId: "owner" });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });

    const res = await DELETE(
      makeRequest("/api/blog", {
        method: "DELETE",
        searchParams: { id: "p1" },
      })
    );
    expect(res.status).toBe(403);
    expect(db.post.delete).not.toHaveBeenCalled();
  });

  it("calls deleteCloudinaryImages with all image publicIds BEFORE deleting the post (owner)", async () => {
    setSession({ user: { id: "owner" } });
    db.post.findUnique.mockResolvedValue({ id: "p1", userId: "owner" });
    db.user.findUnique.mockResolvedValue({ isAdmin: false });
    db.postImage.findMany.mockResolvedValue([
      { publicId: "pid1" },
      { publicId: "pid2" },
    ]);
    db.post.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/blog", {
        method: "DELETE",
        searchParams: { id: "p1" },
      })
    );
    expect(res.status).toBe(200);
    expect(deleteCloudinaryImagesMock).toHaveBeenCalledWith(["pid1", "pid2"]);

    const cloudinaryOrder = deleteCloudinaryImagesMock.mock.invocationCallOrder[0];
    const dbDeleteOrder = db.post.delete.mock.invocationCallOrder[0];
    expect(cloudinaryOrder).toBeLessThan(dbDeleteOrder);
  });

  it("admin can delete another user's post", async () => {
    setSession({ user: { id: "admin" } });
    db.post.findUnique.mockResolvedValue({ id: "p1", userId: "owner" });
    db.user.findUnique.mockResolvedValue({ isAdmin: true });
    db.postImage.findMany.mockResolvedValue([]);
    db.post.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/blog", {
        method: "DELETE",
        searchParams: { id: "p1" },
      })
    );
    expect(res.status).toBe(200);
    expect(db.post.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});
