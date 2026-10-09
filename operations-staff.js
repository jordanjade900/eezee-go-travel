const apiBase = '/api/operations';
const root = document.querySelector('#workspace');
const detailDialog = document.querySelector('#request-dialog');
const confirmDialog = document.querySelector('#confirm-dialog');
const announcer = document.querySelector('#ops-announcement');
const statuses = { received: 'Received', in_review: 'In review', awaiting_customer: 'Awaiting customer', planning: 'Planning', ready: 'Ready', closed: 'Closed', cancelled: 'Cancelled' };
const state = { user: null, dashboard: null, tab: 'requests', search: '', kind: '', status: '', attention: '', detail: null, dirty: false, toastTimer: null };
confirmDialog.addEventListener('close', () => { confirmDialog.querySelectorAll('input[type="password"]').forEach(control => { control.value = ''; }); });

// All customer and staff text is inserted through textContent or form values.
// No records, passwords or session tokens are persisted in browser storage.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}
function append(parent, ...nodes) { nodes.flat().filter(Boolean).forEach(node => parent.append(node)); return parent; }
function button(text, className = 'ops-button', type = 'button') { const node = el('button', className, text); node.type = type; return node; }
function icon(name) { const img = el('img'); img.src = `../assets/icons/${name}.svg`; img.alt = ''; img.width = 20; img.height = 20; return img; }
function logo() {
  const node = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  node.classList.add('ops-logo'); node.setAttribute('viewBox', '40 170 1180 940'); node.setAttribute('role', 'img'); node.setAttribute('aria-label', 'EE-Zee Go Travel Limited');
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image'); image.setAttribute('href', '../assets/logo-web.webp'); image.setAttribute('width', '1254'); image.setAttribute('height', '1254'); node.append(image); return node;
}
function badge(status) { const node = el('span', 'ops-badge', statuses[status] || status || 'Not set'); node.dataset.state = status; return node; }
function date(value, withTime = false) {
  if (!value) return 'Not set';
  const parsed = new Date(value.length === 10 ? `${value}T12:00:00-05:00` : value);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return new Intl.DateTimeFormat('en-JM', withTime ? { timeZone: 'America/Jamaica', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' } : { timeZone: 'America/Jamaica', day: 'numeric', month: 'short', year: 'numeric' }).format(parsed);
}
function todayDate() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Jamaica', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
function active(request) { return !['closed', 'cancelled'].includes(request.status); }
function overdue(request) { return active(request) && request.dueDate && String(request.dueDate).slice(0, 10) < todayDate(); }
function staffName(id) { return state.dashboard?.staff?.find(person => person.id === id)?.name || 'Unassigned'; }
function destinationName(request) { return request.destination || state.dashboard?.trips?.find(trip => trip.id === request.tripId)?.name || 'Destination to discuss'; }
function kindName(kind) { return kind === 'registration' ? 'Trip registration' : kind === 'planning' ? 'Travel planning' : kind || 'Request'; }
function toast(message) {
  clearTimeout(state.toastTimer); (detailDialog.open ? detailDialog : document.body).append(announcer); announcer.textContent = message; announcer.hidden = false;
  state.toastTimer = setTimeout(() => { announcer.hidden = true; }, 5500);
}
class ApiError extends Error { constructor(message, status) { super(message); this.status = status; } }
async function api(path, { method = 'GET', body, revision } = {}) {
  let response;
  try {
    response = await fetch(`${apiBase}${path}`, { method, credentials: 'same-origin', headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(revision != null ? { 'If-Match': `"${revision}"` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), cache: 'no-store' });
  } catch { throw new ApiError('The server could not be reached. Check your connection and try again.', 0); }
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new ApiError('The secure workspace server is not available at this address. The page requires its configured operations server.', response.status || 503);
  let result;
  try { result = await response.json(); } catch { throw new ApiError('The server returned an unreadable response. Please try again.', response.status); }
  if (!response.ok) throw new ApiError(result.error || 'The request could not be completed.', response.status);
  return result;
}
function field(label, name, { type = 'text', value = '', options, hint, required = false, maxLength, rows, min, max, autocomplete } = {}) {
  const wrapper = el('div', 'ops-field'); const labelNode = el('label', '', label); const id = `ops-${name}-${Math.random().toString(36).slice(2, 8)}`; labelNode.htmlFor = id;
  let control;
  if (options) {
    control = el('select');
    for (const item of options) { const option = el('option', '', item.label); option.value = item.value; option.disabled = item.disabled === true; control.append(option); }
  } else if (type === 'textarea') { control = el('textarea'); if (rows) control.rows = rows; }
  else { control = el('input'); control.type = type; }
  control.id = id; control.name = name; control.value = value ?? ''; control.required = required;
  if (maxLength) control.maxLength = maxLength;
  if (min !== undefined) control.min = String(min);
  if (max !== undefined) control.max = String(max);
  if (autocomplete) control.autocomplete = autocomplete;
  append(wrapper, labelNode, control);
  if (hint) { const help = el('small', '', hint); help.id = `${id}-help`; control.setAttribute('aria-describedby', help.id); wrapper.append(help); }
  return wrapper;
}
function errorBlock(message, retry) {
  const node = el('div', 'ops-error'); node.setAttribute('role', 'alert'); node.append(el('p', '', message));
  if (retry) { const action = button('Try again', 'ops-button ops-secondary ops-small'); action.addEventListener('click', retry); node.append(action); }
  return node;
}
function busy(control, label = 'Saving…') {
  const original = control.textContent; control.disabled = true; control.textContent = label;
  return () => { control.disabled = false; control.textContent = original; };
}
function formError(form, error) {
  form.querySelector('.ops-error')?.remove();
  if (error.status === 401 && state.user) { sessionExpired(); return; }
  const requestConflict = error.status === 409 && detailDialog.contains(form) && state.detail?.request;
  const node = errorBlock(requestConflict ? 'This request changed while you were editing. Reload its latest version before saving; your changes have not overwritten anyone else’s work.' : error.message);
  if (requestConflict) {
    const reload = button('Reload latest request', 'ops-button ops-secondary ops-small');
    reload.addEventListener('click', async () => { if (await confirm('Reload this request?', 'Unsaved edits in this panel will be discarded. The latest saved information will be loaded.', 'Reload request')) { state.dirty = false; openRequest(state.detail.request.id); } }); node.append(reload);
  }
  form.append(node); node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
async function saveOnlyThis(form) {
  const otherEdits = [...detailDialog.querySelectorAll('form[data-edited="true"]')].filter(item => item !== form);
  if (!otherEdits.length) return true;
  return confirm('Save this section?', 'You have unsaved edits in another section of this request. Saving this section will reload the request and discard those other edits. Cancel to save them first.', 'Save and reload');
}
function confirm(title, message, action = 'Continue') {
  return new Promise(resolve => {
    confirmDialog.replaceChildren();
    const heading = el('h2', '', title); heading.id = 'confirm-heading';
    const cancel = button('Cancel', 'ops-button ops-secondary'); const accept = button(action, 'ops-button');
    append(confirmDialog, heading, el('p', '', message), append(el('div', 'ops-inline-actions'), cancel, accept));
    let finished = false;
    const finish = value => { if (finished) return; finished = true; confirmDialog.close(); confirmDialog.removeEventListener('cancel', onCancel); resolve(value); };
    const onCancel = event => { event.preventDefault(); finish(false); };
    confirmDialog.addEventListener('cancel', onCancel); cancel.addEventListener('click', () => finish(false)); accept.addEventListener('click', () => finish(true)); confirmDialog.showModal(); cancel.focus();
  });
}
function login(message = '') {
  state.user = null; state.dashboard = null; state.detail = null; state.dirty = false; detailDialog.close(); confirmDialog.close();
  const screen = el('section', 'ops-login');
  const story = el('div', 'ops-login-story');
  append(story, append(el('div', 'ops-login-brand'), logo(), el('span', '', 'EE-Zee Go Travel')));
  const copy = el('div'); const title = el('h1'); append(title, document.createTextNode('Every journey.'), el('br'), el('em', '', 'Thoughtfully managed.'));
  append(copy, title, el('p', '', 'One place for registrations, travel plans and the next conversation.')); story.append(copy); story.append(el('small', '', 'Private workspace · Authorised team members only'));
  const formWrap = el('div', 'ops-login-form-wrap'); const form = el('form', 'ops-login-form');
  append(form, el('span', 'ops-eyebrow', 'Your team’s desk'), el('h2', '', 'Welcome back.'), el('p', '', 'Sign in to keep your customers’ plans moving.'), field('Email address', 'email', { type: 'email', required: true, maxLength: 254, autocomplete: 'username' }), field('Password', 'password', { type: 'password', required: true, maxLength: 256, autocomplete: 'current-password' }));
  const submit = button('Sign in', 'ops-button', 'submit'); form.append(submit);
  if (message) form.append(errorBlock(message));
  append(form, el('div', 'ops-login-footer', 'Need access? Ask the owner to create your team account.'));
  const website = el('a', 'ops-text-button', 'Back to the website'); website.href = '../'; form.append(website);
  form.addEventListener('submit', async event => {
    event.preventDefault(); form.querySelector('.ops-error')?.remove(); const restore = busy(submit, 'Signing in…');
    try { const values = new FormData(form); const result = await api('/login', { method: 'POST', body: { email: values.get('email').trim(), password: values.get('password') } }); state.user = result.user; state.tab = 'requests'; await dashboard(); }
    catch (error) { formError(form, error); }
    finally { restore(); form.elements.password.value = ''; }
  });
  append(screen, story, append(formWrap, form)); root.replaceChildren(screen);
}
function sessionExpired() { login('Your session has ended. Sign in again to continue. Saved records are unchanged.'); }
function passwordDialog() {
  confirmDialog.replaceChildren();
  const title = el('h2', '', 'Change your password'); title.id = 'confirm-heading'; const form = el('form');
  append(form, title, el('p', '', 'Choose a unique password. Other signed-in sessions for your account will be ended.'), field('Current password', 'currentPassword', { type: 'password', required: true, autocomplete: 'current-password', maxLength: 256 }), field('New password', 'newPassword', { type: 'password', required: true, autocomplete: 'new-password', maxLength: 256, hint: 'Use at least 14 characters.' }));
  form.elements.newPassword.minLength = 14;
  const cancel = button('Cancel', 'ops-button ops-secondary'); const submit = button('Change password', 'ops-button', 'submit');
  cancel.addEventListener('click', () => { form.reset(); confirmDialog.close(); });
  append(form, append(el('div', 'ops-inline-actions'), cancel, submit)); confirmDialog.append(form);
  form.addEventListener('submit', async event => {
    event.preventDefault(); const restore = busy(submit); const values = new FormData(form);
    try { await api('/password', { method: 'POST', body: { currentPassword: values.get('currentPassword'), newPassword: values.get('newPassword') } }); form.reset(); confirmDialog.close(); toast('Password changed. Other sessions have been signed out.'); }
    catch (error) { formError(form, error.status === 401 && error.message === 'Current password is incorrect.' ? new ApiError(error.message, 400) : error); } finally { restore(); }
  }); confirmDialog.showModal(); form.elements.currentPassword.focus();
}
async function logout() {
  if (state.dirty && !(await confirm('Sign out?', 'Unsaved edits will be discarded. Saved customer records will remain available to the team.', 'Sign out'))) return;
  try { await api('/logout', { method: 'POST', body: {} }); login(); toast('Signed out securely.'); }
  catch (error) { toast(error.message); }
}
function shell() {
  const layout = el('div', 'ops-shell'); const rail = el('aside', 'ops-rail'); const brand = el('a', 'ops-rail-brand'); brand.href = '../';
  append(brand, logo(), append(el('span'), document.createTextNode('EE-Zee Go'), el('small', '', 'Team workspace'))); rail.append(brand);
  const nav = el('nav', 'ops-rail-nav'); nav.setAttribute('aria-label', 'Workspace sections');
  const sections = [{ id: 'requests', label: 'Requests', icon: 'list-checks' }, ...(state.user.role === 'owner' ? [{ id: 'trips', label: 'Departures', icon: 'calendar-dots' }, { id: 'team', label: 'Team', icon: 'users-three' }] : [])];
  for (const section of sections) {
    const action = button('', ''); append(action, icon(section.icon), el('span', '', section.label)); if (state.tab === section.id) action.setAttribute('aria-current', 'page');
    action.addEventListener('click', () => { state.tab = section.id; renderWorkspace(); root.querySelector('.ops-rail-nav [aria-current="page"]')?.focus({ preventScroll: true }); }); nav.append(action);
  }
  rail.append(nav);
  const footer = el('div', 'ops-rail-foot'); append(footer, el('strong', '', state.user.name), el('span', '', state.user.role === 'owner' ? 'Owner workspace' : 'Team member'));
  const signout = button('Sign out', 'ops-text-button'); signout.addEventListener('click', logout); footer.append(signout); rail.append(footer);
  const main = el('div', 'ops-main'); const toolbar = el('header', 'ops-toolbar');
  append(toolbar, el('p', '', `${state.user.name} · ${state.user.role === 'owner' ? 'Owner' : 'Team member'}`));
  const right = el('div', 'ops-toolbar-right'); const website = el('a', '', 'View website ↗'); website.href = '../'; website.target = '_blank'; website.rel = 'noopener';
  const refresh = button('Refresh', 'ops-button ops-secondary ops-small'); refresh.addEventListener('click', () => dashboard());
  const password = button('Password', 'ops-button ops-secondary ops-small'); password.setAttribute('aria-label', 'Change your password'); password.addEventListener('click', passwordDialog);
  const mobileLogout = button('Sign out', 'ops-button ops-secondary ops-small ops-mobile-logout'); mobileLogout.addEventListener('click', logout);
  append(right, website, refresh, password, mobileLogout); append(toolbar, right); main.append(toolbar); append(layout, rail, main); root.replaceChildren(layout); return main;
}
async function dashboard() {
  const main = shell(); const loading = el('section'); append(loading, el('span', 'ops-eyebrow', 'Updating your desk'), el('h1', '', 'Gathering the latest requests…'));
  const lines = el('div', 'ops-loading-lines'); for (let i = 0; i < 3; i++) lines.append(el('span')); loading.append(lines); loading.setAttribute('role', 'status'); main.append(loading);
  try { state.dashboard = await api('/dashboard'); renderWorkspace(); }
  catch (error) { if (error.status === 401) { sessionExpired(); return; } main.replaceChildren(errorBlock(error.message, dashboard)); }
}
function renderWorkspace() {
  if (!state.dashboard) return;
  const main = shell();
  if (state.tab === 'trips' && state.user.role === 'owner') renderTrips(main);
  else if (state.tab === 'team' && state.user.role === 'owner') renderTeam(main);
  else renderRequests(main);
}
function pageHeading(main, eyebrow, title, description) {
  const heading = el('div', 'ops-heading-row'); const copy = el('div'); append(copy, el('span', 'ops-eyebrow', eyebrow), el('h1', '', title)); if (description) copy.append(el('p', '', description));
  append(heading, copy, el('span', 'ops-date', new Intl.DateTimeFormat('en-JM', { timeZone: 'America/Jamaica', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()))); main.append(heading);
}
function renderRequests(main) {
  pageHeading(main, 'Today’s desk', 'Keep every journey moving.', 'Registrations and planning requests, with one clear next action for the team.');
  const requests = state.dashboard.requests || []; const unassigned = requests.filter(request => active(request) && !request.assignedTo).length;
  const late = requests.filter(overdue).length; const dueToday = requests.filter(request => active(request) && request.dueDate && request.dueDate.slice(0, 10) === todayDate()).length;
  const daily = el('section', 'ops-daily'); daily.setAttribute('aria-label', 'Daily attention summary');
  const title = late ? `${late} follow-up${late === 1 ? '' : 's'} need${late === 1 ? 's' : ''} attention.` : unassigned ? `${unassigned} request${unassigned === 1 ? '' : 's'} need${unassigned === 1 ? 's' : ''} an owner.` : dueToday ? `${dueToday} next action${dueToday === 1 ? '' : 's'} due today.` : 'A clear view of what comes next.';
  append(daily, append(el('div'), el('span', 'ops-eyebrow', state.user.role === 'owner' ? 'Your owner summary' : 'Team attention summary'), el('h2', '', title), el('p', '', 'This summary uses saved requests and next-action dates. Updates are visible in the customer’s secure status page; email and WhatsApp messages are not sent automatically.')));
  const counts = el('div', 'ops-daily-count'); for (const [value, label] of [[late, 'Overdue'], [unassigned, 'Unassigned'], [dueToday, 'Due today']]) append(counts, append(el('span'), el('strong', '', value), document.createTextNode(label))); daily.append(counts); main.append(daily);
  const summary = el('div', 'ops-summary'); const totals = state.dashboard.summary || {};
  for (const metric of [{ label: 'Total requests', value: totals.total ?? requests.length, status: '', attention: '' }, { label: 'New', value: totals.new ?? requests.filter(r => r.status === 'received').length, status: 'received', attention: '' }, { label: 'In planning', value: requests.filter(r => r.status === 'planning').length, status: 'planning', attention: '' }, { label: 'Overdue', value: late, status: '', attention: 'overdue' }]) {
    const action = button('', ''); append(action, el('strong', '', metric.value), el('span', '', metric.label));
    action.addEventListener('click', () => { state.status = metric.status; state.attention = metric.attention; state.search = ''; state.kind = ''; renderWorkspace(); }); summary.append(action);
  }
  main.append(summary);
  const filters = el('div', 'ops-filters');
  const search = field('Find a request', 'search', { type: 'search', value: state.search, maxLength: 200 }); search.querySelector('input').placeholder = 'Name, reference, email or destination';
  const kind = field('Request type', 'kind', { value: state.kind, options: [{ value: '', label: 'All requests' }, { value: 'registration', label: 'Registrations' }, { value: 'planning', label: 'Travel planning' }] });
  const status = field('Progress', 'status', { value: state.status, options: [{ value: '', label: 'All stages' }, ...Object.entries(statuses).map(([value, label]) => ({ value, label }))] });
  append(filters, search, kind, status); main.append(filters);
  const queue = el('section', 'ops-queue'); queue.setAttribute('aria-labelledby', 'ops-queue-title'); main.append(queue);
  const update = () => renderQueue(queue);
  search.querySelector('input').addEventListener('input', event => { state.search = event.target.value; update(); });
  kind.querySelector('select').addEventListener('change', event => { state.kind = event.target.value; update(); });
  status.querySelector('select').addEventListener('change', event => { state.status = event.target.value; state.attention = ''; update(); });
  renderQueue(queue);
}
function renderQueue(queue) {
  const all = state.dashboard.requests || []; const search = state.search.trim().toLocaleLowerCase();
  const requests = all.filter(request => (!state.kind || request.kind === state.kind) && (!state.status || request.status === state.status) && (!state.attention || (state.attention === 'overdue' && overdue(request))) && (!search || [request.name, request.reference, request.email, request.destination].filter(Boolean).join(' ').toLocaleLowerCase().includes(search)));
  requests.sort((a, b) => Number(overdue(b)) - Number(overdue(a)) || new Date(b.createdAt) - new Date(a.createdAt));
  queue.replaceChildren(); const header = el('div', 'ops-queue-header'); const title = el('h2', '', state.attention === 'overdue' ? 'Overdue next actions' : 'Request queue'); title.id = 'ops-queue-title'; append(header, title, el('span', '', `${requests.length} of ${all.length} requests`)); queue.append(header);
  if (!requests.length) {
    const empty = el('div', 'ops-empty'); append(empty, icon('compass'), el('h3', '', all.length ? 'Nothing matches this view.' : 'Ready for the first journey.'), el('p', '', all.length ? 'Try another name, request type or stage.' : 'Customer registrations and planning requests will appear here after submission.'));
    if (all.length) { const reset = button('Clear filters', 'ops-button ops-secondary'); reset.addEventListener('click', () => { state.search = ''; state.status = ''; state.kind = ''; state.attention = ''; renderWorkspace(); }); empty.append(reset); }
    queue.append(empty); return;
  }
  for (const request of requests) {
    const row = button('', 'ops-request'); row.setAttribute('aria-label', `Open ${request.reference}: ${request.name}, ${statuses[request.status] || request.status}`);
    const client = el('span', 'ops-request-client'); append(client, el('strong', '', request.name), el('small', '', request.reference));
    const type = el('span', 'ops-request-type'); append(type, el('strong', '', kindName(request.kind)), el('small', '', destinationName(request)));
    const progress = el('span', 'ops-request-status'); append(progress, badge(request.status)); if (request.dueDate) progress.append(el('small', overdue(request) ? 'ops-overdue' : '', `${overdue(request) ? 'Overdue · ' : 'Next · '}${date(request.dueDate)}`));
    const assignment = el('span', 'ops-request-assignment'); append(assignment, el('strong', '', staffName(request.assignedTo)), el('small', '', `Received ${date(request.createdAt)}`));
    append(row, client, type, progress, assignment, el('span', 'ops-request-arrow', '↗')); row.addEventListener('click', () => openRequest(request.id)); queue.append(row);
  }
}
async function closeRequest() {
  if (state.dirty && !(await confirm('Close this request?', 'Unsaved edits will be discarded. Changes you already saved are secure.', 'Discard edits'))) return;
  state.dirty = false; state.detail = null; detailDialog.close();
}
detailDialog.addEventListener('cancel', event => { event.preventDefault(); closeRequest(); });
async function openRequest(id) {
  detailDialog.replaceChildren(); const header = el('header', 'ops-detail-top'); const title = el('h2', '', 'Opening request…'); title.id = 'request-heading';
  const close = button('×', 'ops-icon-button'); close.setAttribute('aria-label', 'Close request'); close.addEventListener('click', closeRequest); append(header, title, close); detailDialog.append(header);
  const loading = el('div', 'ops-detail-body'); const lines = el('div', 'ops-loading-lines'); for (let i = 0; i < 3; i++) lines.append(el('span')); loading.append(lines); loading.setAttribute('role', 'status'); detailDialog.append(loading);
  if (!detailDialog.open) detailDialog.showModal();
  try { state.detail = await api(`/requests/${encodeURIComponent(id)}`); state.dirty = false; renderDetail(); detailDialog.scrollTop = 0; detailDialog.querySelector('[aria-label="Close request"]')?.focus({ preventScroll: true }); }
  catch (error) { if (error.status === 401) { sessionExpired(); return; } loading.replaceChildren(errorBlock(error.message, () => openRequest(id))); }
}
function requestFacts(request) {
  const facts = el('dl', 'ops-detail-facts');
  const trip = state.dashboard?.trips?.find(value => value.id === request.tripId);
  const items = [['Email', request.email], ['Phone', request.phone || 'Not provided'], ['Travellers', request.travellers], ['Destination', destinationName(request)], ['Travel dates', trip ? date(trip.date) : request.flexibleDates ? `Flexible${request.startDate ? ` · from ${date(request.startDate)}` : ''}` : request.startDate ? `${date(request.startDate)}${request.endDate ? ` – ${date(request.endDate)}` : ''}` : 'To discuss'], ['Budget', request.budget ? `${request.currency || ''} ${request.budget}` : 'Not provided']];
  for (const [label, value] of items) append(facts, append(el('div'), el('dt', '', label), el('dd', '', value ?? 'Not provided')));
  return facts;
}
function renderDetail() {
  const { request } = state.detail; detailDialog.replaceChildren();
  const top = el('header', 'ops-detail-top'); const titleWrap = el('div'); const heading = el('h2', '', request.name); heading.id = 'request-heading'; append(titleWrap, el('span', 'ops-eyebrow', `${request.reference} · ${kindName(request.kind)}`), heading);
  const close = button('×', 'ops-icon-button'); close.setAttribute('aria-label', 'Close request'); close.addEventListener('click', closeRequest); append(top, titleWrap, close); detailDialog.append(top);
  const body = el('div', 'ops-detail-body'); append(body, append(el('div', 'ops-detail-context'), badge(request.status), el('p', '', `Received ${date(request.createdAt, true)} · Updated ${date(request.updatedAt, true)}`)));
  const grid = el('div', 'ops-detail-grid'); const facts = el('section', 'ops-detail-block'); append(facts, el('h3', '', 'Customer brief'), requestFacts(request));
  if (request.preferences) append(facts, append(el('div', 'ops-detail-note'), el('strong', '', 'Preferences and notes'), el('p', '', typeof request.preferences === 'string' ? request.preferences : Object.entries(request.preferences).map(([key, value]) => `${key}: ${value}`).join('\n'))));
  if (request.tripId) { const trip = state.dashboard.trips?.find(item => item.id === request.tripId); if (trip) append(facts, append(el('div', 'ops-detail-note'), el('strong', '', 'Requested departure'), el('p', '', `${trip.name} · ${trip.displayDate || date(trip.date)}`))); }
  grid.append(facts, workflowForm(request));
  grid.append(planEditor(state.detail));
  grid.append(notesEditor(state.detail));
  const history = el('section', 'ops-detail-block'); append(history, el('h3', '', 'Request history'));
  history.append(historyList(state.detail.activity || [], 'No activity recorded yet.', item => ({ title: item.actor || 'System', text: item.message || item.type, timestamp: item.createdAt })));
  grid.append(history);
  const messages = request.customerMessages || [];
  if (messages.length) {
    const section = el('section', 'ops-detail-block ops-detail-wide'); append(section, el('h3', '', 'Customer conversation'), historyList(messages, 'No conversation updates yet.', item => ({ title: item.author === 'team' ? 'Team update' : 'Customer reply', text: item.message || item.text || '', timestamp: item.createdAt }))); grid.append(section);
  }
  body.append(grid); detailDialog.append(body, el('p', 'ops-detail-footer', 'Internal notes stay in this workspace. Customer updates and published itineraries appear on the customer’s secure status page.'));
  detailDialog.querySelectorAll('form').forEach(form => form.addEventListener('input', () => { state.dirty = true; form.dataset.edited = 'true'; }));
}
function syncResult(result, focusLabel) {
  if (result.request) {
    state.detail = result; const index = state.dashboard.requests.findIndex(item => item.id === result.request.id);
    if (index >= 0) state.dashboard.requests[index] = result.request;
    const requests = state.dashboard.requests;
    state.dashboard.summary = { total: requests.length, new: requests.filter(r => r.status === 'received').length, overdue: requests.filter(overdue).length, planning: requests.filter(r => r.status === 'planning').length };
  }
  state.dirty = false; renderWorkspace(); renderDetail();
  const focusTarget = [...detailDialog.querySelectorAll('button')].find(control => !control.disabled && control.textContent === focusLabel) || detailDialog.querySelector('#request-heading');
  if (focusTarget) { if (focusTarget.tagName !== 'BUTTON') focusTarget.tabIndex = -1; focusTarget.focus({ preventScroll: true }); }
}
function workflowForm(request) {
  const form = el('form', 'ops-detail-block'); append(form, el('h3', '', 'Next action'), el('p', '', 'Keep a clear owner and a follow-up date. A registration remains a request until your team confirms arrangements directly.'));
  const staffOptions = (state.dashboard.staff || []).filter(person => !person.disabled || person.id === request.assignedTo).map(person => ({ value: person.id, label: `${person.name}${person.disabled ? ' (access disabled)' : ''}`, disabled: person.disabled === true }));
  append(form, field('Progress', 'status', { value: request.status, options: Object.entries(statuses).map(([value, label]) => ({ value, label })) }), field('Assigned team member', 'assignedTo', { value: request.assignedTo || '', options: [{ value: '', label: 'Unassigned' }, ...staffOptions] }), field('Next-action date', 'dueDate', { type: 'date', value: request.dueDate?.slice(0, 10) || '', hint: 'Used for the daily summary and overdue alerts.' }), field('Customer-facing update', 'customerUpdate', { type: 'textarea', value: request.customerUpdate || '', maxLength: 2000, hint: 'Visible on the customer’s secure status page. This does not send an email or WhatsApp message.' }));
  const submit = button('Save progress', 'ops-button', 'submit'); form.append(submit);
  form.addEventListener('submit', async event => {
    event.preventDefault(); const values = new FormData(form); const proposed = { status: values.get('status'), assignedTo: form.elements.assignedTo.value || null, dueDate: values.get('dueDate') || null, customerUpdate: values.get('customerUpdate').trim() };
    const body = Object.fromEntries(Object.entries(proposed).filter(([key, value]) => value !== (request[key] || (['assignedTo', 'dueDate'].includes(key) ? null : ''))));
    if (!Object.keys(body).length) { toast('There are no new progress changes to save.'); return; }
    if (!(await saveOnlyThis(form))) return; const restore = busy(submit);
    try { const result = await api(`/requests/${encodeURIComponent(request.id)}`, { method: 'PATCH', revision: request.revision, body }); syncResult(result, 'Save progress'); toast('Progress saved.'); }
    catch (error) { formError(form, error); } finally { restore(); }
  }); return form;
}
function planEditor(detail) {
  const request = detail.request; const plan = detail.plan || {}; const draft = plan.draft || plan.published || { title: '', summary: '', days: [], customerNote: '' };
  const form = el('form', 'ops-detail-block ops-detail-wide'); const heading = el('div', 'ops-plan-heading'); const copy = el('div');
  append(copy, el('h3', '', 'Itinerary workspace'), el('p', '', 'Build a draft, save it, then publish the version you want your customer to review.'));
  const progress = plan.published ? plan.published.acceptedAt ? `Accepted · ${date(plan.published.acceptedAt)}` : `Published · v${plan.published.version}` : 'Draft only'; append(heading, copy, el('span', 'ops-badge', progress)); form.append(heading);
  if (plan.published?.acceptedAt) form.append(el('div', 'ops-notice', `The customer accepted itinerary version ${plan.published.version} on ${date(plan.published.acceptedAt, true)}. Acceptance is an itinerary decision, not a booking confirmation.`));
  append(form, field('Itinerary title', 'planTitle', { value: draft.title, required: true, maxLength: 160 }), field('Overview', 'planSummary', { type: 'textarea', value: draft.summary, required: true, maxLength: 3000 }));
  const days = el('div', 'ops-days'); form.append(days); (draft.days?.length ? draft.days : [{ date: '', title: '', details: '' }]).forEach((day, index) => days.append(dayEditor(day, index + 1)));
  const addDay = button('Add itinerary day', 'ops-button ops-secondary ops-small');
  addDay.addEventListener('click', () => { if (days.children.length >= 30) { toast('An itinerary can contain up to 30 days.'); return; } const row = dayEditor({ date: '', title: '', details: '' }, days.children.length + 1); days.append(row); state.dirty = true; form.dataset.edited = 'true'; row.querySelector('input[name="dayTitle"]').focus(); }); form.append(addDay);
  append(form, field('Note to your customer', 'customerNote', { type: 'textarea', value: draft.customerNote || '', maxLength: 2000, hint: 'Included with the itinerary when you publish it.' }));
  const actions = el('div', 'ops-inline-actions'); const save = button('Save draft', 'ops-button', 'submit'); append(actions, save);
  if (plan.draft) {
    const alreadyPublished = plan.published?.version === plan.draft.version;
    const publish = button(alreadyPublished ? `Published v${plan.draft.version}` : `Publish draft v${plan.draft.version}`, 'ops-button ops-gold'); publish.disabled = alreadyPublished;
    publish.addEventListener('click', async () => {
      if (state.dirty) { toast('Save or discard your current edits before publishing the saved draft.'); return; }
      if (!(await confirm('Publish this itinerary?', `Saved draft version ${plan.draft.version} will become visible on this customer’s secure status page. Any previously published version will be replaced. No booking is confirmed and no message is sent.`, 'Publish itinerary'))) return;
      const restore = busy(publish, 'Publishing…');
      try { const result = await api(`/requests/${encodeURIComponent(request.id)}/plan/publish`, { method: 'POST', revision: request.revision, body: { version: plan.draft.version } }); syncResult(result); toast('Itinerary published to the customer’s status page.'); }
      catch (error) { formError(form, error); } finally { restore(); }
    }); actions.append(publish);
  }
  form.append(actions);
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!(await saveOnlyThis(form))) return; const values = new FormData(form); const rows = [...days.querySelectorAll('.ops-day-editor')].map(row => ({ date: row.querySelector('[name="dayDate"]').value, title: row.querySelector('[name="dayTitle"]').value.trim(), details: row.querySelector('[name="dayDetails"]').value.trim() }));
    const restore = busy(save);
    try { const result = await api(`/requests/${encodeURIComponent(request.id)}/plan`, { method: 'PUT', revision: request.revision, body: { title: values.get('planTitle').trim(), summary: values.get('planSummary').trim(), days: rows, customerNote: values.get('customerNote').trim() } }); syncResult(result, 'Save draft'); toast('Itinerary draft saved. Publish it when it is ready for customer review.'); }
    catch (error) { formError(form, error); } finally { restore(); }
  }); return form;
}
function dayEditor(day, number) {
  const row = el('div', 'ops-day-editor'); const top = el('div', 'ops-day-top'); const label = el('span', '', `Day ${number}`); const remove = button('Remove day', '');
  remove.addEventListener('click', () => { const parent = row.parentNode; if (parent.children.length <= 1) { toast('An itinerary needs at least one day.'); return; } const form = row.closest('form'); row.remove(); [...parent.children].forEach((child, index) => { child.querySelector('.ops-day-top span').textContent = `Day ${index + 1}`; }); state.dirty = true; form.dataset.edited = 'true'; });
  append(top, label, remove); append(row, top, append(el('div', 'ops-pair'), field('Day title', 'dayTitle', { value: day.title || '', required: true, maxLength: 160 }), field('Date (optional)', 'dayDate', { type: 'date', value: day.date || '' })), field('Arrangements and activities', 'dayDetails', { type: 'textarea', value: day.details || '', required: true, maxLength: 2000 })); return row;
}
function notesEditor(detail) {
  const form = el('form', 'ops-detail-block'); append(form, el('h3', '', 'Internal team notes'), el('p', '', 'For handovers and working details. These notes are never shown to the customer.'), field('Add a note', 'message', { type: 'textarea', required: true, maxLength: 4000 }));
  const submit = button('Save internal note', 'ops-button ops-secondary', 'submit'); form.append(submit);
  const notes = el('div', 'ops-detail-note'); notes.append(historyList(detail.notes || [], 'No internal notes yet.', item => ({ title: item.author || 'Team member', text: item.message, timestamp: item.createdAt }))); form.append(notes);
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (!(await saveOnlyThis(form))) return; const restore = busy(submit);
    try { const result = await api(`/requests/${encodeURIComponent(detail.request.id)}/notes`, { method: 'POST', revision: detail.request.revision, body: { message: new FormData(form).get('message').trim() } }); syncResult(result, 'Save internal note'); toast('Internal note saved.'); }
    catch (error) { formError(form, error); } finally { restore(); }
  }); return form;
}
function historyList(items, emptyText, mapItem) {
  if (!items.length) return el('p', 'ops-muted', emptyText);
  const list = el('ol', 'ops-history');
  for (const item of items.slice(0, 40)) { const content = mapItem(item); append(list, append(el('li'), el('strong', '', content.title), el('p', '', content.text), el('small', '', date(content.timestamp, true)))); }
  return list;
}
function renderTrips(main) {
  pageHeading(main, 'Owner controls', 'Give each departure a clear plan.', 'Control which departures accept enquiries. Capacity is a planning figure; registrations do not reserve or confirm seats.');
  const create = button('Add a departure', 'ops-button'); create.style.marginBottom = '24px';
  const createPanel = el('section', 'ops-detail-block'); createPanel.hidden = true; createPanel.style.marginBottom = '24px';
  append(createPanel, el('h2', '', 'A new departure'), el('p', '', 'Add the details your team can confirm. Leave an unconfirmed advertised price blank.'));
  createPanel.append(tripForm(null));
  create.addEventListener('click', () => { createPanel.hidden = !createPanel.hidden; create.textContent = createPanel.hidden ? 'Add a departure' : 'Close new departure'; create.setAttribute('aria-expanded', String(!createPanel.hidden)); if (!createPanel.hidden) createPanel.querySelector('input').focus(); }); create.setAttribute('aria-expanded', 'false');
  main.append(create, createPanel);
  const list = el('div', 'ops-trip-list'); main.append(list);
  const trips = state.dashboard.trips || [];
  if (!trips.length) { list.append(el('div', 'ops-empty', 'No departures have been configured on the server.')); return; }
  for (const trip of trips) {
    const section = el('section', 'ops-trip-editor'); const context = el('div'); append(context, el('span', 'ops-eyebrow', trip.displayDate || date(trip.date)), el('h2', '', trip.name), el('p', '', trip.departurePoint || 'Departure details to be confirmed'), el('p', '', trip.advertisedPrice ? `Advertised price: ${trip.advertisedPrice}` : 'Price to be confirmed'));
    const requests = (state.dashboard.requests || []).filter(request => request.tripId === trip.id && active(request));
    const count = el('div', 'ops-trip-stats'); for (const [value, label] of [[requests.length, 'Active requests'], [requests.reduce((sum, request) => sum + (Number(request.travellers) || 0), 0), 'Requested travellers'], [trip.capacity ?? '—', 'Planning capacity']]) append(count, append(el('span'), el('strong', '', value), document.createTextNode(label))); context.append(count);
    append(section, context, tripForm(trip)); list.append(section);
  }
}
function tripForm(trip) {
  const form = el('form');
  const details = el('details', 'ops-trip-information'); if (!trip) details.open = true;
  const heading = el('summary', '', trip ? 'Edit departure information' : 'Departure information'); details.append(heading);
  append(details, field('Departure name', 'name', { value: trip?.name || '', required: true, maxLength: 160 }), append(el('div', 'ops-pair'), field('Departure date', 'date', { type: 'date', value: trip?.date || '', required: true }), field('Advertised price (optional)', 'advertisedPrice', { value: trip?.advertisedPrice || '', maxLength: 100, hint: 'Use only the wording and currency confirmed by the client.' })), field('Meeting / departure point', 'departurePoint', { value: trip?.departurePoint || '', required: true, maxLength: 240 }), field('What is included', 'includes', { type: 'textarea', value: (trip?.includes || []).join('\n'), maxLength: 3400, hint: 'One confirmed inclusion per line, up to 20. Keep each line under 160 characters.' }));
  form.append(details);
  append(form, append(el('div', 'ops-pair'), field('Enquiry status', 'status', { value: trip?.status || 'closed', options: [{ value: 'enquiries_open', label: 'Enquiries open' }, { value: 'closed', label: 'Closed' }] }), field('Planning capacity', 'capacity', { type: 'number', value: trip?.capacity ?? '', min: 1, max: 10000 })), el('p', '', 'Leave capacity blank if it is not confirmed. Customer registrations are requests, not held seats.'));
  const save = button(trip ? 'Save departure settings' : 'Create departure', 'ops-button ops-secondary', 'submit'); form.append(save);
  form.addEventListener('submit', async event => {
    event.preventDefault(); const values = new FormData(form); const nextStatus = values.get('status');
    if (trip && nextStatus === 'closed' && trip.status !== 'closed' && !(await confirm('Close new enquiries?', `Customers will no longer be able to select ${trip.name} for a new registration. Existing requests will remain available.`, 'Close enquiries'))) return;
    const body = { name: values.get('name').trim(), date: values.get('date'), advertisedPrice: values.get('advertisedPrice').trim(), includes: values.get('includes').split(/\r?\n/).map(value => value.trim()).filter(Boolean), departurePoint: values.get('departurePoint').trim(), status: nextStatus, capacity: values.get('capacity') ? Number(values.get('capacity')) : null };
    if (body.includes.length > 20 || body.includes.some(value => value.length > 160)) { formError(form, new ApiError('Use up to 20 inclusion lines, each no longer than 160 characters.', 400)); return; }
    if (body.date < todayDate() && body.status !== 'closed') { formError(form, new ApiError('A departure with a past date must be closed to new enquiries.', 400)); return; }
    const restore = busy(save);
    try {
      const result = await api(trip ? `/trips/${encodeURIComponent(trip.id)}` : '/trips', { method: trip ? 'PATCH' : 'POST', revision: trip?.revision, body });
      if (trip) { const index = state.dashboard.trips.findIndex(item => item.id === trip.id); state.dashboard.trips[index] = result.trip; } else state.dashboard.trips.push(result.trip);
      renderWorkspace(); toast(trip ? 'Departure settings saved.' : 'Departure created. It is available in the registration system according to its enquiry status.');
    } catch (error) { formError(form, error); } finally { restore(); }
  }); return form;
}
function renderTeam(main) {
  pageHeading(main, 'Owner controls', 'The right person. The next step.', 'Create staff access and assign routine work. Staff can manage requests and itineraries; owner settings stay with you.');
  const layout = el('div', 'ops-team-layout'); const list = el('section', 'ops-team-list'); list.setAttribute('aria-label', 'Team accounts');
  for (const person of state.dashboard.staff || []) {
    const row = el('div', 'ops-team-person'); const controls = el('div'); controls.append(el('span', 'ops-badge', person.disabled ? 'Disabled' : person.role === 'owner' ? 'Owner' : 'Staff'));
    if (person.role !== 'owner' && !person.disabled) {
      const disable = button('Disable access', 'ops-text-button'); disable.style.fontSize = '11px';
      disable.addEventListener('click', async () => {
        if (!(await confirm('Disable staff access?', `${person.name} will lose access to this workspace. Open requests assigned to this account will be reassigned to the owner. Existing notes remain in the request history.`, 'Disable access'))) return;
        const restore = busy(disable, 'Disabling…');
        try { await api(`/staff/${encodeURIComponent(person.id)}/disable`, { method: 'POST', body: {} }); await dashboard(); toast('Staff access disabled.'); }
        catch (error) { if (error.status === 401) sessionExpired(); else toast(error.message); } finally { restore(); }
      }); controls.append(disable);
    }
    append(row, append(el('div'), el('strong', '', person.name), el('small', '', person.email)), controls); list.append(row);
  }
  const form = el('form', 'ops-team-form'); append(form, el('h2', '', 'Add a team member'), el('p', '', 'Create a staff account. Share the password privately; this system does not email account invitations.'), field('Full name', 'name', { required: true, maxLength: 120, autocomplete: 'off' }), field('Email address', 'email', { type: 'email', required: true, maxLength: 254, autocomplete: 'off' }), field('Initial password', 'password', { type: 'password', required: true, maxLength: 256, hint: 'Use at least 14 characters. Share securely with the staff member.', autocomplete: 'new-password' }));
  form.elements.password.minLength = 14;
  const submit = button('Create staff account', 'ops-button', 'submit'); form.append(submit);
  form.addEventListener('submit', async event => {
    event.preventDefault(); const restore = busy(submit); const values = new FormData(form);
    try { const result = await api('/staff', { method: 'POST', body: { name: values.get('name').trim(), email: values.get('email').trim(), password: values.get('password') } }); state.dashboard.staff.push(result.user); renderWorkspace(); toast('Staff account created. Share the initial password privately.'); }
    catch (error) { formError(form, error); } finally { restore(); form.elements.password.value = ''; }
  }); append(layout, list, form); main.append(layout);
  const backup = el('section', 'ops-detail-block'); backup.style.marginTop = '28px';
  append(backup, el('h2', '', 'Your records, in your hands.'), el('p', '', 'Download a JSON backup of operational records. It contains customer information and internal notes; store it securely. Password hashes and session tokens are excluded.'));
  const download = button('Download records backup', 'ops-button ops-secondary');
  download.addEventListener('click', async () => {
    const restore = busy(download, 'Preparing backup…');
    try {
      const records = await api('/export'); const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = el('a'); link.href = url; link.download = `eezee-go-records-${todayDate()}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); toast('Records backup downloaded.');
    } catch (error) { if (error.status === 401) sessionExpired(); else toast(error.message); } finally { restore(); }
  }); backup.append(download); main.append(backup);
}
async function start() {
  try { const session = await api('/session'); state.user = session.user; await dashboard(); }
  catch (error) { login(error.status === 401 ? '' : error.message); }
}
start();
