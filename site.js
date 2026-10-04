/* Shared behaviour for interior pages. No server request, storage or analytics:
   the contact form only prepares WhatsApp/email drafts the visitor sends themselves. */
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
  // Only published trip IDs can supply enquiry context; never render URL text.
  const tripData = document.querySelector('#local-trip-data');
  if (tripData) {
    const trip = JSON.parse(tripData.textContent).find(item => item.id === params.get('trip'));
    if (trip) {
      preset(fields.service, 'Group trips');
      preset(fields.destination, trip.name);
      if (trip.date >= fields.date.min) fields.date.value = trip.date;
      fields.message.value = `I would like to enquire about ${trip.name}, advertised for ${trip.displayDate} at ${trip.advertisedPrice}. Please confirm availability, currency, final inclusions and booking details. Departure: ${trip.departure}.`;
    }
  }

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
