import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomBytes, randomUUID } from 'node:crypto';
import { createOperationsHandler } from '../backend/api.mjs';
import { hashPassword } from '../backend/security.mjs';
import { configureOperations } from '../backend/config.mjs';
import { createSecurity } from '../backend/security.mjs';
import { createBlobStore } from '../backend/store.mjs';
process.env.NODE_ENV = 'test';

const origin = 'http://127.0.0.1:4191';
const password = 'Local test password of adequate length';
const temp = await mkdtemp(path.join(tmpdir(), 'eezee-operations-test-'));
const env = { OPS_STORE: 'sqlite', OPS_ORIGIN: origin, OPS_DB_PATH: path.join(temp, 'test.sqlite'), OPS_ENCRYPTION_KEY: randomBytes(32).toString('hex'), OPS_SESSION_SECRET: randomBytes(32).toString('hex'), OPS_ADMIN_EMAIL: 'owner@example.com', OPS_ADMIN_PASSWORD_HASH: hashPassword(password) };
let clock = Date.parse('2026-10-09T12:00:00Z');
let handle = await createOperationsHandler({ env, now: () => clock, rateLimits: { submission: [100, 3600000], login: [100, 900000], customer: [100, 3600000] } });
after(() => handle.close());
async function call(endpoint, { method = 'GET', body, cookie, token, revision, originOverride = origin, ip = '127.0.0.1' } = {}) {
  const headers = { 'x-ops-local-ip': ip };
  if (method !== 'GET') { headers['content-type'] = 'application/json'; headers.origin = originOverride; }
  if (cookie) headers.cookie = cookie;
  if (token) headers.authorization = `Bearer ${token}`;
  if (revision) headers['if-match'] = `"${revision}"`;
  const result = await handle(new Request(origin + '/api/operations' + endpoint, { method, headers, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }));
  return { status: result.status, data: await result.json(), cookie: result.headers.get('set-cookie')?.split(';')[0], headers: result.headers };
}
const payload = (extra = {}) => ({ kind: 'planning', name: 'A real traveller', email: 'traveller@example.com', phone: '+1 876 555 0142', travellers: 2, destination: 'Japan', flexibleDates: true, budget: '3000–4000', currency: 'USD', preferences: 'Quiet stays and local food.', consent: true, hp: '', idempotencyKey: randomUUID(), ...extra });
let ownerCookie, staffCookie, staffId, requestId, accessToken, reference;

test('staff authentication, origin checks and invalid input fail safely', async () => {
  assert.equal((await call('/dashboard')).status, 401);
  assert.equal((await call('/request', { token: 'bad' })).status, 401);
  assert.equal((await call('/requests', { method: 'POST', body: payload(), originOverride: 'https://attacker.example' })).status, 403);
  assert.equal((await call('/requests', { method: 'POST', body: payload({ preferences: 'a'.repeat(40000) }) })).status, 413);
  for (const override of [{ travellers: 0 }, { email: 'invalid' }, { consent: false }, { hp: 'bot' }, { endDate: '2026-02-30' }, { startDate: '2027-05-04', endDate: '2027-05-01' }, { destination: '' }, { phone: '-------' }]) assert.equal((await call('/requests', { method: 'POST', body: payload(override) })).status, 400);
  assert.equal((await call('/login', { method: 'POST', body: { email: 'owner@example.com', password: 'incorrect' } })).status, 401);
  const login = await call('/login', { method: 'POST', body: { email: 'owner@example.com', password } });
  assert.equal(login.status, 200); ownerCookie = login.cookie;
  assert.ok(login.headers.get('set-cookie').includes('HttpOnly'));
  assert.ok(login.headers.get('set-cookie').includes('SameSite=Strict'));
  assert.equal((await call('/session', { cookie: ownerCookie })).data.user.role, 'owner');
});

test('one idempotency key creates one saved request and conflicts on changed payload', async () => {
  const body = payload();
  const first = await call('/requests', { method: 'POST', body });
  const retry = await call('/requests', { method: 'POST', body });
  assert.equal(first.status, 201); assert.equal(retry.status, 201);
  assert.equal(first.data.reference, retry.data.reference); assert.equal(first.data.accessToken, retry.data.accessToken);
  accessToken = first.data.accessToken; reference = first.data.reference;
  const dashboard = await call('/dashboard', { cookie: ownerCookie });
  assert.equal(dashboard.data.requests.length, 1); requestId = dashboard.data.requests[0].id;
  assert.equal((await call('/requests', { method: 'POST', body: { ...body, travellers: 3 } })).status, 409);
  assert.equal((await call('/request', { token: reference })).status, 401);
  const tracking = await call('/request', { token: accessToken });
  assert.equal(tracking.data.request.reference, reference);
  for (const secret of ['assignedTo', 'dueDate', 'tokenHash', 'idempotencyKey']) assert.equal(secret in tracking.data.request, false);
});

test('owner adds staff; staff cannot change owner-only trip settings or export', async () => {
  const added = await call('/staff', { method: 'POST', cookie: ownerCookie, body: { name: 'Trip coordinator', email: 'staff@example.com', password: 'Another sufficiently long password' } });
  assert.equal(added.status, 201); staffId = added.data.user.id;
  const login = await call('/login', { method: 'POST', body: { email: 'staff@example.com', password: 'Another sufficiently long password' } });
  staffCookie = login.cookie;
  assert.equal((await call('/trips/benta-river-falls', { method: 'PATCH', cookie: staffCookie, body: { capacity: 20 } })).status, 403);
  assert.equal((await call('/export', { cookie: staffCookie })).status, 403);
  const trip = await call('/trips/benta-river-falls', { method: 'PATCH', cookie: ownerCookie, body: { capacity: 20 } });
  assert.equal(trip.data.trip.capacity, 20); assert.equal(trip.data.trip.remaining, null);
});

test('staff notes stay private and concurrent revision checks prevent silent overwrites', async () => {
  const detail = await call(`/requests/${requestId}`, { cookie: ownerCookie });
  const revision = detail.data.request.revision;
  const changes = await Promise.all([
    call(`/requests/${requestId}`, { method: 'PATCH', cookie: ownerCookie, revision, body: { assignedTo: staffId, status: 'awaiting_customer', customerUpdate: 'Please tell us your preferred month.' } }),
    call(`/requests/${requestId}`, { method: 'PATCH', cookie: staffCookie, revision, body: { status: 'closed' } })
  ]);
  assert.deepEqual(changes.map(value => value.status).sort(), [200, 409]);
  await call(`/requests/${requestId}/notes`, { method: 'POST', cookie: staffCookie, body: { message: 'Internal supplier notes should never reach the traveller.' } });
  const tracking = await call('/request', { token: accessToken });
  assert.equal(JSON.stringify(tracking.data).includes('Internal supplier'), false);
  assert.equal(tracking.data.request.customerMessages[0].author, 'team');
  const reply = await call('/request/reply', { method: 'POST', token: accessToken, body: { message: 'We prefer May.' } });
  assert.equal(reply.data.request.status, 'in_review');
  assert.equal(reply.data.request.customerMessages.at(-1).author, 'customer');
});

test('draft itineraries stay private; publishing and acceptance require exact versions', async () => {
  const body = { title: 'Japan at your pace', summary: 'A proposed journey, subject to discussion.', days: [{ date: '2027-05-01', title: 'Arrive in Tokyo', details: 'Transfer and settle in.' }], customerNote: 'Please review the proposed timing.' };
  const saved = await call(`/requests/${requestId}/plan`, { method: 'PUT', cookie: staffCookie, body });
  assert.equal(saved.status, 200); assert.equal(saved.data.plan.draft.version, 1);
  assert.equal((await call('/request', { token: accessToken })).data.plan, null);
  assert.equal((await call(`/requests/${requestId}/plan/publish`, { method: 'POST', cookie: staffCookie, body: { version: 100 } })).status, 409);
  await call(`/requests/${requestId}/plan/publish`, { method: 'POST', cookie: staffCookie, body: { version: 1 } });
  const publicPlan = (await call('/request', { token: accessToken })).data.plan;
  assert.equal(publicPlan.title, body.title); assert.equal(publicPlan.acceptedAt, null);
  assert.equal((await call('/request/accept-plan', { method: 'POST', token: accessToken, body: { version: 2 } })).status, 409);
  assert.ok((await call('/request/accept-plan', { method: 'POST', token: accessToken, body: { version: 1 } })).data.plan.acceptedAt);
  const acceptedAt = (await call('/request', { token: accessToken })).data.plan.acceptedAt;
  await call(`/requests/${requestId}/plan/publish`, { method: 'POST', cookie: staffCookie, body: { version: 1 } });
  assert.equal((await call('/request', { token: accessToken })).data.plan.acceptedAt, acceptedAt);
  const next = await call(`/requests/${requestId}/plan`, { method: 'PUT', cookie: staffCookie, body: { ...body, title: 'A revised journey' } });
  assert.equal(next.data.plan.draft.version, 2);
  assert.equal((await call('/request', { token: accessToken })).data.plan.version, 1);
  await call(`/requests/${requestId}/plan/publish`, { method: 'POST', cookie: staffCookie, body: { version: 2 } });
  assert.equal((await call('/request/accept-plan', { method: 'POST', token: accessToken, body: { version: 1 } })).status, 409);
  assert.equal((await call('/request', { token: accessToken })).data.plan.acceptedAt, null);
});

test('closed trips reject registrations and capacities never reserve seats', async () => {
  await call('/trips/jamwest-negril', { method: 'PATCH', cookie: ownerCookie, body: { status: 'closed' } });
  assert.equal((await call('/requests', { method: 'POST', body: payload({ kind: 'registration', tripId: 'jamwest-negril' }) })).status, 400);
  const first = await call('/requests', { method: 'POST', body: payload({ kind: 'registration', tripId: 'benta-river-falls', travellers: 30 }) });
  assert.equal(first.status, 201); assert.equal(first.data.status, 'received');
  assert.equal((await call('/trips')).data.trips.find(value => value.id === 'benta-river-falls').remaining, null);
});

test('owner creates and edits departure content; public registration uses the live catalogue', async () => {
  const body = { name: 'A client-created departure', date: '2027-01-23', advertisedPrice: 'Contact us for pricing', includes: ['Transportation', 'Guided visit'], departurePoint: 'Client-confirmed pickup location', status: 'enquiries_open', capacity: null };
  assert.equal((await call('/trips', { method: 'POST', cookie: staffCookie, body })).status, 403);
  assert.equal((await call('/trips', { method: 'POST', cookie: ownerCookie, body: { ...body, bookingGuaranteed: true } })).status, 400);
  assert.equal((await call('/trips', { method: 'POST', cookie: ownerCookie, body: { ...body, date: '2026-01-01' } })).status, 400);
  const created = await call('/trips', { method: 'POST', cookie: ownerCookie, body });
  assert.equal(created.status, 201); assert.equal(created.data.trip.remaining, null);
  const { id, revision } = created.data.trip;
  const edited = await call('/trips/' + id, { method: 'PATCH', cookie: ownerCookie, revision, body: { name: 'A revised client departure', date: '2027-01-24', capacity: 25 } });
  assert.equal(edited.status, 200); assert.equal(edited.data.trip.displayDate, '24 January 2027');
  assert.equal((await call('/trips/' + id, { method: 'PATCH', cookie: ownerCookie, revision, body: { status: 'closed' } })).status, 409);
  const catalogue = await call('/trips');
  assert.equal(catalogue.data.trips.find(value => value.id === id).name, 'A revised client departure');
  assert.equal((await call('/requests', { method: 'POST', body: payload({ kind: 'registration', tripId: id }) })).status, 201);
});

test('simultaneous submissions all persist exactly once', async () => {
  const requests = Array.from({ length: 20 }, (_, index) => payload({ name: `Concurrent traveller ${index}` }));
  const results = await Promise.all(requests.map(body => call('/requests', { method: 'POST', body, ip: 'concurrency-test' })));
  assert.ok(results.every(value => value.status === 201));
  const refs = new Set(results.map(value => value.data.reference)); assert.equal(refs.size, 20);
  const dashboard = await call('/dashboard', { cookie: ownerCookie });
  assert.ok(results.every(value => dashboard.data.requests.some(request => request.reference === value.data.reference)));
});

test('records survive server restart and database does not contain raw PII or access tokens', async () => {
  handle.close();
  const file = await readFile(env.OPS_DB_PATH);
  assert.equal(file.includes(Buffer.from('traveller@example.com')), false);
  assert.equal(file.includes(Buffer.from(accessToken)), false);
  handle = await createOperationsHandler({ env, now: () => clock, rateLimits: { submission: [100, 3600000], login: [100, 900000], customer: [100, 3600000] } });
  assert.equal((await call('/request', { token: accessToken })).data.request.reference, reference);
  assert.equal((await call('/session', { cookie: ownerCookie })).status, 200);
});

test('password changes revoke prior sessions; disabling staff revokes access and reassigns requests', async () => {
  const changed = await call('/password', { method: 'POST', cookie: ownerCookie, body: { currentPassword: password, newPassword: 'A fresh owner password sufficiently long' } });
  assert.equal(changed.status, 200);
  assert.equal((await call('/session', { cookie: ownerCookie })).status, 401); ownerCookie = changed.cookie;
  assert.equal((await call('/staff/' + staffId + '/disable', { method: 'POST', cookie: staffCookie, body: {} })).status, 403);
  assert.equal((await call('/staff/' + staffId + '/disable', { method: 'POST', cookie: ownerCookie, body: {} })).status, 200);
  assert.equal((await call('/session', { cookie: staffCookie })).status, 401);
  const detail = await call('/requests/' + requestId, { cookie: ownerCookie });
  assert.notEqual(detail.data.request.assignedTo, staffId);
  const backup = await call('/export', { cookie: ownerCookie });
  assert.equal(backup.status, 200);
  for (const forbidden of ['passwordHash', 'tokenHash', 'accessToken', 'sessions', 'idempotency']) assert.equal(JSON.stringify(backup.data).includes(`"${forbidden}"`), false);
});

test('rate limits persist and expire; public access tokens expire independently of references', async () => {
  handle.close();
  handle = await createOperationsHandler({ env, now: () => clock, rateLimits: { submission: [2, 3600000], login: [2, 900000], customer: [2, 3600000] } });
  for (let i = 0; i < 2; i++) assert.equal((await call('/requests', { method: 'POST', body: payload(), ip: 'abuse-test' })).status, 201);
  assert.equal((await call('/requests', { method: 'POST', body: payload(), ip: 'abuse-test' })).status, 429);
  handle.close(); handle = await createOperationsHandler({ env, now: () => clock, rateLimits: { submission: [2, 3600000], login: [2, 900000], customer: [2, 3600000] } });
  assert.equal((await call('/requests', { method: 'POST', body: payload(), ip: 'abuse-test' })).status, 429);
  clock += 3600001;
  assert.equal((await call('/requests', { method: 'POST', body: payload(), ip: 'abuse-test' })).status, 201);
  clock += 181 * 86400000;
  assert.equal((await call('/request', { token: accessToken })).status, 401);
});

test('production refuses missing keys, insecure origin and ephemeral SQLite', async () => {
  await assert.rejects(configureOperations({ NODE_ENV: 'production' }), /requires independent/);
  await assert.rejects(configureOperations({ ...env, NODE_ENV: 'production' }), /HTTPS/);
  await assert.rejects(configureOperations({ ...env, NODE_ENV: 'production', OPS_ORIGIN: 'https://example.com' }), /Ephemeral serverless SQLite/);
});

test('strong-consistency conditional storage retries races without losing mutations', async () => {
  let entry = null, version = 0, conflicts = 0;
  const client = {
    async getWithMetadata(key, options) {
      assert.equal(key, 'state'); assert.equal(options.consistency, 'strong');
      const snapshot = entry && { ...entry }; await new Promise(resolve => setTimeout(resolve, 2)); return snapshot;
    },
    async set(key, data, condition) {
      const matched = entry ? condition.onlyIfMatch === entry.etag : condition.onlyIfNew === true;
      if (!matched) { conflicts++; return { modified: false }; }
      entry = { data, etag: `"${++version}"` }; return { modified: true, etag: entry.etag };
    }
  };
  const store = await createBlobStore(createSecurity(env), { client });
  await store.transact(() => ({ state: { values: [] } }));
  await Promise.all(Array.from({ length: 6 }, (_, number) => store.transact(state => { state.values.push(number); return { state, value: number }; })));
  assert.deepEqual((await store.read()).values.sort(), [0, 1, 2, 3, 4, 5]); assert.ok(conflicts > 0);
});

test('Netlify SDK cannot falsely acknowledge a failed conditional write', async () => {
  const store = await createBlobStore(createSecurity(env), {
    siteID: 'operations-test', token: 'fixture-not-real-token', apiURL: 'https://fixture.example',
    fetch: async (url, options) => {
      if (String(url).includes('/api/v1/')) return new Response(JSON.stringify({ url: 'https://signed.fixture.example/state' }), { status: 200, headers: { 'content-type': 'application/json' } });
      if (String(options.method).toUpperCase() === 'GET') return new Response(null, { status: 404 });
      return new Response('Temporary write failure', { status: 503 });
    }
  });
  await assert.rejects(store.transact(() => ({ state: { accepted: true }, value: 'would-be-success' })), /Durable operations write failed/);
});
