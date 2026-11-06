'use strict';
/* ==========================================================================
   v27 · MENU PRINCIPAL PROFESSIONNEL
   Écran titre « appuie sur une touche », menu vertical façon jeu AAA sur fond
   3D cinématique (port, avenue, piste avec décollage, terminal, Solenne),
   aperçu contextuel, profil de sauvegarde, paramètres à onglets, écran de
   chargement avec astuces, créateur de personnage plein écran, pause refaite.
   ========================================================================== */
(function(){
const el=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SET=window.S27?S27.set:{flySpeed:1,view:'cine',ann:true};
const TOUCH_GFX=matchMedia('(pointer: coarse)').matches||('ontouchstart' in window);
const GFX={q:TOUCH_GFX?0:1,ui:true};try{const o=JSON.parse(localStorage.getItem('port-aurore-gfx27')||'null');if(o)Object.assign(GFX,o);}catch(e){}
if(TOUCH_GFX)GFX.q=0;
const saveSet=()=>{try{localStorage.setItem('port-aurore-set27',JSON.stringify(SET));localStorage.setItem('port-aurore-gfx27',JSON.stringify(GFX));}catch(e){}};
/* ---------------- sons d'interface ---------------- */
let uctx=null;function ui(f,d,v){if(!GFX.ui||(typeof muted!=='undefined'&&muted))return;try{uctx=uctx||(window.actx&&actx.state==='running'?actx:new (window.AudioContext||window.webkitAudioContext)());const o=uctx.createOscillator(),g=uctx.createGain(),t=uctx.currentTime;o.type='triangle';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*1.5,t+d);g.gain.setValueAtTime(v||.035,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(uctx.destination);o.start(t);o.stop(t+d+.02);}catch(e){}}
const tick=()=>ui(1400,.05,.02),okS=()=>ui(520,.18,.05),backS=()=>ui(300,.14,.04);
/* ---------------- qualité graphique ---------------- */
const QN=['Performance','Équilibrée','Ultra'];
const GFX_QUALITIES=TOUCH_GFX?[QN[0]]:QN;
function applyGfx(){if(typeof renderer==='undefined'||!renderer)return;const dpr=window.devicePixelRatio||1,q=TOUCH_GFX?0:GFX.q,maxDpr=TOUCH_GFX?1:(q===0?1:q===1?1.5:2);renderer.setPixelRatio(Math.min(dpr,maxDpr));
  if(sun){sun.castShadow=!TOUCH_GFX&&q>0;const sz=TOUCH_GFX?512:q===2?2048:1024;if(sun.shadow.mapSize.x!==sz){sun.shadow.mapSize.set(sz,sz);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}if(!sun.castShadow&&sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}}
  if(window.FX45)FX45.setMode(q);
  dispatchEvent(new Event('resize'));}
/* ---------------- sauvegarde : lecture pour le profil ---------------- */
function readSave(){try{const s=JSON.parse(localStorage.getItem('port-aurore-rp')||'null');if(!s||!s.v)return null;const v27=JSON.parse(localStorage.getItem('port-aurore-v27')||'null')||{};
  const day=Math.floor((s.gameMin||600)/1440)+1,mm=Math.floor((s.gameMin||600)%1440);return {name:s.name||'Alex Martin',cash:s.cash||0,bank:s.bank||0,rep:s.rep||0,friends:(s.friends||[]).length,job:s.job,day,time:String(Math.floor(mm/60)).padStart(2,'0')+':'+String(mm%60).padStart(2,'0'),loc:typeof s.x==='number'&&s.x<-3000?'Île de Solenne':typeof s.x==='number'&&s.x<-330?'Aéroport International':'Port-Aurore',ticket:v27.ticket};}catch(e){return null;}}
/* ---------------- structure ---------------- */
const root=el('div');root.id='pm27';
root.innerHTML=`<div class="pm-scrim"></div><div class="pm-grain"></div><div class="pm-cut" id="pm-cut"></div>
<section class="pm-splash" id="pm-splash"><div class="pm-mark"></div><h1 class="pm-title">PORT-AURORE</h1><div class="pm-ed">ÉDITION HORIZONS</div><div class="pm-press" id="pm-press">Appuie sur une touche</div><div class="pm-legal">Jeu de rôle solo · sauvegarde locale · v27</div></section>
<section class="pm-main" id="pm-main" hidden>
  <header class="pm-top"><div class="pm-brand"><span class="pm-mk"></span>PORT-AURORE <em>RP</em></div><div class="pm-chips"><span class="pm-chip" id="pm-world"></span><span class="pm-chip pm-prof" id="pm-prof"></span></div></header>
  <aside class="pm-left"><div class="pm-logo"><small>Jeu de rôle · monde ouvert</small><h1>PORT-AURORE</h1><div class="pm-ed2">Édition Horizons</div></div><nav class="pm-nav" id="pm-nav"></nav></aside>
  <section class="pm-prev" id="pm-prev"></section>
  <footer class="pm-foot"><div class="pm-keys"><span><kbd>↑</kbd><kbd>↓</kbd>Naviguer</span><span><kbd>Entrée</kbd>Valider</span><span><kbd>Échap</kbd>Retour</span></div><div class="pm-ver">v27 · Solo · Sauvegarde automatique</div></footer>
</section>
<section class="pm-page" id="pm-page" hidden></section>
<div class="pm-modal" id="pm-modal" hidden></div>`;
const start=$('#start');start.appendChild(root);
const loadEl=el('div');loadEl.id='load27';loadEl.hidden=true;$('#app').appendChild(loadEl);
/* ---------------- créateur de personnage plein écran ---------------- */
(function creator(){const f=$('#intro');if(!f)return;f.classList.add('cc27');const cv=$('#look-prev');if(cv){cv.width=440;cv.height=540;}
  const stage=el('div','cc-stage','<div class="cc-ring"></div><div class="cc-plate"><small>Résident de Port-Aurore</small><b id="cc-name">Alex Martin</b></div>');if(cv)stage.insertBefore(cv,stage.firstChild);
  const panel=el('div','cc-panel');const back=f.querySelector('.menu-back');
  const head=el('div','cc-head','<div class="cc-kick">Création de personnage</div><h2>Qui seras-tu&nbsp;?</h2>');
  const tabs=el('nav','cc-tabs'),panes=el('div','cc-panes');
  const T=[['Identité',['.names','#look-k']],['Visage',['#look-h','#look-y','#look-bd','#look-g']],['Tenue',['#look-t','#look-s','#look-b','#look-p']],['Accessoires',['#look-bag','#look-n','#look-e','#look-w']]];
  T.forEach(([n,sel],i)=>{const b=el('button','cc-tab'+(i?'':' on'),n);b.type='button';const p=el('div','cc-pane'+(i?'':' on'));sel.forEach(s=>{const x=f.querySelector(s);if(x)p.appendChild(x);});
    b.onclick=()=>{tabs.querySelectorAll('.cc-tab').forEach(t=>t.classList.toggle('on',t===b));panes.querySelectorAll('.cc-pane').forEach(t=>t.classList.toggle('on',t===p));tick();};tabs.appendChild(b);panes.appendChild(p);});
  const foot=el('div','cc-foot');const rnd=el('button','cc-rnd','🎲 Aléatoire');rnd.type='button';rnd.onclick=()=>{f.querySelectorAll('.look').forEach(r=>{const bs=[...r.querySelectorAll('button')];if(bs.length)pick(bs).click();});okS();};
  const go=$('#go');foot.appendChild(rnd);if(go)foot.appendChild(go);
  if(back)panel.appendChild(back);panel.appendChild(head);panel.appendChild(tabs);panel.appendChild(panes);panel.appendChild(foot);
  f.appendChild(stage);f.appendChild(panel);
  const upd=()=>{const n=(($('#fn').value||'Alex')+' '+($('#ln').value||'Martin')).trim();$('#cc-name').textContent=n;};['#fn','#ln'].forEach(s=>{const i=$(s);if(i)i.addEventListener('input',upd);});setTimeout(upd,50);
  f.addEventListener('submit',()=>{if(window.__rms27)window.__rms27();showLoad('Port-Aurore','Centre-ville · Pôle Emploi');},true);})();
/* ---------------- éléments du menu ---------------- */
let SAVE=readSave();
const ITEMS=[
  {id:'continue',l:'Continuer',s:()=>SAVE?SAVE.name+' · '+SAVE.loc:'',show:()=>!!SAVE,go:()=>{doContinue();}},
  {id:'new',l:'Nouvelle partie',s:()=>'Crée ton personnage',go:()=>{if(SAVE)confirmBox('Nouvelle partie','Ta sauvegarde actuelle ('+SAVE.name+', jour '+SAVE.day+') sera remplacée dès que tu entreras en ville.',[['Créer un personnage',()=>{closeModal();$('#new-game').click();}],['Annuler',closeModal]]);else $('#new-game').click();}},
  {id:'dest',l:'Destinations',s:()=>'Port-Aurore · Île de Solenne',go:()=>page('dest')},
  {id:'guide',l:'Guide du joueur',s:()=>'Commandes et premiers pas',go:()=>$('#open-guide').click()},
  {id:'settings',l:'Paramètres',s:()=>'Graphismes · caméra · audio · vol',go:()=>page('settings')},
  {id:'news',l:'Nouveautés',s:()=>'Mise à jour v27',go:()=>page('news')},
  {id:'credits',l:'Crédits',s:()=>'',go:()=>page('credits')}];
let focus=0;const nav=$('#pm-nav');
function vis(){return ITEMS.filter(i=>!i.show||i.show());}
function renderNav(){nav.innerHTML='';vis().forEach((it,i)=>{const b=el('button','pm-item'+(i===focus?' on':''),'<span class="pm-l">'+it.l+'</span><span class="pm-s">'+esc(it.s()||'')+'</span>');b.type='button';b.dataset.id=it.id;
  b.onmouseenter=()=>{if(focus!==i){focus=i;sync();tick();}};b.onfocus=()=>{if(focus!==i){focus=i;sync();}};b.onclick=()=>{focus=i;sync();okS();it.go();};nav.appendChild(b);});sync();}
function sync(){[...nav.children].forEach((b,i)=>b.classList.toggle('on',i===focus));preview(vis()[focus]);}
function stat(k,v){return '<div><small>'+k+'</small><b>'+v+'</b></div>';}
function preview(it){const p=$('#pm-prev');if(!it){p.innerHTML='';return;}let h='';
  if(it.id==='continue'&&SAVE){const S=SAVE;h=`<div class="pv-kick">Dernière sauvegarde</div><div class="pv-who"><span class="pv-av">${esc(S.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</span><div><b>${esc(S.name)}</b><small>${esc(S.loc)} · jour ${S.day} · ${S.time}</small></div></div><div class="pv-grid">${stat('Cash',fmt(S.cash))+stat('Banque',fmt(S.bank))+stat('Rang',RANKS[Math.min(4,Math.floor(S.rep/10))])+stat('Amis',S.friends)}</div>${S.ticket?'<p class="pv-tk">✈ Billet '+esc(S.ticket.code)+' en poche · porte '+(S.ticket.from==='pax'?'A1':'1')+'</p>':''}<div class="pv-cta">Entrée · reprendre là où tu t’es arrêté</div>`;}
  else if(it.id==='new')h=`<div class="pv-kick">Nouvelle vie</div><h3>Arrive à Port-Aurore sans un sou de trop</h3><p>Choisis ton look, trouve un job au Pôle Emploi, achète un appart, construis un immeuble… ou prends l’avion pour l’île de Solenne.</p>${SAVE?'<p class="pv-warn">Remplacera la sauvegarde de '+esc(SAVE.name)+'.</p>':''}`;
  else if(it.id==='dest')h=`<div class="pv-kick">Deux cartes</div><div class="pv-dest"><div><b>Port-Aurore</b><small>Ville portuaire · 1 760 m · aéroport PAX</small></div><div><b>Île de Solenne</b><small>Lagon, village créole, hôtel · aéroport SLN</small></div></div><p>Vol AA 274 · 1 h 05 · à suivre en direct depuis la cabine.</p>`;
  else if(it.id==='guide')h=`<div class="pv-kick">Les bases</div><h3>Bouge, parle, travaille, voyage</h3><p><b>ZQSD</b> se déplacer · <b>E</b> interagir · <b>T</b> téléphone · <b>M</b> carte · <b>V</b> caméra · <b>Échap</b> pause.</p>`;
  else if(it.id==='settings')h=`<div class="pv-kick">Réglages actuels</div><div class="pv-grid">${stat('Qualité',QN[GFX.q])+stat('Caméra',typeof camSensName==='function'?camSensName():'—')+stat('Son',typeof muted!=='undefined'&&muted?'Coupé':'Activé')+stat('Vol',(SET.flySpeed||1)+'× · '+VNAME[SET.view||'cine'])}</div>`;
  else if(it.id==='news')h=`<div class="pv-kick">Mise à jour v27 · Horizons</div><h3>Prends de la hauteur</h3><p>Carte 3× plus grande, deux aéroports, vols en temps réel, l’île de Solenne et un tout nouveau menu.</p>`;
  else if(it.id==='credits')h=`<div class="pv-kick">Port-Aurore RP</div><h3>Fait avec Three.js</h3><p>Monde, véhicules, personnages et interfaces générés en code. Aucune ressource externe.</p>`;
  p.innerHTML=h;p.classList.remove('in');void p.offsetWidth;p.classList.add('in');}
const VNAME={cine:'Cinéma',ext:'Extérieur',hublot:'Hublot',cabine:'Cabine'};
/* ---------------- pages ---------------- */
let pageId=null;
function page(id){pageId=id;const P=$('#pm-page');P.hidden=false;$('#pm-main').classList.add('dim');let h='<button class="pm-back" type="button">‹ Retour</button>';
  if(id==='settings'){P.innerHTML=h+'<div class="pg-kick">Options</div><h2>Paramètres</h2>';P.appendChild(settingsUI());}
  else if(id==='dest'){P.innerHTML=h+`<div class="pg-kick">Le monde</div><h2>Destinations</h2><div class="pg-cards"><article class="pg-card c1"><div class="pg-art"></div><small>Carte 1 · continent</small><b>Port-Aurore</b><p>Centre-ville, port, Hauts-Jardins, Stade Aurore, zone d’activités, quartier des Horizons et l’Aéroport International (PAX) à l’ouest par l’autoroute A1.</p><ul><li>Cinéma, galerie commerciale, campus, caserne, commissariat et musée</li><li>Missions de métiers étendues dans le nouveau quartier</li><li>Vols AA 274 vers Solenne</li></ul></article><article class="pg-card c2"><div class="pg-art"></div><small>Carte 2 · océan Aurore</small><b>Île de Solenne</b><p>Île tropicale à 1 240 km : lagon turquoise, village créole, marché, Hôtel Lagon Bleu, bar de plage, ponton et phare.</p><ul><li>Excursions en bateau et plongée</li><li>Nuit à l’hôtel, spa, piscine</li><li>Retour par le vol AA 275</li></ul></article></div>`;}
  else if(id==='news'){P.innerHTML=h+`<div class="pg-kick">v27 · Horizons</div><h2>Nouveautés</h2><div class="pg-news">${[['Carte agrandie','Port-Aurore passe d’un carré de 512 m à près de 1,8 km : quartier pavillonnaire, stade de 32 000 places, zone d’activités, périphérique avec circulation, forêts et éoliennes.'],['Deux aéroports','Terminal ouvert à visiter : enregistrement, sûreté, salle d’attente, duty free, café, écrans des départs animés, passerelle, tour de contrôle, hangar et piste 36/18 balisée. Les avions décollent et atterrissent en continu.'],['Vols suivis en direct','Repoussage, roulage, décollage, croisière au-dessus des nuages, descente et atterrissage. Caméras cinéma, extérieure, hublot et cabine, carte de suivi type écran de bord, annonces du commandant, vitesse ×1/×2/×4.'],['Île de Solenne','Nouvelle carte tropicale avec son aéroport, son village, sa plage et ses activités.'],['Menu professionnel','Écran titre, menu sur fond cinématique, profil, paramètres à onglets, écran de chargement, créateur de personnage plein écran et pause repensée.']].map(([t,d])=>'<article><b>'+t+'</b><p>'+d+'</p></article>').join('')}</div>`;}
  else if(id==='credits'){P.innerHTML=h+`<div class="pg-kick">Merci d’avoir joué</div><h2>Crédits</h2><div class="pg-cred"><div><small>Conception, monde et code</small><b>Studio Port-Aurore</b></div><div><small>Moteur 3D</small><b>Three.js</b></div><div><small>Polices</small><b>Rajdhani · Barlow · Inter</b></div><div><small>Compagnie</small><b>Aurore Airways</b></div></div>`;}
  P.querySelector('.pm-back').onclick=closePage;}
function closePage(){if(!pageId)return;pageId=null;$('#pm-page').hidden=true;$('#pm-main').classList.remove('dim');backS();renderNav();}
/* paramètres à onglets (réutilisés en jeu) */
function settingsUI(){const W=el('div','st27');const tabs=el('nav','st-tabs'),body=el('div','st-body');
  const opt=(label,desc,get,vals,set)=>{const r=el('div','st-row');r.innerHTML='<div><b>'+label+'</b><small>'+desc+'</small></div><div class="st-sel"><button type="button" class="st-a">‹</button><span></span><button type="button" class="st-a">›</button></div>';const sp=r.querySelector('span'),[pv,nx]=r.querySelectorAll('button');
    const paint=()=>{sp.textContent=vals[get()]!=null?vals[get()]:get();};const step=d=>{const n=(get()+d+vals.length)%vals.length;set(n);paint();tick();saveSet();};pv.onclick=()=>step(-1);nx.onclick=()=>step(1);r.tabIndex=-1;paint();return r;};
  const sensI=()=>typeof CAMX!=='undefined'?Math.max(0,CAMX.SENS.findIndex(x=>x[1]===CAMX.sens)):1;
  const G={'Graphismes':()=>[opt('Qualité','Résolution et ombres',()=>GFX.q,GFX_QUALITIES,n=>{GFX.q=TOUCH_GFX?0:n;applyGfx();})].concat(window.FX45?FX45.rows(opt):[]),
    'Caméra':()=>[opt('Sensibilité','Souris, tactile et manette',sensI,typeof CAMX!=='undefined'?CAMX.SENS.map(x=>x[0]):['—'],n=>{CAMX.sens=CAMX.SENS[n][1];try{localStorage.setItem('port-aurore-sens',String(CAMX.sens));}catch(e){}}),
      opt('Distance','Aussi avec la touche V',()=>typeof CAMX!=='undefined'?CAMX.preset:1,typeof CAMX!=='undefined'?CAMX.PRE.map(x=>x[0]):['—'],n=>{CAMX.preset=n;CAMX.zoom=CAMX.PRE[n][1];camSaveZoom();})],
    'Audio':()=>[opt('Son du jeu','Moteurs, ambiance, réacteurs',()=>typeof muted!=='undefined'&&muted?1:0,['Activé','Coupé'],n=>{muted=!!n;}),opt('Annonces','Commandant de bord et aéroport',()=>SET.ann?0:1,['Activées','Coupées'],n=>{SET.ann=!n;}),opt('Sons d’interface','Menus',()=>GFX.ui?0:1,['Activés','Coupés'],n=>{GFX.ui=!n;})],
    'Vol':()=>[opt('Caméra au décollage','Changeable en vol avec V',()=>['cine','ext','hublot','cabine'].indexOf(SET.view||'cine'),['Cinéma','Extérieur','Hublot','Cabine'],n=>{SET.view=['cine','ext','hublot','cabine'][n];}),opt('Vitesse du vol','Accélère tout le trajet',()=>[1,2,4].indexOf(SET.flySpeed||1),['×1 · temps réel','×2','×4'],n=>{SET.flySpeed=[1,2,4][n];})]};
  Object.keys(G).forEach((k,i)=>{const b=el('button','st-tab'+(i?'':' on'),k);b.type='button';b.onclick=()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));body.innerHTML='';G[k]().forEach(r=>body.appendChild(r));tick();};tabs.appendChild(b);});
  G['Graphismes']().forEach(r=>body.appendChild(r));W.appendChild(tabs);W.appendChild(body);return W;}
window.settings27=settingsUI;
/* ---------------- fenêtre modale ---------------- */
function confirmBox(t,txt,btns){const M=$('#pm-modal');M.hidden=false;M.innerHTML='<div class="pm-dlg"><h3>'+esc(t)+'</h3><p>'+esc(txt)+'</p><div class="pm-dlg-b"></div></div>';const B=M.querySelector('.pm-dlg-b');btns.forEach(([l,f],i)=>{const b=el('button',i?'':'primary',l);b.type='button';b.onclick=f;B.appendChild(b);});setTimeout(()=>{const b=B.querySelector('button');if(b)b.focus();},30);}
function closeModal(){$('#pm-modal').hidden=true;}
/* ---------------- écran de chargement ---------------- */
const TIPS=['Le Pôle Emploi est sur la place centrale : un premier job débloque les missions.','À l’aéroport, achète ton billet au comptoir Aurore Airways, puis passe la sûreté.','En vol, appuie sur V pour changer de caméra et sur M pour la carte de suivi.','La banque protège ton argent des amendes payées en espèces.','À Solenne, l’Hôtel Lagon Bleu remet ton énergie au maximum.','Le Stade Aurore propose un match chaque jour : +30 humeur.','Le périphérique relie l’autoroute de l’aéroport, les Hauts-Jardins et le stade.'];
function showLoad(place,sub,cb){loadEl.hidden=false;loadEl.innerHTML=`<div class="ld-art"></div><div class="ld-tip"><small>Astuce</small><p>${esc(pick(TIPS))}</p></div><div class="ld-place"><small>${esc(sub||'')}</small><b>${esc(place)}</b><div class="ld-bar"><i></i></div></div><div class="ld-spin"></div>`;
  loadEl.classList.remove('out');setTimeout(()=>loadEl.classList.add('go'),20);setTimeout(()=>{if(cb)cb();},450);setTimeout(()=>{loadEl.classList.add('out');setTimeout(()=>{loadEl.hidden=true;loadEl.classList.remove('go','out');},700);},1900);}
function doContinue(){const S=SAVE;restoreMenuState();showLoad(S?S.loc:'Port-Aurore',S?S.name+' · jour '+S.day+' · '+S.time:'',()=>$('#continue-game').click());}
/* ---------------- écran titre ---------------- */
let stage='splash';
function toMain(){if(stage!=='splash')return;stage='main';okS();$('#pm-splash').classList.add('out');setTimeout(()=>{$('#pm-splash').hidden=true;},600);$('#pm-main').hidden=false;setTimeout(()=>$('#pm-main').classList.add('in'),30);SAVE=readSave();focus=0;renderNav();chips();}
function chips(){const w=$('#pm-world');const mm=Math.floor((typeof gameMin!=='undefined'?gameMin:600)%1440);w.innerHTML='<i>●</i> Monde · '+String(Math.floor(mm/60)).padStart(2,'0')+':'+String(mm%60).padStart(2,'0');
  const p=$('#pm-prof');p.innerHTML=SAVE?'<span class="pv-av sm">'+esc(SAVE.name.split(' ').map(x=>x[0]).join('').slice(0,2))+'</span>'+esc(SAVE.name)+' · '+fmt(SAVE.cash+SAVE.bank):'<span class="pv-av sm">?</span>Nouveau joueur';}
$('#pm-splash').addEventListener('pointerdown',toMain);
addEventListener('keydown',e=>{if(typeof started!=='undefined'&&started)return;if($('#start').hidden)return;const k=e.key;
  if(stage==='splash'){if(k&&!['Shift','Control','Alt','Meta'].includes(k)){e.preventDefault();toMain();}return;}
  if(!$('#pm-modal').hidden){if(k==='Escape'){closeModal();backS();}return;}
  const creatorOpen=!$('#intro').hidden,guideOpen=!$('#beginner-guide').hidden;
  if(creatorOpen||guideOpen){if(k==='Escape'&&!(e.target&&e.target.tagName==='INPUT')){const b=document.querySelector((creatorOpen?'#intro':'#beginner-guide')+' [data-menu-back]');if(b){b.click();backS();}}return;}
  if(pageId){if(k==='Escape'||k==='Backspace'){e.preventDefault();closePage();}return;}
  const n=vis().length;if(k==='ArrowDown'||k==='s'||k==='S'){e.preventDefault();focus=(focus+1)%n;sync();tick();nav.children[focus].focus({preventScroll:true});}
  else if(k==='ArrowUp'||k==='z'||k==='Z'||k==='w'||k==='W'){e.preventDefault();focus=(focus-1+n)%n;sync();tick();nav.children[focus].focus({preventScroll:true});}
  else if(k==='Enter'&&document.activeElement&&!document.activeElement.classList.contains('pm-item')){e.preventDefault();okS();vis()[focus].go();}});
/* le menu disparaît quand le créateur ou le guide est ouvert */
const obs=new MutationObserver(()=>{const sub=!$('#intro').hidden||!$('#beginner-guide').hidden;root.classList.toggle('sub',sub);if(!sub&&stage==='main'){SAVE=readSave();renderNav();}});
['#intro','#beginner-guide'].forEach(s=>{const x=$(s);if(x)obs.observe(x,{attributes:true,attributeFilter:['hidden']});});
const gd=$('#beginner-guide');if(gd){gd.classList.add('gd27');}
/* ---------------- caméra cinématique du menu ---------------- */
const MC={i:-1,t:99,gm:null,px:null};
const SH=[
  {n:'Port-Aurore',s:'Le port au coucher du soleil',d:10,f:(t)=>{const a=t*.06+.6,r=60;return [[Math.cos(a)*r,16+Math.sin(t*.1)*3,Math.sin(a)*r+60],[0,6,150]];}},
  {n:'Centre-ville',s:'Avenue des Docks',d:9,f:(t)=>[[-180+t*9,5.5,-28],[-120+t*9,12,-60]]},
  {n:'Aéroport International',s:'Piste 36 · vol au départ',d:11,on:()=>{if(window.AMB27){AMB27.start('takeoff');AMB27.s=0;}},f:(t)=>{const p=window.AMB27&&AMB27.p&&AMB27.p.visible?AMB27.p.position:{x:-760,y:3,z:-100};return [[-705,3.5,-170],[p.x,p.y+3,p.z]];},fov:t=>clamp(32-t*2,16,32)},
  {n:'Terminal PAX',s:'Salle d’embarquement · porte A1',d:9,f:(t)=>{const T=W27.terms.pax;if(!T)return [[0,10,0],[0,0,0]];const a=T.toW(T.D-10,28-t*4),b=T.plane.p;return [[a.x,2.4,a.z],[b.x,4,b.z]];}},
  {n:'Île de Solenne',s:'Plage du lagon',d:10,f:(t)=>{const X=SOL27.x;return [[X-160+t*12,4.5,252],[X+40+t*12,3,330]];}},
  {n:'Les Hauts-Jardins',s:'Quartier résidentiel',d:9,f:(t)=>[[-60+t*3,26,-380-t*6],[-32,0,-500]]}];
window.__rms27=()=>restoreMenuState();
function restoreMenuState(){if(MC.gm!=null){gameMin=MC.gm;MC.gm=null;}if(MC.px!=null){player.x=MC.px;player.z=MC.pz;MC.px=null;}if(camera){camera.fov=60;camera.updateProjectionMatrix();}}
const _uc=updateCamera;updateCamera=function(dt){if(typeof started!=='undefined'&&started){if(MC.gm!=null||MC.px!=null)restoreMenuState();_uc(dt);return;}
  if(typeof W27==='undefined'||!W27.built){_uc(dt);return;}
  if(MC.gm==null){MC.gm=gameMin;MC.px=player.x;MC.pz=player.z;}
  if(stage==='splash'&&navigator.getGamepads){try{for(const g of navigator.getGamepads())if(g&&g.buttons.some(b=>b.pressed)){toMain();break;}}catch(e){}}
  MC.t+=dt;const S=SH[Math.max(0,MC.i)];if(MC.i<0||MC.t>S.d){MC.i=(MC.i+1)%SH.length;MC.t=0;const c=$('#pm-cut');if(c){c.classList.remove('on');void c.offsetWidth;c.classList.add('on');}const N=SH[MC.i];if(N.on)N.on();const cap=$('#pm-world');if(cap&&stage==='main')cap.innerHTML='<i>●</i> '+N.n+' · '+N.s;}
  const C=SH[MC.i],[p,l]=C.f(MC.t);gameMin=15*60+40+MC.t*.4;camera.position.set(p[0],p[1],p[2]);camera.up.set(0,1,0);camera.lookAt(l[0],l[1],l[2]);
  const fv=C.fov?C.fov(MC.t):48;if(Math.abs(camera.fov-fv)>.05){camera.fov=fv;camera.updateProjectionMatrix();}
  player.x=p[0];player.z=p[2];if(scene.fog){scene.fog.near=120;scene.fog.far=420;}};
/* ---------------- pause repensée ---------------- */
const _rp=renderPause;renderPause=function(){_rp();const sh=$('#pause .sheet');if(!sh)return;sh.classList.add('pz27');
  let hd=sh.querySelector('.pz-head');if(!hd){hd=el('div','pz-head');sh.insertBefore(hd,sh.firstChild);}
  const loc=window.FL27&&FL27.on?'En vol · '+FL27.f.code:inSol27()?'Île de Solenne':player.x<-330?'Aéroport International':'Port-Aurore';
  hd.innerHTML='<div class="pz-kick">Jeu en pause</div><div class="pz-loc">'+esc(loc)+'</div>';
  const box=$('#pz-btns');const b=el('button','pz-set','Paramètres');b.type='button';b.onclick=()=>openSet();const first=box.children[1];box.insertBefore(b,first||null);
  let side=sh.querySelector('.pz-side');if(!side){side=el('aside','pz-side');$('#pause').appendChild(side);}
  side.innerHTML='<div class="pv-who"><span class="pv-av">'+esc(state.name.split(' ').map(x=>x[0]).join('').slice(0,2))+'</span><div><b>'+esc(state.name)+'</b><small>'+(JOBN[state.job]||'Sans emploi')+' · '+RANKS[rankOf()]+'</small></div></div><div class="pv-grid">'+stat('Cash',fmt(state.cash))+stat('Banque',fmt(state.bank))+stat('Santé',Math.round(state.health))+stat('Énergie',Math.round(state.energy))+stat('Missions',state.done)+stat('Amis',state.friends.length)+'</div>'+(window.S27&&S27.ticket?'<p class="pv-tk">✈ Billet '+esc(S27.ticket.code)+' · siège '+esc(S27.ticket.seat)+'</p>':'');};
let setEl=null;function openSet(){if(!setEl){setEl=el('div');setEl.id='set27';$('#app').appendChild(setEl);}setEl.hidden=false;setEl.innerHTML='<div class="set-in"><button class="pm-back" type="button">‹ Retour</button><div class="pg-kick">Options</div><h2>Paramètres</h2></div>';setEl.querySelector('.set-in').appendChild(settingsUI());setEl.querySelector('.pm-back').onclick=()=>{setEl.hidden=true;renderPause();};}
const _sp=setPause;setPause=function(v){if(!v&&setEl&&!setEl.hidden){setEl.hidden=true;}_sp(v);const s=document.querySelector('.pz-side');if(s)s.hidden=!v;};
/* qualité appliquée au démarrage */
const _bd=buildDecor;buildDecor=function(){_bd();try{applyGfx();}catch(e){}};
})();
