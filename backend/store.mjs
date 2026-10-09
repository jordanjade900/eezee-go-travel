import { mkdir } from 'node:fs/promises';
import path from 'node:path';

// Both adapters expose synchronous mutation callbacks. A callback may be retried
// and must not send mail, call suppliers, or produce any other external effects.
export async function createSQLiteStore(filename, security) {
  const { DatabaseSync } = await import('node:sqlite');
  await mkdir(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS operations_state (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL, revision INTEGER NOT NULL);');
  return {
    async read() {
      const row = db.prepare('SELECT data FROM operations_state WHERE id=1').get();
      return row ? security.decrypt(row.data) : null;
    },
    async transact(update) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const row = db.prepare('SELECT data,revision FROM operations_state WHERE id=1').get();
        const state = row ? security.decrypt(row.data) : null;
        const result = update(state);
        if (result?.state) db.prepare('INSERT INTO operations_state(id,data,revision) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,revision=excluded.revision').run(security.encrypt(result.state), (row?.revision || 0) + 1);
        db.exec('COMMIT');
        return result?.value;
      } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
    close() { db.close(); }
  };
}

export async function createBlobStore(security, options = {}) {
  const { getStore } = await import('@netlify/blobs');
  // The SDK's conditional-write branch can otherwise report modified:true for
  // non-412 HTTP failures. Refuse failed PUTs before that branch sees a response.
  const strictFetch = async (...args) => {
    const result = await (options.fetch || fetch)(...args);
    const method = String(args[1]?.method || (args[0] instanceof Request ? args[0].method : 'GET')).toUpperCase();
    if (method === 'PUT' && !result.ok && result.status !== 412) throw new Error(`Durable operations write failed (${result.status}).`);
    return result;
  };
  const store = options.client || getStore({ name: options.name || 'eezee-operations-v1', consistency: 'strong', fetch: strictFetch, ...(options.siteID && options.token ? { siteID: options.siteID, token: options.token, apiURL: options.apiURL } : {}) });
  return {
    async read() {
      const entry = await store.getWithMetadata('state', { type: 'text', consistency: 'strong' });
      return entry ? security.decrypt(entry.data) : null;
    },
    async transact(update) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const entry = await store.getWithMetadata('state', { type: 'text', consistency: 'strong' });
        const result = update(entry ? security.decrypt(entry.data) : null);
        if (!result?.state) return result?.value;
        const encoded = security.encrypt(result.state);
        if (Buffer.byteLength(encoded) > 15_000_000) throw new Error('Operations store requires migration before additional writes.');
        const written = await store.set('state', encoded, entry ? { onlyIfMatch: entry.etag } : { onlyIfNew: true });
        if (written.modified) return result.value;
        await new Promise(resolve => setTimeout(resolve, 20 * (attempt + 1) + Math.floor(Math.random() * 40)));
      }
      const error = new Error('Another update is in progress. Please retry.'); error.status = 503; throw error;
    },
    close() {}
  };
}
