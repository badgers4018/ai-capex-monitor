#!/usr/bin/env node
/**
 * Exports the public research data needed to recreate the AI Capex Monitor.
 * Intentionally excludes users and newsletter subscribers because they may contain PII.
 *
 * Usage:
 *   DATABASE_URL='mysql://…' node scripts/export-public-handoff-data.mjs [output-path]
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import mysql from "mysql2/promise";

const outputPath = resolve(process.argv[2] ?? "grok-handoff/data/database-public-export.json");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. It is not embedded in this script or archive.");
}

const connection = await mysql.createConnection(databaseUrl);
try {
  const [changelogEntries] = await connection.query("SELECT * FROM changelog_entries ORDER BY createdAt ASC, id ASC");
  const [refreshRuns] = await connection.query("SELECT * FROM refresh_runs ORDER BY startedAt ASC, id ASC");

  const payload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    includedTables: ["changelog_entries", "refresh_runs"],
    excludedTables: {
      users: "Excluded because OpenID/name/email fields may contain personal data.",
      subscribers: "Excluded because email addresses are personal data.",
    },
    changelogEntries,
    refreshRuns,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(JSON.stringify({ outputPath, changelogEntries: changelogEntries.length, refreshRuns: refreshRuns.length }, null, 2));
} finally {
  await connection.end();
}
