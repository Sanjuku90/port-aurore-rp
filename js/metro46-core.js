'use strict';
/* ==========================================================================
   v46 · MÉTROPOLE DES TROIS CITÉS · noyau
   - Quartiers activables séparément, chargés progressivement (1 bâtiment par image)
     et déchargés quand on s'éloigne (géométrie, collisions, repères, PNJ).
   - LOD 4 niveaux : < 50 m détaillé · 50-150 m façade simplifiée ·
     150-350 m volumes · > 350 m silhouette instanciée par quartier.
   - Fenêtres instanciées, matériaux partagés par famille, pas d'ombre dynamique
     sauf bâtiment détaillé proche, PNJ de quartier figés hors de portée.
   - Territoire continental unifié (Port-Aurore ↔ corridor ↔ Nouvelle-Aurore),
     zones praticables, GPS, guide « Métropole », économie et transports.
   ========================================================================== */
(function(){
const MET=window.MET46={districts:[],byKey:new Map(),blds:[],handlers:{},zones:[],walk:[],ride:null,roads:[],stats:{loaded:0,built:0},ARCH:{},TPL:{},ver:46};
const SK='pa-metro46';
const S=MET.S={own:{},rent:{},biz:null,garage:{},style:{},off:{},auto:true,q:'std',day:null,stocks:null,port:{},pass:0,docs:[],diplomas:[],member:{},mission:null,tollT:0,visits:0};
try{const o=JSON.parse(localStorage.getItem(SK)||'null');if(o)Object.assign(S,o);}catch(e){}
const save=MET.save=()=>{try{localStorage.setItem(SK,JSON.stringify(S));}catch(e){}};
const COARSE=MET.coarse=matchMedia('(pointer: coarse)').matches||('ontouchstart' in window);
const day=MET.day=()=>Math.floor(gameMin/1440);
const afford=MET.afford=c=>state.cash+state.bank>=c;
const pay=MET.pay=c=>{if(!c)return true;if(!afford(c)){toast('Fonds insuffisants.','warn');return false;}takeMoney(c);return true;};
const up=MET.up=(k,v)=>{state[k]=clamp((state[k]||0)+v,0,100);};
const fadeDo=MET.fade=(min,fn,msg)=>{const F=window.fade27||((on,cb)=>cb&&cb());F(true,()=>{gameMin+=min||0;try{fn&&fn();}catch(e){console.warn(e);}F(false);if(msg)toast(msg,'good');});};
MET.slug=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

/* ---------------- matériaux partagés par famille ---------------- */
const MAT=MET.MAT={};
function mat(k){if(MAT[k])return MAT[k];let m;
  if(k==='vc')m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.84,metalness:.03});
  else if(k==='gloss')m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.16,metalness:.6});
  else if(k==='emit')m=new THREE.MeshBasicMaterial({vertexColors:true});
  else if(k==='far')m=new THREE.MeshLambertMaterial({color:0xffffff});
  else if(k==='winLit')m=new THREE.MeshStandardMaterial({color:0x2b3d50,roughness:.1,metalness:.72,emissive:0xffd49a,emissiveIntensity:0});
  else if(k==='winDark')m=new THREE.MeshStandardMaterial({color:0x1f2d3b,roughness:.1,metalness:.78});
  else if(k==='road')m=new THREE.MeshLambertMaterial({vertexColors:true});
  else if(k==='water'){m=(typeof sea!=='undefined'&&sea&&sea.material)?sea.material.clone():new THREE.MeshPhongMaterial({color:0x1f6f9c,shininess:80});m.transparent=false;m.opacity=1;}
  else if(k==='lagoon')m=new THREE.MeshPhongMaterial({color:0x2fc6c9,transparent:true,opacity:.7,shininess:90,specular:0xffffff});
  else if(k==='ground')m=new THREE.MeshLambertMaterial({map:noiseTex('#4a7a4c',24,60)});
  else if(k==='sand')m=new THREE.MeshLambertMaterial({map:noiseTex('#e6d3a0',18,40)});
  else if(k==='pave')m=new THREE.MeshLambertMaterial({map:tileTex('#b9b7ae')});
  return MAT[k]=m;}
MET.mat=mat;

/* ---------------- géométries unitaires & kit de construction ---------------- */
const G={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,18),cyl8:new THREE.CylinderGeometry(1,1,1,8),tri:new THREE.CylinderGeometry(1,1,1,3),dome:new THREE.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI/2),sph:new THREE.SphereGeometry(1,10,8),cone:new THREE.ConeGeometry(1,1,12),cone4:new THREE.ConeGeometry(1,1,4),vault:new THREE.CylinderGeometry(1,1,1,16,1,false,0,Math.PI),plane:new THREE.PlaneGeometry(1,1)};
MET.G=G;
const _q=new THREE.Quaternion(),_e=new THREE.Euler(),_p=new THREE.Vector3(),_s=new THREE.Vector3();
function M4(x,y,z,sx,sy,sz,rx,ry,rz,ord){_e.set(rx||0,ry||0,rz||0,ord||'XYZ');_q.setFromEuler(_e);_p.set(x,y,z);_s.set(sx,sy,sz);return new THREE.Matrix4().compose(_p,_q,_s);}
MET.M4=M4;
class Kit{
  constructor(x,z,ry){this.ox=x;this.oz=z;this.ry=ry||0;this.c=Math.cos(this.ry);this.s=Math.sin(this.ry);this.L={vol:[],det:[],gloss:[],emit:[]};this.win=[];this.far=[];this.cols=[];this.signs=[];this.extra=[];}
  w(lx,lz){return [this.ox+lx*this.c+lz*this.s,this.oz-lx*this.s+lz*this.c];}
  put(layer,g,lx,y,lz,sx,sy,sz,c,lry,rx,rz){const [x,z]=this.w(lx,lz);this.L[layer].push({g,m:M4(x,y,z,sx,sy,sz,rx||0,this.ry+(lry||0),rz||0),c});return this;}
  box(layer,lx,y,lz,w,h,d,c,lry){return this.put(layer,G.box,lx,y,lz,w,h,d,c,lry);}
  /* boîte posée au sol (y = base) */
  blk(layer,lx,y0,lz,w,h,d,c,lry){return this.box(layer,lx,y0+h/2,lz,w,h,d,c,lry);}
  cyl(layer,lx,y0,lz,r,h,c,lo){return this.put(layer,lo?G.cyl8:G.cyl,lx,y0+h/2,lz,r,h,r,c);}
  cone(layer,lx,y0,lz,r,h,c,four){return this.put(layer,four?G.cone4:G.cone,lx,y0+h/2,lz,r,h,r,c,four?Math.PI/4:0);}
  dome(layer,lx,y0,lz,r,hy,c){return this.put(layer,G.dome,lx,y0,lz,r,hy||r,r,c);}
  sph(layer,lx,y,lz,r,c,sy){return this.put(layer,G.sph,lx,y,lz,r,sy||r,r,c);}
  /* fronton triangulaire posé sur y0, largeur w, hauteur h, profondeur d */
  pediment(layer,lx,y0,lz,w,h,d,c){const [x,z]=this.w(lx,lz);this.L[layer].push({g:G.tri,m:M4(x,y0+h/3,z,w/1.732,d,h/1.5,-Math.PI/2,this.ry,0,'YXZ'),c});return this;}
  vault(layer,lx,y0,lz,r,len,c,along){const [x,z]=this.w(lx,lz);this.L[layer].push({g:G.vault,m:M4(x,y0,z,r,len,r,0,this.ry+(along?Math.PI/2:0),Math.PI/2),c});return this;}
  /* fenêtres instanciées sur une face : face = 'f','b','l','r' d'un volume centré lx,lz de taille w×d, de y0 à y1 */
  windows(lx,lz,w,d,y0,y1,o){o=o||{};const fh=o.fh||3.6,ww=o.ww||1.6,wh=o.wh||fh*.62,gap=o.gap||(ww+1.1),faces=o.faces||'fblr',lit=o.lit==null?.38:o.lit,sill=o.sill||fh*.22,lry=o.lry||0;
    const c=Math.cos(lry),s=Math.sin(lry);
    for(const f of faces){const along=(f==='f'||f==='b')?w:d,off=((f==='f'||f==='b')?d:w)/2+.06,n=Math.max(1,Math.floor((along-1.2)/gap));
      for(let y=y0+sill;y+wh<=y1-.3;y+=fh){for(let i=0;i<n;i++){const t=(i-(n-1)/2)*gap;let px,pz,r;
        if(f==='f'){px=t;pz=off;r=0;}else if(f==='b'){px=t;pz=-off;r=0;}else if(f==='l'){px=-off;pz=t;r=Math.PI/2;}else{px=off;pz=t;r=Math.PI/2;}
        const qx=lx+px*c+pz*s,qz=lz-px*s+pz*c;const [x,z]=this.w(qx,qz);
        this.win.push({x,y:y+wh/2,z,w:ww,h:wh,ry:this.ry+lry+r,lit:Math.random()<lit});}}}
    return this;}
  /* silhouette lointaine */
  farBox(lx,y0,lz,w,h,d,c,lry){const [x,z]=this.w(lx,lz);this.far.push({x,y:y0+h/2,z,w,h,d,ry:this.ry+(lry||0),c});return this;}
  /* collision (rectangle local → boîte monde englobante) */
  col(lx,lz,w,d){const pts=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([a,b])=>this.w(lx+a,lz+b));const xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]);
    this.cols.push({x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs),big:true,m46:1});return this;}
  sign(text,sub,lx,y,lz,w,h,bg,fg,o){this.signs.push({text,sub,lx,y,lz,w,h,bg,fg,o:o||{}});return this;}
  /* voiture garée stylisée (décor, pas de simulation) */
  car(lx,lz,lry,c){const k=this,r=lry||0,cs=Math.cos(r),sn=Math.sin(r),P=(a,b)=>[lx+a*cs+b*sn,lz-a*sn+b*cs];
    let [x,z]=P(0,0);k.box('det',x,.55,z,1.8,.7,4.2,c||pick(CAR_COLORS),r);[x,z]=P(0,-.2);k.box('det',x,1.15,z,1.6,.55,2.2,0x1d2733,r);
    [[-.8,1.3],[.8,1.3],[-.8,-1.3],[.8,-1.3]].forEach(([a,b])=>{const [qx,qz]=P(a,b);k.put('det',G.cyl8,qx,.34,qz,.34,.25,.34,0x111111,r,0,Math.PI/2);});return k;}
  person(lx,lz,lry){this.extra.push({type:'npc',lx,lz,ry:lry||0});return this;}
}
MET.Kit=Kit;

/* ---------------- panneaux (canvas en cache) ---------------- */
const SIGNC=new Map();
function signTex(text,sub,bg,fg,ratio){const key=text+'|'+sub+'|'+bg+'|'+fg+'|'+ratio;if(SIGNC.has(key))return SIGNC.get(key);
  const c=document.createElement('canvas');c.width=1024;c.height=Math.max(64,Math.round(1024/ratio));const g=c.getContext('2d');
  if(bg){g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);g.fillStyle='rgba(255,255,255,.14)';g.fillRect(0,c.height-6,c.width,6);}
  g.fillStyle=fg||'#fff';g.textAlign='center';g.textBaseline='middle';
  const fit=(t,sz,y,wgt)=>{let s=sz;g.font=wgt+' '+s+'px Anton, "Chakra Petch", Rajdhani, Arial Narrow, sans-serif';while(g.measureText(t).width>c.width*.92&&s>14){s-=2;g.font=wgt+' '+s+'px Anton, "Chakra Petch", Rajdhani, Arial Narrow, sans-serif';}g.fillText(t,c.width/2,y);};
  if(sub){fit(text.toUpperCase(),Math.round(c.height*.46),c.height*.4,'700');g.globalAlpha=.82;fit(sub,Math.round(c.height*.22),c.height*.78,'600');g.globalAlpha=1;}
  else fit(text.toUpperCase(),Math.round(c.height*.62),c.height*.53,'700');
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;if(THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;SIGNC.set(key,t);return t;}
MET.signTex=signTex;
const SIGNM=new Map();
function signMat(text,sub,bg,fg,ratio){const key=text+'|'+sub+'|'+bg+'|'+fg+'|'+ratio;if(SIGNM.has(key))return SIGNM.get(key);const m=new THREE.MeshBasicMaterial({map:signTex(text,sub,bg,fg,ratio),transparent:!bg,side:THREE.DoubleSide,toneMapped:false});SIGNM.set(key,m);return m;}
MET.signMat=signMat;

/* ---------------- quartiers ---------------- */
/* def = {key,name,sub,city:'port'|'third'|'corr'|'sol',x0,x1,z0,z1,specs:[...],decor(k) optionnel, walkers} */
MET.district=function(def){def.cx=(def.x0+def.x1)/2;def.cz=(def.z0+def.z1)/2;def.r=Math.hypot(def.x1-def.x0,def.z1-def.z0)/2;def.loaded=false;def.queue=null;def.b=[];def.npc=[];def.far=null;def.decorM=[];
  MET.districts.push(def);MET.zones.push({n:def.name,s:def.sub||'',x0:def.x0,x1:def.x1,z0:def.z0,z1:def.z1,d:def});
  (def.specs||[]).forEach(sp=>MET.building(def,sp));return def;};
/* spec = {name,arch,x,z,w,d,h,ry,cat,emoji,tpl,floors,pal,o,svc,desc,hero} */
MET.building=function(d,sp){const key=sp.key||MET.slug(sp.name);if(MET.byKey.has(key))return MET.byKey.get(key);
  const b=Object.assign({key,id:'met46:'+key,dist:d,cat:'Lieux',emoji:'📍',ry:0,w:30,d:24,h:20,lvl:-1,m:null,idx:MET.blds.length},sp);
  const c=Math.cos(b.ry),s=Math.sin(b.ry),fz=b.d/2+(b.doorOff||4.5),dx=b.doorX||0;b.door={x:b.x+dx*c+fz*s,z:b.z-dx*s+fz*c};
  MET.blds.push(b);MET.byKey.set(key,b);d.b.push(b);return b;};
MET.zoneAt=function(x,z){for(const Z of MET.zones)if(x>=Z.x0&&x<=Z.x1&&z>=Z.z0&&z<=Z.z1)return [Z.n,Z.s];
  if(x>-1560&&x<-1000&&z>-1000)return ['Corridor métropolitain','A1 · TGV · logistique'];return null;};

/* ---------------- construction d'un bâtiment ---------------- */
function addMesh(arr,m,cast){if(!arr.length)return null;const geo=mergeParts(arr);geo.computeBoundingSphere();const o=new THREE.Mesh(geo,m);o.castShadow=!!cast;o.receiveShadow=false;o.matrixAutoUpdate=false;o.updateMatrix();scene.add(o);arr.length=0;return o;}
const WGEO=new THREE.BoxGeometry(1,1,.1);const _D=new THREE.Object3D();
function winMesh(list,m){if(!list.length)return null;const im=new THREE.InstancedMesh(WGEO,m,list.length);list.forEach((w,i)=>{_D.position.set(w.x,w.y,w.z);_D.rotation.set(0,w.ry,0);_D.scale.set(w.w,w.h,1);_D.updateMatrix();im.setMatrixAt(i,_D.matrix);});
  im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.castShadow=false;im.receiveShadow=false;scene.add(im);return im;}
function buildOne(b){const d=b.dist,k=new Kit(b.x,b.z,b.ry),A=MET.ARCH[b.arch]||MET.ARCH.slab;
  try{A(k,b);}catch(e){console.warn('met46 arch',b.name,e);}
  const m={};m.vol=addMesh(k.L.vol,mat('vc'),false);m.det=addMesh(k.L.det,mat('vc'),false);m.gloss=addMesh(k.L.gloss,mat('gloss'),false);m.emit=addMesh(k.L.emit,mat('emit'),false);
  m.wl=winMesh(k.win.filter(w=>w.lit),mat('winLit'));m.wd=winMesh(k.win.filter(w=>!w.lit),mat('winDark'));
  m.signs=k.signs.map(s=>{const [x,z]=k.w(s.lx,s.lz);const o=new THREE.Mesh(G.plane,signMat(s.text,s.sub||'',s.bg,s.fg,s.w/s.h));o.scale.set(s.w,s.h,1);o.position.set(x,s.y,z);o.rotation.y=b.ry+(s.o.ry||0);scene.add(o);return o;});
  m.npc=k.extra.filter(e=>e.type==='npc').map(e=>{const [x,z]=k.w(e.lx,e.lz);const p=makePerson(pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{top:pick(['tee','long','veste']),bottom:pick(['pantalon','jupe','short']),bag:Math.random()<.3});p.traverse(o=>{if(o.isMesh)o.castShadow=false;});p.position.set(x,.1,z);p.rotation.y=b.ry+e.ry;scene.add(p);return p;});
  b.cols=k.cols.length?k.cols:[k.col(0,0,b.w,b.d).cols[0]];b.cols.forEach(c=>boxes.push(c));
  b.farList=k.far.length?k.far:[{x:b.x,y:b.h/2,z:b.z,w:b.w,h:b.h,d:b.d,ry:b.ry,c:(b.pal&&b.pal.wall)||0x9aa3ad}];
  b.m=m;b.lvl=-1;
  if(!b.noSpot){addSpot(b.door.x,b.door.z,b.id,b.spotC||0xf5c451,b.emoji+' '+b.name);const sp=spots[spots.length-1];sp.category=b.cat;sp.met46=b;b.spot=sp;if(sp.b){sp.b.scale.set(.7,.6,.7);sp.b.position.y=2.6;}}
  (b.spots||[]).forEach(q=>{const [x,z]=k.w(q.lx,q.lz);addSpot(x,z,q.id,q.c||0x4fd1b0,q.label);const sp=spots[spots.length-1];sp.category=q.cat||b.cat;sp.met46x=q;if(sp.b){sp.b.scale.set(.6,.5,.6);sp.b.position.y=2.2;}(b.xs=b.xs||[]).push(sp);q.x=x;q.z=z;});
  MET.stats.built++;}
function freeOne(b){if(!b.m)return;const m=b.m;['vol','det','gloss','emit','wl','wd'].forEach(k=>{const o=m[k];if(o){scene.remove(o);o.geometry&&o.geometry!==WGEO&&o.geometry.dispose();if(o.isInstancedMesh)o.dispose&&o.dispose();}});
  m.signs.forEach(o=>scene.remove(o));m.npc.forEach(o=>scene.remove(o));
  (b.cols||[]).forEach(c=>{const i=boxes.indexOf(c);if(i>=0)boxes.splice(i,1);});
  const rm=s=>{if(!s)return;const i=spots.indexOf(s);if(i>=0)spots.splice(i,1);if(s.b){scene.remove(s.b);s.b.geometry.dispose();}if(s.ring){scene.remove(s.ring);s.ring.geometry.dispose();}};
  rm(b.spot);b.spot=null;(b.xs||[]).forEach(rm);b.xs=null;b.m=null;b.lvl=-1;}
function setVis(o,v){if(o&&o.visible!==v)o.visible=v;}
function applyLvl(b,l){const m=b.m;if(!m)return;b.lvl=l;
  setVis(m.vol,l<=2);setVis(m.wl,l<=1);setVis(m.wd,l<=1);m.signs.forEach(s=>setVis(s,l<=1));setVis(m.det,l===0);setVis(m.gloss,l<=1);setVis(m.emit,l<=1);m.npc.forEach(p=>setVis(p,l===0&&!player.inside));
  if(m.vol)m.vol.castShadow=l===0&&!!b.hero;
  if(b.spot){setVis(b.spot.b,l<=1);setVis(b.spot.ring,l<=1);}(b.xs||[]).forEach(s=>{setVis(s.b,l<=1);setVis(s.ring,l<=1);});
  const D=b.dist;if(D.far&&b.farIdx){const z0=l===3;b.farIdx.forEach(([i,f])=>{_D.position.set(f.x,f.y,f.z);_D.rotation.set(0,f.ry,0);_D.scale.set(z0?f.w:0,z0?f.h:0,z0?f.d:0);_D.updateMatrix();D.far.setMatrixAt(i,_D.matrix);});D.far.instanceMatrix.needsUpdate=true;}}
function buildFar(D){const list=[];D.b.forEach(b=>{b.farIdx=[];(b.farList||[]).forEach(f=>{b.farIdx.push([list.length,f]);list.push(f);});});if(!list.length)return;
  const im=new THREE.InstancedMesh(G.box,mat('far'),list.length);const col=new THREE.Color();
  list.forEach((f,i)=>{_D.position.set(f.x,f.y,f.z);_D.rotation.set(0,f.ry,0);_D.scale.set(0,0,0);_D.updateMatrix();im.setMatrixAt(i,_D.matrix);col.setHex(f.c);col.multiplyScalar(.82);im.setColorAt(i,col);});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.castShadow=false;scene.add(im);D.far=im;}
function loadD(D){if(D.loaded||D.queue)return;D.queue=D.b.slice();D.t0=performance.now();}
function unloadD(D){D.queue=null;if(!D.loaded&&!D.b.some(b=>b.m))return;D.b.forEach(freeOne);if(D.far){scene.remove(D.far);D.far.dispose&&D.far.dispose();D.far=null;}
  D.npc.forEach(n=>scene.remove(n.m));D.npc=[];D.loaded=false;MET.stats.loaded=MET.districts.filter(q=>q.loaded).length;}
MET.load=k=>{const D=MET.districts.find(d=>d.key===k);if(D){delete S.off[k];save();loadD(D);}};
MET.unload=k=>{const D=MET.districts.find(d=>d.key===k);if(D){S.off[k]=1;save();unloadD(D);}};
function finishD(D){D.queue=null;D.loaded=true;buildFar(D);D.b.forEach(b=>applyLvl(b,3));
  /* quelques passants de quartier, figés hors de portée */
  const n=D.walkers==null?6:D.walkers;for(let i=0;i<n;i++){const b=D.b[i%D.b.length];if(!b)break;const m=makePerson(pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{style:pick(['court','long','afro','chignon','ras']),top:pick(['tee','long','veste','sweat']),bottom:pick(['pantalon','short','jupe']),bag:Math.random()<.35});
    m.traverse(o=>{if(o.isMesh)o.castShadow=false;});scene.add(m);const a={x:b.door.x-6,z:b.door.z+1.5},c={x:b.door.x+6,z:b.door.z+1.5};D.npc.push({m,a,c,t:Math.random(),dir:1,sp:1.2/12,ph:Math.random()*6});}
  MET.stats.loaded=MET.districts.filter(q=>q.loaded).length;D.ms=Math.round(performance.now()-D.t0);}
const LV={std:[50,150,350],eco:[36,110,260],ultra:[70,200,420]};
let lodT=0,strT=0;
function lodTick(dt){lodT-=dt;strT-=dt;
  const cx=camera.position.x,cz=camera.position.z,pv=player.inside?null:{x:cx,z:cz};
  /* streaming : un bâtiment par image au maximum */
  for(const D of MET.districts){if(D.queue){const t=performance.now();while(D.queue.length&&performance.now()-t<(COARSE?5:8)){buildOne(D.queue.shift());}if(!D.queue.length)finishD(D);break;}}
  if(strT<=0){strT=.6;const ref=pv||(player.outside?{x:player.outside.x,z:player.outside.z}:{x:player.x,z:player.z});const mapOn=camera.far>1500;
    MET.districts.forEach(D=>{if(S.off[D.key]){if(D.loaded||D.queue)unloadD(D);return;}const dd=Math.hypot(ref.x-D.cx,ref.z-D.cz)-D.r,near=COARSE?520:720;
      if(!D.loaded&&!D.queue&&(S.auto?(dd<near||(mapOn&&dd<1800)):true))loadD(D);else if(D.loaded&&S.auto&&dd>near+420&&!mapOn)unloadD(D);});}
  if(lodT>0)return;lodT=.18;const L=LV[S.q]||LV.std;
  for(const D of MET.districts){if(!D.loaded)continue;for(const b of D.b){const d=Math.hypot(cx-b.x,cz-b.z)-Math.max(b.w,b.d)*.35;const l=player.inside?3:d<L[0]?0:d<L[1]?1:d<L[2]?2:3;if(l!==b.lvl)applyLvl(b,l);}}}
/* PNJ de quartier : seuls les proches marchent */
function npcTick(dt){if(player.inside)return;const px=player.x,pz=player.z;for(const D of MET.districts){if(!D.loaded||Math.abs(D.cx-px)>D.r+200||Math.abs(D.cz-pz)>D.r+200){D.npc.forEach(n=>setVis(n.m,false));continue;}
  D.npc.forEach(n=>{const near=Math.abs(n.a.x-px)<110&&Math.abs(n.a.z-pz)<110;setVis(n.m,near);if(!near)return;n.t+=n.sp*dt*n.dir;if(n.t>1){n.t=1;n.dir=-1;}if(n.t<0){n.t=0;n.dir=1;}
    const x=n.a.x+(n.c.x-n.a.x)*n.t,z=n.a.z+(n.c.z-n.a.z)*n.t;n.m.position.set(x,.1,z);n.m.rotation.y=Math.atan2((n.c.x-n.a.x)*n.dir,(n.c.z-n.a.z)*n.dir);n.ph+=dt*4.2;animPerson(n.m,n.ph,.55,false);});}}
/* éclairage nocturne des fenêtres & enseignes */
function nightTick(){const k=typeof dayK27==='function'?dayK27():1,n=clamp(1-k*1.6,0,1);mat('winLit').emissiveIntensity=n*1.25+.04;}

/* ---------------- sols, routes, eau (statiques et légers) ---------------- */
const ROADP=[],MARKP=[],WALKP=[];
MET.ground=function(x0,x1,z0,z1,kind,y){const w=x1-x0,d=z1-z0,m=mat(kind||'ground').clone();if(m.map){m.map=m.map.clone();m.map.needsUpdate=true;m.map.wrapS=m.map.wrapT=THREE.RepeatWrapping;m.map.repeat.set(w/24,d/24);}
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);o.rotation.x=-Math.PI/2;o.position.set((x0+x1)/2,y==null?-.035:y,(z0+z1)/2);o.receiveShadow=true;scene.add(o);return o;};
MET.water=function(x0,x1,z0,z1,kind,y){const o=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),mat(kind||'water'));o.rotation.x=-Math.PI/2;o.position.set((x0+x1)/2,y==null?0:y,(z0+z1)/2);scene.add(o);return o;};
/* route droite de (ax,az) à (bx,bz) */
MET.road=function(ax,az,bx,bz,w,o){o=o||{};const L=Math.hypot(bx-ax,bz-az),a=Math.atan2(bx-ax,bz-az),cx=(ax+bx)/2,cz=(az+bz)/2;w=w||14;
  ROADP.push({g:G.box,m:M4(cx,.045,cz,w,.02,L,0,a,0),c:o.c||0x33383e});
  if(o.walk!==false)[-1,1].forEach(s=>WALKP.push({g:G.box,m:M4(cx+Math.cos(a)*s*(w/2+1.6),.06,cz-Math.sin(a)*s*(w/2+1.6),3.2,.05,L,0,a,0),c:0xb4b2aa}));
  if(o.mark!==false){const lanes=o.lanes||1;for(let t=6;t<L-4;t+=10){const px=ax+(bx-ax)*t/L,pz=az+(bz-az)*t/L;
    for(let q=-(lanes-1);q<=lanes-1;q+=2){const off=q*(w/(lanes*4));MARKP.push({g:G.box,m:M4(px+Math.cos(a)*off,.062,pz-Math.sin(a)*off,.22,.01,4.5,0,a,0),c:lanes>1&&q===0?0xe1c950:0xf2f2ec});}}
    if(o.median){MARKP.push({g:G.box,m:M4(cx,.35,cz,1.2,.6,L-2,0,a,0),c:0x8a8f86});}}
  MET.roads.push({ax,az,bx,bz,w});};
function flushRoads(){[[ROADP,0],[WALKP,0],[MARKP,1]].forEach(([arr,em])=>{if(!arr.length)return;const geo=mergeParts(arr);const m=new THREE.Mesh(geo,em?mat('emit'):mat('road'));m.receiveShadow=!em;m.matrixAutoUpdate=false;m.updateMatrix();scene.add(m);arr.length=0;});}
MET.flushRoads=flushRoads;
/* lampadaires instanciés le long d'une route */
const LAMPS=[];MET.lamps=function(ax,az,bx,bz,off,step){const L=Math.hypot(bx-ax,bz-az),a=Math.atan2(bx-ax,bz-az);for(let t=step/2;t<L;t+=step){const px=ax+(bx-ax)*t/L,pz=az+(bz-az)*t/L;[-1,1].forEach(s=>LAMPS.push([px+Math.cos(a)*s*off,pz-Math.sin(a)*s*off,a+(s<0?Math.PI/2:-Math.PI/2)]));}};
function flushLamps(){if(!LAMPS.length)return;const n=LAMPS.length,pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.09,.13,7,6),new THREE.MeshLambertMaterial({color:0x3a3f45}),n),head=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.16,1.1),MET.lampMat=new THREE.MeshBasicMaterial({color:0xfff0c8}),n);
  LAMPS.forEach(([x,z,r],i)=>{_D.rotation.set(0,r,0);_D.scale.set(1,1,1);_D.position.set(x,3.5,z);_D.updateMatrix();pole.setMatrixAt(i,_D.matrix);_D.position.set(x+Math.sin(r)*.5,6.95,z+Math.cos(r)*.5);_D.updateMatrix();head.setMatrixAt(i,_D.matrix);});
  [pole,head].forEach(m=>{m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere&&m.computeBoundingSphere();scene.add(m);});LAMPS.length=0;}
/* arbres instanciés */
const TREES=[];MET.tree=(x,z,t,s)=>TREES.push([x,z,t||'round',s||1]);
function flushTrees(){const by={};TREES.forEach(t=>(by[t[2]]=by[t[2]]||[]).push(t));Object.keys(by).forEach(ty=>{const L=by[ty],im=new THREE.InstancedMesh(treeGeo(ty),typeof decoMat!=='undefined'?decoMat:new THREE.MeshLambertMaterial({vertexColors:true}),L.length);
  L.forEach(([x,z,,s],i)=>{_D.position.set(x,0,z);_D.rotation.set(0,Math.random()*6.28,0);_D.scale.set(s,s*(.9+Math.random()*.2),s);_D.updateMatrix();im.setMatrixAt(i,_D.matrix);});im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();scene.add(im);});TREES.length=0;}
/* décor statique fusionné (quais, ponts, pontons…) */
const STAT={vc:[],gloss:[],emit:[]};MET.stat=(layer,g,x,y,z,sx,sy,sz,c,ry,rx,rz)=>STAT[layer].push({g,m:M4(x,y,z,sx,sy,sz,rx||0,ry||0,rz||0),c});
MET.sbox=(x,y0,z,w,h,d,c,ry,layer)=>MET.stat(layer||'vc',G.box,x,y0+h/2,z,w,h,d,c,ry);
function flushStat(){Object.keys(STAT).forEach(k=>{const a=STAT[k];if(!a.length)return;for(let i=0;i<a.length;i+=4000){const m=new THREE.Mesh(mergeParts(a.slice(i,i+4000)),mat(k));m.matrixAutoUpdate=false;m.updateMatrix();m.receiveShadow=k==='vc';scene.add(m);}a.length=0;});}
MET.colRect=(x0,x1,z0,z1)=>{const b={x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),big:true,m46s:1};boxes.push(b);return b;};

/* ---------------- territoire : bornes et zones praticables ---------------- */
MET.walkRect=(x0,x1,z0,z1)=>MET.walk.push([Math.min(x0,x1),Math.max(x0,x1),Math.min(z0,z1),Math.max(z0,z1)]);
const walkOK=MET.walkOK=(x,z)=>{for(const r of MET.walk)if(x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3])return true;return false;};
/* zones historiques (v27→v45) conservées telles quelles */
MET.walkRect(-1000,760,-760,207);MET.walkRect(-2750,-1550,-620,520);MET.walkRect(SOL27.x-790,SOL27.x+790,-345,560);
const _wb=worldB27;worldB27=function(x){const v=x==null?player.x:x;if(v<-3000)return [SOL27.x-1250,SOL27.x+1250,-800,950];return [-2960,1760,-1200,1060];};
MET._wbOld=_wb;
const LAST={x:0,z:0,ok:false,cx:0,cz:0};
const _upP=updatePlayer;updatePlayer=function(dt){
  if(MET.ride){rideStep(dt);return;}
  _upP(dt);
  if(player.inside||(typeof FL!=='undefined'&&FL&&FL.on)||(window.NATION40&&NATION40.state&&NATION40.state.trip))return;
  const c=player.car,x=c?c.x:player.x,z=c?c.z:player.z;
  if(walkOK(x,z)){LAST.x=x;LAST.z=z;LAST.ok=true;return;}
  if(!LAST.ok||Math.hypot(x-LAST.x,z-LAST.z)>30){LAST.ok=false;return;}
  let nx=LAST.x,nz=LAST.z;if(walkOK(x,LAST.z))nx=x;else if(walkOK(LAST.x,z))nz=z;
  if(c){c.x=nx;c.z=nz;if(nx===LAST.x&&nz===LAST.z)c.v*=-.25;else c.v*=.9;player.x=c.x;player.z=c.z;}else{player.x=nx;player.z=nz;}LAST.x=nx;LAST.z=nz;};
/* nettoie les collines placées sur les nouveaux quartiers (est et corridor) */
if(typeof buildHills==='function'){const _bh=buildHills;buildHills=function(){const n0=scene.children.length;_bh();const added=scene.children.slice(n0);
  added.forEach(o=>{if(!o.isMesh||!o.geometry||o.geometry.type==='PlaneGeometry')return;const p=o.position;if(p.x>640||(p.x<-880&&p.z>-1250))scene.remove(o);});};}

/* ---------------- transports : trajets physiques (métro, TGV, cars, ferry) ---------------- */
/* line = {id,name,kind:'metro'|'tgv'|'coach'|'ferry'|'boat',color,speed,y,stops:[{n,x,z,y}],path:[{x,z,y}] (optionnel)} */
MET.line=function(l){MET.lines[l.id]=l;return l;};
MET.lines={};
const VEH={};
function vehicleMesh(kind,color){if(VEH[kind+color])return VEH[kind+color];const g=new THREE.Group(),k=new Kit(0,0,0);
  if(kind==='metro'||kind==='tgv'){const n=kind==='tgv'?3:2,L=kind==='tgv'?22:15;for(let i=0;i<n;i++){const z=-i*(L+1);k.box('vol',0,2,z,3,2.9,L,0xf2f2ee);k.box('vol',0,1.75,z,3.04,.5,L-.2,color);k.box('gloss',0,2.45,z,3.06,.9,L-1.5,0x1b2836);k.box('vol',0,3.55,z,2.6,.3,L-1,0xd8dadc);}
    k.box('gloss',0,2.4,1.2+L/2-1,2.8,1.4,1.6,0x1b2836);if(kind==='tgv'){k.put('vol',G.sph,0,1.9,L/2+.6,1.5,1.3,3,color);}}
  else if(kind==='coach'){k.box('vol',0,1.9,0,2.6,3.1,12,0xf4f2ec);k.box('vol',0,1.1,0,2.62,.6,12,color);k.box('gloss',0,2.5,0,2.64,1.1,11.4,0x1b2836);[[-1.1,4],[1.1,4],[-1.1,-3.5],[1.1,-3.5]].forEach(([a,b])=>k.put('vol',G.cyl8,a,.5,b,.5,.35,.5,0x111111,0,0,Math.PI/2));}
  else{k.box('vol',0,.8,0,7,2,26,0xf4f2ec);k.put('vol',G.cone4,0,.8,15,3.5,4,2,0xf4f2ec,0,Math.PI/2);k.box('vol',0,2.6,-2,5.6,1.8,15,0xffffff);k.box('gloss',0,2.7,-2,5.7,.8,14.6,0x1b2836);k.box('vol',0,4,-3,4.2,1.2,8,color);k.box('vol',0,1.9,0,7.05,.25,26,color);}
  [['vol','vc'],['gloss','gloss']].forEach(([l,mm])=>{if(k.L[l].length){const m=new THREE.Mesh(mergeParts(k.L[l]),mat(mm));m.castShadow=true;g.add(m);}});
  g.visible=false;scene.add(g);VEH[kind+color]=g;return g;}
function pathLen(P){let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);return L;}
function along(P,s){for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b.x-a.x,b.z-a.z);if(s<=L||i===P.length-1){const t=L?clamp(s/L,0,1):1;return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,y:(a.y||0)+((b.y||0)-(a.y||0))*t,h:Math.atan2(b.x-a.x,b.z-a.z)};}s-=L;}const q=P[P.length-1];return {x:q.x,z:q.z,y:q.y||0,h:0};}
MET.rideStart=function(o){/* o={kind,color,path,speed,label,onEnd,fadeAt:[s0,s1] (saut de traversée),minutes} */
  if(MET.ride||player.inside)return;if(player.car){toast('Gare ta voiture avant de monter.','warn');return;}
  const v=vehicleMesh(o.kind,o.color||0x2e6fd1);v.visible=true;const L=pathLen(o.path);
  MET.ride=Object.assign({s:0,L,v,sp:0,cam:new THREE.Vector3(),camT:new THREE.Vector3(),init:0},o);player.mesh.visible=false;
  const q=along(o.path,0);v.position.set(q.x,q.y,q.z);v.rotation.y=q.h;toast((o.label||'Départ')+' · E pour arriver directement','good');
  if(window.HUD45&&HUD45.banner)HUD45.banner('En route',o.label||'Trajet');};
function rideEnd(skip){const R=MET.ride;if(!R)return;const fin=()=>{const q=along(R.path,R.L);player.x=q.x+(R.dropX||0);player.z=q.z+(R.dropZ||4);R.v.visible=false;player.mesh.visible=true;MET.ride=null;gameMin+=R.minutes||0;camT=1;if(R.onEnd)R.onEnd();toast((R.arrive||'Arrivée')+'.','good');saveProgress();};
  if(skip)fadeDo(0,fin);else fin();}
MET.rideEnd=rideEnd;
function rideStep(dt){const R=MET.ride;if(R.fading)return;const top=R.speed||22;R.sp+=clamp(((R.L-R.s<80?Math.max(4,(R.L-R.s)*.3):top))-R.sp,-8*dt,5*dt);R.s+=R.sp*dt;
  if(R.jump&&R.s>R.jump[0]&&R.s<R.jump[1]){R.fading=true;const F=window.fade27||((on,cb)=>cb&&cb());F(true,()=>{R.s=R.jump[1];gameMin+=R.jumpMin||30;R.fading=false;F(false);toast(R.jumpMsg||'Traversée…','');});}
  const q=along(R.path,R.s);R.v.position.set(q.x,q.y,q.z);R.v.rotation.y+=angDiff(R.v.rotation.y,q.h)*Math.min(1,dt*4);player.x=q.x;player.z=q.z;player.h=q.h;
  if(R.s>=R.L-.5)rideEnd(false);}
const _ucR=updateCamera;updateCamera=function(dt){if(!MET.ride||!started){_ucR(dt);return;}const R=MET.ride,v=R.v,h=v.rotation.y,back=R.kind==='ferry'?34:R.kind==='coach'?16:24,upY=R.kind==='ferry'?14:7;
  const P=new THREE.Vector3(v.position.x-Math.sin(h)*back,v.position.y+upY,v.position.z-Math.cos(h)*back),T=new THREE.Vector3(v.position.x+Math.sin(h)*8,v.position.y+2,v.position.z+Math.cos(h)*8);
  const k=R.init?1-Math.exp(-3*dt):1;R.init=1;R.cam.lerp(P,k);R.camT.lerp(T,k);camera.position.copy(R.cam);camera.lookAt(R.camT);};
const _intR=interact;interact=function(){if(MET.ride){if(!MET.ride.fading){MET.ride.fading=true;rideEnd(true);}return;}_intR();};

/* ---------------- économie : immobilier, entreprise, bourse, missions ---------------- */
const UNITS=MET.UNITS={studio:{n:'Studio',buy:42000,rent:55,ch:8},t3:{n:'Appartement 2 chambres',buy:96000,rent:120,ch:16},duplex:{n:'Duplex',buy:185000,rent:230,ch:28},penthouse:{n:'Penthouse',buy:420000,rent:520,ch:60},villa:{n:'Villa',buy:360000,rent:420,ch:45},office:{n:'Plateau de bureaux',buy:250000,rent:300,ch:40}};
MET.unitKey=(b,u)=>b.key+'#'+u;
MET.hasHome=(b,u)=>{const k=MET.unitKey(b,u);return !!S.own[k]||(S.rent[k]&&S.rent[k]>gameMin);};
MET.homesIn=b=>Object.keys(UNITS).filter(u=>MET.hasHome(b,u));
MET.mult=b=>(b.price||1);
MET.realty=function(b,units,back){const rows=[];units.forEach(u=>{const U=UNITS[u],k=MET.unitKey(b,u),p=Math.round(U.buy*MET.mult(b)),r=Math.round(U.rent*MET.mult(b));
    if(S.own[k])rows.push({label:'✓ '+U.n+' · propriétaire · revendre '+fmt(p*.9),fn:()=>{openPanel('Revendre · '+U.n,'Prix de rachat immédiat : '+fmt(p*.9)+'.',[{label:'Confirmer la revente',fn:()=>{delete S.own[k];state.bank+=Math.round(p*.9);save();saveProgress();toast('Bien revendu.','good');}}]);}});
    else if(S.rent[k]&&S.rent[k]>gameMin)rows.push({label:'✓ '+U.n+' · loué encore '+Math.ceil((S.rent[k]-gameMin)/60)+' h · prolonger '+fmt(r),off:!afford(r),fn:()=>{if(!pay(r))return;S.rent[k]+=1440;save();toast('Bail prolongé de 24 h.','good');}});
    else{rows.push({label:'Acheter · '+U.n+' · '+fmt(p),off:!afford(p),fn:()=>{if(!pay(p))return;S.own[k]=day();save();saveProgress();toast(U.n+' acheté à '+b.name+'. Charges : '+fmt(Math.round(U.ch*MET.mult(b)))+' / jour.','good');}});
      rows.push({label:'Louer 24 h · '+U.n+' · '+fmt(r),off:!afford(r),fn:()=>{if(!pay(r))return;S.rent[k]=gameMin+1440;save();toast('Location confirmée pour 24 h de jeu.','good');}});}});
  const g=b.key;if(units.some(u=>S.own[MET.unitKey(b,u)]))rows.push({label:S.garage[g]?'✓ Garage privé · place '+S.garage[g].slot:'Garage privé · '+fmt(9000),off:!!S.garage[g]||!afford(9000),fn:()=>{if(!pay(9000))return;S.garage[g]={slot:'P-'+(10+Math.floor(Math.random()*80)),car:null};save();toast('Place de garage attribuée.','good');}});
  openPanel(b.name+' · immobilier','Achat, location, charges et garage. Charges prélevées chaque jour de jeu sur ton compte.',rows.concat(back?[{label:'Retour',fn:back}]:[]));};
/* charges quotidiennes, revenus d'entreprise, bourse */
const STOCKS=[['ABX','Aurore Bank Corp',120],['LGT','Lagune Télécom',48],['SOL','Solenne Resorts',76],['NAE','Nouvelle-Aurore Énergie',63],['PAL','Port-Aurore Logistics',39]];
function stocks(){if(!S.stocks){S.stocks={p:{},h:{},d:day()};STOCKS.forEach(([k,,p])=>S.stocks.p[k]=p);}return S.stocks;}
MET.stocks=()=>stocks();MET.STOCKS=STOCKS;
function dailyTick(){const d=day();if(S.day==null){S.day=d;save();return;}if(d<=S.day)return;const n=Math.min(7,d-S.day);S.day=d;let ch=0,rev=0;
  for(let i=0;i<n;i++){Object.keys(S.own).forEach(k=>{const [bk,u]=k.split('#'),b=MET.byKey.get(bk),U=UNITS[u];if(U)ch+=Math.round(U.ch*(b?MET.mult(b):1));});
    if(S.biz){const B=S.biz,base={conseil:420,tech:620,import:520,finance:760,media:480}[B.sector]||450,r=Math.round((base*(1+B.staff*.35)*(.75+Math.random()*.6)*(1+B.level*.25))-(B.staff*110)-(B.office?0:180));B.cash=(B.cash||0)+r;B.hist=(B.hist||[]).concat([r]).slice(-7);rev+=r;}
    const st=stocks();STOCKS.forEach(([k])=>{st.p[k]=Math.max(5,Math.round(st.p[k]*(1+(Math.random()-.47)*.12)*100)/100);});}
  if(ch){takeMoney(ch);toast('Charges de copropriété prélevées : '+fmt(ch)+'.','warn');}
  if(S.biz)toast('Bilan '+S.biz.name+' : '+(rev>=0?'+':'')+fmt(rev)+' à encaisser au bureau.',rev>=0?'good':'warn');save();}
MET.invest=function(){const st=stocks();openPanel('Aurore Exchange · bourse','Cours mis à jour chaque jour de jeu. Compte titres : '+STOCKS.map(([k])=>k+' ×'+(st.h[k]||0)).join(' · ')+'.',STOCKS.map(([k,n])=>{const p=st.p[k];return {label:n+' ('+k+') · '+fmt(p)+' · acheter ×10',off:!afford(p*10),fn:()=>{if(!pay(Math.round(p*10)))return;st.h[k]=(st.h[k]||0)+10;save();toast('Achat de 10 '+k+'.','good');MET.invest();}};}).concat(STOCKS.filter(([k])=>st.h[k]).map(([k,n])=>({label:'Vendre '+st.h[k]+' '+k+' · '+fmt(st.h[k]*st.p[k]),fn:()=>{state.bank+=Math.round(st.h[k]*st.p[k]);st.h[k]=0;save();toast('Titres '+k+' vendus.','good');MET.invest();}}))));};
const SECT={conseil:'Conseil & stratégie',tech:'Technologie',import:'Import-export',finance:'Finance',media:'Médias & communication'};MET.SECT=SECT;
MET.company=function(b){const B=S.biz,officeHere=b&&(S.own[MET.unitKey(b,'office')]||(S.rent[MET.unitKey(b,'office')]>gameMin));
  if(!B){openPanel('Créer mon entreprise','Immatriculation au registre du commerce : '+fmt(2500)+'. Choisis un secteur, puis recrute et développe-toi depuis ton bureau.',Object.keys(SECT).map(s=>({label:SECT[s],off:!afford(2500),fn:()=>{if(!pay(2500))return;const nm=(state.name||'Alex').split(' ').pop()+' '+({conseil:'Partners',tech:'Labs',import:'Trading',finance:'Capital',media:'Studio'}[s]);S.biz={name:nm,sector:s,staff:1,level:0,cash:0,office:officeHere?b.key:null,hist:[]};save();toast('Entreprise « '+nm+' » créée.','good');}})));return;}
  if(officeHere&&B.office!==b.key){B.office=b.key;save();}
  openPanel(B.name+' · '+SECT[B.sector],'Effectif : '+B.staff+' · niveau '+B.level+' · siège : '+(B.office?(MET.byKey.get(B.office)||{}).name:'aucun (pénalité de domiciliation)')+' · trésorerie à encaisser : '+fmt(B.cash||0)+'. 7 derniers jours : '+((B.hist||[]).join(' / ')||'—')+'.',[
    {label:'Encaisser la trésorerie · '+fmt(Math.max(0,B.cash||0)),off:!(B.cash>0),fn:()=>{state.bank+=B.cash;B.cash=0;save();toast('Trésorerie virée sur ton compte.','good');}},
    {label:'Recruter un collaborateur · '+fmt(1500),off:!afford(1500)||B.staff>=40,fn:()=>{if(!pay(1500))return;B.staff++;save();toast('Nouveau collaborateur recruté ('+B.staff+').','good');}},
    {label:'Licencier un collaborateur',off:B.staff<=1,fn:()=>{B.staff--;save();toast('Effectif : '+B.staff+'.','warn');}},
    {label:'Développer l’activité (niveau '+(B.level+1)+') · '+fmt(12000*(B.level+1)),off:!afford(12000*(B.level+1))||B.level>=5,fn:()=>{if(!pay(12000*(B.level+1)))return;B.level++;save();toast('Activité développée.','good');}},
    MG29.act('Réunion client · négocier un contrat',0,'haggle',{id:'met46-deal',title:'Négociation commerciale',min:30,gain:{rep:1},done:s=>{const g=Math.round(400+s*1800*(1+B.level*.3));B.cash=(B.cash||0)+g;save();toast('Contrat signé : +'+fmt(g)+' de trésorerie.','good');}}),
    {label:'Domicilier le siège ici',off:!officeHere||B.office===(b&&b.key),fn:()=>{B.office=b.key;save();toast('Siège transféré à '+b.name+'.','good');}},
    {label:'Céder l’entreprise · '+fmt(Math.round(8000+B.staff*2500+B.level*15000)),fn:()=>{state.bank+=Math.round(8000+B.staff*2500+B.level*15000);S.biz=null;save();toast('Entreprise cédée.','good');}}]);};
/* missions métropolitaines : livraison, transport, secours */
MET.mission=function(kind,from,reward,label){const pool=MET.blds.filter(b=>b!==from&&b.dist.city!=='sol'&&Math.hypot(b.door.x-from.door.x,b.door.z-from.door.z)>250);const to=pick(pool.length?pool:MET.blds);
  S.mission={kind,to:to.key,reward:reward||Math.round(80+Math.hypot(to.door.x-from.door.x,to.door.z-from.door.z)*.12),t0:gameMin,label:label||'Mission'};save();wp={x:to.door.x,z:to.door.z,l:(label||'Mission')+' · '+to.name};toast((label||'Mission')+' : direction '+to.name+'. GPS activé.','good');};
function missionTick(){const M=S.mission;if(!M)return;const b=MET.byKey.get(M.to);if(!b){S.mission=null;return;}if(Math.hypot(player.x-b.door.x,player.z-b.door.z)<7){const late=gameMin-M.t0>240,g=Math.round(M.reward*(late?.6:1));state.cash+=g;state.earned=(state.earned||0)+g;state.rep+=late?0:1;S.mission=null;save();wp=null;toast(M.label+' terminée'+(late?' (en retard)':'')+' : +'+fmt(g)+'.','good');}}

/* ---------------- portes, handlers, ouverture ---------------- */
MET.on=(prefix,fn)=>{MET.handlers[prefix]=fn;};
const _os=openSpot;openSpot=function(id){if(typeof id==='string'){
  if(id.startsWith('met46:')){const b=MET.byKey.get(id.slice(6));if(b){MET.enter(b);return;}}
  if(id.startsWith('met46x:')){const k=id.slice(7).split(':')[0],h=MET.handlers[k];if(h){h(id.slice(7));return;}}}
  _os(id);};
MET.enter=function(b){if(b.gate&&!b.gate(b))return;if(b.onEnter){b.onEnter(b);return;}if(MET.openRoom)MET.openRoom(b,b.first||'main');else openPanel(b.name,b.desc||'',[]);};
/* correctif : les intérieurs v44 n'avaient pas de liste de repères (plantage à la sortie) */
const _lv=leaveInterior;leaveInterior=function(){const R=player.inside;if(R&&!R.sp)R.sp=[];_lv();if(MET.afterLeave)MET.afterLeave(R);};

/* ---------------- guide téléphone « Métropole » ---------------- */
let tab='Quartiers',dsel=null;
function go(x,z,l){wp={x,z,l};toast('GPS vers '+l+'.','good');}
function app(b){const bar=mk('div','seg26');['Quartiers','Lieux','Immobilier','Entreprise','Transports','Réglages'].forEach(t=>bar.appendChild(mk('button',t===tab?'on':'',t,()=>{tab=t;phOpen(phApp);})));b.appendChild(bar);
  if(tab==='Quartiers'){b.appendChild(mk('p','dim','La Métropole des Trois Cités · '+MET.districts.length+' quartiers · '+MET.blds.length+' ensembles architecturaux. Chargés autour de toi : '+MET.districts.filter(d=>d.loaded).length+'.'));
    MET.districts.forEach(D=>{const r=mk('button','prow',null,()=>{dsel=D.key;tab='Lieux';phOpen(phApp);});r.appendChild(mk('b',null,(S.off[D.key]?'⏸ ':D.loaded?'🟢 ':'⚪ ')+D.name));r.appendChild(mk('span',null,(D.sub||'')+' · '+D.b.length+' lieux · '+Math.round(Math.max(0,Math.hypot(D.cx-player.x,D.cz-player.z)-D.r))+' m'));b.appendChild(r);});}
  else if(tab==='Lieux'){const list=MET.blds.filter(q=>!dsel||q.dist.key===dsel).filter(q=>!q.hidden);b.appendChild(mk('p','dim',(dsel?(MET.districts.find(d=>d.key===dsel)||{}).name:'Tous les quartiers')+' · touche un lieu pour le GPS.'));if(dsel)b.appendChild(mk('button','pbtn','Tous les quartiers',()=>{dsel=null;phOpen(phApp);}));
    list.forEach(q=>{const r=mk('button','prow',null,()=>go(q.door.x,q.door.z,q.name));r.appendChild(mk('b',null,q.emoji+' '+q.name));r.appendChild(mk('span',null,q.cat+' · '+q.dist.name+' · '+Math.round(Math.hypot(q.door.x-player.x,q.door.z-player.z))+' m'));b.appendChild(r);});}
  else if(tab==='Immobilier'){const own=Object.keys(S.own),rent=Object.keys(S.rent).filter(k=>S.rent[k]>gameMin);b.appendChild(mk('p','dim','Propriétés : '+own.length+' · locations actives : '+rent.length+'. Charges quotidiennes : '+fmt(own.reduce((t,k)=>{const [bk,u]=k.split('#'),bb=MET.byKey.get(bk);return t+Math.round((UNITS[u]||{ch:0}).ch*(bb?MET.mult(bb):1));},0))+'.'));
    own.concat(rent).forEach(k=>{const [bk,u]=k.split('#'),q=MET.byKey.get(bk);if(!q)return;const r=mk('button','prow',null,()=>go(q.door.x,q.door.z,q.name));r.appendChild(mk('b',null,(S.own[k]?'🔑 ':'🕑 ')+(UNITS[u]||{}).n+' · '+q.name));r.appendChild(mk('span',null,q.dist.name+(S.garage[bk]?' · garage '+S.garage[bk].slot:'')+(S.own[k]?'':' · fin dans '+Math.ceil((S.rent[k]-gameMin)/60)+' h')));b.appendChild(r);});
    if(!own.length&&!rent.length)b.appendChild(mk('p','dim','Visite Platinum Heights, l’Aurore Waterfront ou Pearl Island pour acheter ou louer.'));}
  else if(tab==='Entreprise'){const B=S.biz;b.appendChild(mk('p','dim',B?B.name+' · '+SECT[B.sector]+' · '+B.staff+' collaborateurs · trésorerie '+fmt(B.cash||0):'Aucune entreprise. Loue un plateau à l’Aurore Tower ou au World Trade Center, puis immatricule ta société.'));
    const st=stocks();b.appendChild(mk('p','dim','Bourse · '+STOCKS.map(([k])=>k+' '+st.p[k]).join(' · ')));const ex=MET.byKey.get('aurore-exchange');if(ex)b.appendChild(mk('button','pbtn','📈 GPS Aurore Exchange',()=>go(ex.door.x,ex.door.z,ex.name)));
    if(S.mission){const t=MET.byKey.get(S.mission.to);if(t)b.appendChild(mk('button','pbtn hot','🧭 Mission en cours · '+t.name,()=>go(t.door.x,t.door.z,t.name)));}}
  else if(tab==='Transports'){Object.values(MET.lines).forEach(l=>{b.appendChild(mk('b',null,l.icon+' '+l.name));l.stops.forEach(s=>{const r=mk('button','prow',null,()=>go(s.x,s.z,l.name+' · '+s.n));r.appendChild(mk('b',null,s.n));r.appendChild(mk('span',null,Math.round(Math.hypot(s.x-player.x,s.z-player.z))+' m'));b.appendChild(r);});});
    b.appendChild(mk('p','dim','Abonnement Pass Métropole : '+(S.pass>day()?'actif':'non')+' · trajets illimités métro, cars et TGV central.'));}
  else{b.appendChild(mk('p','dim','Chargement progressif automatique des quartiers autour de toi. Désactive un quartier pour alléger ton iPhone.'));
    b.appendChild(mk('button','pbtn'+(S.auto?' hot':''),'Streaming automatique : '+(S.auto?'activé':'désactivé'),()=>{S.auto=!S.auto;save();phOpen(phApp);}));
    b.appendChild(mk('button','pbtn','Niveau de détail : '+({std:'Standard 50/150/350 m',eco:'Économie 36/110/260 m',ultra:'Ultra 70/200/420 m'}[S.q]),()=>{S.q=S.q==='std'?'eco':S.q==='eco'?'ultra':'std';save();MET.blds.forEach(q=>q.lvl=-1);phOpen(phApp);}));
    MET.districts.forEach(D=>b.appendChild(mk('button','pbtn',(S.off[D.key]?'Activer · ':'Désactiver · ')+D.name+(D.ms!=null&&D.loaded?' ('+D.ms+' ms)':''),()=>{if(S.off[D.key])MET.load(D.key);else MET.unload(D.key);phOpen(phApp);})));}}
MET.app=app;

/* ---------------- branchements ---------------- */
MET.builders=[];MET.onBuild=f=>MET.builders.push(f);
const _bd=buildDecor;buildDecor=function(){_bd();try{MET.builders.forEach(f=>{try{f();}catch(e){console.warn('met46 build',e);}});flushRoads();flushLamps();flushTrees();flushStat();
  if(Array.isArray(APPS)&&!APPS.some(a=>a[0]==='Métropole'))APPS.push(['Métropole','🏙️','#e2b04a,#3a2a66',app]);MET.ready=true;}catch(e){console.warn('met46',e);}};
let ecoT=0;
let lastTick=0;setInterval(()=>{if(MET.ready&&started&&performance.now()-lastTick>500){try{lodTick(.5);}catch(e){}}},500);
const _up=update;update=function(dt){_up(dt);if(!MET.ready)return;lastTick=performance.now();try{lodTick(dt);npcTick(dt);ecoT-=dt;if(ecoT<=0){ecoT=1;nightTick();dailyTick();missionTick();if(MET.tick1)MET.tick1();}if(MET.tick)MET.tick(dt);}catch(e){if(!MET.err){MET.err=1;console.warn('met46 tick',e);}}};
const _sp=saveProgress;saveProgress=function(){_sp.apply(this,arguments);save();};
if(typeof CHANGELOG!=='undefined'&&CHANGELOG.unshift)CHANGELOG.unshift(['v46 · Fondations métropolitaines','Noyau de quartiers streamés, LOD 4 niveaux, intérieurs à la demande, économie et premiers bâtiments d’Aurore Business District. Les autres quartiers et les liaisons sont déployés en v47.']);
})();
