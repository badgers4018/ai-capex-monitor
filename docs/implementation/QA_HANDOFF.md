# AI Capex Monitor — Permit Intelligence QA & Handoff

**Validation:** 2026-10-14 UTC.
**Target:** `badgers4018/ai-capex-monitor`, branch `feat/permit-intelligence-publish`, stacked on the unmerged design PR #1.
**Release boundary:** tested private/local implementation and an implementation PR. Not deployment, national completeness, or restoration of the external Grok app.

## What works now

- A new local React research desk and authenticated TypeScript API using the **original PostgreSQL data model** plus additive service migrations.
- Project/campus, building, parcel, permit/planning-case, legal-entity, parent/role, evidence, review, source-health and export structures remain distinct.
- Locked Prince William official campus/building sources, deterministic collection, exact archived bytes and record locators, complete scope checks, stable identities, replay/reconciliation and atomic scope checkpoints.
- Viewer/reviewer/admin access, CSRF/origin/Host controls, generated private local credentials, server-bound reviewer and timestamps, evidence review/retraction, dated control paths and source identity confirmation.
- Unknown parent/operator/purpose/IT capacity/capital stay unknown unless evidenced. Analyst company proposals are labeled submitted citations and require review; they are not independently fetched disclosures.
- Paginated/filterable project, permit/plan, company, change, review, coverage and reporting interfaces. Source vs reviewed status are visibly separate.
- Snapshot-paired Excel/Markdown exports with matching IDs/counts/cutoffs/manifests; separate weekly permit appendix. **Original financial tape/book files unchanged.**
- Private backup/restore smoke test; operator runbook; read-only offline CI manual-install example; local-only build/serving guards. No external alerts enabled.

## Real source verification

| Observation                      | Verified result                                                                                                        |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Official county campus layer     | 78 records                                                                                                             |
| Official county building layer   | 247 records                                                                                                            |
| Additional unresolved containers | 143, preserving unmatched building evidence; not additional announced campuses                                         |
| Issuer-scoped case references    | 170; explicit inventory references, not a full standalone building-permit feed                                         |
| Repeat identical ingestion       | 0 newly created records/objects; 0 new semantic claims                                                                 |
| Baseline / external alerts       | No new-project baseline alerts; 0 externally enabled/emitted alerts                                                    |
| First real review path           | Exact county Planned field → proposed reported entitlement → authenticated reviewed selection, observed-day basis only |
| Local API/UI health checks       | Loopback HTTP 200                                                                                                      |
| Source scope                     | Prince William current inventory only; not a nationwide or complete historical registry                                |

A building is linked to a campus only through a unique exact documented planning-case reference. No fuzzy/geometry association was invented to reduce the unresolved queue. The **221 project/container rows** in local exports are **78 source campuses plus 143 unresolved containers**, not 221 verified deals. Buildings and parent containers must not be added as separate deal/capital counts.

Exact county payloads, source quotes, generated credentials, IDs/hash from the real review, exports, and DB dumps stay under private ignored `.local`; public Git includes code/configuration/documentation and clearly synthetic TEST screenshots only.

## Quality gates

| Gate                                    | Final result                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Original reference SQL regressions      | 37 passed; example queries executed in a disposable DB                                                                |
| Application/DB/API integration          | 39 passed                                                                                                             |
| Adapter/HTTP/identity/completeness      | 27 passed                                                                                                             |
| Browser E2E                             | 11 passed                                                                                                             |
| Automated accessibility                 | Principal Projects, Permits & Plans, Companies, Sources & Coverage, Review Queue screens pass WCAG A/AA tagged checks |
| TypeScript + optimized frontend build   | Passed; main UI bundle approximately 213 KB / 67 KB gzip                                                              |
| Dependency audit                        | 0 known production/development advisories at final verification                                                       |
| Original design-package checksums       | All 9 manifest entries match; design package untouched                                                                |
| Financial/weekly/deployment-config diff | None                                                                                                                  |
| Backup/restore smoke test               | Private backup restored into a new disposable DB; key counts match; registry not reset                                |
| Hosted-build guard                      | Known hosted-environment build rejected                                                                               |

Key regression coverage: source host allowlist; HTTP 403 without bypass; schema/field/status drift; duplicate GUIDs; incomplete pages; changing count and same-count object-ID inventory; source revision A→B→A; identical replay; missing-not-canceled; active/expired leases; checkpoint failure; server times; direct runtime ledger-write denial; review acceptance/retraction and prior knowledge; no equity-to-control shortcut; overlapping graph cycle rejection; viewer/reviewer/admin writes; CSRF/origin/Host checks; malformed request/IDs/page limits; report parity; unchanged weekly tape; mobile/error/empty states; audited identity confirmation.

An accessibility contrast failure and dependency advisories found during testing were corrected; **the complete final suite was rerun after the patches**. Audit cleanliness is point-in-time, not a permanent security guarantee. CI is preserved at `docs/implementation/permit-intelligence-ci.example.yml` but is not installed or running. GitHub rejected the original workflow write for missing permission; this publication branch changes no workflow paths or connector permissions. All application code remains identical to the tested local commit `0529c521d8604b2ad6d72ab3969edfa496df12ed`. See the runbook for authorized manual installation. Local success is not claimed as remote CI success.

## Visual QA

The screenshots use an isolated, visibly synthetic **TEST Evidence Campus** and TEST user. They are not proof of county coverage or live financial values.

- [Desktop TEST workspace](images/desktop-test.png)
- [Mobile TEST workspace](images/mobile-test.png)

## Remaining gates / honest limits

1. **Review and merge sequencing:** design PR #1 must land before the stacked implementation PR is retargeted/merged into main. Neither is auto-merged.
2. **Production target:** approved durable host, DB/storage, real identity provider/roles, secrets and backup/retention policy. Loopback ports in the sandbox are not a user-accessible deployed site.
3. **Weekly hook:** appendix command exists, but the exact external weekly scheduler/job is not available; no competing writer or new schedule was created.
4. **External frontend/company bridge:** the existing Grok application source/identifiers are unavailable. The evidence-backed bridge table exists, but no fake external company IDs or tickers were inserted.
5. **Other sources:** DEQ listing/sample PDF returned 403 from direct runtime; Loudoun unattended/bulk access remains unverified. They stay disabled; no bypass or agency outreach was performed.
6. **Expansion/enrichment:** owner/capital/IT-capacity/purpose disclosure collectors, source-unit-reviewed GFA, more jurisdictions and licensing/redistribution clearance.
7. **Resolution tooling:** geometry/fuzzy matching, arbitrary reversible merges/campus reparenting, and analyst bulk file upload were not implemented in this first release. Candidate source identity review and cited company/role proposals are implemented. No destructive entity merges were used.
8. **Temporal semantics:** selected facts use effective/knowledge cutoffs, but structural membership/display caches remain current/export-snapshot metadata. Unknown effective dates use observed-day selection only. Mutable API snapshots are not an upstream cross-layer transaction.

## Run it

Follow [RUNBOOK.md](RUNBOOK.md). Minimum Ubuntu/PostgreSQL local sequence:

```bash
pnpm install --frozen-lockfile
sudo pg_ctlcluster 16 main start
pnpm setup:local
pnpm migrate
pnpm ingest pwc_dc_inventory --baseline
# two terminals:
pnpm dev:api
pnpm dev:ui
```

Open `http://127.0.0.1:5173` **on that same development machine**, using generated `.local/access.md` credentials. Do not expose these development credentials or ports publicly. QA: `pnpm test:schema`, `pnpm test:local`, `pnpm test:e2e:local`, `pnpm build`, `pnpm audit`. Reporting: `pnpm export`, `pnpm weekly:appendix YYYY-MM-DD`.

**Next decision after PR review:** select the durable deployment/identity/storage target and provide the actual weekly-job hook and external frontend identifiers; then activate additional sources only after access and licensing gates pass.
