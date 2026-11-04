'use strict';
/* ==========================================================================
   v49 · AURORE OS · noyau du téléphone
   Notifications HUD avec actions (même en marchant ou en conduisant), appels
   entrants répondre/refuser, sonneries, mode silencieux, économie de batterie,
   mode conduite, écran de verrouillage personnalisable (fond, horloge, code
   PIN), recherche d'applis et de lieux, icônes déplaçables (appui long),
   badges reliés au gameplay, guidage vocal, lampe torche, synchronisation.
   Se greffe sur le téléphone v25 sans le remplacer.
   ========================================================================== */
(function(){
const KEY='pa-phone49';
const blank=()=>({v:1,order:null,tab:{},seq:1,inbox:[],calls:[],badge:{},
  set:{ring:0,silent:false,saver:false,drive:true,autoReply:true,pin:'',lockWall:-1,lockClock:0,lockMsg:'',voice:true,vacation:false,mute:{}},
  social:{followers:12,posts:[],stories:[],follow:{},blocked:{},bio:'Nouveau à Port-Aurore.',status:'online',groups:[],anon:[],seenStory:{},lastGen:0},
  bank:{save:0,auc:0,aucP:42,aucH:[42],aucT:0,card:{n:'',frozen:false},ins:{},tax:{base:0,due:0,since:0},net:{due:0,last:0},lastDay:-1,spent:{}},
  home:{dev:{},svc:{},lastDay:-1},
  market:{cart:[],fav:[],orders:[],hist:[],ads:[]},
  jobs:{clock:null,pays:[],leave:-1,apps:[],ad:0,invoices:[]},
  travel:{trips:[],city:null},
  life:{bk:[],docs:[],vnotes:[],notes:[],alarms:[],journal:[],reward:{day:-1,streak:0},appts:[],missions:{day:-1,list:[]},stats:{play:0,posts:0,transfers:0,calls:0,nav:0,orders:0},torch:false},
  auto:{lock:{},ct:{}}
});
let P=blank();
try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o&&o.v===1){P=Object.assign(blank(),o);const b=blank();['set','social','bank','home','market','jobs','travel','life','auto'].forEach(k=>{P[k]=Object.assign(b[k],o[k]||{});});P.life.stats=Object.assign(blank().life.stats,P.life.stats||{});}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P));}catch(e){}};
const day=()=>Math.floor(gameMin/1440);
const hhmm=m=>{const t=Math.floor(((m%1440)+1440)%1440);return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');};
const when=m=>{const d=day()-Math.floor(m/1440);return d<=0?hhmm(m):d===1?'Hier '+hhmm(m):'Jour '+(Math.floor(m/1440)+1);};
const afford=c=>state.cash+state.bank>=c;
function log(label,amount,acct){try{if(typeof econTxP58==='function')econTxP58(label,amount,acct||'Banque');}catch(e){}}
function pay(c,label){c=Math.round(c);if(!c)return true;if(P.bank.card&&P.bank.card.frozen){toast('Carte Aurore gelée · dégèle-la dans Aurore Bank.','warn');return false;}if(!afford(c)){toast('Fonds insuffisants ('+fmt(c)+').','warn');return false;}takeMoney(c);log(label||'Paiement',-c,'Carte Aurore');saveProgress();return true;}
function earn(c,label,cash){c=Math.round(c);if(cash)state.cash+=c;else state.bank+=c;state.earned=(state.earned||0)+Math.max(0,c);log(label||'Crédit',c,cash?'Cash':'Banque');saveProgress();}
const MET=()=>window.MET46||null;
const AMS=()=>(window.AM&&AM.ST)||null;

/* ---------------- audio : sonneries et sons de notification ---------------- */
let AC=null;
function ac(){try{if(typeof muted!=='undefined'&&muted)return null;if(!AC)AC=(window.actx&&actx.state==='running')?actx:new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();return AC;}catch(e){return null;}}
function beep(f,d,v,t0,type){const A=ac();if(!A)return;const t=A.currentTime+(t0||0),o=A.createOscillator(),g=A.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v||.07,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+d+.03);}
const RINGS=[
  ['Lagune',[[784,.16,0],[988,.16,.18],[1175,.24,.36],[988,.16,.7],[1175,.3,.88]]],
  ['Marimba',[[659,.12,0],[880,.12,.14],[659,.12,.28],[880,.12,.42],[1047,.28,.56]],'triangle'],
  ['Classique',[[1320,.09,0],[1320,.09,.13],[1320,.09,.26],[1320,.09,.39],[1320,.09,.52],[1320,.09,.65]],'square'],
  ['Kora',[[523,.22,0],[659,.22,.2],[784,.22,.4],[1047,.4,.6],[784,.22,1.0]],'triangle'],
  ['Néon',[[440,.1,0],[880,.1,.1],[1320,.1,.2],[880,.1,.3],[440,.2,.4]],'sawtooth']];
function ring(i){const r=RINGS[i==null?P.set.ring:i]||RINGS[0];r[1].forEach(([f,d,t])=>beep(f,d,.06,t,r[2]));}
function vibrate(p){try{navigator.vibrate&&navigator.vibrate(p||[120,60,120]);}catch(e){}}
function ding(){if(P.set.silent){vibrate(60);return;}beep(1568,.12,.05,0,'sine');beep(2093,.18,.04,.09,'sine');}

/* ---------------- notifications HUD avec actions ---------------- */
const APPN={social:'Aurore Social',bank:'Aurore Bank',gps:'Aurore GPS',immo:'Aurore Immo',jobs:'Aurore Jobs',auto:'Aurore Auto',market:'Aurore Market',services:'Aurore Services',travel:'Aurore Travel',life:'Aurore Life',msg:'Messages',phone:'Appels'};
const live=[];let nEl=null,cEl=null;
function ensureHud(){const app=$('#app');if(!app)return;
  if(!nEl){nEl=document.createElement('div');nEl.id='n49';app.appendChild(nEl);['pointerdown','touchstart'].forEach(ev=>nEl.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));}
  if(!cEl){cEl=document.createElement('div');cEl.id='c49';cEl.hidden=true;app.appendChild(cEl);['pointerdown','touchstart'].forEach(ev=>cEl.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));}}
function driving(){return !!(typeof player!=='undefined'&&player&&player.car);}
function notify(o){
  if(P.set.mute[o.app])return;if(P.set.vacation&&o.app==='jobs')return;
  o.id=P.seq++;o.at=Math.floor(gameMin);P.inbox.unshift({id:o.id,app:o.app,title:o.title,text:o.text||'',at:o.at});P.inbox=P.inbox.slice(0,40);
  P.badge[o.app]=(P.badge[o.app]||0)+1;save();live.unshift(o);while(live.length>12)live.pop();
  if(o.sound!==false)ding();
  ensureHud();if(!nEl)return;
  const compact=driving()&&P.set.drive,card=document.createElement('div');card.className='n49'+(compact?' drive':'');
  const ic=(window.ICO25&&APPN[o.app]&&app25(APPN[o.app]))?icon25(app25(APPN[o.app])):null;
  if(ic)card.appendChild(ic);
  const tx=document.createElement('div');tx.className='n49t';tx.innerHTML='<b>'+esc25(o.title)+'<small>'+esc25(APPN[o.app]||'Aurore')+' · maintenant</small></b>'+(compact?'':'<span>'+esc25(o.text||'')+'</span>');card.appendChild(tx);
  const acts=(o.actions||[]).slice(0,compact?1:2);
  if(acts.length){const ab=document.createElement('div');ab.className='n49a';acts.forEach(([l,f])=>{const x=document.createElement('button');x.type='button';x.textContent=l;x.onclick=e=>{e.stopPropagation();dismiss();try{f();}catch(err){console.warn(err);}};ab.appendChild(x);});card.appendChild(ab);}
  const dismiss=()=>{card.classList.add('out');setTimeout(()=>card.remove(),260);};
  tx.onclick=()=>{dismiss();if(o.open)o.open();else if(APPN[o.app])openApp(APPN[o.app]);};
  let sx=null;card.addEventListener('pointerdown',e=>{sx=e.clientY;});card.addEventListener('pointerup',e=>{if(sx!=null&&sx-e.clientY>24)dismiss();sx=null;});
  nEl.prepend(card);while(nEl.children.length>3)nEl.lastChild.remove();
  setTimeout(dismiss,compact?4200:7000);
  if(typeof phHome==='function'&&!$('#phone').hidden&&!phApp)refreshHomeBadges();}
function clearBadge(app){if(P.badge[app]){P.badge[app]=0;save();}}

/* ---------------- ouverture des applis depuis le monde ---------------- */
function openApp(name,tab){const a=app25(name);if(!a)return;if(tab){const k=Object.keys(APPN).find(q=>APPN[q]===name);if(k)P.tab[k]=tab;}
  const ph=$('#phone');if(ph.hidden){if(panelOpen&&typeof closePanel==='function')closePanel();togglePhone();}
  setTimeout(()=>{if(!$('#phone').hidden)phOpen(a);},40);}
function world(fn){if(typeof closePanel==='function')closePanel();setTimeout(()=>{try{fn();}catch(e){console.warn('phone49',e);}},90);}
function go(x,z,l,silent){wp={x,z,l};P.life.stats.nav++;P.navT={l,x,z,t0:gameMin,said:9999};save();if(!silent)toast('GPS · '+l,'good');speak('Itinéraire vers '+l+'.');}
function speak(t){if(!P.set.voice||P.set.silent)return;try{if(!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(t);u.lang='fr-FR';u.rate=1.05;speechSynthesis.cancel();speechSynthesis.speak(u);}catch(e){}}

/* ---------------- lieux : index unifié (repères + Métropole) ---------------- */
const CATS=[['resto','Restaurants',/resto|chez |pizza|tacos|café|cafe|maquis|food|restaurant|bao|fournil|cuisine|grill/i],['fuel','Carburant',/fuel|station-service|carburant|pompe|essence/i],['park','Parkings',/parking/i],['sante','Santé',/hôpital|hopital|hospital|clinique|pharma|santé|med|dentaire|radiologie|maternité/i],['bank','Banque',/bank|banque|atm|distributeur|finance|exchange/i],['hotel','Hôtels',/hôtel|hotel|palace|resort|suite/i],['transit','Transports',/gare|station|métro|metro|terminal|arrêt|bus|tgv|ferry|aéroport|airport|quai/i],['shop','Commerces',/mall|boutique|supérette|market|marché|galerie|mode|magasin|shop|store/i],['loisirs','Loisirs',/club|cinéma|cinema|arcade|stade|plage|beach|parc|musée|aquarium|bowling|golf/i],['admin','Administration',/mairie|commissariat|tribunal|ministère|ambassade|palais|cour|consulat|assemblée|préfecture|gendarmerie/i]];
function places(){const out=[],seen=new Set();
  (typeof spots!=='undefined'?spots:[]).forEach(s=>{if(!s||!s.label||s.door===false)return;const l=String(s.label).replace(/^[^A-Za-zÀ-ÿ0-9]+/,'').replace(/\s·\s(entrer|visiter)$/i,'').trim();if(!l||/^sortie|^exit|^E ·/i.test(l))return;const k=l.toLowerCase();if(seen.has(k))return;seen.add(k);out.push({n:l,x:s.x,z:s.z,id:s.id,cat:String(s.category||''),s});});
  const M=MET();if(M)M.blds.forEach(b=>{if(b.hidden||!b.door)return;const k=b.name.toLowerCase();if(seen.has(k))return;seen.add(k);out.push({n:b.name,x:b.door.x,z:b.door.z,id:b.id,cat:b.cat||'',b,emoji:b.emoji});});
  return out;}
function catOf(p){for(const c of CATS)if(c[2].test(p.n+' '+p.id+' '+p.cat))return c[0];return 'autre';}
function dist(p){return Math.hypot((p.x||0)-player.x,(p.z||0)-player.z);}
function nearest(cat,pred){let best=null,bd=1e9;places().forEach(p=>{if(cat&&catOf(p)!==cat)return;if(pred&&!pred(p))return;const d=dist(p);if(d<bd){bd=d;best=p;}});return best;}
const fm=m=>m<1000?Math.round(m)+' m':(m/1000).toFixed(1).replace('.',',')+' km';

/* ---------------- appels entrants ---------------- */
let call=null,ringT=null;
const CALLS=[
  {k:'chat',t:'veut prendre de tes nouvelles.'},{k:'invite',t:'t’invite à sortir ce soir.'},{k:'loan',t:'a besoin d’un coup de main.'},
  {k:'job',t:'a un contrat rapide pour toi.'},{k:'tip',t:'a une info sur un bon plan.'}];
function incomingCall(name,kind){
  if(call||!started||paused)return;if(P.social.blocked[name])return;
  const c=CALLS.find(q=>q.k===kind)||pick(CALLS);
  const away=P.set.vacation?'Je suis en vacances, je te rappelle à mon retour.':P.social.status==='busy'?'Je suis occupé, je te rappelle.':null;
  if(away&&kind!=='force'){(threads[name]=threads[name]||[]).push({t:'(Appel manqué)'});threads[name].push({me:1,t:away});missed(name,c,away);return;}
  if(driving()&&P.set.drive&&P.set.autoReply){(threads[name]=threads[name]||[]).push({t:'(Appel manqué)'});threads[name].push({me:1,t:'Je conduis, je te rappelle dès que possible.'});missed(name,c,true);return;}
  call={name,c,t0:performance.now()};ensureHud();if(!cEl)return;
  cEl.innerHTML='';cEl.hidden=false;cEl.className='';
  const av=typeof av25==='function'?av25(name):document.createElement('div');cEl.appendChild(av);
  const tx=document.createElement('div');tx.className='c49t';tx.innerHTML='<small>Appel entrant · Aurore Mobile</small><b>'+esc25(name)+'</b><span>'+esc25(name.split(' ')[0]+' '+c.t)+'</span>';cEl.appendChild(tx);
  const no=document.createElement('button');no.type='button';no.className='c49no';no.setAttribute('aria-label','Refuser');no.innerHTML='<svg viewBox="0 0 24 24"><path d="M3.6 14.8c4.8-4.2 12-4.2 16.8 0 .6.5.7 1.4.2 2l-1.4 1.6c-.4.5-1.2.6-1.7.2l-2.2-1.6c-.4-.3-.6-.7-.6-1.2v-1.4a12 12 0 0 0-5.4 0v1.4c0 .5-.2.9-.6 1.2l-2.2 1.6c-.5.4-1.3.3-1.7-.2l-1.4-1.6a1.4 1.4 0 0 1 .2-2z" fill="#fff"/></svg>';
  const yes=document.createElement('button');yes.type='button';yes.className='c49yes';yes.setAttribute('aria-label','Répondre');yes.innerHTML='<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="#fff"/></svg>';
  no.onclick=()=>{endRing();(threads[name]=threads[name]||[]).push({me:1,t:'Je ne peux pas répondre, je te rappelle.'});P.calls.unshift({n:name,at:Math.floor(gameMin),k:'refusé'});save();hideCall();};
  yes.onclick=()=>{endRing();answer();};
  const ab=document.createElement('div');ab.className='c49a';ab.appendChild(no);ab.appendChild(yes);cEl.appendChild(ab);
  if(P.set.silent)vibrate([400,200,400,200,400]);else{ring();ringT=setInterval(()=>{ring();vibrate();},1900);}
  setTimeout(()=>{if(call&&call.name===name&&!call.on){endRing();missed(name,c);hideCall();}},16000);}
function endRing(){if(ringT){clearInterval(ringT);ringT=null;}}
function hideCall(){if(cEl){cEl.classList.add('out');setTimeout(()=>{cEl.hidden=true;cEl.classList.remove('out');},260);}call=null;}
function missed(name,c,auto){P.calls.unshift({n:name,at:Math.floor(gameMin),k:'manqué'});P.calls=P.calls.slice(0,30);save();
  notify({app:'phone',title:'Appel manqué · '+name,text:auto?'Réponse automatique envoyée : « '+(typeof auto==='string'?auto:'Je conduis')+' ».':'Touchez pour rappeler.',actions:[['Rappeler',()=>{incomingCallBack(name);}],['Message',()=>{openApp('Messages');setTimeout(()=>{if(typeof phThread==='function')phThread(name);},120);}]]});}
function incomingCallBack(name){if(call)return;call={name,c:pick(CALLS),t0:performance.now()};answer();}
function answer(){const n=call.name,c=call.c;call.on=1;P.life.stats.calls++;P.calls.unshift({n,at:Math.floor(gameMin),k:'reçu'});P.calls=P.calls.slice(0,30);save();hideCall();
  const rel=(window.P3&&P3.rel)?P3.rel:{};const bump=v=>{rel[n]=Math.max(0,Math.min(100,(rel[n]||20)+v));};
  const rows=[];
  if(c.k==='invite'){const ev=nearest('loisirs')||nearest('resto');rows.push({label:'Accepter · RDV '+(ev?ev.n:'en ville'),fn:()=>{if(ev){addAppt(n,ev,Math.floor(gameMin)+120);go(ev.x,ev.z,ev.n+' avec '+n,true);}bump(6);toast('Rendez-vous noté dans Aurore Life.','good');}},{label:'Refuser poliment',fn:()=>{bump(-2);}});}
  else if(c.k==='loan'){const a=pick([40,60,100]);rows.push({label:'Lui prêter '+fmt(a),off:!afford(a),fn:()=>{if(!pay(a,'Prêt à '+n))return;bump(10);state.rep+=1;P.bank.debts=(P.bank.debts||[]);P.bank.debts.push({n,a:Math.round(a*1.2),due:day()+2});save();toast(n+' te remboursera '+fmt(Math.round(a*1.2))+' sous 2 jours.','good');}},{label:'Désolé, pas maintenant',fn:()=>bump(-3)});}
  else if(c.k==='job'){rows.push({label:'Prendre le contrat (GPS)',fn:()=>world(()=>openSpot('life41:contracts'))},{label:'Pas le temps',fn:()=>{}});}
  else if(c.k==='tip'){const p=pick(places().filter(q=>dist(q)>150&&dist(q)<1400))||nearest('shop');rows.push({label:'Noter le bon plan · '+(p?p.n:'centre-ville'),fn:()=>{if(p){P.social.anon.unshift({t:'Bon plan de '+n+' : passe à '+p.n+'.',x:p.x,z:p.z,r:pick([30,45,60]),done:false,at:Math.floor(gameMin)});save();go(p.x,p.z,'Bon plan · '+p.n,true);toast('Va sur place : une récompense t’attend.','good');}}});}
  else rows.push({label:'Discuter 5 minutes',fn:()=>{bump(5);state.fun=Math.min(100,state.fun+8);gameMin+=5;toast('Bonne discussion avec '+n+'. +humeur','good');}},{label:'Raccrocher',fn:()=>{}});
  world(()=>openPanel('📞 '+n,'Appel en cours · '+n.split(' ')[0]+' '+c.t,rows));}

/* ---------------- rendez-vous ---------------- */
function addAppt(n,p,at){P.life.appts.push({n,p:p.n,x:p.x,z:p.z,at,done:false});P.life.appts=P.life.appts.slice(-12);save();}

/* ---------------- verrouillage personnalisé ---------------- */
const CLOCKS=['Fine','Grasse','Néon'];
function lock49(){
  const lk=$('#ph-lock');if(!lk)return;const dn=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'][(day()+1)%7];
  const notes=P.inbox.filter(q=>q.at>=gameMin-240).slice(0,3);
  Object.keys(unread).forEach(n=>{if(unread[n]>0&&notes.length<4){const t=threads[n]||[];notes.push({app:'msg',title:n,text:t.length?t[t.length-1].t:'Nouveau message'});}});
  lk.className='lock lk49 clk'+P.set.lockClock;lk.style.background=P.set.lockWall>=0?(WALLS[P.set.lockWall]||''):'';
  lk.innerHTML='<div class="lk">'+(P.set.pin?SV.lockC:SV.lockC)+'</div><div class="day">'+dn+' · jour '+(day()+1)+'</div><div class="big">'+esc25(clockTxt25())+'</div>'+(P.set.lockMsg?'<div class="lkmsg">'+esc25(P.set.lockMsg)+'</div>':'')+'<div class="notifs"></div><div class="pin49" hidden></div><div class="lkhint">'+(P.set.pin?'Touchez pour saisir le code':'Touchez pour déverrouiller')+'</div>';
  const nf=lk.querySelector('.notifs');notes.forEach(q=>{const d=document.createElement('div');d.className='nt';const a=app25(APPN[q.app]||'Messages');if(a)d.appendChild(icon25(a));const x=document.createElement('div');x.innerHTML='<b>'+esc25(q.title)+'<small>'+(q.at!=null?esc25(when(q.at)):'maintenant')+'</small></b><span>'+esc25(q.text||'')+'</span>';d.appendChild(x);nf.appendChild(d);});
  lk.classList.remove('go');lk.hidden=false;$('#ph-scr').classList.add('locked');
  const open=()=>{if(lk.classList.contains('go'))return;lk.querySelector('.lk').innerHTML=SV.lockO;setTimeout(()=>{lk.classList.add('go');$('#ph-scr').classList.remove('locked');setTimeout(()=>{lk.hidden=true;},480);},220);};
  if(!P.set.pin){lk.onclick=open;setTimeout(open,notes.length?1300:600);return;}
  let code='';const pad=lk.querySelector('.pin49');
  const draw=()=>{pad.innerHTML='<div class="dots49">'+[0,1,2,3].map(i=>'<i class="'+(i<code.length?'on':'')+'"></i>').join('')+'</div><div class="keys49">'+['1','2','3','4','5','6','7','8','9','','0','⌫'].map(k=>k?'<button type="button" data-k="'+k+'">'+k+'</button>':'<span></span>').join('')+'</div>';
    pad.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.k;if(k==='⌫')code=code.slice(0,-1);else if(code.length<4)code+=k;draw();
      if(code.length===4){if(code===P.set.pin){open();}else{pad.classList.add('shake');vibrate(200);setTimeout(()=>{pad.classList.remove('shake');code='';draw();},420);}}});};
  lk.onclick=()=>{if(!pad.hidden)return;pad.hidden=false;lk.querySelector('.notifs').hidden=true;lk.querySelector('.lkhint').hidden=true;draw();};}
if(typeof lock25==='function')lock25=lock49;

/* ---------------- accueil : ordre, recherche, édition, mode conduite ---------------- */
const AUR=['Aurore Social','Aurore Bank','Aurore GPS','Aurore Immo','Aurore Jobs','Aurore Auto','Aurore Market','Aurore Services','Aurore Travel','Aurore Life'];
function applyOrder(){const ord=P.order||AUR.slice();const idx=n=>{const i=ord.indexOf(n);return i<0?1000+APPS.findIndex(a=>a[0]===n):i;};
  const sorted=APPS.slice().sort((a,b)=>idx(a[0])-idx(b[0]));APPS.length=0;sorted.forEach(a=>APPS.push(a));}
function saveOrder(){const names=[...document.querySelectorAll('#ph-pages .ic')].map(e=>e.dataset.app).filter(Boolean);if(names.length){P.order=names;save();applyOrder();}}
let editing=false,dragEl=null,pressT=null;
function bindEdit(){const pg=$('#ph-pages');if(!pg||pg.dataset.e49)return;pg.dataset.e49=1;
  pg.addEventListener('pointerdown',e=>{const ic=e.target.closest('.ic');if(!ic)return;clearTimeout(pressT);
    if(editing){dragEl=ic;ic.classList.add('drag49');pg.setPointerCapture(e.pointerId);e.preventDefault();return;}
    pressT=setTimeout(()=>{enterEdit();vibrate(30);dragEl=ic;ic.classList.add('drag49');try{pg.setPointerCapture(e.pointerId);}catch(_){}},520);});
  pg.addEventListener('pointermove',e=>{if(!dragEl){return;}const t=document.elementFromPoint(e.clientX,e.clientY),over=t&&t.closest&&t.closest('#ph-pages .ic');
    if(over&&over!==dragEl&&over.parentNode){const r=over.getBoundingClientRect(),after=e.clientX>r.left+r.width/2;over.parentNode.insertBefore(dragEl,after?over.nextSibling:over);}});
  const up=()=>{clearTimeout(pressT);if(dragEl){dragEl.classList.remove('drag49');dragEl=null;saveOrder();}};
  pg.addEventListener('pointerup',up);pg.addEventListener('pointercancel',up);
  pg.addEventListener('click',e=>{if(editing&&e.target.closest('.ic')){e.stopPropagation();e.preventDefault();}},true);}
function enterEdit(){editing=true;const h=$('#ph-homev');if(h)h.classList.add('edit49');const d=$('#ph-done49');if(d)d.hidden=false;}
function exitEdit(){editing=false;const h=$('#ph-homev');if(h)h.classList.remove('edit49');const d=$('#ph-done49');if(d)d.hidden=true;saveOrder();}
function searchBar(){const hv=$('#ph-homev');if(!hv||hv.querySelector('.top49'))return;
  const top=document.createElement('div');top.className='top49';
  top.innerHTML='<label class="q49"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg><input type="search" placeholder="Rechercher une appli ou un lieu" enterkeyhint="search"></label><button type="button" class="bell49" aria-label="Notifications"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2zm7-6v-5a7 7 0 0 0-5.5-6.8V3.5a1.5 1.5 0 0 0-3 0v.7A7 7 0 0 0 5 11v5l-2 2v1h18v-1z"/></svg><b hidden></b></button><button type="button" id="ph-done49" hidden>OK</button>';
  hv.insertBefore(top,hv.firstChild);const res=document.createElement('div');res.className='res49';res.hidden=true;hv.insertBefore(res,top.nextSibling);
  const inp=top.querySelector('input');
  inp.addEventListener('input',()=>renderSearch(inp.value,res));inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){inp.value='';renderSearch('',res);inp.blur();}});inp.addEventListener('keyup',e=>e.stopPropagation());
  top.querySelector('.bell49').onclick=()=>openCenter();top.querySelector('#ph-done49').onclick=exitEdit;}
function norm(s){return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function renderSearch(q,res){q=norm(q.trim());if(!q){res.hidden=true;res.innerHTML='';return;}res.hidden=false;res.innerHTML='';
  const apps=APPS.filter(a=>norm(a[0]).includes(q)).slice(0,8);
  if(apps.length){const row=document.createElement('div');row.className='ra49';apps.forEach(a=>{const b=document.createElement('button');b.type='button';b.className='ic';b.appendChild(icon25(a));const s=document.createElement('span');s.textContent=a[0];b.appendChild(s);b.onclick=()=>phOpen(a,null,b);row.appendChild(b);});res.appendChild(row);}
  const pl=places().filter(p=>norm(p.n).includes(q)).sort((a,b)=>dist(a)-dist(b)).slice(0,6);
  if(pl.length){const h=document.createElement('small');h.textContent='Lieux · GPS';res.appendChild(h);pl.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='rp49';b.innerHTML='<b>'+esc25(p.n)+'</b><span>'+fm(dist(p))+'</span>';b.onclick=()=>{go(p.x,p.z,p.n);};res.appendChild(b);});}
  if(!apps.length&&!pl.length){const e=document.createElement('p');e.textContent='Aucun résultat.';res.appendChild(e);}}
function driveCard(){const pg=$('#ph-pages');if(!pg||!pg.firstChild)return;const old=pg.querySelector('.drv49');if(old)old.remove();
  if(!(driving()&&P.set.drive))return;
  const d=document.createElement('div');d.className='drv49';d.innerHTML='<small>Mode conduite</small><b>'+(wp?esc25(wp.l):'Aucun itinéraire')+'</b>';
  const g=document.createElement('div');g.className='drvb';[['GPS','Aurore GPS'],['Radio','Radio'],['Appels','Appels'],['Auto','Aurore Auto']].forEach(([l,n])=>{const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=()=>{const a=app25(n);if(a)phOpen(a);};g.appendChild(b);});d.appendChild(g);
  const p1=pg.firstChild;p1.insertBefore(d,p1.firstChild);[...p1.querySelectorAll('.wdg')].forEach(w=>w.remove());}
function refreshHomeBadges(){document.querySelectorAll('#ph-homev .ic').forEach(ic=>{const n=ic.dataset.app;const c=badgeOf(n);let b=ic.querySelector('.badge');if(c&&!b){b=document.createElement('b');b.className='badge';ic.appendChild(b);}if(b){if(c)b.textContent=c>99?'99+':c;else if(AUR.includes(n))b.remove();}});
  const bell=document.querySelector('.bell49 b');if(bell){const t=Object.values(P.badge).reduce((a,b)=>a+(b||0),0);bell.hidden=!t;bell.textContent=t>99?'99+':t;}}
function badgeOf(n){const k=Object.keys(APPN).find(q=>APPN[q]===n);if(!k||!AUR.includes(n))return 0;let c=P.badge[k]||0;
  try{if(k==='bank'){if(typeof walletP58!=='undefined'&&(walletP58.unpaidRent+walletP58.unpaidUtilities)>0)c++;if(P.bank.tax.due>0)c++;if(P.bank.net.due>0)c++;}
    if(k==='auto'){const S=AMS();if(S)S.cars.forEach(r=>{if((r.fuel||100)<15||(r.cond&&r.cond.eng<35))c++;});}
    if(k==='market')c+=P.market.orders.filter(o=>!o.done).length;
    if(k==='life'&&P.life.reward.day!==day())c++;}catch(e){}return c;}
if(typeof appIcon25==='function'){const _ai=appIcon25;appIcon25=function(a){const bt=_ai(a);const c=badgeOf(a[0]);if(c&&!bt.querySelector('.badge')){const b=document.createElement('b');b.className='badge';b.textContent=c>99?'99+':c;bt.appendChild(b);}return bt;};}
if(typeof phHome==='function'){const _ph=phHome;phHome=function(){applyOrder();_ph();searchBar();bindEdit();driveCard();refreshHomeBadges();const inp=document.querySelector('.top49 input');if(inp&&!inp.value){const r=document.querySelector('.res49');if(r)r.hidden=true;}if(editing)$('#ph-homev').classList.add('edit49');};}
{const _cp=closePanel;closePanel=function(){if(editing)exitEdit();_cp.apply(this,arguments);};}

/* ---------------- centre de notifications ---------------- */
function openCenter(){const a=['Notifications','🔔','#ff3b30,#8a0f2f',b=>{
  const all=P.inbox.slice(0,30);if(!all.length){b.appendChild(h25('<div class="empty"><b>Aucune notification</b>Les messages, factures, livraisons et appels apparaîtront ici.</div>'));return;}
  b.appendChild(mk('button','pbtn','Tout effacer',()=>{P.inbox=[];P.badge={};save();phOpen(a);}));
  const g=grp25(b);all.forEach(q=>{const ap=app25(APPN[q.app]||'Messages');row25(g,{lead:ap?icon25(ap):null,title:q.title,sub:(q.text||'')+' · '+when(q.at),wrap:true,onClick:()=>{if(ap){clearBadge(q.app);phOpen(ap);}}});});}];
  RENDER25['Notifications']={fn:a[3]};phOpen(a);}

/* ---------------- lampe torche, guidage vocal, statistiques ---------------- */
let torch=null;
function setTorch(on){P.life.torch=!!on;save();if(on&&!torch&&typeof THREE!=='undefined'&&typeof scene!=='undefined'){torch=new THREE.SpotLight(0xfff4dc,0,34,.55,.6,1.2);scene.add(torch);scene.add(torch.target);}if(torch)torch.intensity=on?3.2:0;}
const _upd=update;update=function(dt){_upd(dt);try{if(torch&&P.life.torch&&player){const h=player.h,x=player.x,z=player.z;torch.position.set(x+Math.sin(h)*.3,1.5,z+Math.cos(h)*.3);torch.target.position.set(x+Math.sin(h)*12,0,z+Math.cos(h)*12);torch.visible=!player.inside;}}catch(e){}};

/* ---------------- verrouillage des véhicules (effet réel) ---------------- */
if(typeof interact==='function'){const _it=interact;interact=function(){try{if(started&&!player.car&&!panelOpen&&typeof nearCar!=='undefined'&&nearCar&&nearCar.am&&P.auto.lock[nearCar.am]){toast('🔒 Véhicule verrouillé · déverrouille-le dans Aurore Auto.','warn');beep(330,.12,.05);return;}}catch(e){}_it();};}
/* contacts bloqués : plus de messages */
if(typeof incoming==='function'){const _inc=incoming;incoming=function(n){if(P.social.blocked[n])return;_inc(n);const t=(threads[n]||[]).slice(-1)[0];notify({app:'msg',title:n,text:t?t.t:'Nouveau message',sound:false,actions:[['Répondre',()=>{openApp('Messages');setTimeout(()=>{if(typeof phThread==='function'){unread[n]=0;phThread(n);}},120);}]]});};}

/* ---------------- boucle : événements reliés au gameplay ---------------- */
let callCd=140+Math.random()*120,geoSeen={},lastCity=null,lastHour=-1;
function cityOf(x){return x<-3000?'Solenne':x<-1500?'Nouvelle-Aurore':x<-330&&x>-1000?'Aéroport PAX':'Port-Aurore';}
function tick(){
  if(typeof started==='undefined'||!started||(typeof paused!=='undefined'&&paused))return;
  P.life.stats.play++;
  /* appels entrants d'amis */
  callCd-=1;if(callCd<=0){callCd=200+Math.random()*240;const f=(state.friends||[]).filter(n=>!P.social.blocked[n]);if(f.length&&!panelOpen&&!(typeof FL!=='undefined'&&FL&&FL.on)&&blackout<=0)incomingCall(pick(f));}
  /* guidage vocal et arrivée */
  if(wp&&P.navT&&P.navT.l===wp.l){const d=Math.hypot(player.x-wp.x,player.z-wp.z),th=[500,200,60].find(t=>d<t&&P.navT.said>t);if(th){P.navT.said=th;speak(th===60?'Vous arrivez à '+wp.l+'.':'Dans '+th+' mètres, '+wp.l+'.');}}
  else if(!wp&&P.navT){const n=P.navT;P.travel.trips.unshift({l:n.l,at:Math.floor(gameMin),min:Math.round(gameMin-n.t0),k:'GPS'});P.travel.trips=P.travel.trips.slice(0,30);P.navT=null;save();}
  /* changement de ville : historique de voyage */
  const cty=cityOf(player.x);if(lastCity&&cty!==lastCity){P.travel.trips.unshift({l:lastCity+' → '+cty,at:Math.floor(gameMin),k:'Voyage'});P.travel.trips=P.travel.trips.slice(0,30);save();if(cty!=='Aéroport PAX')notify({app:'travel',title:'Bienvenue à '+cty,text:'Guide, hôtels et transports à proximité dans Aurore Travel.',actions:[['Hôtels',()=>openApp('Aurore Travel','hotel')]]});}lastCity=cty;
  /* bons plans anonymes : récompense sur place */
  P.social.anon.forEach(a=>{if(!a.done&&a.x!=null&&Math.hypot(player.x-a.x,player.z-a.z)<8){a.done=true;earn(a.r,'Bon plan récupéré',true);notify({app:'social',title:'Bon plan récupéré · +'+fmt(a.r),text:a.t});save();}});
  /* rendez-vous */
  P.life.appts.forEach(a=>{if(a.done)return;const near=Math.hypot(player.x-a.x,player.z-a.z)<12;if(near&&gameMin>=a.at-90&&gameMin<=a.at+90){a.done=true;state.fun=Math.min(100,state.fun+20);state.rep+=1;if(window.P3&&P3.rel)P3.rel[a.n]=Math.min(100,(P3.rel[a.n]||20)+12);journal('Rendez-vous avec '+a.n+' à '+a.p+'.');notify({app:'life',title:'Rendez-vous réussi avec '+a.n,text:'+20 humeur · relation renforcée.'});save();}
    else if(gameMin>a.at+90){a.done=true;if(window.P3&&P3.rel)P3.rel[a.n]=Math.max(0,(P3.rel[a.n]||20)-6);(threads[a.n]=threads[a.n]||[]).push({t:'Je t’ai attendu à '+a.p+'… dommage.'});unread[a.n]=(unread[a.n]||0)+1;notify({app:'life',title:'Rendez-vous manqué',text:a.n+' t’a attendu à '+a.p+'.'});save();}});
  /* réveils */
  P.life.alarms.forEach(al=>{if(!al.on)return;const t=((gameMin%1440)+1440)%1440;if(Math.abs(t-al.t)<1.2&&al.last!==day()){al.last=day();save();if(P.set.silent)vibrate([500,200,500]);else{ring(al.r!=null?al.r:P.set.ring);setTimeout(()=>ring(al.r),1900);}notify({app:'life',title:'⏰ Réveil · '+hhmm(al.t),text:al.l||'Il est l’heure !',actions:[['Arrêter',()=>{}],['Répéter 10 min',()=>{al.t=(al.t+10)%1440;al.last=-1;save();}]]});}});
  /* minuteur temps réel */
  if(P.life.timer&&Date.now()>=P.life.timer){P.life.timer=null;save();ring();notify({app:'life',title:'⏱️ Minuteur terminé',text:'Le temps est écoulé.'});}
  /* notifications géolocalisées (une fois par lieu et par jour) */
  if(!player.inside&&P.life.stats.play%5===0){const M=MET();if(M){for(const b of M.blds){if(!b.hero)continue;const d=Math.hypot(player.x-b.door.x,player.z-b.door.z),k=b.key+':'+day();if(d<90&&!geoSeen[k]){geoSeen[k]=1;notify({app:'gps',title:'À proximité · '+b.name,text:b.desc||'Lieu emblématique de la Métropole.',sound:false,actions:[['Y aller',()=>go(b.door.x,b.door.z,b.name)]]});break;}}}}
  if(window.PH49&&PH49.onTick)PH49.onTick();
  const h=Math.floor(gameMin/60);if(h!==lastHour){lastHour=h;if(window.PH49&&PH49.onHour)PH49.onHour();}
  if(P.life.stats.play%10===0)save();}
setInterval(tick,1000);

/* ---------------- journal de vie automatique ---------------- */
function journal(t,auto){P.life.journal.unshift({t,at:Math.floor(gameMin),auto:auto!==false});P.life.journal=P.life.journal.slice(0,60);save();}
let snap=null;setInterval(()=>{if(typeof started==='undefined'||!started)return;try{const S=AMS(),M=MET();const cur={job:state.job,cars:S?S.cars.length:0,own:M?Object.keys(M.S.own||{}).length:0,biz:M&&M.S.biz?M.S.biz.name:null,friends:(state.friends||[]).length,rank:typeof rankOf==='function'?rankOf():0};
  if(snap){if(cur.job!==snap.job&&cur.job)journal('Nouvel emploi : '+((typeof JOBN!=='undefined'&&JOBN[cur.job])||(window.JOBS12&&JOBS12.J[cur.job]&&JOBS12.J[cur.job].n)||cur.job)+'.');if(cur.cars>snap.cars)journal('Nouveau véhicule au garage.');if(cur.own>snap.own)journal('Nouvelle propriété achetée.');if(cur.biz&&cur.biz!==snap.biz)journal('Création de l’entreprise '+cur.biz+'.');if(cur.friends>snap.friends)journal('Nouvel ami : '+state.friends[state.friends.length-1]+'.');if(cur.rank>snap.rank)journal('Réputation : nouveau rang atteint.');}
  snap=cur;}catch(e){}},5000);

/* ---------------- économie de batterie ---------------- */
function setSaver(on){P.set.saver=!!on;save();try{if(on){P.set.preFx=window.FX45?FX45.mode:null;if(window.FX45)FX45.setMode(0);const M=MET();if(M){P.set.preQ=M.S.q;M.S.q='eco';M.save();M.blds.forEach(b=>b.lvl=-1);}}else{if(window.FX45&&P.set.preFx!=null)FX45.setMode(P.set.preFx);const M=MET();if(M&&P.set.preQ){M.S.q=P.set.preQ;M.save();M.blds.forEach(b=>b.lvl=-1);}}}catch(e){}toast(on?'Économie de batterie : effets et détails réduits.':'Économie de batterie désactivée.','good');}

/* ---------------- synchronisation : code de sauvegarde ---------------- */
function exportCode(){const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/^(pa-|port-aurore)/.test(k))o[k]=localStorage.getItem(k);}try{saveProgress();}catch(e){}return 'PA49:'+btoa(unescape(encodeURIComponent(JSON.stringify(o))));}
function importCode(code){try{const s=String(code||'').trim();if(!s.startsWith('PA49:'))throw 0;const o=JSON.parse(decodeURIComponent(escape(atob(s.slice(5)))));const ks=Object.keys(o).filter(k=>/^(pa-|port-aurore)/.test(k));if(!ks.length)throw 0;ks.forEach(k=>localStorage.setItem(k,o[k]));return ks.length;}catch(e){return 0;}}

/* ---------------- styles d'interface ---------------- */
const UI={
  tabs(b,app,list){const cur=list.some(q=>q[0]===P.tab[app])?P.tab[app]:list[0][0];const bar=mk('div','seg26 seg49');list.forEach(([k,l])=>{const x=mk('button',k===cur?'on':'',l,()=>{P.tab[app]=k;save();phOpen(phApp);});x.type='button';bar.appendChild(x);});b.appendChild(bar);return cur;},
  hero(b,small,big,sub){const c=mk('div','bigc');c.appendChild(mk('small',null,small));c.appendChild(mk('b',null,big));if(sub)c.appendChild(mk('span',null,sub));b.appendChild(c);return c;},
  sec(b,t){b.appendChild(mk('div','sec',t));},
  btn(b,l,fn,hot,off){const x=mk('button','pbtn'+(hot?' hot':''),l,fn);x.type='button';if(off)x.disabled=true;b.appendChild(x);return x;},
  row(g,o){return row25(g,o);},grp:b=>grp25(b),
  note(b,t){b.appendChild(mk('p','dim',t));},
  empty(b,t,s){b.appendChild(h25('<div class="empty"><b>'+esc25(t)+'</b>'+esc25(s||'')+'</div>'));},
  chips(b,list){const w=mk('div','chips49');list.forEach(([l,fn,on])=>{const x=mk('button',on?'on':'',l,fn);x.type='button';w.appendChild(x);});b.appendChild(w);return w;},
  field(b,ph,val,onEnter,multi){const i=document.createElement(multi?'textarea':'input');i.className='ph-input';i.placeholder=ph;i.value=val||'';if(multi)i.rows=3;i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&!multi&&onEnter)onEnter(i.value);});i.addEventListener('keyup',e=>e.stopPropagation());b.appendChild(i);return i;},
  spark(vals,w,h,col){const mn=Math.min(...vals),mx=Math.max(...vals),r=mx-mn||1;const pts=vals.map((v,i)=>((i/(Math.max(1,vals.length-1)))*w).toFixed(1)+','+(h-((v-mn)/r)*(h-4)-2).toFixed(1)).join(' ');return h25('<svg class="spk49" viewBox="0 0 '+w+' '+h+'" width="100%" height="'+h+'" preserveAspectRatio="none"><polyline points="'+pts+'" fill="none" stroke="'+(col||'currentColor')+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>');},
  sq:(c,t)=>{const s=mk('i','sq');s.style.background=c;s.textContent=t;s.style.cssText+=';display:grid;place-items:center;font-size:17px;color:#fff';return s;}
};

window.PH49={P,save,day,hhmm,when,afford,pay,earn,log,notify,clearBadge,openApp,world,go,speak,places,catOf,dist,nearest,fm,CATS,incomingCall,addAppt,journal,setTorch,setSaver,exportCode,importCode,ring,RINGS,CLOCKS,AUR,UI,MET,AMS,enterEdit,exitEdit,applyOrder,driving,APPN};
setTimeout(()=>{if(P.life.torch)setTorch(true);},3000);
})();
