const hosted = [
  'VERCEL',
  'NETLIFY',
  'RENDER_SERVICE_ID',
  'RAILWAY_ENVIRONMENT_NAME',
  'FLY_APP_NAME',
];
for (const key of hosted)
  if (process.env[key])
    throw new Error(
      `Hosted build rejected (${key}): this branch is approved for local development and PR review, not deployment.`,
    );
console.log('Local/CI artifact build only; no deployment command configured.');
