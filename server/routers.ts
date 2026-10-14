import { COOKIE_NAME } from "@shared/const";
import { desc } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { changelogEntries } from "../drizzle/schema";
import { marketRouter } from "./routers/market";
import { newsletterRouter } from "./routers/newsletter";
import { z } from "zod";

// Comprehensive spending data context for the LLM
const SPENDING_DATA_CONTEXT = `You are an AI analyst for the Tech Spending Monitor. Answer questions using ONLY the data below. Be precise, cite specific numbers, and note when data may be estimates vs. confirmed figures.

## TOP 8 INFRASTRUCTURE SPENDERS (2026 Capex)
1. Amazon (AMZN): $200B capex, $640B revenue, AWS 28% growth, $119B long-term debt, FCF turning negative Q1 2026
2. Microsoft (MSFT): $190B capex, $280B revenue, Azure 40% growth, $273B total liabilities + $100B off-balance sheet SPV, Spend/Revenue ratio 5:1
3. Alphabet (GOOGL): $185B capex, $420B revenue, Google Cloud 63% growth (fastest), $95B on-balance liabilities
4. Meta (META): $130B capex, $180B revenue, self-funded from ad revenue, Reality Labs -$15B/year, 3.3B daily users
5. Oracle (ORCL): $50B capex, $67.4B revenue, OCI 93% growth, NEGATIVE $24B FCF, 500% debt-to-equity, CDS at GFC levels, $553B backlog
6. SpaceX (SPCX): $21B capex, IPO'd June 12 2026 ($75B raise), $25B bond deal June 23 ($89B demand), $2.0T market cap, Starlink 5M+ subs, xAI Colossus 200K H100s
7. NVIDIA (NVDA): $12B R&D-heavy capex, $81.6B Q1 FY2027 revenue, Q2 guidance $91B, 78% data center GPU share, $3.6T market cap
8. TSMC (TSM): $38-40B capex, CoWoS supply-demand gap narrowing 20%→10% by end 2026, 4x capacity expansion, $1.1T market cap

## KEY MACRO METRICS
- Goldman Sachs AI Capex 2026: $757B (+84% YoY)
- Evercore 2027 projection: $1T
- J.P. Morgan Revenue Gap: $600B (capex vs. AI revenue generated)
- Morgan Stanley Cumulative 2025-28: $3T total infrastructure spend
- Man Group: Current spending is 5.5x the dot-com peak (inflation-adjusted)
- Power Shortfall: 85% of planned data centers face electricity constraints
- Gartner Total IT Spending 2026: $6.31T (+10.8% YoY)
- Debt Maturity Wall: $330B of tech sector debt maturing by 2028
- Samsung $648B decade blueprint for semiconductors + AI

## MARKET DATA (June 2026)
- NVDA: $152.45, Market Cap $3.6T
- MSFT: $478.92, Market Cap $3.5T
- GOOGL: $198.34, Market Cap $2.4T
- AMZN: $215.67, Market Cap $2.2T
- META: $612.89, Market Cap $1.5T
- ORCL: $150.26, Market Cap $420B
- TSM: $215.80, Market Cap $1.1T
- SPCX: $152.80, Market Cap $2.0T

## SUPPLY CHAIN BOTTLENECKS (Cascade Order)
1. Power Grid → 85% shortfall, 26% demand growth in 2026
2. TSMC CoWoS → Advanced packaging, gap narrowing to 10%
3. ABF Substrates → 18-month lead times
4. HBM Memory → Micron/SK Hynix fully booked through 2027
5. Liquid Cooling → $25B market by 2028, 80% of new racks

## RISK FACTORS
- Jevons Paradox: Efficiency improvements accelerate spending (not reduce it)
- Oracle CDS spreads at Global Financial Crisis levels
- Aggregate Big 6 FCF crosses zero in Q3 2026 (Epoch AI estimate)
- 15+ US data center moratoriums proposed or enacted
- AI contributing ~1% to GDP (masking weakness in other sectors)
- Enterprise budget backlash: 40% of CIOs report "AI fatigue" in spending approvals

## FEEDBACK LOOPS
1. AI Demand → GPU Shortage → Price Inflation → Higher Capex
2. Efficiency Gains → Lower Cost Per Query → More Usage → More Capex (Jevons)
3. Power Constraint → Nuclear/SMR Investment → 5-7 Year Lag → Continued Shortage
4. Debt Issuance → Higher Rates → Refinancing Risk → Potential Capex Cuts
5. Open Source (Llama) → Commoditization → Race to Scale → Even More Capex
6. Starlink Connectivity → Remote DC Feasibility → More DC Construction → More Power Need

## CIRCULAR FINANCING RISK (NVIDIA → NEOCLOUDS)
NVIDIA has invested $2B in CoreWeave and $2B in Nebius. These neoclouds then use the capital to buy NVIDIA GPUs, creating a circular revenue loop.
- CoreWeave: $35B total debt, $51B total liabilities, $536M/quarter interest expense. Revenue $2.08B/qtr. Debt-to-equity: 1200%. Interest exceeds revenue.
- Nebius: $15B total liabilities (up 1,040% YoY), $10.04B convertible notes accreting to 120% of principal at maturity. $63.7M/qtr interest. Revenue $399M/qtr.
- Historical parallels: Lucent 1999 ($7B vendor financing, $80B market cap loss), Cisco 2000 ($2.2B write-off), Nortel 2001 ($4.3B, complete wipeout).
- Microsoft committed ~$60B to neoclouds (CoreWeave + Nebius + others). Meta committed $62.2B ($35.2B CoreWeave + $27B Nebius).
- If NVIDIA cuts funding or demand slips: CoreWeave cannot service debt → defaults trigger cross-acceleration → NVIDIA loses both investment AND revenue stream → GPU oversupply.
- Cascade scenario: Demand slowdown → Neocloud revenue miss → Debt covenant breach → Forced asset sales → GPU price collapse → NVIDIA revenue hit → Stock decline → Further neocloud funding freeze.

## DEBT MATURITY WALL (CRITICAL REFINANCING WINDOWS)
- Oracle: $8.5B senior notes due July 24, 2026 (IMMINENT). $12B due Q2 2027. Total $95B planned debt/equity raise for capex.
- CoreWeave: $7.6B DDTL 4.0 matures Jan 2027 (CRITICAL). $4.5B secured notes Q2 2028. $5B convertibles Q1 2029. Total $35B debt.
- Nebius: $2.7B convertible notes Q3 2028 (accrete to 120%). $3B Series B Q1 2029. $4.34B Mar 2026 notes in 2031/2033.
- Combined quarterly interest burn: $3.4B/quarter ($2.8B Oracle + $536M CoreWeave + $63.7M Nebius).
- Critical window: $20.5B due within 12 months (Jul 2026 - Jul 2027).
- Bear case: AI demand plateau + credit tightening = spreads widen 200-400bps, forced dilution or asset sales.
- Bull case: Revenue scales 2-3x, credit improves, refinance at lower spreads. CoreWeave targets investment-grade by 2028.`;

export const appRouter = router({
  system: systemRouter,
  market: marketRouter,
  newsletter: newsletterRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  changelog: router({
    /** Fetch recent changelog entries from the database */
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
      .query(async ({ input }) => {
        const dbInstance = await getDb();
        if (!dbInstance) {
          return { entries: [], source: "static" };
        }
        const limit = input?.limit ?? 50;
        const entries = await dbInstance
          .select()
          .from(changelogEntries)
          .orderBy(desc(changelogEntries.createdAt))
          .limit(limit);
        return { entries, source: "database" };
      }),
  }),

  ai: router({
    search: publicProcedure
      .input(z.object({ query: z.string().min(1).max(500) }))
      .mutation(async ({ input }) => {
        try {
          const result = await invokeLLM({
            messages: [
              {
                role: "system",
                content: SPENDING_DATA_CONTEXT,
              },
              {
                role: "user",
                content: input.query,
              },
            ],
            maxTokens: 1000,
          });

          const answer = result.choices[0]?.message?.content;
          if (!answer || typeof answer !== "string") {
            return { answer: "I couldn't generate a response. Please try rephrasing your question.", success: false };
          }

          return { answer, success: true };
        } catch (error) {
          console.error("[AI Search] LLM invocation failed:", error);
          return {
            answer: "The AI service is temporarily unavailable. Please try again in a moment.",
            success: false,
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
