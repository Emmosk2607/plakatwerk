// Karte der Plakatorte. Daten: standorte.json (erzeugt von tools/standorte-aus-fotos.mjs).
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const muenster=[51.9607,7.6261];

const map=L.map('orteMap',{scrollWheelZoom:false,zoomControl:false}).setView(muenster,12);
L.control.zoom({position:'bottomright'}).addTo(map);
// OpenStreetMap-Kacheln, per CSS (.orte-map .leaflet-tile-pane) ins dunkle Design umgefärbt.
// OSM verlangt einen Referer; der Server setzt sonst Referrer-Policy same-origin (403 "Access blocked").
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
map.on('focus',()=>map.scrollWheelZoom.enable());map.on('blur',()=>map.scrollWheelZoom.disable());

const icon=n=>L.divIcon({className:'orte-pin',html:`<span>${n}</span>`,iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-14]});
const label=p=>[p.strasse,p.stadtteil].filter(Boolean).join(' · ')||'Münster';

let orte=[];const markers=new Map();

function renderList(filter=''){
  const q=filter.trim().toLowerCase();
  const shown=orte.filter(p=>!q||label(p).toLowerCase().includes(q));
  if(!orte.length){$('#orteList').innerHTML='<p class="muted">Die Plakatorte werden gerade erfasst. Schau bald wieder vorbei.</p>';return;}
  if(!shown.length){$('#orteList').innerHTML='<p class="muted">Kein Ort gefunden.</p>';return;}
  const groups=new Map();for(const p of shown){const g=p.stadtteil||'Weitere Orte';if(!groups.has(g))groups.set(g,[]);groups.get(g).push(p);}
  $('#orteList').innerHTML=[...groups].map(([g,list])=>`<div class="orte-group"><h3>${esc(g)}<small>${list.length}</small></h3>${list.map(p=>`<button type="button" class="orte-item" data-id="${esc(p.id)}"><b>${p.nr}</b><span>${esc(p.strasse||'Plakatfläche')}</span><i aria-hidden="true">↗</i></button>`).join('')}</div>`).join('');
}

$('#orteList').addEventListener('click',e=>{
  const b=e.target.closest('.orte-item');if(!b)return;
  const m=markers.get(b.dataset.id);if(!m)return;
  map.flyTo(m.getLatLng(),17,{duration:.8});m.openPopup();
  if(window.matchMedia('(max-width: 900px)').matches)$('#orteMap').scrollIntoView({behavior:'smooth',block:'center'});
});
$('#orteSearch').addEventListener('input',e=>renderList(e.target.value));

try{
  const data=await fetch('standorte.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{standorte:[]});
  orte=Array.isArray(data.standorte)?data.standorte:[];
  for(const p of orte){
    const m=L.marker([p.lat,p.lng],{icon:icon(p.nr),title:label(p)}).addTo(map);
    m.bindPopup(`<div class="orte-popup"><span class="eyebrow">PLAKATORT N°${String(p.nr).padStart(2,'0')}</span><strong>${esc(p.strasse||'Plakatfläche')}</strong><small>${esc(p.stadtteil||'Münster')}</small><a href="bestellen.html?service=verteilung">Hier plakatieren ↗</a></div>`);
    markers.set(p.id,m);
  }
  if(orte.length)map.fitBounds(orte.map(p=>[p.lat,p.lng]),{padding:[40,40],maxZoom:15});
  $('#orteCount').textContent=String(orte.length).padStart(2,'0');
  $('#orteDistricts').textContent=String(new Set(orte.map(p=>p.stadtteil).filter(Boolean)).size).padStart(2,'0');
  $('#orteStand').textContent=data.stand?new Date(data.stand).toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'}):'–';
}catch{orte=[];}
renderList();
setTimeout(()=>map.invalidateSize(),150);
