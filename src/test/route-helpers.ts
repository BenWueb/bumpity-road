import { NextRequest } from "next/server";

type RequestInit = {
  method?: string;
  body?: unknown;
  searchParams?: Record<string, string>;
};

/**
 * Build a NextRequest for testing API route handlers directly.
 * `body` (if provided) is JSON-stringified and sent with content-type:application/json.
 */
export function makeRequest(url: string, init?: RequestInit): NextRequest {
  const u = new URL(url, "http://localhost");
  for (const [k, v] of Object.entries(init?.searchParams ?? {})) {
    u.searchParams.set(k, v);
  }
  return new NextRequest(u, {
    method: init?.method ?? "GET",
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    headers: { "content-type": "application/json" },
  });
}

/** Convenience: read a NextResponse JSON body. */
export async function readJson<T = unknown>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

type SessionShape = { user: { id: string } } | null;

/**
 * Set up the standard mock surface for an API route test:
 *   - `next/headers` returns an empty Headers
 *   - `next/cache` revalidatePath is a no-op
 *   - `@/utils/auth`'s getSession is mockable
 *
 * Call this at the top of a route test file BEFORE importing the route module:
 *
 *   jest.mock("next/headers", () => ({ headers: async () => new Headers() }));
 *   jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
 *   jest.mock("@/utils/auth", () => ({
 *     auth: { api: { getSession: jest.fn() } },
 *   }));
 *
 * Then in tests use `setSession(...)` from this module to flip the session.
 */
export function getAuthMock(): { api: { getSession: jest.Mock } } {
  const mod = jest.requireMock("@/utils/auth") as {
    auth: { api: { getSession: jest.Mock } };
  };
  return mod.auth;
}

export function setSession(session: SessionShape): void {
  getAuthMock().api.getSession.mockResolvedValue(session);
}
