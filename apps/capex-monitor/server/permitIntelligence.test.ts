import { describe, expect, it, afterAll } from "vitest";
import express from "express";
import http from "http";
import type { AddressInfo } from "net";
import { registerPermitIntelligence, permitConfig } from "./permitIntelligence";
import { PERMIT_INTELLIGENCE_ITEMS, isSectionHref } from "../client/src/components/NavigationBar";

const servers: http.Server[] = [];
const listen = (app: express.Express) => new Promise<string>(r => { const s = app.listen(0, "127.0.0.1", () => r(`http://127.0.0.1:${(s.address() as AddressInfo).port}`)); servers.push(s); });
afterAll(() => servers.forEach(s => s.close()));

describe("Permit Intelligence host integration", () => {
  it("is disabled by default and leaves cockpit routes alone", async () => {
    const app = express();
    expect(registerPermitIntelligence(app, permitConfig({})).mounted).toBe(false);
    app.get("/dashboard", (_q, r) => r.send("cockpit"));
    const base = await listen(app);
    expect((await fetch(base + "/permit-api/health")).status).toBe(404);
    expect(await (await fetch(base + "/dashboard")).text()).toBe("cockpit");
  });

  it("refuses production and non-loopback upstreams", () => {
    expect(() => registerPermitIntelligence(express(), permitConfig({ PERMIT_INTELLIGENCE_ENABLED: "1", NODE_ENV: "production" }))).toThrow(/local-only/);
    expect(() => registerPermitIntelligence(express(), permitConfig({ PERMIT_INTELLIGENCE_ENABLED: "1", PERMIT_API_ORIGIN: "https://example.com" }))).toThrow(/loopback/);
  });

  it("proxies to the permit API, forwarding cookies/CSRF and rewriting only Host", async () => {
    const upstream = express();
    upstream.use(express.json());
    upstream.all(/.*/, (q, r) => { r.setHeader("set-cookie", "dcpi_session=x; Path=/; HttpOnly; SameSite=Strict"); r.json({ path: q.url, host: q.headers.host, csrf: q.headers["x-csrf-token"] ?? null, origin: q.headers.origin ?? null, body: q.body ?? null }); });
    const up = await listen(upstream);
    const app = express();
    registerPermitIntelligence(app, permitConfig({ PERMIT_INTELLIGENCE_ENABLED: "1", PERMIT_API_ORIGIN: up }));
    app.use(express.json());
    const base = await listen(app);
    const r = await fetch(base + "/permit-api/api/v1/reviews/abc", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": "t", origin: base }, body: JSON.stringify({ decision: "accepted" }) });
    const j = await r.json();
    expect(j).toMatchObject({ path: "/api/v1/reviews/abc", host: new URL(up).host, csrf: "t", origin: base, body: { decision: "accepted" } });
    expect(r.headers.get("set-cookie")).toContain("dcpi_session");
  });

  it("rejects non-loopback Host headers and reports a stopped API", async () => {
    const app = express();
    registerPermitIntelligence(app, permitConfig({ PERMIT_INTELLIGENCE_ENABLED: "1", PERMIT_API_ORIGIN: "http://127.0.0.1:59999" }));
    const base = await listen(app);
    const res = await new Promise<number>(ok => http.get(base + "/permit-api/health", { headers: { host: "monitor.example.com" } }, x => ok(x.statusCode!)));
    expect(res).toBe(403);
    expect((await fetch(base + "/permit-api/health")).status).toBe(502);
  });

  it("adds a Permit Intelligence nav group with the six required sections", () => {
    expect(PERMIT_INTELLIGENCE_ITEMS.map(i => i.label)).toEqual(["Projects", "Permits & Plans", "Companies", "Changes", "Sources & Coverage", "Review Queue (reviewers)"]);
    expect(PERMIT_INTELLIGENCE_ITEMS.every(i => !isSectionHref(i.href) && i.href.startsWith("/permits/#"))).toBe(true);
  });
});
