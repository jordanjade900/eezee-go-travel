import { fileURLToPath } from 'node:url';
import publishedTrips from '../data/local-trips.json' with { type: 'json' };
import { createSecurity } from './security.mjs';
import { createSQLiteStore, createBlobStore } from './store.mjs';

export async function configureOperations(env = process.env, overrides = {}) {
  const production = env.NODE_ENV === 'production' || env.NETLIFY === 'true' || env.OPS_STORE === 'netlify';
  const security = createSecurity(env);
  let origin;
  try { origin = env.OPS_ORIGIN ? new URL(env.OPS_ORIGIN).origin : undefined; } catch { throw new Error('Operations requires a valid OPS_ORIGIN.'); }
  if (production && (!origin || !origin.startsWith('https://'))) throw new Error('Production operations requires an HTTPS OPS_ORIGIN.');
  const adapter = env.OPS_STORE || (production ? 'netlify' : 'sqlite');
  if (production && adapter === 'sqlite') throw new Error('Ephemeral serverless SQLite is forbidden; configure durable operations storage.');
  if (!['sqlite', 'netlify'].includes(adapter)) throw new Error('Unknown operations storage adapter.');
  const seedTrips = overrides.trips || publishedTrips;
  const store = overrides.store || (adapter === 'netlify' ? await createBlobStore(security) : await createSQLiteStore(env.OPS_DB_PATH || fileURLToPath(new URL('../work/operations.sqlite', import.meta.url)), security));
  return { store, security, seedTrips, production, origin, adminEmail: String(env.OPS_ADMIN_EMAIL || '').toLowerCase(), adminPasswordHash: env.OPS_ADMIN_PASSWORD_HASH, adminName: env.OPS_ADMIN_NAME || 'EE-Zee Go owner', now: overrides.now || (() => Date.now()), rateLimits: overrides.rateLimits || { submission: [6, 3600000], login: [8, 900000], customer: [30, 3600000] } };
}
