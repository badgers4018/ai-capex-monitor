import { prepareApp } from './api.js';
import { closePools } from './core.js';
if (process.env.NODE_ENV === 'production')
  throw new Error('Local-only build: production deployment is not configured or approved.');
const app = await prepareApp();
const port = Number(process.env.API_PORT || 3001);
const server = app.listen(port, '127.0.0.1', () =>
  console.log(`AI Capex local API listening on http://127.0.0.1:${port}; no public deployment.`),
);
const stop = () => server.close(() => closePools().then(() => process.exit(0)));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
