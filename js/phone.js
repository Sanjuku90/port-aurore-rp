'use strict';
/* ---------- téléphone ---------- */
const mk=(t,c,x,f)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;if(f)e.onclick=f;return e;};
const WALLS=['linear-gradient(160deg,#ff7a59,#8a2be2 60%,#1a0933)','linear-gradient(160deg,#1fa2ff,#12d8fa 50%,#0b2a4a)','linear-gradient(160deg,#3a3f47,#0e1014)'];
const gallery=[],threads={},unread={},cool={};
let wp=null,wpBeam,shotReq=false,muted=false,wallN=0,phApp=null,phThN=null,msgCd=60;
const totalUnread=()=>Object.values(unread).reduce((a,b)=>a+b,0);
const APPS=[['Messages','💬','#34d17a,#0f9d58',appMsg],['Banque','💳','#5aa9ff,#27306b',appBank],['Plan','🗺️','#ffb347,#ff7a59',appMap],['Photos','📷','#c79bff,#6a3fd1',appPhoto],['Boulot','💼','#8ad3ff,#1d4f8a',appJob],['Miam','🍔','#ff6b6b,#b32d2d',appFood],['Réglages','⚙️','#9aa3ad,#4b5057',appSet]];
function togglePhone(){if(!$('#phone').hidden){closePanel();return;}if(!started||panelOpen||chatOpen)return;panelOpen=true;$('#phone').hidden=false;phHome();}
function applyWall(){$('#ph-scr').style.background=WALLS[wallN];}
function bindPhone(){document.querySelector('.intro h1 span').textContent='JEU DE RÔLE · '+VERSION;
  $('#ph-btn').onclick=togglePhone;$('#ph-home').onclick=()=>{phApp?phHome():closePanel();};
  $('#ph-back').onclick=()=>{phThN?phOpen(APPS[0]):phHome();};
  $('#phone').addEventListener('pointerdown',e=>{if(e.target.id==='phone')closePanel();});applyWall();
}
function phHome(){
  phApp=null;phThN=null;$('#ph-back').hidden=true;$('#ph-title').textContent='';
  const b=$('#ph-body');b.innerHTML='';b.className='apps';
  APPS.forEach(a=>{const bt=mk('button','app',null,()=>phOpen(a)),i=mk('i',null,a[1]);i.style.background='linear-gradient(135deg,'+a[2]+')';bt.appendChild(i);bt.appendChild(mk('span',null,a[0]));if(a[0]==='Messages'&&totalUnread())bt.appendChild(mk('b','badge',totalUnread()));b.appendChild(bt);});
}
function phOpen(a){phApp=a;phThN=null;$('#ph-back').hidden=false;$('#ph-title').textContent=a[0];const b=$('#ph-body');b.innerHTML='';b.className='pb';a[3](b);}
function appMsg(b){
  if(!state.friends.length){b.appendChild(mk('p','dim','Aucun contact. Parle aux habitants (touche E) pour te faire des amis.'));return;}
  state.friends.forEach(n=>{const t=threads[n]||[],u=unread[n]||0,r=mk('button','prow',null,()=>{unread[n]=0;phThread(n);});
    r.appendChild(mk('b',null,n));r.appendChild(mk('span',null,t.length?t[t.length-1].t:'Nouveau contact'));if(u)r.appendChild(mk('em',null,u));b.appendChild(r);});
}
function phThread(n){
  phApp=APPS[0];phThN=n;const b=$('#ph-body');b.innerHTML='';b.className='pb';$('#ph-back').hidden=false;$('#ph-title').textContent=n;
  (threads[n]||[]).forEach(m=>b.appendChild(mk('div','bub'+(m.me?' me':''),m.t)));
  const q=mk('div','qr');
  [['Salut, ça va ?',0],['On sort au Club Néon ?',1],['Je t’offre le resto · '+fmt(15),2]].forEach(([t,k])=>{const x=mk('button','pbtn',t,()=>sendMsg(n,t,k));if(k===2)x.disabled=state.cash<15;q.appendChild(x);});
  b.appendChild(q);b.scrollTop=b.scrollHeight;
}
function sendMsg(n,t,k){
  if(blackout>0){toast('Pas de réseau.','warn');return;}
  if(k===2)state.cash-=15;
  (threads[n]=threads[n]||[]).push({me:1,t});phThread(n);
  setTimeout(()=>{
    const ok=k&&(cool[n]||0)<performance.now();if(ok)cool[n]=performance.now()+60000;
    threads[n].push({t:k===1?'Carrément ! RDV au Club Néon.':k===2?'Trop sympa, merci !':pick(REPLIES)});
    if(!$('#phone').hidden&&phThN===n)phThread(n);else unread[n]=(unread[n]||0)+1;
    if(ok){state.fun=Math.min(100,state.fun+(k===2?25:15));state.rep+=1;toast('Bon moment avec '+n+'. +humeur','good');}
  },1500);
}
function incoming(n){tone(880,0.15,'sine',0.08);tone(1320,0.2,'sine',0.06,0.12);
  const t=pick(['On se voit ce soir ?','Tu as vu la coupure de courant ?','Passe à la supérette, il y a du monde.','Viens au Club Néon !','Besoin d’une course ? Check l’appli Boulot.']);
  (threads[n]=threads[n]||[]).push({t});unread[n]=(unread[n]||0)+1;toast('📱 '+n+' : '+t);
}
function appBank(b){
  const c=mk('div','bigc');c.appendChild(mk('small',null,'Solde'));c.appendChild(mk('b',null,fmt(state.bank)));c.appendChild(mk('span',null,'Cash : '+fmt(state.cash)+' · Gains : '+fmt(state.earned)));b.appendChild(c);
  [['Déposer tout le cash',state.cash<=0,()=>{state.bank+=state.cash;state.cash=0;}],['Retirer '+fmt(50),state.bank<50,()=>{state.bank-=50;state.cash+=50;}],['Retirer '+fmt(200),state.bank<200,()=>{state.bank-=200;state.cash+=200;}]].forEach(([l,off,f])=>{
    const x=mk('button','pbtn',l,()=>{if(blackout>0){toast('Pas de réseau.','warn');return;}f();phOpen(phApp);});x.disabled=off;b.appendChild(x);});
}
function appMap(b){
  const cv=mk('canvas','mapc');cv.width=240;cv.height=240;b.appendChild(cv);
  const g=cv.getContext('2d'),k=240/400,X=v=>(v+200)*k;
  g.fillStyle='#2a2f38';g.fillRect(0,0,240,240);g.fillStyle='#4a5058';
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)g.fillRect(X(i*64-25),X(j*64-25),50*k,50*k);
  g.fillStyle='#35603c';g.fillRect(X(-25),X(-153),50*k,50*k);
  spots.forEach(s=>{g.fillStyle='#'+s.color.toString(16).padStart(6,'0');g.beginPath();g.arc(X(s.x),X(s.z),4,0,7);g.fill();});
  if(wp){g.strokeStyle='#6cc6ff';g.lineWidth=2;g.beginPath();g.arc(X(wp.x),X(wp.z),7,0,7);g.stroke();}
  g.fillStyle='#fff';g.beginPath();g.arc(X(player.x),X(player.z),4,0,7);g.fill();
  spots.forEach(s=>{const r=mk('button','prow',null,()=>{wp={x:s.x,z:s.z,l:s.label};toast('GPS vers '+s.label,'good');phOpen(phApp);});
    r.appendChild(mk('b',null,s.label));r.appendChild(mk('span',null,Math.round(Math.hypot(s.x-player.x,s.z-player.z))+' m'+(wp&&wp.l===s.label?' · GPS actif':'')));b.appendChild(r);});
  if(wp)b.appendChild(mk('button','pbtn','Arrêter le GPS',()=>{wp=null;phOpen(phApp);}));
}
function appPhoto(b){
  b.appendChild(mk('button','pbtn hot','Prendre une photo',()=>{closePanel();setTimeout(()=>{shotReq=true;state.fun=Math.min(100,state.fun+3);toast('Photo enregistrée','good');},350);}));
  if(!gallery.length)b.appendChild(mk('p','dim','Aucune photo. Cadre ta ville et prends-en une.'));
  const g=mk('div','gal');gallery.forEach(u=>{const i=document.createElement('img');i.src=u;g.appendChild(i);});b.appendChild(g);
}
function appJob(b){
  const j=state.job,c=mk('div','bigc');c.appendChild(mk('small',null,'Poste'));c.appendChild(mk('b',null,JOBN[j]||'Sans emploi'));c.appendChild(mk('span',null,'Missions : '+state.done+' · Gains : '+fmt(state.earned)));b.appendChild(c);
  b.appendChild(mk('p','dim','Rang '+(rankOf()+1)+' · '+RANKS[rankOf()]+(rankOf()<4?' — encore '+(10-state.rep%10)+' pts avant le suivant.':' — rang maximum.')));
  if(mission)b.appendChild(mk('div','prow',mission.resto+' → '+mission.addr+' · '+fmt(mission.pay)));
  const a=mk('button','pbtn hot','Demander une mission',()=>{missionCd=0;toast('Recherche de mission…');phOpen(phApp);});a.disabled=!j||!!mission;b.appendChild(a);
  const x=mk('button','pbtn','Annuler la mission',()=>{mission=null;beam.visible=false;missionCd=4;phOpen(phApp);});x.disabled=!mission;b.appendChild(x);
  if(!j)b.appendChild(mk('p','dim','Passe au Pôle Emploi pour décrocher un poste.'));
}
function appFood(b){
  b.appendChild(mk('p','dim','Livraison à domicile en quelques secondes. Frais de service : '+fmt(4)+'.'));
  [['Tacos du Port',9,35],['Pizza Aurore',14,55],['Poisson braisé',12,45]].forEach(([n,p,f])=>{
    const x=mk('button','pbtn',n+' · '+fmt(p+4),()=>{
      if(blackout>0){toast('Pas de réseau.','warn');return;}
      state.cash-=p+4;toast('Commande envoyée : '+n,'good');phOpen(phApp);
      setTimeout(()=>{state.hunger=Math.min(100,state.hunger+f);toast(n+' livré. +'+f+' de faim','good');},7000);
    });x.disabled=state.cash<p+4;b.appendChild(x);});
}
function appSet(b){
  const c=mk('div','bigc');c.appendChild(mk('small',null,'Profil'));c.appendChild(mk('b',null,state.name));c.appendChild(mk('span',null,state.friends.length+' amis · '+fmt(state.cash+state.bank)+' au total'));b.appendChild(c);
  b.appendChild(mk('small',null,'Fond d’écran'));
  const w=mk('div','walls');WALLS.forEach((g,i)=>{const x=mk('button','wall',null,()=>{wallN=i;applyWall();});x.style.background=g;w.appendChild(x);});b.appendChild(w);
  b.appendChild(mk('button','pbtn','Sons : '+(muted?'coupé':'activé'),()=>{muted=!muted;phOpen(phApp);}));
  b.appendChild(mk('small',null,'Version du jeu'));
  const vc=mk('div','bigc');vc.appendChild(mk('b',null,VERSION));CHANGELOG.forEach(l=>vc.appendChild(mk('span',null,l[0]+' · '+l[1])));b.appendChild(vc);
}
