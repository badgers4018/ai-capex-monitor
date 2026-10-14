/**
 * Permit Intelligence host integration (local-only).
 *
 * Mounts the Permit Intelligence module beside the existing financial cockpit without
 * touching cockpit routes, tRPC, MySQL/Drizzle tables, or the weekly tape.
 *  - /permit-api/*  -> same-origin reverse proxy to the Permit Intelligence API (Postgres-backed)
 *  - /permits/*     -> the Permit Intelligence UI build (consumes /permit-api, never the DB)
 *
 * Gates preserved:
 *  - Disabled unless PERMIT_INTELLIGENCE_ENABLED=1.
 *  - Refuses to enable when NODE_ENV=production (no deployment authority).
 *  - Loopback Host only, and the upstream must be a loopback http origin.
 *  - Auth/CSRF/role checks stay in the Permit API; this proxy adds no credentials.
 */
import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import http from "http";
import fs from "fs";
import path from "path";

const LOOPBACK_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?$/;
const LOOPBACK_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1):\d{2,5}$/;
const HOP_BY_HOP = new Set(["connection", "keep-alive", "transfer-encoding", "upgrade", "proxy-connection", "te", "trailer"]);

export type PermitConfig = { enabled: boolean; apiOrigin: string; uiDist: string | null; production: boolean };

export function permitConfig(env: NodeJS.ProcessEnv = process.env): PermitConfig {
  return {
    enabled: env.PERMIT_INTELLIGENCE_ENABLED === "1",
    apiOrigin: env.PERMIT_API_ORIGIN || "http://127.0.0.1:3001",
    uiDist: env.PERMIT_UI_DIST || null,
    production: env.NODE_ENV === "production",
  };
}

function loopbackOnly(req: Request, res: Response, next: NextFunction) {
  if (!LOOPBACK_HOST.test(req.headers.host || "")) return res.status(403).json({ error: "Permit Intelligence is local loopback only" });
  next();
}

export function registerPermitIntelligence(app: Express, config: PermitConfig = permitConfig()) {
  const disabled = (_req: Request, res: Response) =>
    res.status(404).json({ error: "Permit Intelligence is not enabled in this environment", gate: "local_only" });
  if (!config.enabled) {
    app.use(["/permit-api", "/permits"], disabled);
    return { mounted: false as const };
  }
  if (config.production) throw new Error("Permit Intelligence is local-only: production deployment is not approved.");
  if (!LOOPBACK_ORIGIN.test(config.apiOrigin)) throw new Error("PERMIT_API_ORIGIN must be a loopback http origin.");
  const upstream = new URL(config.apiOrigin);

  app.use("/permit-api", loopbackOnly, (req, res) => {
    const headers: http.OutgoingHttpHeaders = {};
    for (const [k, v] of Object.entries(req.headers)) if (!HOP_BY_HOP.has(k) && v !== undefined) headers[k] = v;
    headers.host = upstream.host; // the Permit API enforces a loopback Host of its own
    const proxied = http.request(
      { hostname: upstream.hostname, port: upstream.port, method: req.method, path: req.originalUrl.replace(/^\/permit-api/, "") || "/", headers },
      (up) => {
        const out: Record<string, any> = {};
        for (const [k, v] of Object.entries(up.headers)) if (!HOP_BY_HOP.has(k) && v !== undefined) out[k] = v;
        res.writeHead(up.statusCode || 502, out);
        up.pipe(res);
      },
    );
    proxied.on("error", () => { if (!res.headersSent) res.status(502).json({ error: "Permit Intelligence API is not running" }); });
    // express.json() may already have consumed the body; re-serialize when it did.
    if (req.body !== undefined && req.readableEnded) {
      const body = Buffer.from(JSON.stringify(req.body));
      proxied.setHeader("content-length", body.length);
      proxied.end(body);
    } else req.pipe(proxied);
  });

  if (config.uiDist && fs.existsSync(path.join(config.uiDist, "index.html"))) {
    const dist = config.uiDist;
    app.use("/permits", loopbackOnly, express.static(dist, { index: "index.html" }));
    app.get(/^\/permits(\/.*)?$/, loopbackOnly, (_req, res) => res.sendFile(path.join(dist, "index.html")));
  } else {
    app.use("/permits", loopbackOnly, (_req, res) =>
      res.status(503).json({ error: "Permit Intelligence UI not built. Run `PERMIT_UI_BASE=/permits/ pnpm build` in the repo root and set PERMIT_UI_DIST." }));
  }
  return { mounted: true as const };
}
