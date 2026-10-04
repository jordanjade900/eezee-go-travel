// GSAP adds image choreography, type sequencing and tactile feedback.
// All content is visible by default. No loading gate, smooth-scroll hijack or fake booking.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(hover:hover) and (pointer:fine)');
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
let motionContext;
const root=document.querySelector('.atelier-site');
function revealFocused(event){for(const node of event.composedPath())if(node instanceof HTMLElement&&node.matches('[data-rise],[data-type],[data-photo],.type-word')){gsap?.killTweensOf(node);node.style.opacity='1';node.style.visibility='visible';node.style.transform='none';}}
function configureMotion(){
 motionContext?.revert();
 if(!gsap||!ScrollTrigger||reduced.matches)return;
 gsap.registerPlugin(ScrollTrigger);
 motionContext=gsap.context(()=>{
  for(const heading of document.querySelectorAll('[data-type]')){
   if(!heading.querySelector('.type-word')){
    const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes){const fragment=document.createDocumentFragment();for(const word of node.textContent.split(/(\s+)/)){if(!word.trim()){fragment.append(word);continue;}const mask=document.createElement('span');mask.className='type-mask';const inner=document.createElement('span');inner.className='type-word';inner.textContent=word;mask.append(inner);fragment.append(mask);}node.replaceWith(fragment);}
   }
   gsap.from(heading.querySelectorAll('.type-word'),{yPercent:110,rotation:2,opacity:.2,duration:1,stagger:.07,ease:'power4.out',scrollTrigger:{trigger:heading,start:'top 94%',once:true}});
  }
  gsap.utils.toArray('[data-rise]').forEach(node=>gsap.from(node,{y:45,opacity:0,duration:.95,ease:'power3.out',scrollTrigger:{trigger:node,start:'top 94%',once:true}}));
  for(const frame of document.querySelectorAll('[data-photo]')){
   const img=frame.querySelector('img');if(!img)continue;
   // Transform the photo itself, never its clipping container or text controls.
   gsap.fromTo(img,{scale:1.17},{scale:fine.matches?1.08:1,duration:1.6,ease:'power3.out',scrollTrigger:{trigger:frame,start:'top 95%',once:true}});
   if(frame.matches('.atelier-photo'))gsap.from(frame,{clipPath:'inset(12% 8% 12% 8% round 40px)',duration:1.25,ease:'power3.out',scrollTrigger:{trigger:frame,start:'top 96%',once:true}});
   if(fine.matches&&!navigator.connection?.saveData)gsap.fromTo(img,{yPercent:-3},{yPercent:3,ease:'none',scrollTrigger:{trigger:frame,start:'top bottom',end:'bottom top',scrub:.8}});
  }
  for(const card of document.querySelectorAll('.featured-trip,.local-trip,.destination-postcard'))gsap.from(card,{y:35,opacity:0,duration:.8,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 97%',once:true}});
 },root);
 ScrollTrigger.refresh();
}
configureMotion();reduced.addEventListener('change',configureMotion);document.addEventListener('focusin',revealFocused);
document.fonts.ready.then(()=>ScrollTrigger?.refresh());window.addEventListener('load',()=>ScrollTrigger?.refresh());
// Six-pixel magnetic response is confined to standalone CTAs with pointer input.
for(const button of document.querySelectorAll('.atelier-site .p-button,.atelier-site .page-book,.home-horizon .home-pill')){
 const reset=()=>gsap?.to(button,{x:0,y:0,duration:.45,ease:'elastic.out(1,.5)',overwrite:true});
 button.addEventListener('pointermove',e=>{if(!gsap||!fine.matches||reduced.matches||e.pointerType!=='mouse')return;const box=button.getBoundingClientRect();gsap.to(button,{x:(e.clientX-box.left-box.width/2)*.08,y:(e.clientY-box.top-box.height/2)*.12,duration:.3,overwrite:true});});
 button.addEventListener('pointerleave',reset);button.addEventListener('blur',reset);reduced.addEventListener('change',reset);
}
const track=document.querySelector('.destination-track');
if(track){document.querySelector('.reel-controls').hidden=false;const controls=[...document.querySelectorAll('[data-reel-step]')];const update=()=>{controls[0].disabled=track.scrollLeft<5;controls[1].disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-5;};controls.forEach(button=>button.addEventListener('click',()=>{const step=track.querySelector('.destination-postcard').getBoundingClientRect().width+24;track.scrollBy({left:Number(button.dataset.reelStep)*step,behavior:reduced.matches?'instant':'smooth'});}));track.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update);update();}
// Three.js is fetched only when its dedicated service illustration is near view.
const globe=document.querySelector('[data-globe]');
if(globe&&!navigator.connection?.saveData){const observer=new IntersectionObserver(async entries=>{if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();try{const {mountGlobe}=await import('./assets/vendor/globe.js');mountGlobe(globe);}catch(error){globe.dataset.fallback=error.message;globe.classList.remove('globe-ready');globe.querySelector('canvas')?.remove();}},{rootMargin:'150px'});observer.observe(globe);}
