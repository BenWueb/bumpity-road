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
    expense: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock("@/utils/cloudinary", () => ({
  deleteCloudinaryImage: jest.fn(),
}));
jest.mock("@/lib/expenses-server", () => ({
  expenseInclude: {},
  transformExpense: jest.fn((e: unknown) => e),
}));

import { GET, POST, PATCH, DELETE } from "./route";
import { prisma } from "@/utils/prisma";
import { deleteCloudinaryImage } from "@/utils/cloudinary";
import { makeRequest, setSession } from "@/test/route-helpers";

const db = prisma as unknown as {
  user: { findUnique: jest.Mock };
  expense: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};
const deleteCloudinaryImageMock = deleteCloudinaryImage as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

function asAdmin() {
  setSession({ user: { id: "admin" } });
  db.user.findUnique.mockResolvedValue({ isAdmin: true });
}
function asUser() {
  setSession({ user: { id: "user" } });
  db.user.findUnique.mockResolvedValue({ isAdmin: false });
}

describe("admin gating", () => {
  describe("GET /api/expenses", () => {
    it("401 when not logged in", async () => {
      setSession(null);
      const res = await GET();
      expect(res.status).toBe(401);
    });

    it("403 when logged in but not admin", async () => {
      asUser();
      const res = await GET();
      expect(res.status).toBe(403);
    });

    it("200 when admin", async () => {
      asAdmin();
      db.expense.findMany.mockResolvedValue([]);
      const res = await GET();
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/expenses", () => {
    it("401 when not logged in", async () => {
      setSession(null);
      const res = await POST(
        makeRequest("/api/expenses", { method: "POST", body: {} })
      );
      expect(res.status).toBe(401);
    });

    it("403 when logged in but not admin", async () => {
      asUser();
      const res = await POST(
        makeRequest("/api/expenses", { method: "POST", body: {} })
      );
      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/expenses", () => {
    it("401 when not logged in", async () => {
      setSession(null);
      const res = await PATCH(
        makeRequest("/api/expenses", { method: "PATCH", body: { id: "e1" } })
      );
      expect(res.status).toBe(401);
    });

    it("403 when logged in but not admin", async () => {
      asUser();
      const res = await PATCH(
        makeRequest("/api/expenses", { method: "PATCH", body: { id: "e1" } })
      );
      expect(res.status).toBe(403);
    });
  });

  describe("DELETE /api/expenses", () => {
    it("401 when not logged in", async () => {
      setSession(null);
      const res = await DELETE(
        makeRequest("/api/expenses", {
          method: "DELETE",
          searchParams: { id: "e1" },
        })
      );
      expect(res.status).toBe(401);
    });

    it("403 when logged in but not admin", async () => {
      asUser();
      const res = await DELETE(
        makeRequest("/api/expenses", {
          method: "DELETE",
          searchParams: { id: "e1" },
        })
      );
      expect(res.status).toBe(403);
    });
  });
});

describe("POST /api/expenses (admin) — validation", () => {
  beforeEach(() => {
    asAdmin();
  });

  it("400 when title is blank", async () => {
    const res = await POST(
      makeRequest("/api/expenses", {
        method: "POST",
        body: { title: "  ", cost: 10, category: "utilities", date: "2024-01-01" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("400 when cost is missing or negative", async () => {
    let res = await POST(
      makeRequest("/api/expenses", {
        method: "POST",
        body: { title: "T", category: "utilities", date: "2024-01-01" },
      })
    );
    expect(res.status).toBe(400);

    res = await POST(
      makeRequest("/api/expenses", {
        method: "POST",
        body: {
          title: "T",
          cost: -1,
          category: "utilities",
          date: "2024-01-01",
        },
      })
    );
    expect(res.status).toBe(400);
  });

  it("400 when date missing for an incurred expense", async () => {
    const res = await POST(
      makeRequest("/api/expenses", {
        method: "POST",
        body: { title: "T", cost: 10, category: "utilities" },
      })
    );
    expect(res.status).toBe(400);
  });

  it("allows missing date when isPlanned=true", async () => {
    db.expense.create.mockResolvedValue({ id: "e1" });
    const res = await POST(
      makeRequest("/api/expenses", {
        method: "POST",
        body: {
          title: "T",
          cost: 10,
          category: "utilities",
          isPlanned: true,
        },
      })
    );
    expect(res.status).toBe(200);
  });

  it("400 when category is invalid", async () => {
    const res = await POST(
      makeRequest("/api/expenses", {
        method: "POST",
        body: {
          title: "T",
          cost: 10,
          category: "not_a_category",
          date: "2024-01-01",
        },
      })
    );
    expect(res.status).toBe(400);
  });

  it("creates the expense tied to the admin userId on valid input", async () => {
    db.expense.create.mockResolvedValue({ id: "e1" });

    await POST(
      makeRequest("/api/expenses", {
        method: "POST",
        body: {
          title: "  Dock repair  ",
          cost: 250,
          category: "marine",
          date: "2024-01-01",
        },
      })
    );

    const data = db.expense.create.mock.calls[0][0].data;
    expect(data.title).toBe("Dock repair");
    expect(data.userId).toBe("admin");
    expect(data.category).toBe("marine");
    expect(data.date).toBeInstanceOf(Date);
  });
});

describe("DELETE /api/expenses (admin)", () => {
  beforeEach(() => {
    asAdmin();
  });

  it("400 when id missing", async () => {
    const res = await DELETE(
      makeRequest("/api/expenses", { method: "DELETE" })
    );
    expect(res.status).toBe(400);
  });

  it("404 when not found", async () => {
    db.expense.findUnique.mockResolvedValue(null);
    const res = await DELETE(
      makeRequest("/api/expenses", {
        method: "DELETE",
        searchParams: { id: "e1" },
      })
    );
    expect(res.status).toBe(404);
  });

  it("deletes the cloudinary receipt before the DB row when present", async () => {
    db.expense.findUnique.mockResolvedValue({
      id: "e1",
      receiptImagePublicId: "pid",
    });
    db.expense.delete.mockResolvedValue({});

    const res = await DELETE(
      makeRequest("/api/expenses", {
        method: "DELETE",
        searchParams: { id: "e1" },
      })
    );
    expect(res.status).toBe(200);
    expect(deleteCloudinaryImageMock).toHaveBeenCalledWith("pid");
    expect(db.expense.delete).toHaveBeenCalledWith({ where: { id: "e1" } });
  });

  it("does not call cloudinary when no receipt is present", async () => {
    db.expense.findUnique.mockResolvedValue({
      id: "e1",
      receiptImagePublicId: null,
    });
    db.expense.delete.mockResolvedValue({});

    await DELETE(
      makeRequest("/api/expenses", {
        method: "DELETE",
        searchParams: { id: "e1" },
      })
    );
    expect(deleteCloudinaryImageMock).not.toHaveBeenCalled();
  });
});
