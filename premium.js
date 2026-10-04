/* Progressive enhancement: the content is visible before this runs, and remains
   visible without JS. Focus always reveals its containing animated section. */
const surface = document.querySelector('.premium-main');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let observer;
function setMotion() {
  observer?.disconnect();
  surface?.classList.remove('motion-on');
  if (!surface || preference.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      entry.target.classList.add('entered');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08, rootMargin: '0px 0px 24px 0px' });
  surface.querySelectorAll('[data-enter]').forEach(el => observer.observe(el));
  surface.classList.add('motion-on');
}
surface?.addEventListener('focusin', event => {
  for (let el = event.target; el && el !== surface; el = el.parentElement) {
    if (el.hasAttribute('data-enter')) el.classList.add('entered');
  }
});
preference.addEventListener('change', setMotion);
setMotion();
