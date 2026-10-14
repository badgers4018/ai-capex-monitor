import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    id: "test-id",
    created: Date.now(),
    model: "test-model",
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: "Amazon has the highest 2026 capex at $200B.",
        },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("ai.search", () => {
  it("returns an AI-powered answer for a valid query", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.search({ query: "Who has the highest capex?" });

    expect(result.success).toBe(true);
    expect(result.answer).toContain("Amazon");
    expect(result.answer).toContain("$200B");
  });

  it("rejects empty queries", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.ai.search({ query: "" })).rejects.toThrow();
  });

  it("rejects queries exceeding 500 characters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const longQuery = "a".repeat(501);
    await expect(caller.ai.search({ query: longQuery })).rejects.toThrow();
  });

  it("handles LLM failure gracefully", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const mockedInvokeLLM = vi.mocked(invokeLLM);
    mockedInvokeLLM.mockRejectedValueOnce(new Error("LLM service unavailable"));

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.search({ query: "test query" });

    expect(result.success).toBe(false);
    expect(result.answer).toContain("temporarily unavailable");
  });
});
