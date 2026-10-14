# Permit Intelligence ↔ AI Capex Monitor cockpit — host integration (local only)

Status: **local verified** (2026-10-14). Not staging verified, not production scheduled. No push, PR, or deployment.

## Layout
| Path | What |
|---|---|
| `apps/capex-monitor/` | Existing financial cockpit (Manus handoff checkpoint `02ea19d9`): React 19/Vite/Tailwind + Express/tRPC + Drizzle/MySQL. Unchanged except the integration files listed below. |
| repo root (`app/`, `migrations/`, `config/`, `docs/data-center-permit-intelligence/`) | Permit Intelligence module (export commit `0529c52`, applied via patches 01+02 onto main `929aebb`). PostgreSQL 16+ (validated here on 17), `dc` schema. |
| `weekly/`, `vercel.json` | Financial weekly tape/config, byte-identical to main (test-enforced). |

## Schema coexistence
Two databases, no shared tables. The cockpit keeps MySQL/TiDB + Drizzle (`users`, `subscribers`, `changelog_entries`, `refresh_runs`). Permit Intelligence keeps its own Postgres registry with checksum-controlled migrations. The cockpit never connects to Postgres; its UI reaches the module only through the authenticated Permit API via a same-origin proxy. Company linkage is through the module's dated, evidence-backed `dc.app_entity_mapping` bridge. No cockpit ticker is mapped automatically, so mappings stay explicitly **unresolved** until reviewed.

## Cockpit server routes (`apps/capex-monitor/server/permitIntelligence.ts`)
- `/permit-api/*` → reverse proxy to `PERMIT_API_ORIGIN` (default `http://127.0.0.1:3001`). Rewrites only `Host` and passes cookies/CSRF/Origin unchanged. It is mounted before body parsers.
- `/permits/*` → the Permit Intelligence UI build (hash sections `#projects #permits #companies #changes #sources #review #weekly`).
- Gates: off unless `PERMIT_INTELLIGENCE_ENABLED=1` (404 otherwise); throws if `NODE_ENV=production`; loopback Host and loopback upstream only.
- Nav (`NavigationBar.tsx`): new **Permit Intelligence** dropdown group (Projects, Permits & Plans, Companies, Changes, Sources & Coverage, Review Queue). Review Queue renders only for reviewer/admin inside the module.

## Permit module changes
- `app/server/auth.ts`: `PERMIT_TRUSTED_ORIGINS` adds explicit **loopback-only** origins (the cockpit `http://127.0.0.1:3000`). Non-loopback values fail at startup. Defaults and the CSRF/role/Host guards are unchanged.
- `app/client/main.tsx`: optional `VITE_PERMIT_API_BASE` / `VITE_COCKPIT_URL`, plus hash routing. The standalone build behaves as before.
- `vite.config.ts`: optional `PERMIT_UI_BASE` / `PERMIT_UI_OUT`. Plus the script `build:permit-ui:cockpit`.

## Run locally
```bash
# repo root (after the README one-time setup)
pnpm build:permit-ui:cockpit
PERMIT_TRUSTED_ORIGINS=http://127.0.0.1:3000 pnpm start      # Permit API on 127.0.0.1:3001
# cockpit
cd apps/capex-monitor && pnpm install --frozen-lockfile
NODE_ENV=development PORT=3000 PERMIT_INTELLIGENCE_ENABLED=1 \
  PERMIT_UI_DIST=$PWD/../../.local/permit-ui pnpm exec tsx server/_core/index.ts
# open http://127.0.0.1:3000/dashboard → Permit Intelligence; sign in with .local/access.md
```

## Weekly
The permit appendix stays a separate callable command (`pnpm weekly:appendix YYYY-MM-DD`). It is not attached to the Sunday tape writer, because that hook (Grok routine / Manus Heartbeat) isn't in this repo, so unattended integration is **pending**. The eight-line tape and OBS/book figures are never written by this module.
