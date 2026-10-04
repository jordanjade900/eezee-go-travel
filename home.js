// Homepage-only motion. No scroll listeners, animation loops, or framework dependency.
(() => {
  const root=document.querySelector('.home-editorial');
  if(!root||!('IntersectionObserver' in window))return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let observer;
  function configure(){
    observer?.disconnect();
    root.classList.remove('motion-ready');
    if(reduced.matches)return;
    const items=[...root.querySelectorAll('[data-reveal]')];
    observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}},{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    root.classList.add('motion-ready');
    for(const item of items){if(!item.classList.contains('is-visible'))observer.observe(item);}
  }
  configure();reduced.addEventListener('change',configure);
  // Focus must never enter visually hidden content during keyboard navigation.
  root.addEventListener('focusin',event=>event.target.closest('[data-reveal]')?.classList.add('is-visible'));
})();

// The service index previews its subject on hover or keyboard focus. Links stay
// ordinary links, and touch visitors keep a stable image rather than a carousel.
(() => {
  const image=document.querySelector('.photo-window img');
  const entries=[...document.querySelectorAll('.service-entry')];
  const assets=[['travel-window','Sunrise through an aircraft window'],['visa-city','Illustrative European city architecture'],['passport-desk','Illustrative travel preparation still life'],['journey-street','Illustrative Latin American street']];
  if(!image)return;
  let request=0;
  async function preview(index){
    const id=++request;const [name,description]=assets[index];
    const next=new Image();next.src=`assets/${name}${innerWidth<=768?'-768':''}.webp`;
    try{await next.decode();}catch{return;}
    if(id!==request)return;
    const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    image.classList.add('is-changing');
    if(!reduce)await new Promise(resolve=>setTimeout(resolve,160));
    if(id!==request)return;
    image.removeAttribute('srcset');image.src=next.src;image.alt=description;image.classList.remove('is-changing');
    entries.forEach((entry,i)=>entry.classList.toggle('is-active',i===index));
  }
  entries.forEach((entry,i)=>{entry.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')preview(i);});entry.addEventListener('focus',()=>preview(i));});
})();
