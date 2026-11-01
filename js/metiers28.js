'use strict';
/* ==========================================================================
   v28 · MÉTIERS RÉALISTES
   Chaque mission est une suite d'étapes concrètes : se rendre quelque part,
   parler aux gens (E), attendre que le travail se fasse, porter des objets,
   remettre une commande, encaisser (monnaie à rendre, carte, pourboire),
   remplir un rapport. Les 17 métiers ont leurs propres scénarios.
   ========================================================================== */
(function(){
const JB=window.JOBS12;if(!JB){console.warn('v28 : JOBS12 absent');return;}
const {J,GM,gainXp,gradeOf,fxAdd,fxDel,flameMesh,shuf}=JB;
const LASTN=['Diallo','Martin','Mensah','Kouassi','Bernard','Traoré','Petit','Adjovi','Lambert','Koné','Moreau','Agbo','Faure','Sow','Garnier','Amegah'];
const dTo=t=>Math.hypot(player.x-t.x,player.z-t.z),spd=()=>player.car?Math.abs(player.car.v):0;
const P=(x,z)=>({x,z});
const fullName=()=>pick(NAMES)+' '+pick(LASTN);
const addr=()=>Math.floor(rand(2,98))+' '+pick(STREETS);
const clamp01=v=>clamp(v,0,1);
let warnCd=0;function warn(t){if(warnCd>0)return;warnCd=2.5;toast(t,'warn');}
/* ---------------- petits outils 3D ---------------- */
const MT={};const lm=c=>MT[c]||(MT[c]=new THREE.MeshLambertMaterial({color:c}));
function bx(par,w,h,d,c,x,y,z,ry){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),lm(c));m.position.set(x,y,z);if(ry)m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;par.add(m);return m;}
function cy(par,r,h,c,x,y,z,seg){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||12),lm(c));m.position.set(x,y,z);m.castShadow=true;par.add(m);return m;}
function grp(x,z,ry,keep){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry||0;if(keep)scene.add(g);else fxAdd(g);return g;}
function person(x,z,h,shirt,o){const p=makePerson(shirt!=null?shirt:pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),o||{});p.position.set(x,0,z);p.rotation.y=h||0;return p;}
function npc(m,x,z,h,shirt,o){const p=person(x,z,h,shirt,o);fxAdd(p);const n={g:p,ph:rand(0,6),mode:'idle',sp:1.4};m.npcs.push(n);return n;}
function face(n,t){n.g.rotation.y=Math.atan2(t.x-n.g.position.x,t.z-n.g.position.z);}
function walkTo(n,t,sp,cb){n.mode='walk';n.to={x:t.x,z:t.z};n.sp=sp||1.4;n.cb=cb||null;}
function hide(n){if(n&&n.g){n.g.visible=false;n.mode='hidden';}}
function lie(n){n.mode='lie';n.g.rotation.x=-Math.PI/2;n.g.position.y=.22;}
function tickNpcs(m,dt){m.npcs.forEach(n=>{const g=n.g;if(!g||n.mode==='hidden')return;const u=g.userData;
  if(n.mode==='walk'){const dx=n.to.x-g.position.x,dz=n.to.z-g.position.z,d=Math.hypot(dx,dz);if(d<.35){n.mode='idle';const cb=n.cb;n.cb=null;if(cb)cb(n);}else{g.position.x+=dx/d*n.sp*dt;g.position.z+=dz/d*n.sp*dt;g.rotation.y=Math.atan2(dx,dz);n.ph+=dt*n.sp*3;animPerson(g,n.ph,.55,n.sp>2.5);}return;}
  n.ph+=dt;if(n.mode==='lie')return;animPerson(g,n.ph,0,false);
  if(n.mode==='wave'&&u.armR){u.armR.rotation.x=-2.7+Math.sin(n.ph*7)*.25;u.armR.rotation.z=-.5;}
  else if(n.mode==='work'&&u.armR){u.armR.rotation.x=-1.1+Math.sin(n.ph*9)*.35;u.armL.rotation.x=-1+Math.cos(n.ph*8)*.3;}
  else if(n.mode==='phone'&&u.armR){u.armR.rotation.x=-2.1;u.armR.rotation.z=-.9;}
  else if(n.mode==='cheer'&&u.armR){u.armR.rotation.x=u.armL.rotation.x=-2.8+Math.sin(n.ph*10)*.2;}});}
/* objet porté par le joueur */
const CARRY={o:null};
function carry(kind){dropCarry();const g=new THREE.Group();
  if(kind==='bag'){bx(g,.42,.42,.36,0x1f8a5a,0,0,0);bx(g,.43,.06,.37,0xe0a526,0,.12,0);}
  else if(kind==='box'||kind==='parcel'){bx(g,.5,.38,.4,0xc69a5a,0,0,0);bx(g,.51,.05,.41,0xe8dcc0,0,.05,0);}
  else if(kind==='tray'){bx(g,.6,.03,.4,0x9aa3ad,0,-.08,0);cy(g,.06,.16,0xffffff,-.15,0,0);cy(g,.06,.16,0x6b3f2a,.12,0,.05);bx(g,.16,.05,.12,0xe0b34a,0,-.04,-.1);}
  else if(kind==='mail'){bx(g,.36,.42,.18,0xf2c200,0,-.1,0);bx(g,.3,.06,.04,0x2e6fd1,0,.04,.09);}
  else if(kind==='part'){cy(g,.16,.12,0x4a4f57,0,0,0,16);cy(g,.07,.14,0x9aa3ad,0,0,0);}
  else if(kind==='fuel'){bx(g,.3,.44,.18,0xc0392b,0,0,0);}
  else if(kind==='fish'){bx(g,.55,.28,.36,0x2e6fd1,0,0,0);bx(g,.5,.05,.3,0xd8e6f0,0,.15,0);}
  else if(kind==='cat'){bx(g,.36,.2,.18,0xe08a2a,0,0,0);bx(g,.16,.15,.16,0xe08a2a,0,.1,.14);}
  else if(kind==='crate'){bx(g,.8,.55,.6,0xe0732b,0,.25,0);}
  else bx(g,.4,.3,.3,0xdddddd,0,0,0);
  g.userData.kind=kind;CARRY.o=g;attachCarry();return g;}
function attachCarry(){const g=CARRY.o;if(!g||!player.mesh)return;if(g.parent!==player.mesh){player.mesh.add(g);g.position.set(0,g.userData.kind==='crate'?2.15:1.12,g.userData.kind==='crate'?0:.36);}
  const u=player.mesh.userData;if(u&&u.armR&&!player.moving){u.armR.rotation.x=u.armL.rotation.x=-1.05;}}
function dropCarry(){if(CARRY.o){if(CARRY.o.parent)CARRY.o.parent.remove(CARRY.o);CARRY.o=null;}}
/* ---------------- lieux permanents : restaurants, poste, criée ---------------- */
const RESTO_DEF=[
 ['Chez Mamadou',41,-23,'#b5651d',['Poulet braisé + alloco','Riz sauce arachide','Attiéké poisson','Brochettes de bœuf']],
 ['Pizza Aurore',-41,23,'#c0392b',['Pizza margherita','Pizza 4 fromages','Calzone','Pizza royale + soda']],
 ['Bao Express',87,41,'#1f6f6a',['3 bao porc caramel','Nouilles sautées','Raviolis vapeur','Riz cantonais']],
 ['Le Fournil',-87,-41,'#8a5a3a',['2 sandwichs jambon-beurre','Quiche lorraine','Viennoiseries x6','Tarte aux fraises']],
 ['Tacos du Port',23,151,'#e0a526',['Tacos XL poulet','Tacos merguez','Burrito boeuf','Nachos fromage']],
 ['Café Lumière',-23,-87,'#5b3a8a',['Salade César','Wrap végétarien','Bowl saumon','Smoothie + muffin']]];
const RESTO=[],FIX={};
function kiosk(x,z,name,col,o){o=o||{};const bxc=Math.round(x/64)*64,bzc=Math.round(z/64)*64,sx=Math.sign(x-bxc)||1,sz=Math.sign(z-bzc)||1,ry=Math.atan2(sx,sz);
  const cx=x-sx*1.1,cz=z-sz*1.1,g=grp(cx,cz,ry,true),c=hexOf(col);
  bx(g,2.6,.12,2.2,0x8a8f96,0,.06,0);bx(g,2.4,1.05,.6,0xf4f1ea,0,.6,.75);bx(g,2.42,.08,.66,c,0,1.15,.75);
  bx(g,2.6,2.6,.12,shade(c,.75),0,1.4,-1.05);[-1,1].forEach(s=>bx(g,.1,2.6,2.1,0xe9e6df,s*1.28,1.4,0));
  bx(g,2.9,.12,2.6,c,0,2.75,.2);const aw=bx(g,2.9,.06,1.0,0xf4f1ea,0,2.55,1.35);aw.rotation.x=.35;
  const sg=sign27(name.toUpperCase(),2.6,.55,col,'#ffffff');sg.position.set(0,3.15,1.08);g.add(sg);
  if(o.menu){const mn=sign27(['MENU',o.menu[0]],1.1,.8,'#20262e','#ffd27a',{fg2:'#ffffff',size:.22});mn.position.set(-.85,1.75,-.98);g.add(mn);}
  const cook=person(0,0,0,o.shirt!=null?o.shirt:0xffffff,{top:'long',bag:false});cook.position.set(0,0,-.2);g.add(cook);
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(.16,.13,.22,12),lm(o.hat!=null?o.hat:0xffffff));hat.position.set(0,1.98,0);cook.add(hat);
  if(o.extra)o.extra(g,c);
  boxes.push({x0:cx-1.6,x1:cx+1.6,z0:cz-1.6,z1:cz+1.6});
  const fr={x:cx+sx*2.2,z:cz+sz*2.2};return {name,g,cook,front:fr,pos:{x:cx,z:cz},ry,col};}
function buildFixed28(){
  RESTO_DEF.forEach(([n,x,z,col,menu])=>{const k=kiosk(x,z,n,col,{menu});k.menu=menu;RESTO.push(k);});
  FIX.poste=kiosk(-151,-23,'La Poste · Centre de tri','#f2c200',{shirt:0x2e6fd1,hat:0xf2c200,extra:g=>{for(let i=0;i<6;i++)bx(g,.5,.4,.4,0xc69a5a,-.8+i%3*.6,1.35+Math.floor(i/3)*.45,-.75);}});
  FIX.relais=kiosk(151,23,'Aurore Colis · Point relais','#2e6fd1',{shirt:0x2e6fd1,hat:0x2e6fd1,extra:g=>{for(let i=0;i<8;i++)bx(g,.45,.35,.4,pick([0xc69a5a,0xb08a4a,0xe0c08a]),-.9+i%4*.6,1.3+Math.floor(i/4)*.4,-.7);}});
  FIX.criee=kiosk(-105,151,'Criée du Port','#2d5a7b',{shirt:0x2d5a7b,hat:0xffffff,extra:g=>{for(let i=0;i<4;i++){bx(g,.5,.22,.35,0xd8e6f0,-.9+i*.6,1.2,.75);}}});
  FIX.depot=kiosk(105,-151,'Pièces Auto Aurore','#20262e',{shirt:0x2e6fd1,hat:0x2e6fd1,extra:g=>{for(let i=0;i<5;i++)cy(g,.18,.12,0x2a2f35,-.9+i*.45,1.25,.75,14);}});
  /* terrasse du café Aurore (tables numérotées) */
  const cf=spots.find(s=>s.id==='cafe');FIX.tables=[];if(cf){[-9,-5.6,5.8].forEach((dx,i)=>{const x=cf.x+dx,z=cf.z-.2,g=grp(x,z,0,true);cy(g,.45,.05,0xf4f1ea,0,.75,0,16);cy(g,.05,.75,0x2a2f35,0,.38,0);
    [-1,1].forEach(s=>{bx(g,.42,.06,.42,0x6b4a2a,s*.85,.45,0);bx(g,.42,.5,.05,0x6b4a2a,s*1.04,.7,0);});const sg=sign27('TABLE '+(i+1),.7,.28,'#6b3f2a','#ffe9c7');sg.position.set(0,1.05,0);g.add(sg);const sg2=sg.clone();sg2.rotation.y=Math.PI;g.add(sg2);
    const um=new THREE.Mesh(new THREE.ConeGeometry(1.5,.5,10),lm(i%2?0xc0392b:0xf4f1ea));um.position.y=2.4;g.add(um);cy(g,.03,2.4,0xdddddd,0,1.2,0);
    boxes.push({x0:x-.5,x1:x+.5,z0:z-.5,z1:z+.5});FIX.tables.push({x,z:z+1,n:i+1,g,sx:x+.85,sz:z});});
    const bxp={x:cf.x+9.6,z:cf.z-.4},b=grp(bxp.x,bxp.z,0,true);bx(b,2.2,1.05,.7,0x6b3f2a,0,.52,0);bx(b,2.3,.06,.8,0xc9a26b,0,1.07,0);cy(b,.12,.4,0x9aa3ad,-.6,1.3,0);
    const ba=person(0,0,0,0x222222,{top:'long'});ba.position.set(0,0,-.8);b.add(ba);FIX.barista=ba;boxes.push({x0:bxp.x-1.1,x1:bxp.x+1.1,z0:bxp.z-.4,z1:bxp.z+.4});FIX.bar={x:bxp.x,z:bxp.z+1.3};}
}
/* ---------------- moteur d'étapes ---------------- */
const jVeh=j=>j.v?(player.car&&player.car.type===j.v):!!player.car;
const VNAME={taxi:'taxi',police:'voiture de patrouille',ambulance:'ambulance',firetruck:'camion de pompiers',bus:'bus',truck:'camion',scooter:'scooter'};
function needOk(m,S,quiet){const j=J[m.kind];
  if(S.need==='foot'&&player.car){if(!quiet)warn('Descends du véhicule pour ça (E).');return false;}
  if(S.need==='veh'&&!jVeh(j)){if(!quiet)warn(j.v?'Monte dans ton '+(VNAME[j.v]||'véhicule de service')+'.':'Il te faut un véhicule.');return false;}
  if(S.stop&&player.car&&spd()>1.2){if(!quiet)warn('Arrête-toi complètement.');return false;}
  return true;}
const tgt=(m,S)=>{const a=typeof S.at==='function'?S.at(m,S):S.at;return a||null;};
const nearS=(m,S)=>{const t=tgt(m,S);return !t||dTo(t)<(S.r||(player.car?6:3.2));};
function next(m){const S=m.steps[m.ix];if(S&&S.exit)S.exit(m,S);m.ix++;m.flash=1.2;const N=m.steps[m.ix];if(!N)return;N.k=0;N.run=false;N.done=false;if(N.enter)N.enter(m,N);if(N.say)toast(typeof N.say==='function'?N.say(m):N.say,'');}
function wantE(m){const S=m.steps[m.ix];if(!S||panelOpen)return null;if(!['e','choice','qte','wait'].includes(S.t))return null;if(S.t==='wait'&&(!S.e||S.run))return null;if(S.t==='qte'&&S.run)return 'qte';
  if(!nearS(m,S))return null;if(!needOk(m,S,true))return null;return S;}
function press(m){const S=m.steps[m.ix];if(!S)return false;
  if(S.t==='qte'&&S.run){qPress(m,S);return true;}
  const W=wantE(m);if(!W){if(S.t!=='go'&&S.t!=='custom'&&nearS(m,S)&&!(S.need==='foot'&&player.car)&&!(S.t==='wait'&&S.run)){needOk(m,S,false);return true;}return false;}
  if(S.t==='e'){const r=S.on?S.on(m,S):true;if(r!==false&&mission===m)next(m);return true;}
  if(S.t==='wait'){S.run=true;if(S.onStart)S.onStart(m,S);return true;}
  if(S.t==='qte'){S.run=true;S.ok=0;S.tries=0;S.ph='prep';S.w=rand(1,2);return true;}
  if(S.t==='choice'){const q=typeof S.q==='function'?S.q(m,S):S.q,opts=typeof S.opts==='function'?S.opts(m,S):S.opts;
    openPanel(S.panel||J[m.kind].n,q,opts.map(o=>({label:o.l,fn:()=>{if(mission!==m)return;m.q*=o.q!=null?o.q:1;if(o.msg)toast(o.msg,o.q!=null&&o.q<1?'bad':'good');if(o.fn)o.fn(m,S);if(o.retry)return;if(mission===m&&m.steps[m.ix]===S)next(m);}})));return true;}
  return false;}
function qPress(m,S){if(S.ph==='go'){S.ok++;S.ph='prep';S.w=rand(.8,1.8);cue(S.okTxt||'✓ Parfait !','good');tone28(880);}
  else{S.tries++;S.ph='prep';S.w=rand(1,2);m.q*=.95;cue('Trop tôt !','bad');tone28(220);}}
function tickStep(m,S,dt){
  if(S.onTick)S.onTick(m,S,dt);if(mission!==m||m.steps[m.ix]!==S)return;
  if(S.t==='go'){if(nearS(m,S)&&needOk(m,S,false))next(m);return;}
  if(S.t==='custom'){if(S.tick(m,S,dt)&&mission===m&&m.steps[m.ix]===S)next(m);return;}
  if(S.t==='wait'&&(!S.e||S.run)){if(nearS(m,S)&&needOk(m,S,true)){S.k+=dt/S.dur;S.away=0;if(S.during)S.during(m,S,dt);}else S.away=1;
    if(S.k>=1){if(S.onDone)S.onDone(m,S);if(mission===m&&m.steps[m.ix]===S)next(m);}return;}
  if(S.t==='qte'&&S.run){S.w-=dt;if(S.ph==='prep'&&S.w<=0){S.ph='go';S.w=S.win||.95;cue(S.goTxt||'MAINTENANT ! (E)','go');}
    else if(S.ph==='go'&&S.w<=0){S.ph='prep';S.w=rand(1,2);S.tries++;m.q*=.95;cue('Raté…','bad');}
    if(S.ok>=S.n||S.tries>=S.n+3){if(S.ok<S.n)m.q*=.8;if(S.onDone)S.onDone(m,S);if(mission===m&&m.steps[m.ix]===S)next(m);}}
}
function stepUI(m,S){const t=typeof S.title==='function'?S.title(m,S):S.title,h=typeof S.hint==='function'?S.hint(m,S):(S.hint||'');let r='';
  if(S.t==='wait'&&(S.run||!S.e))r=S.away?'Reviens sur place':Math.round(S.k*100)+' %';
  else if(S.t==='qte'&&S.run)r=S.ok+'/'+S.n;
  else if(m.limit)r=JB.clk(m.limit-m.time);else r='Étape '+(m.ix+1)+'/'+m.steps.length;
  return [t,h,r];}
/* ---------------- interface : liste d'étapes, bandeau central ---------------- */
let cueEl=null,listEl=null,barEl=null;
function ensureUI(){if(listEl)return;const mc=$('#mission');if(!mc)return;listEl=document.createElement('ol');listEl.id='m28-steps';mc.appendChild(listEl);
  barEl=document.createElement('div');barEl.id='m28-bar';barEl.innerHTML='<b></b><i><u></u></i>';$('#app').appendChild(barEl);
  cueEl=document.createElement('div');cueEl.id='m28-cue';$('#app').appendChild(cueEl);}
function cue(t,k){ensureUI();if(!cueEl)return;cueEl.textContent=t;cueEl.className='on '+(k||'');clearTimeout(cueEl._t);cueEl._t=setTimeout(()=>{cueEl.className='';},k==='go'?900:1100);}
function tone28(f){try{if(typeof actx!=='undefined'&&actx&&!muted){const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;o.type='triangle';g.gain.setValueAtTime(.06,actx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,actx.currentTime+.25);o.connect(g);g.connect(actx.destination);o.start();o.stop(actx.currentTime+.3);}}catch(e){}}
let listSig='';
function drawList(m){ensureUI();if(!listEl)return;if(!m||m.st!=='r28'){if(listSig){listEl.innerHTML='';listSig='';}if(barEl)barEl.classList.remove('on');return;}
  const sig=m.id+':'+m.ix;if(sig!==listSig){listSig=sig;listEl.innerHTML=m.steps.map((S,i)=>{const t=typeof S.title==='function'?S.title(m,S):S.title;return '<li class="'+(i<m.ix?'ok':i===m.ix?'cur':'')+'">'+esc28(t)+'</li>';}).join('');
    const c=listEl.querySelector('.cur');if(c&&c.scrollIntoView)try{c.scrollIntoView({block:'nearest'});}catch(e){}}
  const S=m.steps[m.ix];if(S&&S.t==='wait'&&(S.run||!S.e)&&!S.away&&S.k>0){barEl.classList.add('on');barEl.querySelector('b').textContent=(typeof S.bar==='function'?S.bar(m,S):S.bar)||(typeof S.title==='function'?S.title(m,S):S.title);barEl.querySelector('u').style.width=Math.round(S.k*100)+'%';}else barEl.classList.remove('on');}
const esc28=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------------- fin de mission, paiement ---------------- */
function done28(m,o){if(mission!==m)return;const j=J[m.kind];o=o||{};const q=clamp(m.q,.2,1.5);
  const base=o.fixed?Math.max(1,Math.round(m.pay)):Math.max(5,Math.round(m.pay*q)),tip=Math.max(0,Math.round(o.tip||0)),tot=base+tip;
  if(o.method==='bank')state.bank+=tot;else state.cash+=tot;state.earned+=tot;state.done++;
  const r0=rankOf();state.rep+=q>=.85?2:1;
  toast((o.msg?o.msg+' · ':'')+'+'+fmt(base)+(tip?' + pourboire '+fmt(tip):'')+(o.method==='bank'?' (virement)':' (espèces)')+' · '+JB.stars(q),q>=.85?'good':'warn');
  if(rankOf()>r0)toast('Nouveau rang : '+RANKS[rankOf()]+' !','good');
  gainXp(j.id,Math.round(6+14*Math.min(q,1.3)));cleanup(m);mission=null;beam.visible=false;missionCd=rand(5,9);
  try{if(typeof saveProgress==='function')saveProgress();}catch(e){}}
function cleanup(m){if(!m)return;dropCarry();(m.cars||[]).forEach(c=>{if(player.car===c)exitCar();const i=cars.indexOf(c);if(i>=0)cars.splice(i,1);scene.remove(c.mesh);});m.cars=[];if(barEl)barEl.classList.remove('on');if(!mission)JB.fxClear();if(jetM)jetM.visible=false;}
/* encaissement client : espèces avec monnaie à rendre, carte ou déjà payé */
function cashFlow(m,o){const amt=Math.max(4,Math.round(o.amount)),tip=Math.max(0,Math.round(o.tip||0)),who=o.who||'Le client',fx=!!o.earn,note=o.earn?'':' (recette reversée à l’employeur, ta paie : '+fmt(Math.round(m.pay*clamp(m.q,.2,1.5)))+')';if(fx)m.pay=amt;
  const r=Math.random(),mode=o.mode||(r<.42?'cash':r<.85?'card':'online');
  if(mode==='online'){openPanel('Paiement','Commande déjà réglée en ligne ('+fmt(amt)+')'+note+'. '+(tip?who+' te glisse '+fmt(tip)+' de pourboire.':who+' te remercie.'),[{label:'Merci, bonne journée !',fn:()=>done28(m,{tip,method:'bank',msg:o.msg,fixed:fx})}]);return;}
  if(mode==='card'){openPanel('Paiement par carte',who+' règle '+fmt(amt)+' par carte sans contact'+note+'.'+(tip?' Pourboire ajouté : '+fmt(tip)+'.':''),[{label:'Présenter le terminal de paiement',fn:()=>{tone28(1320);setTimeout(()=>tone28(1760),140);done28(m,{tip,method:'bank',fixed:fx,msg:(o.msg||'Paiement accepté')+' ✓'});}}]);return;}
  const bills=[5,10,20,50,100],bill=bills.find(b=>b>=amt+(Math.random()<.5?1:0))||100,ch=bill-amt;
  if(ch===0){openPanel('Paiement en espèces',who+' te donne l’appoint : '+fmt(amt)+note+(tip?' + '+fmt(tip)+' de pourboire':'')+'.',[{label:'Encaisser',fn:()=>done28(m,{tip,method:'cash',fixed:fx,msg:o.msg})}]);return;}
  const d=Math.max(1,Math.round(ch*.2)),opts=shuf([ch,ch+d,Math.max(0,ch-d)]);
  openPanel('Rendre la monnaie',who+' doit '+fmt(amt)+' et te tend un billet de '+fmt(bill)+'. Combien lui rends-tu ?'+note,opts.map(v=>({label:'Rendre '+fmt(v),fn:()=>{
    if(v===ch){done28(m,{tip,method:'cash',fixed:fx,msg:o.msg||'Compte juste'});}
    else if(v<ch){m.q*=.75;state.rep=Math.max(0,state.rep-1);toast(who+' : « Il manque '+fmt(ch-v)+' ! » Tu corriges, mais il n’y aura pas de pourboire.','bad');done28(m,{tip:0,method:'cash',fixed:fx,msg:'Erreur de monnaie'});}
    else{toast('Tu as rendu '+fmt(v-ch)+' de trop.','warn');state.cash=Math.max(0,state.cash-(v-ch));done28(m,{tip,method:'cash',fixed:fx,msg:o.msg});}}})));}
function reportFlow(m,o){const j=J[m.kind],q=clamp(m.q,.2,1.5),mins=Math.max(1,Math.round(m.time/60*6));
  openPanel(o.title||'Rapport d’intervention',(o.lines||[]).concat(['Durée : '+mins+' min (temps de jeu)','Évaluation : '+JB.stars(q)]).join(' · '),[{label:o.btn||'Signer et transmettre le rapport',fn:()=>done28(m,{method:'bank',msg:o.msg||'Rapport validé · prime versée'})}]);}
/* ---------------- sélection de lieux ---------------- */
function nodeAround(o,a,b){const c=NODES.filter(n=>{const d=Math.hypot(n.x-o.x,n.z-o.z);return d>a&&d<b&&Math.abs(n.x)<240&&n.z>-240&&n.z<200;});return pick(c.length?c:NODES.filter(n=>Math.abs(n.x)<240));}
function sidewalk(n){const bxc=Math.round(n.x/64)*64,bzc=Math.round(n.z/64)*64,sx=Math.sign(n.x-bxc)||1,sz=Math.sign(n.z-bzc)||1;return {x:n.x+sx*.6,z:n.z+sz*.6,h:Math.atan2(sx,sz),sx,sz};}
const spot=id=>{const s=spots.find(q=>q.id===id);return s?{x:s.x,z:s.z}:null;};
const nearestResto=()=>{const L=RESTO.slice().sort((a,b)=>dTo(a.front)-dTo(b.front));return pick(L.slice(0,4));};
/* ---------------- scénarios ---------------- */
const SC={};
let MID=1;
function M_(kind,title,pay,steps,o){return Object.assign({id:MID++,kind,st:'r28',title,resto:title,addr:'',stage:'r28',steps,ix:0,q:1,time:0,limit:0,pay:Math.round(pay),npcs:[],cars:[],tgt:null,pickup:{x:0,z:0},drop:{x:0,z:0},ui:null,hitCd:0,d:{}},o||{});}
const grade=j=>GM[gradeOf(j.id)];
/* ---- livreur ---- */
SC.livreur=j=>{const r=Math.random();if(r<.55&&RESTO.length)return foodRun(j);if(r<.8)return parcelRun(j);return groceryRun(j);};
function foodRun(j){const R=nearestResto(),c=sidewalk(nodeAround(R.front,60,190)),plat=pick(R.menu),who=fullName(),no=Math.floor(rand(1000,9999)),A=addr(),dist=dTo(R.front)+Math.hypot(c.x-R.front.x,c.z-R.front.z);
  const price=Math.round(rand(14,32));let cust=null,cook=null;
  const m=M_('livreur','Commande #'+no+' · '+R.name,(j.base+dist*j.k)*grade(j),[
   {t:'go',title:'Aller chez '+R.name,hint:'Récupère la commande #'+no,at:R.front,r:5,say:'Nouvelle commande #'+no+' chez '+R.name+'.'},
   {t:'e',title:'Annoncer la commande au comptoir',hint:'Commande #'+no+' pour '+who,at:R.front,need:'foot',label:'Annoncer la commande #'+no,on:()=>{say(R.cook,'Bonjour ! La #'+no+' ? '+plat+', ça arrive !',4);}},
   {t:'wait',title:'Patienter pendant la préparation',hint:()=>plat,bar:()=>'Le chef prépare : '+plat,at:R.front,r:5,need:'foot',dur:rand(9,15),enter:()=>{cook={g:R.cook,ph:0,mode:'work'};m.npcs.push(cook);},
     onDone:()=>{cook.mode='idle';R.cook.userData.armR.rotation.x=0;say(R.cook,'Voilà, c’est chaud ! Bonne route.',3.5);}},
   {t:'e',title:'Récupérer le sac isotherme',hint:'Le sac est prêt sur le comptoir',at:R.front,need:'foot',label:'Prendre la commande',on:()=>{carry('bag');m.hot=100;m.time=0;m.limit=Math.round(Math.hypot(c.x-R.front.x,c.z-R.front.z)/5.5+50);}},
   {t:'go',title:'Livrer à '+who,hint:()=>A+' · repas chaud '+Math.round(m.hot)+' %',at:c,r:9,enter:()=>{cust=npc(m,c.x,c.z,c.h+Math.PI,null);cust.mode='phone';}},
   {t:'e',title:'Remettre la commande',hint:()=>'Repas chaud '+Math.round(m.hot)+' %',at:c,need:'foot',label:'Sonner et remettre la commande',on:()=>{dropCarry();cust.mode='idle';face(cust,player);say(cust.g,m.hot>60?'Merci, ça sent super bon !':'C’est un peu froid…',3.5);m.q*=.55+.55*m.hot/100;if(m.time>m.limit)m.q*=.75;}},
   {t:'e',title:'Encaisser',hint:'Le client règle sa commande',at:c,need:'foot',label:'Encaisser la commande',on:()=>{const tip=m.hot>70&&m.time<=m.limit?rand(1,6):0;m.pay+=0;cashFlow(m,{amount:price,tip,who,msg:'Commande livrée'});return false;}}],
   {addr:A,tick:(m,dt)=>{if(m.hot!=null&&m.ix>=4)m.hot=Math.max(0,m.hot-dt*(player.car?.35:.55));},onHit:m=>{if(m.hot!=null){m.hot=Math.max(0,m.hot-8);toast('Choc ! Le sac a pris un coup.','bad');}}});
  return m;}
function parcelRun(j){const D=FIX.relais,c=sidewalk(nodeAround(D.front,50,200)),who=fullName(),A=addr(),ref='AC-'+Math.floor(rand(10000,99999)),away=Math.random()<.3,dist=dTo(D.front)+Math.hypot(c.x-D.front.x,c.z-D.front.z);let cust=null,nb=null;
  const steps=[
   {t:'go',title:'Passer au point relais Aurore Colis',hint:'Colis '+ref,at:D.front,r:5},
   {t:'wait',e:true,title:'Scanner le colis',hint:'Colis '+ref+' · '+who,label:'Scanner le colis '+ref,bar:'Scan du colis '+ref,at:D.front,need:'foot',dur:3,onStart:()=>tone28(1500),onDone:()=>{tone28(1500);say(D.cook,'C’est bon, il est à toi.',3);}},
   {t:'e',title:'Charger le colis',hint:'Colis fragile',at:D.front,need:'foot',label:'Prendre le colis',on:()=>{carry('parcel');m.time=0;m.limit=Math.round(Math.hypot(c.x-D.front.x,c.z-D.front.z)/5+60);}},
   {t:'go',title:'Livrer chez '+who,hint:A,at:c,r:9,enter:()=>{if(!away){cust=npc(m,c.x,c.z,c.h+Math.PI,null);}else{nb=npc(m,c.x+c.sx*-6,c.z,c.h+Math.PI,null);}}},
   {t:'e',title:'Sonner à la porte',hint:A,at:c,need:'foot',label:'Sonner',on:()=>{tone28(660);setTimeout(()=>tone28(520),220);if(!away){face(cust,player);say(cust.g,'Ah, mon colis ! Je signe où ?',3);}else toast('Personne ne répond…','warn');}}];
  if(away)steps.push({t:'choice',title:'Client absent : que faire ?',hint:'Personne à la maison',at:c,need:'foot',panel:'Client absent',q:who+' n’est pas chez lui. Le voisin est dehors.',opts:[
    {l:'Proposer au voisin de le réceptionner',msg:'Le voisin accepte de signer.',fn:()=>{m.d.nb=1;}},
    {l:'Laisser un avis de passage (retour au relais)',q:.7,msg:'Avis de passage déposé.'},
    {l:'Laisser le colis devant la porte',q:.45,msg:'Risqué : le client pourrait se plaindre.'}]});
  steps.push({t:'wait',e:true,title:'Faire signer la livraison',hint:'Signature sur le terminal',label:'Faire signer',bar:'Signature électronique…',at:()=>away&&nb?{x:nb.g.position.x,z:nb.g.position.z}:c,need:'foot',dur:2.5,enter:(m,S)=>{if(away&&!m.d.nb)S.dur=.1;else if(away&&nb){walkTo(nb,{x:c.x-c.sx*2,z:c.z},1.3);}},onDone:()=>dropCarry()},
   {t:'e',title:'Valider la tournée',hint:'Paiement par Aurore Colis',at:null,label:'Valider la livraison',on:()=>{done28(m,{method:'bank',msg:'Colis '+ref+' livré'});return false;}});
  const m=M_('livreur','Colis express '+ref,(j.base+dist*j.k)*grade(j)*1.1,steps,{addr:A,onHit:m=>{m.q*=.93;toast('Choc ! Le colis est secoué.','bad');}});return m;}
function groceryRun(j){const S0=spot('shop')||P(64,-1),c=sidewalk(nodeAround(S0,50,180)),who=fullName(),A=addr(),items=shuf(['lait','pain','riz 5 kg','œufs','bananes','eau x6','café','tomates','savon']).slice(0,4),cost=Math.round(rand(18,40));let cust=null;
  const m=M_('livreur','Courses pour '+who,(j.base+70*j.k)*grade(j),[
   {t:'go',title:'Aller à la Supérette',hint:'Liste : '+items.join(', '),at:S0,r:5},
   {t:'wait',e:true,title:'Faire les courses',hint:items.join(', '),label:'Récupérer les courses préparées',bar:'Le caissier scanne : '+items.join(', '),at:S0,need:'foot',dur:6},
   {t:'e',title:'Payer les courses avec la carte du client',hint:'Total '+fmt(cost),at:S0,need:'foot',label:'Payer '+fmt(cost)+' (carte client)',on:()=>{tone28(1320);carry('box');toast('Ticket de caisse : '+fmt(cost)+'.','');}},
   {t:'go',title:'Livrer à '+who,hint:A,at:c,r:9,enter:()=>{cust=npc(m,c.x,c.z,c.h+Math.PI,null,{});cust.mode='wave';}},
   {t:'e',title:'Remettre les courses',hint:'Ticket : '+fmt(cost),at:c,need:'foot',label:'Remettre les courses et le ticket',on:()=>{dropCarry();cust.mode='idle';face(cust,player);say(cust.g,'Parfait, merci beaucoup !',3);}},
   {t:'e',title:'Encaisser le service',hint:'Courses + frais de livraison',at:c,need:'foot',label:'Encaisser',on:()=>{cashFlow(m,{amount:cost+6,tip:rand(0,4),who,msg:'Courses livrées'});return false;}}],{addr:A});return m;}
/* ---- taxi ---- */
SC.taxi=j=>{const a=sidewalk(nodeAround(player,30,160)),b=sidewalk(nodeAround(a,80,230)),who=fullName(),A=addr(),kind=pick([['pressé',.75],['touriste',1.2],['habitué',1]]),dist=Math.hypot(b.x-a.x,b.z-a.z);let cli=null;
  const m=M_('taxi','Course · '+who,(j.base+dist*j.k)*grade(j),[
   {t:'go',title:'Rejoindre le client',hint:who+' ('+kind[0]+') attend au bord de la route',at:a,r:10,need:'veh',enter:()=>{cli=npc(m,a.x,a.z,a.h+Math.PI,null);cli.mode='wave';}},
   {t:'e',title:'Faire monter le client',hint:'Arrête-toi à côté de lui',at:a,r:9,need:'veh',stop:true,label:'Faire monter '+who,on:()=>{cli.mode='idle';const c=player.car;walkTo(cli,{x:c.x,z:c.z},1.6,n=>hide(n));say(cli.g,'Bonjour ! '+A+', s’il vous plaît.',4);}},
   {t:'e',title:'Lancer le compteur',hint:'Destination : '+A,at:null,need:'veh',label:'Lancer le taximètre',on:()=>{m.d.km0=0;m.d.on=1;m.time=0;m.limit=Math.round(dist/9*kind[1]+35);tone28(990);toast('Compteur lancé : prise en charge '+fmt(3)+' + '+fmt(2)+'/km.','');}},
   {t:'go',title:'Conduire jusqu’à '+A,hint:()=>'Compteur '+fmt(fare())+' · confort '+Math.round(m.d.cf)+' %',at:b,r:9,need:'veh'},
   {t:'e',title:'Arrêter le compteur et encaisser',hint:()=>'Total '+fmt(fare()),at:b,r:9,need:'veh',stop:true,label:'Arrêter le compteur',on:()=>{m.d.on=0;const f=fare();cli.g.visible=true;cli.mode='idle';const c=player.car;cli.g.position.set(c.x+Math.cos(c.h)*1.6,0,c.z-Math.sin(c.h)*1.6);walkTo(cli,{x:b.x,z:b.z},1.4);
     m.q*=(.45+.65*m.d.cf/100)*(m.time>m.limit?.7:1.05);const tip=m.d.cf>75&&m.time<=m.limit?rand(1,3)+f*.12:0;cashFlow(m,{amount:f*grade(J.taxi),tip,who,earn:1,msg:'Course terminée',mode:Math.random()<.5?'cash':'card'});return false;}}],
   {addr:A,d:{cf:100,dist:0,on:0},tick:(m,dt)=>{if(m.d.on&&player.car){m.d.dist+=spd()*dt;const c=player.car;if(spd()>(c.top||27)*.85){m.d.cf=Math.max(0,m.d.cf-(kind[0]==='touriste'?9:5)*dt);warn('Le client s’agrippe au siège…');}}},onHit:m=>{m.d.cf=Math.max(0,m.d.cf-18);toast('Choc ! Confort passager '+Math.round(m.d.cf)+' %','bad');}});
  function fare(){return 4+m.d.dist*.11+m.time*.05;}
  return m;};
/* ---- police / gendarme / sécurité ---- */
function arrestRun(j,o){const a=sidewalk(nodeAround(player,40,150)),w=fullName(),inc=o.inc,st=spot(o.station)||P(-240,-40),dist=dTo(a)+Math.hypot(st.x-a.x,st.z-a.z);let wit=null,sus=null;
  const m=M_(j.id,inc,(j.base+dist*j.k)*grade(j),[
   {t:'go',title:'Se rendre sur les lieux',hint:inc+' · sirène allumée',at:a,r:14,need:'veh',enter:()=>{wit=npc(m,a.x,a.z,a.h+Math.PI,null);wit.mode='wave';}},
   {t:'choice',title:'Interroger le témoin',hint:w+' a tout vu',at:a,need:'foot',panel:'Témoin · '+w,q:'« Il portait une veste rouge et il est parti en courant vers le '+pick(['nord','sud','port','centre'])+' ! » Que fais-tu ?',opts:[
     {l:'Prendre sa déposition et demander une description précise',msg:'Description transmise à toutes les patrouilles.'},
     {l:'Partir immédiatement sans noter',q:.85,msg:'Tu pars vite, mais sans description complète.'},
     {l:'Lui demander de venir au commissariat plus tard',q:.75}],fn0:null},
   {t:'custom',title:'Retrouver et rattraper le suspect',hint:()=>sus?(sus.run?'Il s’enfuit ! Rattrape-le':'Suspect repéré : veste rouge')+' · '+Math.round(dTo(sus.g.position))+' m':'',at:()=>sus?sus.g.position:a,
     enter:()=>{const p=nodeAround(a,30,70);sus=npc(m,p.x,p.z,0,0xc0392b);m.d.lost=0;},
     tick:(m,S,dt)=>{const g=sus.g,d=dTo(g.position);if(!sus.run&&d<26){sus.run=1;toast('Le suspect prend la fuite !','bad');}
       if(sus.run){if(!sus.to||Math.hypot(sus.to.x-g.position.x,sus.to.z-g.position.z)<1.5){const c=[0,1,2,3].map(()=>nodeAround(g.position,20,60));const t=c.sort((p,q)=>dTo(q)-dTo(p))[0];walkTo(sus,t,player.car?6.2:5.2);}
         else if(sus.mode!=='walk')walkTo(sus,sus.to,5.2);sus.sp=(m.time>50?3.8:5.4)*(player.car?1.15:1);}
       if(d>110){m.d.lost+=dt;if(m.d.lost>18){toast('Suspect perdu de vue.','bad');m.q*=.4;return true;}}else m.d.lost=0;
       if(d<(player.car?5:2.2)&&spd()<4){sus.mode='idle';sus.run=0;sus.to=null;say(g,'OK, OK, je me rends !',3);return true;}return false;}},
   {t:'qte',title:'Menotter le suspect',hint:'Appuie sur E au bon moment',at:()=>sus.g.position,r:4,need:'foot',n:3,goTxt:'MENOTTE ! (E)',okTxt:'✓ Clic',onDone:()=>{sus.mode='idle';}},
   {t:'e',title:'Faire monter le suspect dans le véhicule',hint:'Rejoins ton véhicule de service',at:()=>{const c=cars.find(c=>c.company)||player.car;return c?{x:c.x,z:c.z}:sus.g.position;},r:4.5,need:'foot',label:'Installer le suspect à l’arrière',on:()=>{hide(sus);toast('Suspect installé à l’arrière.','good');}},
   {t:'go',title:'Conduire le suspect au '+(o.stName||'commissariat'),hint:'Garde à vue',at:st,r:12,need:'veh',stop:true},
   {t:'wait',e:true,title:'Rédiger le procès-verbal',hint:'Audition et PV',label:'Rédiger le procès-verbal',bar:'Rédaction du procès-verbal…',at:st,r:12,need:'foot',dur:6},
   {t:'e',title:'Remettre le rapport',hint:'Prime versée par virement',at:st,r:12,need:'foot',label:'Remettre le rapport',on:()=>{reportFlow(m,{lines:[inc,'Suspect interpellé'],msg:'Interpellation validée'});return false;}}]);
  return m;}
function noiseRun(j){const a=sidewalk(nodeAround(player,40,150)),b={x:a.x+a.sx*-5,z:a.z};let ng=null,np=null;
  const m=M_(j.id,'Tapage nocturne',(j.base+70*j.k)*grade(j),[
   {t:'go',title:'Se rendre à l’adresse signalée',hint:addr(),at:a,r:14,need:'veh',enter:()=>{ng=npc(m,a.x,a.z,a.h+Math.PI,null);ng.mode='wave';np=npc(m,b.x,b.z,0,0x7b4bb3);np.mode='cheer';}},
   {t:'e',title:'Écouter le voisin',hint:'Plainte pour bruit',at:a,need:'foot',label:'Parler au voisin',on:()=>{say(ng.g,'Ça dure depuis 3 heures, je n’en peux plus !',4);ng.mode='idle';}},
   {t:'choice',title:'Intervenir auprès du fêtard',hint:'Musique à fond',at:b,need:'foot',panel:'Intervention',q:'Le fêtard ouvre, la musique à fond. Comment interviens-tu ?',opts:[
     {l:'Rappeler la loi calmement et demander de baisser le son',msg:'Il baisse le son et s’excuse.',fn:()=>{np.mode='idle';say(np.g,'Pardon, j’éteins tout.',3);}},
     {l:'Dresser directement une contravention',q:.9,msg:'Contravention dressée, l’ambiance est tendue.',fn:()=>{np.mode='idle';}},
     {l:'Repartir sans rien dire',q:.4,msg:'Le bruit continue…'}]},
   {t:'e',title:'Rassurer le voisin et clôturer',hint:'Main courante',at:a,need:'foot',label:'Clôturer l’intervention',on:()=>{reportFlow(m,{lines:['Tapage nocturne','Médiation'],msg:'Intervention close'});return false;}}]);return m;}
function checkpointRun(j){const n=sidewalk(nodeAround(player,40,140)),road={x:n.x+n.sx*8.5,z:n.z};
  const p={x:n.x,z:n.z},cases=[['Permis valide · assurance expirée depuis 2 mois','Verbaliser le défaut d’assurance',['Laisser repartir','Placer le conducteur en garde à vue']],['Tous les papiers sont en règle','Remercier et laisser repartir',['Verbaliser quand même','Confisquer le véhicule']],['Permis suspendu · véhicule à son nom','Immobiliser le véhicule et verbaliser',['Laisser repartir','Lui demander de rentrer à pied sans PV']]],cs=pick(cases);let car=null,drv=null;
  const m=M_(j.id,'Contrôle routier',(j.base+60*j.k)*grade(j),[
   {t:'go',title:'Rejoindre le point de contrôle',hint:'Carrefour signalé',at:p,r:12,need:'veh'},
   {t:'wait',e:true,title:'Installer les cônes',hint:'Balisage de sécurité',label:'Installer les cônes',bar:'Balisage en cours…',at:p,r:8,need:'foot',dur:4,onDone:()=>{for(let k=0;k<4;k++){const g=grp(road.x-n.sx*2.2,road.z+k*1.8-2.7,0);const c=new THREE.Mesh(new THREE.ConeGeometry(.22,.7,10),lm(0xff7a1a));c.position.y=.35;g.add(c);}}},
   {t:'custom',title:'Arrêter un véhicule',hint:'Un véhicule approche…',at:p,enter:()=>{car=addCar(road.x,road.z+6,Math.PI,pick(CAR_COLORS),'parked',pick(['sedan','suv','toyota','honda','hyundai']));m.cars.push(car);drv=npc(m,road.x-n.sx*1.6,road.z+6,0,null);drv.mode='idle';m.d.w=2;},tick:(m,S,dt)=>{m.d.w-=dt;return m.d.w<=0;}},
   {t:'choice',title:'Contrôler les papiers',hint:'Permis, assurance, carte grise',at:()=>drv.g.position,r:4,need:'foot',panel:'Contrôle des papiers',q:()=>'Résultat du contrôle : '+cs[0]+'. Décision ?',opts:()=>shuf([{l:cs[1],msg:'Décision conforme.'},{l:cs[2][0],q:.6,msg:'Décision discutable.'},{l:cs[2][1],q:.5,msg:'Décision disproportionnée.'}])},
   {t:'qte',title:'Dépistage d’alcoolémie',hint:'Fais souffler le conducteur',at:()=>drv.g.position,r:4,need:'foot',n:2,goTxt:'SOUFFLEZ ! (E)',okTxt:'✓ Mesure prise',onDone:()=>{toast(Math.random()<.8?'Éthylotest négatif : 0,00 g/l.':'Éthylotest positif : conduite interdite, véhicule immobilisé.','');}},
   {t:'e',title:'Clôturer le contrôle',hint:'Rapport transmis',at:p,r:8,need:'foot',label:'Clôturer le contrôle',on:()=>{reportFlow(m,{lines:['Contrôle routier','1 véhicule contrôlé'],msg:'Contrôle clôturé'});return false;}}]);
  return m;}
SC.police=j=>Math.random()<.65?arrestRun(j,{inc:pick(['Vol à l’arraché','Cambriolage au port','Bagarre devant le club','Vol à l’étalage']),station:'comm13'}):Math.random()<.5?noiseRun(j):checkpointRun(j);
SC.gendarme=j=>Math.random()<.55?checkpointRun(j):arrestRun(j,{inc:pick(['Fugitif signalé','Cambriolage rural','Vol de scooter']),station:'gend13',stName:'brigade de gendarmerie'});
SC.securite=j=>{const S0=pick([spot('bank'),spot('club'),spot('shop'),spot('hospital')].filter(Boolean)),pts=[0,1,2,3].map(i=>({x:S0.x+[-10,10,10,-10][i],z:S0.z+[3,3,10,10][i]})),inc=pick(JB.QUIZ.securite),bad=Math.floor(rand(1,4));
  const steps=[{t:'go',title:'Prendre son poste au site',hint:'Ronde de sécurité',at:S0,r:6},{t:'e',title:'Badger au poste de garde',at:S0,need:'foot',label:'Badger la prise de service',on:()=>tone28(1500)}];
  pts.forEach((p,i)=>{steps.push({t:'e',title:'Point de ronde '+(i+1)+'/4',hint:'Lecteur de badge',at:p,need:'foot',label:'Badger le point '+(i+1),enter:()=>{const g=grp(p.x,p.z,0);bx(g,.25,.35,.1,0x20262e,0,1.3,0);bx(g,.08,.08,.11,0x4cd964,0,1.4,.01);cy(g,.04,1.2,0x6c737b,0,.6,0);},on:()=>tone28(1500)});
    if(i===bad)steps.push({t:'choice',title:'Incident !',hint:inc[0],at:p,need:'foot',panel:'Incident de sécurité',q:inc[0],opts:()=>shuf([{l:inc[1],msg:'Bonne réaction.'}].concat(inc[2].map(x=>({l:x,q:.55,msg:'Mauvaise réaction.'}))))});});
  steps.push({t:'e',title:'Remplir la main courante',at:S0,need:'foot',label:'Rédiger la main courante',on:()=>{reportFlow(m,{title:'Main courante',lines:['Ronde complète','1 incident traité'],msg:'Ronde terminée'});return false;}});
  var m=M_('securite','Ronde de sécurité',(j.base+80*j.k)*grade(j),steps);return m;};
/* ---- secours ---- */
const CASES=[['Personne inconsciente qui respire','Mettre en position latérale de sécurité',['Lui donner à boire','La faire marcher'],0],['Arrêt cardiaque, ne respire plus','Massage cardiaque et défibrillateur',['Position latérale de sécurité','Attendre sans toucher'],1],['Jambe déformée après une chute','Immobiliser la jambe avec une attelle',['Remettre l’os en place','Faire marcher la victime'],0],['Saignement abondant au bras','Compression directe puis pansement compressif',['Mettre de la glace','Lever les jambes'],0]];
SC.ambulancier=j=>{const a=sidewalk(nodeAround(player,40,170)),H=JB.hosp(),cs=pick(CASES),dist=dTo(a)+Math.hypot(H.x-a.x,H.z-a.z);let vic=null,wit=null;
  const steps=[{t:'go',title:'Se rendre auprès de la victime',hint:()=>cs[0]+' · état '+Math.round(m.d.c)+' %',at:a,r:14,need:'veh',enter:()=>{vic=npc(m,a.x,a.z,0,null);lie(vic);wit=npc(m,a.x+1.6,a.z+1,0,null);wit.mode='wave';}},
   {t:'e',title:'Faire le bilan',hint:'Conscience, respiration, pouls',at:a,need:'foot',label:'Examiner la victime',on:()=>{wit.mode='idle';toast('Bilan : '+cs[0]+'.','warn');}},
   {t:'choice',title:'Choisir les premiers gestes',hint:cs[0],at:a,need:'foot',panel:'Premiers secours',q:'Bilan : '+cs[0]+'. Quel geste ?',opts:()=>shuf([{l:cs[1],msg:'Geste adapté.',fn:()=>{m.d.c=Math.min(100,m.d.c+15);}}].concat(cs[2].map(x=>({l:x,q:.55,msg:'Mauvais geste, l’état se dégrade.',fn:()=>{m.d.c-=15;}}))))}];
  if(cs[3])steps.push({t:'qte',title:'Compressions thoraciques',hint:'Garde le rythme',at:a,need:'foot',n:5,win:.75,goTxt:'COMPRESSION ! (E)',okTxt:'✓',onDone:()=>{toast('Le cœur repart ! Pouls faible mais présent.','good');m.d.c=Math.min(100,m.d.c+20);}});
  else steps.push({t:'wait',e:true,title:'Prodiguer les soins',hint:cs[1],label:'Commencer les soins',bar:'Soins en cours : '+cs[1],at:a,need:'foot',dur:5,onDone:()=>{m.d.c=Math.min(100,m.d.c+10);}});
  steps.push({t:'wait',e:true,title:'Installer la victime sur le brancard',hint:'Avec ton équipier',label:'Installer sur le brancard',bar:'Brancardage…',at:a,need:'foot',dur:3,onDone:()=>{hide(vic);}},
   {t:'go',title:'Transport vers l’hôpital',hint:()=>'État du patient '+Math.max(0,Math.round(m.d.c))+' % · évite les chocs',at:H,r:12,need:'veh',stop:true},
   {t:'e',title:'Transmettre le patient aux urgences',hint:'Transmission à l’équipe',at:H,r:12,need:'foot',label:'Transmettre le bilan aux urgences',on:()=>{m.q*=.4+.8*clamp01(m.d.c/100);reportFlow(m,{title:'Fiche d’intervention',lines:[cs[0],'Patient admis · état '+Math.max(0,Math.round(m.d.c))+' %'],msg:'Patient admis aux urgences'});return false;}});
  var m=M_('ambulancier','Urgence · '+cs[0],(j.base+dist*j.k)*grade(j),steps,{d:{c:rand(55,80)},tick:(m,dt)=>{if(m.ix<steps.length-1)m.d.c-=dt*(m.ix>=steps.length-3?.35:.18);if(m.d.c<=0&&!m.d.dead){m.d.dead=1;m.d.c=0;toast('L’état du patient est critique !','bad');m.q*=.5;}},onHit:m=>{if(m.ix>=steps.length-2){m.d.c-=8;toast('Choc ! État du patient '+Math.round(m.d.c)+' %','bad');}}});return m;};
SC.infirmier=j=>{const a=sidewalk(nodeAround(player,40,160)),who=fullName(),qz=pick(JB.QUIZ.infirmier);let pt=null;
  const m=M_('infirmier','Soins à domicile · '+who,(j.base+90*j.k)*grade(j),[
   {t:'go',title:'Visite chez '+who,hint:addr(),at:a,r:9,enter:()=>{pt=npc(m,a.x,a.z,a.h+Math.PI,null);}},
   {t:'e',title:'Sonner et se présenter',at:a,need:'foot',label:'Sonner chez '+who,on:()=>{tone28(660);face(pt,player);say(pt.g,'Entrez, je vous attendais.',3);}},
   {t:'e',title:'Se laver les mains et écouter le patient',hint:'Hygiène',at:a,need:'foot',label:'Gel hydroalcoolique + écoute',on:()=>{say(pt.g,qz[0],5);}},
   {t:'choice',title:'Choisir le soin',hint:qz[0],at:a,need:'foot',panel:'Soins',q:qz[0],opts:()=>shuf([{l:qz[1],msg:'Soin adapté.'}].concat(qz[2].map(x=>({l:x,q:.5,msg:'Soin inadapté.'}))))},
   {t:'wait',e:true,title:'Réaliser le soin',label:'Réaliser le soin',bar:'Soin en cours…',at:a,need:'foot',dur:6},
   {t:'e',title:'Remplir la feuille de soins',hint:'Tiers payant',at:a,need:'foot',label:'Faire signer la feuille de soins',on:()=>{done28(m,{method:'bank',msg:'Soin réalisé · télétransmis'});return false;}}]);return m;};
SC.pompier=j=>{const r=Math.random();const a=sidewalk(nodeAround(player,40,160));
  if(r<.55){let res=null,fl=[];const m=M_('pompier','Feu signalé · '+addr(),(j.base+150*j.k)*grade(j),[
    {t:'go',title:'Foncer sur l’incendie',hint:'Sirène et gyrophares',at:a,r:16,need:'veh',enter:()=>{res=npc(m,a.x+4,a.z+2,0,null);res.mode='wave';}},
    {t:'wait',e:true,title:'Dérouler et brancher la lance',hint:'Raccord sur le camion',label:'Dérouler la lance',bar:'Établissement de la lance…',at:()=>{const c=cars.find(c=>c.company);return c?{x:c.x,z:c.z}:a;},r:6,need:'foot',dur:3.5,onDone:()=>{m.d.hose=1;toast('Lance en eau ! Approche-toi des flammes.','good');}},
    {t:'custom',title:'Éteindre les foyers',hint:()=>'Foyers restants : '+fl.filter(f=>f.hp>0).length+'/3 · approche-toi à pied',at:()=>{const L=fl.filter(f=>f.hp>0).sort((p,q)=>dTo(p)-dTo(q));return L[0]||a;},
      enter:()=>{fl=[0,1,2].map(i=>{const an=i*2.1+rand(0,.6),x=a.x+Math.cos(an)*6,z=a.z+Math.sin(an)*6;return {x,z,hp:80,mesh:flameMesh(x,z)};});m.d.jet=null;},
      tick:(m,S,dt)=>{const t=performance.now()*.01;let spray=null;fl.forEach(f=>{if(f.hp<=0)return;f.hp=Math.min(100,f.hp+1.5*dt);if(!player.car&&dTo(f)<5){f.hp-=26*dt;spray=f;}const s=Math.max(.15,f.hp/100);f.mesh.scale.set(s,s*(1+.15*Math.sin(t+f.x)),s);if(f.hp<=0){fxDel(f.mesh);toast('Foyer éteint !','good');}});
        jet(spray);return fl.every(f=>f.hp<=0);},exit:()=>jet(null)},
    {t:'e',title:'S’assurer que personne n’est resté à l’intérieur',hint:'Parler au résident',at:()=>res.g.position,r:3.5,need:'foot',label:'Demander s’il reste quelqu’un',on:()=>{res.mode='idle';say(res.g,'Non, tout le monde est sorti. Merci !',3.5);}},
    {t:'wait',e:true,title:'Déblai et ventilation',hint:'Éviter la reprise du feu',label:'Ventiler les lieux',bar:'Déblai et ventilation…',at:a,r:8,need:'foot',dur:5},
    {t:'e',title:'Rédiger le compte rendu',at:a,r:10,need:'foot',label:'Compte rendu de sortie',on:()=>{reportFlow(m,{lines:['Feu éteint','Aucune victime'],msg:'Incendie maîtrisé'});return false;}}]);return m;}
  if(r<.8){let own=null,cat=null;const tr={x:a.x-a.sx*3,z:a.z-a.sz*3};const m=M_('pompier','Chat coincé dans un arbre',(j.base+70*j.k)*grade(j),[
    {t:'go',title:'Rejoindre la propriétaire',hint:'Chat perché à 5 m',at:a,r:14,need:'veh',enter:()=>{own=npc(m,a.x,a.z,a.h+Math.PI,null);own.mode='wave';const g=grp(tr.x,tr.z,0);const t=new THREE.Mesh(treeGeo('round'),new THREE.MeshLambertMaterial({vertexColors:true}));t.scale.setScalar(1.3);g.add(t);cat=bx(g,.36,.2,.18,0xe08a2a,.6,5.2,0);}},
    {t:'e',title:'Parler à la propriétaire',at:a,need:'foot',label:'Écouter la propriétaire',on:()=>{own.mode='idle';say(own.g,'Minou est là-haut depuis ce matin !',4);}},
    {t:'wait',e:true,title:'Déployer l’échelle',label:'Déployer l’échelle',bar:'Mise en place de l’échelle…',at:tr,r:5,need:'foot',dur:4,onDone:()=>{const g=grp(tr.x+.8,tr.z,0);const l=bx(g,.5,5.5,.08,0xc0392b,0,2.75,0);l.rotation.z=.12;}},
    {t:'qte',title:'Attraper le chat',hint:'Doucement…',at:tr,r:5,need:'foot',n:2,goTxt:'ATTRAPE-LE ! (E)',onDone:()=>{if(cat)cat.visible=false;carry('cat');}},
    {t:'e',title:'Rendre le chat à sa propriétaire',at:()=>own.g.position,r:3.5,need:'foot',label:'Rendre le chat',on:()=>{dropCarry();own.mode='cheer';say(own.g,'Merci, vous êtes des héros !',4);}},
    {t:'e',title:'Compte rendu',at:a,r:10,need:'foot',label:'Clôturer l’intervention',on:()=>{reportFlow(m,{lines:['Sauvetage animalier'],msg:'Chat sauvé'});return false;}}]);return m;}
  let r1=null,r2=null;const m=M_('pompier','Fuite de gaz',(j.base+100*j.k)*grade(j),[
   {t:'go',title:'Se rendre sur la fuite de gaz',hint:'Odeur de gaz signalée',at:a,r:14,need:'veh',enter:()=>{r1=npc(m,a.x+3,a.z,0,null);r2=npc(m,a.x-3,a.z+1,0,null);r1.mode='phone';}},
   {t:'wait',e:true,title:'Établir un périmètre de sécurité',label:'Baliser le périmètre',bar:'Balisage du périmètre…',at:a,r:8,need:'foot',dur:4},
   {t:'e',title:'Évacuer les résidents',at:a,r:8,need:'foot',label:'Faire évacuer les résidents',on:()=>{[r1,r2].forEach((n,i)=>{n.mode='idle';walkTo(n,{x:a.x+(i?-14:14),z:a.z+8},1.8);});}},
   {t:'qte',title:'Fermer la vanne de gaz',hint:'Vanne grippée',at:{x:a.x-a.sx*2,z:a.z-a.sz*2},r:4,need:'foot',n:3,goTxt:'TOURNE ! (E)'},
   {t:'wait',e:true,title:'Mesurer le taux de gaz',label:'Mesurer avec l’explosimètre',bar:'Mesure : taux en baisse…',at:a,r:8,need:'foot',dur:4},
   {t:'e',title:'Compte rendu',at:a,r:10,need:'foot',label:'Lever le périmètre',on:()=>{reportFlow(m,{lines:['Fuite de gaz','Vanne fermée'],msg:'Fuite maîtrisée'});return false;}}]);return m;};
let jetM=null;function jet(f){if(!f){if(jetM)jetM.visible=false;return;}if(!jetM){jetM=new THREE.Mesh(new THREE.CylinderGeometry(.06,.18,1,8,1,true),new THREE.MeshBasicMaterial({color:0xbfe3ff,transparent:true,opacity:.6,depthWrite:false}));scene.add(jetM);}
  const a=new THREE.Vector3(player.x,1.2,player.z),b=new THREE.Vector3(f.x,.6,f.z),d=b.clone().sub(a),L=d.length();jetM.visible=true;jetM.scale.set(1,L,1);jetM.position.copy(a).addScaledVector(d,.5);jetM.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
/* ---- transports ---- */
SC.bus=j=>{const L=pick(j.tasks),n=4;let p=sidewalk(nodeAround(player,20,90));const stops=[p];for(let i=1;i<n;i++){p=sidewalk(nodeAround(p,45,110));stops.push(p);}let fare=0,onb=0;
  const steps=[];stops.forEach((s,i)=>{const last=i===n-1;let wait=[];
    steps.push({t:'go',title:'Arrêt '+(i+1)+'/'+n+(last?' · terminus':''),hint:()=>L+' · '+onb+' à bord · confort '+Math.round(m.d.cf)+' %',at:s,r:8,need:'veh',stop:true,
      enter:()=>{const g=grp(s.x,s.z,s.h);bx(g,2.6,.08,1.2,0x2a2f35,0,2.4,0);[-1.2,1.2].forEach(x=>bx(g,.08,2.4,.08,0x6c737b,x,1.2,-.5));bx(g,2.4,1.6,.04,0x9fc6dd,0,1.4,-.55);const sg=sign27('ARRÊT '+(i+1),1.2,.4,'#1f7a52','#ffffff');sg.position.set(0,2.15,.1);g.add(sg);
        if(!last){const k=Math.floor(rand(1,4));for(let q=0;q<k;q++)wait.push(npc(m,s.x+rand(-1,1),s.z+rand(-.4,.4),s.h+Math.PI,null));}}},
    {t:'wait',title:last?'Terminus : tout le monde descend':'Ouvrir les portes · montée des voyageurs',hint:'Reste à l’arrêt',bar:last?'Descente des voyageurs…':'Montée et validation des billets…',at:s,r:9,need:'veh',stop:true,dur:last?4:3.5,
      enter:()=>{tone28(700);const c=player.car;wait.forEach(w=>walkTo(w,{x:c.x,z:c.z},1.5,x=>hide(x)));},onDone:()=>{const down=last?onb:Math.min(onb,Math.floor(rand(0,2)));onb+=wait.length-down;fare+=wait.length*2;if(!last&&wait.length)toast(wait.length+' voyageur(s) montent'+(down?', '+down+' descend(ent)':'')+'.','');}});});
  steps.push({t:'e',title:'Rendre la feuille de service',hint:'Recette des billets',at:null,label:'Clôturer le service',on:()=>{m.q*=.6+.4*m.d.cf/100;reportFlow(m,{title:'Feuille de service',lines:[L,'Recette billets : '+fmt(fare)],msg:'Service terminé'});return false;}});
  var m=M_('bus',L,(j.base+260*j.k)*grade(j),steps,{d:{cf:100},tick:(m,dt)=>{const c=player.car;if(c&&spd()>(c.top||20)*.8){m.d.cf=Math.max(0,m.d.cf-4*dt);warn('Trop vite, les voyageurs sont secoués.');}},onHit:m=>{m.d.cf=Math.max(0,m.d.cf-15);toast('Choc ! Confort '+Math.round(m.d.cf)+' %','bad');}});return m;};
const DOCKS=[[400,90,30],[460,150,28],[540,80,34],[640,150,32],[690,70,30]].map(([x,z,d])=>({x,z:z+d/2+4}));
SC.routier=j=>{const A=pick(DOCKS),B=Math.random()<.5?sidewalk(nodeAround(P(0,0),40,200)):{x:rand(-150,150),z:200},cargo=pick(j.tasks),no='BL-'+Math.floor(rand(1000,9999)),dist=dTo(A)+Math.hypot(B.x-A.x,B.z-A.z);let ca=null,rc=null;
  const m=M_('routier',cargo,(j.base+dist*j.k*.5)*grade(j),[
   {t:'go',title:'Se présenter au quai de chargement',hint:'Zone d’activités · '+no,at:A,r:12,need:'veh',stop:true,enter:()=>{ca=npc(m,A.x+4,A.z,0,0xe0a526);}},
   {t:'e',title:'Remettre le bon au cariste',hint:no,at:()=>ca.g.position,r:4,need:'foot',label:'Donner le bon de chargement',on:()=>{face(ca,player);say(ca.g,'OK, je te charge ça, 2 minutes.',3.5);ca.mode='work';}},
   {t:'wait',title:'Chargement des palettes',hint:'Le cariste charge le camion',bar:'Chargement : palettes 1 à 6',at:A,r:14,dur:9,onDone:()=>{ca.mode='idle';toast('Chargement terminé. Vérifie l’arrimage.','good');}},
   {t:'wait',e:true,title:'Vérifier l’arrimage',label:'Contrôler les sangles',bar:'Contrôle des sangles…',at:()=>{const c=player.car||cars.find(c=>c.company);return c?{x:c.x,z:c.z}:A;},r:5,need:'foot',dur:3},
   {t:'go',title:'Livrer la marchandise',hint:()=>cargo+' · intégrité '+Math.round(m.d.i)+' %',at:B,r:12,need:'veh',stop:true,enter:()=>{rc=npc(m,B.x+3,B.z,0,0x3b5b8a);rc.mode='wave';m.time=0;m.limit=Math.round(Math.hypot(B.x-A.x,B.z-A.z)/8+50);}},
   {t:'wait',e:true,title:'Déchargement',label:'Ouvrir les portes et décharger',bar:'Déchargement…',at:B,r:12,need:'foot',dur:6,enter:()=>{rc.mode='idle';}},
   {t:'e',title:'Faire signer la lettre de voiture',at:()=>rc.g.position,r:4,need:'foot',label:'Faire signer le bon',on:()=>{m.q*=(.35+.65*m.d.i/100)*(m.time>m.limit?.75:1.1);reportFlow(m,{title:'Lettre de voiture signée',lines:[cargo,'Intégrité '+Math.round(m.d.i)+' %'],btn:'Transmettre au transporteur',msg:'Livraison '+no+' validée'});return false;}}],
   {d:{i:100},onHit:m=>{if(m.ix>=4){m.d.i=Math.max(0,m.d.i-14);toast('Choc ! Cargaison '+Math.round(m.d.i)+' %','bad');}}});return m;};
/* ---- artisans, services ---- */
SC.mecanicien=j=>{const a=sidewalk(nodeAround(player,40,150)),who=fullName(),qz=pick(JB.QUIZ.mecanicien),D=FIX.depot;let cl=null,car=null;
  const m=M_('mecanicien','Dépannage · '+who,(j.base+120*j.k)*grade(j),[
   {t:'go',title:'Rejoindre le client en panne',hint:who+' · '+addr(),at:a,r:9,enter:()=>{const rx=a.x+a.sx*4,rz=a.z;car=addCar(rx,rz,a.sx>0?0:Math.PI,pick(CAR_COLORS),'parked',pick(['sedan','toyota','honda','hyundai','suv']));m.cars.push(car);cl=npc(m,a.x,a.z+1,a.h,null);cl.mode='phone';}},
   {t:'e',title:'Écouter le client',at:()=>cl.g.position,r:3.5,need:'foot',label:'Parler à '+who,on:()=>{cl.mode='idle';face(cl,player);say(cl.g,qz[0],5);}},
   {t:'wait',e:true,title:'Ouvrir le capot et diagnostiquer',label:'Diagnostiquer le moteur',bar:'Diagnostic : valise, contrôles…',at:()=>({x:car.x,z:car.z}),r:4,need:'foot',dur:5},
   {t:'choice',title:'Poser le diagnostic',hint:qz[0],at:()=>({x:car.x,z:car.z}),r:4,need:'foot',panel:'Diagnostic',q:qz[0],opts:()=>shuf([{l:qz[1],msg:'Bon diagnostic.'}].concat(qz[2].map(x=>({l:x,q:.5,msg:'Mauvais diagnostic.'}))))},
   {t:'choice',title:'Établir le devis',at:()=>cl.g.position,r:4,need:'foot',panel:'Devis',q:'Pièce + main-d’œuvre. Quel prix annonces-tu ?',opts:[{l:'Prix juste · '+fmt(45),fn:()=>{m.d.p=45;}},{l:'Prix élevé · '+fmt(80),q:.85,fn:()=>{m.d.p=80;say(cl.g,'Aïe… bon, d’accord.',3);}},{l:'Prix d’ami · '+fmt(30),q:1.05,fn:()=>{m.d.p=30;say(cl.g,'Merci, c’est sympa !',3);}}]},
   {t:'go',title:'Chercher la pièce chez Pièces Auto Aurore',at:D.front,r:5},
   {t:'e',title:'Retirer la pièce au comptoir',at:D.front,need:'foot',label:'Retirer la pièce',on:()=>{carry('part');say(D.cook,'Voilà ta pièce, c’est la bonne référence.',3);}},
   {t:'go',title:'Retourner chez le client',at:()=>({x:car.x,z:car.z}),r:6},
   {t:'wait',e:true,title:'Réparer',label:'Monter la pièce',bar:'Réparation en cours…',at:()=>({x:car.x,z:car.z}),r:4,need:'foot',dur:7,onStart:()=>dropCarry()},
   {t:'qte',title:'Essai : démarrer le moteur',at:()=>({x:car.x,z:car.z}),r:4,need:'foot',n:1,goTxt:'CONTACT ! (E)',okTxt:'✓ Vroum !',onDone:()=>{say(cl.g,'Elle tourne comme une horloge !',3);cl.mode='cheer';}},
   {t:'e',title:'Encaisser la réparation',at:()=>cl.g.position,r:4,need:'foot',label:'Présenter la facture',on:()=>{cashFlow(m,{amount:(m.d.p||45)*grade(J.mecanicien)*clamp(m.q,.4,1.2),tip:m.q>1?rand(2,6):0,who,earn:1,msg:'Réparation payée'});return false;}}]);return m;};
const FUELQ=[['citadine essence','Sans plomb 95'],['camionnette de livraison','Gazole'],['sportive','Sans plomb 98'],['petit utilitaire électrique','Borne électrique']];
SC.pompiste=j=>{const F=spot('fuel')||P(192,-180),fq=pick(FUELQ),who=fullName(),L=Math.round(rand(20,45)),price=Math.round(L*1.7);let car=null,cl=null;
  const pump={x:F.x+4,z:F.z+6};
  const m=M_('pompiste','Station · '+who,(j.base+40*j.k)*grade(j),[
   {t:'go',title:'Prendre son poste à la station',at:F,r:6},
   {t:'e',title:'Badger la prise de poste',at:F,need:'foot',label:'Badger',on:()=>{tone28(1500);}},
   {t:'custom',title:'Un client arrive à la pompe',hint:fq[0],at:pump,enter:()=>{car=addCar(pump.x+2,pump.z,0,pick(CAR_COLORS),'parked',fq[0]==='sportive'?'sport':fq[0]==='camionnette de livraison'?'danfo':'toyota');m.cars.push(car);cl=npc(m,pump.x+3.4,pump.z+1,0,null);m.d.w=2;},tick:(m,S,dt)=>{m.d.w-=dt;return m.d.w<=0;}},
   {t:'choice',title:'Accueillir le client et choisir le carburant',hint:fq[0],at:pump,r:4,need:'foot',panel:'Pompe n°2',q:'« Bonjour ! Le plein pour ma '+fq[0]+', s’il vous plaît. » Quel carburant ?',opts:()=>shuf(FUELQ.map(x=>x[1]).filter((v,i,a)=>a.indexOf(v)===i).slice(0,4).map(v=>({l:v,q:v===fq[1]?1.1:.3,msg:v===fq[1]?'Bon carburant.':'Mauvais carburant ! Le client est furieux.'})))},
   {t:'wait',e:true,title:'Faire le plein',hint:L+' litres',label:'Décrocher le pistolet',bar:()=>'Plein en cours…',at:pump,r:4,need:'foot',dur:7,during:(m,S)=>{S.bar='Plein : '+Math.round(S.k*L)+' / '+L+' L · '+fmt(S.k*price);}},
   {t:'choice',title:'Proposer un service',at:pump,r:4,need:'foot',panel:'Service',q:'Le client attend. Tu proposes :',opts:[{l:'Vérifier la pression des pneus',q:1.1,msg:'Le client apprécie.'},{l:'Nettoyer le pare-brise',q:1.08,msg:'Pare-brise impeccable.'},{l:'Rien, encaisser directement',q:1}]},
   {t:'e',title:'Encaisser',at:pump,r:4,need:'foot',label:'Encaisser '+fmt(price),on:()=>{cashFlow(m,{amount:price,tip:m.q>1?rand(1,3):0,who,msg:'Plein encaissé'});return false;}}]);return m;};
SC.pecheur=j=>{const spotP={x:pick([-180,-140,-60,60,140,180]),z:204},C=FIX.criee;let casts=3,cat=[];
  const m=M_('pecheur','Pêche sur le quai',(j.base+40*j.k)*grade(j),[
   {t:'go',title:'Rejoindre ton coin de pêche sur le quai',at:spotP,r:4},
   {t:'wait',e:true,title:'Préparer la ligne et l’appât',label:'Monter la ligne',bar:'Montage de la ligne, appât…',at:spotP,r:4,need:'foot',dur:3.5,onDone:()=>{const g=grp(spotP.x,spotP.z+1.5,0);const r=cy(g,.02,3.2,0x2a2f35,0,1.2,.6);r.rotation.x=.9;}},
   {t:'custom',title:'Pêcher (3 lancers)',hint:()=>'Lancers : '+casts+' · prises : '+cat.length+(m.d.bite>0?' · ÇA MORD, E !':' · patience…'),at:spotP,enter:()=>{m.d.wt=rand(2,5);m.d.bite=0;},tick:(m,S,dt)=>{if(dTo(spotP)>6)return false;
     if(m.d.bite>0){m.d.bite-=dt;if(m.d.bite<=0){casts--;cue('Raté, il s’est décroché','bad');m.d.wt=rand(2,5);}}else{m.d.wt-=dt;if(m.d.wt<=0){m.d.bite=1.3;cue('ÇA MORD ! (E)','go');tone28(880);}}
     return casts<=0;},press:()=>{if(dTo(spotP)>6||player.car)return false;if(m.d.bite>0){const f=pick(JB.FISH);cat.push(f);m.d.bite=0;casts--;m.d.wt=rand(2,5);cue('Prise : '+f[0],'good');}else{m.d.wt=rand(2,5);cue('Trop tôt !','bad');}}},
   {t:'e',title:'Ranger la pêche dans la glacière',at:spotP,r:4,need:'foot',label:'Mettre la pêche en glacière',on:()=>{if(!cat.length){toast('Aucune prise aujourd’hui…','warn');m.q*=.4;}carry('fish');}},
   {t:'go',title:'Aller à la criée',hint:()=>cat.map(f=>f[0]).join(', ')||'glacière vide',at:C.front,r:5},
   {t:'choice',title:'Négocier le prix',at:C.front,need:'foot',panel:'Criée du Port',q:()=>'Le mareyeur regarde ta pêche ('+(cat.map(f=>f[0]).join(', ')||'rien')+'). Valeur du marché : '+fmt(val())+'. Ton prix ?',opts:()=>[{l:'Prix du marché · '+fmt(val()),fn:()=>{m.d.p=val();}},{l:'Demander 25 % de plus · '+fmt(val()*1.25),fn:()=>{if(Math.random()<.45){m.d.p=val()*1.25;toast('Le mareyeur accepte !','good');}else{m.d.p=val()*.9;toast('Refusé : il te propose 10 % de moins.','warn');}}},{l:'Vente rapide · '+fmt(val()*.9),fn:()=>{m.d.p=val()*.9;}}]},
   {t:'e',title:'Être payé',at:C.front,need:'foot',label:'Remettre la glacière et être payé',on:()=>{dropCarry();cashFlow(m,{amount:Math.max(5,m.d.p||5),who:'Le mareyeur',mode:'cash',earn:1,msg:'Pêche vendue'});return false;}}]);
  const val=()=>Math.round(cat.reduce((s,f)=>s+f[1],0)*grade(j));return m;};
SC.docker=j=>{const base={x:rand(-150,150),z:203},A={x:base.x-8,z:202},B={x:base.x+8,z:202},code=['MSKU','CMAU','TGHU'][Math.floor(rand(0,3))]+' '+Math.floor(rand(100000,999999));let chef=null;
  const steps=[{t:'go',title:'Rejoindre le chef de quai',at:base,r:5,enter:()=>{chef=npc(m,base.x,base.z-1.5,0,0xe0732b);const g=grp(A.x,A.z-2,0);for(let i=0;i<3;i++)bx(g,2.4,1.2,1.2,pick([0xc0392b,0x2e6fd1,0x2e9a6a]),0,.6+i*1.22,0);}},
    {t:'e',title:'Recevoir les consignes',at:()=>chef.g.position,r:3.5,need:'foot',label:'Écouter les consignes',on:()=>{face(chef,player);say(chef.g,'3 colis du conteneur '+code+' vers la zone B. Casque obligatoire !',5);}}];
  for(let i=0;i<3;i++){steps.push({t:'wait',e:true,title:'Arrimer la caisse '+(i+1)+'/3',label:'Accrocher la caisse',bar:'Arrimage…',at:A,r:3.5,need:'foot',dur:2,onDone:()=>carry('crate')},{t:'e',title:'Déposer en zone B ('+(i+1)+'/3)',at:B,r:3.5,need:'foot',label:'Déposer la caisse',on:()=>{dropCarry();const g=grp(B.x+(i-1)*1,B.z-1.5,0);bx(g,.8,.55,.6,0xe0732b,0,.28,0);}});}
  steps.push({t:'choice',title:'Pointage',at:()=>chef.g.position,r:3.5,need:'foot',panel:'Pointage',q:'Combien de caisses as-tu déplacées pour le '+code+' ?',opts:()=>shuf([{l:'3 caisses',msg:'Pointage exact.'},{l:'2 caisses',q:.7,msg:'Erreur de pointage.'},{l:'4 caisses',q:.7,msg:'Erreur de pointage.'}])},
    {t:'e',title:'Signer la feuille de vacation',at:()=>chef.g.position,r:3.5,need:'foot',label:'Signer la vacation',on:()=>{reportFlow(m,{title:'Feuille de vacation',lines:['Conteneur '+code,'3 caisses'],msg:'Vacation terminée'});return false;}});
  var m=M_('docker','Conteneur '+code,(j.base+60*j.k)*grade(j),steps);return m;};
SC.serveur=j=>{const T=FIX.tables;if(!T||!T.length)return null;const t=pick(T),who=fullName(),ord=shuf(JB.MENU).slice(0,2+Math.floor(rand(0,2))),price=ord.length*Math.round(rand(3,6))+2;let cl=null;
  const m=M_('serveur','Table '+t.n+' · '+who,(j.base+30*j.k)*grade(j),[
   {t:'go',title:'Prendre son service au Café Aurore',at:FIX.bar,r:4,enter:()=>{cl=npc(m,t.sx,t.sz,-Math.PI/2,null);cl.mode='wave';}},
   {t:'e',title:'Accueillir la table '+t.n,hint:'Un client fait signe',at:t,r:2.6,need:'foot',label:'Saluer la table '+t.n,on:()=>{cl.mode='idle';say(cl.g,'Bonjour ! Je vais prendre : '+ord.join(', ')+'.',6);toast('Commande table '+t.n+' : '+ord.join(' + ')+'. Retiens-la !','warn');}},
   {t:'choice',title:'Transmettre la commande au bar',hint:'De mémoire !',at:FIX.bar,r:2.6,need:'foot',panel:'Bar',q:'Le barista : « Qu’est-ce qu’on prépare pour la '+t.n+' ? »',opts:()=>{const ok=ord.join(' + '),alt=()=>{const o=ord.slice();o[Math.floor(rand(0,o.length))]=pick(JB.MENU.filter(x=>!o.includes(x)));return o.join(' + ');};return shuf([{l:ok,msg:'Commande exacte.'},{l:alt(),q:.55,msg:'Ce n’est pas ce qui a été commandé !'},{l:alt(),q:.55,msg:'Ce n’est pas ce qui a été commandé !'}]);}},
   {t:'wait',title:'Le barista prépare',bar:'Préparation : '+ord.join(', '),at:FIX.bar,r:3,need:'foot',dur:6},
   {t:'e',title:'Prendre le plateau',at:FIX.bar,r:2.6,need:'foot',label:'Prendre le plateau',on:()=>carry('tray')},
   {t:'custom',title:'Servir la bonne table',hint:'Quelle table avait commandé ?',at:null,tick:()=>false,press:(m)=>{const near=T.find(q=>dTo(q)<2.4);if(!near)return false;if(near!==t){m.q*=.8;toast('Ce n’est pas la bonne table !','bad');return true;}dropCarry();say(cl.g,'Merci, ça a l’air délicieux !',3);m.d.served=1;next(m);return true;},prompt:()=>{const near=T.find(q=>dTo(q)<2.4);return near?'Servir la table '+near.n:null;}},
   {t:'wait',title:'Le client mange',bar:'Le client profite de son repas…',at:t,r:30,dur:8},
   {t:'e',title:'Apporter l’addition',hint:'Total '+fmt(price),at:t,r:2.6,need:'foot',label:'Apporter l’addition',on:()=>{cashFlow(m,{amount:price,tip:m.q>=1?rand(1,4):0,who,msg:'Table '+t.n+' encaissée'});return false;}}]);return m;};
SC.facteur=j=>{const PO=FIX.poste,n=4;let p=PO.front;const S=[];for(let i=0;i<n;i++){p=sidewalk(nodeAround(p,30,80));S.push(p);}const rec=Math.floor(rand(0,n));let res=null;
  const steps=[{t:'go',title:'Centre de tri de La Poste',at:PO.front,r:5},{t:'wait',e:true,title:'Trier le courrier de la tournée',label:'Trier le courrier',bar:'Tri par rue et numéro…',at:PO.front,need:'foot',dur:4},{t:'e',title:'Prendre la sacoche',at:PO.front,need:'foot',label:'Prendre la sacoche',on:()=>carry('mail')}];
  S.forEach((s,i)=>{steps.push({t:'e',title:(i===rec?'Recommandé : sonner':'Boîte aux lettres')+' '+(i+1)+'/'+n,hint:addr(),at:s,r:3.2,label:i===rec?'Sonner pour le recommandé':'Déposer le courrier',enter:()=>{const g=grp(s.x,s.z,s.h);cy(g,.05,1,0x6c737b,0,.5,0);bx(g,.4,.32,.3,0xf2c200,0,1.1,0);if(i===rec)res=npc(m,s.x-s.sx*1.4,s.z-s.sz*1.4,s.h,null);},on:()=>{if(i===rec){tone28(660);face(res,player);say(res.g,'C’est pour moi ? Je signe.',3);}else tone28(400);}});
    if(i===rec)steps.push({t:'wait',e:true,title:'Signature du recommandé',label:'Faire signer',bar:'Vérification d’identité et signature…',at:s,r:3.5,need:'foot',dur:3});});
  steps.push({t:'go',title:'Retour au centre de tri',at:PO.front,r:5,exit:()=>dropCarry()},{t:'e',title:'Rendre la sacoche',at:PO.front,need:'foot',label:'Clôturer la tournée',on:()=>{reportFlow(m,{title:'Tournée',lines:[n+' adresses','1 recommandé signé'],msg:'Tournée terminée'});return false;}});
  var m=M_('facteur',pick(j.tasks),(j.base+260*j.k)*grade(j),steps);return m;};
SC.eboueur=j=>{const n=4;let p=sidewalk(nodeAround(player,20,90));const S=[p];for(let i=1;i<n;i++){p=sidewalk(nodeAround(p,40,100));S.push(p);}const DEP={x:690,z:110};let bins=[];
  const steps=[];S.forEach((s,i)=>{const b={x:s.x,z:s.z};steps.push({t:'go',title:'Bac '+(i+1)+'/'+n,hint:'Arrête le camion devant le bac',at:b,r:8,need:'veh',stop:true,enter:()=>{const g=grp(b.x,b.z,0);bx(g,.7,1,.7,0x2e9a6a,0,.5,0);bx(g,.74,.06,.74,0x1f6b4a,0,1.02,0);bins[i]=g;}},
    {t:'wait',e:true,title:'Vider le bac '+(i+1),label:'Accrocher le bac au lève-conteneur',bar:'Vidage du bac…',at:b,r:5,need:'foot',dur:2.5,during:(m,S)=>{const g=bins[i];if(g)g.rotation.x=-Math.sin(S.k*Math.PI)*1.6;},onDone:()=>{const g=bins[i];if(g)g.rotation.x=0;}});});
  steps.push({t:'go',title:'Décharger à la déchetterie',hint:'Zone d’activités',at:DEP,r:16,need:'veh',stop:true},{t:'wait',e:true,title:'Pesée et vidage de la benne',label:'Vider la benne',bar:'Pesée : '+Math.round(rand(1.2,2.6)*10)/10+' t',at:DEP,r:16,need:'foot',dur:5},
    {t:'e',title:'Rendre le bon de pesée',at:DEP,r:16,need:'foot',label:'Remettre le bon',on:()=>{reportFlow(m,{title:'Bon de pesée',lines:[n+' bacs collectés'],msg:'Collecte terminée'});return false;}});
  var m=M_('eboueur',pick(j.tasks),(j.base+300*j.k)*grade(j),steps);return m;};
/* ---------------- branchements ---------------- */
window.M28={
  make(j){if(!SC[j.id]||!started)return null;if(typeof inSol27==='function'&&inSol27())return null;const m=SC[j.id](j);if(!m)return null;const S=m.steps[0];S.k=0;if(S.enter)S.enter(m,S);m.flash=1.2;return m;},
  tick(m,j,dt){m.time+=dt;warnCd-=dt;if(m.tick)m.tick(m,dt);if(mission!==m)return;const S=m.steps[m.ix];if(!S){done28(m,{});return;}
    tickStep(m,S,dt);if(mission!==m)return;const C=m.steps[m.ix];if(!C)return;tickNpcs(m,dt);attachCarry();
    const t=tgt(m,C);m.tgt=t?{x:t.x,z:t.z}:null;m.beamC=C.t==='go'?0xffb84d:C.t==='custom'&&/suspect|foyer/i.test(typeof C.title==='string'?C.title:'')?0xff4d4d:0x58d68d;m.ui=stepUI(m,C);m.addr=m.ui[1];},
  press:press,done:done28,SC,RESTO,FIX,cur:m=>m.steps[m.ix]};
const _int28=interact;interact=function(){const m=mission;if(started&&!paused&&!panelOpen&&!chatOpen&&m&&m.st==='r28'){const S=m.steps[m.ix];
  if(S&&S.t==='custom'&&S.press){const r=S.press(m,S);if(r!==false)return;}else if(S&&press(m))return;}
  _int28();};
const _up28=updatePrompt;updatePrompt=function(){_up28();const m=mission;if(!started||panelOpen||chatOpen||!m||m.st!=='r28')return;const S=m.steps[m.ix];if(!S)return;let t=null;
  if(S.t==='custom'){if(S.prompt)t=S.prompt(m,S);else if(S.press&&m.d.bite>0)t='Ferrer le poisson';}
  else if(S.t==='qte'&&S.run)t=S.ph==='go'?'MAINTENANT !':'Attends le signal…';
  else{const W=wantE(m);if(W)t=W.label||(typeof W.title==='function'?W.title(m,W):W.title);}
  if(t){t='E · '+t;if(t!==promptKey){promptKey=t;const b=$('#prompt');b.hidden=false;b.textContent=t;}}};
const _uh28=updateHud;updateHud=function(){_uh28();try{drawList(mission);}catch(e){}};
const _cw28=collideCarWorld;collideCarWorld=function(c){const h=_cw28(c);const m=mission;if(h>0&&m&&m.st==='r28'&&c===player.car&&Math.abs(c.v)>5&&(m.hitCd||0)<=0){m.hitCd=1;if(m.onHit)m.onHit(m);}return h;};
let lastM=null;const _upd28=update;update=function(dt){_upd28(dt);if(lastM&&lastM!==mission){if(lastM.st==='r28')cleanup(lastM);}lastM=mission;};
const _bd28=buildDecor;buildDecor=function(){_bd28();try{buildFixed28();}catch(e){console.warn('v28 lieux',e);}};
/* Pôle Emploi : description des nouvelles missions */
const DESC={livreur:'Restaurant → attendre la préparation → livrer → encaisser (monnaie, carte, en ligne). Aussi colis et courses.',taxi:'Faire monter le client, lancer le compteur, conduire en douceur, encaisser la course.',police:'Témoin, poursuite, menottes, garde à vue, procès-verbal. Aussi tapage et contrôles.',gendarme:'Contrôles routiers (cônes, papiers, éthylotest) et interpellations.',securite:'Rondes avec badge, incidents, main courante.',ambulancier:'Bilan, premiers gestes, massage cardiaque, brancard, transport, transmission aux urgences.',infirmier:'Visite à domicile, hygiène, choix du soin, feuille de soins.',pompier:'Incendies (lance, foyers, ventilation), sauvetage de chat, fuite de gaz.',bus:'4 arrêts : s’arrêter, ouvrir les portes, laisser monter les voyageurs.',routier:'Quai de chargement, arrimage, livraison, lettre de voiture.',mecanicien:'Diagnostic, devis, pièce chez le fournisseur, réparation, facture.',pompiste:'Accueil, bon carburant, plein, service, encaissement.',pecheur:'Montage de ligne, ferrage, glacière, négociation à la criée.',docker:'Consignes, arrimage, dépôt, pointage, vacation.',serveur:'Accueil, commande de mémoire, bar, service à la bonne table, addition.',facteur:'Tri, sacoche, boîtes aux lettres, recommandé signé.',eboueur:'Arrêts devant les bacs, lève-conteneur, pesée à la déchetterie.'};
Object.keys(DESC).forEach(k=>{if(JB.JINFO[k])JB.JINFO[k]=DESC[k];});
})();
