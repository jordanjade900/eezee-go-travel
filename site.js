/* Shared interior behaviour. Trip context is read from the current public catalogue;
   the contact form prepares editable WhatsApp/email drafts and does not send them. */
const WHATSAPP = '18764503415';
const EMAIL = 'eezeegoltd@gmail.com';

const toggle = document.querySelector('.page-menu-toggle');
const pageNav = document.querySelector('#site-nav');
if (toggle && pageNav) {
  const setMenu = open => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    pageNav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && pageNav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  pageNav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
}

function localISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function displayDate(value) {
  if (!value) return 'Flexible / to discuss';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
}

const form = document.querySelector('#contact-form');
if (form) {
  const fields = {
    service: form.querySelector('#c-service'),
    destination: form.querySelector('#c-destination'),
    date: form.querySelector('#c-date'),
    travellers: form.querySelector('#c-travellers'),
    name: form.querySelector('#c-name'),
    message: form.querySelector('#c-message')
  };
  const ready = document.querySelector('#enquiry-ready');
  fields.date.min = localISO(new Date());

  // Preselect non-personal context passed from service and trip pages, e.g. ?service=Group+trips&destination=Panama
  const params = new URLSearchParams(location.search);
  const preset = (select, value) => {
    if (!value) return;
    const match = [...select.options].find(o => o.value.toLowerCase() === value.toLowerCase());
    if (match) select.value = match.value;
  };
  preset(fields.service, params.get('service'));
  preset(fields.destination, params.get('destination'));
  // Only a matching ID returned by the current catalogue may provide trip context.
  // The embedded flyer data is not an authoritative fallback for edited departures.
  const requestedTripId = params.get('trip');
  let tripPending = false;
  let applyingTrip = false;
  const editedContext = new Set();
  const contextFields = ['service', 'destination', 'date', 'message'];
  for (const key of contextFields) {
    fields[key].addEventListener('input', () => { if (!applyingTrip) editedContext.add(key); });
  }
  const submitButton = form.querySelector('button[type="submit"]');
  let tripNotice = null;
  let tripNoticeText = null;
  let retryTrip = null;
  const notifyTrip = (message, retry = false) => {
    if (!tripNotice) {
      tripNotice = document.createElement('div');
      tripNotice.className = 'notice';
      tripNotice.id = 'contact-trip-context';
      tripNotice.setAttribute('role', 'status');
      tripNotice.style.marginTop = '20px';
      tripNotice.style.display = 'block';
      tripNoticeText = document.createElement('p');
      retryTrip = document.createElement('button');
      retryTrip.type = 'button';
      retryTrip.className = 'text-link';
      retryTrip.style.background = 'transparent';
      retryTrip.style.minHeight = '44px';
      retryTrip.style.marginTop = '8px';
      retryTrip.textContent = 'Try loading this departure again';
      retryTrip.addEventListener('click', loadTripContext);
      tripNotice.append(tripNoticeText, retryTrip);
      form.prepend(tripNotice);
    }
    tripNoticeText.textContent = message;
    retryTrip.hidden = !retry;
  };
  const publishField = input => {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };
  async function loadTripContext() {
    if (tripPending || !requestedTripId) return;
    tripPending = true;
    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    ready.hidden = true;
    notifyTrip('Loading the current departure details before preparing your message…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch('/api/operations/trips', { cache: 'no-store', credentials: 'same-origin', headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Catalogue unavailable');
      const data = await response.json();
      const trip = Array.isArray(data.trips) ? data.trips.find(item => item && item.id === requestedTripId && typeof item.name === 'string') : null;
      if (!trip) {
        notifyTrip('This departure is not in the current catalogue. You can write a general group-trip enquiry below; the team will confirm the latest options.', true);
        return;
      }
      applyingTrip = true;
      if (!editedContext.has('service')) { preset(fields.service, 'Group trips'); publishField(fields.service); }
      if (!editedContext.has('destination')) {
        let option = [...fields.destination.options].find(item => item.value === trip.name);
        if (!option) {
          option = document.createElement('option');
          option.value = trip.name;
          option.textContent = trip.name;
          fields.destination.append(option);
        }
        fields.destination.value = option.value;
        publishField(fields.destination);
      }
      const validDate = typeof trip.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(trip.date);
      if (!editedContext.has('date')) {
        fields.date.value = validDate && trip.date >= fields.date.min ? trip.date : '';
        publishField(fields.date);
      }
      if (!editedContext.has('message')) {
        const advertisedDate = validDate ? (trip.displayDate || displayDate(trip.date)) : 'a date to be confirmed';
        const advertisedPrice = typeof trip.advertisedPrice === 'string' && trip.advertisedPrice.trim() ? ` at ${trip.advertisedPrice.trim()}` : '';
        const pickup = typeof trip.departurePoint === 'string' && trip.departurePoint.trim() ? trip.departurePoint.trim() : 'Meeting point to be confirmed';
        const closed = trip.status !== 'enquiries_open' || (validDate && trip.date < fields.date.min);
        fields.message.value = `I would like to enquire about ${trip.name}, advertised for ${advertisedDate}${advertisedPrice}. Please confirm availability, current price, currency, final inclusions and booking details. Pickup: ${pickup}.${closed ? ' Please advise about the status of this departure and any upcoming alternatives.' : ''}`;
        publishField(fields.message);
      }
      notifyTrip('Current advertised departure details loaded. You can edit your message before continuing. Availability and final booking details are confirmed by the team.');
    } catch {
      notifyTrip('The current departure details could not load. No old trip details have been added. Try again, or write a general enquiry and ask the team to confirm the date, price and pickup point.', true);
    } finally {
      clearTimeout(timeout);
      applyingTrip = false;
      tripPending = false;
      submitButton.disabled = false;
      form.removeAttribute('aria-busy');
    }
  }
  if (requestedTripId) loadTripContext();

  const showError = (input, message) => {
    const error = document.querySelector(`#${input.id}-error`);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
  };
  const validate = () => {
    let first = null;
    const check = (input, message) => {
      const bad = !input.checkValidity();
      showError(input, bad ? message(input) : '');
      if (bad && !first) first = input;
    };
    check(fields.service, () => 'Choose the service you need, or “Not sure yet”.');
    check(fields.date, input => input.validity.rangeUnderflow ? 'Choose today or a future date.' : 'Enter a valid date.');
    check(fields.travellers, () => 'Enter a number from 1 to 99.');
    if (first) first.focus();
    return !first;
  };
  for (const input of Object.values(fields)) {
    input.addEventListener('change', () => { if (input.getAttribute('aria-invalid') === 'true') validate(); });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (tripPending) {
      ready.hidden = true;
      notifyTrip('Please wait for the current departure details to load before preparing your message.');
      return;
    }
    if (!validate()) { ready.hidden = true; return; }
    const details = {
      service: fields.service.value,
      destination: fields.destination.value || 'Open to suggestions',
      date: displayDate(fields.date.value),
      travellers: fields.travellers.value || 'Not specified'
    };
    for (const [key, value] of Object.entries(details)) document.querySelector(`#ready-${key}`).textContent = value;
    const lines = [
      'Hello EE-Zee Go Travel! I would like help with a travel enquiry.',
      fields.name.value.trim() && `Name: ${fields.name.value.trim()}`,
      `Service: ${details.service}`,
      `Destination: ${details.destination}`,
      `Travel date: ${details.date}`,
      `Travellers: ${details.travellers}`,
      fields.message.value.trim() && `Details: ${fields.message.value.trim()}`,
      'Please let me know the next steps.'
    ].filter(Boolean);
    const body = lines.join('\n');
    document.querySelector('#ready-whatsapp').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(body)}`;
    document.querySelector('#ready-email').href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Travel enquiry: ${details.service}`)}&body=${encodeURIComponent(body)}`;
    ready.hidden = false;
    ready.focus();
  });
  form.addEventListener('input', () => { if (!ready.hidden) ready.hidden = true; });
}
