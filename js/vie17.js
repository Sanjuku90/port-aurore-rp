'use strict';
/* ---------- v17 : la ville vit avec toi ----------
   Inspiré de Lagos Life (départ dans la vie, études et compétences, élection qui change les prix, transports en commun et heures de pointe)
   et de OneState RP (renommée et défis du jour, courses de rue, salle de jeux).
   - Départ dans la vie : Héritier, Standard ou Débrouillard (micro-crédit) au moment de créer son personnage.
   - Compétences (conduite, technique, charisme, commerce, forme) : bibliothèque + expérience en mission, bonus de paie.
   - Élection municipale tous les 2 jours : 3 candidats, sondage en direct, vote à la mairie, campagne, politique appliquée.
   - Renommée (niveaux 1 à 50, titres, primes) et 3 défis du jour.
   - Transports en commun : danfo (minibus), keke (tricycle), okada (moto-taxi), embouteillages aux heures de pointe.
   - Courses de rue au Circuit des Docks : 3 tracés, portiques de passage, médailles et records.
   - Salle de jeux Le Trèfle : machine à sous animée (taux de retour ~97 %), bar.
*/
(function(){
const K='port-aurore-vie17-v1';
const blank=()=>({origin:'standard',debt:0,sk:{},fame:0,chal:{day:-1,list:[]},el:{cycle:-1,poll:null,voted:false,camp:0,mayor:null,hist:[]},best:{},slot:{spins:0,won:0,lost:0}});
let V=blank();
try{const q=JSON.parse(localStorage.getItem(K)||'null');if(q&&typeof q==='object')V=Object.assign(blank(),q);}catch(e){}
const sv=()=>{try{localStorage.setItem(K,JSON.stringify(V));}catch(e){}};
const day=()=>Math.floor(gameMin/1440),hour=()=>(gameMin/60)%24;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ===== départ dans la vie ===== */
const ORIGINS={
  heritier:{n:'Héritier',d:'$4 500 en banque, une berline et le permis B. Mais tout t’a été servi : compétences −25 % d’expérience.',xp:.75,pay:1},
  standard:{n:'Standard',d:'$150 en poche, rien de plus, rien de moins.',xp:1,pay:1},
  debrouillard:{n:'Débrouillard',d:'$60 et un micro-crédit de $300 à rembourser. La rue t’a appris : missions +10 %, expérience +25 %.',xp:1.25,pay:1.1}
};
(function addOriginRow(){
  const col=document.querySelector('#intro .lookcol');if(!col)return;
  const row=document.createElement('div');row.className='look chips';row.id='look-o';row.dataset.k='o';
  row.innerHTML='<small>Départ</small>'+Object.keys(ORIGINS).map(k=>'<button type="button" data-v="'+k+'">'+ORIGINS[k].n+'</button>').join('');
  const hint=document.createElement('p');hint.id='origin17';hint.className='origin17';
  col.appendChild(row);col.appendChild(hint);
  row.addEventListener('click',()=>setTimeout(originHint,0));
})();
function originHint(){const h=$('#origin17');if(!h)return;const o=ORIGINS[look.o]||ORIGINS.standard;h.textContent=o.d;}
function applyOrigin(){
  const o=ORIGINS[look.o]?look.o:'standard';V=blank();V.origin=o;
  if(o==='heritier'){state.bank+=4500;state.license=state.license||{};state.license.auto=true;if(typeof fleetOwned!=='undefined'&&!fleetOwned.includes('sedan')){fleetOwned.push('sedan');saveFleet();}
    setTimeout(()=>toast('Héritier : $4 500 en banque et une berline t’attend au garage personnel.','good'),1200);}
  else if(o==='debrouillard'){state.cash=60;V.debt=300;setTimeout(()=>toast('Débrouillard : micro-crédit de $300, remboursé $30 par jour.','warn'),1200);}
  newChallenges(true);sv();saveProgress();
}
const _bsm=bindStartMenu;bindStartMenu=function(){
  _bsm();
  const pickStd=()=>setTimeout(()=>{const b=document.querySelector('#look-o button[data-v="standard"]');if(b)b.click();originHint();},0);
  ['#new-game','#guide-create'].forEach(s=>{const e=$(s);if(e)e.addEventListener('click',pickStd);});
  $('#intro').addEventListener('submit',()=>applyOrigin());
};

/* ===== compétences ===== */
const SK=[['conduite','Conduite','🚗'],['technique','Technique','🔧'],['charisme','Charisme','🗣️'],['commerce','Commerce','📈'],['forme','Forme','💪']];
const SKX=[0,60,160,300,480,700,960,1260,1600,2000];
const skLv=k=>{const x=V.sk[k]||0;let l=1;SKX.forEach((t,i)=>{if(x>=t)l=i+1;});return l;};
const skNext=k=>{const l=skLv(k);return l>=10?null:SKX[l];};
const JOBSK={livreur:'conduite',taxi:'conduite',bus:'conduite',routier:'conduite',facteur:'conduite',eboueur:'conduite',ambulancier:'conduite',police:'conduite',gendarme:'conduite',mecanicien:'technique',pompiste:'technique',pompier:'technique',docker:'forme',pecheur:'forme',infirmier:'charisme',serveur:'charisme',securite:'charisme'};
function gainSk(k,n){const l0=skLv(k);V.sk[k]=(V.sk[k]||0)+Math.round(n*(ORIGINS[V.origin]||ORIGINS.standard).xp);const l=skLv(k);if(l>l0){const s=SK.find(x=>x[0]===k);toast(s[2]+' '+s[1]+' niveau '+l+' !','good');fameAdd(8);}sv();}
const skMul=j=>{const k=JOBSK[j];return k?1+.03*(skLv(k)-1):1;};

/* ===== renommée ===== */
const TITLES=['Inconnu','Visage du quartier','Habitué','Figure locale','Personnalité','Star montante','Célébrité','Icône','Légende vivante','Star de Port-Aurore'];
const fLv=x=>Math.min(50,Math.floor(Math.sqrt((x==null?V.fame:x)/20))+1);
const fXp=l=>(l-1)*(l-1)*20;
const fTitle=l=>TITLES[Math.min(9,Math.floor((l-1)/5))];
function fameAdd(n){
  const l0=fLv();V.fame+=Math.max(0,Math.round(n*(1+.02*(skLv('charisme')-1))));const l=fLv();
  if(l>l0){const prize=25*l+(l%5===0?500:0);state.cash+=prize;
    toast('★ Renommée niveau '+l+(l%5===0?' · '+fTitle(l):'')+' · prime '+fmt(prize),'good');}
  sv();
}

/* ===== défis du jour ===== */
const CH=[
  ['missions','Termine {n} missions',[2,4],m=>m.done],
  ['drive','Roule {n} km en voiture',[2,4],m=>m.drive/1000],
  ['walk','Marche {n} km à pied',[1,2],m=>m.walk/1000],
  ['earn','Gagne {n} $',[150,400],m=>m.earn],
  ['friend','Fais-toi {n} nouvel ami',[1,1],m=>m.friend],
  ['study','Étudie {n} fois à la bibliothèque',[1,2],m=>m.study],
  ['race','Termine {n} course de rue',[1,1],m=>m.race],
  ['transit','Prends {n} fois les transports en commun',[1,2],m=>m.transit],
  ['civic','Vote ou fais campagne à la mairie',[1,1],m=>m.civic],
  ['slots','Joue {n} parties au Trèfle',[3,6],m=>m.slots]
];
function seeded(s){return()=>{s=(s*9301+49297)%233280;return s/233280;};}
function newChallenges(force){
  const d=day();if(!force&&V.chal.day===d)return;
  const r=seeded(d*7919+(V.origin.length*31)),pool=CH.slice(),list=[];
  while(list.length<3&&pool.length){const c=pool.splice(Math.floor(r()*pool.length),1)[0];const n=Math.round(c[2][0]+r()*(c[2][1]-c[2][0]));
    list.push({id:c[0],n,label:c[1].replace('{n}',n.toLocaleString('fr-FR')).replace('1 nouvel ami','un nouvel ami').replace('1 course','une course'),$:Math.round(60+r()*90),xp:Math.round(40+r()*40),done:false});}
  V.chal={day:d,list,m:{done:0,drive:0,walk:0,earn:0,friend:0,study:0,race:0,transit:0,civic:0,slots:0}};sv();
  if(!force&&started)toast('Nouveaux défis du jour dans l’appli Ma Vie.','good');
}
function bump(k,n){if(!V.chal.m)newChallenges(true);V.chal.m[k]=(V.chal.m[k]||0)+(n==null?1:n);checkChal();}
function checkChal(){
  V.chal.list.forEach(c=>{if(c.done)return;const def=CH.find(x=>x[0]===c.id);if(def&&def[3](V.chal.m)>=c.n){c.done=true;state.cash+=c.$;toast('Défi réussi : '+c.label+' · +'+fmt(c.$),'good');fameAdd(c.xp);}});
}

/* ===== élection municipale ===== */
const CAND=[
  {id:'diallo',n:'Awa Diallo',p:'Le Port d’abord',d:'Missions et salaires +15 %, bénéfices des entreprises −10 %.',c:'#ff7a59',m:{pay:1.15,sal:1.15,biz:.9,transit:1}},
  {id:'lemaire',n:'Victor Lemaire',p:'Ville Prospère',d:'Bénéfices des entreprises +25 %, missions −5 %, transports +20 %.',c:'#5aa9ff',m:{pay:.95,sal:1,biz:1.25,transit:1.2}},
  {id:'mensah',n:'Kofi Mensah',p:'Bouger pour tous',d:'Transports en commun −50 %, missions de conduite +10 %, salaires −5 %.',c:'#58d68d',m:{pay:1,sal:.95,biz:1,transit:.5,drive:1.1}}
];
const CYCLE=2880;
const cyc=()=>Math.floor(gameMin/CYCLE);
const mayor=()=>CAND.find(c=>c.id===V.el.mayor)||null;
const pol=k=>{const m=mayor();return m?(m.m[k]||1):1;};
function freshPoll(){const a=[30+Math.random()*10,30+Math.random()*10,30+Math.random()*10],s=a[0]+a[1]+a[2];return a.map(v=>v/s*100);}
function normPoll(){const p=V.el.poll,s=p.reduce((a,b)=>a+b,0);for(let i=0;i<3;i++)p[i]=Math.max(4,p[i]/s*100);}
function elecTick(){
  const c=cyc();
  if(V.el.cycle<0){V.el.cycle=c;V.el.poll=freshPoll();sv();return;}
  if(c!==V.el.cycle){
    const p=V.el.poll||freshPoll(),score=p.map(v=>v+(Math.random()*6-3));let w=0;score.forEach((v,i)=>{if(v>score[w])w=i;});
    const win=CAND[w],mine=V.el.voted;V.el.mayor=win.id;V.el.hist.unshift({c:V.el.cycle,w:win.id,p:p.map(Math.round)});V.el.hist=V.el.hist.slice(0,5);
    V.el.cycle=c;V.el.poll=freshPoll();V.el.voted=false;V.el.camp=0;sv();
    toast('🗳️ '+win.n+' est élu(e) maire ('+Math.round(p[w])+' %). '+win.d,'good');
    if(mine===win.id)fameAdd(20);
  }
}
let pollT=6;
function pollDrift(dt){pollT-=dt;if(pollT>0||!V.el.poll)return;pollT=6;V.el.poll=V.el.poll.map(v=>v+(Math.random()*1.4-.7));normPoll();}
function vote(i){if(V.el.voted){toast('Tu as déjà voté pour ce scrutin.','warn');return;}V.el.voted=CAND[i].id;V.el.poll[i]+=4;normPoll();bump('civic');fameAdd(15);sv();toast('A voté ! Bulletin pour '+CAND[i].n+'.','good');}
function campaign(i){if(V.el.camp>=3){toast('Tu as déjà fait 3 campagnes ce scrutin.','warn');return;}if(!pay11(100,'Campagne · '+CAND[i].n))return toast('Il faut $100.','warn');
  const g=2+.5*skLv('charisme');V.el.poll[i]+=g;normPoll();V.el.camp++;gainSk('charisme',25);bump('civic');fameAdd(6);sv();toast('Tractage pour '+CAND[i].n+' : +'+g.toFixed(1)+' pts dans les sondages.','good');}
const untilVote=()=>{const m=(V.el.cycle+1)*CYCLE-gameMin,h=Math.floor(m/60),mm=Math.floor(m%60);return h+' h '+String(mm).padStart(2,'0');};

/* ===== effets sur l’économie ===== */
const DRIVE=['taxi','bus','routier','livreur','facteur','eboueur'];
const _nm=newMission;newMission=function(){
  _nm();
  if(mission&&mission.kind!=='crime'&&typeof mission.pay==='number'){
    const j=mission.kind;let k=skMul(j)*pol('pay')*(ORIGINS[V.origin]||ORIGINS.standard).pay;if(DRIVE.includes(j))k*=pol('drive');
    mission.pay=Math.round(mission.pay*k);
  }
};
const _cr=econCreditP58;econCreditP58=function(a,l,t){
  if(typeof l==='string'){
    if(l.indexOf('Salaire')===0&&l.indexOf('mission')<0)a=a*pol('sal');
    else if(l.indexOf('Bénéfice')===0)a=a*pol('biz')*(1+.04*(skLv('commerce')-1));
  }
  return _cr(a,l,t);
};
const _nd=needs;needs=function(dt){_nd(dt*(1-.03*(skLv('forme')-1)));};

/* ===== lieux ===== */
const LOC={mairie17:{x:-240,z:-120,l:'Mairie',c:0xe8e2d4},biblio17:{x:-240,z:150,l:'Bibliothèque',c:0x9a5b3c},casino17:{x:240,z:-160,l:'Le Trèfle · salle de jeux',c:0x1f9d55},race17:{x:240,z:150,l:'Circuit des Docks',c:0xffd23f}};
const anim=[];
const M=(c,r,m,e)=>{const x=new THREE.MeshStandardMaterial({color:c,roughness:r==null?.7:r,metalness:m||0});if(e){x.emissive=new THREE.Color(e);x.emissiveIntensity=.9;}return x;};
function box(w,h,d,x,y,z,mat,col){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);if(col)boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,top:y+h/2});return o;}
function cyl(r,h,x,y,z,mat){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,14),mat);o.position.set(x,y,z);o.castShadow=true;scene.add(o);return o;}
function buildMairie(L){const x=L.x,z=L.z,stone=M(0xe8e2d4,.8),roof=M(0x4a5a6a,.6,.2);
  box(18,8,11,x,4,z-9,stone,true);box(19,.6,12,x,8.3,z-9,roof);
  const tri=new THREE.Shape();tri.moveTo(-9.5,0);tri.lineTo(9.5,0);tri.lineTo(0,2.6);tri.lineTo(-9.5,0);const tg=new THREE.Mesh(new THREE.ExtrudeGeometry(tri,{depth:1.2,bevelEnabled:false}),stone);tg.position.set(x,8.6,z-3.9);tg.castShadow=true;scene.add(tg);
  box(18.6,.5,3,x,8.3,z-2.6,stone);[-7.5,-4.5,-1.5,1.5,4.5,7.5].forEach(dx=>{cyl(.42,7.8,x+dx,4.1,z-2.2,stone);});
  box(18,.4,4,x,.2,z-2.2,M(0xcfc8b8,.9));
  cyl(.08,9,x+11,4.5,z-1,M(0xdddddd,.3,.6));const fl=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.5,8,1),new THREE.MeshStandardMaterial({color:0x2e6fd1,side:THREE.DoubleSide,roughness:.9}));fl.position.set(x+12.2,8.2,z-1);scene.add(fl);anim.push(t=>{const p=fl.geometry.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i);p.setZ(i,Math.sin(t*3+u*2.4)*.18*(u+1.2));}p.needsUpdate=true;});
  addSign('MAIRIE DE PORT-AURORE',x,z-3.2,7.1,11,1.1,'#2b3445','#f3ead8');
}
function buildBiblio(L){const x=L.x,z=L.z,brick=M(0x9a5b3c,.85),glass=M(0x9fd0e8,.15,.3,0x223a44),wood=M(0x6b4a2a,.7);
  box(16,7,11,x,3.5,z-9,brick,true);box(16.4,.5,11.4,x,7.2,z-9,M(0x3a2a22,.7));
  box(12,3.4,.2,x,3.4,z-3.45,glass);[-6,-3,0,3,6].forEach(dx=>box(.3,3.6,.4,x+dx,3.4,z-3.4,wood));
  const cols=[0xd94f4f,0x3d7be0,0xe0b34a,0x4fb58a,0x8a5fc9];for(let i=0;i<5;i++)box(3.2,.55,2.2,x+6.6,.3+i*.56,z-1.6,M(cols[i],.6)).rotation.y=i*.18;
  addSign('BIBLIOTHÈQUE',x,z-3.4,6,9,1.1,'#f3ead8','#5a2f1c');
}
function buildCasino(L){const x=L.x,z=L.z,dark=M(0x14201a,.5,.3);
  box(16,7,13,x,3.5,z-10,dark,true);
  const neon=M(0x0b3d22,.3,0,0x23e07a),gold=M(0x2a2410,.3,.5,0xffc93c);
  box(14,.25,.25,x,6.6,z-3.4,neon);box(14,.25,.25,x,.9,z-3.4,neon);
  const bulbs=[];for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),M(0x3a3000,.3,0,0xffd23f));b.position.set(x-6.5+i,6.15,z-3.35);scene.add(b);bulbs.push(b);}
  anim.push(t=>bulbs.forEach((b,i)=>{b.material.emissiveIntensity=((Math.floor(t*4)+i)%3===0)?1.6:.15;}));
  const clover=new THREE.Group();[[0,.75],[.75,0],[0,-.75],[-.75,0]].forEach(([a,b])=>{const h=new THREE.Mesh(new THREE.SphereGeometry(.9,14,10),neon);h.position.set(a,b,0);h.scale.z=.3;clover.add(h);});
  const st=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.6,8),neon);st.position.set(.5,-1.5,0);st.rotation.z=.5;clover.add(st);clover.position.set(x,9.2,z-3.8);scene.add(clover);anim.push(t=>{clover.rotation.y=Math.sin(t*.8)*.5;});
  box(1.4,2,.2,x+6.6,7.9,z-3.6,gold);
  addSign('LE TRÈFLE',x,z-3.4,4.6,9,1.4,'#0d2a18','#5dff9d');
}
function buildCircuit(L){const x=L.x,z=L.z,steel=M(0x2b2f36,.4,.6);
  cyl(.35,7,x-7,3.5,z-2,steel);cyl(.35,7,x+7,3.5,z-2,steel);
  const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');for(let i=0;i<32;i++)for(let j=0;j<6;j++){g.fillStyle=(i+j)%2?'#111':'#f4f4f4';g.fillRect(i*16,j*16,16,16);}
  g.fillStyle='rgba(10,10,10,.82)';g.fillRect(96,22,320,52);g.fillStyle='#ffd23f';g.font='700 40px Rajdhani, Arial Narrow, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('CIRCUIT DES DOCKS',256,50);
  const ban=new THREE.Mesh(new THREE.BoxGeometry(14.6,2.4,.3),[steel,steel,steel,steel,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)})]);ban.position.set(x,6.6,z-2);scene.add(ban);
  for(let i=0;i<4;i++)box(14,.6,1.6,x,.3+i*.6,z-9-i*1.6,M(i%2?0x3a404a:0x4a515c,.8),true);
  [-5,-1.5,2,5.5].forEach((dx,i)=>{const t=box(.8,1.1,.8,x+dx,.55,z+4,M(i%2?0xf4f4f4:0xd94f4f,.6));t.rotation.y=.3;});
}
const _bp=buildPhase2;buildPhase2=function(){_bp();
  try{buildMairie(LOC.mairie17);buildBiblio(LOC.biblio17);buildCasino(LOC.casino17);buildCircuit(LOC.race17);}catch(e){console.warn('v17 décor',e);}
  Object.keys(LOC).forEach(id=>{const L=LOC[id];addSpot(L.x,L.z,id,L.c,L.l);});
};
const _os=openSpot;openSpot=function(id){
  if(id==='mairie17'){mairiePanel();return;}
  if(id==='biblio17'){biblioPanel();return;}
  if(id==='casino17'){casinoPanel();return;}
  if(id==='race17'){racePanel();return;}
  _os(id);
};
function mairiePanel(){
  const m=mayor(),p=V.el.poll;
  openPanel('Mairie de Port-Aurore',(m?'Maire : '+m.n+' · « '+m.p+' ». ':'Pas encore de maire élu. ')+'Prochain dépouillement dans '+untilVote()+'. Sondage : '+CAND.map((c,i)=>c.n.split(' ')[1]+' '+Math.round(p[i])+' %').join(' · ')+'.',
    CAND.map((c,i)=>({label:'Voter '+c.n+' · '+c.p,off:!!V.el.voted,fn:()=>vote(i)})).concat(
    CAND.map((c,i)=>({label:'Faire campagne pour '+c.n.split(' ')[1]+' · $100',off:V.el.camp>=3||state.cash+state.bank<100,fn:()=>campaign(i)}))));
}
function biblioPanel(){
  const can=state.energy>=15,cost=25;
  openPanel('Bibliothèque','Une séance d’étude dure 1 h 30 et coûte '+fmt(cost)+'. Énergie : '+Math.round(state.energy)+'.',
    SK.map(s=>({label:s[2]+' Étudier : '+s[1]+' (niv. '+skLv(s[0])+')',off:!can||skLv(s[0])>=10||state.cash+state.bank<cost,fn:()=>{if(!pay11(cost,'Bibliothèque'))return;gameMin+=90;state.energy=Math.max(0,state.energy-8);state.hunger=Math.max(0,state.hunger-5);gainSk(s[0],45);bump('study');fameAdd(4);toast('Séance d’étude terminée : +'+s[1]+'.','good');}}))
    .concat([{label:'📖 Lire un roman · gratuit',off:state.fun>=95,fn:()=>{gameMin+=45;state.fun=Math.min(100,state.fun+12);toast('Bonne lecture. +12 humeur','good');}}]));
}

/* ===== salle de jeux : machine à sous ===== */
const SYM=[['🐟',6,7],['⚓',4,12],['🔔',3,22],['💎',2,45],['🍀',1.2,90],['7️⃣',.6,250]],SW=SYM.reduce((a,s)=>a+s[1],0);
const roll=()=>{let r=Math.random()*SW;for(const s of SYM){r-=s[1];if(r<=0)return s;}return SYM[0];};
function payout(a,b,c){if(a===b&&b===c)return a[2];const k=[a,b,c].filter(s=>s[0]==='🍀').length;return k===2?4:k===1?1:0;}
function casinoPanel(){
  if(blackout>0){toast('Coupure de courant : machines éteintes.','warn');return;}
  openPanel('Le Trèfle','Salle de jeux du quartier est. Joue avec ton cash, jamais plus que ce que tu peux perdre.',[
    {label:'🎰 Machine à sous',fn:()=>setTimeout(openSlots,0)},
    {label:'🍹 Cocktail au bar · $6',off:state.cash<6,fn:()=>{state.cash-=6;state.fun=Math.min(100,state.fun+8);if(typeof state.thirst==='number')state.thirst=Math.min(100,state.thirst+15);toast('Santé ! +8 humeur','good');}}]);
}
let SL=null;
function openSlots(){
  if(!SL){
    SL=document.createElement('div');SL.id='slot17';SL.hidden=true;
    SL.innerHTML='<div class="sl-box"><div class="sl-top"><b>LE TRÈFLE</b><span id="sl-cash"></span></div><div class="sl-reels"><i></i><i></i><i></i></div><div id="sl-msg" class="sl-msg">Choisis ta mise</div><div class="sl-bets"></div><div class="sl-act"><button type="button" id="sl-spin" class="primary">Lancer</button><button type="button" id="sl-close" class="ghost">Quitter</button></div><div class="sl-pay">🍀 ×1 · 🍀🍀 ×4 · 🐟🐟🐟 ×7 · ⚓⚓⚓ ×12 · 🔔🔔🔔 ×22 · 💎💎💎 ×45 · 🍀🍀🍀 ×90 · 7️⃣7️⃣7️⃣ ×250</div></div>';
    $('#app').appendChild(SL);
    const bets=SL.querySelector('.sl-bets');[10,50,100].forEach(v=>{const b=document.createElement('button');b.type='button';b.textContent='$'+v;b.dataset.v=v;b.onclick=()=>{SL.bet=v;bets.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));slRefresh();};bets.appendChild(b);});
    SL.bet=10;bets.firstChild.classList.add('on');
    SL.querySelector('#sl-spin').onclick=spin;SL.querySelector('#sl-close').onclick=()=>closePanel();
    SL.querySelectorAll('.sl-reels i').forEach(r=>r.textContent=pick(SYM)[0]);
    addEventListener('keydown',e=>{if(!SL.hidden&&(e.key===' '||e.key==='Enter')){e.preventDefault();e.stopPropagation();spin();}},true);
  }
  panelOpen=true;SL.hidden=false;slRefresh();
}
function slRefresh(){if(!SL)return;$('#sl-cash').textContent='Cash '+fmt(state.cash);const b=$('#sl-spin');b.disabled=!!SL.busy||state.cash<SL.bet;b.textContent=SL.busy?'…':'Lancer · $'+SL.bet;}
function spin(){
  if(!SL||SL.busy||SL.hidden)return;const bet=SL.bet;if(state.cash<bet){$('#sl-msg').textContent='Pas assez de cash.';return;}
  state.cash-=bet;SL.busy=true;slRefresh();const res=[roll(),roll(),roll()],reels=[...SL.querySelectorAll('.sl-reels i')];
  $('#sl-msg').textContent='…';$('#sl-msg').className='sl-msg';
  reels.forEach((r,i)=>{r.classList.add('spin');const iv=setInterval(()=>{r.textContent=pick(SYM)[0];},70);
    setTimeout(()=>{clearInterval(iv);r.textContent=res[i][0];r.classList.remove('spin');r.classList.add('stop');setTimeout(()=>r.classList.remove('stop'),220);tone(420+i*140,.08,'square',.04);
      if(i===2){const m=payout(...res),win=bet*m;state.cash+=win;V.slot.spins++;if(win>bet)V.slot.won+=win-bet;else V.slot.lost+=bet-win;bump('slots');
        const msg=$('#sl-msg');if(m>=22){msg.textContent='JACKPOT ! +'+fmt(win);msg.className='sl-msg big';fameAdd(15);tone(880,.3,'triangle',.08);tone(1320,.4,'triangle',.06,.18);}
        else if(win>bet){msg.textContent='Gagné ! +'+fmt(win);msg.className='sl-msg win';}else if(win===bet){msg.textContent='Mise remboursée';}else msg.textContent='Perdu. Le trèfle tourne…';
        SL.busy=false;slRefresh();sv();}},650+i*380);});
}
const _cp=closePanel;closePanel=function(){if(SL&&!SL.hidden){SL.hidden=true;SL.busy=false;}_cp();};

/* ===== transports en commun ===== */
const TR=[['danfo','Danfo','🚐','Minibus jaune, pas cher, s’arrête partout.',2,.018,6,2],['keke','Keke','🛺','Tricycle, se faufile un peu.',3,.032,8,1.4],['okada','Okada','🏍️','Moto-taxi, rapide, ignore les bouchons. Un peu risqué.',4,.05,11,1]];
const rush=()=>{const h=hour();return(h>=7&&h<9.5)||(h>=17&&h<19.5);};
function appTransit(b){
  const r=rush(),m=mayor();
  const c=mk('div','bigc');c.appendChild(mk('small',null,r?'Heure de pointe':'Trafic fluide'));c.appendChild(mk('b',null,r?'Go-slow 🚦':'Ça roule'));c.appendChild(mk('span',null,(m&&m.m.transit!==1?'Politique du maire : tarifs ×'+m.m.transit+' · ':'')+'Embouteillages 7h-9h30 et 17h-19h30'));b.appendChild(c);
  const sel=TR[b._m||0];const tabs=mk('div','qr');TR.forEach((t,i)=>{const x=mk('button','pbtn'+(t===sel?' hot':''),t[2]+' '+t[1],()=>{b.innerHTML='';b._m=i;appTransit(b);});tabs.appendChild(x);});b.appendChild(tabs);
  b.appendChild(mk('p','dim',sel[3]));
  spots.filter(s=>Math.abs(s.x)<=256&&Math.abs(s.z)<=256&&s.id!=='exit').map(s=>({s,d:Math.hypot(s.x-player.x,s.z-player.z)})).filter(o=>o.d>25).sort((a,b)=>a.d-b.d).forEach(({s,d})=>{
    const price=Math.max(1,Math.round((sel[4]+d*sel[5])*pol('transit'))),mins=Math.round(d/sel[6]*(r?sel[7]:1)+3);
    const x=mk('button','prow',null,()=>ride(sel,s,price,mins));x.appendChild(mk('b',null,s.label));x.appendChild(mk('span',null,fmt(price)+' · '+mins+' min · '+Math.round(d)+' m'));x.disabled=state.cash<price;b.appendChild(x);});
}
function ride(t,s,price,mins){
  if(blackout>0&&t[0]!=='okada'){toast('Pas de réseau pour commander.','warn');return;}
  if(player.car){toast('Descends de ta voiture d’abord.','warn');return;}
  if(player.inside){toast('Sors du bâtiment d’abord.','warn');return;}
  if(mission&&mission.kind==='crime'){toast('Pas en pleine mission.','warn');return;}
  if(state.cash<price)return;state.cash-=price;closePanel();
  player.x=s.x;player.z=s.z+2.5;gameMin+=mins;state.energy=Math.max(0,state.energy-mins*.03);
  if(t[0]==='danfo'&&rush())state.fun=Math.max(0,state.fun-4);
  bump('transit');fameAdd(2);
  if(t[0]==='okada'&&Math.random()<.08){state.health=Math.max(5,state.health-8);toast('Okada : petite chute en route ! −8 santé. Arrivé à '+s.label+'.','warn');}
  else toast(t[2]+' '+t[1]+' : arrivé à '+s.label+' ('+mins+' min).','good');
}

/* ===== courses de rue ===== */
const RACES=[
  {id:'quais',n:'Sprint des Quais',fee:40,pts:[[160,160],[32,160],[-96,160],[-96,96],[32,96],[160,96],[160,160]]},
  {id:'centre',n:'Boucle du Centre',fee:80,pts:[[160,96],[160,-32],[32,-32],[32,-160],[-96,-160],[-96,32],[32,32],[32,96],[160,96]]},
  {id:'tour',n:'Grand Tour d’Aurore',fee:150,pts:[[160,160],[160,-224],[-224,-224],[-224,160],[160,160]]}
];
RACES.forEach(r=>{let l=Math.hypot(r.pts[0][0]-LOC.race17.x,r.pts[0][1]-LOC.race17.z);for(let i=1;i<r.pts.length;i++)l+=Math.hypot(r.pts[i][0]-r.pts[i-1][0],r.pts[i][1]-r.pts[i-1][1]);r.len=l;r.gold=Math.round(l/19);r.silver=Math.round(l/15.5);r.bronze=Math.round(l/12);});
let race=null;const gates=[];
function gateMesh(col,big){const g=new THREE.Group();const m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:big?.9:.4,fog:false});
  const t=new THREE.Mesh(new THREE.TorusGeometry(big?5.6:4.6,big?.32:.22,8,40),m);t.position.y=big?5.8:4.8;g.add(t);
  const p=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,40,10,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.18,depthWrite:false,fog:false}));p.position.y=20;g.add(p);g.visible=false;scene.add(g);return g;}
function showGates(){
  if(!gates.length){gates.push(gateMesh(0xffd23f,true),gateMesh(0xffffff,false));}
  const P=race.r.pts,i=race.i,cur=P[i],nxt=P[i+1],prev=i>0?P[i-1]:[LOC.race17.x,LOC.race17.z];
  const fin=i===P.length-1;gates[0].children[0].material.color.setHex(fin?0x58d68d:0xffd23f);
  gates[0].visible=true;gates[0].position.set(cur[0],0,cur[1]);gates[0].rotation.y=Math.atan2(cur[0]-prev[0],cur[1]-prev[1]);
  if(nxt){gates[1].visible=true;gates[1].position.set(nxt[0],0,nxt[1]);gates[1].rotation.y=Math.atan2(nxt[0]-cur[0],nxt[1]-cur[1]);}else gates[1].visible=false;
  wp={x:cur[0],z:cur[1],l:(fin?'Arrivée':'Portique '+(i+1)+'/'+P.length)+' · '+race.r.n};
}
function hideGates(){gates.forEach(g=>g.visible=false);}
let raceCard=null;
function raceHud(){
  if(!raceCard){raceCard=document.createElement('div');raceCard.id='race17';raceCard.className='card';$('#hud').appendChild(raceCard);}
  if(!race){raceCard.hidden=true;return;}raceCard.hidden=false;
  const t=race.cd>0?Math.ceil(race.cd):race.t,r=race.r,med=race.t<=r.gold?'🥇':race.t<=r.silver?'🥈':race.t<=r.bronze?'🥉':'⏱';
  raceCard.innerHTML=race.cd>0?'<b class="cd">'+t+'</b><span>'+esc(r.n)+'</span>':'<b>'+med+' '+race.t.toFixed(1)+' s</b><span>'+esc(r.n)+' · portique '+(race.i+1)+'/'+r.pts.length+'</span><small>🥇 '+r.gold+' s · 🥈 '+r.silver+' s · 🥉 '+r.bronze+' s'+(V.best[r.id]?' · record '+V.best[r.id].toFixed(1)+' s':'')+'</small>';
}
function racePanel(){
  if(!player.car){toast('Les courses se font en voiture : monte dans un véhicule et reviens au circuit.','warn');return;}
  if(race){toast('Course déjà en cours.','warn');return;}
  openPanel('Circuit des Docks','Passe tous les portiques jaunes, le plus vite possible. Les gardiens du circuit chronomètrent. Collisions autorisées, mais le chrono tourne.',
    RACES.map(r=>({label:r.n+' · '+(r.len/1000).toFixed(1).replace('.',',')+' km · mise '+fmt(r.fee)+(V.best[r.id]?' · record '+V.best[r.id].toFixed(1)+' s':''),off:state.cash+state.bank<r.fee||!!mission,fn:()=>startRace(r)})));
}
function startRace(r){
  if(!player.car||mission)return;if(!pay11(r.fee,'Course · '+r.n))return;
  race={r,i:0,t:0,cd:3,x:player.car.x,z:player.car.z,lastCd:4};
  toast('Mise de '+fmt(r.fee)+' engagée. Prépare-toi…','warn');showGates();raceHud();
}
function endRace(ok,why){
  const r=race.r,t=race.t;race=null;hideGates();wp=null;raceHud();missionCd=4;
  if(!ok){toast('Course abandonnée'+(why?' : '+why:'')+'.','bad');return;}
  const medal=t<=r.gold?3:t<=r.silver?2:t<=r.bronze?1:0,mult=[0,1.4,2.2,3.2][medal],win=Math.round(r.fee*mult);
  const rec=!V.best[r.id]||t<V.best[r.id];if(rec)V.best[r.id]=t;
  if(win)econCreditP58(win,'Course · '+r.n,false);
  bump('race');gainSk('conduite',10+medal*8);fameAdd(10+medal*10);sv();
  toast((medal?['','🥉 Bronze','🥈 Argent','🥇 Or'][medal]+' · '+t.toFixed(1)+' s · +'+fmt(win):'Hors délai · '+t.toFixed(1)+' s')+(rec?' · nouveau record !':''),medal?'good':'warn');
  tone(660,.15,'triangle',.07);tone(990,.25,'triangle',.06,.15);
}
function raceStep(dt){
  if(!race)return;const c=player.car;
  if(!c){endRace(false,'tu es descendu du véhicule');return;}
  if(race.cd>0){race.cd-=dt;const s=Math.ceil(race.cd);if(s!==race.lastCd&&s>0){race.lastCd=s;tone(520,.12,'square',.05);}
    if(Math.hypot(c.x-race.x,c.z-race.z)>6){race.cd=3;race.lastCd=4;race.x=c.x;race.z=c.z;toast('Faux départ ! Reste immobile pendant le compte à rebours.','warn');}
    if(race.cd<=0){tone(1040,.3,'square',.06);toast('GO !','good');}
    missionCd=5;return;}
  race.t+=dt;missionCd=5;
  const p=race.r.pts[race.i];
  if(Math.hypot(c.x-p[0],c.z-p[1])<10){race.i++;tone(760+race.i*20,.08,'sine',.06);if(race.i>=race.r.pts.length){endRace(true);return;}showGates();}
  if(race.t>race.r.bronze*1.8)endRace(false,'temps limite dépassé');
}
const _int=interact;interact=function(){
  if(started&&!paused&&!panelOpen&&!chatOpen&&player.car&&!race&&Math.abs(player.car.v)<3&&Math.hypot(player.x-LOC.race17.x,player.z-LOC.race17.z)<14){racePanel();return;}
  _int();
};
const _upr=updatePrompt;updatePrompt=function(){
  _upr();
  if(started&&!panelOpen&&!chatOpen&&player.car&&!race&&!player.inside&&Math.abs(player.car.v)<3&&Math.hypot(player.x-LOC.race17.x,player.z-LOC.race17.z)<14){const txt='E · Courses de rue';if(promptKey!==txt){promptKey=txt;const b=$('#prompt');b.hidden=false;b.textContent=txt;}}
};

/* ===== appli téléphone : Ma Vie ===== */
function bar(p,col){const o=mk('div','v17bar');const i=mk('i');i.style.width=Math.round(clamp(p,0,1)*100)+'%';if(col)i.style.background=col;o.appendChild(i);return o;}
function appVie(b){
  const l=fLv(),cur=fXp(l),nx=fXp(l+1);
  const c=mk('div','bigc');c.appendChild(mk('small',null,'Renommée · niveau '+l));c.appendChild(mk('b',null,fTitle(l)));c.appendChild(bar(l>=50?1:(V.fame-cur)/(nx-cur),'#ffd23f'));
  c.appendChild(mk('span',null,l>=50?'Niveau maximum':(nx-V.fame)+' pts avant le niveau '+(l+1)+' · prime tous les 5 niveaux'));b.appendChild(c);
  b.appendChild(mk('small',null,'Défis du jour'));
  V.chal.list.forEach(ch=>{const def=CH.find(x=>x[0]===ch.id),v=def?def[3](V.chal.m||{}):0,r=mk('div','prow'+(ch.done?' v17done':''));
    r.appendChild(mk('b',null,(ch.done?'✓ ':'')+ch.label));r.appendChild(mk('span',null,ch.done?'Réussi':(Math.floor(Math.min(v,ch.n)*10)/10).toLocaleString('fr-FR')+' / '+ch.n.toLocaleString('fr-FR')+' · +'+fmt(ch.$)+' · +'+ch.xp+' renommée'));if(!ch.done)r.appendChild(bar(v/ch.n));b.appendChild(r);});
  b.appendChild(mk('small',null,'Compétences · bibliothèque à l’ouest'));
  SK.forEach(s=>{const l=skLv(s[0]),x=V.sk[s[0]]||0,n=skNext(s[0]),r=mk('div','prow');r.appendChild(mk('b',null,s[2]+' '+s[1]+' · niv. '+l));
    r.appendChild(mk('span',null,{conduite:'Paie des métiers de la route +',technique:'Paie des métiers techniques +',charisme:'Paie des métiers de contact + ',commerce:'Bénéfices des entreprises +',forme:'Besoins qui baissent moins vite −'}[s[0]].trim()+((l-1)*(s[0]==='commerce'?4:3))+' %'));
    r.appendChild(bar(n?(x-SKX[l-1])/(n-SKX[l-1]):1));b.appendChild(r);});
  const o=ORIGINS[V.origin]||ORIGINS.standard,oc=mk('div','prow');oc.appendChild(mk('b',null,'Départ : '+o.n));oc.appendChild(mk('span',null,V.debt>0?'Micro-crédit restant : '+fmt(V.debt)+' · $30 prélevés chaque jour':o.d));b.appendChild(oc);
  if(V.debt>0){const x=mk('button','pbtn hot','Rembourser '+fmt(Math.min(V.debt,100)),()=>{const a=Math.min(V.debt,100);if(pay11(a,'Micro-crédit')){V.debt-=a;sv();if(V.debt<=0){toast('Micro-crédit soldé ! Bravo.','good');fameAdd(25);}phOpen(phApp);}});x.disabled=state.cash+state.bank<Math.min(V.debt,100);b.appendChild(x);}
  const rk=RACES.filter(r=>V.best[r.id]);if(rk.length){b.appendChild(mk('small',null,'Records du circuit'));rk.forEach(r=>{const x=mk('div','prow');x.appendChild(mk('b',null,r.n));x.appendChild(mk('span',null,V.best[r.id].toFixed(1)+' s'));b.appendChild(x);});}
}
function appMairie(b){
  const m=mayor();const c=mk('div','bigc');c.appendChild(mk('small',null,'Maire en exercice'));c.appendChild(mk('b',null,m?m.n:'Intérim'));c.appendChild(mk('span',null,m?'« '+m.p+' » · '+m.d:'Aucune politique particulière. Premier dépouillement à venir.'));b.appendChild(c);
  b.appendChild(mk('small',null,'Sondage en direct · dépouillement dans '+untilVote()));
  CAND.forEach((cd,i)=>{const r=mk('div','prow');r.appendChild(mk('b',null,cd.n+' · '+Math.round(V.el.poll[i])+' %'+(V.el.voted===cd.id?' · ton vote':'')));r.appendChild(mk('span',null,'« '+cd.p+' » '+cd.d));r.appendChild(bar(V.el.poll[i]/100,cd.c));b.appendChild(r);});
  b.appendChild(mk('p','dim',V.el.voted?'Tu as voté. Tu peux encore faire campagne (3 fois max, $100).':'Le vote se fait en personne à la mairie (quartier ouest).'));
  b.appendChild(mk('button','pbtn hot','GPS vers la mairie',()=>{wp={x:LOC.mairie17.x,z:LOC.mairie17.z,l:'Mairie'};toast('GPS vers la Mairie','good');closePanel();}));
  if(V.el.hist.length){b.appendChild(mk('small',null,'Anciens scrutins'));V.el.hist.forEach(h=>{const w=CAND.find(c=>c.id===h.w);b.appendChild(mk('div','prow',(w?w.n:'?')+' élu(e) · '+h.p.join(' / ')+' %'));});}
}
APPS.push(['Ma Vie','🌟','#ffd23f,#ff7a59',appVie],['Mairie','🗳️','#e8e2d4,#5b6b8c',appMairie],['Transports','🚐','#ffd23f,#2e9a6a',appTransit]);

/* ===== HUD ===== */
let hud=null;
const _uh=updateHud;updateHud=function(){_uh();
  if(!hud){const st=$('#stats');if(!st)return;hud=document.createElement('div');hud.id='v17hud';st.appendChild(hud);}
  const m=mayor(),l=fLv(),left=V.chal.list.filter(c=>!c.done).length;
  hud.innerHTML='<span>★ '+l+' · '+esc(fTitle(l))+'</span><span>'+(left?'🎯 '+left+' défi'+(left>1?'s':''):'🎯 ✓')+'</span>'+(m?'<span>🗳️ '+esc(m.n.split(' ')[1])+'</span>':'')+(rush()&&!player.inside?'<span class="w">🚦 Go-slow</span>':'');
  raceHud();
};

/* ===== boucle ===== */
let lx=null,lz=null,lFr=null,lDone=null,lEarn=null,dayT=-1;
const _u=update;update=function(dt){
  if(started&&!paused)raceStep(dt);
  _u(dt);
  if(!started)return;
  const d=day();if(dayT<0)dayT=d;
  if(d!==dayT){dayT=d;newChallenges(false);if(V.debt>0){const a=Math.min(30,V.debt);if(state.bank>=a){state.bank-=a;V.debt-=a;if(typeof econTxP58==='function')econTxP58('Micro-crédit',-a,'Banque');if(V.debt<=0){toast('Micro-crédit soldé !','good');fameAdd(25);}}else{V.debt+=5;toast('Micro-crédit : prélèvement refusé, pénalité de $5.','warn');}sv();}}
  else newChallenges(false);
  elecTick();pollDrift(dt);
  if(lx!=null){const dd=Math.hypot(player.x-lx,player.z-lz);if(dd<20&&dd>0){if(player.car)bump('drive',dd);else if(!player.inside)bump('walk',dd);}}
  lx=player.x;lz=player.z;
  if(lFr==null){lFr=state.friends.length;lDone=state.done;lEarn=state.earned;}
  if(state.friends.length>lFr){bump('friend',state.friends.length-lFr);fameAdd(10);}lFr=state.friends.length;
  if(state.done>lDone){const n=state.done-lDone;bump('missions',n);fameAdd(6*n);const k=JOBSK[state.job];if(k)gainSk(k,12*n);}lDone=state.done;
  if(state.earned>lEarn)bump('earn',state.earned-lEarn);lEarn=state.earned;
  for(const f of anim)f(performance.now()/1000);
};
const _sp=saveProgress;saveProgress=function(){_sp();if(started)sv();};
const _rs=resetProgress;resetProgress=function(){try{localStorage.removeItem(K);}catch(e){}V=blank();_rs();};

/* ===== version ===== */
CHANGELOG.unshift(['v17','Départ dans la vie, compétences et bibliothèque, élection municipale, renommée et défis, danfo/keke/okada, courses de rue, salle de jeux · ajouts co-conçus avec ClickUp Brain']);
const _bph=bindPhone;bindPhone=function(){_bph();const s=document.querySelector('.intro h1 span');if(s)s.textContent='JEU DE RÔLE · v17';};
const _aset=appSet;appSet=function(b){_aset(b);b.querySelectorAll('.bigc b').forEach(x=>{if(x.textContent===VERSION)x.textContent='v17';});};
window.V17={get state(){return V;},fLv,skLv,startRace,RACES,LOC,openSlots,vote,campaign};
})();
