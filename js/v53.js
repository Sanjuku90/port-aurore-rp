'use strict';
/* ==========================================================================
   v53 · Simplicité, départ à pied + scooter, motos, chantiers, décor
   - le pilote apparaît bien sur la moto / le scooter
   - départ : toujours devant la maison, avec un seul scooter ; les voitures
     des autres sont verrouillées
   - 5 nouvelles motos (styles visuels propres)
   - voitures 3D détaillées (GLB) : Golf GTI Mk1, Honda NSX, BMW M4 GT3 (js/glb53.js)
   - chantier terminé : on peut entrer dans le bâtiment ; engins retirés
   - décor : arbres, bancs, lampadaires… autour des bâtiments et dans les vides
   - téléphone : doublons masqués (Banque, Plan, Boulot, Vols, Véhicules…)
   - bandeau d’aide rapide (objectif du moment)
   ========================================================================== */
(function(){
const V=window.V53={};
const isMoto=c=>!!c&&(c.type==='motorcycle'||c.type==='scooter');
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const mt=(c,r,m,e)=>{const o={color:c,roughness:r==null?.6:r,metalness:m||0};if(e){o.emissive=e;o.emissiveIntensity=1.2;}return new THREE.MeshStandardMaterial(o);};

/* ---------------- 1. téléphone : doublons masqués ---------------- */
const HID=['banque','plan','boulot','vols','vehicules','business','guide lagune'];
window.HIDE53=n=>HID.includes(norm(n));
try{if(typeof DOCK25!=='undefined'){const i=DOCK25.indexOf('Plan');if(i>=0&&APPS.some(a=>a[0]==='Aurore GPS'))DOCK25[i]='Aurore GPS';}}catch(e){}

/* ---------------- 2. décoration des motos (styles) ---------------- */
function styOf(c){const AM=window.AM;if(!AM||!AM.ST)return null;let m=null;
  if(c.am){const r=AM.ST.cars.find(q=>q.id===c.am);m=r&&AM.byId[r.m];}
  if(!m&&AM.testDrive&&AM.testDrive.c===c)m=AM.testDrive.m;return m&&m.sty;}
function deco(c){
  if(!c||!c.mesh||c.mesh.userData.deco53||c.type!=='motorcycle')return;const sty=styOf(c);if(!sty)return;c.mesh.userData.deco53=1;
  const g=c.mesh,chrome=mt(0xd5d9de,.25,.9),blk=mt(0x16181b,.7,.2),glass=new THREE.MeshStandardMaterial({color:0x9fd0ff,roughness:.05,transparent:true,opacity:.35});
  const A=(w,h,d,x,y,z,m,rx)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);if(rx)o.rotation.x=rx;o.castShadow=true;g.add(o);return o;};
  const Y=(r,l,x,y,z,m,rx)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,10),m);o.position.set(x,y,z);o.rotation.x=rx==null?Math.PI/2:rx;o.castShadow=true;g.add(o);return o;};
  if(sty==='cruiser'){const ac=mt(0x8a1c1c,.35,.5);
    A(1.05,.05,.05,0,1.62,.78,chrome);[-.45,.45].forEach(x=>A(.05,.3,.05,x,1.5,.8,chrome));
    A(.4,.35,.06,0,1.62,-.95,blk);[-.42,.42].forEach(x=>A(.22,.34,.7,x,1.0,-.75,blk));
    [-.32,.32].forEach(x=>Y(.06,1.5,x,.62,-.35,chrome));A(.5,.06,.9,0,.98,-1.0,ac);A(.6,.05,.5,0,1.62,.25,ac);}
  else if(sty==='trail'){const ac=mt(0xe8731a,.45,.2);
    A(.5,.45,.04,0,1.95,.95,glass,-.5);A(.2,.1,.5,0,1.1,1.35,ac,.3);A(.5,.04,.7,0,1.52,-1.0,blk);A(.5,.42,.5,0,1.78,-1.05,ac);
    [-.5,.5].forEach(x=>A(.06,.2,.22,x,1.6,.85,blk));A(.3,.1,.8,0,.45,.15,mt(0x8a929a,.4,.8));}
  else if(sty==='cafe'){const ac=mt(0x2f5d3a,.35,.4);
    A(.7,.04,.04,0,1.42,.88,chrome);A(.3,.2,.6,0,1.55,-.95,ac,.15);Y(.2,.04,.33,1.1,.2,mt(0xf2f2f0,.5),0);Y(.2,.04,-.33,1.1,.2,mt(0xf2f2f0,.5),0);
    [-.22,.22].forEach(x=>A(.02,.3,.9,x,1.2,.2,mt(0xf4efe0,.5)));}
  else if(sty==='naked'){const ac=mt(0xf2c200,.35,.3);
    [-.2,.2].forEach(x=>{const e=Y(.07,1.2,x,.95,-.8,chrome);e.rotation.x=Math.PI/2-.45;});
    A(.3,.18,.7,0,.58,.1,blk);A(.3,.04,.04,0,1.62,1.06,mt(0xffffff,.2,0,0xffffff));[-.22,.22].forEach(x=>A(.02,.26,.8,x,1.18,.25,ac));}
  else if(sty==='electro'){const bl=mt(0x1b8cff,.3,.2,0x1b8cff);
    A(.42,.4,.8,0,.85,.1,mt(0x20262e,.5,.4));A(.02,.04,1.4,-.3,.95,0,bl);A(.02,.04,1.4,.3,.95,0,bl);A(.4,.03,.03,0,1.5,1.05,bl);}
}

/* ---------------- 2b. Voitures 3D détaillées (modèles GLB : Golf, NSX, M4 GT3) ---------------- */
const GLB_CARS={golf76:1,nsx19:1,m4gt3:1},glbOf=new WeakMap();
function modelOf(c){const AM=window.AM;if(!AM||!AM.ST)return null;let m=null,r=null;
  if(c.am){r=AM.ST.cars.find(q=>q.id===c.am);m=r&&AM.byId[r.m];}
  if(!m&&AM.testDrive&&AM.testDrive.c===c)m=AM.testDrive.m;return m?{m,r}:null;}
function glbColor(c,o){const AM=window.AM,r=o.r;   /* peinture choisie : atelier > carnet > teinte d’essai > teinte par défaut */
  if(r&&r.mods&&r.mods.color!=null)return r.mods.color;if(r&&r.color!=null)return r.color;
  if(V.testCol!=null&&AM.testDrive&&AM.testDrive.c===c)return V.testCol;return AM.COLS[o.m.col[0]][0];}
function glbCar(c){
  if(!c||!c.mesh||c.mesh.userData.glb53||!window.GLB53)return;const o=modelOf(c);if(!o||!GLB_CARS[o.m.id])return;c.mesh.userData.glb53=1;
  GLB53.make(o.m.id,glbColor(c,o)).then(g=>{c.mesh.children.slice().forEach(ch=>{ch.visible=false;});c.mesh.add(g);glbOf.set(c.mesh,g);c.mesh.userData.wheels=g.userData.wheels;c.mesh.userData.steer=[];})
    .catch(e=>{c.mesh.userData.glb53=0;console.warn('v53 glb',e);});
}
try{const AM=window.AM;if(AM&&AM.startTest){const _st=AM.startTest;AM.startTest=function(m,col){V.testCol=col;return _st.apply(this,arguments);};}}catch(e){}
try{const AMC=window.AMC;if(AMC&&AMC.apply){const _ap=AMC.apply;AMC.apply=function(mesh,mods){const r=_ap.apply(this,arguments);   /* repeinture à chaud d’un modèle GLB */
  try{const g=glbOf.get(mesh);if(g&&mods&&mods.color!=null)GLB53.paint(g,mods.color);}catch(e){}return r;};}}catch(e){}
const _en=enterCar;enterCar=function(c){
  if(c&&c.lock53){toast('🔒 Ce véhicule appartient à quelqu’un. Prends ton scooter ou achète le tien.','warn');return;}
  try{deco(c);glbCar(c);}catch(e){}
  _en(c);
  if(isMoto(c)&&player.mesh)player.mesh.visible=true;   /* correctif : le pilote reste visible sur la moto */
};
try{const AM=window.AM;if(AM&&AM.spawnRec){const _sr=AM.spawnRec;AM.spawnRec=function(){const c=_sr.apply(this,arguments);try{deco(c);glbCar(c);}catch(e){}return c;};}}catch(e){}

/* ---------------- 3. boucle : pilote assis, verrouillage, aide ---------------- */
let tipT=0,tipEl=null;
function tip(){
  if(!tipEl){const h=document.getElementById('hud');if(!h)return;tipEl=document.createElement('div');tipEl.id='tip53';
    tipEl.style.cssText='position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);left:50%;transform:translateX(-50%);max-width:min(78vw,520px);padding:7px 14px;border-radius:999px;background:rgba(8,16,34,.78);color:#fff;font:600 13px Inter,system-ui,sans-serif;z-index:6;text-align:center;pointer-events:none;backdrop-filter:blur(6px)';h.appendChild(tipEl);}
  let t='';
  if(player.inside)t='🚪 Cherche la sortie en bas de la pièce pour ressortir.';
  else if(player.car)t=(window.DRV54&&DRV54.touch)?(isMoto(player.car)?'🏍️':'🚗')+' Flèches pour tourner · NITRO ⚡ · 🚪 pour descendre':(isMoto(player.car)?'🏍️':'🚗')+' ZQSD conduire · Espace drift · Maj nitro · E descendre';
  else if(typeof nearCar!=='undefined'&&nearCar)t='🛵 ACTION : monter sur ton véhicule';
  else if(!state.job)t='🎯 Objectif : trouve un travail au Pôle Emploi (repère jaune). 🗺️ pour t’y rendre.';
  else if(wp)t='📍 Suis la ligne bleue jusqu’au repère.';
  else t='';
  tipEl.textContent=t;tipEl.style.display=t&&!panelOpen&&!chatOpen?'':'none';
}
const _up=updatePlayer;updatePlayer=function(dt){
  if(started&&!V.marked){V.marked=1;cars.forEach(c=>{if(c.kind==='parked'&&!c.owned&&!c.am&&!c.company&&!c.ride26)c.lock53=true;});V.fillN=0;V.t0=performance.now();}
  if(V.marked&&!V.filled&&(++V.fillN>20||performance.now()-V.t0>2000))fill();
  _up(dt);
  const c=player.car;
  if(c&&isMoto(c)&&player.mesh){const m=player.mesh,s=Math.sin(c.h),co=Math.cos(c.h);
    m.visible=true;m.rotation.order='YXZ';m.position.set(c.x-s*.3,c.type==='scooter'?.46:.55,c.z-co*.3);
    m.rotation.y=c.h;m.rotation.x=.3;m.rotation.z=0;try{animPerson(m,0,0,false);}catch(e){}}
  if(started){tipT-=dt;if(tipT<=0){tipT=.4;try{tip();}catch(e){}}}
};

/* ---------------- 4. nouvelle partie : à la maison avec un scooter ---------------- */
V.newGame=function(){
  try{
    const h=spots.find(s=>s.id==='home'),hx=h?h.x:0,hz=h?h.z:18;
    const p={x:hx,z:hz+4.5};pushAABB(p,.6);player.x=p.x;player.z=p.z;player.h=Math.PI;camYaw=Math.PI;
    const q={x:hx+3.8,z:hz+4.5};pushAABB(q,1);
    const AM=window.AM;
    if(AM&&AM.byId&&AM.byId.urbano&&AM.newRec){const m=AM.byId.urbano,r=AM.newRec(m,AM.COLS[m.col[0]][0],'cash','scooter','out');r.price=0;AM.ST.cars.push(r);AM.spawnRec(r,q.x,q.z,Math.PI/2);AM.save();}
    else{const c=addCar(q.x,q.z,Math.PI/2,0x3d7be0,'parked','scooter');c.owned=true;c.fuel=100;}
    setTimeout(()=>toast('Bienvenue ! Ton scooter t’attend devant chez toi : approche-toi et appuie sur ACTION.','good'),900);
  }catch(e){console.warn('v53 newGame',e);}
};

/* ---------------- 5. chantiers terminés : entrer dans le bâtiment ---------------- */
let roomN=0;
function siteRoom(s){
  const id='v53:'+s.id;if(ROOMS[id])return ROOMS[id];
  const T=type23(s.type),fw=s.fw||(T.fw&&T.fw[s.size])||[12,9];const info=()=>s.lotId?openCh23(s.lotId):toast('Rien à signaler : tout est en ordre ici.','good');
  const W=Math.max(9,Math.min(24,fw[0])),D=Math.max(8,Math.min(14,fw[1])),H=T.warehouse?6:3.1;
  const rx=14000+(roomN++)*60,rz=14000,R=roomCtx(id,rx,rz,H);R.name=T.name+' · intérieur';R.sp=[];
  const wl=mt(0xece7dc,.9),wl2=mt(T.wall||0xd7c3a5,.85),fl=mt(T.warehouse?0x8a8f94:T.shop?0xc9c2b4:0x9b7b57,.7);
  R.floor(-W/2,-D/2,W/2,D/2,fl,2);R.ceil(-W/2,-D/2,W/2,D/2,mt(0xf4f1ea,.95));
  R.wall(-W/2,-D/2,W/2,-D/2,wl,wl2,[{k:'window',t:W*.28,w:2.4,y0:1.0,y1:H>4?4.6:2.5,out:1},{k:'window',t:W*.72,w:2.4,y0:1.0,y1:H>4?4.6:2.5,out:1}],{th:.18});
  R.wall(-W/2,D/2,W/2,D/2,wl2,wl,[{k:'door',t:W/2,w:1.8,open:false}],{th:.18});
  R.wall(-W/2,-D/2,-W/2,D/2,wl2,wl,[],{th:.18});R.wall(W/2,-D/2,W/2,D/2,wl,wl2,[],{th:.18});
  const bx=(w,h,d,x,y,z,m,col)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);o.castShadow=o.receiveShadow=true;R.G.add(o);if(col)R.col(x,z,w,d);return o;};
  const wood=mt(0x7a5a3a,.7),fab=mt(0x4d6a8a,.9),white=mt(0xf2f2ee,.5),dark=mt(0x2a2d31,.6),col=[0xd94f4f,0x4fb58a,0xe0b34a,0x5aa9ff,0xc79bff];
  if(T.warehouse){
    for(let i=-2;i<=2;i++){if(Math.abs(i*4)>W/2-2)continue;bx(.12,4.2,D*.55,i*4-1,0,-D*.12,mt(0x3a6fb0,.5,.3),true);bx(.12,4.2,D*.55,i*4+1,0,-D*.12,mt(0x3a6fb0,.5,.3),true);
      for(let l=0;l<3;l++)for(let k=0;k<3;k++)bx(1.5,.9,1.1,i*4,.3+l*1.4,-D*.12-D*.17+k*D*.17,mt(col[(i+l+k+9)%5],.8),false);}
    bx(1.4,1.3,2.2,W/2-2.5,0,D/2-3.5,mt(0xf2b705,.5),true);bx(.1,.02,D-2,0,.01,0,mt(0xf2c200,.6),false);
    R.light(-W/4,H-.5,0,12,0xfff2dc);R.light(W/4,H-.5,0,12,0xfff2dc);
    R.int(0,-D/2+1.6,'Entrepôt · état du bien',info,{r:2.2});
  }else if(T.shop){
    bx(4,1.05,.9,-W/4,0,D/2-4,wood,true);bx(.5,.3,.4,-W/4+1,1.05,D/2-4,dark,false);
    for(let r=0;r<3;r++)for(let k=0;k<3;k++){bx(.5,1.9,D*.28,-W/2+2+k*2.4,0,-D/4+(r%2)*.4,white,true);for(let l=0;l<4;l++)bx(.4,.28,D*.24,-W/2+2+k*2.4,.35+l*.45,-D/4+(r%2)*.4,mt(col[(r+k+l)%5],.7),false);break;}
    for(let k=0;k<3;k++){bx(.5,1.9,D*.3,-W/2+2+k*2.6,0,-D*.18,white,true);for(let l=0;l<4;l++)bx(.4,.28,D*.26,-W/2+2+k*2.6,.35+l*.45,-D*.18,mt(col[(k+l)%5],.7),false);}
    bx(1,.9,.6,W/2-2,0,-D/2+1,dark,true);
    R.light(-W/4,H-.4,0,9,0xfff2dc);R.light(W/4,H-.4,0,9,0xfff2dc);
    R.int(-W/4,D/2-5.2,'Commerce · état du bien',info,{r:2.2});
  }else if(s.type==='immeuble'){
    bx(3.4,1.05,.9,0,0,-D/2+2.2,dark,true);bx(3.6,.08,1,0,1.05,-D/2+2.2,wood,false);
    for(let i=0;i<8;i++)bx(.34,.26,.08,-W/2+1.4+(i%4)*.42,1.1+Math.floor(i/4)*.34,-D/2+.35,mt(0xc9ced4,.4,.8),false);
    bx(1.6,2.4,.12,W/2-2,0,-D/2+.3,mt(0x9aa3ab,.3,.9),false);
    const n=Math.min(5,(typeof T.floors==='object'?T.floors[s.size]:T.floors)||4);
    for(let i=0;i<n;i++){bx(1.3,.5,.5,W/2-2.6-i*.3,i*.5,D/2-3.2-i*.5,mt(0xb8b2a6,.8),i===n-1);}
    [-1,1].forEach(sd=>{for(let k=0;k<3;k++){bx(.1,2.1,1.1,sd*(W/2-.12),0,-D/2+3+k*2.5,mt(col[(k+(sd>0?2:0))%5],.6),false);}});
    bx(2,.04,3,0,.01,0,mt(0x7a2f2f,.9),false);[-W/2+1,W/2-1].forEach(x=>bx(.6,1.1,.6,x,0,D/2-1.2,mt(0x3d7a4a,.9),true));
    R.light(-W/4,H-.4,0,9,0xfff2dc);R.light(W/4,H-.4,0,9,0xfff2dc);
    R.int(0,-D/2+3.4,'Hall · loyers et locataires',info,{r:2.4});
    R.int(W/2-3,-D/2+1.4,'Ascenseur · visiter un étage',()=>toast('Les étages sont loués à tes locataires. Les loyers tombent chaque jour.','good'),{r:1.6});
  }else{
    bx(2.3,.55,.95,-W/4,0,D/2-3.4,fab,true);bx(2.3,.55,.25,-W/4,.55,D/2-3.9,fab,false);bx(1.2,.4,.7,-W/4,0,D/2-5,wood,true);
    bx(2,.5,.1,-W/4,.9,-D/2+.4,dark,false);bx(2.2,.5,.5,-W/4,0,-D/2+.6,wood,true);
    bx(.7,1.9,W*.14,-W/2+.5,0,0,white,true);bx(.7,.9,W*.14,-W/2+.5,0,-D*.3,wood,true);
    bx(2,.5,1.6,W/2-2.2,0,-D/2+1.6,mt(0xe9dfcf,.9),true);bx(.7,.5,.5,W/2-.9,0,-D/2+.6,wood,true);bx(1.2,1.9,.6,W/2-.9,0,-D/2+2.8,wood,true);
    bx(1.8,.75,1,W/4,0,D/2-3.6,wood,true);[[-1.2,0],[1.2,0],[0,-.9],[0,.9]].forEach(a=>bx(.45,.5,.45,W/4+a[0],0,D/2-3.6+a[1],mt(0xc9a36a,.8),false));
    bx(3,.03,2,-W/4,.01,D/2-4.2,mt(0xb0453a,.95),false);bx(.7,.6,.7,0,0,D/2-1.4,mt(0x3d7a4a,.9),false);
    R.light(-W/4,H-.4,0,9,0xffe2b8);R.light(W/4,H-.4,0,9,0xffe2b8);
    R.int(-W/4,D/2-3.4,'Canapé · se reposer',()=>{state.energy=Math.min(100,state.energy+8);toast('Tu te reposes un moment. +8 énergie','good');},{r:1.6});
    R.int(W/2-2.2,-D/2+2.4,'Lit · dormir un peu',()=>{state.energy=Math.min(100,state.energy+15);toast('Une petite sieste. +15 énergie','good');},{r:1.7});
    R.int(0,-D/2+1.2,'Infos du logement',info,{r:2});
  }
  R.entry={x:0,z:D/2-1.5,h:Math.PI};R.b=[rx-W/2+.4,rx+W/2-.4,rz-D/2+.4,rz+D/2-.4];
  R.int(0,D/2-.7,'Sortir du bâtiment',()=>leaveInterior(),{exit:1,r:1.7});
  R.G.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});ROOMS[id]=R;return R;
}
V.enterSite=function(s){
  try{const l=lot23(s.lotId),R=siteRoom(s);const sp=spots.find(q=>q.id==='lot23:'+s.lotId)||{x:player.x,z:player.z};
    enterInterior({id:R.id,x:sp.x,z:sp.z+3});}catch(e){console.warn('v53 enterSite',e);toast('Impossible d’entrer pour le moment.','warn');}
};
const _os=openSpot;openSpot=function(id){
  if(typeof id==='string'&&id.startsWith('lot23:')){const lid=id.slice(6),s=site23(lid);
    if(s&&s.done){const T=type23(s.type);
      openPanel(T.name+' terminé','Le chantier est fini. Entre pour visiter ton bâtiment ou gère les loyers.',[
        {label:'🚪 Entrer dans le bâtiment',fn:()=>{closePanel();V.enterSite(s);}},
        {label:'📋 Gérer le bien (loyers, locataires)',fn:()=>openCh23(lid)}]);return;}}
  _os(id);
};


/* ---------------- 5b. façades sans porte : entrée générique ---------------- */
let nearBld=null;
const ENTER_TXT='E · Entrer dans le bâtiment';
function genEnter(b){
  const w=b.x1-b.x0,d=b.z1-b.z0,h=Math.abs(Math.round(b.x0*7+b.z0*13));
  const type=w*d>700?'entrepot':['maison','commerce','immeuble','commerce','maison'][h%5];
  const s={id:'g'+Math.round(b.x0)+'_'+Math.round(b.z0),lotId:null,type,size:'M',done:true,fw:[Math.min(w,22),Math.min(d,13)]};
  try{const R=siteRoom(s);enterInterior({id:R.id,x:player.x,z:player.z});}catch(e){console.warn('v53 gen',e);}
}
const _upr=updatePrompt;updatePrompt=function(){
  _upr();nearBld=null;
  if(!started||player.inside||player.car||panelOpen||chatOpen||promptKey)return;
  for(let i=0;i<boxes.length;i++){const b=boxes[i];if(b.room||Math.abs(b.x0)>9500)continue;const w=b.x1-b.x0,d=b.z1-b.z0;
    if(w<7||d<7||w>70||d>70)continue;
    if(player.x>b.x0-2.3&&player.x<b.x1+2.3&&player.z>b.z0-2.3&&player.z<b.z1+2.3){nearBld=b;break;}}
  if(nearBld){promptKey=ENTER_TXT;const pr=document.getElementById('prompt');pr.hidden=false;pr.textContent=ENTER_TXT;}
};
const _int=interact;interact=function(){
  if(nearBld&&started&&!paused&&!panelOpen&&!chatOpen&&!player.inside&&promptKey===ENTER_TXT){const b=nearBld;nearBld=null;genEnter(b);return;}
  _int();
};

/* ---------------- 6. décor : on comble les espaces vides ---------------- */
V.fill=fill;
function fill(){
  if(V.filled||typeof scene==='undefined'||!scene)return;V.filled=1;
  try{
    let seed=5317;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const B=boxes.filter(b=>!b.room&&Math.abs(b.x0)<9500&&Math.abs(b.z0)<9500&&(b.x1-b.x0)>5&&(b.z1-b.z0)>5);
    const nearBox=(x,z,r)=>{for(let i=0;i<boxes.length;i++){const b=boxes[i];if(b.room)continue;if(x>b.x0-r&&x<b.x1+r&&z>b.z0-r&&z<b.z1+r)return true;}return false;};
    const inCity=(x,z)=>Math.abs(x)<=300&&z>=-250&&z<=215;
    const onRoad=(x,z)=>{if(!inCity(x,z))return false;for(const v of roadC)if(Math.abs(x-v)<9||Math.abs(z-v)<9)return true;return false;};
    const nearSpot=(x,z)=>spots.some(s=>Math.abs(s.x-x)<4&&Math.abs(s.z-z)<4);
    const P={tree:[],bush:[],bench:[],lamp:[],bin:[]},cap={tree:420,bush:520,bench:140,lamp:160,bin:90};
    const put=(t,x,z)=>{if(P[t].length>=cap[t])return false;if(onRoad(x,z)||nearBox(x,z,1.2)||nearSpot(x,z))return false;P[t].push([x,z,rnd()]);return true;};
    const pickT=()=>{const r=rnd();return r<.38?'tree':r<.7?'bush':r<.8?'bench':r<.92?'lamp':'bin';};
    for(let n=0;n<4200&&B.length;n++){
      const b=B[Math.floor(rnd()*B.length)],side=Math.floor(rnd()*4),o=2.4+rnd()*1.4;let x,z;
      if(side<2){x=b.x0+rnd()*(b.x1-b.x0);z=side?b.z1+o:b.z0-o;}else{z=b.z0+rnd()*(b.z1-b.z0);x=side===2?b.x1+o:b.x0-o;}
      put(pickT(),x,z);
    }
    for(let x=-280;x<=280;x+=22)for(let z=-232;z<=206;z+=22){
      const px=x+(rnd()-.5)*10,pz=z+(rnd()-.5)*10;if(onRoad(px,pz)||nearBox(px,pz,9))continue;
      const k=rnd();if(k<.5){put('tree',px,pz);put('bush',px+2.2,pz+1);put('bush',px-1.6,pz+2);}else if(k<.8){put('bench',px,pz);put('lamp',px+3,pz);}else put('tree',px,pz);
    }
    const D=new THREE.Object3D(),mk=(geo,mat,list,fn,shadow)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,mat,list.length);
      list.forEach((p,i)=>{fn(D,p);D.updateMatrix();im.setMatrixAt(i,D.matrix);});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.castShadow=!!shadow;scene.add(im);return im;};
    const col=new THREE.Color(),greens=[0x2f7d3c,0x3f8f45,0x4b9a3a,0x2a6b35,0x5a8f2f];
    mk(new THREE.CylinderGeometry(.12,.2,2.4,6),mt(0x6b4a2a,.9),P.tree,(d,p)=>{d.position.set(p[0],1.2,p[1]);d.rotation.set(0,0,0);d.scale.set(1,.9+p[2]*.4,1);},false);
    const can=mk(new THREE.IcosahedronGeometry(1.35,1),mt(0xffffff,.85),P.tree,(d,p)=>{const s=.85+p[2]*.6;d.position.set(p[0],2.9+p[2]*.5,p[1]);d.rotation.set(0,p[2]*6,0);d.scale.set(s,s*.95,s);},true);
    if(can)P.tree.forEach((p,i)=>can.setColorAt(i,col.setHex(greens[Math.floor(p[2]*greens.length)%greens.length])));if(can&&can.instanceColor)can.instanceColor.needsUpdate=true;
    const bsh=mk(new THREE.SphereGeometry(.7,8,6),mt(0xffffff,.9),P.bush,(d,p)=>{const s=.6+p[2]*.7;d.position.set(p[0],.35*s,p[1]);d.rotation.set(0,0,0);d.scale.set(s*1.2,s*.8,s);},false);
    if(bsh)P.bush.forEach((p,i)=>bsh.setColorAt(i,col.setHex(greens[Math.floor(p[2]*7)%greens.length])));if(bsh&&bsh.instanceColor)bsh.instanceColor.needsUpdate=true;
    mk(new THREE.BoxGeometry(1.7,.14,.5),mt(0x7a5a3a,.8),P.bench,(d,p)=>{d.position.set(p[0],.5,p[1]);d.rotation.set(0,Math.floor(p[2]*4)*Math.PI/2,0);d.scale.set(1,1,1);},false);
    mk(new THREE.BoxGeometry(1.7,.4,.08),mt(0x6a4a2a,.8),P.bench,(d,p)=>{const a=Math.floor(p[2]*4)*Math.PI/2;d.position.set(p[0]-Math.sin(a)*.22,.78,p[1]-Math.cos(a)*.22);d.rotation.set(0,a,0);d.scale.set(1,1,1);},false);
    mk(new THREE.CylinderGeometry(.05,.07,4.2,6),mt(0x2e3238,.5,.6),P.lamp,(d,p)=>{d.position.set(p[0],2.1,p[1]);d.rotation.set(0,0,0);d.scale.set(1,1,1);},false);
    mk(new THREE.SphereGeometry(.22,8,6),new THREE.MeshBasicMaterial({color:0xffe9b0}),P.lamp,(d,p)=>{d.position.set(p[0],4.25,p[1]);d.rotation.set(0,0,0);d.scale.set(1,1,1);},false);
    mk(new THREE.CylinderGeometry(.24,.22,.75,8),mt(0x3b6b4a,.7,.2),P.bin,(d,p)=>{d.position.set(p[0],.38,p[1]);d.rotation.set(0,0,0);d.scale.set(1,1,1);},false);
  }catch(e){console.warn('v53 fill',e);}
}

/* ---------------- 7. rendu des voitures un peu plus brillant ---------------- */
try{if(typeof carPaint!=='undefined'){carPaint.shininess=150;carPaint.specular.set(0xb0b6be);}}catch(e){}
})();
