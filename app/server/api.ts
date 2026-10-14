import express from 'express';
import cookieParser from 'cookie-parser';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { z } from 'zod';
import { login, authenticate, roleGuard, csrf, logout, loopbackHost } from './auth.js';
import { ServiceError, pools, sourceConfig } from './core.js';
import { registerSources, ingestSource } from './ingestion.js';
import {
  projects,
  projectDetail,
  caseList,
  caseDetail,
  sources,
  reviewQueue,
  reviewClaim,
  entities,
  entityDetail,
  changes,
  cutoffs,
} from './projections.js';
import { exportReports, artifactFile, weeklyAppendix, weeklyTape } from './reports.js';
const pagination = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().max(200).default(''),
});
const reviewSchema = z
  .object({
    decision: z.enum(['accepted', 'rejected', 'needs_review']),
    rationale: z.string().trim().min(5).max(2000),
  })
  .strict();
const proposalSchema = z
  .object({
    fact_kind: z.enum(['relationship', 'participation']),
    entity_id: z.string().uuid().optional(),
    entity_name: z.string().min(2).max(200).optional(),
    parent_id: z.string().uuid().optional(),
    parent_name: z.string().min(2).max(200).optional(),
    relationship_kind: z
      .enum(['controls', 'equity_owner', 'voting_owner', 'consolidates', 'managed_by'])
      .optional(),
    target_id: z.string().uuid().optional(),
    role: z
      .enum([
        'landowner',
        'asset_owner',
        'developer',
        'operator',
        'tenant',
        'applicant',
        'contractor',
        'lender',
        'sponsor',
        'registered_agent',
      ])
      .optional(),
    source_url: z
      .string()
      .url()
      .max(2000)
      .refine((s) => s.startsWith('https://')),
    quotation: z.string().min(20).max(10000),
    valid_from: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    valid_to: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
  })
  .strict()
  .superRefine((v, c) => {
    if (!v.entity_id && !v.entity_name)
      c.addIssue({ code: 'custom', message: 'Entity ID or name required' });
    if (
      v.fact_kind === 'relationship' &&
      (!v.relationship_kind || (!v.parent_id && !v.parent_name))
    )
      c.addIssue({ code: 'custom', message: 'Parent and relationship type required' });
    if (v.fact_kind === 'participation' && (!v.target_id || !v.role))
      c.addIssue({ code: 'custom', message: 'Target and role required' });
    if (v.valid_to && !v.valid_from)
      c.addIssue({ code: 'custom', message: 'Start date needed for end date' });
  });
const asyncRoute = (fn: (req: any, res: any) => Promise<any>) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(loopbackHost);
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());
  app.get('/health', (_req, res) =>
    res.json({ status: 'local', production_deployed: false, notifications: false }),
  );
  app.post('/auth/login', login);
  app.get('/auth/me', authenticate, (req, res) =>
    res.json({
      username: req.localSession!.username,
      role: req.localSession!.role,
      csrf: req.localSession!.csrf,
    }),
  );
  app.post('/auth/logout', authenticate, csrf, logout);
  app.use('/api/v1', authenticate);
  const at = (req: any) =>
    cutoffs(
      typeof req.query.valid_as_of === 'string' ? req.query.valid_as_of : undefined,
      typeof req.query.known_as_of === 'string' ? req.query.known_as_of : undefined,
    );
  const page = (req: any) => pagination.parse(req.query);
  app.get(
    '/api/v1/projects',
    asyncRoute(async (req, res) => {
      const p = page(req);
      res.json(
        await projects(
          {
            ...p,
            status: typeof req.query.status === 'string' ? req.query.status : '',
            kind: typeof req.query.kind === 'string' ? req.query.kind : '',
          },
          at(req),
        ),
      );
    }),
  );
  app.get(
    '/api/v1/projects/:id',
    asyncRoute(async (req, res) => res.json(await projectDetail(req.params.id, at(req)))),
  );
  app.get(
    '/api/v1/cases',
    asyncRoute(async (req, res) => {
      const p = page(req);
      res.json({
        data: await caseList(p.q, p.limit, (p.page - 1) * p.limit, at(req)),
        page: p.page,
        limit: p.limit,
      });
    }),
  );
  app.get(
    '/api/v1/cases/:id',
    asyncRoute(async (req, res) => res.json(await caseDetail(req.params.id, at(req)))),
  );
  app.get(
    '/api/v1/entities',
    asyncRoute(async (req, res) => {
      const p = page(req);
      res.json({
        data: await entities(p.q, p.limit, (p.page - 1) * p.limit),
        page: p.page,
        limit: p.limit,
      });
    }),
  );
  app.get(
    '/api/v1/entities/:id',
    asyncRoute(async (req, res) => res.json(await entityDetail(req.params.id, at(req)))),
  );
  app.get(
    '/api/v1/changes',
    asyncRoute(async (req, res) => {
      const p = page(req);
      res.json({
        data: await changes(p.limit, (p.page - 1) * p.limit),
        page: p.page,
        limit: p.limit,
      });
    }),
  );
  app.get(
    '/api/v1/sources',
    asyncRoute(async (_req, res) =>
      res.json({ data: await sources(), production_scheduled: false }),
    ),
  );
  app.get(
    '/api/v1/sources/:key',
    asyncRoute(async (req, res) => {
      const key = req.params.key;
      const config = sourceConfig(key);
      res.json({
        contract: config,
        health: (await sources()).find((s) => s.name === key) || null,
        production_scheduled: false,
      });
    }),
  );
  app.post(
    '/api/v1/sources/:key/ingest',
    roleGuard('admin'),
    csrf,
    asyncRoute(async (req, res) => {
      z.object({ baseline: z.boolean().optional() }).strict().parse(req.body);
      res.json(await ingestSource(req.params.key, { baseline: req.body.baseline }));
    }),
  );
  app.get(
    '/api/v1/reviews',
    roleGuard('reviewer', 'admin'),
    asyncRoute(async (req, res) => {
      const p = page(req);
      res.json({
        data: await reviewQueue(p.q, p.limit, (p.page - 1) * p.limit),
        page: p.page,
        limit: p.limit,
      });
    }),
  );
  app.post(
    '/api/v1/reviews/:id',
    roleGuard('reviewer', 'admin'),
    csrf,
    asyncRoute(async (req, res) => {
      const body = reviewSchema.parse(req.body);
      res.json(
        await reviewClaim(req.params.id, body.decision, req.localSession!.username, body.rationale),
      );
    }),
  );
  app.post(
    '/api/v1/identities/:id/confirm',
    roleGuard('reviewer', 'admin'),
    csrf,
    asyncRoute(async (req, res) => {
      const id = z.string().uuid().parse(req.params.id);
      const body = z
        .object({ rationale: z.string().trim().min(10).max(2000) })
        .strict()
        .parse(req.body);
      await pools.review.query('SELECT dc.confirm_candidate($1,$2,$3)', [
        id,
        req.localSession!.username,
        body.rationale,
      ]);
      res.json({ identity_state: 'confirmed', basis: 'identity_only_not_owner_status_or_capital' });
    }),
  );
  app.post(
    '/api/v1/company-proposals',
    roleGuard('reviewer', 'admin'),
    csrf,
    asyncRoute(async (req, res) => {
      const payload = proposalSchema.parse(req.body);
      const result = await pools.review.query(
        'SELECT dc.propose_company_fact($1,$2) AS assertion_id',
        [JSON.stringify(payload), req.localSession!.username],
      );
      res.status(201).json({
        ...result.rows[0],
        state: 'needs_review',
        citation_basis: 'analyst_submitted_not_independently_fetched',
      });
    }),
  );
  app.post(
    '/api/v1/exports',
    csrf,
    asyncRoute(async (req, res) => {
      const body = z
        .object({ valid_as_of: z.string().optional(), known_as_of: z.string().optional() })
        .strict()
        .parse(req.body);
      res.json(await exportReports(cutoffs(body.valid_as_of, body.known_as_of)));
    }),
  );
  app.get(
    '/api/v1/exports/:id/:kind',
    asyncRoute(async (req, res) => {
      const file = artifactFile(req.params.id, req.params.kind);
      if (!existsSync(file)) throw new ServiceError(404, 'Export not found');
      res.download(file);
    }),
  );
  app.get('/api/v1/weekly', (_req, res) =>
    res.json({
      data: readdirSync('weekly')
        .filter((x) => /^\d{4}-\d{2}-\d{2}\.md$/.test(x))
        .sort()
        .reverse(),
    }),
  );
  app.get(
    '/api/v1/weekly/:name',
    asyncRoute(async (req, res) =>
      res.json({
        name: req.params.name,
        content: weeklyTape(req.params.name),
        basis: 'existing_repository_report_not_live_market_data',
      }),
    ),
  );
  app.get(
    '/api/v1/weekly-appendix/:date',
    asyncRoute(async (req, res) =>
      res.json({
        content: await weeklyAppendix(req.params.date),
        integration: 'callable_command_not_existing_scheduler_hook',
      }),
    ),
  );
  app.use((err: any, _req: any, res: any, _next: any) => {
    if (err instanceof z.ZodError)
      return res
        .status(400)
        .json({ error: 'Request validation failed', details: err.issues.map((i) => i.message) });
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    if (err?.type === 'entity.too.large')
      return res.status(413).json({ error: 'Request too large' });
    if (['23514', '23502', '22P02', '22007', 'P0002', '23P01'].includes(err?.code))
      return res.status(409).json({ error: 'Data/evidence validation or temporal conflict' });
    if (err instanceof SyntaxError && (err as any).status === 400)
      return res.status(400).json({ error: 'Invalid JSON body' });
    console.error('API internal error', err?.code || err?.name, err?.message);
    res.status(500).json({ error: 'Internal service failure; inspect local server log' });
  });
  return app;
}
export async function prepareApp() {
  await registerSources();
  return createApp();
}
