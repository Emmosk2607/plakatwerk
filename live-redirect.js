// Auf GitHub Pages: zum laufenden PC-Server weiterleiten, sobald er erreichbar ist.
// live.json schreibt server/publish-live.mjs beim Start und Ende des Liveservers.
(function(){
  if(!location.hostname.endsWith('.github.io'))return;
  const page=location.pathname.split('/').pop()||'index.html';
  fetch('live.json?t='+Date.now(),{cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(live=>{
      if(!live||!live.running||!/^https:\/\/[a-z0-9.-]+$/i.test(live.url||''))return;
      return fetch(live.url+'/__plakatwerk-live',{cache:'no-store',signal:AbortSignal.timeout(5000)})
        .then(r=>r.ok?r.json():null)
        .then(ping=>{if(ping&&ping.plakatwerk&&ping.ready)location.replace(live.url+'/'+page+location.search+location.hash);});
    })
    .catch(()=>{});
})();
