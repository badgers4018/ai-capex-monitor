# Permit Intelligence — Local Operator Runbook

## What this release is

A new private/local AI Capex Monitor shell plus a PostgreSQL-backed permit-intelligence module. It is **not** a deployed production service or a patch to the external Grok app. The original weekly financial reports and eight-line tape contract remain unchanged. No AI API, public dashboard, notification destination, paid feed, or production scheduler is enabled.

## Prerequisites

- Node 22+, pnpm 11.25.0 (pinned in `package.json`).
- PostgreSQL 16+ with `btree_gist`, `psql`, `pg_dump`, `pg_restore`.
- This local setup assumes Ubuntu and passwordless `sudo -u postgres`; it creates isolated random-named roles/databases, not changes to an existing production account.
- Public HTTPS access to the locked Prince William ArcGIS service.
- Chromium installed through Playwright for browser tests.

```bash
pnpm install --frozen-lockfile
sudo pg_ctlcluster 16 main start
pnpm setup:local
pnpm migrate
pnpm test:schema
pnpm test:local
pnpm exec playwright install chromium
pnpm test:e2e:local
pnpm build
```

`setup:local` generates an isolated DB and private local credentials. Re-running it retains the existing configuration. Migrations verify checksums and refuse an unbaselined existing `dc` schema. The original bootstrap is never a startup/reset script. Windows/macOS or an externally managed database require an explicitly configured setup; do not run the Ubuntu setup script against them unchanged.

## Start and sign in

Use two terminals at the repository root:

```bash
pnpm dev:api  # http://127.0.0.1:3001
pnpm dev:ui   # http://127.0.0.1:5173
```

Sign in at the UI using the generated credentials in **`.local/access.md`**. Keep that file private. Hashed users are in `.local/users.json`; DB credentials are in `.local/env`. Never commit/upload these files or paste their values into chat. Roles:

| Role     | Allowed                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------ |
| viewer   | Read projects/cases/entities/changes/coverage/weekly reports; generate/download private exports        |
| reviewer | Viewer actions plus cited proposals, fact reviews/retractions, and source-backed identity confirmation |
| admin    | Reviewer actions plus approved-source ingestion                                                        |

The runtime binds loopback, requires loopback Host headers, uses HttpOnly SameSite=Strict expiring sessions and CSRF/origin checks for writes, and limits login attempts. It is **development authentication**, not an approved production identity solution. Restart invalidates sessions. No external routes/tunnels should be configured without a separate approved deployment decision.

Known hosted build environments are rejected by `assert-local-build.ts`; `NODE_ENV=production` is rejected by the server. No publish/deploy command or GitHub deployment job is supplied. These guards do not establish that all possible third-party hosting integrations have been audited; repository hosting/account settings are unchanged.

## Collect and reconcile

```bash
pnpm probe pwc_dc_inventory
pnpm ingest pwc_dc_inventory --baseline
pnpm ingest pwc_dc_inventory
```

The adapter reads **campuses (layer 10)** and **buildings (layer 9)** as independent complete scopes. It validates metadata/fingerprints, coded statuses, qualified GlobalIDs, bounded pagination, source counts, and object-ID inventories before/after retrieval. Source snapshots are best-effort observations of a mutable API, not a source-provided transaction across both layers. Periodic full reconciliation handles later edits.

All exact metadata/page bytes are archived content-addressed under `.local/raw/`; DB record versions point into pages with a locator and matching SHA-256. New page versions can coexist with unchanged semantic records; unchanged replays do not recreate objects/assertions/events. A → B → A stays three source revisions.

A feed-wide expiring lease serializes collectors. Per-record locks and scope checkpoint checks protect writes. A failed/incomplete scope does not advance its checkpoint. Other already successful scopes remain recorded, so health is shown separately for every scope. Missing source rows are observations, not cancellation or deletion. A crashed job may leave a running run and lease; wait for expiry before retry, preserve the diagnostic run, and inspect the scope history. No infinite retry/polling loop is configured.

DEQ and Loudoun are intentionally disabled by their activation states. Do not edit their flags to approved merely because a web page is readable. The current direct DEQ inventory/PDF probes returned 403; Loudoun unattended/bulk access remains unverified. Do not bypass restrictions or send agency outreach/record requests without authority.

## Review and interpretation

- Source campuses are candidate projects. Buildings match a campus only by a unique exact documented planning-case link. Otherwise a separate **unresolved site container** preserves the record and an open review issue. Containers must not be added to campus counts as if they were independent announced projects.
- Projects, buildings, parcels, and issuer-scoped regulatory cases have separate IDs. Case references from the county inventory are not claimed to be a full direct building-permit feed.
- Review Queue shows claims, typed company/role payloads, quotations/locators, and original links. A reviewer supplies rationale to accept, reject/retract, or mark needs-review. The authenticated session—not a posted actor or timestamp—supplies review identity.
- Facts with no evidenced effective interval are selected as **observed on the review day only**. They do not silently become true for all past/future dates. An earlier selected fact can be queried using effective and knowledge cutoffs.
- Confirm source identity separately from approving facts. An unresolved container without canonical identity evidence cannot be confirmed. Identity confirmation does not establish ownership/status/capital.
- Company proposals require a HTTPS citation and quotation. They are explicitly **analyst-submitted, not independently fetched**. Names create candidates and do not auto-merge companies. Control, equity ownership, consolidation, management and site roles remain different relationship types. No known parent remains unknown.
- The migration provides a dated evidence-backed monitor-company mapping table; actual external-app identifiers remain unresolved because that application is not available in this repository. No fabricated ticker/entity mapping is inserted.
- Automatic geometry/fuzzy matching, arbitrary campus reparenting, reversible merge tooling, ownership-disclosure collectors, and a bulk/manual file-upload collector are **not implemented in this first local release**. Evidence-rich fixtures are for isolated QA only, not an alternative live feed.
- Year built is year precision and is not construction start. Occupancy is not operating status. Planned/approved permits are not construction start. Purpose/AI workload, IT MW, owners/parents, and capital are not inferred from labels. Raw GFA values require source-unit/basis review; no canonical area claim is generated yet.

## Reports and weekly integration

```bash
pnpm export
pnpm export 2026-10-14 2026-10-14T12:00:00Z
pnpm weekly:appendix 2026-10-18
```

XLSX and Markdown are generated from one repeatable-read database snapshot. Private exports and their manifest/hashes are under `.local/exports/<export-id>/`. One-to-many project branches are aggregated before joining. Candidate campus rows and unresolved containers are separately labeled. Selected facts have effective/knowledge cutoffs; structural membership and display caches belong to the export snapshot and are not claimed fully bitemporal.

Permit work valuations, corporate plans, site investment, financing, acquisitions and leases must remain distinct. No combined capital SUM is supplied. The weekly appendix is generated separately under `.local/appendices/`; the original weekly files are neither edited nor overwritten. This callable command is **not yet connected to the actual pre-existing weekly scheduler**, whose runtime/hook is unavailable. Configure one authorized writer/hook later; do not add a competing weekly-report writer.

## Backup and recovery

```bash
pnpm recovery:check
```

Creates a private custom-format backup, restores it into a newly created disposable database, compares project/building/version/assertion counts, and drops only that temporary restore DB. It does not reset the registry or change live credentials. Backup files and raw documents are both required for complete evidence recovery; a DB dump alone does not contain archived page bytes.

For full local recovery, securely copy `.local/env`, `.local/users.json`, `.local/raw`, `.local/exports`, and the DB backup. Restore to a newly approved DB; reapply runtime role grants with `pnpm migrate` after checking retained migration hashes. Never reuse fixture credentials for a real runtime. A production retention/backup/restore SLA and durable object-storage policy remain unapproved/unconfigured.

## Testing and CI

- `pnpm test:schema`: disposable original-reference DB, all original 37 regression tests, example queries; no fixtures remain.
- `pnpm test:local`: separate disposable application DB and TEST users; adapter/DB/API/permissions/replay/history/report tests.
- `pnpm test:e2e:local`: separate disposable DB, visibly synthetic TEST campus/building records, loopback API/UI, browser roles, review, downloads, responsive/error states and accessibility checks.
- Direct `pnpm test` integration refuses the real registry; use `test:local` unless deliberately supplying a correctly isolated TEST configuration.
- UI screenshots in `.local/screenshots` are TEST-only. Public Git contains no live source payloads, DB backups, generated passwords, or private exports.

## Staging/production blockers

A durable host/account, PostgreSQL/storage targets, production identity provider and reviewer permissions, publication/redistribution approval, and an exact weekly-job hook are still needed. External alert delivery remains off. Expansion beyond this county requires source-by-source access/coverage validation and any licensing approval. Publicly readable documentation does not clear these gates.
