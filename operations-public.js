/* Real saved requests; no customer records or access tokens in browser storage. */
(() => {
  'use strict';
  const API = '/api/operations';
  const $ = id => document.getElementById(id);
  const page = document.body.dataset.operationsPage;
  const idleNodes = new WeakMap();
  const statuses = {
    received: ['Received', 'The team has received your request and will review the details.'],
    in_review: ['In review', 'The team is reviewing your request and checking the next steps.'],
    awaiting_customer: ['Your input needed', 'The team needs your input. Check the conversation below.'],
    planning: ['Planning in progress', 'The team is working on your travel plan.'],
    ready: ['Ready for review', 'There is an update to review. Check the plan and conversation below.'],
    closed: ['Closed', 'This request has been closed. Contact the team if you need further assistance.'],
    cancelled: ['Cancelled', 'This request is marked as cancelled. Contact the team with any questions.']
  };
  const element = (tag, text, className) => {
    const el = document.createElement(tag);
    if (text !== undefined && text !== null) el.textContent = String(text);
    if (className) el.className = className;
    return el;
  };
  const iso = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const dateLabel = value => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'To discuss';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? 'To discuss' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const timeLabel = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  const announceError = (target, message) => {
    target.textContent = message;
    target.hidden = false;
  };
  const busy = (button, active, label = 'Saving…') => {
    if (!idleNodes.has(button)) idleNodes.set(button, [...button.childNodes]);
    button.disabled = active;
    button.classList.toggle('ops-busy', active);
    button.replaceChildren(...(active ? [document.createTextNode(label)] : idleNodes.get(button)));
  };
  async function api(path, { method = 'GET', body, token } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const response = await fetch(`${API}${path}`, {
        method, credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      let data;
      try { data = await response.json(); } catch { throw new Error('The request service is unavailable. Please try again, or contact the team directly.'); }
      if (!response.ok) {
        const error = new Error(typeof data.error === 'string' ? data.error : data.error?.message || data.message || 'We couldn’t complete that action. Please try again.');
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The service took too long to respond. Try again; the same request reference will be used if your submission was already saved.');
      if (error instanceof TypeError) throw new Error('We couldn’t reach the request service. Check your connection and try again.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  function errorFor(input, message) {
    input.setAttribute('aria-invalid', String(Boolean(message)));
    const error = $(`${input.id}-error`);
    if (error) error.textContent = message;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function validate(form) {
    let first = null;
    for (const input of form.querySelectorAll('input,textarea')) {
      if (input.type === 'radio' || input.id === 'website') continue;
      input.setCustomValidity('');
      if (input.required && input.type !== 'checkbox' && !input.value.trim()) input.setCustomValidity('Please complete this field.');
      let message = '';
      if (!input.checkValidity()) {
        if (input.type === 'checkbox') message = 'Please agree to the privacy notice before submitting.';
        else if (input.type === 'email') message = 'Enter a valid email address.';
        else if (input.type === 'number') message = input.id === 'travellers' ? 'Enter a whole number from 1 to 50.' : 'Enter a valid, positive budget amount.';
        else if (input.type === 'date') message = 'Choose today or a future date.';
        else if (input.id === 'phone') message = 'Enter a phone number including your country code.';
        else message = 'Please complete this field.';
      }
      errorFor(input, message);
      if (message && !first) first = input;
    }
    if (form.dataset.kind === 'registration' && !form.querySelector('[name=tripId]:checked')) {
      $('tripId-error').textContent = 'Choose a departure before submitting.';
      first ||= form.querySelector('[name=tripId]:not(:disabled)') || $('retry-trips');
    } else if ($('tripId-error')) $('tripId-error').textContent = '';
    const start = $('startDate'), end = $('endDate');
    if (start?.value && end?.value && end.value < start.value) {
      errorFor(end, 'The end date must be on or after the start date.');
      first ||= end;
    }
    if (start && !$('flexibleDates').checked && (!start.value || !end.value)) {
      const missing = !start.value ? start : end;
      errorFor(missing, 'Add your dates, or choose the flexible dates option.');
      first ||= missing;
    }
    if (first) first.focus();
    return !first;
  }
  function summary(target, entries) {
    target.replaceChildren();
    for (const [label, value, wide] of entries) {
      if (value === null || value === undefined || value === '') continue;
      const group = element('div', null, wide ? 'ops-summary-wide' : '');
      group.append(element('dt', label), element('dd', value));
      target.append(group);
    }
  }
  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
    return [...bytes].map((v, i) => `${[4,6,8,10].includes(i) ? '-' : ''}${v.toString(16).padStart(2, '0')}`).join('');
  }
  let memoryKey = null;
  async function submissionKey(payload) {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
    const fingerprint = [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join('');
    let previous = memoryKey;
    try { previous = JSON.parse(sessionStorage.getItem(`eezee-request-${page}`)) || previous; } catch { /* Browser storage is optional. */ }
    if (!previous || previous.fingerprint !== fingerprint) previous = { fingerprint, key: uuid() };
    memoryKey = previous;
    try { sessionStorage.setItem(`eezee-request-${page}`, JSON.stringify(previous)); } catch { /* Keep the retry key in memory instead. */ }
    return previous.key;
  }
  function clearKey() {
    memoryKey = null;
    try { sessionStorage.removeItem(`eezee-request-${page}`); } catch { /* No storage is needed for a new form. */ }
  }
  async function copyLink(link, status, fallback) {
    try {
      await navigator.clipboard.writeText(link);
      status.textContent = 'Private tracking link copied. Save it somewhere secure.';
    } catch {
      if (fallback) { fallback.value = link; fallback.hidden = false; fallback.focus(); fallback.select(); }
      status.textContent = 'Select and copy the private link shown here.';
    }
  }
  if (page === 'registration' || page === 'planning') {
    const form = $('saved-request-form');
    let trips = [];
    let submittedLink = '';
    let submitting = false;
    const selectTrip = trip => {
      $('trip-selected').hidden = false;
      $('trip-includes').replaceChildren(...(trip.includes || []).map(item => element('li', item)));
      $('trip-departure').textContent = `Departure: ${trip.departurePoint || 'The team will confirm the meeting point.'}`;
      $('tripId-error').textContent = '';
    };
    async function loadTrips() {
      trips = [];
      $('trip-loading').hidden = false; $('trip-error').hidden = true;
      $('trip-choices').replaceChildren(); $('trip-selected').hidden = true;
      busy($('request-submit'), true, 'Loading departures…');
      try {
        const data = await api('/trips');
        trips = Array.isArray(data.trips) ? data.trips : [];
        if (!trips.length) throw new Error('There are no departures available to request right now. Please contact the team.');
        const requestedId = new URLSearchParams(location.search).get('trip');
        for (const trip of trips) {
          const label = element('label', null, 'ops-trip-option');
          const radio = element('input'); radio.type = 'radio'; radio.name = 'tripId'; radio.value = trip.id; radio.required = true;
          radio.id = `trip-${trip.id}`; radio.setAttribute('aria-describedby', 'tripId-error');
          radio.disabled = ['closed','cancelled'].includes(trip.status);
          const text = element('span');
          text.append(element('strong', trip.name), element('span', trip.displayDate || dateLabel(trip.date), 'ops-trip-date'));
          const price = element('span', null, 'ops-trip-detail');
          price.append(element('span', `${trip.advertisedPrice || 'Price to confirm'} advertised`, 'ops-trip-price'), document.createTextNode(radio.disabled ? ' · registration closed' : ' · availability confirmed by the team'));
          text.append(price);
          label.append(radio, text); $('trip-choices').append(label);
          radio.addEventListener('change', () => selectTrip(trip));
          if (!radio.disabled && requestedId === trip.id) { radio.checked = true; selectTrip(trip); }
        }
        $('request-submit').disabled = false;
      } catch (error) {
        $('trip-error').querySelector('p').textContent = error.message;
        $('trip-error').hidden = false;
      } finally {
        $('trip-loading').hidden = true;
        busy($('request-submit'), false);
        if (!trips.length) $('request-submit').disabled = true;
      }
    }
    if (page === 'registration') { loadTrips(); $('retry-trips').addEventListener('click', loadTrips); }
    if (page === 'planning') {
      $('startDate').min = iso(new Date()); $('endDate').min = iso(new Date());
      $('startDate').addEventListener('change', () => { $('endDate').min = $('startDate').value || iso(new Date()); });
      setupCalendars();
    }
    form.addEventListener('input', event => {
      const input = event.target;
      if (input.id && input.getAttribute('aria-invalid') === 'true') { input.setCustomValidity(''); errorFor(input, ''); }
      $('submit-error').hidden = true;
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submitting) return;
      if (!validate(form)) return;
      const payload = {
        kind: page, name: $('name').value.trim(), email: $('email').value.trim(), phone: $('phone').value.trim(),
        travellers: Number($('travellers').value), preferences: $('preferences').value.trim(), consent: $('consent').checked, hp: $('website').value
      };
      if (page === 'registration') payload.tripId = form.querySelector('[name=tripId]:checked').value;
      else Object.assign(payload, {
        destination: $('destination').value.trim(), startDate: $('startDate').value || null, endDate: $('endDate').value || null,
        flexibleDates: $('flexibleDates').checked, budget: $('budget').value || null, currency: form.querySelector('[name=currency]:checked')?.value || 'USD'
      });
      $('submit-error').hidden = true;
      submitting = true;
      busy($('request-submit'), true, 'Saving your request…');
      form.setAttribute('aria-busy', 'true');
      try {
        payload.idempotencyKey = await submissionKey(payload);
        const result = await api('/requests', { method: 'POST', body: payload });
        if (!result.reference || !result.accessToken) throw new Error('The service did not return a complete receipt. Please retry before closing this page.');
        submittedLink = `${location.origin}/request/#${encodeURIComponent(result.accessToken)}`;
        $('receipt-reference').textContent = result.reference;
        $('receipt-track').href = submittedLink;
        $('receipt-link').value = submittedLink;
        const trip = trips.find(t => t.id === payload.tripId);
        summary($('receipt-summary'), [['Request', page === 'registration' ? 'Group trip registration' : 'Travel planning'], ['Lead traveller', payload.name], [page === 'registration' ? 'Departure' : 'Destination', trip?.name || payload.destination], ['Travellers', payload.travellers], ['Travel dates', trip?.displayDate || (payload.startDate ? `${dateLabel(payload.startDate)}${payload.endDate ? ' – ' + dateLabel(payload.endDate) : ''}` : 'Flexible / to discuss')]]);
        $('request-workspace').hidden = true;
        $('request-receipt').hidden = false;
        $('request-receipt').focus();
        $('request-receipt').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      } catch (error) {
        announceError($('submit-error'), error.message);
        $('submit-error').tabIndex = -1; $('submit-error').focus();
      } finally { submitting = false; busy($('request-submit'), false); form.removeAttribute('aria-busy'); }
    });
    $('receipt-copy').addEventListener('click', () => copyLink(submittedLink, $('copy-status'), $('receipt-link')));
    $('start-another').addEventListener('click', () => {
      clearKey(); form.reset(); form.querySelectorAll('[aria-invalid]').forEach(input => errorFor(input, ''));
      $('request-receipt').hidden = true; $('request-workspace').hidden = false;
      submittedLink = ''; $('receipt-link').value = ''; $('copy-status').textContent = '';
      if (page === 'registration') $('trip-selected').hidden = true;
      else form.querySelectorAll('input[type=date]').forEach(input => input.dispatchEvent(new Event('change', { bubbles: true })));
      form.querySelector('input:not([type=radio])')?.focus();
    });
  }
  if (page === 'portal') {
    let accessToken = '';
    let current = null;
    let loading = false;
    const privateLink = () => `${location.origin}/request/#${encodeURIComponent(accessToken)}`;
    const tokenFrom = value => {
      const raw = value.trim();
      if (!raw) return '';
      if (raw.includes('#')) return decodeURIComponent(raw.slice(raw.lastIndexOf('#') + 1));
      return raw;
    };
    try { accessToken = tokenFrom(location.hash); } catch { accessToken = ''; }
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    const render = data => {
      current = data;
      const request = data.request;
      if (!request || !request.reference) throw new Error('We couldn’t read the saved request. Please try again.');
      const status = statuses[request.status] || ['Update available', 'Check the latest information and conversation below.'];
      $('portal-request-title').textContent = request.reference;
      $('portal-status').textContent = status[0];
      $('portal-progress-note').textContent = request.customerUpdate || status[1];
      $('portal-updated').textContent = `Last updated ${timeLabel(request.updatedAt || request.createdAt)}`;
      summary($('portal-summary'), [
        ['Request type', request.kind === 'registration' ? 'Group trip registration' : 'Travel planning'],
        ['Lead contact', request.name], ['Email', request.email], ['Phone', request.phone],
        [request.kind === 'registration' ? 'Departure' : 'Destination', data.trip?.name || request.destination],
        ['Travellers', request.travellers], ['Travel dates', data.trip?.displayDate || (request.startDate ? `${dateLabel(request.startDate)}${request.endDate ? ' – ' + dateLabel(request.endDate) : ''}${request.flexibleDates ? ' · flexible' : ''}` : 'Flexible / to discuss')],
        ['Budget guide', request.budget !== null && request.budget !== undefined && request.budget !== '' ? `${request.currency || ''} ${request.budget}` : null],
        ['Your preferences', request.preferences, true]
      ]);
      const messages = Array.isArray(request.customerMessages) ? request.customerMessages : [];
      $('messages-empty').hidden = messages.length > 0;
      $('portal-messages').replaceChildren();
      for (const message of messages) {
        const item = element('li', null, 'ops-message'); item.dataset.role = message.author === 'customer' ? 'customer' : 'team';
        const heading = element('div', null, 'ops-message-heading');
        heading.append(element('strong', message.author === 'customer' ? 'You' : 'EE-Zee Go team'), element('span', timeLabel(message.createdAt)));
        item.append(heading, element('p', message.message)); $('portal-messages').append(item);
      }
      const plan = data.plan;
      $('published-plan').hidden = !plan;
      if (plan) {
        $('plan-heading').textContent = plan.title || 'Your proposed journey';
        $('plan-version').textContent = `Version ${plan.version} · shared ${timeLabel(plan.publishedAt || plan.updatedAt)}`;
        $('plan-summary').textContent = plan.summary || '';
        $('plan-note').textContent = plan.customerNote || '';
        $('plan-days').replaceChildren();
        (Array.isArray(plan.days) ? plan.days : []).forEach((day, index) => {
          const item = element('li'); const content = element('div');
          if (day.date) content.append(element('span', dateLabel(day.date), 'ops-plan-date'));
          content.append(element('h4', day.title || `Day ${index + 1}`), element('p', day.details || ''));
          item.append(element('span', String(index + 1).padStart(2, '0')), content); $('plan-days').append(item);
        });
        $('plan-actions').hidden = Boolean(plan.acceptedAt);
        $('plan-accepted').hidden = !plan.acceptedAt;
        if (plan.acceptedAt) $('plan-accepted').textContent = `You approved this plan on ${timeLabel(plan.acceptedAt)}. The team will advise on the next steps.`;
      }
      $('portal-entry').hidden = true; $('portal-workspace').hidden = false;
      const closed = ['closed','cancelled'].includes(request.status);
      $('portal-reply').hidden = closed;
      if (closed) $('messages-empty').textContent = 'This request is closed. Contact the team for further assistance.';
    };
    async function loadRequest(focus = false) {
      if (!accessToken || loading) return;
      const token = accessToken;
      loading = true; $('portal-error').hidden = true; $('portal-loading').hidden = false;
      $('refresh-request').disabled = true;
      try {
        const data = await api('/request', { token });
        if (token !== accessToken) return;
        render(data);
        if (focus) { $('portal-request-title').tabIndex = -1; $('portal-request-title').focus(); }
      } catch (error) {
        if (token !== accessToken) return;
        announceError($('portal-error'), error.status === 401 || error.status === 404 ? 'This private code is invalid or the request is no longer available. Check your saved link or contact the team.' : error.message);
        if (!current || error.status === 401 || error.status === 404) { $('portal-entry').hidden = false; $('portal-workspace').hidden = true; }
      } finally { loading = false; $('portal-loading').hidden = true; $('refresh-request').disabled = false; }
    }
    $('portal-open').addEventListener('submit', async event => {
      event.preventDefault();
      try { accessToken = tokenFrom($('access-code').value); } catch { accessToken = ''; }
      if (!accessToken || accessToken.length > 300) { $('access-code-error').textContent = 'Paste a valid private access code or tracking link.'; $('access-code').focus(); return; }
      $('access-code-error').textContent = ''; $('access-code').value = ''; current = null;
      const button = event.target.querySelector('button[type=submit]'); busy(button, true, 'Opening request…');
      await loadRequest(true); busy(button, false);
    });
    $('refresh-request').addEventListener('click', () => loadRequest(false));
    $('close-request').addEventListener('click', () => {
      accessToken = ''; current = null; $('portal-workspace').hidden = true; $('portal-entry').hidden = false;
      $('portal-private-link').value = ''; $('portal-private-link').hidden = true; $('portal-copy-status').textContent = '';
      $('portal-summary').replaceChildren(); $('portal-messages').replaceChildren(); $('portal-error').hidden = true; $('access-code').focus();
      $('portal-request-title').textContent = ''; $('portal-status').textContent = ''; $('portal-updated').textContent = '';
      $('plan-heading').textContent = ''; $('plan-summary').textContent = ''; $('plan-note').textContent = ''; $('plan-days').replaceChildren();
    });
    $('portal-copy').addEventListener('click', () => copyLink(privateLink(), $('portal-copy-status'), $('portal-private-link')));
    $('portal-reply').addEventListener('submit', async event => {
      event.preventDefault();
      const message = $('reply-message').value.trim();
      if (!message) { $('reply-message-error').textContent = 'Write a message before sending.'; $('reply-message').focus(); return; }
      $('reply-message-error').textContent = ''; $('reply-error').hidden = true; $('reply-status').textContent = '';
      const button = event.target.querySelector('button'); busy(button, true, 'Saving message…');
      const token = accessToken;
      try {
        const data = await api('/request/reply', { method: 'POST', token, body: { message } });
        if (token !== accessToken) return;
        if (data.request) render({ ...current, ...data }); else await loadRequest();
        $('reply-message').value = ''; $('reply-status').textContent = 'Message saved for the team to review.';
        $('portal-messages').scrollTop = $('portal-messages').scrollHeight;
      } catch (error) { announceError($('reply-error'), error.message); }
      finally { busy(button, false); }
    });
    $('accept-plan').addEventListener('click', async () => {
      if (!current?.plan) return;
      const token = accessToken;
      $('plan-error').hidden = true; busy($('accept-plan'), true, 'Saving approval…');
      try {
        const data = await api('/request/accept-plan', { method: 'POST', token, body: { version: current.plan.version } });
        if (token !== accessToken) return;
        if (data.request) render({ ...current, ...data }); else await loadRequest();
      } catch (error) {
        if (error.status === 409) { await loadRequest(); announceError($('plan-error'), 'The team has updated this plan. Review the latest version before approving.'); }
        else announceError($('plan-error'), error.message);
      } finally { busy($('accept-plan'), false); }
    });
    if (accessToken) loadRequest(true);
  }

  // Native dates remain the value source; the calendar is a keyboard-friendly enhancement.
  function setupCalendars() {
    let active = null;
    const close = restore => {
      if (!active) return;
      const previous = active; active = null; previous.panel.remove(); previous.trigger.setAttribute('aria-expanded', 'false');
      if (restore) previous.trigger.focus();
    };
    const position = () => {
      if (!active) return;
      const bounds = active.trigger.getBoundingClientRect();
      const width = Math.min(326, innerWidth - 24);
      active.panel.style.width = `${width}px`;
      active.panel.style.left = `${Math.max(12, Math.min(bounds.left, innerWidth - width - 12))}px`;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop || 0, height = viewport?.height || innerHeight;
      const panelHeight = active.panel.offsetHeight;
      active.panel.style.top = `${Math.max(top + 12, Math.min(bounds.bottom + 8, top + height - panelHeight - 12))}px`;
    };
    for (const input of document.querySelectorAll('#startDate,#endDate')) {
      const field = input.closest('.ops-field'); field.classList.add('ops-date-field');
      const trigger = element('button', null, 'ops-date-trigger'); trigger.type = 'button'; trigger.id = `${input.id}-trigger`;
      trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-describedby', `${input.id}-error`);
      const text = element('span'); const icon = element('img'); icon.src = '../assets/icons/calendar-dots.svg'; icon.alt = ''; icon.width = 21; icon.height = 21;
      trigger.append(text, icon); input.insertAdjacentElement('afterend', trigger);
      input.classList.add('ops-native-date'); input.tabIndex = -1; input.setAttribute('aria-hidden', 'true');
      const label = field.querySelector('label');
      label.addEventListener('click', event => { event.preventDefault(); trigger.focus(); });
      const sync = () => { text.textContent = input.value ? dateLabel(input.value) : 'Choose a date'; trigger.setAttribute('aria-label', `${input.id === 'startDate' ? 'Start date' : 'End date'}: ${text.textContent}`); trigger.setAttribute('aria-invalid', input.getAttribute('aria-invalid') || 'false'); };
      input.addEventListener('change', sync); input.addEventListener('focus', () => trigger.focus()); sync();
      trigger.addEventListener('click', () => {
        if (active?.trigger === trigger) { close(true); return; }
        close(false);
        let month = new Date(`${input.value || input.min || iso(new Date())}T12:00:00`); month.setDate(1);
        const panel = element('div', null, 'ops-calendar'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', input.id === 'startDate' ? 'Choose start date' : 'Choose end date');
        document.body.append(panel); active = { panel, trigger }; trigger.setAttribute('aria-expanded', 'true');
        const choose = value => { input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); close(true); };
        const draw = () => {
          panel.replaceChildren();
          const bar = element('div', null, 'ops-calendar-bar');
          const previous = element('button', '‹'); previous.type = 'button'; previous.setAttribute('aria-label', 'Previous month');
          const next = element('button', '›'); next.type = 'button'; next.setAttribute('aria-label', 'Next month');
          bar.append(previous, element('strong', month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })), next); panel.append(bar);
          previous.addEventListener('click', () => { month.setMonth(month.getMonth() - 1); draw(); panel.querySelector('[aria-label="Previous month"]').focus(); });
          next.addEventListener('click', () => { month.setMonth(month.getMonth() + 1); draw(); panel.querySelector('[aria-label="Next month"]').focus(); });
          const grid = element('div', null, 'ops-calendar-grid'); grid.setAttribute('role', 'group'); grid.setAttribute('aria-label', 'Days of the month');
          ['Mo','Tu','We','Th','Fr','Sa','Su'].forEach(day => grid.append(element('span', day)));
          const offset = (month.getDay() + 6) % 7;
          for (let blank = 0; blank < offset; blank++) grid.append(element('span'));
          const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
          for (let day = 1; day <= days; day++) {
            const value = iso(new Date(month.getFullYear(), month.getMonth(), day));
            const button = element('button', day); button.type = 'button'; button.disabled = Boolean(input.min && value < input.min);
            button.setAttribute('aria-label', dateLabel(value)); button.setAttribute('aria-pressed', String(value === input.value));
            button.addEventListener('click', () => choose(value)); grid.append(button);
          }
          panel.append(grid);
          const bottom = element('div', null, 'ops-calendar-bottom');
          const clear = element('button', 'Clear date'); clear.type = 'button'; clear.addEventListener('click', () => choose(''));
          const done = element('button', 'Close'); done.type = 'button'; done.addEventListener('click', () => close(true)); bottom.append(clear, done); panel.append(bottom); position();
        };
        panel.addEventListener('keydown', event => {
          if (event.key === 'Escape') { event.preventDefault(); close(true); return; }
          const items = [...panel.querySelectorAll('button:not(:disabled)')], index = items.indexOf(document.activeElement);
          if (event.key === 'Tab') {
            if (!event.shiftKey && index === items.length - 1) { event.preventDefault(); items[0].focus(); }
            if (event.shiftKey && index === 0) { event.preventDefault(); items.at(-1).focus(); }
          }
          if (event.target.closest('.ops-calendar-grid') && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
            event.preventDefault(); const days = [...panel.querySelectorAll('.ops-calendar-grid button:not(:disabled)')]; const position = days.indexOf(document.activeElement);
            const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]; days[Math.max(0, Math.min(days.length - 1, position + step))]?.focus();
          }
        });
        draw(); (panel.querySelector('[aria-pressed=true]:not(:disabled)') || panel.querySelector('.ops-calendar-grid button:not(:disabled)') || panel.querySelector('button')).focus();
      });
    }
    document.addEventListener('pointerdown', event => { if (active && !active.panel.contains(event.target) && !active.trigger.contains(event.target)) close(false); });
    window.addEventListener('resize', position); window.visualViewport?.addEventListener('resize', position);
    document.addEventListener('scroll', event => { if (active && !active.panel.contains(event.target)) position(); }, true);
  }
})();
