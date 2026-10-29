// Progressive enhancement: content stays visible even if animations are unavailable.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const seen=new WeakSet(),running=new Set();
const selector='main h1, main > .section .section-head, .service-card, .event-card, .steps article, .banner-cta, .city-signal, .event-detail-hero > .journey-art';
function eligible(el){return !el.closest('form, dialog, .checkout-event, .confirmation, #accountApp, #orderApp, .admin-page, .journey-layout')&&!el.hidden;}
function enter(el){
 if(reduced.matches||!el.animate||document.hidden)return;
 const heading=el.matches('h1'),signal=el.matches('.city-signal');
 const siblings=[...el.parentElement.children].filter(e=>e.matches('.service-card,.event-card'));
 const delay=Math.max(0,siblings.indexOf(el))*75;
 const frames=heading?[{opacity:0,transform:'translateX(-36px)'},{opacity:1,transform:'translateX(0)'}]:signal?[{opacity:0,translate:'22px 0'},{opacity:1,translate:'0 0'}]:[{opacity:0,translate:'0 20px'},{opacity:1,translate:'0 0'}];
 const animation=el.animate(frames,{duration:heading?760:570,delay,easing:'cubic-bezier(.18,.72,.22,1)',fill:'backwards'});
 running.add(animation);animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
 if(heading){const accent=el.querySelector('em');if(accent){const a=accent.animate([{opacity:.25,translate:'24px 0'},{opacity:1,translate:'0 0'}],{duration:800,delay:100,easing:'cubic-bezier(.18,.72,.22,1)',fill:'backwards'});running.add(a);a.finished.catch(()=>{}).finally(()=>running.delete(a));}}
}
const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){observer.unobserve(entry.target);enter(entry.target);}}},{threshold:.1,rootMargin:'0px 0px -20px 0px'}):null;
function scan(root=document){const candidates=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];for(const el of candidates){if(seen.has(el)||!eligible(el))continue;seen.add(el);if(observer&&!reduced.matches)observer.observe(el);}}
function addRibbon(){
 const place=document.querySelector('.home-hero,.page-heading');
 const page=location.pathname.split('/').pop()||'index.html';
 if(!place||!['index.html','leistungen.html'].includes(page)||document.querySelector('.motion-ribbon'))return;
 const ribbon=document.createElement('section');ribbon.className='motion-ribbon';ribbon.setAttribute('aria-label','Druck. Plakatierung. Tickets. Münster.');
 const text='<span>DEIN EVENT</span><i aria-hidden="true">↗</i><span>UNSERE STADT</span><i aria-hidden="true">✳</i><span>DEIN PUBLIKUM</span><i aria-hidden="true">↗</i>';
 ribbon.innerHTML='<div class="ribbon-window" aria-hidden="true"><div class="ribbon-track"><div class="ribbon-group">'+text+'</div><div class="ribbon-group">'+text+'</div></div></div><button class="ribbon-toggle" type="button" aria-label="Laufschrift pausieren" aria-pressed="false">Ⅱ</button>';
 place.after(ribbon);const button=ribbon.querySelector('button');button.onclick=()=>{const paused=ribbon.classList.toggle('paused');button.textContent=paused?'▶':'Ⅱ';button.setAttribute('aria-label',paused?'Laufschrift starten':'Laufschrift pausieren');button.setAttribute('aria-pressed',String(paused));};
}
addRibbon();scan();
const mutations=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType===1&&!node.closest('.motion-ribbon'))scan(node);}});
mutations.observe(document.querySelector('main')||document.body,{childList:true,subtree:true});
reduced.addEventListener('change',()=>{if(reduced.matches){for(const a of running)a.cancel();observer?.disconnect();}else scan();});
