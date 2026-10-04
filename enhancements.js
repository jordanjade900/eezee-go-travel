// One shared, keyboard-accessible return control. The observer avoids a scroll
// handler; hidden controls cannot receive focus. Never covers an open dialog.
(() => {
  const now=new Date();const localDate=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  for(const trip of document.querySelectorAll('[data-trip-date]')){
    if(trip.dataset.tripDate<localDate){trip.querySelector('.local-trip-status').textContent='Past advertised departure';trip.querySelector('a').firstChild.textContent='Ask about future trips ';}
  }
  const button=document.querySelector('.back-to-top');
  if(!button || !('IntersectionObserver' in window))return;
  const marker=document.createElement('div');
  marker.setAttribute('aria-hidden','true');
  Object.assign(marker.style,{position:'absolute',top:'0',left:'0',width:'1px',height:'80vh',pointerEvents:'none'});
  document.body.prepend(marker);
  let away=false;
  const sync=()=>button.hidden=!away || Boolean(document.querySelector('dialog[open]')) || Boolean(document.activeElement?.matches('input,select,textarea'));
  new IntersectionObserver(entries=>{away=!entries[0].isIntersecting;sync();},{threshold:0}).observe(marker);
  const dialog=document.querySelector('dialog');
  if(dialog)new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
  document.addEventListener('focusin',sync);
  document.addEventListener('focusout',()=>queueMicrotask(sync));
  button.addEventListener('click',()=>{
    // Focus the document's primary landmark without scrolling it implicitly.
    const main=document.querySelector('main');
    if(main){main.setAttribute('tabindex','-1');main.focus({preventScroll:true});main.addEventListener('blur',()=>main.removeAttribute('tabindex'),{once:true});}
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });
})();
