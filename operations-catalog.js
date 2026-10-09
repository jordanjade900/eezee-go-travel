/* The staff departure catalogue enhances the static, crawlable agency-flyer fallback. */
(() => {
  'use strict';
  const home = document.querySelector('.featured-trips .featured-grid');
  const group = document.querySelector('.local-trips .local-trip-list');
  if (!home && !group) return;
  const root = new URL('.', document.currentScript.src);
  const thumbnails = new Set(['jamwest-negril', 'benta-river-falls', 'mystic-mountain']);
  const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = String(text);
    if (className) node.className = className;
    return node;
  };
  const jamaicaToday = () => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Jamaica', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const part = kind => parts.find(item => item.type === kind)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  };
  const validDate = date => /^\d{4}-\d{2}-\d{2}$/.test(date || '') && !Number.isNaN(new Date(`${date}T12:00:00Z`).getTime());
  const today = jamaicaToday();
  const isOpen = trip => trip.status === 'enquiries_open' && validDate(trip.date) && trip.date >= today;
  const statusText = trip => {
    if (validDate(trip.date) && trip.date < today) return 'Past advertised departure';
    if (trip.status === 'cancelled') return 'Departure cancelled';
    if (trip.status === 'closed') return 'Registration closed';
    return isOpen(trip) ? 'Registration enquiries open' : 'Contact the team for current details';
  };
  const readableDate = trip => {
    if (!validDate(trip.date)) return 'Date to confirm';
    return typeof trip.displayDate === 'string' && trip.displayDate.trim() ? trip.displayDate : new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${trip.date}T12:00:00Z`));
  };
  function link(label, path, className = 'p-text-link') {
    const anchor = el('a', label, className);
    anchor.href = new URL(path, root).href;
    const arrow = el('img'); arrow.src = new URL('assets/icons/arrow-right.svg', root).href;
    arrow.alt = ''; arrow.width = 24; arrow.height = 24; anchor.append(document.createTextNode(' '), arrow);
    return anchor;
  }
  function card(trip, onHome) {
    const article = el('article', null, onHome ? 'featured-trip' : 'local-trip');
    if (validDate(trip.date)) article.dataset.tripDate = trip.date;
    article.dataset.liveDeparture = trip.id;
    const top = el('div', null, 'trip-card-top');
    if (!onHome && thumbnails.has(trip.id)) {
      const image = el('img'); image.className = 'trip-thumbnail'; image.width = 137; image.height = 137;
      image.src = new URL(`assets/trip-${trip.id}.webp`, root).href;
      image.alt = 'Agency flyer photograph for this departure'; image.loading = 'lazy';
      top.append(image);
    }
    const heading = el('div'); const date = el('time', readableDate(trip));
    if (validDate(trip.date)) date.dateTime = trip.date;
    heading.append(date, el('span', statusText(trip), 'local-trip-status'), el('h3', trip.name));
    top.append(heading); article.append(top);
    const priceText = typeof trip.advertisedPrice === 'string' ? trip.advertisedPrice.trim() : '';
    const price = el('strong', priceText || 'Ask for current price', 'local-trip-price');
    if (priceText) price.append(el('span', 'Advertised price'));
    else { price.style.fontSize = 'clamp(20px, 2.2vw, 28px)'; price.style.lineHeight = '1.2'; }
    article.append(price);
    const inclusions = Array.isArray(trip.includes) ? trip.includes.filter(item => typeof item === 'string' && item.trim()) : [];
    if (onHome) article.append(el('p', inclusions.slice(0, 2).join(' · ') || 'Ask the team about the inclusions.'));
    else {
      const list = el('ul', null, 'trip-inclusions');
      inclusions.forEach(item => list.append(el('li', item)));
      if (!inclusions.length) list.append(el('li', 'Inclusions to be confirmed with the team.'));
      article.append(list);
    }
    const pickup = el('p', `Pickup: ${typeof trip.departurePoint === 'string' && trip.departurePoint.trim() ? trip.departurePoint : 'Meeting point to be confirmed.'}`, 'trip-source-note');
    if (!onHome) { pickup.style.gridColumn = '1 / -1'; pickup.style.margin = '0'; }
    article.append(pickup);
    if (isOpen(trip)) {
      const query = new URLSearchParams({ service: 'Group trips', trip: trip.id });
      article.append(link('Enquire about this trip', `contact/?${query}`), link('Register interest', `registration/?${new URLSearchParams({ trip: trip.id })}`, 'p-text-link trip-register'));
    }
    return article;
  }
  function noUpcoming(onHome) {
    const article = el('article', null, onHome ? 'featured-trip' : 'local-trip');
    const heading = el('div', null, 'trip-card-top');
    heading.append(el('h3', 'Ask about the next departures'));
    article.append(heading, el('p', 'There are no upcoming departures open for registration in the current catalogue. Speak with the team about your next group journey.'));
    article.append(link('Ask about upcoming trips', 'contact/?service=Group+trips'));
    const registration = link('View registration options', 'registration/', 'p-text-link trip-register');
    article.append(registration);
    return article;
  }
  function render(trips) {
    const sorted = [...trips].sort((a, b) => (validDate(a.date) ? a.date : '9999-99-99').localeCompare(validDate(b.date) ? b.date : '9999-99-99') || String(a.name).localeCompare(String(b.name)));
    if (home) {
      const upcoming = sorted.filter(isOpen).slice(0, 3);
      home.replaceChildren(...(upcoming.length ? upcoming.map(trip => card(trip, true)) : [noUpcoming(true)]));
      home.closest('.featured-trips').dataset.departureSource = 'live';
    }
    if (group) {
      group.replaceChildren(...(sorted.length ? sorted.map(trip => card(trip, false)) : [noUpcoming(false)]));
      group.closest('.local-trips').dataset.departureSource = 'live';
    }
  }
  function fallback(message) {
    for (const target of [home, group].filter(Boolean)) {
      const section = target.closest('section');
      if (section.querySelector('[data-catalog-load-note]')) continue;
      const note = el('p', message, 'trip-source-note'); note.dataset.catalogLoadNote = '';
      note.setAttribute('role', 'status');
      target.insertAdjacentElement('afterend', note);
      section.dataset.departureSource = 'static-fallback';
    }
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  fetch('/api/operations/trips', { headers: { Accept: 'application/json' }, cache: 'no-store', credentials: 'same-origin', signal: controller.signal })
    .then(async response => {
      if (!response.ok) throw new Error('Catalogue unavailable');
      const data = await response.json();
      if (!Array.isArray(data.trips) || data.trips.some(trip => !trip || typeof trip.id !== 'string' || typeof trip.name !== 'string')) throw new Error('Invalid catalogue');
      render(data.trips);
    })
    .catch(() => fallback('Live departures could not load. The advertised information shown here may have changed; contact the team to confirm current dates, pickup points and availability.'))
    .finally(() => clearTimeout(timer));
})();
