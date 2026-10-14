import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the db module before importing the router
const insertValuesMock = vi.fn();
const getDbMock = vi.fn();

vi.mock("./db", () => ({
  getDb: (...args: unknown[]) => getDbMock(...args),
  insertSubscriber: async (subscriber: unknown) => {
    const db = await getDbMock();
    if (!db) return false;
    await insertValuesMock(subscriber);
    return true;
  },
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function mockDbWith(insertImpl: (values: unknown) => Promise<unknown>) {
  insertValuesMock.mockImplementation(insertImpl);
  getDbMock.mockResolvedValue({
    insert: () => ({ values: insertValuesMock }),
  });
}

describe("newsletter.subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves a new subscriber and returns ok", async () => {
    mockDbWith(async () => undefined);
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.newsletter.subscribe({ email: "Investor@Example.com", source: "landing" });

    expect(result).toEqual({ ok: true, alreadySubscribed: false });
    expect(insertValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "investor@example.com", // normalized to lowercase
        source: "landing",
        status: "active",
      }),
    );
  });

  it("treats duplicate emails as idempotent success", async () => {
    mockDbWith(async () => {
      throw new Error("Duplicate entry 'investor@example.com' for key 'subscribers_email_unique'");
    });
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.newsletter.subscribe({ email: "investor@example.com", source: "dashboard" });

    expect(result).toEqual({ ok: true, alreadySubscribed: true });
  });

  it("detects duplicates wrapped in a Drizzle error cause chain", async () => {
    mockDbWith(async () => {
      const inner = Object.assign(new Error("Duplicate entry '?' for key 'subscribers.subscribers_email_unique'"), {
        code: "ER_DUP_ENTRY",
        errno: 1062,
      });
      const wrapper = new Error("Failed query: insert into `subscribers` ...");
      (wrapper as Error & { cause?: unknown }).cause = inner;
      throw wrapper;
    });
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.newsletter.subscribe({ email: "investor@example.com", source: "landing" });

    expect(result).toEqual({ ok: true, alreadySubscribed: true });
  });

  it("rejects invalid email addresses", async () => {
    mockDbWith(async () => undefined);
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.newsletter.subscribe({ email: "not-an-email", source: "landing" })).rejects.toThrow();
    expect(insertValuesMock).not.toHaveBeenCalled();
  });

  it("surfaces a friendly error when the database is unavailable", async () => {
    getDbMock.mockResolvedValue(null);
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.newsletter.subscribe({ email: "investor@example.com", source: "landing" })).rejects.toThrow(
      /temporarily unavailable/i,
    );
  });

  it("surfaces a friendly error on unexpected database failures", async () => {
    mockDbWith(async () => {
      throw new Error("Connection reset by peer");
    });
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.newsletter.subscribe({ email: "investor@example.com", source: "landing" })).rejects.toThrow(
      /could not save/i,
    );
  });
});
