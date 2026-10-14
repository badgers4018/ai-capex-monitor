/**
 * Weekly Autoresearch Refresh Handlers
 * 
 * Two endpoints:
 * 1. /api/scheduled/weekly-refresh — Called by Heartbeat cron every Sunday.
 *    Uses LLM to generate research status updates, stores them in DB as changelog entries,
 *    and notifies the project owner.
 * 2. /api/scheduled/agent-research-callback — Called by AGENT cron after deep research.
 *    Receives structured findings and stores them as changelog entries.
 */
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { changelogEntries, refreshRuns } from "../drizzle/schema";

const RESEARCH_TOPICS = [
  { key: "NVIDIA", prompt: "NVIDIA quarterly earnings, revenue trajectory, and forward guidance" },
  { key: "CoreWeave", prompt: "CoreWeave financial health: revenue, backlog, debt levels, customer concentration" },
  { key: "Nebius", prompt: "Nebius Group expansion: Meta partnership, Nvidia investment, power capacity" },
  { key: "Amazon", prompt: "Amazon Web Services capex execution: quarterly spend, data center buildout" },
  { key: "Microsoft", prompt: "Microsoft Azure capacity: quarterly capex, AI revenue run rate" },
  { key: "Alphabet", prompt: "Alphabet Google Cloud growth: revenue, backlog, capex guidance" },
  { key: "Meta", prompt: "Meta Platforms infrastructure: custom chips, capex guidance, GW targets" },
  { key: "Oracle", prompt: "Oracle Cloud growth: OCI revenue, RPO, free cash flow, debt raises" },
  { key: "Power Grid", prompt: "Power grid constraints: data center delays, transformer shortages, energy deals" },
  { key: "Semiconductors", prompt: "Semiconductor supply chain: TSMC CoWoS, AMD MI-series, Broadcom custom ASICs" },
];

/**
 * Handler for /api/scheduled/weekly-refresh
 * Called by Heartbeat cron every Sunday at 06:00 UTC.
 * Generates LLM-based research updates and stores them as changelog entries.
 */
export async function weeklyRefreshHandler(req: Request, res: Response) {
  try {
    // Authenticate — only cron system can call this
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    console.log(`[Weekly Refresh] Starting refresh at ${new Date().toISOString()}, taskUid: ${user.taskUid}`);

    // Create a refresh run record
    const dbInstance = await getDb();
    if (!dbInstance) {
      return res.status(500).json({ error: "Database not available", timestamp: new Date().toISOString() });
    }

    const [runResult] = await dbInstance.insert(refreshRuns).values({
      taskUid: user.taskUid,
      status: "running",
      topicsProcessed: 0,
    });
    const runId = runResult.insertId;

    // Use LLM to generate research status updates
    const summaryPrompt = `You are an AI research analyst monitoring the AI infrastructure capex supercycle as of ${new Date().toISOString().split("T")[0]}.
Generate a research status update for each of the following 10 topics.
For each topic, provide:
- headline: A concise one-line headline (max 120 chars) with the most important recent development
- detail: 1-2 sentences of context with specific numbers
- signal: "bullish", "bearish", or "neutral" for the AI capex thesis
- source: Brief source attribution (e.g., "Q1 2026 Earnings Call", "SEC Filing", "Industry Report")

Topics:
${RESEARCH_TOPICS.map((t, i) => `${i + 1}. [${t.key}] ${t.prompt}`).join("\n")}

Be specific with numbers, dates, and company names. Base on the latest available information.`;

    const llmResponse = await invokeLLM({
      messages: [
        { role: "system", content: "You are a financial research analyst specializing in AI infrastructure spending. Return valid JSON only." },
        { role: "user", content: summaryPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "research_update",
          strict: true,
          schema: {
            type: "object",
            properties: {
              updates: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    tag: { type: "string", description: "Topic key (e.g., NVIDIA, CoreWeave)" },
                    headline: { type: "string", description: "One-line headline" },
                    detail: { type: "string", description: "1-2 sentences of context" },
                    signal: { type: "string", enum: ["bullish", "bearish", "neutral"] },
                    source: { type: "string", description: "Brief source attribution" },
                  },
                  required: ["tag", "headline", "detail", "signal", "source"],
                  additionalProperties: false,
                },
              },
              summary: { type: "string", description: "Overall market summary in 2-3 sentences" },
            },
            required: ["updates", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = llmResponse.choices?.[0]?.message?.content;
    const content = typeof rawContent === "string"
      ? rawContent
      : Array.isArray(rawContent)
        ? rawContent.map((c: { type: string; text?: string }) => c.type === "text" ? c.text : "").join("")
        : "";

    let parsed: {
      updates: Array<{ tag: string; headline: string; detail: string; signal: "bullish" | "bearish" | "neutral"; source: string }>;
      summary: string;
    } | null = null;

    try {
      parsed = JSON.parse(content || "{}");
    } catch {
      console.error("[Weekly Refresh] Failed to parse LLM response");
      await dbInstance.update(refreshRuns)
        .set({ status: "failed", errorMessage: "Failed to parse LLM response", completedAt: new Date() })
        .where(eq(refreshRuns.id, runId));
      return res.status(500).json({ error: "LLM parse failure", timestamp: new Date().toISOString() });
    }

    if (!parsed || !parsed.updates || parsed.updates.length === 0) {
      await dbInstance.update(refreshRuns)
        .set({ status: "failed", errorMessage: "Empty LLM response", completedAt: new Date() })
        .where(eq(refreshRuns.id, runId));
      return res.status(500).json({ error: "Empty LLM response", timestamp: new Date().toISOString() });
    }

    // Format today's date for the changelog entries
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Insert changelog entries into the database
    const entries = parsed.updates.map((u) => ({
      date: dateStr,
      tag: u.tag,
      headline: u.headline,
      detail: u.detail,
      signal: u.signal as "bullish" | "bearish" | "neutral",
      source: u.source,
      refreshRunId: runId,
    }));

    await dbInstance.insert(changelogEntries).values(entries);

    // Update the refresh run as completed
    await dbInstance.update(refreshRuns)
      .set({
        status: "completed",
        topicsProcessed: parsed.updates.length,
        summary: parsed.summary,
        completedAt: new Date(),
      })
      .where(eq(refreshRuns.id, runId));

    // Notify the project owner
    const notificationContent = `Weekly AI Capex Monitor Refresh Complete\n\n${parsed.summary}\n\nKey Updates:\n${parsed.updates.map((u) => `• [${u.signal.toUpperCase()}] ${u.tag}: ${u.headline}`).join("\n")}\n\n${parsed.updates.length} new changelog entries added.\nTimestamp: ${new Date().toISOString()}`;

    await notifyOwner({
      title: "Weekly AI Capex Research Refresh",
      content: notificationContent,
    });

    console.log(`[Weekly Refresh] Completed: ${parsed.updates.length} entries stored, run ID: ${runId}`);

    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      runId,
      topicsProcessed: parsed.updates.length,
      summary: parsed.summary,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[Weekly Refresh] Error:", err.message);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handler for /api/scheduled/agent-research-callback
 * Called by AGENT cron after it completes deep research.
 * Stores findings as changelog entries and notifies the owner.
 */
export async function agentResearchCallbackHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const { findings } = req.body as {
      findings?: Array<{
        tag: string;
        headline: string;
        detail?: string;
        signal?: "bullish" | "bearish" | "neutral";
        source?: string;
      }>;
    };

    if (!findings || !Array.isArray(findings) || findings.length === 0) {
      return res.status(400).json({ error: "Missing or empty findings array" });
    }

    console.log(`[Agent Research] Received ${findings.length} findings at ${new Date().toISOString()}`);

    // Format today's date
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    // Insert findings as changelog entries
    const entries = findings.map((f) => ({
      date: dateStr,
      tag: f.tag || "Research",
      headline: f.headline,
      detail: f.detail || null,
      signal: (f.signal || "neutral") as "bullish" | "bearish" | "neutral",
      source: f.source || "AGENT Deep Research",
      refreshRunId: null,
    }));

    const dbInstance2 = await getDb();
    if (!dbInstance2) {
      return res.status(500).json({ error: "Database not available", timestamp: new Date().toISOString() });
    }

    await dbInstance2.insert(changelogEntries).values(entries);

    // Notify owner
    await notifyOwner({
      title: `Deep Research: ${findings.length} New Findings`,
      content: findings.map((f) => `• [${(f.signal || "neutral").toUpperCase()}] ${f.tag}: ${f.headline}`).join("\n"),
    });

    res.json({ ok: true, entriesStored: findings.length, receivedAt: new Date().toISOString() });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("[Agent Research Callback] Error:", err.message);
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
