// Karte der Plakatorte. Daten: standorte.json (erzeugt von tools/standorte-aus-fotos.mjs aus Standorte-Liste.csv).
// Ein Standort bündelt mehrere Plakatstellen (punkte) und die Anzahl der Plakate.
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const muenster=[51.9607,7.6261];
const two=n=>String(n).padStart(2,'0');
const plakateText=n=>n==null?'':n===1?'1 Plakat':`${n} Plakate`;

const map=L.map('orteMap',{scrollWheelZoom:false,zoomControl:false}).setView(muenster,12);
L.control.zoom({position:'bottomright'}).addTo(map);
// OpenStreetMap-Kacheln, per CSS (.orte-map .leaflet-tile-pane) ins dunkle Design umgefärbt.
// OSM verlangt einen Referer; der Server setzt sonst Referrer-Policy same-origin (403 "Access blocked").
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,referrerPolicy:'strict-origin-when-cross-origin',attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
map.on('focus',()=>map.scrollWheelZoom.enable());map.on('blur',()=>map.scrollWheelZoom.disable());

const icon=n=>L.divIcon({className:'orte-pin',html:`<span>${n}</span>`,iconSize:[30,30],iconAnchor:[15,15],popupAnchor:[0,-14]});
const label=p=>[p.name,p.stadtteil].filter(Boolean).join(' · ')||'Münster';

let orte=[];const markers=new Map();
const layer=L.layerGroup().addTo(map),detailZoom=16,cell=56;

// Nahe Standorte je Zoomstufe zu Zahlenblasen bündeln (Raster in Bildschirmpixeln); ab detailZoom alle einzeln,
// dazu kleine Punkte für die einzelnen Plakatstellen.
function renderMap(){
  layer.clearLayers();
  const zoom=map.getZoom();
  if(zoom>=detailZoom){
    for(const p of orte)for(const [lat,lng] of p.punkte||[])layer.addLayer(L.circleMarker([lat,lng],{radius:4,color:'#0c100e',weight:1,fillColor:'#d9f36a',fillOpacity:.75,interactive:false}));
    markers.forEach(m=>layer.addLayer(m));return;
  }
  const cells=new Map();
  for(const p of orte){const pt=map.project([p.lat,p.lng],zoom),key=Math.floor(pt.x/cell)+':'+Math.floor(pt.y/cell);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);}
  for(const group of cells.values()){
    if(group.length===1){layer.addLayer(markers.get(group[0].id));continue;}
    const lat=group.reduce((t,p)=>t+p.lat,0)/group.length,lng=group.reduce((t,p)=>t+p.lng,0)/group.length;
    const size=group.length<10?38:group.length<100?46:54;
    const bubble=L.marker([lat,lng],{icon:L.divIcon({className:'orte-cluster',html:`<span>${group.length}</span>`,iconSize:[size,size],iconAnchor:[size/2,size/2]}),title:`${group.length} Standorte`,keyboard:true});
    bubble.on('click',()=>map.fitBounds(group.map(p=>[p.lat,p.lng]),{padding:[50,50],maxZoom:detailZoom+1}));
    layer.addLayer(bubble);
  }
}
map.on('zoomend',renderMap);

function renderList(filter=''){
  const q=filter.trim().toLowerCase();
  const shown=orte.filter(p=>!q||label(p).toLowerCase().includes(q));
  if(!orte.length){$('#orteList').innerHTML='<p class="muted">Die Plakatorte werden gerade erfasst. Schau bald wieder vorbei.</p>';return;}
  if(!shown.length){$('#orteList').innerHTML='<p class="muted">Kein Ort gefunden.</p>';return;}
  const groups=new Map();for(const p of shown){const g=p.stadtteil||'Weitere Orte';if(!groups.has(g))groups.set(g,[]);groups.get(g).push(p);}
  $('#orteList').innerHTML=[...groups].map(([g,list])=>{
    const sum=list.reduce((t,p)=>t+(p.plakate||0),0);
    return `<div class="orte-group"><h3>${esc(g)}<small>${list.length} ${list.length===1?'STANDORT':'STANDORTE'}${sum?` · ${sum} PLAKATE`:''}</small></h3>${list.map(p=>`<button type="button" class="orte-item" data-id="${esc(p.id)}"><b>${p.nr}</b><span>${esc(p.name)}${p.plakate!=null?`<small>${plakateText(p.plakate)}</small>`:''}</span><i aria-hidden="true">↗</i></button>`).join('')}</div>`;
  }).join('');
}

$('#orteList').addEventListener('click',e=>{
  const b=e.target.closest('.orte-item');if(!b)return;
  const m=markers.get(b.dataset.id);if(!m)return;
  if(map.getZoom()===17&&layer.hasLayer(m)){map.panTo(m.getLatLng());m.openPopup();}
  else{map.once('zoomend',()=>m.openPopup());map.flyTo(m.getLatLng(),17,{duration:.8});}
  if(window.matchMedia('(max-width: 900px)').matches)$('#orteMap').scrollIntoView({behavior:'smooth',block:'center'});
});
$('#orteSearch').addEventListener('input',e=>renderList(e.target.value));

try{
  const data=await fetch('standorte.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{standorte:[]});
  orte=Array.isArray(data.standorte)?data.standorte:[];
  for(const p of orte){
    const m=L.marker([p.lat,p.lng],{icon:icon(p.nr),title:label(p)});
    m.bindPopup(`<div class="orte-popup"><span class="eyebrow">STANDORT N°${two(p.nr)}</span><strong>${esc(p.name)}</strong><small>${esc(p.stadtteil||'Münster')}</small>${p.plakate!=null?`<em>${plakateText(p.plakate)}</em>`:''}<a href="bestellen.html?service=verteilung">Hier plakatieren ↗</a></div>`);
    markers.set(p.id,m);
  }
  if(orte.length)map.fitBounds(orte.map(p=>[p.lat,p.lng]),{padding:[40,40],maxZoom:15});
  renderMap();
  const total=orte.reduce((t,p)=>t+(p.plakate||0),0);
  $('#orteCount').textContent=two(orte.length);
  $('#ortePlakate').textContent=total?two(total):'–';
  $('#orteDistricts').textContent=two(new Set(orte.map(p=>p.stadtteil).filter(Boolean)).size);
  if(data.stand)$('#orteStand').textContent='STAND '+new Date(data.stand).toLocaleDateString('de-DE',{month:'2-digit',year:'numeric'});
}catch{orte=[];}
renderList();
setTimeout(()=>map.invalidateSize(),150);
