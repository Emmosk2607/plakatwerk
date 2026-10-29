const app=document.querySelector('#app'),logout=document.querySelector('#logout');
const state={session:null,profiles:[],providers:[],profileId:'matt-standard',job:null,history:[],historical:false,timer:null,generation:0,quantity:100};
let invite=new URLSearchParams(location.hash.slice(1)).get('einrichten')||'';
if(invite)window.history.replaceState(null,'',location.pathname+location.search);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n/100);
const date=t=>t?new Date(t).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'}):'Noch nicht geprüft';
const amounts=[100,200,400,500,1000];
const profileFor=spec=>state.profiles.find(p=>p.id===spec?.profileId)||state.profiles.find(p=>p.paper===spec?.paper&&p.compareMode===(spec?.compareMode||'exact')&&(p.compareMode==='standard'||p.grams===spec?.grams));
const resultName=r=>profileFor(r?.spec)?.name||`${r?.spec?.grams||''} g/m² · ${r?.spec?.paper==='affichen'?'Affichen':'matt'}`;
async function api(route,method='GET',data){
  let r;try{r=await fetch('/api/admin/'+route,{method,credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{...(method==='POST'?{'Content-Type':'application/json','X-CSRF-Token':state.session?.csrf||''}:{}),...(invite?{'X-Setup-Invite':invite}:{})},body:data===undefined?undefined:JSON.stringify(data)});}catch{throw Error('Verbindung zum PC-Server unterbrochen. Bereits angezeigte Ergebnisse bleiben erhalten. Sobald die Verbindung wieder besteht, wird der laufende Abruf weiter angezeigt.');}
  let out;try{out=await r.json();}catch{throw Error('Der Server antwortet noch nicht. Bitte kurz warten und die Seite erneut laden.');}
  if(!r.ok){const error=Error(out.error||'Die Anfrage konnte nicht verarbeitet werden.');error.status=r.status;throw error;}return out;
}
function message(text='',bad=false){const e=document.querySelector('#message');if(e){e.textContent=text;e.classList.toggle('error',bad);}}
function handleError(err){if(err.status===401){state.session=null;renderLogin(false,'Deine Sitzung ist abgelaufen. Bitte erneut anmelden.');}else message(err.message,true);}
function renderLogin(setup,error=''){
  state.generation++;clearTimeout(state.timer);logout.hidden=true;
  app.innerHTML=`<section class="login"><div class="eyebrow">PLAKATWERK / ADMIN</div><h1>${setup?'Dein Adminzugang.':'Willkommen zurück.'}</h1><p>${setup?'Lege deinen persönlichen Zugang an.':'Melde dich für den Druckpreisvergleich an.'}</p><form id="loginForm"><label for="username">Benutzername</label><input id="username" autocomplete="username" required maxlength="80"><label for="password">Passwort${setup?' · mindestens 6 Zeichen':''}</label><input id="password" type="password" autocomplete="${setup?'new-password':'current-password'}" required ${setup?'minlength="6"':''} maxlength="256">${setup?'<label for="repeat">Passwort wiederholen</label><input id="repeat" type="password" autocomplete="new-password" required maxlength="256">':''}<p id="loginError" class="error" role="alert">${esc(error)}</p><button class="primary" type="submit">${setup?'Zugang anlegen':'Einloggen'}</button></form><p class="small">Dieser Zugang ist vom Kundenkonto getrennt.</p></section>`;
  document.querySelector('#loginForm').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button'),password=document.querySelector('#password').value;
    if(setup&&password!==document.querySelector('#repeat').value){document.querySelector('#loginError').textContent='Die Passwörter stimmen nicht überein.';return;}
    b.disabled=true;try{state.session=await api(setup?'setup':'login','POST',{username:document.querySelector('#username').value.trim(),password});invite='';await load();}catch(err){const target=document.querySelector('#loginError');if(target)target.textContent=err.message;b.disabled=false;}
  };
}
function renderShell(){
  logout.hidden=false;
  app.innerHTML=`<div class="eyebrow">INTERN / DRUCKEINKAUF</div><h1>Preise vergleichen.<br><span>Mit einem Knopfdruck.</span></h1><p class="intro">Aktuelle A1-Druckpreise für 100, 200, 400, 500 und 1.000 Plakate. Wähle einen der geprüften Materialvergleiche.</p><div id="message" role="status" aria-live="polite"></div><div class="layout"><aside class="panel controls"><h2>Dein Vergleich</h2><label for="profile">Materialprofil</label><select id="profile">${state.profiles.map(p=>`<option value="${p.id}" ${p.id===state.profileId?'selected':''}>${esc(p.name)}</option>`).join('')}</select><div id="selection"></div><button class="primary" id="compare">Aktuelle Preise vergleichen</button><p class="small">Standardversand nach Deutschland, ein Motiv, einseitig CMYK. Preise netto und brutto inklusive Versand.</p></aside><div class="content"><section id="results"></section><section class="panel history"><h2>Deine bisherigen Vergleiche</h2><p class="small">Gespeicherte Ergebnisse tragen immer ihren ursprünglichen Prüfzeitpunkt.</p><div id="history"></div></section></div></div>`;
  document.querySelector('#profile').onchange=e=>{state.profileId=e.target.value;renderSelection();if(state.job?.result)message('Auswahl geändert. Die angezeigten Preise gehören weiterhin zum beschrifteten letzten Vergleich.');};
  document.querySelector('#compare').onclick=start;renderSelection();renderResults();renderHistory();
}
function renderSelection(){
  const p=state.profiles.find(x=>x.id===state.profileId);if(!p)return;const formats=Object.keys(p.weights).map(id=>state.providers.find(x=>x.id===id)).filter(x=>x?.formatNote).map(x=>x.name+': '+x.formatNote).join(' ');
  document.querySelector('#selection').innerHTML=`<p>${esc(p.description)}</p><ul class="material-list">${Object.entries(p.weights).map(([id,grams])=>`<li><span>${esc(state.providers.find(x=>x.id===id)?.name||id)}</span><b>${grams} g/m²</b></li>`).join('')}</ul>${formats?`<p class="small">${esc(formats)} Übrige Anbieter: 594 × 841 mm.</p>`:''}<p class="small">DIN A1 · Anbietermaße beachten<br>${Object.keys(p.weights).length} passende ${Object.keys(p.weights).length===1?'Druckerei wird':'Druckereien werden'} abgefragt.</p>`;
}
function offerFor(p,q){return ['ok','cached'].includes(p.status)?p.quotes?.find(x=>x.quantity===q):null;}
function bestFor(r,q){const fresh=r.providers.filter(p=>p.status==='ok').map(p=>offerFor(p,q)?.netCents).filter(Number.isSafeInteger);return fresh.length?Math.min(...fresh):null;}
function renderResults(){
  const job=state.job,r=job?.result,run=job?.status==='running',button=document.querySelector('#compare');if(!button)return;
  button.disabled=run;button.textContent=run?'Vergleich läuft …':'Aktuelle Preise vergleichen';document.querySelector('#profile').disabled=run;
  const out=document.querySelector('#results');
  if(!r){out.innerHTML='<div class="panel empty"><div class="circle">€</div><h2>Bereit für deinen Preisvergleich.</h2><p>Der Standardvergleich fragt alle angebundenen Druckereien mit ihren angebotenen matten Standardpapieren ab. Die tatsächliche Papierstärke steht transparent dabei.</p><p class="small">112 g matt ist nicht als Profil verfügbar, da diese Stärke in den geprüften Konfiguratoren fehlt.</p></div>';return;}
  const live=r.providers.filter(p=>p.status==='ok').length,cached=r.providers.filter(p=>p.status==='cached').length,done=r.providers.filter(p=>!['pending','running'].includes(p.status)).length;
  const names={pending:'Wartet',running:'Wird geprüft',ok:'Preis geprüft',cached:'Gespeicherter Preis',unavailable:'Material geändert',error:'Aktualisierung offen'};
  const priceCell=(p,q)=>{const v=offerFor(p,q);return v?`<td class="${p.status==='cached'?'cached':v.netCents===bestFor(r,q)?'best':''}">${money(v.netCents)}<small>${money(v.grossCents)} brutto</small>${p.status==='cached'?'<small>Letzter geprüfter Preis</small>':''}</td>`:`<td class="small">${p.status==='pending'?'Wartet':p.status==='running'?'Prüfung läuft':p.status==='ok'?'Keine '+q+'er-Auflage':'Noch kein geprüfter Preis'}</td>`;};
  const historical=state.historical||job.restored;
  out.innerHTML=`<div class="summary"><div class="metric"><span>BEIM ABRUF GEPRÜFT</span><b>${live} / ${r.providers.length}</b></div><div class="metric"><span>FORMAT</span><b>A1</b></div><div class="metric"><span>AUFLAGEN</span><b>5</b></div></div><section class="panel"><div class="result-heading"><div><div class="eyebrow">${historical?'GESPEICHERTER VERGLEICH':'DEIN VERGLEICH'}</div><h2>${esc(resultName(r))}</h2></div><button id="csv" ${run||!r.providers.some(p=>p.quotes?.length)?'disabled':''}>CSV exportieren</button></div><p class="small">${historical?'Gespeicherter Abruf':'Gestartet'}: ${date(r.startedAt)}${r.completedAt?' · Abgeschlossen: '+date(r.completedAt):''}</p>${historical?'<div class="notice">Dies sind gespeicherte Ergebnisse. Mit „Aktuelle Preise vergleichen“ startest du einen neuen Abruf mit dem gewählten Profil.</div>':''}${r.spec.compareMode==='standard'?'<p class="history-note">Standardpapiere mit unterschiedlichen Grammaturen. Die Stärke steht bei jedem Anbieter; diese Angebote sind nicht materialidentisch.</p>':''}${job.notice?`<div class="notice">${esc(job.notice)}</div>`:''}${run?`<div class="progress"><div style="width:${done/r.providers.length*100}%"></div></div><p class="small running" role="status">${done} von ${r.providers.length} Anbietern fertig. Bereits geprüfte Preise erscheinen sofort.</p>`:''}${cached?`<div class="notice">${cached} Anbieter konnte nicht neu geprüft werden. Dafür ist der letzte geprüfte Preis mit Datum sichtbar. Gespeicherte Preise werden nicht als aktueller Preis gewertet.</div>`:''}<div class="desktop-prices scroll"><table><caption>Gesamtpreise inkl. Versand · grün = günstigstes geprüftes Angebot dieses Abrufs</caption><thead><tr><th>Auflage</th>${r.providers.map(p=>`<th>${esc(p.name)}<small>${p.actualGrams||r.spec.grams} g/m²</small></th>`).join('')}</tr></thead><tbody>${amounts.map(q=>`<tr><td>${q.toLocaleString('de-DE')} Stück</td>${r.providers.map(p=>priceCell(p,q)).join('')}</tr>`).join('')}</tbody></table></div><div class="mobile-prices"><label for="quantity">Auflage ansehen</label><select id="quantity">${amounts.map(q=>`<option value="${q}" ${state.quantity===q?'selected':''}>${q.toLocaleString('de-DE')} Stück</option>`).join('')}</select><div id="mobileOffers"></div></div><div class="providers">${r.providers.map(p=>`<details class="provider-detail"><summary><span>${esc(p.name)}</span><span class="badge ${p.status}">${names[p.status]||'Offen'}</span></summary><p>${p.status==='running'?esc(p.stage||'Preise werden geprüft'):esc(p.message||'Noch nicht gestartet.')}</p>${p.formatNote?`<p class="small">${esc(p.formatNote)}</p>`:''}<p class="small">${p.checkedAt?'Preisprüfung: '+date(p.checkedAt):''} · ${p.actualGrams||r.spec.grams} g/m²${p.attempt>1?' · Zweiter Abrufversuch':''}</p>${p.refreshProblem?`<p class="small">Letzte Aktualisierung: ${esc(p.refreshProblem)}</p>`:''}<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Konfigurator öffnen</a></details>`).join('')}</div><p class="small">19 % MwSt. · keine Gutscheine oder persönlichen Kundenrabatte berücksichtigt.</p></section>`;
  document.querySelector('#csv').onclick=()=>exportCSV(r);document.querySelector('#quantity').onchange=e=>{state.quantity=Number(e.target.value);renderMobileOffers(r);};renderMobileOffers(r);
}
function renderMobileOffers(r){
  const q=state.quantity,min=bestFor(r,q);
  document.querySelector('#mobileOffers').innerHTML=r.providers.map(p=>{const v=offerFor(p,q);return `<article class="mobile-offer ${v&&p.status==='ok'&&v.netCents===min?'best':''}"><div><b>${esc(p.name)}</b><small>${p.actualGrams||r.spec.grams} g/m² · ${v?date(p.checkedAt):p.status==='ok'?'Keine passende Auflage':'Prüfung offen'}</small></div><div>${v?`<strong>${money(v.netCents)}</strong><small>${money(v.grossCents)} brutto${p.status==='cached'?' · gespeichert':''}</small>`:`<small>${['pending','running'].includes(p.status)?'Wird geprüft …':p.status==='ok'?'Nicht im Sortiment':'Kein Preis bestätigt'}</small>`}</div></article>`;}).join('');
}
function renderHistory(){
  document.querySelector('#history').innerHTML=state.history.length?state.history.map((r,i)=>`<button class="history-row" data-history="${i}"><b>${esc(resultName(r))}</b><span>${date(r.completedAt)} · ${r.providers.filter(p=>p.status==='ok').length} Anbieter erfolgreich geprüft</span></button>`).join(''):'<p class="small">Noch keine abgeschlossenen Vergleiche.</p>';
  document.querySelectorAll('[data-history]').forEach(b=>{b.disabled=state.job?.status==='running';b.onclick=()=>{state.job={status:'complete',result:state.history[Number(b.dataset.history)]};state.historical=true;renderResults();};});
}
async function start(){
  document.querySelector('#compare').disabled=true;message();
  try{const value=await api('compare','POST',{profileId:state.profileId});state.job=value.job;state.historical=false;if(state.job?.status==='running'){state.profileId=state.job.result.spec.profileId||state.profileId;document.querySelector('#profile').value=state.profileId;renderSelection();}message(value.notice||'');renderResults();renderHistory();if(state.job.status==='running')poll();}
  catch(err){document.querySelector('#compare')?.removeAttribute('disabled');handleError(err);}
}
async function poll(){
  clearTimeout(state.timer);const generation=state.generation;
  try{const value=await api('compare');if(generation!==state.generation)return;state.job=value.job;renderResults();message();if(state.job?.status==='running')state.timer=setTimeout(poll,document.hidden?5000:2000);else{state.history=(await api('history')).history;if(generation===state.generation)renderHistory();}}
  catch(err){if(generation!==state.generation)return;handleError(err);if(state.session)state.timer=setTimeout(poll,5000);}
}
async function load(){
  const s=await api('session');state.session=s;state.profiles=s.profiles||[];state.providers=s.providers||[];
  const [h,j]=await Promise.all([api('history'),api('compare')]);state.history=h.history;state.job=j.job?.status!=='running'&&!j.job?.result?.spec?.profileId?null:j.job;state.historical=!!j.job?.restored;
  state.profileId=state.job?.status==='running'?(profileFor(state.job.result.spec)?.id||'matt-standard'):'matt-standard';
  renderShell();if(state.job?.status==='running')poll();
}
function exportCSV(r){
  const rows=[['Anbieter','Auflage','Material','Netto EUR','Brutto EUR','Preisart','Prüfzeit','Quelle','Formatangabe','Enthaltener Versand netto EUR']];for(const p of r.providers)for(const q of p.quotes||[])rows.push([p.name,q.quantity,q.material,(q.netCents/100).toFixed(2).replace('.',','),(q.grossCents/100).toFixed(2).replace('.',','),p.status==='cached'?'Gespeichert':'Geprüft',p.checkedAt,p.url,p.formatNote||'DIN A1, 594 × 841 mm',q.shippingNetCents===undefined?'':(q.shippingNetCents/100).toFixed(2).replace('.',',')]);
  const cell=x=>{let v=String(x??'');if(/^[=+\-@\t\r]/.test(v))v="'"+v;return '"'+v.replaceAll('"','""')+'"';};
  const data='\ufeff'+rows.map(row=>row.map(cell).join(';')).join('\r\n'),url=URL.createObjectURL(new Blob([data],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=`plakatwerk-a1-${r.startedAt.slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
logout.onclick=async()=>{try{await api('logout','POST',{});state.session=null;state.job=null;state.history=[];renderLogin(false);}catch(err){handleError(err);}};
window.addEventListener('online',()=>{if(state.session)poll();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&state.session&&state.job?.status==='running')poll();});
try{const s=await api('session');state.session=s;state.profiles=s.profiles||[];state.providers=s.providers||[];if(s.authenticated)await load();else if(s.setupRequired&&!s.setupAllowed)app.innerHTML='<section class="login"><h1>Zugang einrichten.</h1><p>Bitte die gültige Einrichtungseinladung verwenden oder den Zugang direkt auf dem PC einrichten.</p></section>';else renderLogin(s.setupRequired);}catch(err){app.innerHTML=`<section class="login"><h1>Verbindung prüfen.</h1><p role="alert">${esc(err.message)}</p><button id="reload" class="primary">Erneut verbinden</button></section>`;document.querySelector('#reload').onclick=()=>location.reload();}
