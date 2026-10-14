import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { insertSubscriber } from "../db";

/** Walk the error cause chain and detect a MySQL duplicate-key violation. */
function isDuplicateEntryError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth++) {
    if (typeof current === "object" && current !== null) {
      const err = current as { code?: string; errno?: number; message?: string; cause?: unknown };
      if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) return true;
      if (typeof err.message === "string" && err.message.includes("Duplicate entry")) return true;
      current = err.cause;
    } else {
      break;
    }
  }
  return false;
}

/**
 * Newsletter subscription router. The subscribe mutation is public (no auth),
 * validates the email, normalizes it, and handles duplicates gracefully so the
 * form always gives friendly feedback.
 */
export const newsletterRouter = router({
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().trim().toLowerCase().pipe(z.string().email("Invalid email address")).pipe(z.string().max(320)),
        source: z.enum(["landing", "dashboard"]).default("landing"),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const inserted = await insertSubscriber({
          email: input.email,
          source: input.source,
          status: "active",
        });
        if (!inserted) {
          throw new Error("Subscription is temporarily unavailable. Please try again later.");
        }
        return { ok: true, alreadySubscribed: false } as const;
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("temporarily unavailable")) {
          throw error;
        }
        // MySQL duplicate key → treat as success (idempotent subscribe)
        if (isDuplicateEntryError(error)) {
          return { ok: true, alreadySubscribed: true } as const;
        }
        console.error("[Newsletter] Failed to insert subscriber:", error);
        throw new Error("Could not save your subscription. Please try again.");
      }
    }),
});
