'use strict';
/* ==========================================================================
   v27 · MONDE AGRANDI
   - Port-Aurore passe de 512 m à ~1 760 m de large : zone aéroportuaire à l'ouest,
     quartier pavillonnaire « Les Hauts-Jardins » au nord, Stade Aurore et zone
     d'activités à l'est, périphérique, forêts, éoliennes, collines repoussées.
   - Aéroport International de Port-Aurore (PAX) : terminal ouvert (enregistrement,
     sûreté, salle d'attente, duty free, café, porte A1), piste 36/18, tour, hangar.
   - Île de Solenne (SLN) : seconde carte, aéroport, village, plage, hôtel, marché.
   ========================================================================== */
function npc27(s){return makePerson(s!=null?s:pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{});}
const W27={parts:[],glass:[],emis:[],anim:[],seats:{pax:[],sol:[]},terms:{},gates:{},npcCars:[],walkers:[],lampMats:[],runwayLights:[],built:false,zones:[]};
const U27=new THREE.BoxGeometry(1,1,1);
const CY27=new THREE.CylinderGeometry(1,1,1,14);
const CY27L=new THREE.CylinderGeometry(1,1,1,8);
const CONE27=new THREE.ConeGeometry(1,1,10);
function b27(x,y,z,w,h,d,c,ry,arr){(arr||W27.parts).push(pp(U27,x,y,z,c,w,h,d,0,ry||0,0));}
function c27(x,y,z,r,h,c,arr,lo){(arr||W27.parts).push(pp(lo?CY27L:CY27,x,y,z,c,r,h,r));}
function col27(x0,x1,z0,z1,big){boxes.push({x0:Math.min(x0,x1),x1:Math.max(x0,x1),z0:Math.min(z0,z1),z1:Math.max(z0,z1),big:!!big});return boxes[boxes.length-1];}
function flush27(arr,mat,cast,parent){if(!arr.length)return null;const m=new THREE.Mesh(mergeParts(arr),mat);m.castShadow=!!cast;m.receiveShadow=true;(parent||scene).add(m);arr.length=0;return m;}
const dayK27=()=>{const h=(gameMin/60)%24,a=(h-6)/12*Math.PI,s=Math.sin(a);return s>0?clamp(s*1.4,0,1):0;};
/* ---------- matériaux partagés ---------- */
const M27={};
function mats27(){if(M27.vc)return M27;
  M27.vc=new THREE.MeshLambertMaterial({vertexColors:true});
  M27.vcS=new THREE.MeshPhongMaterial({vertexColors:true,shininess:60,specular:0x555555});
  M27.glass=new THREE.MeshPhongMaterial({color:0x8fb8d0,transparent:true,opacity:.32,shininess:110,specular:0xffffff,depthWrite:false,side:THREE.DoubleSide});
  M27.glassT=new THREE.MeshPhongMaterial({color:0x2c4a63,shininess:120,specular:0xbfe3ff});
  M27.emis=new THREE.MeshBasicMaterial({vertexColors:true});
  const tex=(b,a,r)=>{const t=noiseTex(b,a,1);t.repeat.set(r,r);return t;};
  M27.asph=new THREE.MeshPhongMaterial({map:noiseTex('#30343b',20,1),specular:0x0d0d0d,shininess:10});
  M27.conc=new THREE.MeshLambertMaterial({map:noiseTex('#9a9d9f',16,1)});
  M27.apron=new THREE.MeshLambertMaterial({map:noiseTex('#a9acae',12,1)});
  M27.grass=new THREE.MeshLambertMaterial({map:noiseTex('#46744a',26,1)});
  M27.grassS=new THREE.MeshLambertMaterial({map:noiseTex('#5f9a4e',26,1)});
  M27.sand=new THREE.MeshLambertMaterial({map:noiseTex('#e6d3a0',18,1)});
  M27.lamp=new THREE.MeshBasicMaterial({color:0xffd27a});
  M27.floor=new THREE.MeshPhongMaterial({map:tileTex('#d8d4cc'),shininess:70,specular:0x777777});
  M27.carpet=new THREE.MeshLambertMaterial({map:noiseTex('#2b3f63',14,1)});
  return M27;
}
/* surface plane texturée (répétition proportionnelle à la taille) */
function surf27(x,z,w,d,y,mat,rep,parent,ry){const m=mat.clone();if(mat.map){m.map=mat.map.clone();m.map.needsUpdate=true;m.map.wrapS=m.map.wrapT=THREE.RepeatWrapping;m.map.repeat.set(w/(rep||8),d/(rep||8));}
  const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);p.rotation.x=-Math.PI/2;if(ry)p.rotation.z=ry;p.position.set(x,y,z);p.receiveShadow=true;(parent||scene).add(p);return p;}
/* panneau texte (canvas) */
function sign27(lines,w,h,bg,fg,o){o=o||{};const ppu=Math.min(96,2048/w),c=document.createElement('canvas');c.width=Math.max(32,Math.round(w*ppu));c.height=Math.max(16,Math.round(h*ppu));const g=c.getContext('2d');
  if(bg){g.fillStyle=bg;g.fillRect(0,0,c.width,c.height);}if(o.bar){g.fillStyle=o.bar;g.fillRect(0,c.height-c.height*.1,c.width,c.height*.1);}
  if(o.draw)o.draw(g,c.width,c.height);
  lines=Array.isArray(lines)?lines:[lines];const n=lines.length;
  lines.forEach((t,i)=>{const sz=c.height*(o.size||(n>1?(i?.26:.42):.58));g.font=(i&&n>1?'600 ':'700 ')+Math.round(sz)+'px Rajdhani, "Arial Narrow", sans-serif';g.fillStyle=i&&o.fg2?o.fg2:fg;g.textAlign=o.align||'center';g.textBaseline='middle';
    if(o.track){try{g.letterSpacing=Math.round(sz*o.track)+'px';}catch(e){}}
    const y=n>1?c.height*(i?(.42+.3*i):.36):c.height/2+2;g.fillText(t,o.align==='left'?c.height*.35:c.width/2,y);});
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:!bg,side:o.ds?THREE.DoubleSide:THREE.FrontSide}));return m;}
function addSpot27(x,z,id,color,label,sc){addSpot(x,z,id,color,label);const s=spots[spots.length-1];if(s&&s.b){s.b.scale.set(sc||.7,.6,sc||.7);s.b.position.y=2.6;}return s;}
/* arbres instanciés (forêts, palmiers) — collisions seulement dans la zone jouable */
function trees27(list){const G={};list.forEach(t=>{(G[t.type]=G[t.type]||[]).push(t);if(t.col)boxes.push({x0:t.x-.35,x1:t.x+.35,z0:t.z-.35,z1:t.z+.35});});
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  Object.keys(G).forEach(ty=>{const L=G[ty],im=new THREE.InstancedMesh(treeGeo(ty),mat,L.length);
    L.forEach((t,i)=>{dummy.position.set(t.x,0.05,t.z);dummy.rotation.set(0,rand(0,6.28),0);const s=t.s*(ty==='palm'?1.25:1);dummy.scale.set(s,s*rand(.92,1.12),s);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);const v=rand(.82,1.12);im.setColorAt(i,new THREE.Color(v,v*rand(.96,1.04),v*rand(.9,1)));});
    im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;scene.add(im);});}
/* lampadaires simples (poteau + tête lumineuse) */
function lamp27(x,z,h,ry){h=h||8;c27(x,h/2,z,.14,h,0x4a4f57,null,true);const fx=Math.sin(ry||0),fz=Math.cos(ry||0);b27(x+fx*.9,h,z+fz*.9,.25,.12,2,0x4a4f57,ry);b27(x+fx*1.6,h-.12,z+fz*1.6,.5,.12,.9,0xffffff,ry,W27.emis);}
/* route : asphalte + pointillés */
function road27(x0,z0,x1,z1,w,o){o=o||{};const L=Math.hypot(x1-x0,z1-z0),cx=(x0+x1)/2,cz=(z0+z1)/2,ry=Math.atan2(x1-x0,z1-z0);
  const m=surf27(cx,cz,w,L,o.y||0.06,o.mat||M27.asph,10);m.rotation.z=ry;
  if(o.dash!==false){const n=Math.floor(L/9),ux=(x1-x0)/L,uz=(z1-z0)/L;for(let i=0;i<n;i++){const t=(i+.5)*9-L/2;b27(cx+ux*t,(o.y||.06)+.02,cz+uz*t,.22,.02,3.6,o.dashC||0xd8d8c4,ry);}
    [-1,1].forEach(s=>{const nx=uz*s*(w/2-.6),nz=-ux*s*(w/2-.6);b27(cx+nx,(o.y||.06)+.02,cz+nz,.16,.02,L,0xbfc2b8,ry);});}
  if(o.lamps){const n=Math.floor(L/o.lamps),ux=(x1-x0)/L,uz=(z1-z0)/L;for(let i=0;i<=n;i++){const t=i*o.lamps-L/2,s=i%2?1:-1,nx=uz*s*(w/2+1.2),nz=-ux*s*(w/2+1.2);lamp27(cx+ux*t+nx,cz+uz*t+nz,8,Math.atan2(-nx,-nz));}}
  return m;}
/* maison individuelle (front orienté vers ry) */
const ROOFC27=[0xa0482f,0x8b3b2a,0x5b6470,0x6e4a3a,0x3f4a57,0xb2573a],WALLC27=[0xe9dfcc,0xd8c7a8,0xc9d6dd,0xe6d1c1,0xf1ece2,0xbfcfb8,0xe8c9a0,0xd9b8b8];
function house27(x,z,ry,o){o=o||{};const w=o.w||rand(9,12),d=o.d||rand(8,10),fl=o.fl||(Math.random()<.45?2:1),h=fl*3.2,wc=o.wall||pick(WALLC27),rc=o.roof||pick(ROOFC27),ca=Math.cos(ry),sa=Math.sin(ry);
  const R=(lx,lz)=>[x+lx*ca+lz*sa,z-lx*sa+lz*ca],P=W27.parts;
  const bx_=(lx,y,lz,ww,hh,dd,c,arr)=>{const p=R(lx,lz);b27(p[0],y,p[1],ww,hh,dd,c,ry,arr);};
  bx_(0,.08,0,w+8,.12,d+12,o.lawn||0x5d8f4f);
  bx_(0,h/2+.14,0,w,h,d,wc);bx_(0,.3,0,w+.3,.35,d+.3,shade(wc,.7));
  if(o.flat){bx_(0,h+.4,0,w+.6,.5,d+.6,shade(wc,.85));}
  else{const g=gableGeo(w,d,o.hr||2.6,.6),e=gableEnds(w,d,o.hr||2.6),p=R(0,0);P.push(pp(g,p[0],h+.14,p[1],rc,1,1,1,0,ry,0));P.push(pp(e,p[0],h+.14,p[1],wc,1,1,1,0,ry,0));}
  const fz=d/2+.03;bx_(-w*.18,1.2,fz,1.1,2.2,.08,0x5a3a26);bx_(-w*.18,2.45,fz+.2,1.8,.12,.6,shade(wc,.75));
  for(let f=0;f<fl;f++){[w*.18,w*.36].forEach(lx=>bx_(lx,1.7+f*3.2,fz,1.3,1.2,.08,0x2e4455));if(f)bx_(-w*.18,1.7+f*3.2,fz,1.3,1.2,.08,0x2e4455);
    [-1,1].forEach(s=>bx_(s*(w/2+.03),1.7+f*3.2,0,.08,1.2,1.4,0x2e4455));}
  if(o.veranda){for(let i=-2;i<=2;i++)bx_(i*w/4.4,1.4,fz+1.6,.18,2.6,.18,0xf4f1ea);bx_(0,2.8,fz+1.6,w+.4,.14,3.4,0xf4f1ea);}
  if(!o.noFence){[-1,1].forEach(s=>bx_(s*(w/2+3.6),.5,d/2+3,.12,.8,6,0xe8e6df));bx_(w*.22,.5,d/2+6,w*.6+3,.8,.12,0xe8e6df);bx_(-w/2-2.2,.5,d/2+6,2.6,.8,.12,0xe8e6df);}
  bx_(-w*.18,.13,d/2+3.2,2,.04,6.2,0xb9b4a8);
  const a=R(-w/2,-d/2),b=R(w/2,d/2);col27(a[0],b[0],a[1],b[1],true);
  return R(-w*.18,d/2+6.5);}
/* ======================= collines & terrain étendu ======================= */
buildHills=function(){
  mats27();
  const land=surf27(0,-300,3400,2800,-0.09,M27.grass,14);land.receiveShadow=true;
  const oc=sea?sea.material.clone():new THREE.MeshPhongMaterial({color:0x1f6f9c});if(oc.normalMap){oc.normalMap=oc.normalMap.clone();oc.normalMap.needsUpdate=true;oc.normalMap.repeat.set(600,600);}oc.transparent=false;oc.opacity=1;
  const ocean=new THREE.Mesh(new THREE.PlaneGeometry(40000,40000),oc);ocean.rotation.x=-Math.PI/2;ocean.position.set(-4000,-0.6,0);scene.add(ocean);W27.ocean=ocean;
  for(let i=0;i<46;i++){
    const a=0.18-i/45*(Math.PI+0.36);if(Math.abs(angDiff(a,-2.14))<0.2)continue;
    const r=rand(1260,1420),x=Math.cos(a)*r,z=Math.sin(a)*r*.95-120,sx=rand(90,170),sy=rand(40,110),sz=rand(60,100);
    let g=new THREE.IcosahedronGeometry(1,2);if(g.index)g=g.toNonIndexed();const p=g.attributes.position;
    for(let k=0;k<p.count;k++){const y=p.getY(k);p.setY(k,y<0?y*.1:y*(1+.14*Math.sin(p.getX(k)*4+i)+.08*Math.cos(p.getZ(k)*6)));}
    g.computeVertexNormals();const m=new THREE.Mesh(g,lamb(pick([0x4f7a55,0x5d7f5a,0x58775a,0x6b8a6e,0x557c5c])));m.scale.set(sx,sy,sz);m.rotation.y=a+Math.PI/2;m.position.set(x,-3,z);scene.add(m);
  }
};
/* ======================= routes & quartiers ======================= */
function buildRoads27(){
  road27(-280,-32,-330,-32,16,{lamps:22});            // autoroute de l'aéroport
  road27(-300,-307,-300,-40,14,{lamps:26});           // périphérique ouest
  road27(-307,-300,560,-300,14,{lamps:26});           // boulevard Nord
  road27(300,-293,300,196,14,{lamps:26});             // périphérique est
  road27(280,-32,293,-32,14,{dash:false});road27(280,96,293,96,14,{dash:false});
  [-160,-32,96].forEach(x=>road27(x,-280,x,-646,12,{lamps:30}));
  road27(-166,-470,102,-470,12,{});road27(-166,-640,102,-640,12,{});
  road27(307,-60,430,-60,12,{});
  // portique « Aéroport » au-dessus de l'autoroute
  [-1,1].forEach(s=>b27(-312,4,-32+s*9.5,.5,8,.5,0x6c737b));b27(-312,8,-32,.6,.6,19.5,0x6c737b);
  const g=sign27(['✈  AÉROPORT INTERNATIONAL','PAX · DÉPARTS · ARRIVÉES  →'],12,3,'#0b4a8f','#ffffff',{fg2:'#cfe3ff'});g.position.set(-311.6,9.6,-32);g.rotation.y=Math.PI/2;scene.add(g);
  const g2=g.clone();g2.position.x=-312.4;g2.rotation.y=-Math.PI/2;scene.add(g2);
}
function buildSuburb27(){
  const T=[];
  [-160,-32,96].forEach(ax=>{for(let z=-312;z>=-628;z-=26){if(Math.abs(z+470)<16||Math.abs(z+640)<14||z>-300)continue;
    [-1,1].forEach(s=>{const hx=ax+s*21,door=house27(hx,z,s<0?Math.PI/2:-Math.PI/2,{});if(Math.random()<.35)addCar(ax+s*9.2,z+rand(-4,4),Math.random()<.5?0:Math.PI,pick(CAR_COLORS),'parked',pick(['sedan','suv','toyota','honda','hyundai','jeep']));
      T.push({x:hx+s*9,z:z+rand(-9,9),s:rand(.9,1.3),type:Math.random()<.5?'round':'flam',col:true});});}});
  // parc de quartier
  surf27(-96,-555,40,60,.07,M27.grassS,6);for(let i=0;i<14;i++)T.push({x:-96+rand(-17,17),z:-555+rand(-26,26),s:rand(1,1.4),type:pick(['round','pine','flam']),col:true});
  const s=sign27(['LES HAUTS-JARDINS','Quartier résidentiel'],8,2.4,'#24543a','#ffffff',{fg2:'#cfe8d6'});s.position.set(-32+8,2.6,-292);scene.add(s);[-1,1].forEach(k=>b27(-32+8+k*3.8,1.3,-292.05,.18,2.6,.18,0x2a2f35));
  W27.zones.push({id:'jardins',n:'Les Hauts-Jardins',s:'Quartier résidentiel',x0:-200,x1:140,z0:-660,z1:-285});
  return T;}
function buildStadium27(){
  const cx=520,cz=-150,A=74,B=52;mats27();
  surf27(cx,cz,74,46,.08,M27.grassS,4);
  const L=(x,z,w,d)=>b27(x,.1,z,w,.02,d,0xf4f4ee);
  L(cx,cz,.3,46);[-1,1].forEach(s=>{L(cx+s*37,cz,.3,46);L(cx+s*30,cz,.3,20);L(cx+s*33.5,cz-10,7,.3);L(cx+s*33.5,cz+10,7,.3);});L(cx,cz-23,74,.3);L(cx,cz+23,74,.3);
  W27.parts.push(pp(new THREE.TorusGeometry(7,.15,4,32),cx,.11,cz,0xf4f4ee,1,1,1,Math.PI/2,0,0));
  const N=44;for(let i=0;i<N;i++){const t=i/N*Math.PI*2;if(Math.abs(Math.cos(t))>.985)continue;
    const ct=Math.cos(t),st=Math.sin(t),ry=Math.atan2(-B*ct,-A*st),seg=2*Math.PI*Math.sqrt((A*A+B*B)/2)/N*1.08;
    for(let k=0;k<5;k++){const rr=1+k*.075,x=cx+ct*A*rr,z=cz+st*B*rr;b27(x,1.4+k*2.1,z,seg*rr,2.8+k*.2,4.4,k%2?0x1d4f8a:0xf5c451,ry);}
    const ro=1.42,x=cx+ct*A*ro,z=cz+st*B*ro;b27(x,7.5,z,seg*ro,15,1.2,0xdfe3e6,ry);b27(cx+ct*A*1.33,15.5,cz+st*B*1.33,seg*1.4,.5,9,0xc9ced3,ry);
    for(let q=0;q<3;q++){const rq=1.05+q*.15;const px=cx+ct*A*rq,pz=cz+st*B*rq;col27(px-2.2,px+2.2,pz-2.2,pz+2.2,true);}
  }
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=cx+a*A*1.3,z=cz+b*B*1.35;c27(x,19,z,.5,38,0x8a9096);b27(x,38.5,z,6,3,.6,0xffffff,Math.atan2(cx-x,cz-z),W27.emis);col27(x-.6,x+.6,z-.6,z+.6);});
  const s=sign27('STADE AURORE',22,3.4,'#0b1b3a','#f5c451');s.position.set(cx,18.6,cz+B*1.44+.8);scene.add(s);
  road27(cx-90,cz+B*1.5+12,cx+90,cz+B*1.5+12,12,{lamps:30});surf27(cx,cz+B*1.5+30,160,22,.07,M27.asph,10);
  addSpot27(cx+A*1.55,cz,'zone27:stade',0xf5c451,'Stade Aurore · Match du jour');
  W27.zones.push({id:'stade',n:'Stade Aurore',s:'Est · 32 000 places',x0:400,x1:660,z0:-260,z1:-40});
}
function buildIndustry27(){
  const T=[];surf27(560,120,330,150,.065,M27.conc,10);
  [[400,90,40,30],[460,150,46,28],[540,80,52,34],[640,150,60,32],[690,70,40,30]].forEach(([x,z,w,d],i)=>{
    const c=[0x8a949c,0xb98a5a,0x6f7f8f,0x9fb0bf,0x7d8a75][i];b27(x,6,z,w,12,d,c);for(let k=0;k<4;k++)b27(x-w/2+w/8+k*w/4,12.9,z,w/4-.4,1.8,d,shade(c,.8),0);
    for(let k=0;k<3;k++)b27(x-w/3+k*w/3,2.6,z+d/2+.05,5,4.8,.1,0x4a5058);col27(x-w/2,x+w/2,z-d/2,z+d/2,true);
    const s=sign27(['LOGISTIQUE','ATLANTIQUE','AURORE FRAIS','PORT-STOCK','CIMENTS DU LITTORAL'][i],12,1.6,'#20262e','#ffd27a');s.position.set(x,10.4,z+d/2+.08);scene.add(s);});
  for(let i=0;i<18;i++){const x=360+i%6*8.5,z=180+Math.floor(i/6)*2.8;b27(x,1.35+Math.floor(i/6)*2.7-Math.floor(i/6)*2.7,z,6,2.6,2.5,pick([0xc0392b,0x2e6fd1,0x2e9a6a,0xe0a526,0x7b4bb3]));}
  for(let i=0;i<3;i++){const x=600+i*9,z=196;c27(x,9,z,3.6,18,0xd8dcdf);W27.parts.push(pp(CONE27,x,19.3,z,0xc9ced3,3.7,2.6,3.7));col27(x-3.6,x+3.6,z-3.6,z+3.6,true);}
  W27.zones.push({id:'zae',n:'Zone d’activités',s:'Entrepôts · logistique',x0:330,x1:740,z0:40,z1:207});
  return T;}
function buildWind27(){
  W27.rotors=[];for(let i=0;i<6;i++){const x=320+i*80,z=-720+(i%2)*26;c27(x,30,z,1.1,60,0xf2f4f5);col27(x-1.2,x+1.2,z-1.2,z+1.2);
    const hub=new THREE.Group();hub.position.set(x,60,z+1.6);const bl=[];for(let k=0;k<3;k++){bl.push(pp(U27,0,9,0,0xf7f7f7,.9,18,.3,0,0,k*2.094));}
    const P=bl.map((p,k)=>{const m=new THREE.Matrix4().makeRotationZ(k*2.094);m.multiply(new THREE.Matrix4().makeTranslation(0,9,0)).multiply(new THREE.Matrix4().makeScale(.9,18,.3));return {g:U27,m,c:0xf7f7f7};});
    P.push(pp(sph(1.2),0,0,0,0xe9ecee));const m=new THREE.Mesh(mergeParts(P),M27.vc);m.castShadow=true;hub.add(m);b27(x,60,z-1,1.6,1.6,4,0xe9ecee);scene.add(hub);W27.rotors.push({g:hub,s:rand(.6,1)});}}
function forests27(){
  const T=[],ex=[[-290,290,-300,215],[-1005,-330,-260,215],[-800,-720,-760,215],[-200,140,-660,-280],[300,740,-300,215],[-320,580,-312,-288],[-306,-294,-307,-24],[300,750,-760,-680]];
  const free=(x,z)=>!ex.some(e=>x>e[0]-6&&x<e[1]+6&&z>e[2]-6&&z<e[3]+6)&&!(Math.abs(z+32)<14&&x<-270&&x>-360);
  for(let k=0,tr=0;k<430&&tr<9000;tr++){const x=rand(-990,750),z=rand(-750,200);if(!free(x,z))continue;const cl=Math.random()<.55;
    T.push({x,z,s:rand(.9,1.6),type:z<-400?(Math.random()<.65?'pine':'round'):pick(['round','round','pine','flam']),col:true});
    if(cl)for(let j=0;j<3;j++){const a=x+rand(-7,7),b=z+rand(-7,7);if(free(a,b))T.push({x:a,z:b,s:rand(.8,1.4),type:'pine',col:true});}k++;}
  for(let k=0;k<420;k++){const a=rand(0,Math.PI*2),r=rand(1050,1500),x=Math.cos(a)*r,z=Math.sin(a)*r-200;if(z>230&&Math.abs(x)<900)continue;T.push({x,z,s:rand(1.2,2),type:Math.random()<.6?'pine':'round'});}
  return T;}
/* ======================= trafic sur le périphérique ======================= */
function traffic27(){
  const path=[[-336,-140],[-336,-32],[-300,-32],[-300,-300],[300,-300],[300,190]];let L=0;const seg=[];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push({a,b,l,s0:L});L+=l;}
  W27.road={seg,L};
  for(let i=0;i<9;i++){const ty=i===0?'danfo':pick(['sedan','suv','toyota','bmw','honda','hyundai','benz','jeep','taxi']),c=addCar(0,0,0,ty==='danfo'?0xf2c200:ty==='taxi'?0xf5c400:pick(CAR_COLORS),'npc27',ty);
    c.p27={s:rand(0,L),dir:i%2?1:-1,v:rand(10,14),vm:rand(11,15)};W27.npcCars.push(c);}
}
function roadAt27(s,dir){const R=W27.road;s=clamp(s,0,R.L);let g=R.seg[R.seg.length-1];for(const q of R.seg)if(s<=q.s0+q.l){g=q;break;}
  const t=(s-g.s0)/g.l,ux=(g.b[0]-g.a[0])/g.l,uz=(g.b[1]-g.a[1])/g.l,x=g.a[0]+ux*g.l*t,z=g.a[1]+uz*g.l*t;const dx=ux*dir,dz=uz*dir;return {x:x-dz*3.4,z:z+dx*3.4,h:Math.atan2(dx,dz)};}
function tickTraffic27(dt){const R=W27.road;if(!R)return;W27.npcCars.forEach(c=>{if(player.car===c){c.p27.off=1;return;}if(c.kind!=='npc27')return;const q=c.p27;
  const ah={x:c.x+Math.sin(c.h)*9,z:c.z+Math.cos(c.h)*9};let blk=Math.hypot(ah.x-player.x,ah.z-player.z)<6.5;
  if(!blk)for(const o of W27.npcCars){if(o!==c&&o.p27&&o.p27.dir===q.dir&&!o.p27.off){const d=(o.p27.s-q.s)*q.dir;if(d>0&&d<13){blk=true;break;}}}
  for(const o of cars){if(o===c||o.kind==='npc27')continue;if(Math.hypot(o.x-ah.x,o.z-ah.z)<5){blk=true;break;}}
  q.v+=((blk?0:q.vm)-q.v)*Math.min(1,(blk?5:1.2)*dt);q.s+=q.v*dt*q.dir;
  if(q.s>R.L||q.s<0){const far=Math.hypot(c.x-player.x,c.z-player.z)>90;if(far){q.dir*=-1;q.s=clamp(q.s,0,R.L);}else{q.s=clamp(q.s,0,R.L);q.v=0;}}
  const p=roadAt27(q.s,q.dir);c.x=p.x;c.z=p.z;c.h+=angDiff(c.h,p.h)*Math.min(1,8*dt);c.v=q.v;});}
/* ======================= aéroport : terminal générique ======================= */
function terminal27(o){
  mats27();const G=new THREE.Group();G.position.set(o.pos[0],0,o.pos[1]);G.rotation.y=o.rot;scene.add(G);G.updateMatrixWorld(true);
  const D=o.D,Wd=o.W,H=o.H,hw=Wd/2,P=[],GL=[],EM=[],SH=[];
  const toW=(u,v)=>{const p=new THREE.Vector3(u,0,v).applyMatrix4(G.matrixWorld);return {x:p.x,z:p.z};};
  const hd=(u,v)=>{const a=toW(u,v),b=toW(u+1,v);return Math.atan2(b.x-a.x,b.z-a.z);};
  const colL=(u0,u1,v0,v1,big)=>{const a=toW(u0,v0),b=toW(u1,v1);return col27(a.x,b.x,a.z,b.z,big);};
  const B=(u,y,v,du,h,dv,c,arr)=>(arr||P).push(pp(U27,u,y,v,c,du,h,dv));
  const T={id:o.id,G,toW,hd,colL,D,W:Wd,H,o,doors:[],boards:[],seats:[]};W27.terms[o.id]=T;
  /* sol, toit, auvent */
  B(D/2,.1,0,D+2,.2,Wd+2,0xb9bcbe);const fl=surf27(D/2,0,D,Wd,.22,M27.floor,4,G);fl.position.set(D/2,.22,0);
  const uS=D*.48,uC=D*.26;
  const ca=surf27(0,0,D-uS-14,Wd*.76,.235,M27.carpet,6,G);ca.position.set((uS+D)/2+2,.235,0);
  B(D/2-7,H+.35,0,D+16,.7,Wd+4,0xeef1f3,SH);B(-14.5,H-.4,0,1.2,1.6,Wd+4,o.fascia||0x0b1b3a,SH);B(D+1.5,H-.4,0,1.2,1.6,Wd+4,o.fascia||0x0b1b3a,SH);
  [-1,1].forEach(s=>B(D/2-7,H-.4,s*(hw+1.6),D+16,1.6,.8,o.fascia||0x0b1b3a,SH));
  for(let v=-hw+10;v<=hw-10;v+=20){c27(-12.5,H/2,v,.35,H,0xd9dde1,P);colL(-12.9,-12.1,v-.4,v+.4);}
  for(let v=-hw+6;v<hw;v+=10)B(D/2,H-.05,v,D-4,.12,.5,0xffffff,EM);
  for(let u=10;u<D-4;u+=18)B(u,H+.72,0,6,.1,Wd*.8,0xbfe3ff,EM);
  /* façades vitrées avec portes coulissantes */
  const doorsV=o.doors||[-hw*.5,0,hw*.5],dw=6;
  const facade=(u,openings)=>{let segs=[[-hw,hw]];openings.forEach(c=>{const n=[];segs.forEach(([a,b])=>{if(c-dw/2>a&&c+dw/2<b){n.push([a,c-dw/2],[c+dw/2,b]);}else n.push([a,b]);});segs=n;});
    segs.forEach(([a,b])=>{const L=b-a,m=(a+b)/2;B(u,H/2,m,.12,H,L,0x9fc6dd,GL);colL(u-.3,u+.3,a,b);for(let v=a;v<=b+.01;v+=4)B(u,H/2,Math.min(v,b),.22,H,.16,0x2a3440);});
    B(u,3.4,0,.24,.16,Wd,0x2a3440);B(u,7,0,.24,.16,Wd,0x2a3440);};
  facade(0,doorsV);facade(D,o.bridgeV!=null?[o.bridgeV]:[]);if(o.bridgeV!=null)colL(D-.3,D+.3,o.bridgeV-dw/2,o.bridgeV+dw/2);
  [-1,1].forEach(s=>{B(D/2,H/2,s*hw,D,H,.6,0xe4e1da);colL(0,D,s*hw-.3,s*hw+.3,true);});
  doorsV.forEach(v=>{B(0,3.3,v,.5,.4,dw+.4,0x2a3440);const L=[],w=dw/2;[-1,1].forEach(s=>{const m=new THREE.Mesh(U27,M27.glass);m.scale.set(.1,3.1,w);m.position.set(0,1.75,v+s*w/2);G.add(m);L.push({m,s,v});});
    T.doors.push({L,u:0,v,w,open:0});const sg=sign27(o.doorSign||'DÉPARTS',4,.8,'#0b1b3a','#ffffff');sg.position.set(-.3,4.3,v);sg.rotation.y=-Math.PI/2;G.add(sg);});
  /* colonnes */
  for(let u=uC+12;u<D-6;u+=22)for(let v=-hw+16;v<hw-10;v+=24){if(Math.abs(v)<10||Math.abs(u-uS)<5)continue;c27(u,H/2,v,.55,H,0xf2f2ee,P);colL(u-.55,u+.55,v-.55,v+.55);}
  /* enregistrement */
  (o.checkin||[]).forEach(([v0,v1,name,bg,fg])=>{const m=(v0+v1)/2,L=v1-v0;B(uC,.75,m,1.3,1.1,L,0xe9e6df);B(uC-.66,.8,m,.06,.9,L,bg?hexOf(bg):0x0b1b3a);B(uC+1.4,.45,m,1.3,.5,L,0x2a2f35);B(uC+3,1.9,m,.4,3.4,L+1,bg?hexOf(bg):0x0b1b3a);
    for(let v=v0+1.5;v<v1;v+=3){B(uC-.1,1.42,v,.5,.35,.06,0x111418);}
    const sg=sign27([name,'ENREGISTREMENT · CHECK-IN'],Math.min(L,14),2.4,bg||'#0b1b3a',fg||'#ffffff',{fg2:'rgba(255,255,255,.75)'});sg.position.set(uC+2.75,4.5,m);sg.rotation.y=-Math.PI/2;G.add(sg);
    colL(uC-.7,uC+3.2,v0,v1);for(let k=0;k<Math.floor(L/6);k++){const p=npc27(bg?hexOf(bg):0x0b1b3a);const w=toW(uC+.9,v0+3+k*6);p.position.set(w.x,.22,w.z);p.rotation.y=hd(uC,v0)+Math.PI;scene.add(p);}
    for(let v=v0+1;v<v1;v+=3.3){c27(uC-4,.5,v,.05,1,0x9aa3ad,P);B(uC-4,.95,v+1.65,.04,.08,3.3,0xb32d2d);}});
  /* sûreté : cloison + portiques + barrière (ouverte avec un billet) */
  [[-hw,-3.2],[3.2,hw]].forEach(([a,b])=>{B(uS,1.6,(a+b)/2,.14,3,b-a,0xc9dbe6,GL);B(uS,3.15,(a+b)/2,.22,.12,b-a,0x2a3440);colL(uS-.3,uS+.3,a,b);});
  [-14,-7,0,7,14].forEach(v=>{B(uS,1.15,v-1.05,.6,2.3,.25,0xcfd4d8);B(uS,1.15,v+1.05,.6,2.3,.25,0xcfd4d8);B(uS,2.4,v,.6,.25,2.35,0xcfd4d8);B(uS,2.42,v,.62,.08,.6,v===0?0x4cd964:0xb32d2d,EM);
    if(v){B(uS-3.4,.85,v,4.4,.9,1,0x50575f);B(uS-3.4,1.5,v,1.6,.6,1.1,0x7f868d);colL(uS-5.6,uS-1.2,v-.5,v+.5);}});
  B(uS-3.4,.85,-1.8,4.4,.9,.8,0x50575f);colL(uS-5.6,uS-1.2,-2.2,-1.4);
  const gate=new THREE.Mesh(U27,new THREE.MeshPhongMaterial({color:0xb32d2d,transparent:true,opacity:.75}));gate.scale.set(.12,1.1,2);gate.position.set(uS+.5,.9,0);G.add(gate);
  const gw1=toW(uS+.2,-1.9),gw2=toW(uS+.8,1.9);T.secu={mesh:gate,box:{x0:Math.min(gw1.x,gw2.x),x1:Math.max(gw1.x,gw2.x),z0:Math.min(gw1.z,gw2.z),z1:Math.max(gw1.z,gw2.z)},locked:false};
  const ss=sign27(['CONTRÔLE DE SÛRETÉ','Billet et pièce d’identité'],10,2.2,'#20262e','#ffd27a',{fg2:'#d5dbe2'});ss.position.set(uS-.4,4.6,0);ss.rotation.y=-Math.PI/2;G.add(ss);
  /* salle d'attente */
  const sv=Wd*.36;for(let u=uS+9;u<D-10;u+=4.6){[[-sv,-6],[6,sv]].forEach(([a,b])=>{for(let c=a;c<b-6;c+=9.4){const e=Math.min(b,c+7.6);for(let v=c+.3;v<e;v+=.62){B(u,.55,v,.56,.1,.54,o.seat||0x1e3a5f);B(u-.3,.9,v,.08,.66,.54,o.seat||0x1e3a5f);T.seats.push({u,v});}
    B(u,.28,(c+e)/2,.3,.5,e-c,0x9aa3ad);colL(u-.38,u+.36,c,e);}});}
  /* duty free (côté -v) et café (côté +v) */
  const shop=(side,label,bg,fg,kind)=>{const v0=side*(hw-7),u0=uS+5,u1=uS+25;B((u0+u1)/2,.22,v0,u1-u0,.02,12,kind==='df'?0x2b2b33:0x6b4a2a);
    B(u0,2,v0,.3,4,12,0xe9e6df);colL(u0-.2,u0+.2,v0-6,v0+6);B(u1,2,v0,.3,4,12,0xe9e6df);colL(u1-.2,u1+.2,v0-6,v0+6);B((u0+u1)/2,4.2,v0-side*6,u1-u0,.5,.4,hexOf(bg));
    const sg=sign27(label,12,1.6,bg,fg);sg.position.set((u0+u1)/2,4.25,v0-side*6.25);sg.rotation.y=side>0?Math.PI:0;G.add(sg);
    if(kind==='df'){for(let k=0;k<3;k++){const u=u0+4+k*6;B(u,1,v0,1,2,7,0xdfe3e6);colL(u-.5,u+.5,v0-3.5,v0+3.5);for(let r=0;r<3;r++)for(let q=0;q<9;q++)B(u+(q%2?.3:-.3),.5+r*.6,v0-3+q*.75,.22,.3,.22,pick([0xd94f4f,0xf5c451,0x3d7be0,0x9b59b6,0x2e9a6a,0xffffff,0xff8fb1]));}}
    else{B(u1-3,.6,v0,1,1.2,8,0x3a2a1e);colL(u1-3.5,u1-2.5,v0-4,v0+4);B(u1-1.2,1.6,v0,.6,.8,1.2,0x9aa3ad);for(let k=0;k<4;k++){const u=u0+3+k*3.6,v=v0-side*1.5;c27(u,.75,v,.6,.06,0xf4f1ea,P);c27(u,.4,v,.06,.75,0x2a2f35,P);[-1,1].forEach(q=>B(u+q*.9,.45,v,.45,.08,.45,0x6b4a2a));}}
    return {u:(u0+u1)/2,v:v0-side*7.5};};
  const df=shop(-1,o.dfName||'DUTY FREE','#111317','#f5c451','df'),cf=shop(1,o.cafeName||'CAFÉ DES PISTES','#6b4a2a','#ffe9c7','cafe');
  /* porte d'embarquement */
  const vG=o.bridgeV!=null?o.bridgeV:0;B(D-4,.65,vG-3,1,1.1,3,0xe9e6df);B(D-4,.66,vG-3,1.02,.3,3.02,o.fasciaHex||0x0b1b3a);colL(D-4.5,D-3.5,vG-4.5,vG-1.5);
  const gs=sign27([o.gateName||'PORTE A1',o.gateSub||''],7,2,'#0b1b3a','#f5c451',{fg2:'#ffffff'});gs.position.set(D-1,4.2,vG);gs.rotation.y=-Math.PI/2;G.add(gs);
  /* FIDS : écrans des départs */
  const fc=document.createElement('canvas');fc.width=1024;fc.height=512;const ft=new THREE.CanvasTexture(fc);ft.anisotropy=4;T.fids={c:fc,t:ft,rows:o.fids||[]};
  const fm=new THREE.MeshBasicMaterial({map:ft});(o.boards||[[6,-hw*.32],[6,hw*.32],[uS+6,0]]).forEach(([u,v])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(9,4.5),fm);m.position.set(u,5.6,v);m.rotation.y=-Math.PI/2;G.add(m);B(u+.15,5.6,v,.25,4.8,9.3,0x15181c);B(u+.15,9.5,v,.08,3,.08,0x6c737b);});
  /* information + plantes + poubelles */
  const inf=[uC*.45,-hw*.62];c27(inf[0],.55,inf[1],1.6,1.1,0xe9e6df,P);c27(inf[0],1.12,inf[1],1.62,.08,0x0b1b3a,P);colL(inf[0]-1.6,inf[0]+1.6,inf[1]-1.6,inf[1]+1.6);
  const isg=sign27('i  INFORMATION',5,1,'#f5c451','#0b1b3a');isg.position.set(inf[0],3.2,inf[1]);isg.rotation.y=-Math.PI/2;G.add(isg);
  for(let k=0;k<8;k++){const u=k<4?uC-7:D-8,v=(k%4-1.5)*hw*.5;B(u,.5,v,1.4,1,1.4,0xd8d4cc);P.push(pp(blob(1,k),u,1.8,v,0x3f7a47,1.1,1.3,1.1));colL(u-.7,u+.7,v-.7,v+.7);}
  /* passerelle d'embarquement */
  if(o.bridgeV!=null){const bv=o.bridgeV;B(D+9.5,4.2,bv,19,2.9,2.9,0xd9dde1,SH);B(D+9.5,4.4,bv,19.05,.5,2.95,0x1d2a38);B(D+19.6,4.2,bv-1.6,3.4,3,3,0xc9ced3,SH);B(D+16,1.4,bv,.6,2.6,.6,0x6c737b);[-1,1].forEach(s=>c27(D+16,.4,bv+s*.8,.4,.3,0x222222,P));
    const bs=sign27(o.bridgeName||'AURORE AIRWAYS',8,.9,null,'#0b1b3a');bs.position.set(D+9.5,4.95,bv+1.47);G.add(bs);}
  /* enseigne extérieure */
  const big=sign27(o.title,Math.min(Wd*.7,90),5,null,'#ffffff',{track:.08,draw:(g,w,h)=>{g.fillStyle='rgba(11,27,58,.0)';g.fillRect(0,0,w,h);}});big.position.set(-15.2,H+3.3,0);big.rotation.y=-Math.PI/2;G.add(big);
  const bb=new THREE.Mesh(U27,new THREE.MeshLambertMaterial({color:o.fascia||0x0b1b3a}));bb.scale.set(.4,5.6,Math.min(Wd*.72,92));bb.position.set(-14.9,H+3.3,0);G.add(bb);
  const t1=flush27(P,M27.vc,true,G),t2=flush27(GL,M27.glass,false,G),t3=flush27(EM,M27.emis,false,G),t4=flush27(SH,M27.vc,false,G);if(t2)t2.renderOrder=2;
  /* positions utiles (monde) */
  T.spot={checkin:toW(uC-2.4,o.mainCheckV||0),secu:toW(uS-2.6,0),sortie:toW(uS+2.6,0),wait:toW(uS+11.5,-9),cafe:toW(cf.u,cf.v),df:toW(df.u,df.v),gate:toW(D-7,vG),info:toW(inf[0]-2.8,inf[1]),arr:toW(10,hw*.15),arrH:hd(0,0)+Math.PI,uS};
  T.plane={p:toW(D+35,(o.bridgeV||0)-5),h:hd(0,0)+Math.PI};
  T.seatsW=T.seats.map(s=>{const w=toW(s.u,s.v);return {x:w.x,z:w.z,h:hd(s.u,s.v)};});
  return T;}
/* FIDS : tableau d'affichage animé */
function drawFids27(T,title){const c=T.fids.c,g=c.getContext('2d'),W=c.width,H=c.height;g.fillStyle='#07090c';g.fillRect(0,0,W,H);
  g.fillStyle='#0b1b3a';g.fillRect(0,0,W,70);g.fillStyle='#f5c451';g.font='700 40px Rajdhani, Arial Narrow, sans-serif';g.textBaseline='middle';g.textAlign='left';g.fillText('✈  '+title,24,36);
  const mm=Math.floor(gameMin%1440),hh=String(Math.floor(mm/60)).padStart(2,'0'),mi=String(mm%60).padStart(2,'0');g.textAlign='right';g.fillStyle='#ffffff';g.fillText(hh+':'+mi,W-24,36);
  g.font='600 22px Rajdhani, Arial Narrow, sans-serif';g.fillStyle='#8fa6c2';g.textAlign='left';[['HEURE',24],['VOL',140],['DESTINATION',290],['PORTE',690],['STATUT',800]].forEach(([t,x])=>g.fillText(t,x,92));
  const blink=Math.floor(performance.now()/600)%2;
  T.fids.rows.forEach((r,i)=>{const y=134+i*52;g.fillStyle=i%2?'#0d1116':'#10151b';g.fillRect(0,y-24,W,50);
    const t=(Math.floor(gameMin/30)*30+r[0])%1440,tt=String(Math.floor(t/60)%24).padStart(2,'0')+':'+String(t%60).padStart(2,'0');
    g.font='700 30px "Courier New", monospace';g.fillStyle='#ffd27a';g.fillText(r[4]?(String(Math.floor((gameMin+18)/60)%24).padStart(2,'0')+':'+String(Math.floor(gameMin+18)%60).padStart(2,'0')):tt,24,y);g.fillText(r[1],140,y);g.fillText(r[2],290,y);g.fillText(r[3],700,y);
    const st=r[4]?'EMBARQUEMENT':r[5]||'À L’HEURE';g.fillStyle=r[4]?(blink?'#4cd964':'#1f7a3a'):st==='RETARDÉ'?'#ff9f0a':st==='ANNULÉ'?'#ff453a':'#cfe3ff';g.fillText(st,800,y);});
  T.fids.t.needsUpdate=true;}
/* ======================= aéroport de Port-Aurore (PAX) ======================= */
function buildPAX27(){
  mats27();
  /* aire de trafic, voies de circulation, piste 36/18 */
  surf27(-560,0,180,340,.12,M27.apron,10);surf27(-668,150,230,26,.13,M27.asph,10);surf27(-760,-265,48,890,.14,M27.asph,12);
  surf27(-775,-265,70,960,.1,M27.grassS,12);
  const rc=document.createElement('canvas');rc.width=128;rc.height=4096;const g=rc.getContext('2d');g.clearRect(0,0,128,4096);g.fillStyle='#f2f2ea';
  const Y=z=>(z+710)/890*4096;g.fillRect(4,0,3,4096);g.fillRect(121,0,3,4096);
  for(let z=-640;z<130;z+=30)g.fillRect(62,Y(z),4,Y(z+16)-Y(z));
  [[-700,1],[170,-1]].forEach(([z0,s])=>{for(let k=0;k<12;k++)if(k!==5&&k!==6)g.fillRect(10+k*9.3,Y(z0+s*4),5,Y(z0+s*34)-Y(z0+s*4)||s*130);});
  g.save();g.font='700 64px Rajdhani, Arial Narrow, sans-serif';g.textAlign='center';g.translate(64,Y(128));g.fillText('36',0,0);g.restore();g.save();g.translate(64,Y(-660));g.rotate(Math.PI);g.font='700 64px Rajdhani, Arial Narrow, sans-serif';g.textAlign='center';g.fillText('18',0,0);g.restore();
  [[-560,1],[60,-1]].forEach(([z0,s])=>{for(let k=0;k<3;k++){g.fillRect(24,Y(z0+s*k*24),14,Y(z0+s*k*24+12)-Y(z0+s*k*24)||12);g.fillRect(90,Y(z0+s*k*24),14,Y(z0+s*k*24+12)-Y(z0+s*k*24)||12);}});
  const rt=new THREE.CanvasTexture(rc);rt.anisotropy=8;const rm=new THREE.Mesh(new THREE.PlaneGeometry(44,890),new THREE.MeshBasicMaterial({map:rt,transparent:true,depthWrite:false}));rm.rotation.x=-Math.PI/2;rm.position.set(-760,.16,-265);rm.renderOrder=1;scene.add(rm);
  /* lignes jaunes de guidage */
  for(let x=-772;x<-470;x+=6)b27(x,.15,150,3.5,.02,.25,0xf2c200);for(let z=-120;z<150;z+=6)b27(-560,.14,z,.25,.02,3.5,0xf2c200);
  [6,70,-64].forEach(z=>{for(let x=-560;x<-478;x+=6)b27(x,.14,z,3.5,.02,.25,0xf2c200);});
  /* balisage lumineux */
  const LL=[];for(let z=-700;z<=170;z+=25){LL.push([-783,z,0xfff2c0],[-737,z,0xfff2c0]);}for(let x=-778;x<=-742;x+=4){LL.push([x,-708,0xff3b30],[x,178,0x4cd964]);}for(let k=1;k<=8;k++)LL.push([-760,178+k*14,0xffffff],[-760,-708-k*14,0xffffff]);
  for(let x=-760;x<-560;x+=20)LL.push([x,140,0x2e7dff],[x,160,0x2e7dff]);
  W27.runwayLights.push(LL);
  /* tour de contrôle, hangar, cuves */
  c27(-600,20,-230,3.4,40,0xe4e1da);c27(-600,41.5,-230,7,3.2,0x2c4a63);c27(-600,43.4,-230,7.6,.6,0xe9ecee);c27(-600,40,-230,6.2,.6,0xe9ecee);c27(-600,47,-230,.12,6,0xb32d2d,null,true);col27(-604,-596,-234,-226,true);
  const tw=sign27('PAX',6,2,'#0b1b3a','#f5c451');tw.position.set(-600,36,-226.5);scene.add(tw);
  const hg=new THREE.CylinderGeometry(24,24,52,28,1,true,-Math.PI/2,Math.PI);hg.rotateX(-Math.PI/2);const hm=new THREE.Mesh(hg,new THREE.MeshLambertMaterial({color:0xb9c0c6,side:THREE.DoubleSide}));hm.scale.set(1,.7,1);hm.position.set(-640,0,-140);hm.castShadow=true;scene.add(hm);
  b27(-640,8.4,-166,48,16.8,.6,0xa7aeb5);col27(-664,-616,-166.5,-165.5,true);[-664,-616].forEach(x=>col27(x-.6,x+.6,-166,-114,true));
  const hs=sign27('AURORE AIRWAYS · MAINTENANCE',26,2.2,'#0b1b3a','#ffffff');hs.position.set(-640,14.2,-113.6);scene.add(hs);
  for(let i=0;i<3;i++){c27(-520+i*16,4,190,6,8,0xe9ecee);col27(-526+i*16,-514+i*16,184,196,true);}
  /* manches à air */
  [[-720,-600],[-720,120]].forEach(([x,z])=>{c27(x,3,z,.08,6,0x9aa3ad,null,true);const s=new THREE.Mesh(new THREE.ConeGeometry(.5,3,10,1,true),new THREE.MeshLambertMaterial({color:0xff7a1a,side:THREE.DoubleSide}));s.position.set(x+1.4,5.8,z);s.rotation.z=Math.PI/2;scene.add(s);W27.anim.push(t=>{s.rotation.y=Math.sin(t*.7)*.4;});});
  /* parkings, voie de dépose, auvent */
  road27(-336,-150,-336,150,14,{});b27(-352.5,.08,0,19,.16,300,0xb9b4a8);surf27(-305,90,40,100,.065,M27.asph,10);surf27(-305,-100,40,80,.065,M27.asph,10);
  [[90,100],[-100,80]].forEach(([cz,L])=>{for(let z=cz-L/2+3;z<cz+L/2;z+=3.2)[-318,-292].forEach(x=>b27(x,.08,z,9,.02,.12,0xe8e8e0));});
  for(let k=0,tr=0;k<16&&tr<80;tr++){const z=pick([rand(45,138),rand(-138,-64)]),x=pick([-318,-292])+pick([-3,3]);if(cars.some(o=>Math.hypot(o.x-x,o.z-z)<4))continue;addCar(x,z,x<-305?Math.PI/2:-Math.PI/2,pick(CAR_COLORS),'parked',pick(['sedan','suv','toyota','bmw','honda','hyundai','benz','jeep','ford','porsche']));k++;}
  [-140,-100,-60,-20,20,60,100,140].forEach(z=>lamp27(-344.5,z,9,Math.PI/2));
  const tx=sign27(['TAXIS · BUS','Navette centre-ville'],4,1.4,'#f5c400','#111111',{fg2:'#333'});tx.position.set(-357,2.6,-60);tx.rotation.y=Math.PI/2;scene.add(tx);b27(-357.2,1.3,-60,.16,2.6,.16,0x2a2f35);
  /* terminal */
  const T=terminal27({id:'pax',pos:[-362,0],rot:Math.PI,D:108,W:200,H:12,title:'AÉROPORT INTERNATIONAL PORT-AURORE',bridgeV:-1,bridgeName:'PORTE A1 · AURORE AIRWAYS',gateName:'PORTE A1',gateSub:'AA 274 · SOLENNE',
    checkin:[[30,70,'AURORE AIRWAYS','#0b1b3a','#f5c451'],[-14,14,'AIR SAHEL','#b5651d','#ffffff'],[-70,-30,'ATLANTIC JET','#1f6f6a','#ffffff']],mainCheckV:50,
    fids:[[0,'AA 274','SOLENNE','A1',1],[25,'AS 112','DAKAR','A4'],[40,'AJ 908','LISBONNE','B2'],[55,'AA 318','ABIDJAN','A3','RETARDÉ'],[70,'AS 517','LOMÉ','B1'],[90,'AJ 044','MONTRÉAL','B6'],[110,'AA 290','MARSEILLE','A2','ANNULÉ']]});
  /* avions stationnés (décor) : porte A2 + aire éloignée */
  const p2=makePlane27({livery:'sahel'}),w2=T.toW(108+35,-70);p2.position.set(w2.x,0,w2.z);p2.rotation.y=T.plane.h;scene.add(p2);planeCol27(w2.x,w2.z,T.plane.h);
  const p3=makePlane27({livery:'atlantic'});p3.position.set(-600,0,-60);p3.rotation.y=-Math.PI/2+.35;scene.add(p3);planeCol27(-600,-60,-Math.PI/2+.35);
  W27.zones.push({id:'pax',n:'Aéroport International',s:'Port-Aurore · PAX',x0:-1000,x1:-330,z0:-760,z1:207});
  addSpot27(T.spot.checkin.x,T.spot.checkin.z,'air27:checkin',0xf5c451,'Comptoir Aurore Airways · Billets');
  addSpot27(T.spot.secu.x,T.spot.secu.z,'air27:secu',0x5aa9ff,'Contrôle de sûreté');
  addSpot27(T.spot.sortie.x,T.spot.sortie.z,'air27:sortie',0x9aa3ad,'Sortie · retour au hall');
  addSpot27(T.spot.wait.x,T.spot.wait.z,'air27:wait',0x8fd3ff,'Salle d’attente · s’asseoir');
  addSpot27(T.spot.cafe.x,T.spot.cafe.z,'air27:cafe',0xd9a066,'Café des Pistes');
  addSpot27(T.spot.df.x,T.spot.df.z,'air27:df',0xf5c451,'Duty Free');
  addSpot27(T.spot.gate.x,T.spot.gate.z,'air27:gate',0x4cd964,'Porte A1 · Embarquement');
  addSpot27(T.spot.info.x,T.spot.info.z,'air27:info',0xffffff,'Information · vols');
  return T;}
function planeCol27(x,z,h){const s=Math.sin(h),c=Math.cos(h);for(let k=-18;k<=18;k+=4.5){const px=x+s*k,pz=z+c*k;col27(px-2,px+2,pz-2,pz+2);}[6,10,14].forEach(k=>[-1,1].forEach(q=>{const px=x+c*k*q,pz=z-s*k*q;col27(px-1.2,px+1.2,pz-1.2,pz+1.2);}));}
/* ======================= île de Solenne (SLN) ======================= */
function buildSOL27(){
  mats27();const X=SOL27.x,T=[];
  const land=surf27(X,-60,1000,660,-0.04,M27.grassS,12);
  surf27(X,258,1000,70,-0.02,M27.sand,8);
  const lag=new THREE.Mesh(new THREE.PlaneGeometry(1100,380),new THREE.MeshPhongMaterial({color:0x2fc6c9,transparent:true,opacity:.62,shininess:90,specular:0xffffff}));lag.rotation.x=-Math.PI/2;lag.position.set(X,-0.12,470);scene.add(lag);
  W27.lagoon=lag;
  /* piste 09/27 + aire de trafic */
  surf27(X+50,-300,760,44,.12,M27.asph,12);surf27(X,-224,150,82,.11,M27.apron,10);surf27(X-150,-256,330,22,.115,M27.asph,10);
  for(let x=X-300;x<X+420;x+=30)b27(x,.14,-300,16,.02,.35,0xf2f2ea);[-1,1].forEach(s=>b27(X+50,.14,-300+s*20.5,760,.02,.3,0xf2f2ea));
  [X-325,X+425].forEach(x=>{for(let k=0;k<10;k++)b27(x+(x<X?8:-8),.14,-318+k*4,14,.02,1.6,0xf2f2ea);});
  const LL=[];for(let x=X-320;x<=X+420;x+=25)LL.push([x,-322,0xfff2c0],[x,-278,0xfff2c0]);for(let k=1;k<=8;k++)LL.push([X+420+k*14,-300,0xffffff],[X-320-k*14,-300,0xffffff]);W27.runwayLights.push(LL);
  /* terminal (orienté vers le sud) */
  const TT=terminal27({id:'sol',pos:[X,-130],rot:Math.PI/2,D:60,W:96,H:9,title:'AÉROPORT DE SOLENNE',fascia:0x1f6f6a,seat:0x1f6f6a,bridgeV:-1,bridgeName:'PORTE 1 · AURORE AIRWAYS',gateName:'PORTE 1',gateSub:'AA 275 · PORT-AURORE',doors:[-22,0,22],doorSign:'ARRIVÉES · DÉPARTS',
    checkin:[[12,40,'AURORE AIRWAYS','#0b1b3a','#f5c451'],[-40,-14,'ÎLES EXPRESS','#1f6f6a','#ffffff']],mainCheckV:26,dfName:'BOUTIQUE DU LAGON',cafeName:'BAR DES ALIZÉS',boards:[[5,-18],[5,18],[34,0]],
    fids:[[0,'AA 275','PORT-AURORE','1',1],[35,'IE 021','ÎLE MORENA','2'],[65,'IE 044','CAP CORAIL','2'],[95,'AA 281','PORT-AURORE','1'],[130,'IE 060','BAIE DES PERLES','3','RETARDÉ']]});
  W27.zones.push({id:'sol',n:'Île de Solenne',s:'Océan Aurore · 28 °C',x0:X-480,x1:X+480,z0:-350,z1:340});
  [['checkin','Comptoir Aurore Airways · Billet retour',0xf5c451],['secu','Contrôle de sûreté',0x5aa9ff],['sortie','Sortie · retour au hall',0x9aa3ad],['wait','Salle d’attente · s’asseoir',0x8fd3ff],['cafe','Bar des Alizés',0xd9a066],['df','Boutique du Lagon',0xf5c451],['gate','Porte 1 · Embarquement',0x4cd964],['info','Office du tourisme',0xffffff]].forEach(([k,l,c])=>addSpot27(TT.spot[k].x,TT.spot[k].z,'air27:'+k+'@sol',c,l));
  /* routes : dépose, route de la plage, front de mer */
  road27(X-90,-105,X+90,-105,12,{});road27(X,-99,X,206,12,{lamps:28});road27(X-430,212,X+430,212,12,{lamps:30,dashC:0xf2c200});
  road27(X-430,60,X+300,60,10,{});road27(X-200,66,X-200,206,10,{});road27(X+200,66,X+200,206,10,{});
  surf27(X+60,-86,60,22,.065,M27.asph,10);for(let k=0;k<4;k++)addCar(X+40+k*12,-86,Math.PI/2,pick([0xffffff,0x2fc6c9,0xff8f5a,0xf5c451]),'parked',pick(['jeep','toyota','suv','sedan']));
  /* maisons créoles */
  const PAST=[0xf7c8a0,0x9fe0d8,0xf6e27a,0xf2a7b8,0xa8d8f0,0xc9e7a6,0xffd59e,0xe8b7f0];
  for(let z=-70;z<=180;z+=26){if(Math.abs(z-60)<16)continue;[-1,1].forEach(s=>{const x=X+s*22;house27(x,z,s<0?Math.PI/2:-Math.PI/2,{wall:pick(PAST),roof:pick([0xb2573a,0x2e6fd1,0x1f6f6a,0xa0482f,0xe0e0e0]),veranda:true,noFence:Math.random()<.5,lawn:0x7fb35e,fl:Math.random()<.3?2:1});T.push({x:x+s*9,z:z+9,s:rand(1,1.3),type:'palm',col:true});});}
  for(let x=-420;x<=380;x+=44){if(Math.abs(x)<40||Math.abs(x+200)<20||Math.abs(x-200)<20)continue;[[34,0],[86,Math.PI]].forEach(([z,ry])=>house27(X+x,z,ry,{wall:pick(PAST),roof:pick([0xb2573a,0x2e6fd1,0x1f6f6a,0xa0482f]),veranda:Math.random()<.6,lawn:0x7fb35e,noFence:true}));}
  /* Hôtel Lagon Bleu */
  const hx=X+120,hz=150;b27(hx,9,hz,52,18,16,0xf4f1ea);col27(hx-26,hx+26,hz-8,hz+8,true);for(let f=0;f<4;f++)for(let k=0;k<9;k++){b27(hx-22+k*5.5,3+f*4.2,hz+8.6,4.2,.15,1.6,0xffffff);b27(hx-22+k*5.5,3.7+f*4.2,hz+9.3,4.2,1,.08,0x9fe0d8);b27(hx-22+k*5.5,4.2+f*4.2,hz+8.03,2.4,2.2,.06,0x2e6f86);}
  b27(hx,18.4,hz,54,.8,18,0x1f6f6a);const hs=sign27('HÔTEL LAGON BLEU',24,3,null,'#1f6f6a');hs.position.set(hx,20.6,hz+8.2);scene.add(hs);b27(hx,20.6,hz+8,25,3.4,.3,0xffffff);
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(26,10),new THREE.MeshPhongMaterial({color:0x37d0e6,shininess:120,specular:0xffffff}));pool.rotation.x=-Math.PI/2;pool.position.set(hx+8,.2,hz+16.2);scene.add(pool);b27(hx+8,.12,hz+16.2,28,.2,12,0xf2efe6);
  for(let k=0;k<6;k++)b27(hx-14+k*3.2,.4,hz+14,1,.3,2.2,0xffffff);
  /* marché */
  const mx=X-110,mz=120;surf27(mx,mz,46,30,.07,M27.sand,6);for(let i=0;i<8;i++){const x=mx-16+(i%4)*10.5,z=mz-7+Math.floor(i/4)*14,c=pick([0xff6b6b,0xffc23d,0x2fc6c9,0x58d68d,0xff8fb1]);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>c27(x+a*3.4,1.4,z+b*2.2,.08,2.8,0x6b4a2a,null,true));b27(x,2.9,z,7.6,.12,5,c);b27(x,.8,z+1.2,6.6,.9,1.6,0x8a5a3a);for(let q=0;q<10;q++)c27(x-3+q*.66,1.35,z+1.2,.24,.25,pick([0xff8c1a,0xffd23f,0x58b33a,0xd93a2e,0x8a3ab9]),null,true);col27(x-3.4,x+3.4,z+.4,z+2);}
  const ms=sign27('MARCHÉ DE SOLENNE',14,2,'#ffc23d','#3a1f0a');ms.position.set(mx,4.2,mz+15.5);scene.add(ms);
  /* bar de plage (paillote), parasols, transats, ponton, bateaux, phare */
  const bx0=X+40,bz0=244;c27(bx0,2,bz0,4,3.6,0x8a5a3a);W27.parts.push(pp(CONE27,bx0,5.4,bz0,0xc9a35a,7,3.4,7));col27(bx0-4,bx0+4,bz0-4,bz0+4,true);
  const bs=sign27('LE COQUILLAGE · BAR DE PLAGE',9,1.2,'#1f6f6a','#fff3c4');bs.position.set(bx0,3.4,bz0+4.1);scene.add(bs);
  for(let i=0;i<22;i++){const x=X-400+i*38+rand(-6,6),z=rand(252,276);if(Math.abs(x-bx0)<10)continue;c27(x,1.4,z,.05,2.8,0xf4f1ea,null,true);W27.parts.push(pp(CONE27,x,2.9,z,pick([0xff6b6b,0xffc23d,0x2fc6c9,0xffffff,0xff8fb1]),2.1,.7,2.1));b27(x+1.6,.3,z+.4,.8,.25,2,0xffffff);}
  for(let z=282;z<=328;z+=2)b27(X-250,.5,z,4,.2,1.8,0x8a6a4a);for(let z=284;z<=328;z+=8)[-1,1].forEach(s=>c27(X-250+s*1.8,0,z,.15,1.6,0x5a4030,null,true));
  W27.boats=[];[[X-238,300,0xffffff],[X-262,312,0xff6b6b],[X-236,322,0x2fc6c9]].forEach(([x,z,c],i)=>{const P=[];P.push(pp(U27,0,.5,0,c,2.2,.9,6.5));P.push(pp(U27,0,1.1,-.5,0xf4f1ea,1.6,.6,2.2));P.push(pp(CY27L,0,3,1,0xdddddd,.06,4.5,.06));const m=new THREE.Mesh(mergeParts(P),M27.vc);m.position.set(x,0,z);m.rotation.y=i*.6;scene.add(m);W27.boats.push(m);});
  const lx=X+430,lz=238;for(let k=0;k<6;k++)c27(lx,1.6+k*3.2,lz,2.2-k*.18,3.2,k%2?0xb32d2d:0xffffff);c27(lx,21.5,lz,1.3,2,0x2c4a63);W27.parts.push(pp(CONE27,lx,23.4,lz,0xb32d2d,1.6,1.8,1.6));col27(lx-2.3,lx+2.3,lz-2.3,lz+2.3,true);
  const beam=new THREE.Mesh(new THREE.ConeGeometry(6,60,16,1,true),new THREE.MeshBasicMaterial({color:0xfff3c4,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));beam.rotation.z=Math.PI/2;beam.position.set(30,0,0);const bg=new THREE.Group();bg.position.set(lx,21.5,lz);bg.add(beam);scene.add(bg);
  W27.anim.push((t,dt)=>{bg.rotation.y=t*.8;beam.material.opacity=(1-dayK27())*.22;W27.boats.forEach((b,i)=>{b.position.y=Math.sin(t*1.2+i)*.12;b.rotation.z=Math.sin(t*.9+i)*.05;});});
  /* chapelle et office du tourisme */
  const cx=X-200,cz=150;b27(cx,4,cz,10,8,14,0xffffff);W27.parts.push(pp(gableGeo(10,14,3.4,.4),cx,8,cz,0x2e6fd1));W27.parts.push(pp(gableEnds(10,14,3.4),cx,8,cz,0xffffff));b27(cx,9,cz+6,3,18,3,0xffffff);W27.parts.push(pp(CONE27,cx,19.5,cz+6,0x2e6fd1,2.4,3,2.4));col27(cx-5,cx+5,cz-7,cz+8,true);
  const ws=sign27(['BIENVENUE À SOLENNE','Île tropicale · Océan Aurore'],10,3,'#1f6f6a','#ffffff',{fg2:'#fff3c4'});ws.position.set(X+14,2.8,-90);scene.add(ws);[-1,1].forEach(k=>b27(X+14+k*4.8,1.4,-90.1,.2,2.8,.2,0x2a2f35));
  /* palmiers */
  for(let x=-420;x<=420;x+=16)T.push({x:X+x+rand(-2,2),z:222+rand(-1,1),s:rand(1,1.35),type:'palm',col:true});
  for(let k=0;k<260;k++){const x=X+rand(-480,480),z=rand(-360,230);if(Math.abs(z+300)<34||(Math.abs(x-X)<100&&z<-90&&z>-275)||(Math.abs(x-X)<30&&z>-120)||(Math.abs(z-212)<10)||(Math.abs(z-60)<8)||(Math.abs(x-X)<300&&z>-60&&z<200&&Math.random()<.85))continue;T.push({x,z,s:rand(1,1.5),type:Math.random()<.6?'palm':'round',col:true});}
  /* lieux */
  addSpot27(hx,hz+11,'sol27:hotel',0x37d0e6,'Hôtel Lagon Bleu');addSpot27(mx,mz+17,'sol27:marche',0xffc23d,'Marché de Solenne');addSpot27(bx0,bz0+6,'sol27:bar',0xff8fb1,'Le Coquillage · Bar de plage');
  addSpot27(X-250,282,'sol27:ponton',0x2fc6c9,'Ponton · excursion en bateau');addSpot27(cx,cz+10,'sol27:chapelle',0xffffff,'Chapelle Sainte-Anne');
  /* habitants */
  const WP=[[X,-80],[X,40],[X,120],[X,200],[X-110,140],[X+110,175],[X-250,236],[X+250,236],[X+40,250],[X-120,236],[X+200,120],[X-200,120],[X+60,-96]];
  for(let i=0;i<20;i++){const p=npc27(pick([0xff8fb1,0xffc23d,0x2fc6c9,0xffffff,0x58d68d,0xf7c8a0]));const a=pick(WP);p.position.set(a[0]+rand(-6,6),.1,a[1]+rand(-4,4));scene.add(p);W27.walkers.push({m:p,x:p.position.x,z:p.position.z,t:pick(WP),ph:rand(0,6),wait:rand(0,4),WP,sp:rand(1.2,1.8)});}
  return {T,TT};}
/* habitants des terminaux */
function terminalCrowd27(T,n,walk){const S=T.seatsW.slice().sort(()=>Math.random()-.5);
  for(let i=0;i<n&&i<S.length;i++){const s=S[i],p=npc27();if(window.T26&&T26.sitPose)T26.sitPose(p,null);p.position.set(s.x,.08,s.z);p.rotation.y=s.h;scene.add(p);s.taken=true;
    if(Math.random()<.4){const bag=new THREE.Mesh(U27,lamb(pick([0x2b2b2b,0xb32d2d,0x2e6fd1,0x6b4a2a])));bag.scale.set(.45,.6,.3);const f=Math.sin(s.h),c=Math.cos(s.h);bag.position.set(s.x+f*.75+c*.4,.45,s.z+c*.75-f*.4);scene.add(bag);}}
  const WP=[];for(let k=0;k<10;k++){const u=k<5?rand(10,T.D*.42):rand(T.D*.55,T.D-8),v=rand(-T.W*.42,T.W*.42);WP.push(T.toW(u,v));}
  for(let i=0;i<walk;i++){const p=npc27();const a=pick(WP);p.position.set(a.x,.1,a.z);scene.add(p);const suit=new THREE.Mesh(U27,lamb(pick([0x2b2b2b,0xb32d2d,0x2e6fd1,0xf5c451])));suit.scale.set(.42,.62,.26);suit.position.set(.45,.42,-.2);p.add(suit);
    W27.walkers.push({m:p,x:a.x,z:a.z,t:null,WPo:WP,ph:rand(0,6),wait:rand(0,3),sp:rand(1.1,1.5),zone:T});}}
function tickWalkers27(dt){W27.walkers.forEach(w=>{if(Math.abs(w.x-camera.position.x)>160||Math.abs(w.z-camera.position.z)>160){w.m.visible=false;return;}w.m.visible=true;
  if(w.wait>0){w.wait-=dt;animPerson(w.m,w.ph,0,false);return;}
  if(!w.t){const L=w.WPo||w.WP,q=pick(L);w.t=Array.isArray(q)?{x:q[0]+rand(-5,5),z:q[1]+rand(-3,3)}:{x:q.x,z:q.z};}
  const dx=w.t.x-w.x,dz=w.t.z-w.z,d=Math.hypot(dx,dz);if(d<.8){w.t=null;w.wait=rand(1.5,6);return;}
  const nx=w.x+dx/d*w.sp*dt,nz=w.z+dz/d*w.sp*dt,p={x:nx,z:nz};pushAABB(p,.35);if(Math.hypot(p.x-nx,p.z-nz)>.2&&Math.random()<.02)w.t=null;w.x=p.x;w.z=p.z;
  w.ph+=dt*w.sp*2.3;w.m.position.set(w.x,.1,w.z);w.m.rotation.y+=angDiff(w.m.rotation.y,Math.atan2(dx,dz))*Math.min(1,6*dt);animPerson(w.m,w.ph,.5,false);});}
/* ======================= modèle d'avion (A320-like) ======================= */
const LIV27={aurore:{body:0xf7f8fa,belly:0xd9dde2,stripe:0x0b1b3a,stripe2:0xf5c451,tail:0x0b1b3a,eng:0x0b1b3a,name:'AURORE AIRWAYS',logo:'#f5c451',tailBg:'#0b1b3a'},
  sahel:{body:0xf7f8fa,belly:0xd9dde2,stripe:0xb5651d,stripe2:0xe8b04a,tail:0xb5651d,eng:0xf7f8fa,name:'AIR SAHEL',logo:'#ffffff',tailBg:'#b5651d'},
  atlantic:{body:0xf2f6f7,belly:0xcfd6da,stripe:0x1f6f6a,stripe2:0x2fc6c9,tail:0x1f6f6a,eng:0x1f6f6a,name:'ATLANTIC JET',logo:'#ffffff',tailBg:'#1f6f6a'}};
function wingGeo27(pts,th){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]));const g=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false});g.rotateX(-Math.PI/2);g.translate(0,-th/2,0);return g;}
function finGeo27(pts,th){const s=new THREE.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1]));const g=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:false});g.rotateY(-Math.PI/2);g.translate(th/2,0,0);return g;}
function makePlane27(o){o=o||{};const L=LIV27[o.livery||'aurore'],G=new THREE.Group(),P=[],DK=[],cy=3.6;mats27();
  const fus=new THREE.CylinderGeometry(2,2,28,24,1,true);fus.rotateX(Math.PI/2);P.push(pp(fus,0,cy,0,L.body));
  const belly=new THREE.CylinderGeometry(2.02,2.02,27,24,1,true,-Math.PI*.38,Math.PI*.76);belly.rotateX(Math.PI/2);P.push(pp(belly,0,cy,0,L.belly));
  const nose=new THREE.CylinderGeometry(.35,2,6,24,1,true);nose.rotateX(Math.PI/2);P.push(pp(nose,0,cy-.35,17,L.body,1,1,1,-.06,0,0));P.push(pp(sph(.36,12,8),0,cy-.7,20,L.body));
  const tail=new THREE.CylinderGeometry(2,.45,9,24,1,true);tail.rotateX(Math.PI/2);P.push(pp(tail,0,cy+.55,-18.5,L.body,1,1,1,-.12,0,0));P.push(pp(sph(.46,10,8),0,cy+1.1,-23,L.body));
  [-1,1].forEach(s=>{P.push(pp(U27,s*1.99,cy-.15,0,L.stripe,.06,.32,27));P.push(pp(U27,s*1.97,cy-.52,0,L.stripe2,.06,.12,27));
    for(let z=-12;z<=12.6;z+=.95)if(Math.abs(z-9.2)>.6&&Math.abs(z+3)>.5)DK.push(pp(U27,s*2.0,cy+.42,z,0x1a2430,.06,.36,.26));
    DK.push(pp(U27,s*1.12,cy+.98,15.7,0x15202c,.5,.42,.9,0,s*.6,s*-.5));
    [15.2,-12.8].forEach(z=>{DK.push(pp(U27,s*2.0,cy+.05,z-.5,0x9aa3ad,.05,1.9,.05));DK.push(pp(U27,s*2.0,cy+.05,z+.5,0x9aa3ad,.05,1.9,.05));DK.push(pp(U27,s*2.0,cy+1,z,0x9aa3ad,.05,.05,1));});});
  DK.push(pp(U27,0,cy+1.42,15.9,0x15202c,1.2,.36,.7,-.5,0,0));
  /* ailes, empennage */
  const wR=wingGeo27([[2,5],[17,-5.5],[17,-7.6],[2,-3.8]],.42),wLg=wingGeo27([[-2,5],[-2,-3.8],[-17,-7.6],[-17,-5.5]],.42);
  P.push(pp(wR,0,cy-1.25,0,0xe4e8ec,1,1,1,0,0,.07));P.push(pp(wLg,0,cy-1.25,0,0xe4e8ec,1,1,1,0,0,-.07));
  [-1,1].forEach(s=>{P.push(pp(U27,s*17.1,cy+.1,-6.8,L.tail,.14,2.2,1.6,0,0,s*.12));});
  const hR=wingGeo27([[1,-16.6],[7.2,-20.6],[7.2,-22],[1,-20.4]],.26),hL=wingGeo27([[-1,-16.6],[-1,-20.4],[-7.2,-22],[-7.2,-20.6]],.26);P.push(pp(hR,0,cy+.9,0,0xe4e8ec));P.push(pp(hL,0,cy+.9,0,0xe4e8ec));
  const fin=finGeo27([[-14.5,cy+1.5],[-19.5,cy+8.6],[-22.2,cy+8.6],[-22.6,cy+1.5]],.34);P.push(pp(fin,0,0,0,L.tail));
  /* moteurs */
  [-1,1].forEach(s=>{const x=s*6.2;P.push(pp(CY27,x,cy-2.4,1.6,L.eng,1.05,4.2,1.05,Math.PI/2,0,0));DK.push(pp(CY27,x,cy-2.4,3.72,0x20262e,.9,.06,.9,Math.PI/2,0,0));P.push(pp(CY27,x,cy-2.4,3.76,0xc9ced3,.25,.1,.25,Math.PI/2,0,0));
    P.push(pp(new THREE.ConeGeometry(.6,1.4,12),x,cy-2.4,-1.2,0x8a9096,1,1,1,-Math.PI/2,0,0));P.push(pp(U27,x,cy-1.45,.6,0xd9dde2,.35,.9,3));});
  const m=new THREE.Mesh(mergeParts(P),M27.vcS);m.castShadow=true;m.receiveShadow=true;G.add(m);const m2=new THREE.Mesh(mergeParts(DK),M27.vc);G.add(m2);
  /* logo dérive + titres */
  const lc=document.createElement('canvas');lc.width=256;lc.height=256;const lg=lc.getContext('2d');lg.fillStyle=L.logo;lg.beginPath();lg.arc(128,150,70,Math.PI,0);lg.fill();lg.fillStyle=L.tailBg;for(let k=0;k<4;k++)lg.fillRect(40,150-k*22-6,180,7);lg.fillStyle=L.logo;lg.fillRect(40,158,176,10);
  const lt=new THREE.CanvasTexture(lc),lm=new THREE.MeshBasicMaterial({map:lt,transparent:true});[-1,1].forEach(s=>{const q=new THREE.Mesh(new THREE.PlaneGeometry(4.4,4.4),lm);q.position.set(s*.2,cy+5.2,-20.2);q.rotation.y=s*Math.PI/2;G.add(q);});
  const tc=document.createElement('canvas');tc.width=1024;tc.height=128;const tg=tc.getContext('2d');tg.fillStyle='#'+L.stripe.toString(16).padStart(6,'0');tg.font='700 92px Rajdhani, Arial Narrow, sans-serif';tg.textAlign='center';tg.textBaseline='middle';tg.fillText(L.name,512,68);
  const tt=new THREE.CanvasTexture(tc),tm=new THREE.MeshBasicMaterial({map:tt,transparent:true});[-1,1].forEach(s=>{const q=new THREE.Mesh(new THREE.PlaneGeometry(11,1.4),tm);q.position.set(s*2.03,cy+1.08,4);q.rotation.y=s*Math.PI/2;q.rotation.z=0;G.add(q);});
  /* train d'atterrissage */
  const gear=new THREE.Group(),GP=[];[[0,14.5,.32],[-2.9,-1.2,.55],[2.9,-1.2,.55]].forEach(([x,z,r])=>{GP.push(pp(CY27,x,1.15,z,0xb9c0c6,.14,2.3,.14));[-1,1].forEach(q=>GP.push(pp(CY27,x+q*.42,r,z,0x1a1a1a,r,.32,r,0,0,Math.PI/2)));if(r>.4)[-1,1].forEach(q=>GP.push(pp(CY27,x+q*.42,r,z-1.2,0x1a1a1a,r,.32,r,0,0,Math.PI/2)));});
  const gm=new THREE.Mesh(mergeParts(GP),M27.vc);gear.add(gm);G.add(gear);
  /* feux */
  const glow=glowTex([[0,'rgba(255,255,255,1)'],[.25,'rgba(255,255,255,.6)'],[1,'rgba(255,255,255,0)']]);const Lt={};
  const mk=(x,y,z,c,s)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glow,color:c,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));sp.scale.set(s,s,1);sp.position.set(x,y,z);G.add(sp);return sp;};
  Lt.navL=mk(17.2,cy-.9,-6.4,0xff2a2a,1.6);Lt.navR=mk(-17.2,cy-.9,-6.4,0x2aff6a,1.6);Lt.strL=mk(17.2,cy-.9,-7.2,0xffffff,2.6);Lt.strR=mk(-17.2,cy-.9,-7.2,0xffffff,2.6);Lt.bcn=mk(0,cy+2.1,-2,0xff3030,1.6);Lt.bcn2=mk(0,cy-2.1,-2,0xff3030,1.4);Lt.land=mk(0,cy-1.6,15,0xfff6dd,4);Lt.tail=mk(0,cy+1.2,-23.4,0xffffff,1.2);
  G.userData={gear,L:Lt,cy,livery:o.livery||'aurore'};
  return G;}
function tickPlaneLights27(G,t,on){const L=G.userData.L,n=1-dayK27();L.navL.visible=L.navR.visible=L.tail.visible=true;const k=.35+.65*n;L.navL.material.opacity=L.navR.material.opacity=L.tail.material.opacity=k;
  const st=(t%1.3)<.06;L.strL.visible=L.strR.visible=on&&st;const bc=(t%1)<.12;L.bcn.visible=L.bcn2.visible=on&&bc;L.land.visible=!!G.userData.landOn;}
/* ======================= construction globale ======================= */
function build27(){
  if(W27.built)return;W27.built=true;mats27();
  buildRoads27();const tS=buildSuburb27();buildStadium27();const tI=buildIndustry27();buildWind27();
  const pax=buildPAX27();const sol=buildSOL27();
  trees27([].concat(tS,tI,forests27(),sol.T,[[-345.5,-150],[-345.5,-110],[-345.5,-80],[-345.5,-10],[-345.5,30],[-345.5,70],[-345.5,110],[-345.5,150]].map(([x,z])=>({x,z,s:1.2,type:'palm',col:true}))));
  terminalCrowd27(pax,22,10);terminalCrowd27(sol.TT,10,5);
  /* feux de piste (instanciés) + halos de nuit */
  const all=[].concat(...W27.runwayLights),im=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.35,.5),new THREE.MeshBasicMaterial({color:0xffffff}),all.length);
  const pts=new Float32Array(all.length*3),cols=new Float32Array(all.length*3);
  all.forEach(([x,z,c],i)=>{dummy.position.set(x,.3,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);const col=new THREE.Color(c);im.setColorAt(i,col);pts.set([x,.9,z],i*3);cols.set([col.r,col.g,col.b],i*3);});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;scene.add(im);
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pts,3));pg.setAttribute('color',new THREE.BufferAttribute(cols,3));
  const pm=new THREE.PointsMaterial({size:7,map:glowTex([[0,'rgba(255,255,255,1)'],[.3,'rgba(255,255,255,.5)'],[1,'rgba(255,255,255,0)']]),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,opacity:0});
  const pts3=new THREE.Points(pg,pm);pts3.frustumCulled=false;scene.add(pts3);W27.rwyGlow=pm;
  if(sea&&sea.material.normalMap){const nm=sea.material.normalMap.clone();nm.needsUpdate=true;nm.wrapS=nm.wrapT=THREE.RepeatWrapping;nm.repeat.set(900,900);if(W27.ocean){W27.ocean.material.normalMap=nm;W27.ocean.material.normalScale=new THREE.Vector2(.5,.5);W27.ocean.material.needsUpdate=true;}}
  if(W27.lagoon&&sea&&sea.material.normalMap){W27.lagoon.material.normalMap=sea.material.normalMap;W27.lagoon.material.needsUpdate=true;}
  traffic27();
  flush27(W27.parts,M27.vc,true);W27.emisMesh=flush27(W27.emis,M27.emis,false);flush27(W27.glass,M27.glass,false);
  drawFids27(pax,'DÉPARTS · DEPARTURES');drawFids27(sol.TT,'DÉPARTS · SOLENNE');
}
const _bd27=buildDecor;buildDecor=function(){_bd27();try{build27();}catch(e){console.warn('v27 monde',e);}};
/* animations du monde */
let fidsT27=0;
function tick27(dt){const t=performance.now()*.001;
  W27.anim.forEach(f=>f(t,dt));if(W27.rotors)W27.rotors.forEach(r=>{r.g.rotation.z-=dt*r.s;});
  const n=1-dayK27();if(W27.rwyGlow)W27.rwyGlow.opacity=clamp(n*1.2-.15,0,.95);
  if(W27.emisMesh){const k=.45+.55*n;W27.emisMesh.material.color.setRGB(k,k,k*.95);}
  Object.values(W27.terms).forEach(T=>T.doors.forEach(d=>{const w=T.toW(d.u,d.v),near=Math.hypot(player.x-w.x,player.z-w.z)<6||W27.walkers.some(q=>q.zone===T&&Math.hypot(q.x-w.x,q.z-w.z)<4);d.open+=((near?1:0)-d.open)*Math.min(1,5*dt);d.L.forEach(p=>{p.m.position.z=p.v+p.s*(d.w/2+d.open*d.w*.92);});}));
  fidsT27-=dt;if(fidsT27<=0){fidsT27=1.2;if(W27.terms.pax&&Math.abs(camera.position.x+420)<260)drawFids27(W27.terms.pax,'DÉPARTS · DEPARTURES');if(W27.terms.sol&&camera.position.x<-3000)drawFids27(W27.terms.sol,'DÉPARTS · SOLENNE');}
  tickTraffic27(dt);tickWalkers27(dt);
}
const _upd27=update;update=function(dt){_upd27(dt);try{tick27(Math.max(0,dt));}catch(e){if(!W27.err){W27.err=1;console.warn('v27',e);}}};
