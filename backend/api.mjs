import { randomUUID, randomBytes } from 'node:crypto';
import { digest, randomToken, hashPassword, verifyPassword } from './security.mjs';
import { configureOperations } from './config.mjs';

const STATUSES = ['received', 'in_review', 'awaiting_customer', 'planning', 'ready', 'closed', 'cancelled'];
const SESSION_MS = 8 * 3600000;
const ACCESS_MS = 180 * 86400000;
const localDate = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Jamaica', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
const fail = (status, message) => { const error = new Error(message); error.status = status; throw error; };
const own = (obj, key) => Object.hasOwn(obj, key);
function text(value, label, max = 200, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') fail(400, `${label} must be text.`);
  const clean = value.trim().normalize('NFC');
  if ((required && !clean) || clean.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(clean)) fail(400, `Please provide a valid ${label.toLowerCase()}${max ? ` (up to ${max} characters)` : ''}.`);
  return clean;
}
function email(value) {
  const result = text(value, 'Email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) fail(400, 'Please provide a valid email address.');
  return result;
}
function date(value, label, required = false) {
  const result = text(value, label, 10, required);
  if (result && (!/^\d{4}-\d{2}-\d{2}$/.test(result) || Number.isNaN(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result)) fail(400, `Please provide a valid ${label.toLowerCase()}.`);
  return result;
}
function validateTrip(payload, current, config) {
  const allowed = ['name', 'date', 'advertisedPrice', 'includes', 'departurePoint', 'status', 'capacity', ...(current ? [] : ['id'])];
  if (Object.keys(payload).some(key => !allowed.includes(key))) fail(400, 'Unsupported departure update.');
  const proposed = { ...(current || {}), ...payload };
  const name = text(proposed.name, 'Departure name', 160, true);
  const travelDate = date(proposed.date, 'Departure date', true);
  const advertisedPrice = text(proposed.advertisedPrice, 'Advertised price', 100);
  const departurePoint = text(proposed.departurePoint, 'Departure point', 240, true);
  const status = proposed.status || 'enquiries_open';
  if (!['enquiries_open', 'closed'].includes(status)) fail(400, 'Choose an enquiry status.');
  if (status === 'enquiries_open' && travelDate < localDate(config.now())) fail(400, 'A past departure must be closed to new enquiries.');
  if (!Array.isArray(proposed.includes) || proposed.includes.length > 20) fail(400, 'Provide up to 20 included items.');
  const includes = proposed.includes.map(value => text(value, 'Included item', 160, true));
  const capacity = proposed.capacity ?? null;
  if (capacity !== null && (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)) fail(400, 'Capacity must be a positive whole number or null.');
  return { name, date: travelDate, displayDate: new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Jamaica' }).format(new Date(`${travelDate}T12:00:00Z`)), advertisedPrice, includes, departurePoint, status, capacity, remaining: null };
}
function initialState(config) {
  if (!config.adminEmail || !/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(config.adminPasswordHash || '')) fail(503, 'The staff workspace has not been configured.');
  return {
    schema: 1, requests: [], plans: {}, activity: [], notes: {}, sessions: [], rates: {}, idempotency: {},
    staff: [{ id: randomUUID(), name: config.adminName, email: config.adminEmail, role: 'owner', passwordHash: config.adminPasswordHash, createdAt: new Date(config.now()).toISOString() }],
    trips: config.seedTrips.map(trip => ({ ...trip, departurePoint: trip.departurePoint || trip.departure, capacity: null, remaining: null, status: 'enquiries_open', revision: 1 }))
  };
}
const safeStaff = person => ({ id: person.id, name: person.name, email: person.email, role: person.role, disabled: person.disabled === true });
const safeTrip = trip => ({ id: trip.id, name: trip.name, date: trip.date, displayDate: trip.displayDate, advertisedPrice: trip.advertisedPrice, includes: trip.includes, departurePoint: trip.departurePoint, capacity: trip.capacity, remaining: null, status: trip.status, revision: trip.revision });
function safeRequest(request) {
  const { tokenHash, tokenExpiresAt, idempotencyKey, ...safe } = request;
  return safe;
}
function publicRequest(request) {
  const keys = ['reference', 'kind', 'tripId', 'name', 'email', 'phone', 'travellers', 'destination', 'startDate', 'endDate', 'flexibleDates', 'budget', 'currency', 'preferences', 'status', 'createdAt', 'updatedAt', 'customerUpdate', 'customerMessages'];
  return Object.fromEntries(keys.filter(key => request[key] !== undefined).map(key => [key, request[key]]));
}
function appendActivity(state, config, requestId, type, message, actor = 'System') {
  const event = { id: randomUUID(), requestId, type, message, actor, createdAt: new Date(config.now()).toISOString() };
  state.activity.push(event); return event;
}
function cleanState(state, now) {
  state.sessions = state.sessions.filter(session => session.expiresAt > now);
  for (const [key, rate] of Object.entries(state.rates)) if (rate.expiresAt <= now) delete state.rates[key];
  for (const [key, value] of Object.entries(state.idempotency)) if (value.expiresAt <= now) delete state.idempotency[key];
}
function actorFrom(state, req, config, owner = false) {
  const cookie = (req.headers.get('cookie') || '').split(';').map(value => value.trim()).find(value => value.startsWith('eezee_ops='));
  const token = cookie?.slice('eezee_ops='.length);
  const session = token && state.sessions.find(value => value.hash === config.security.tokenHash(token) && value.expiresAt > config.now());
  const actor = session && state.staff.find(value => value.id === session.userId && !value.disabled);
  if (!actor) fail(401, 'Please sign in to the staff workspace.');
  if (owner && actor.role !== 'owner') fail(403, 'Only the owner can perform this action.');
  return actor;
}
function customerFrom(state, req, config) {
  const bearer = req.headers.get('authorization') || '';
  const token = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(bearer)?.[1];
  const request = token && state.requests.find(value => value.tokenHash === config.security.tokenHash(token) && value.tokenExpiresAt > config.now());
  if (!request) fail(401, 'This private request link is invalid or has expired.');
  return request;
}
function enforceRevision(req, current) {
  const match = req.headers.get('if-match');
  if (match && match.replaceAll('"', '') !== String(current.revision)) fail(409, 'This request was updated by someone else. Reload it before saving.');
}
function rateKey(req, config, category) {
  // Netlify supplies x-nf-client-connection-ip; the loopback server supplies its
  // own IP header and never trusts a browser-supplied forwarded-for header.
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-ops-local-ip') || 'unknown';
  return config.security.tokenHash(`${category}:${ip}`);
}
function enforceRate(state, req, config, category) {
  const [limit, windowMs] = config.rateLimits[category];
  const key = rateKey(req, config, category);
  let record = state.rates[key];
  if (!record || record.expiresAt <= config.now()) record = state.rates[key] = { count: 0, expiresAt: config.now() + windowMs };
  record.count++;
  return record.count <= limit;
}
function customerPayload(payload) {
  if (!['registration', 'planning'].includes(payload.kind)) fail(400, 'Choose trip registration or travel planning.');
  if (payload.consent !== true) fail(400, 'Please agree to be contacted about this request.');
  if (payload.hp) fail(400, 'Unable to accept this submission.');
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(payload.idempotencyKey || '')) fail(400, 'A valid submission key is required. Reload the form and try again.');
  const phone = text(payload.phone, 'Phone', 40, true);
  if (!/^[+\d() .-]{7,40}$/.test(phone) || phone.replace(/\D/g, '').length < 7) fail(400, 'Please provide a valid contact phone number.');
  if (!Number.isInteger(payload.travellers) || payload.travellers < 1 || payload.travellers > 50) fail(400, 'Travellers must be a whole number from 1 to 50.');
  const startDate = date(payload.startDate, 'Start date');
  const endDate = date(payload.endDate, 'End date');
  if (startDate && endDate && startDate > endDate) fail(400, 'End date must follow the start date.');
  const destination = text(payload.destination, 'Destination', 160, payload.kind === 'planning');
  if (payload.flexibleDates != null && typeof payload.flexibleDates !== 'boolean') fail(400, 'Flexible dates must be true or false.');
  const currency = text(payload.currency, 'Currency', 10);
  if (currency && !['JMD', 'USD', 'CAD', 'GBP', 'EUR', 'other'].includes(currency)) fail(400, 'Choose a supported budget currency.');
  return { kind: payload.kind, tripId: payload.kind === 'registration' ? text(payload.tripId, 'Trip', 80, true) : '', name: text(payload.name, 'Name', 120, true), email: email(payload.email), phone, travellers: payload.travellers, destination, startDate, endDate, flexibleDates: payload.flexibleDates === true, budget: text(payload.budget == null ? '' : String(payload.budget), 'Budget', 100), currency, preferences: text(payload.preferences, 'Preferences', 4000), consent: true };
}
async function jsonBody(req) {
  if (!req.headers.get('content-type')?.toLowerCase().startsWith('application/json')) fail(415, 'Send JSON data.');
  if (Number(req.headers.get('content-length')) > 32768) fail(413, 'This request is too large.');
  const reader = req.body?.getReader();
  const chunks = []; let bytes = 0;
  if (reader) {
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        bytes += value.byteLength;
        if (bytes > 32768) { await reader.cancel(); fail(413, 'This request is too large.'); }
        chunks.push(Buffer.from(value));
      }
    } finally { reader.releaseLock(); }
  }
  const content = Buffer.concat(chunks).toString('utf8');
  try { const value = JSON.parse(content); if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(); return value; }
  catch { fail(400, 'Invalid form data.'); }
}
function response(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', ...extra } });
}
function sessionCookie(token, config, clear = false) {
  return `eezee_ops=${clear ? '' : token}; HttpOnly; SameSite=Strict; Path=/api/operations; Max-Age=${clear ? 0 : SESSION_MS / 1000}${config.production ? '; Secure' : ''}`;
}
function validateOrigin(req, config) {
  const expected = config.origin || new URL(req.url).origin;
  const origin = req.headers.get('origin');
  if (origin !== expected || req.headers.get('sec-fetch-site') === 'cross-site') fail(403, 'This action must be performed from the website.');
}

export async function createOperationsHandler(options = {}) {
  const config = options.config || await configureOperations(options.env || process.env, options);
  // Bootstrap is itself a durable conditional write, safe across function starts.
  await config.store.transact(state => state ? { value: null } : { state: initialState(config), value: null });
  const transact = update => config.store.transact(state => {
    cleanState(state, config.now());
    const value = update(state); return { state, value };
  });
  const handler = async req => {
    try {
      const path = new URL(req.url).pathname.replace(/^\/api\/operations\/?/, '/').replace(/\/$/, '') || '/';
      const method = req.method.toUpperCase();
      if (path === '/trips' && method === 'GET') return response({ trips: (await config.store.read()).trips.map(safeTrip) });
      if (!['GET', 'POST', 'PUT', 'PATCH'].includes(method)) fail(405, 'Method not allowed.');
      if (method !== 'GET') validateOrigin(req, config);
      const body = method === 'GET' ? null : await jsonBody(req);

      if (path === '/requests' && method === 'POST') {
        const payload = customerPayload(body);
        const payloadHash = digest(JSON.stringify(payload));
        const result = await transact(state => {
          const existing = state.idempotency[body.idempotencyKey];
          if (existing) {
            if (existing.payloadHash !== payloadHash) fail(409, 'This submission key was already used for different details.');
            const request = state.requests.find(value => value.id === existing.id);
            return { reference: request.reference, accessToken: existing.accessToken, status: request.status, request: publicRequest(request) };
          }
          if (!enforceRate(state, req, config, 'submission')) return { rateLimited: true };
          const trip = payload.kind === 'registration' && state.trips.find(value => value.id === payload.tripId);
          if (payload.kind === 'registration' && (!trip || trip.status !== 'enquiries_open')) fail(400, 'This trip is not accepting new registration requests.');
          if (trip && trip.date < localDate(config.now())) fail(400, 'This advertised departure has passed. Contact the team for current trips.');
          const token = randomToken(), now = new Date(config.now()).toISOString();
          const staff = state.staff.filter(person => person.role === 'staff' && !person.disabled);
          const assignee = staff.sort((a, b) => state.requests.filter(value => value.assignedTo === a.id && !['closed', 'cancelled'].includes(value.status)).length - state.requests.filter(value => value.assignedTo === b.id && !['closed', 'cancelled'].includes(value.status)).length)[0] || state.staff.find(person => person.role === 'owner');
          let reference;
          do { reference = `EG-${randomBytes(4).toString('hex').toUpperCase()}`; } while (state.requests.some(value => value.reference === reference));
          const request = { ...payload, consentAt: now, privacyVersion: '2026-10-09', id: randomUUID(), reference, tokenHash: config.security.tokenHash(token), tokenExpiresAt: config.now() + ACCESS_MS, status: 'received', assignedTo: assignee.id, dueDate: localDate(config.now() + 86400000), createdAt: now, updatedAt: now, revision: 1, customerUpdate: 'Your request is saved. The team will review your details and contact you. This acknowledgement does not confirm a booking.', customerMessages: [] };
          state.requests.push(request);
          state.idempotency[body.idempotencyKey] = { id: request.id, payloadHash, accessToken: token, expiresAt: config.now() + 7 * 86400000 };
          appendActivity(state, config, request.id, 'received', 'Request received and assigned for review.');
          return { reference, accessToken: token, status: 'received', request: publicRequest(request) };
        });
        if (result.rateLimited) return response({ error: 'Too many submissions. Please try again later or contact the team.' }, 429, { 'Retry-After': '3600' });
        return response(result, 201);
      }

      if (path === '/request' && method === 'GET') {
        const state = await config.store.read(), request = customerFrom(state, req, config);
        return response({ request: publicRequest(request), trip: request.tripId ? safeTrip(state.trips.find(value => value.id === request.tripId)) : null, plan: state.plans[request.id]?.published || null });
      }
      if (['/request/reply', '/request/accept-plan'].includes(path) && method === 'POST') {
        const result = await transact(state => {
          const request = customerFrom(state, req, config);
          if (!enforceRate(state, req, config, 'customer')) return { rateLimited: true };
          if (['closed', 'cancelled'].includes(request.status)) fail(409, 'This request is closed. Contact the team to reopen it.');
          if (path.endsWith('/reply')) {
            const message = text(body.message, 'Message', 3000, true);
            request.customerMessages.push({ id: randomUUID(), author: 'customer', message, createdAt: new Date(config.now()).toISOString() });
            if (request.status === 'awaiting_customer') request.status = 'in_review';
            appendActivity(state, config, request.id, 'customer_reply', 'Customer added a message.', request.name);
          } else {
            const published = state.plans[request.id]?.published;
            if (!published || body.version !== published.version) fail(409, 'The itinerary has changed. Refresh and review the latest version before accepting.');
            if (!published.acceptedAt) {
              published.acceptedAt = new Date(config.now()).toISOString();
              appendActivity(state, config, request.id, 'plan_accepted', `Customer accepted itinerary version ${published.version}.`, request.name);
            }
          }
          request.revision++; request.updatedAt = new Date(config.now()).toISOString();
          return { request: publicRequest(request), plan: state.plans[request.id]?.published || null };
        });
        return result.rateLimited ? response({ error: 'Too many updates. Please try again later.' }, 429, { 'Retry-After': '3600' }) : response(result);
      }

      if (path === '/login' && method === 'POST') {
        const loginEmail = email(body.email), password = text(body.password, 'Password', 256, true);
        const result = await transact(state => {
          if (!enforceRate(state, req, config, 'login')) return { rateLimited: true };
          const user = state.staff.find(person => person.email === loginEmail && !person.disabled);
          if (!verifyPassword(password, user?.passwordHash)) return { invalid: true };
          const token = randomToken();
          state.sessions.push({ hash: config.security.tokenHash(token), userId: user.id, expiresAt: config.now() + SESSION_MS });
          return { token, user: safeStaff(user) };
        });
        if (result.rateLimited) return response({ error: 'Too many sign-in attempts. Please try again in 15 minutes.' }, 429, { 'Retry-After': '900' });
        if (result.invalid) return response({ error: 'Email or password is incorrect.' }, 401);
        return response({ user: result.user }, 200, { 'Set-Cookie': sessionCookie(result.token, config) });
      }
      if (path === '/logout' && method === 'POST') {
        await transact(state => { const actor = actorFrom(state, req, config); const token = /eezee_ops=([^;]+)/.exec(req.headers.get('cookie') || '')?.[1]; state.sessions = state.sessions.filter(value => value.hash !== config.security.tokenHash(token)); return { user: actor.id }; });
        return response({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', config, true) });
      }

      const state = await config.store.read();
      const actor = actorFrom(state, req, config);
      if (path === '/session' && method === 'GET') return response({ user: safeStaff(actor) });
      if (path === '/password' && method === 'POST') {
        const currentPassword = text(body.currentPassword, 'Current password', 256, true), newPassword = text(body.newPassword, 'New password', 256, true);
        if (newPassword.length < 14) fail(400, 'Use a password with at least 14 characters.');
        const result = await transact(fresh => {
          const who = actorFrom(fresh, req, config);
          if (!enforceRate(fresh, req, config, 'login')) return { rateLimited: true };
          if (!verifyPassword(currentPassword, who.passwordHash)) return { invalid: true };
          who.passwordHash = hashPassword(newPassword);
          fresh.sessions = fresh.sessions.filter(value => value.userId !== who.id);
          const token = randomToken(); fresh.sessions.push({ hash: config.security.tokenHash(token), userId: who.id, expiresAt: config.now() + SESSION_MS });
          appendActivity(fresh, config, null, 'password_changed', 'Password changed and previous sessions revoked.', who.name);
          return { token, user: safeStaff(who) };
        });
        if (result.rateLimited) return response({ error: 'Too many attempts. Please try again later.' }, 429);
        if (result.invalid) return response({ error: 'Current password is incorrect.' }, 401);
        return response({ user: result.user }, 200, { 'Set-Cookie': sessionCookie(result.token, config) });
      }
      if (path === '/export' && method === 'GET') {
        actorFrom(state, req, config, true);
        // This owner-only plaintext export is an intentional customer-data backup.
        // Credential hashes, session secrets and private access tokens are omitted.
        return response({ schema: state.schema, exportedAt: new Date(config.now()).toISOString(), requests: state.requests.map(safeRequest), plans: state.plans, notes: state.notes, trips: state.trips.map(safeTrip), staff: state.staff.map(safeStaff), activity: state.activity }, 200, { 'Content-Disposition': 'attachment; filename="eezee-go-operations-backup.json"' });
      }
      const disableMatch = /^\/staff\/([a-f0-9-]+)\/disable$/.exec(path);
      if (disableMatch && method === 'POST') {
        const result = await transact(fresh => {
          const who = actorFrom(fresh, req, config, true), target = fresh.staff.find(value => value.id === disableMatch[1]);
          if (!target) fail(404, 'Team member not found.');
          if (target.id === who.id || target.role === 'owner') fail(400, 'The owner account cannot be disabled here.');
          target.disabled = true; fresh.sessions = fresh.sessions.filter(value => value.userId !== target.id);
          for (const request of fresh.requests.filter(value => value.assignedTo === target.id && !['closed', 'cancelled'].includes(value.status))) { request.assignedTo = who.id; request.revision++; request.updatedAt = new Date(config.now()).toISOString(); }
          appendActivity(fresh, config, null, 'staff_disabled', `${target.name} disabled; open requests reassigned to owner.`, who.name);
          return { user: safeStaff(target) };
        }); return response(result);
      }
      if (path === '/dashboard' && method === 'GET') {
        const requests = state.requests.map(safeRequest).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        const today = localDate(config.now());
        return response({ summary: { total: requests.length, new: requests.filter(value => value.status === 'received').length, overdue: requests.filter(value => value.dueDate && value.dueDate < today && !['closed', 'cancelled'].includes(value.status)).length, planning: requests.filter(value => value.kind === 'planning' && !['closed', 'cancelled'].includes(value.status)).length }, requests, trips: state.trips.map(safeTrip), staff: state.staff.map(safeStaff), activity: state.activity.slice(-60).reverse() });
      }
      const requestMatch = /^\/requests\/([a-f0-9-]+)(?:\/(notes|plan)(?:\/(publish))?)?$/.exec(path);
      if (requestMatch) {
        const [, id, section, action] = requestMatch;
        const current = state.requests.find(value => value.id === id);
        if (!current) fail(404, 'Request not found.');
        if (method === 'GET' && !section) return response({ request: safeRequest(current), plan: state.plans[id] || null, notes: state.notes[id] || [], activity: state.activity.filter(value => value.requestId === id).reverse() }, 200, { ETag: `"${current.revision}"` });
        const result = await transact(fresh => {
          const who = actorFrom(fresh, req, config), request = fresh.requests.find(value => value.id === id);
          enforceRevision(req, request);
          if (method === 'PATCH' && !section) {
            const allowed = ['status', 'assignedTo', 'dueDate', 'customerUpdate'];
            if (Object.keys(body).some(key => !allowed.includes(key))) fail(400, 'Unsupported request update.');
            if (own(body, 'status')) { if (!STATUSES.includes(body.status)) fail(400, 'Choose a valid request status.'); request.status = body.status; }
            if (own(body, 'assignedTo')) { if (body.assignedTo !== null && !fresh.staff.some(value => value.id === body.assignedTo && !value.disabled)) fail(400, 'Choose a valid team member.'); request.assignedTo = body.assignedTo; }
            if (own(body, 'dueDate')) request.dueDate = date(body.dueDate, 'Follow-up date');
            if (own(body, 'customerUpdate')) {
              const update = text(body.customerUpdate, 'Customer update', 3000);
              request.customerUpdate = update;
              if (update) request.customerMessages.push({ id: randomUUID(), author: 'team', message: update, createdAt: new Date(config.now()).toISOString() });
            }
            appendActivity(fresh, config, id, 'updated', `Request updated: ${Object.keys(body).join(', ')}.`, who.name);
          } else if (method === 'POST' && section === 'notes') {
            const note = { id: randomUUID(), message: text(body.message, 'Note', 4000, true), author: who.name, createdAt: new Date(config.now()).toISOString() };
            (fresh.notes[id] ||= []).push(note); appendActivity(fresh, config, id, 'note_added', 'Internal note added.', who.name);
          } else if (method === 'PUT' && section === 'plan' && !action) {
            if (!Array.isArray(body.days) || body.days.length < 1 || body.days.length > 30) fail(400, 'An itinerary needs between 1 and 30 days.');
            const days = body.days.map(day => { if (!day || typeof day !== 'object' || Array.isArray(day)) fail(400, 'Provide valid itinerary days.'); return { date: date(day.date, 'Itinerary date'), title: text(day.title, 'Day title', 160, true), details: text(day.details, 'Day details', 2000, true) }; });
            const plan = fresh.plans[id] ||= { draft: null, published: null };
            plan.draft = { version: Math.max(plan.draft?.version || 0, plan.published?.version || 0) + 1, title: text(body.title, 'Itinerary title', 160, true), summary: text(body.summary, 'Itinerary summary', 3000), days, customerNote: text(body.customerNote, 'Customer note', 3000), updatedAt: new Date(config.now()).toISOString() };
            if (['received', 'in_review'].includes(request.status)) request.status = 'planning';
            appendActivity(fresh, config, id, 'plan_saved', `Itinerary draft version ${plan.draft.version} saved.`, who.name);
          } else if (method === 'POST' && section === 'plan' && action === 'publish') {
            const plan = fresh.plans[id];
            if (!plan?.draft || plan.draft.version !== body.version) fail(409, 'Reload the itinerary before publishing the current draft.');
            if (plan.published?.version === body.version) return { request: safeRequest(request), plan, notes: fresh.notes[id] || [], activity: fresh.activity.filter(value => value.requestId === id).reverse() };
            plan.published = { ...structuredClone(plan.draft), publishedAt: new Date(config.now()).toISOString(), acceptedAt: null };
            request.status = 'ready'; request.customerUpdate = 'Your proposed itinerary is ready to review. Please review it in your private request page.';
            request.customerMessages.push({ id: randomUUID(), author: 'team', message: request.customerUpdate, createdAt: new Date(config.now()).toISOString() });
            appendActivity(fresh, config, id, 'plan_published', `Itinerary version ${body.version} shared with customer.`, who.name);
          } else fail(405, 'Method not allowed.');
          request.revision++; request.updatedAt = new Date(config.now()).toISOString();
          return { request: safeRequest(request), plan: fresh.plans[id] || null, notes: fresh.notes[id] || [], activity: fresh.activity.filter(value => value.requestId === id).reverse() };
        });
        return response(result, 200, { ETag: `"${result.request.revision}"` });
      }
      const tripMatch = /^\/trips\/([a-z0-9-]+)$/.exec(path);
      if (path === '/trips' && method === 'POST') {
        const details = validateTrip(body, null, config);
        const proposedId = body.id ? text(body.id, 'Departure ID', 80, true) : `${details.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'departure'}-${randomBytes(3).toString('hex')}`;
        if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(proposedId)) fail(400, 'Departure ID must contain lowercase letters, numbers and hyphens.');
        const result = await transact(fresh => {
          const who = actorFrom(fresh, req, config, true);
          if (fresh.trips.some(value => value.id === proposedId)) fail(409, 'That departure ID already exists.');
          const trip = { id: proposedId, ...details, revision: 1 };
          fresh.trips.push(trip); appendActivity(fresh, config, null, 'trip_added', `${trip.name} departure added.`, who.name);
          return { trip: safeTrip(trip) };
        }); return response(result, 201);
      }
      if (tripMatch && method === 'PATCH') {
        const result = await transact(fresh => {
          const who = actorFrom(fresh, req, config, true), trip = fresh.trips.find(value => value.id === tripMatch[1]);
          if (!trip) fail(404, 'Trip not found.');
          enforceRevision(req, trip);
          Object.assign(trip, validateTrip(body, trip, config));
          trip.revision++; appendActivity(fresh, config, null, 'trip_updated', `${trip.name} enquiry settings updated.`, who.name);
          return { trip: safeTrip(trip) };
        }); return response(result);
      }
      if (path === '/staff' && method === 'POST') {
        const name = text(body.name, 'Team member name', 120, true), staffEmail = email(body.email), password = text(body.password, 'Password', 256, true);
        if (password.length < 14) fail(400, 'Use a password with at least 14 characters.');
        const encoded = hashPassword(password);
        const result = await transact(fresh => {
          const who = actorFrom(fresh, req, config, true);
          if (fresh.staff.some(value => value.email === staffEmail)) fail(409, 'That email already belongs to a team member.');
          const user = { id: randomUUID(), name, email: staffEmail, role: 'staff', passwordHash: encoded, createdAt: new Date(config.now()).toISOString() };
          fresh.staff.push(user); appendActivity(fresh, config, null, 'staff_added', `${name} added to the staff workspace.`, who.name);
          return { user: safeStaff(user) };
        }); return response(result, 201);
      }
      fail(404, 'Endpoint not found.');
    } catch (error) {
      if (!error.status) console.error('Operations failure:', error.message);
      return response({ error: error.status ? error.message : 'Unable to complete this request. Please try again.' }, error.status || 503);
    }
  };
  handler.close = () => config.store.close();
  return handler;
}

let runtime;
export async function handleOperations(request) {
  try { runtime ||= createOperationsHandler(); return await (await runtime)(request); }
  catch (error) { runtime = null; console.error('Operations unavailable:', error.message); return response({ error: 'The request system is not available yet. Please contact the team directly.' }, 503); }
}
