/* Progressive enhancement: retain native values, validation and no-JS fields.
   Popovers live outside the hero so its rounded frame never clips them. */
(() => {
 const root = new URL('.', document.currentScript.src);
 const icon = name => new URL(`assets/icons/${name}.svg`, root).href;
 const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const fromISO = s => {const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);};
 const monthName = d => new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric'}).format(d);
 const readable = d => new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(fromISO(d));
 let active = null;
 const image = name => {const el=document.createElement('img');el.src=icon(name);el.alt='';el.width=20;el.height=20;return el;};
 const makeButton = (text, className) => {const b=document.createElement('button');b.type='button';b.className=className;b.textContent=text;return b;};
 function place() {
  if(!active)return;
  const {panel,trigger}=active,r=trigger.getBoundingClientRect(),gap=10,pad=12;
  const viewport=window.visualViewport;
  const height=viewport?.height||innerHeight,offset=viewport?.offsetTop||0;
  const width=Math.min(active.calendar?340:Math.max(310,r.width),innerWidth-pad*2);
  panel.style.width=`${width}px`;
  const below=height+offset-r.bottom-gap-pad,above=r.top-offset-gap-pad;
  const down=below>=Math.min(panel.scrollHeight,350)||below>=above;
  panel.style.maxHeight=`${Math.max(100,down?below:above)}px`;
  panel.style.left=`${Math.max(pad,Math.min(r.left,innerWidth-width-pad))}px`;
  panel.style.top=`${down?r.bottom+gap:Math.max(offset+pad,r.top-gap-Math.min(panel.scrollHeight,above))}px`;
  active.anchorTop=r.top;
 }
 function close(restore=false) {
  if(!active)return;
  const previous=active;active=null;previous.panel.remove();previous.trigger.setAttribute('aria-expanded','false');previous.trigger.removeAttribute('aria-activedescendant');
  if(restore)previous.trigger.focus({preventScroll:true});
 }
 function open(panel,trigger,calendar=false) {
  close();document.body.append(panel);trigger.setAttribute('aria-expanded','true');active={panel,trigger,calendar};place();
 }
 document.addEventListener('pointerdown',event=>{if(active&&!active.panel.contains(event.target)&&!active.trigger.contains(event.target))close();});
 document.addEventListener('focusin',event=>{if(active&&!active.panel.contains(event.target)&&event.target!==active.trigger)close();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active){event.preventDefault();close(true);}});
 window.addEventListener('resize',place);
 window.visualViewport?.addEventListener('resize',place);
 document.addEventListener('scroll',event=>{
  if(active&&!active.panel.contains(event.target)){
   const bounds=active.trigger.getBoundingClientRect();
   if(bounds.bottom<0||bounds.top>innerHeight)close();else place();
  }
 },true);
 const publish = input => {input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
 function prepare(input,placeholder) {
  const hero=Boolean(input.closest('.hero'));
  const label=document.querySelector(`label[for="${input.id}"]`);
  const trigger=makeButton('',`control-trigger${hero?' control-trigger-hero':''}`);
  trigger.id=`${input.id}-trigger`;
  const text=document.createElement('span');trigger.append(text);
  if(!hero)trigger.append(image(input.type==='date'?'calendar-dots':'caret-down'));
  const labelText=(label?.textContent||input.getAttribute('aria-label')||placeholder).replace(/\(optional\)/,'').trim();
  trigger.setAttribute('aria-expanded','false');
  if(input.required)trigger.setAttribute('aria-required','true');
  trigger.setAttribute('aria-describedby',input.getAttribute('aria-describedby')||'');
  input.classList.add('native-control');input.tabIndex=-1;input.setAttribute('aria-hidden','true');
  input.parentElement.classList.add('custom-control');input.insertAdjacentElement('afterend',trigger);
  if(label)label.addEventListener('click',event=>{event.preventDefault();trigger.focus();});
  const sync=()=>{
   const value=input.tagName==='SELECT'?input.selectedOptions[0].textContent:input.value?readable(input.value):placeholder;
   text.textContent=value;trigger.setAttribute('aria-label',`${labelText}: ${value}`);
   trigger.setAttribute('aria-invalid',input.getAttribute('aria-invalid')||'false');
   trigger.classList.toggle('has-selection',Boolean(input.value));
  };
  input.addEventListener('input',sync);input.addEventListener('change',sync);
  new MutationObserver(sync).observe(input,{attributes:true,attributeFilter:['aria-invalid','min','disabled']});
  input.addEventListener('invalid',event=>{event.preventDefault();trigger.focus();});
  input.addEventListener('focus',()=>{if(input.getAttribute('aria-invalid')==='true')trigger.focus();});
  input.form?.addEventListener('reset',()=>setTimeout(sync,0));sync();
  return {hero,trigger,labelText};
 }
 for(const select of document.querySelectorAll('#trip-search select,#contact-form select')) {
  const {trigger,labelText}=prepare(select,'Choose an option');
  trigger.setAttribute('role','combobox');trigger.setAttribute('aria-haspopup','listbox');
  let entries=[],cursor=0,typeahead='',timer;
  function highlight(index){
   cursor=Math.max(0,Math.min(index,entries.length-1));
   entries.forEach((entry,i)=>entry.element.classList.toggle('is-active',i===cursor));
   const entry=entries[cursor];if(entry){
    trigger.setAttribute('aria-activedescendant',entry.element.id);
    const list=entry.element.parentElement,rect=entry.element.getBoundingClientRect(),frame=list.getBoundingClientRect();
    if(rect.top<frame.top)list.scrollTop-=frame.top-rect.top;
    else if(rect.bottom>frame.bottom)list.scrollTop+=rect.bottom-frame.bottom;
   }
  }
  function choose(entry){select.value=entry.value;publish(select);close(true);}
  function show(){
   if(active?.trigger===trigger){close();return;}
   const panel=document.createElement('div');panel.className='control-popover select-popover';
   const title=document.createElement('p');title.className='control-eyebrow';title.textContent=labelText;panel.append(title);
   const list=document.createElement('div');list.className='control-options';list.id=`${select.id}-options`;list.setAttribute('role','listbox');list.setAttribute('aria-label',labelText);
   trigger.setAttribute('aria-controls',list.id);panel.append(list);
   entries=[...select.options].filter(o=>!o.disabled).map((option,i)=>{
    const el=document.createElement('div');el.className='control-option';el.id=`${select.id}-option-${i}`;el.setAttribute('role','option');el.setAttribute('aria-selected',String(option.value===select.value));
    const name=document.createElement('span');name.textContent=option.textContent;el.append(name,image('check-circle'));
    const entry={element:el,value:option.value,label:option.textContent};el.addEventListener('pointermove',()=>highlight(i));el.addEventListener('click',()=>choose(entry));list.append(el);return entry;
   });
   if(entries.length>6){const hint=document.createElement('p');hint.className='control-list-hint';hint.textContent='Scroll to explore all options';panel.append(hint);}
   open(panel,trigger);highlight(Math.max(0,entries.findIndex(e=>e.value===select.value)));place();
  }
  trigger.addEventListener('click',show);
  trigger.addEventListener('keydown',event=>{
   const opened=active?.trigger===trigger;
   if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
    event.preventDefault();if(!opened)show();else highlight(event.key==='Home'?0:event.key==='End'?entries.length-1:cursor+(event.key==='ArrowDown'?1:-1));
   }else if((event.key==='Enter'||event.key===' ')&&opened){event.preventDefault();if(entries[cursor])choose(entries[cursor]);}
   else if(event.key==='Tab')close();
   else if(event.key.length===1&&!event.ctrlKey&&!event.metaKey&&event.key!==' '){
    event.preventDefault();if(!opened)show();clearTimeout(timer);typeahead+=event.key.toLowerCase();timer=setTimeout(()=>typeahead='',700);const found=entries.findIndex(e=>e.label.toLowerCase().startsWith(typeahead));if(found>=0)highlight(found);
   }
  });
 }
 for(const input of document.querySelectorAll('#travel-date,#c-date')) {
  const {trigger,labelText}=prepare(input,input.id==='travel-date'?'Travel Date':'Choose a date');
  trigger.setAttribute('aria-haspopup','dialog');
  let shown,focused;
  function show(){
   if(active?.trigger===trigger){close();return;}
   const minimum=input.min||iso(new Date());focused=input.value&&input.value>=minimum?fromISO(input.value):fromISO(minimum);shown=new Date(focused.getFullYear(),focused.getMonth(),1);
   const panel=document.createElement('div');panel.className='control-popover calendar-popover';panel.id=`${input.id}-calendar`;panel.setAttribute('role','dialog');panel.setAttribute('aria-label',`${labelText} calendar`);trigger.setAttribute('aria-controls',panel.id);
   open(panel,trigger,true);render(panel,true);
  }
  function render(panel,focusDay=false){
   panel.replaceChildren();
   const eyebrow=document.createElement('p');eyebrow.className='control-eyebrow';eyebrow.textContent='When shall we go?';panel.append(eyebrow);
   const header=document.createElement('div');header.className='calendar-heading';
   const previous=makeButton('','calendar-nav');previous.setAttribute('aria-label','Previous month');previous.append(image('caret-down'));
   const next=makeButton('','calendar-nav');next.setAttribute('aria-label','Next month');next.append(image('caret-down'));
   const month=document.createElement('h2');month.textContent=monthName(shown);month.setAttribute('aria-live','polite');
   const min=input.min||iso(new Date());const earliest=fromISO(min);
   previous.disabled=shown.getFullYear()===earliest.getFullYear()&&shown.getMonth()===earliest.getMonth();
   header.append(previous,month,next);panel.append(header);
   const weekdays=document.createElement('div');weekdays.className='calendar-weekdays';weekdays.setAttribute('aria-hidden','true');
   for(const day of ['Mo','Tu','We','Th','Fr','Sa','Su']){const span=document.createElement('span');span.textContent=day;weekdays.append(span);}panel.append(weekdays);
   const grid=document.createElement('div');grid.className='calendar-grid';grid.setAttribute('role','grid');grid.setAttribute('aria-label',monthName(shown));
   const start=new Date(shown);start.setDate(1-((shown.getDay()+6)%7));const last=new Date(shown.getFullYear(),shown.getMonth()+1,0);const count=Math.ceil((((shown.getDay()+6)%7)+last.getDate())/7)*7;
   for(let i=0;i<count;i++){
    if(i%7===0){const row=document.createElement('div');row.className='calendar-week';row.setAttribute('role','row');grid.append(row);}
    const d=new Date(start);d.setDate(start.getDate()+i);const value=iso(d);
    const cell=document.createElement('div');cell.setAttribute('role','gridcell');cell.setAttribute('aria-selected',String(input.value===value));
    const button=makeButton(String(d.getDate()),'calendar-day');button.dataset.date=value;button.setAttribute('aria-label',new Intl.DateTimeFormat('en-GB',{dateStyle:'full'}).format(d));button.disabled=value<min||(input.max&&value>input.max);button.tabIndex=value===iso(focused)?0:-1;
    if(d.getMonth()!==shown.getMonth())button.classList.add('is-outside');if(value===iso(new Date()))button.setAttribute('aria-current','date');if(value===input.value)button.classList.add('is-selected');
    button.addEventListener('click',()=>{input.value=value;publish(input);close(true);});cell.append(button);grid.lastChild.append(cell);
   }panel.append(grid);
   const footer=document.createElement('div');footer.className='calendar-footer';const clear=makeButton('Keep dates flexible','calendar-clear');const today=makeButton('Today','calendar-today');
   clear.addEventListener('click',()=>{input.value='';publish(input);close(true);});today.addEventListener('click',()=>{const now=iso(new Date());input.value=now<min?min:now;publish(input);close(true);});footer.append(clear,today);panel.append(footer);
   const moveMonth=amount=>{shown.setMonth(shown.getMonth()+amount);focused=new Date(shown);if(iso(focused)<min)focused=fromISO(min);render(panel,true);};previous.addEventListener('click',()=>moveMonth(-1));next.addEventListener('click',()=>moveMonth(1));
   grid.addEventListener('keydown',event=>{
    const button=event.target.closest('.calendar-day');if(!button)return;
    const day=fromISO(button.dataset.date);let handled=true;
    if(event.key==='ArrowRight')day.setDate(day.getDate()+1);else if(event.key==='ArrowLeft')day.setDate(day.getDate()-1);else if(event.key==='ArrowDown')day.setDate(day.getDate()+7);else if(event.key==='ArrowUp')day.setDate(day.getDate()-7);
    else if(event.key==='Home')day.setDate(day.getDate()-((day.getDay()+6)%7));else if(event.key==='End')day.setDate(day.getDate()+6-((day.getDay()+6)%7));
    else if(event.key==='PageDown'||event.key==='PageUp'){day.setDate(1);day.setMonth(day.getMonth()+(event.key==='PageDown'?1:-1)*(event.shiftKey?12:1));}else handled=false;
    if(handled){event.preventDefault();const value=iso(day);if(value<min||(input.max&&value>input.max))return;focused=day;shown=new Date(day.getFullYear(),day.getMonth(),1);render(panel,true);}
   });
   place();if(focusDay)panel.querySelector('.calendar-day[tabindex="0"]')?.focus({preventScroll:true});
  }
  trigger.addEventListener('click',show);
  trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();show();}});
 }
 // Keep the native query prefill/validation paths in sync with the visible UI.
 document.querySelectorAll('.native-control').forEach(input=>input.dispatchEvent(new Event('change',{bubbles:true})));
})();
