/* Hero-only milestone. No booking API, persistence, analytics or message sending.
   Existing-site nav destinations are intentional until local routes are approved. */
const form = document.querySelector('#trip-search');
const dialog = document.querySelector('#enquiry-dialog');
const date = document.querySelector('#travel-date');
const destination = document.querySelector('#destination');
const service = document.querySelector('#service');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-navigation');
const today = new Date();
date.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

function displayDate(value) {
  if (!value) return 'Flexible / to discuss';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {day:'numeric',month:'short',year:'numeric'}).format(new Date(year,month-1,day));
}
date.addEventListener('change', () => {
  date.parentElement.classList.toggle('has-value', Boolean(date.value));
  document.querySelector('.date-placeholder').textContent = date.value ? displayDate(date.value) : 'Travel Date';
});
function openEnquiry() {
  const details = {destination:destination.value || 'Open to suggestions', service:service.value || 'Travel enquiry', date:displayDate(date.value)};
  for (const [key,value] of Object.entries(details)) document.querySelector(`#summary-${key}`).textContent = value;
  const message = `Hello EE-Zee Go Travel! I would like help planning my trip.\nDestination: ${details.destination}\nService: ${details.service}\nTravel date: ${details.date}\nPlease let me know the next steps.`;
  document.querySelector('#whatsapp-link').href = `https://wa.me/18764503415?text=${encodeURIComponent(message)}`;
  dialog.showModal();
}
form.addEventListener('submit', event => { event.preventDefault(); if (form.reportValidity()) openEnquiry(); });
document.querySelector('[data-book]').addEventListener('click', () => { if (form.reportValidity()) openEnquiry(); });
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if(event.target === dialog) { const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) dialog.close(); } });
menu.addEventListener('click', () => { const open=menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label',open?'Close navigation':'Open navigation'); nav.classList.toggle('is-open',open); });
document.addEventListener('keydown', event => {if(event.key==='Escape'&&nav.classList.contains('is-open')){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');menu.focus();}});
nav.addEventListener('click',event=>{if(event.target.closest('a')){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');}});
