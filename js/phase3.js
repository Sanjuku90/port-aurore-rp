'use strict';
/* ---------- Phase 3 : personnage et vie quotidienne ---------- */
const P3={inv:{},rel:{},sick:0,wet:0,lastGM:null,spot:0,warn:0,emo:{t:0,k:''}};
state.thirst=80;
const CAP=12,COLS=[0x3d7be0,0xd94f4f,0x4fb58a,0xe0b34a,0x8a5fc9,0x2f3a4a,0xf2f2ee],HCOLS=[0x1a1410,0x3a2616,0x6b4a2a,0xb08a4a,0x8a3a1e,0x9a9a9a],PN3=[0x2b3445,0x1c1c1c,0x5a4a3a,0x3d6fb0,0x7a2f2f];
const nx=(a,v)=>a[(a.indexOf(v)+1)%a.length];
function remesh(){const v=player.mesh.visible;scene.remove(player.mesh);player.mesh=makePlayerMesh();player.mesh.visible=v;scene.add(player.mesh);}
makePlayerMesh=function(){return makePerson(look.s,look.p||0x2b3445,look.k,look.h||0x1a1410,{style:look.y||'court',top:look.t||'tee',bottom:look.bt||'pantalon',bag:!!look.bag,glasses:!!look.g,beard:!!look.b,shoe:look.f!=null?look.f:0xf2f2ee,earrings:!!look.e,necklace:!!look.n,watch:!!look.w,jacket:look.j||0x2b3445,capColor:look.cap||0xd94f4f});};
const mkO=re=>(l,c,f)=>({label:l+' · '+fmt(c),off:state.cash<c,fn:()=>{if(state.cash>=c){state.cash-=c;f();remesh();toast('Look mis à jour.','good');}re();}});
function coiffeur(){const o=mkO(coiffeur);
  openPanel('Salon de coiffure','Coiffure : '+HAIR_LABELS[look.y||'court']+'. Barbe : '+(look.b?'oui':'non')+'. Essaie, change, recommence.',[
    o('Coiffure suivante',10,()=>{look.y=nx(HAIR_STYLES,look.y||'court');}),o('Couleur de cheveux',6,()=>{look.h=nx(HCOLS,look.h);}),
    o(look.b?'Raser la barbe':'Ajouter une barbe',8,()=>{look.b=!look.b;}),o('Changer de teint',15,()=>{look.k=nx(SKINS,look.k);}),
    o(look.g?'Retirer les lunettes':'Mettre des lunettes',12,()=>{look.g=!look.g;})]);}
function boutique(){const o=mkO(boutique);
  openPanel('Boutique Mode','Compose ta tenue : haut, bas, chaussures, accessoires.',[
    o('Couleur du haut',20,()=>{look.s=nx(COLS,look.s);}),o('Type de haut',25,()=>{look.t=nx(['tee','long','veste','sweat'],look.t);}),
    o('Bas : '+(look.bt||'pantalon'),20,()=>{look.bt=nx(['pantalon','short','jupe'],look.bt||'pantalon');}),o('Couleur du bas',15,()=>{look.p=nx(PN3,look.p||PN3[0]);}),
    o('Chaussures',20,()=>{look.f=nx(SHOE_COLS,look.f!=null?look.f:0xf2f2ee);}),o(look.bag?'Retirer le sac à dos':'Sac à dos',18,()=>{look.bag=!look.bag;})]);}
/* inventaire, nourriture, boissons, soins */
const IT={water:['Bouteille d’eau',s=>{s.thirst+=35;}],soda:['Soda',s=>{s.thirst+=25;s.fun+=6;}],sand:['Sandwich',s=>{s.hunger+=30;}],menu:['Menu complet',s=>{s.hunger+=60;s.thirst+=10;}],fish:['Poisson grillé',s=>{s.hunger+=45;}],pans:['Pansements',s=>{s.health+=15;}],kit:['Kit de soins',s=>{s.health+=45;}],bidon:['Bidon d’essence (+40 %)',()=>{}],meds:['Médicaments',s=>{s.health+=10;P3.sick=0;toast('Tu te sens mieux.','good');}]};
const inv=()=>Object.values(P3.inv).reduce((a,b)=>a+b,0);
function useItem(k){if(!P3.inv[k])return;P3.inv[k]--;if(!P3.inv[k])delete P3.inv[k];IT[k][1](state);['thirst','hunger','health','fun'].forEach(a=>{state[a]=Math.min(100,state[a]);});toast(IT[k][0]+' utilisé.','good');}
function sac(){const ks=Object.keys(P3.inv);openPanel('Sac à dos',ks.length?inv()+' sur '+CAP+' objets. Soif '+Math.round(state.thirst)+' · Faim '+Math.round(state.hunger)+' · Santé '+Math.round(state.health)+'.':'Ton sac est vide. Achète à manger à la supérette, des soins à la pharmacie.',ks.map(k=>({label:IT[k][0]+' ×'+P3.inv[k],fn:()=>{useItem(k);sac();}})));}
function market(title,txt,list,re){openPanel(title,txt+' Sac : '+inv()+' sur '+CAP+'.',list.map(a=>({label:IT[a[0]][0]+' · '+fmt(a[1]),off:state.cash<a[1]||inv()>=CAP,fn:()=>{if(state.cash>=a[1]&&inv()<CAP){state.cash-=a[1];P3.inv[a[0]]=(P3.inv[a[0]]||0)+1;toast(IT[a[0]][0]+' dans le sac.','good');}re();}})).concat([{label:'Ouvrir le sac',fn:sac}]));}
function superette(){market('Supérette','Soif '+Math.round(state.thirst)+' · Faim '+Math.round(state.hunger)+'.',[['water',2],['soda',3],['sand',8],['menu',15],['fish',12],['bidon',20]],superette);}
function pharma(){market('Pharmacie','Santé '+Math.round(state.health)+(P3.sick?' · tu es malade.':'.'),[['pans',6],['kit',18],['meds',12]],pharma);}
const _os=openSpot;openSpot=function(id){if(id==='shop'){if(blackout>0)toast('Coupure de courant : fermé.','warn');else superette();}else if(id==='coiffeur')coiffeur();else _os(id);};
const _sx=shopX;shopX=function(id){if(id==='boutique')boutique();else if(id==='pharma')pharma();else _sx(id);};
/* gestes */
const EM={salut:'Saluer',danse:'Danser',assis:'S’asseoir et se reposer',applaudir:'Applaudir'};
function emote(k){if(player.car){toast('Descends de voiture d’abord.','warn');return;}P3.emo={t:k==='assis'?9999:k==='danse'?8:3.5,k:k};if(k==='danse')state.fun=Math.min(100,state.fun+8);}
function gestes(){openPanel('Gestes','Bouger arrête le geste. Assis, tu récupères de l’énergie.',Object.keys(EM).map(k=>({label:EM[k],fn:()=>emote(k)})));}
const _ap=animPerson;animPerson=function(g,ph,amp,run){_ap(g,ph,amp,run);const e=P3.emo;if(g!==player.mesh||e.t<=0)return;if(amp>=0.06){e.t=0;return;}
  const u=g.userData,t=performance.now()*0.006;
  if(e.k==='salut'){u.armR.rotation.x=0;u.armR.rotation.z=2.5+Math.sin(t*2)*0.35;}
  else if(e.k==='danse'){u.armL.rotation.x=u.armR.rotation.x=0;u.armL.rotation.z=-2.2-Math.sin(t*1.5)*0.5;u.armR.rotation.z=2.2+Math.sin(t*1.5+1)*0.5;u.kneeL.rotation.x=0.5+Math.sin(t*3)*0.4;u.kneeR.rotation.x=0.5-Math.sin(t*3)*0.4;}
  else if(e.k==='applaudir'){u.armL.rotation.x=u.armR.rotation.x=-1.25;const d=0.05+0.3*Math.abs(Math.sin(t*3));u.armL.rotation.z=d;u.armR.rotation.z=-d;}
  else if(e.k==='assis'){u.legL.rotation.x=u.legR.rotation.x=-1.5;u.kneeL.rotation.x=u.kneeR.rotation.x=1.5;}};
/* habitants */
const LV=['Inconnu','Connaissance','Ami','Proche'],lvl=n=>{const r=P3.rel[n]||0;return r>=12?3:r>=6?2:r>=2?1:0;};
const RUM=['Le Club Néon est plein le samedi soir.','Le port cherche des livreurs rapides.','Méfie-toi des coupures de courant, le soir.','Le Café Aurore sert le meilleur petit-déjeuner.','La pharmacie vend des médicaments contre le rhume.'];
const _bf=befriend;befriend=function(p){
  if((p.talkAt||0)>performance.now())return;
  const n=p.name,up=(v,m)=>{P3.rel[n]=(P3.rel[n]||0)+v;state.fun=Math.min(100,state.fun+v*3);toast(m,'good');};
  p.h=Math.atan2(player.x-p.x,player.z-p.z);p.wait=6;
  openPanel(n,'Relation : '+LV[lvl(n)]+'. Que veux-tu faire ?',[
    {label:'Discuter',fn:()=>{_bf(p);P3.rel[n]=(P3.rel[n]||0)+1;}},
    {label:'Saluer',fn:()=>{emote('salut');say(p.mesh,pick(['Salut !','Hé, ça va ?','Bonjour !']),3);up(1,'Tu salues '+n+'.');}},
    {label:'Offrir un verre · '+fmt(4),off:state.cash<4,fn:()=>{state.cash-=4;say(p.mesh,'Merci, c’est gentil !',3);up(2,n+' apprécie le geste.');}},
    {label:'Inviter à danser',off:lvl(n)<1,fn:()=>{emote('danse');say(p.mesh,'Allez, on danse !',3);up(2,'Vous dansez ensemble.');}},
    {label:'Demander des nouvelles',off:lvl(n)<2,fn:()=>{const t=pick(RUM);say(p.mesh,t,5);addChat(n,t);up(1,n+' te confie une info.');}}]);};
/* besoins : soif, sommeil, santé */
const _nd=needs;needs=function(dt){
  _nd(dt);
  if(P3.lastGM!=null&&gameMin-P3.lastGM>20)state.thirst-=(gameMin-P3.lastGM)*0.04;P3.lastGM=gameMin;
  state.thirst=Math.max(0,state.thirst-0.16*dt);if(state.thirst<=0)state.health-=0.8*dt;
  if(P3.sick&&state.health>=99.5)P3.sick=0;
  if(wx.i>=2&&!player.inside&&!player.car){P3.wet+=dt;if(P3.wet>50&&!P3.sick){P3.sick=1;toast('Tu as pris froid. Médicaments à la pharmacie, ou hôpital.','warn');}}else P3.wet=Math.max(0,P3.wet-dt*0.5);
  if(P3.sick){state.health=Math.max(20,state.health-0.5*dt);state.energy=Math.max(0,state.energy-0.05*dt);}
  const e=P3.emo;if(e.t>0){e.t-=dt;if(e.k==='assis')state.energy=Math.min(100,state.energy+1.5*dt);}
  P3.warn-=dt;if(P3.warn<=0){if(state.thirst<20){toast('Tu as soif.','warn');P3.warn=30;}else if(state.energy<15){toast('Tu es épuisé. Dors ou assieds-toi.','warn');P3.warn=40;}}
  if(!P3.spot){P3.spot=1;const c=[[8,-5.5],[-8,-5.5],[0,-9.5],[12,0],[-12,0],[6,10],[0,12]].find(q=>pushAABB({x:q[0],z:q[1]},1.6)===0);if(c)addSpot(c[0],c[1],'coiffeur',0xff9bd0,'Salon de coiffure');}
};
const _uh=updateHud;updateHud=function(){_uh();const t=$('#ht'),s=$('#sk');if(t)t.style.width=Math.round(state.thirst)+'%';if(s)s.hidden=!P3.sick;};
/* interface et sauvegarde */
$('#hf').closest('.bar').insertAdjacentHTML('afterend','<div class="bar"><span>Soif</span><i><u id="ht" style="background:#4fb0e8"></u></i></div><div id="sk" hidden style="color:#ff6b6b;font-size:12px;padding:2px 0">Malade · prends des médicaments</div>');
const bar=document.createElement('div');bar.id='p3b';bar.innerHTML='<button class="card" id="p3-bag">🎒 Sac</button>';$('#hud').appendChild(bar);
$('#p3-bag').onclick=sac;
const st=document.createElement('style');st.textContent='#p3b{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);display:flex;gap:6px;z-index:6}#p3b button{pointer-events:auto;padding:6px 10px;font:600 13px Barlow,sans-serif;color:inherit;border:0}';document.head.appendChild(st);
addEventListener('keydown',e=>{if(!started||paused||chatOpen||(e.target&&e.target.tagName==='INPUT'))return;const k=e.key.toLowerCase();if(k==='i'){if(panelOpen)closePanel();else sac();}});
const K3='port-aurore-p3';
try{const s=JSON.parse(localStorage.getItem(K3)||'null');if(s){state.thirst=clamp(+s.t||80,0,100);P3.inv=s.i&&typeof s.i==='object'?s.i:{};P3.rel=s.r&&typeof s.r==='object'?s.r:{};P3.sick=s.k?1:0;}}catch(e){}
Object.keys(P3.inv).forEach(k=>{if(!IT[k]||!(P3.inv[k]>0))delete P3.inv[k];});
setInterval(()=>{if(started)try{localStorage.setItem(K3,JSON.stringify({t:state.thirst,i:P3.inv,r:P3.rel,k:P3.sick}));}catch(e){}},4000);
const _rp=resetProgress;resetProgress=function(){try{localStorage.removeItem(K3);}catch(e){}_rp();};
