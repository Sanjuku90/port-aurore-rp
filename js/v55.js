'use strict';
/* ==========================================================================
   v55 · MINICARTE, DÉGÂTS DU VÉHICULE, COFFRE & BIDONS
   1. Minicarte « navigation » : tourne avec la caméra (la flèche pointe
      toujours vers le haut), maison, GPS, repère N cohérent avec la carte.
   2. Les chocs n'enlèvent plus de santé : c'est le véhicule qui s'abîme
      (c.damage 0‑100, déjà lié à Aurore Motors). Il perd en vitesse et en
      accélération, fume, tire d'un côté, puis passe en mode dégradé.
      Réparation : station‑service (prix selon les dégâts) ou atelier.
   3. Bidons d'essence : supérette, station (à l'unité ou par 3), rangés dans
      le sac ou déposés dans le COFFRE du véhicule (6 max, conservé pour les
      véhicules personnels). Réservoir vide : un bidon est versé tout seul.
   ========================================================================== */
(function(){
const q=s=>document.querySelector(s);
const cl=(v,a,b)=>v<a?a:v>b?b:v;
const TRUNK_CAP=6,KEY='port-aurore-v55';
const V=window.V55={};
let ST={trunk:{}};
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.trunk&&typeof s.trunk==='object')ST=s;}catch(e){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(ST));}catch(e){}};

/* ---------------- véhicule visé : celui au volant, sinon le plus proche (≤ 9 m) ---------------- */
function target(){
  if(player.car)return player.car;
  let b=null,bd=9;
  cars.forEach(c=>{if(c.kind==='npc'||c.lock53)return;const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<bd){bd=d;b=c;}});
  return b;
}
function carKey(c){return c.am?'am:'+c.am:(c.owned&&c.type?'fl:'+c.type:null);}
function trunkN(c){if(c.trunkB==null){const k=carKey(c);c.trunkB=k?(ST.trunk[k]|0):0;}return c.trunkB|0;}
function setTrunk(c,n){c.trunkB=cl(n|0,0,TRUNK_CAP);const k=carKey(c);if(k){ST.trunk[k]=c.trunkB;persist();}}
const bagN=()=>(P3.inv.bidon|0);
function bagTake(){P3.inv.bidon=(P3.inv.bidon|0)-1;if(P3.inv.bidon<=0)delete P3.inv.bidon;}
const fuelOf=c=>c.fuel==null?100:c.fuel;
function save(){if(typeof saveProgress==='function')try{saveProgress();}catch(e){}}

/* ---------------- coffre ---------------- */
V.trunk=function(){
  const c=target();
  if(!c){toast('Approche-toi de ton véhicule pour ouvrir le coffre.','warn');return;}
  const n=trunkN(c),bag=bagN(),fuel=Math.round(fuelOf(c)),full=fuel>=95,own=!!carKey(c);
  openPanel('Coffre du véhicule',
    'Coffre : '+n+' / '+TRUNK_CAP+' bidon(s) · sac : '+bag+' · réservoir '+fuel+' % · état du véhicule '+(100-Math.round(c.damage||0))+' %.'+(own?'':' Véhicule non personnel : le coffre ne sera pas conservé.'),
    [
      {label:'Déposer un bidon du sac dans le coffre',off:!bag||n>=TRUNK_CAP,fn:()=>{bagTake();setTrunk(c,n+1);toast('Bidon déposé dans le coffre.','good');save();V.trunk();}},
      {label:'Reprendre un bidon du coffre dans le sac',off:!n||inv()>=CAP,fn:()=>{setTrunk(c,n-1);P3.inv.bidon=bagN()+1;toast('Bidon repris dans le sac.','good');save();V.trunk();}},
      {label:'Verser un bidon du coffre dans le réservoir (+40 %)',off:!n||full,fn:()=>{setTrunk(c,n-1);c.fuel=Math.min(100,fuelOf(c)+40);toast('Bidon versé : carburant '+Math.round(c.fuel)+' %.','good');save();V.trunk();}},
      {label:'Verser un bidon du sac dans le réservoir (+40 %)',off:!bag||full,fn:()=>{bagTake();c.fuel=Math.min(100,fuelOf(c)+40);toast('Bidon versé : carburant '+Math.round(c.fuel)+' %.','good');save();V.trunk();}}
    ]);
};
/* entrée « Coffre » dans le sac, seulement si un véhicule est à portée */
V.sacExtra=function(){
  const c=target();if(!c)return [];
  return [{label:'🧰 Coffre du véhicule · '+trunkN(c)+' bidon(s)',fn:V.trunk}];
};
/* packs de bidons (station, supérette) : dans le coffre si possible, sinon dans le sac */
V.packOpts=function(re){
  const c=target(),room=c?TRUNK_CAP-trunkN(c):0,free=CAP-inv(),toTrunk=room>=3,price=54;
  return [{label:'Pack de 3 bidons · $'+price+(toTrunk?' (rangés dans le coffre)':' (dans le sac)'),off:state.cash<price||(!toTrunk&&free<3),
    fn:()=>{if(state.cash<price)return;
      if(toTrunk){setTrunk(c,trunkN(c)+3);}else{if(CAP-inv()<3)return;P3.inv.bidon=bagN()+3;}
      state.cash-=price;toast('3 bidons d’essence '+(toTrunk?'dans le coffre.':'dans le sac.'),'good');save();if(re)re();}}];
};

/* ---------------- dégâts : le véhicule encaisse, pas le joueur ---------------- */
V.crash=function(c,sp){
  const t=String(c.type||''),heavy=/bus|truck|firetruck/.test(t),lean=/motorcycle|scooter/.test(t);
  let d=(sp-5.5)*1.9;if(heavy)d*=.55;if(lean)d*=1.15;d=cl(d,2,38);
  const before=c.damage||0;c.damage=cl(before+d,0,100);
  toast('Choc ! Carrosserie −'+Math.round(d)+' % · état '+Math.round(100-c.damage)+' %','bad');
  if(before<50&&c.damage>=50)toast('Le moteur fume. Fais-le réparer : station-service ou atelier.','warn');
  if(before<90&&c.damage>=90)toast('Véhicule très abîmé : vitesse réduite. Direction un garage !','warn');
  if(window.HUD45&&HUD45.shake)HUD45.shake(Math.min(.8,sp/30));
};
V.repairCost=c=>Math.round(10+(c.damage||0)*.8);

/* ---------------- fumée du moteur (sprites réutilisés) ---------------- */
const SM={pool:[],tex:null,acc:0};
function smokeTex(){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,30);
  g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.5,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
function puff(c,dark){
  if(!SM.tex)SM.tex=smokeTex();
  let s=SM.pool.find(p=>!p.userData.on);
  if(!s&&SM.pool.length<28){s=new THREE.Sprite(new THREE.SpriteMaterial({map:SM.tex,transparent:true,depthWrite:false,opacity:0}));s.userData={on:false,t:0,life:1.3};scene.add(s);SM.pool.push(s);}
  if(!s)return;
  const fx=Math.sin(c.h),fz=Math.cos(c.h),u=s.userData;
  u.on=true;u.t=0;u.life=1.1+Math.random()*.6;u.vx=(Math.random()-.5)*.8;u.vz=(Math.random()-.5)*.8;u.vy=1.3+Math.random()*.7;
  s.material.color.setHex(dark?0x2a2a2a:0xa4a8ac);
  s.position.set(c.x+fx*1.5+(Math.random()-.5)*.5,.95,c.z+fz*1.5+(Math.random()-.5)*.5);s.scale.set(.6,.6,.6);s.visible=true;
}
function smokeStep(dt){
  const c=player.car;
  if(c&&!(window.AM&&AM.V)){const dm=(c.damage||0)/100;
    if(dm>=.5){SM.acc+=dt*(dm-.4)*16;while(SM.acc>=1){SM.acc-=1;puff(c,dm>=.8);}}}
  SM.pool.forEach(s=>{const u=s.userData;if(!u.on)return;u.t+=dt;const k=u.t/u.life;
    if(k>=1){u.on=false;s.visible=false;s.material.opacity=0;return;}
    s.position.x+=u.vx*dt;s.position.z+=u.vz*dt;s.position.y+=u.vy*dt;
    const sc=.6+k*2.3;s.scale.set(sc,sc,sc);s.material.opacity=(1-k)*.55;});
}

/* ---------------- pastille « état du véhicule » + bidons ---------------- */
let chip=null;
function buildChip(){
  const hud=q('#hud');if(!hud||chip)return;
  chip=document.createElement('button');chip.type='button';chip.id='v55-car';chip.setAttribute('aria-label','État du véhicule et coffre');
  chip.innerHTML='<span class="w">🔧</span><i class="bar"><u></u></i><b class="pc">100 %</b><span class="bd"></span>';
  hud.appendChild(chip);
  const open=e=>{e.preventDefault();e.stopPropagation();V.trunk();};
  chip.addEventListener('pointerdown',e=>{e.stopPropagation();});
  chip.addEventListener('click',open);
}
let chipT=0,autoAt=0;
function chipStep(now){
  if(now-chipT<200)return;chipT=now;
  buildChip();if(!chip)return;
  const c=player.car;if(!c)return;
  const cond=Math.round(100-(c.damage||0)),bar=chip.querySelector('.bar u'),pc=chip.querySelector('.pc'),bd=chip.querySelector('.bd');
  bar.style.width=cond+'%';pc.textContent=cond+' %';
  chip.classList.toggle('mid',cond<75&&cond>=40);chip.classList.toggle('bad',cond<40);chip.classList.toggle('crit',cond<12);
  const n=trunkN(c)+bagN();bd.textContent=n?'⛽×'+n:'';
  /* réservoir vide : un bidon est versé tout seul (coffre d'abord, puis sac) */
  if(fuelOf(c)<=.4&&now>autoAt&&!(typeof panelOpen!=='undefined'&&panelOpen)){
    autoAt=now+2500;
    if(trunkN(c)>0){setTrunk(c,trunkN(c)-1);c.fuel=40;toast('Réservoir vide : un bidon du coffre est versé automatiquement (+40 %).','good');save();}
    else if(bagN()>0){bagTake();c.fuel=40;toast('Réservoir vide : un bidon du sac est versé automatiquement (+40 %).','good');save();}
  }
}

/* ---------------- minicarte « navigation » ---------------- */
let zoom=108;
function house(g,x,y,r,edge){
  g.save();g.translate(x,y);g.globalAlpha=edge?.92:1;
  g.fillStyle='rgba(14,18,28,.88)';g.beginPath();g.arc(0,0,r,0,7);g.fill();g.lineWidth=1.5;g.strokeStyle='rgba(255,255,255,.55)';g.stroke();
  g.fillStyle='#ffb02e';g.beginPath();g.moveTo(0,-r*.62);g.lineTo(r*.68,-r*.02);g.lineTo(r*.46,-r*.02);g.lineTo(r*.46,r*.52);g.lineTo(-r*.46,r*.52);g.lineTo(-r*.46,-r*.02);g.lineTo(-r*.68,-r*.02);g.closePath();g.fill();
  g.fillStyle='#10131a';g.fillRect(-r*.13,r*.12,r*.26,r*.4);
  g.restore();
}
function navMap(){
  const cv=document.getElementById('mini');if(!cv||typeof player==='undefined')return;
  const g=cv.getContext('2d'),S=cv.width,car=player.car;
  const spd=car?Math.abs(car.spd!=null?car.spd:car.v||0):0,zt=car?112+Math.min(72,spd*2.4):100;zoom+=(zt-zoom)*.1;
  const k=S/zoom,phi=camYaw+Math.PI,cs=Math.cos(phi),sn=Math.sin(phi),px=player.x,pz=player.z,R=MAP_R;
  const X=v=>(v-px)*k,Y=v=>(v-pz)*k,near=(x,z,m)=>Math.abs(x-px)<zoom*m&&Math.abs(z-pz)<zoom*m;
  g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.fillStyle='#0f1b27';g.fillRect(0,0,S,S);
  g.save();g.translate(S/2,S/2);g.rotate(phi);
  /* mer */
  g.fillStyle='#123d5b';g.fillRect(X(-R-400),Y(222),(R+400)*2*k,900*k);g.fillStyle='#1b6581';g.fillRect(X(-R-400),Y(214),(R+400)*2*k,8*k);
  /* quartiers */
  for(let i=-3;i<=3;i++)for(let j=-3;j<=2;j++){const x=i*64,z=j*64;if(!near(x,z,.95))continue;
    let col=z<-50?'#34473c':z>50?'#304452':'#39434c';if(i===0&&j===-2)col='#276248';if(i===0&&j===0)col='#484c50';
    g.fillStyle=col;g.fillRect(X(x-25),Y(z-25),50*k,50*k);}
  /* bâtiments */
  g.fillStyle='#778087';
  boxes.forEach(b=>{if(!b.big||!near((b.x0+b.x1)/2,(b.z0+b.z1)/2,.95))return;g.fillRect(X(b.x0),Y(b.z0),Math.max(1,(b.x1-b.x0)*k),Math.max(1,(b.z1-b.z0)*k));});
  /* routes */
  g.lineCap='round';g.strokeStyle='#8a9197';g.lineWidth=Math.max(2,9*k);
  roadC.forEach(v=>{g.beginPath();g.moveTo(X(v),Y(-R));g.lineTo(X(v),Y(R));g.stroke();g.beginPath();g.moveTo(X(-R),Y(v));g.lineTo(X(R),Y(v));g.stroke();});
  LOTS.forEach(l=>{if(!near(l[0],l[1],.95))return;g.fillStyle='#202a32';g.fillRect(X(l[0]-l[2]/2),Y(l[1]-l[3]/2),l[2]*k,l[3]*k);});
  /* lieux */
  spots.forEach(s=>{if(!near(s.x,s.z,.8))return;g.fillStyle='#'+s.color.toString(16).padStart(6,'0');g.beginPath();g.arc(X(s.x),Y(s.z),Math.max(2.4,S/62),0,7);g.fill();g.lineWidth=1.1;g.strokeStyle='rgba(255,255,255,.9)';g.stroke();});
  if(mission){const t=mission.stage==='pickup'?mission.pickup:mission.drop;if(t){g.fillStyle=mission.stage==='pickup'?'#ffb84d':'#58d68d';g.strokeStyle='#fff';g.lineWidth=2.4;g.beginPath();g.arc(X(t.x),Y(t.z),S/34,0,7);g.fill();g.stroke();}}
  if(wp){g.setLineDash([S/40,S/50]);g.strokeStyle='#6cc6ff';g.lineWidth=Math.max(2,S/80);g.beginPath();g.moveTo(0,0);g.lineTo(X(wp.x),Y(wp.z));g.stroke();g.setLineDash([]);}
  g.restore();
  /* repères collés au bord quand ils sont hors de la carte */
  const pin=(x,z,draw)=>{const dx=x-px,dz=z-pz;let sx=(cs*dx-sn*dz)*k,sy=(sn*dx+cs*dz)*k;const l=Math.hypot(sx,sy),m=S/2-S*.085;let edge=false;if(l>m){sx*=m/l;sy*=m/l;edge=true;}draw(S/2+sx,S/2+sy,edge);};
  const home=spots.find(s=>s.id==='home');
  if(home)pin(home.x,home.z,(x,y,e)=>house(g,x,y,S*.075,e));
  if(wp)pin(wp.x,wp.z,(x,y,e)=>{g.save();g.globalAlpha=e?.92:1;g.fillStyle='#6cc6ff';g.strokeStyle='#fff';g.lineWidth=2.2;g.beginPath();g.arc(x,y,S*.05,0,7);g.fill();g.stroke();g.fillStyle='#0b2a3d';g.beginPath();g.arc(x,y,S*.017,0,7);g.fill();g.restore();});
  /* flèche du joueur : toujours vers le haut quand la caméra suit le véhicule */
  g.save();g.translate(S/2,S/2);g.rotate(camYaw-(car?car.h:player.h));
  g.fillStyle='#fff';g.strokeStyle='#0d1118';g.lineWidth=S*.014;g.lineJoin='round';
  const a=S*.085;g.beginPath();g.moveTo(0,-a*1.25);g.lineTo(a*.9,a);g.lineTo(0,a*.45);g.lineTo(-a*.9,a);g.closePath();g.stroke();g.fill();
  g.restore();
}
V.navMap=navMap;V.smokeCount=()=>SM.pool.filter(s=>s.userData.on).length;
if(typeof updateMini==='function')updateMini=function(){try{navMap();}catch(e){}};

/* ---------------- boucle ---------------- */
let last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.1,(now-last)/1000);last=now;
  if(typeof started==='undefined'||!started||typeof player==='undefined')return;
  try{if(!(typeof paused!=='undefined'&&paused))smokeStep(dt);chipStep(now);}catch(e){}
}
requestAnimationFrame(frame);
})();
