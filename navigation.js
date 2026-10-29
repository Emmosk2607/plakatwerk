const SITE_PAGES={
 'index.html':{key:'start',title:'Startseite'},
 'leistungen.html':{key:'leistungen',title:'Leistungen'},
 'ablauf.html':{key:'ablauf',title:'So funktioniert’s'},
 'pakete.html':{key:'pakete',title:'Pakete'},
 'plakatmotive.html':{key:'motive',title:'Plakatmotive'},
 'faq.html':{key:'faq',title:'Häufige Fragen'}
};
function toggleMainMenu(force){const button=document.querySelector('.menu-toggle');const expanded=typeof force==='boolean'?force:button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));document.querySelector('.site-header').classList.toggle('menu-open',expanded)}
const pageTemplateShop=shop;
function currentSitePage(){const filename=location.pathname.split('/').pop()||'index.html';return SITE_PAGES[filename]||SITE_PAGES['index.html']}
function renderSitePage(){const page=currentSitePage();pageTemplateShop();const selectors={start:'.newhero',ablauf:'#ablauf',pakete:'.package-section',motive:'#collection',faq:'.faq-section'};let section;
if(page.key==='leistungen'){section=document.createElement('section');section.className='editorial-section services-page';section.innerHTML=`<span class="section-label">UNSERE LEISTUNGEN / MÜNSTER</span><h1>Dein Event.<br><span>Unser Einsatz.</span></h1><p class="page-intro">Von der Druckdatei bis zur Verteilung: Du entscheidest, was du brauchst. Wir organisieren dein Plakatprojekt.</p><div class="service-page-grid"><article class="panel"><span class="service-number">01 ↗</span><h2>Plakate drucken</h2><p>Format und Auflage wählen, druckfertige PDF-, JPG- oder TIF-Datei bis 1.000 MB bereitstellen. Wir suchen garantiert den günstigsten Druckanbieter für deinen Auftrag und organisieren den Druck.</p><a class="text-link" href="plakatmotive.html">Zu den Plakatmotiven ↗</a></article><article class="panel"><span class="service-number">02 ↗</span><h2>In Münster verteilen</h2><p>Wir verteilen deine Plakate an Stromkästen in Münster. Wunschgebiete und Zeitraum stimmen wir über deinen Auftrag ab. Du kannst auch die Verteilung bereits gedruckter Plakate anfragen.</p><a class="text-link" href="pakete.html">Passendes Paket ansehen ↗</a></article><article class="panel"><span class="service-number">03 ↗</span><h2>Fortschritt verfolgen</h2><p>Im persönlichen Dashboard siehst du den Stand deiner Kampagne, angebrachte Mengen und gemeldete Plakatierungsorte auf der Münster-Karte.</p><button class="text-link" onclick="accountPage()">Zum Kundenbereich ↗</button></article></div><div class="service-page-cta"><div><h2>Alles aus einer Hand.</h2><p>Ein Auftrag für Druck und Verteilung. Dein individuelles Angebot beginnt mit deinen Wünschen.</p></div><a class="primary" href="pakete.html">Pakete entdecken ↗</a></div>`}
else section=main.querySelector(selectors[page.key]);
if(!section)return;main.replaceChildren(section);main.dataset.page=page.key;document.title=page.title+' · PLAKATWERK';
if(page.key==='start'){const how=section.querySelector('.text-link');if(how){how.removeAttribute('onclick');how.onclick=()=>{location.href='ablauf.html'}}const links=document.createElement('div');links.className='home-page-links';links.innerHTML='<a href="leistungen.html"><span>01 / LEISTUNGEN</span>Was wir für dich tun ↗</a><a href="pakete.html"><span>02 / PAKETE</span>Dein Paket auswählen ↗</a><a href="plakatmotive.html"><span>03 / PLAKATMOTIVE</span>Motiv entdecken ↗</a>';main.appendChild(links)}
if(page.key==='motive')renderProducts();
document.querySelectorAll('#mainNav a').forEach(a=>{const active=a.dataset.page===page.key;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
}
// Existing back-to-collection actions lead to the dedicated catalogue page.
shop=function(){location.href='plakatmotive.html'};
document.querySelectorAll('.header-tools button').forEach(b=>b.addEventListener('click',()=>{toggleMainMenu(false);document.querySelectorAll('#mainNav a').forEach(a=>{a.classList.remove('active');a.removeAttribute('aria-current')})}));
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleMainMenu(false)});
new ResizeObserver(entries=>{document.documentElement.style.setProperty('--header-offset',(Math.ceil(entries[0].target.getBoundingClientRect().height)+18)+'px')}).observe(document.querySelector('.site-header'));
renderSitePage();
