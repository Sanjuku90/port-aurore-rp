'use strict';
/* ===== Port-Aurore v26 · trajets réels ======================================
   - Taxi, Prestige, okada (moto-taxi), keke et danfo : on commande, le véhicule
     traverse la ville jusqu'à toi, s'arrête au trottoir et t'attend.
   - Tu montes (E), puis tu suis le trajet complet : feux, virages, circulation.
   - Vue intérieure (siège passager, tableau de bord, GPS, compteur) ou extérieure (V).
   - Livraison de repas : le livreur vient en scooter, marche jusqu'à toi,
     t'envoie un message à son arrivée et attend que tu récupères la commande.
   ========================================================================== */
(function(){
const T=window.T26={ride:null,food:null,view:'int',speed:1,look:{y:0,p:0},cam:{blend:1,from:null,fromT:null},acts:[],prompts:[],ticks:[],cams:[],busy:[],svc:new Set()};
try{const v=localStorage.getItem('port-aurore-view26');if(v==='int'||v==='ext')T.view=v;}catch(e){}
const saveView=()=>{try{localStorage.setItem('port-aurore-view26',T.view);}catch(e){}};
const GX=[-224,-160,-96,-32,32,96,160,224],GZ=[-224,-160,-96,-32,32,96,160],AIRX=[290,360,440,520],LANE=3.5,CURB=5.7;
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const lam=c=>new THREE.MeshLambertMaterial({color:c});
const std=(c,r,m)=>new THREE.MeshStandardMaterial({color:c,roughness:r==null?.6:r,metalness:m||0});
function bxm(g,w,h,d,x,y,z,mat){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);g.add(o);return o;}
function cyl(g,r1,r2,h,x,y,z,mat,seg){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg||14),mat);o.position.set(x,y,z);g.add(o);return o;}
function canvasTex(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);if('colorSpace' in t&&THREE.SRGBColorSpace)t.colorSpace=THREE.SRGBColorSpace;return {c,g:c.getContext('2d'),t};}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
T.util={bxm,cyl,canvasTex,lam,std,esc};

/* ---------------- réseau routier ---------------- */
let NET=null;
function blockedAt(x,z){for(let i=0;i<boxes.length;i++){const b=boxes[i];if(b.room)continue;if(x>b.x0-1.15&&x<b.x1+1.15&&z>b.z0-1.15&&z<b.z1+1.15)return true;}return false;}
function edgeOK(a,b){const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L;
  for(let s=8;s<=L-8;s+=2)for(const o of [-LANE,LANE])if(blockedAt(a.x+ux*s-uz*o,a.z+uz*s+ux*o))return false;return true;}
function buildNet(){
  const N={},E=[];const add=(x,z)=>{const k=x+','+z;if(!N[k])N[k]={x,z,k,adj:[]};return N[k];};
  GX.forEach(x=>GZ.forEach(z=>add(x,z)));AIRX.forEach(x=>add(x,-32));
  const link=(a,b)=>{if(!a||!b||!edgeOK(a,b))return;const e={a,b,L:Math.hypot(b.x-a.x,b.z-a.z)};E.push(e);a.adj.push({n:b,e});b.adj.push({n:a,e});};
  GZ.forEach(z=>{for(let i=0;i<GX.length-1;i++)link(N[GX[i]+','+z],N[GX[i+1]+','+z]);});
  GX.forEach(x=>{for(let j=0;j<GZ.length-1;j++)link(N[x+','+GZ[j]],N[x+','+GZ[j+1]]);});
  let p=N['224,-32'];AIRX.forEach(x=>{const q=N[x+',-32'];link(p,q);p=q;});
  /* nœuds isolés retirés */
  Object.keys(N).forEach(k=>{if(!N[k].adj.length)delete N[k];});
  NET={N,E,nb:boxes.length};return NET;
}
function net(){if(!NET||NET.nb!==boxes.length)buildNet();return NET;}
function project(x,z){let best=null,bd=1e9;
  for(const e of net().E){const ax=e.a.x,az=e.a.z,dx=e.b.x-ax,dz=e.b.z-az,L2=dx*dx+dz*dz;const t=clamp(((x-ax)*dx+(z-az)*dz)/L2,0,1),px=ax+dx*t,pz=az+dz*t,d=Math.hypot(x-px,z-pz);if(d<bd){bd=d;best={e,t,x:px,z:pz,d};}}
  if(best){const e=best.e,m=Math.min(13,e.L*0.3)/e.L;best.t=clamp(best.t,m,1-m);best.x=e.a.x+(e.b.x-e.a.x)*best.t;best.z=e.a.z+(e.b.z-e.a.z)*best.t;}
  return best;}
/* direction d'arrivée pour que le trottoir (côté droit) soit du côté de la cible */
function arrival(P,tx,tz){const e=P.e,ux=(e.b.x-e.a.x)/e.L,uz=(e.b.z-e.a.z)/e.L,rx=-uz,rz=ux;return (rx*(tx-P.x)+rz*(tz-P.z))>=0?{from:e.a,to:e.b}:{from:e.b,to:e.a};}
function dijkstra(starts,goal,skip){
  const dist=new Map(),prev=new Map(),done=new Set();let open=[];
  starts.forEach(({n,c})=>{if(!n)return;if(!dist.has(n.k)||c<dist.get(n.k)){dist.set(n.k,c);prev.set(n.k,null);open.push(n);}});
  while(open.length){
    let bi=0;for(let i=1;i<open.length;i++)if(dist.get(open[i].k)<dist.get(open[bi].k))bi=i;
    const n=open.splice(bi,1)[0];if(done.has(n.k))continue;done.add(n.k);
    if(n===goal){const ch=[];for(let q=n;q;q=prev.get(q.k))ch.unshift(q);return ch;}
    const dn=dist.get(n.k);
    for(const {n:m,e} of n.adj){if(skip&&skip.has(e))continue;const nd=dn+e.L;if(nd<(dist.has(m.k)?dist.get(m.k):1e18)){dist.set(m.k,nd);prev.set(m.k,n);open.push(m);}}
  }
  return null;
}
/* itinéraire (ligne médiane) d'un point P (sur une arête, cap hx,hz) vers la cible Q (arrivée côté trottoir) */
function planFrom(P,hx,hz,Q,tx,tz){
  const A=arrival(Q,tx,tz),skip=new Set([Q.e]);
  const e=P.e,ux=(e.b.x-e.a.x)/e.L,uz=(e.b.z-e.a.z)/e.L,fwd=(ux*hx+uz*hz)>=0?e.b:e.a,back=fwd===e.b?e.a:e.b;
  if(P.e===Q.e){const ahead=((Q.x-P.x)*hx+(Q.z-P.z)*hz)>0,dirOK=A.to===fwd;if(ahead&&dirOK)return [{x:P.x,z:P.z},{x:Q.x,z:Q.z}];}
  skip.add(P.e);
  const dF=Math.hypot(fwd.x-P.x,fwd.z-P.z),dB=Math.hypot(back.x-P.x,back.z-P.z);
  let ch=dijkstra([{n:fwd,c:dF},{n:back,c:dB+220}],A.from,skip);
  if(!ch){skip.delete(P.e);ch=dijkstra([{n:fwd,c:dF},{n:back,c:dB+220}],A.from,new Set([Q.e]));}
  if(!ch)return null;
  return [{x:P.x,z:P.z},...ch.map(n=>({x:n.x,z:n.z})),{x:Q.x,z:Q.z}];
}
function planFromNode(n,Q,tx,tz){const A=arrival(Q,tx,tz);const ch=dijkstra([{n,c:0}],A.from,new Set([Q.e]));if(!ch)return null;return [...ch.map(q=>({x:q.x,z:q.z})),{x:Q.x,z:Q.z}];}
function lanePath(C,curbStart,curbEnd){
  const P=[];C.forEach(p=>{const l=P[P.length-1];if(!l||Math.hypot(p.x-l.x,p.z-l.z)>0.5)P.push({x:p.x,z:p.z});});
  if(P.length<2)return P;
  const seg=[];for(let i=0;i<P.length-1;i++){const dx=P[i+1].x-P[i].x,dz=P[i+1].z-P[i].z,L=Math.hypot(dx,dz);seg.push({ux:dx/L,uz:dz/L,L});}
  const out=[],s0=seg[0],o0=curbStart?CURB:LANE;
  out.push({x:P[0].x-s0.uz*o0,z:P[0].z+s0.ux*o0});
  if(curbStart&&s0.L>18)out.push({x:P[0].x+s0.ux*9-s0.uz*LANE,z:P[0].z+s0.uz*9+s0.ux*LANE});
  for(let i=1;i<P.length-1;i++){const a=seg[i-1],b=seg[i],dot=a.ux*b.ux+a.uz*b.uz;
    if(dot>0.95)continue;
    if(dot<-0.95){out.push({x:P[i].x-a.uz*LANE+a.ux*4,z:P[i].z+a.ux*LANE+a.uz*4});out.push({x:P[i].x+a.ux*7,z:P[i].z+a.uz*7});out.push({x:P[i].x-b.uz*LANE+b.ux*0.5,z:P[i].z+b.ux*LANE+b.uz*0.5});continue;}
    out.push({x:P[i].x-(a.uz+b.uz)*LANE,z:P[i].z+(a.ux+b.ux)*LANE});}
  const sl=seg[seg.length-1],E=P[P.length-1],oe=curbEnd?CURB:LANE;
  if(curbEnd&&sl.L>18)out.push({x:E.x-sl.ux*11-sl.uz*LANE,z:E.z-sl.uz*11+sl.ux*LANE});
  out.push({x:E.x-sl.uz*oe,z:E.z+sl.ux*oe});
  return out;
}
function follower(pts){const cum=[0],turn=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z));
  for(let i=1;i<pts.length-1;i++){const a=Math.atan2(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z),b=Math.atan2(pts[i+1].x-pts[i].x,pts[i+1].z-pts[i].z);turn.push(Math.abs(angDiff(a,b)));}turn.push(0);
  return {pts,cum,turn,L:cum[cum.length-1],i:0,s:0};}
function fAt(F,s){s=clamp(s,0,F.L);let i=Math.min(F.i,F.pts.length-2);while(i<F.pts.length-2&&F.cum[i+1]<s)i++;while(i>0&&F.cum[i]>s)i--;const a=F.pts[i],b=F.pts[i+1]||a,L=(F.cum[i+1]-F.cum[i])||1,t=clamp((s-F.cum[i])/L,0,1);return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t};}
function fProj(F,x,z){let best=F.s,bd=1e9,bi=F.i;
  for(let i=F.i;i<Math.min(F.pts.length-1,F.i+3);i++){const a=F.pts[i],b=F.pts[i+1],dx=b.x-a.x,dz=b.z-a.z,L2=dx*dx+dz*dz||1,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/L2,0,1),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);if(d<bd-1e-6){bd=d;bi=i;best=F.cum[i]+Math.sqrt(L2)*t;}}
  F.i=bi;F.s=Math.max(F.s,best);return F.s;}
/* pilote automatique : suit la trajectoire, ralentit aux virages, respecte les feux et la circulation */
function driveStep(c,F,dt,o){
  const s=fProj(F,c.x,c.z),rem=F.L-s;
  const look=clamp(2.6+Math.abs(c.v)*0.42,3,8),tp=fAt(F,s+look);
  const want=Math.atan2(tp.x-c.x,tp.z-c.z),dh=angDiff(c.h,want),rate=(o.rate||1.9)*clamp(c.v/3,0.12,1.35);
  c.h+=clamp(dh,-rate*dt,rate*dt);
  let vt=o.vmax;
  for(let k=F.i+1;k<F.pts.length-1;k++){const dc=F.cum[k]-s;if(dc>70)break;const a=F.turn[k];if(a>0.35){const vc=a>2.2?2.6:a>1.2?5:7.5;vt=Math.min(vt,Math.sqrt(vc*vc+2*3*Math.max(0,dc-3)));}}
  if(Math.abs(dh)>0.9)vt=Math.min(vt,3.2);
  vt=Math.min(vt,Math.sqrt(2*2.4*Math.max(0,rem-0.35)));
  const fx=Math.sin(c.h),fz=Math.cos(c.h);let block=false,why='';
  if((c.ghost||0)>0)c.ghost-=dt;else{
    if(!o.noCars)for(let i=0;i<cars.length;i++){const q=cars[i];if(q===c||(q.mesh&&!q.mesh.visible&&q.kind!=='player'))continue;const dx=q.x-c.x,dz=q.z-c.z,ah=dx*fx+dz*fz;if(ah<=0.6||ah>4.6+c.v*0.85)continue;if(Math.abs(dx*fz-dz*fx)>1.75)continue;block=true;why='car';break;}
    if(!block)for(let i=0;i<peds.length;i++){const p=peds[i],dx=p.x-c.x,dz=p.z-c.z,ah=dx*fx+dz*fz;if(ah>0.5&&ah<3.5+c.v*0.6&&Math.abs(dx*fz-dz*fx)<1.3){block=true;why='ped';break;}}
    if(!block&&!o.ignorePlayer&&!player.car){const dx=player.x-c.x,dz=player.z-c.z,ah=dx*fx+dz*fz;if(ah>0.5&&ah<3.5+c.v*0.6&&Math.abs(dx*fz-dz*fx)<1.3){block=true;why='ped';}}
    if(!block&&!o.noLights&&typeof lightState==='function'&&F.pts[F.i+1]){
      const a=F.pts[F.i],b=F.pts[F.i+1],sx=b.x-a.x,sz=b.z-a.z,ax=Math.abs(sx)>Math.abs(sz)?'x':'z',pos=ax==='z'?c.z:c.x,lat=ax==='z'?c.x:c.z,dir=Math.sign(ax==='z'?sz:sx);
      if(dir&&roadC.some(r=>Math.abs(r-lat)<6.5)){let best=1e9;for(const r of roadC){const d=(r-pos)*dir;if(d>5.4&&d<best)best=d;}
        if(best<45){const st=lightState(ax);if(st==='r'||(st==='y'&&best>7.6+c.v*c.v/24+1)){const vl=Math.sqrt(2*5*Math.max(0,best-8.4));if(vl<vt){vt=vl;why='light';}}}}}
  }
  if(block){c.bt=(c.bt||0)+dt;vt=0;if(c.bt>(why==='ped'?3:6)){c.ghost=2.5;c.bt=0;}}else c.bt=0;
  c.why=block?why:(why||'');
  c.v+=clamp(vt-c.v,-9*dt,(o.acc||3)*dt);if(c.v<0)c.v=0;
  c.x+=fx*c.v*dt;c.z+=fz*c.v*dt;
  return rem<0.8&&c.v<0.45;
}
T.net={project,planFrom,planFromNode,lanePath,follower,driveStep,arrival,dijkstra,get NET(){return net();}};

/* ---------------- personnages assis ---------------- */
function sitPose(m,arms,moto){const u=m.userData;if(!u||!u.legL)return;
  u.legL.rotation.x=u.legR.rotation.x=moto?-1.05:-1.45;if(u.kneeL){u.kneeL.rotation.x=u.kneeR.rotation.x=moto?1.35:1.5;}
  u.legL.rotation.z=moto?0.2:0.04;u.legR.rotation.z=moto?-0.2:-0.04;
  if(arms==='wheel'){u.armL.rotation.x=u.armR.rotation.x=-1.05;u.armL.rotation.z=0.14;u.armR.rotation.z=-0.14;}
  else if(arms==='bars'){u.armL.rotation.x=u.armR.rotation.x=-1.25;u.armL.rotation.z=0.32;u.armR.rotation.z=-0.32;}
  else if(arms==='hold'){u.armL.rotation.x=u.armR.rotation.x=-0.9;u.armL.rotation.z=0.25;u.armR.rotation.z=-0.25;}
  else{u.armL.rotation.x=u.armR.rotation.x=-0.4;u.armL.rotation.z=0.08;u.armR.rotation.z=-0.08;}}
function unsit(m){const u=m.userData;if(!u||!u.legL)return;u.legL.rotation.z=u.legR.rotation.z=0;animPerson(m,0,0,false);m.rotation.z=0;m.rotation.x=0;}
T.sitPose=sitPose;T.unsit=unsit;
function npcPerson(shirt){return makePerson(shirt!=null?shirt:pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{});}
T.npcPerson=npcPerson;
const DRIVERS=['Koffi','Mamadou','Awa','Yao','Inès','Sékou','Fatou','Bastien','Kwame','Nadia','Ibrahim','Léa'];

/* ---------------- maquettes : keke, habitacle, compteur, GPS ---------------- */
function kekeMesh(){
  const g=new THREE.Group(),paint=std(0xf2c200,.45,.1),green=std(0x1f8a4c,.5,.05),dark=std(0x1a1c20,.8),chrome=std(0xc1c7cc,.25,.8),canvasM=std(0x15402c,.85),rub=std(0x111214,.9);
  const wheels=[];const wheel=(x,z)=>{const p=new THREE.Group();p.position.set(x,.3,z);g.add(p);const t=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.18,14),rub);t.rotation.z=Math.PI/2;p.add(t);const r=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.2,10),chrome);r.rotation.z=Math.PI/2;p.add(r);wheels.push(p);};
  wheel(0,1.05);wheel(.62,-.75);wheel(-.62,-.75);
  bxm(g,1.3,.12,2.3,0,.42,-.05,dark);
  bxm(g,1.3,.55,1.2,0,.72,-.6,paint);bxm(g,.9,.6,.5,0,.75,.95,paint);bxm(g,1.25,.06,.9,0,1.04,.42,green);
  bxm(g,1.0,.7,.05,0,1.35,1.15,new THREE.MeshPhysicalMaterial({color:0x7fa9c0,roughness:.1,transparent:true,opacity:.35}));
  [[-.62,1.12],[.62,1.12],[-.62,-1.15],[.62,-1.15]].forEach(([x,z])=>bxm(g,.06,1.15,.06,x,1.38,z,dark));
  bxm(g,1.42,.08,2.5,0,1.98,-.02,canvasM);bxm(g,1.42,.35,.04,0,1.8,-1.22,canvasM);
  bxm(g,.52,.12,.42,0,.98,.5,dark);bxm(g,.5,.38,.08,0,1.2,.28,dark);
  bxm(g,1.15,.14,.5,0,.92,-.55,std(0x6b2b1e,.8));bxm(g,1.15,.5,.1,0,1.2,-.85,std(0x6b2b1e,.8));
  bxm(g,.62,.05,.05,0,1.3,1.02,chrome);
  bxm(g,.16,.1,.05,0,.88,1.22,std(0xfff3c0,.3));
  g.userData.wheels=wheels;g.userData.steer=[];castAll(g);return g;
}
function meterTex(){const T2=canvasTex(160,56);T2.draw=(fare,on)=>{const g=T2.g;g.fillStyle='#0b0d0f';g.fillRect(0,0,160,56);g.fillStyle=on?'#ff3b30':'#30d158';g.font='700 13px Rajdhani,Arial';g.fillText(on?'OCCUPÉ':'LIBRE',8,16);g.fillStyle='#ff6a3d';g.font='700 30px Rajdhani,Arial';g.textAlign='right';g.fillText('$'+fare.toFixed(2),152,46);g.textAlign='left';T2.t.needsUpdate=true;};T2.draw(0,false);return T2;}
function gpsTex(){return canvasTex(256,160);}
function drawGps(G,c,F,label){
  const g=G.g,W=256,H=160;g.fillStyle='#10161f';g.fillRect(0,0,W,H);
  const sc=0.55,ch=Math.cos(c.h),sh=Math.sin(c.h);
  const P=(x,z)=>{const dx=x-c.x,dz=z-c.z;const lx=-(dx*ch-dz*sh),lz=dx*sh+dz*ch;return [W/2+lx*sc,H*0.72-lz*sc];};
  g.strokeStyle='#2b3546';g.lineWidth=7;g.lineCap='round';
  GX.forEach(x=>{const a=P(x,-260),b=P(x,200);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();});
  GZ.forEach(z=>{const a=P(-260,z),b=P(560,z);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();});
  if(F){g.strokeStyle='#3aa0ff';g.lineWidth=5;g.beginPath();const p0=fAt(F,F.s),a=P(p0.x,p0.z);g.moveTo(a[0],a[1]);for(let i=F.i+1;i<F.pts.length;i++){const q=P(F.pts[i].x,F.pts[i].z);g.lineTo(q[0],q[1]);}g.stroke();
    const e=F.pts[F.pts.length-1],q=P(e.x,e.z);g.fillStyle='#ff3b30';g.beginPath();g.arc(q[0],q[1],6,0,7);g.fill();}
  g.fillStyle='#fff';g.beginPath();g.moveTo(W/2,H*0.72-9);g.lineTo(W/2+7,H*0.72+7);g.lineTo(W/2,H*0.72+3);g.lineTo(W/2-7,H*0.72+7);g.closePath();g.fill();
  g.fillStyle='rgba(8,12,18,.85)';g.fillRect(0,0,W,30);g.fillStyle='#fff';g.font='600 15px Barlow,Arial';g.fillText((label||'').slice(0,26),10,20);
  if(F){const rem=Math.max(0,F.L-F.s);g.textAlign='right';g.fillStyle='#8fd0ff';g.fillText(rem>999?(rem/1000).toFixed(1)+' km':Math.round(rem)+' m',W-10,20);g.textAlign='left';}
  G.t.needsUpdate=true;
}
/* habitacle de berline (siège avant droit pour le joueur) */
function carInterior(c,ride){
  const g=new THREE.Group();g.name='int26';
  const lux=ride.id==='confort',bus=c.type==='danfo';
  const seatM=lam(lux?0xcbb48c:0x30343b),dashM=std(0x1f2226,.75),trim=lam(lux?0x6b4a2e:0x3b3f46),liner=lam(lux?0xe4dccb:0xb9b5ad),paint=std(ride.color,.35,.2),chrome=std(0xbfc5cc,.3,.8);
  const W=bus?.98:.86,ROOF=bus?1.95:1.48;
  bxm(g,W*2,.05,2.9,0,.36,-.15,lam(0x202226));
  bxm(g,W*2-.04,.36,.42,0,.82,.98,dashM);bxm(g,W*2-.1,.06,.36,0,1.02,.9,dashM);
  bxm(g,W*2,.06,1.3,0,.9,1.75,paint);
  const shell=new THREE.MeshLambertMaterial({color:lux?0xd8d0c0:0xa9a59e,side:THREE.DoubleSide});
  bxm(g,W*2,.04,2.2,0,ROOF,-.3,liner).material.side=THREE.DoubleSide;
  [-1,1].forEach(sd=>{
    bxm(g,.06,.6,2.6,sd*W,.68,-.2,trim);bxm(g,.1,.05,2.5,sd*(W-.03),.99,-.2,trim);
    const ap=bxm(g,.07,.07,.78,sd*(W-.05),(1.02+ROOF)/2,.98-0.28,shell);ap.rotation.x=Math.atan2(ROOF-1.02,.56);
    bxm(g,.07,ROOF-.98,.1,sd*(W-.03),(ROOF+.98)/2,-.3,shell);
    bxm(g,.07,ROOF-.98,.14,sd*(W-.03),(ROOF+.98)/2,-1.42,shell);
  });
  bxm(g,W*2,.08,.06,0,ROOF-.02,.7,shell);bxm(g,W*2,ROOF-.98,.05,0,(ROOF+.98)/2,-1.5,shell);
  bxm(g,W*2,.07,.06,0,1.0,1.18,shell);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(W*2-.12,.62),new THREE.MeshPhysicalMaterial({color:0x9cc4dc,roughness:.05,transparent:true,opacity:.1,depthWrite:false,side:THREE.DoubleSide}));glass.position.set(0,(1.02+ROOF)/2,.94);glass.rotation.x=-Math.atan2(.56,ROOF-1.02);g.add(glass);
  const seat=(x,z,w)=>{bxm(g,w,.14,.5,x,.5,z,seatM);const bk=bxm(g,w,.66,.12,x,.88,z-.27,seatM);bk.rotation.x=-.12;bxm(g,w*.55,.2,.1,x,1.3,z-.31,seatM);};
  seat(.4,.12,.5);seat(-.4,.12,.5);seat(0,-.85,W*2-.2);
  if(bus){seat(0,-1.75,W*2-.2);}
  bxm(g,.2,.1,.62,0,.62,.42,dashM);
  const sw=new THREE.Mesh(new THREE.TorusGeometry(.19,.024,8,24),dashM);sw.position.set(.4,1.0,.62);sw.rotation.x=-0.45;g.add(sw);bxm(g,.05,.05,.3,.4,.96,.75,dashM).rotation.x=-0.45;
  const mir=bxm(g,.26,.08,.03,0,ROOF-.12,.62,dashM);bxm(g,.24,.06,.01,0,ROOF-.12,.605,chrome);mir.rotation.x=.1;
  const clu=canvasTex(128,48);clu.g.fillStyle='#07090b';clu.g.fillRect(0,0,128,48);clu.g.strokeStyle='#ffb347';clu.g.lineWidth=3;[[34,24],[94,24]].forEach(([x,y])=>{clu.g.beginPath();clu.g.arc(x,y,18,Math.PI*.8,Math.PI*2.2);clu.g.stroke();});clu.t.needsUpdate=true;
  const cl=new THREE.Mesh(new THREE.PlaneGeometry(.36,.13),new THREE.MeshBasicMaterial({map:clu.t}));cl.position.set(.4,1.03,.79);cl.rotation.y=Math.PI;cl.rotation.x=0.25;g.add(cl);
  const gps=gpsTex();const gm=new THREE.Mesh(new THREE.PlaneGeometry(.3,.19),new THREE.MeshBasicMaterial({map:gps.t}));gm.position.set(0,1.1,.82);gm.rotation.y=Math.PI;gm.rotation.x=0.3;g.add(gm);
  bxm(g,.33,.22,.04,0,1.1,.835,dashM).rotation.x=0.3;
  let meter=null;if(ride.meter){meter=meterTex();const mm=new THREE.Mesh(new THREE.PlaneGeometry(.2,.07),new THREE.MeshBasicMaterial({map:meter.t}));mm.position.set(-.12,1.08,.72);mm.rotation.y=Math.PI;mm.rotation.x=.5;g.add(mm);bxm(g,.22,.09,.07,-.12,1.07,.76,dashM).rotation.x=.5;}
  if(lux){bxm(g,.4,.02,.3,-.4,1.03,.86,std(0x5a3b22,.4));}
  if(bus){for(let i=0;i<3;i++){const p=npcPerson();sitPose(p,null);p.position.set(i===1?.42:-.42,-.32,i<2?-.85:-1.75);g.add(p);}}
  const pend=new THREE.Group();pend.position.set(0,ROOF-.2,.6);const pm=new THREE.Mesh(new THREE.BoxGeometry(.06,.08,.012),lam(pick([0x2e9a6a,0xd94f4f,0xffd23f])));pm.position.y=-.1;pend.add(pm);g.add(pend);
  g.userData={gps,meter,pend};
  return g;
}

/* ---------------- catalogue des courses ---------------- */
const RIDES=[
  {id:'taxi',name:'Taxi Aurore',short:'Taxi',emo:'🚕',type:'taxi',color:0xf5c400,base:4,perM:.075,vmax:12.5,seat:'car',meter:true,desc:'Berline jaune avec compteur',tint:'#f7b500'},
  {id:'confort',name:'Aurore Prestige',short:'Prestige',emo:'🚘',type:'benz',color:0x16181d,base:10,perM:.12,vmax:13,seat:'car',meter:true,desc:'Berline noire, intérieur cuir',tint:'#3a3a3c'},
  {id:'okada',name:'Okada',short:'Okada',emo:'🏍️',type:'motorcycle',color:0xd94f4f,base:3,perM:.045,vmax:15,seat:'moto',noCars:true,desc:'Moto-taxi, se faufile dans les bouchons',tint:'#ff453a'},
  {id:'keke',name:'Keke',short:'Keke',emo:'🛺',type:'keke',color:0xf2c200,base:2,perM:.03,vmax:8.5,seat:'keke',desc:'Tricycle ouvert, prix doux',tint:'#30d158'},
  {id:'danfo',name:'Danfo',short:'Danfo',emo:'🚐',type:'danfo',color:0xf2c200,base:1.5,perM:.016,vmax:10,seat:'car',stops:true,desc:'Minibus partagé, quelques arrêts',tint:'#ffcc00'}
];
T.RIDES=RIDES;
const rush=()=>{const h=(gameMin/60)%24;return(h>=7&&h<9.5)||(h>=17&&h<19.5);};
function destList(){return spots.filter(s=>s.id!=='exit'&&s.z<240&&s.x>-262&&s.x<700&&!/^lot/.test(String(s.id))).map(s=>({s,d:Math.hypot(s.x-player.x,s.z-player.z)})).filter(o=>o.d>28).sort((a,b)=>a.d-b.d);}
function quote(r,s){const P=project(player.x,player.z),Q=project(s.x,s.z);if(!P||!Q)return null;const C=planFrom(P,1,0,Q,s.x,s.z)||planFrom(P,0,1,Q,s.x,s.z);let L=0;if(C)for(let i=1;i<C.length;i++)L+=Math.hypot(C[i].x-C[i-1].x,C[i].z-C[i-1].z);else L=Math.hypot(s.x-player.x,s.z-player.z)*1.3;
  const k=(r.id==='danfo'&&rush()?1.15:1);return {L,price:Math.max(2,Math.round(r.base+r.perM*L)),secs:Math.round(L/(r.vmax*0.62)*k+8)};}

/* ---------------- véhicules de service ---------------- */
function spawnVehicle(r,x,z,h){
  let c;
  if(r.type==='keke'){const mesh=kekeMesh();mesh.rotation.order='YXZ';mesh.position.set(x,0,z);mesh.rotation.y=h;scene.add(mesh);c={mesh,x,z,h,v:0,kind:'ride',lane:null,maxV:0,dmgT:0,type:'keke',top:10,acc:1,fuel:100,damage:0};cars.push(c);}
  else{c=addCar(x,z,h,r.color,'ride',r.type);c.kind='ride';}
  c.ride26=true;c.plate=(String.fromCharCode(65+Math.floor(Math.random()*26))+String.fromCharCode(65+Math.floor(Math.random()*26))+'-'+Math.floor(rand(100,999)));
  return c;
}
function removeVehicle(c){if(!c)return;scene.remove(c.mesh);const i=cars.indexOf(c);if(i>=0)cars.splice(i,1);}
function attachDriver(c,r){
  const d=npcPerson(r.id==='taxi'?0xf5c400:r.id==='confort'?0x1d1f24:r.id==='okada'?0x2f3a4a:null);
  if(r.seat==='moto'){sitPose(d,'bars',true);d.position.set(0,.55,-.28);}
  else if(r.seat==='keke'){sitPose(d,'bars');d.position.set(0,.02,.5);}
  else{sitPose(d,'wheel');d.position.set(.4,-.34,.12);}
  c.mesh.add(d);c.driverMesh=d;
  if(r.seat==='moto'){const helm=new THREE.Mesh(new THREE.SphereGeometry(.17,14,10),std(0x111316,.3,.2));helm.position.y=1.72;helm.scale.set(1,1.05,1.12);d.add(helm);}
}
function beacon(col){const m=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,26,14,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.28,depthWrite:false,fog:false,side:THREE.DoubleSide}));m.position.y=13;scene.add(m);return m;}
T.beacon=beacon;

/* ---------------- messages de service sur le téléphone ---------------- */
function svcMsg(name,text,emo){
  T.svc.add(name);(threads[name]=threads[name]||[]).push({t:text,at:Math.floor(gameMin)});
  const open=!$('#phone').hidden&&typeof phThN!=='undefined'&&phThN===name;
  if(!open)unread[name]=(unread[name]||0)+1;else if(typeof phThread==='function')phThread(name);
  try{tone(880,0.12,'sine',0.07);tone(1320,0.16,'sine',0.05,0.1);}catch(e){}
  if(!$('#phone').hidden&&typeof island25==='function')island25(`<span style="font-size:26px">${emo||'💬'}</span><div class="isl-t"><b>${esc(name)}</b><span>${esc(text)}</span></div>`,3800);
  else notify26(name,text,emo);
}
T.svcMsg=svcMsg;
let notifEl=null;
function notify26(name,text,emo){
  if(!$('#phone').hidden)return;
  if(!notifEl){notifEl=document.createElement('button');notifEl.type='button';notifEl.id='notif26';$('#hud').appendChild(notifEl);notifEl.onclick=()=>{const n=notifEl.dataset.n;notifEl.classList.remove('on');if(!started||panelOpen)return;togglePhone();setTimeout(()=>{if(typeof phThread==='function'&&n){unread[n]=0;phThread(n);}},120);};}
  notifEl.dataset.n=name;notifEl.innerHTML=`<i>${emo||'💬'}</i><span><b>${esc(name)}</b><em>${esc(text)}</em></span><small>maintenant</small>`;
  notifEl.classList.remove('on');void notifEl.offsetWidth;notifEl.classList.add('on');clearTimeout(notifEl._t);notifEl._t=setTimeout(()=>notifEl.classList.remove('on'),5200);
}
/* fils de discussion des services dans Messages */
function patchMessages(){
  if(typeof RENDER25==='undefined')return;
  const m=RENDER25['Messages'];if(m&&!m.p26){const fn=m.fn;m.fn=function(b){const f=state.friends,add=[...T.svc].filter(n=>threads[n]&&threads[n].length&&f.indexOf(n)<0);state.friends=f.concat(add);try{fn(b);}finally{state.friends=f;}};m.p26=1;}
  if(typeof phThread==='function'&&!phThread.p26){const pt=phThread;phThread=function(n){pt(n);if(!T.svc.has(n))return;const ch=document.querySelector('#ph-body .chips');if(!ch)return;ch.innerHTML='';
      const q=T.ride&&T.ride.driver===n?['J’arrive !','Tu es où exactement ?','Merci, à tout de suite']:T.food&&T.food.courier===n?['J’arrive, 2 minutes !','Tu es où ?','Merci !']:['Merci !'];
      q.forEach(t=>{const x=mk('button','chip',t,()=>svcReply(n,t));x.type='button';ch.appendChild(x);});};phThread.p26=1;}
  if(typeof sendMsg==='function'&&!sendMsg.p26){const sm=sendMsg;sendMsg=function(n,t,k){if(T.svc.has(n)){svcReply(n,t);return;}sm(n,t,k);};sendMsg.p26=1;}
}
function svcReply(n,t){
  if(typeof blackout!=='undefined'&&blackout>0){toast('Pas de réseau.','warn');return;}
  (threads[n]=threads[n]||[]).push({me:1,t,at:Math.floor(gameMin)});if(typeof P25!=='undefined')P25.sent[n]=performance.now();if(typeof phThread==='function')phThread(n);
  setTimeout(()=>{let r='D’accord 👍';const R=T.ride,Fd=T.food;
    if(R&&R.driver===n)r=R.phase==='waiting'?'Je suis garé au bord de la route, '+(R.vehDesc||'')+'.':R.phase==='coming'?'Je suis à '+Math.round(R.left||0)+' m, j’arrive.':'Bonne journée !';
    else if(Fd&&Fd.courier===n)r=Fd.phase==='wait'?'Je suis juste devant '+Fd.where+', je t’attends 🛵':Fd.phase==='ride'?'Je suis en route, ' +Math.round(Fd.left||0)+' m.':Fd.phase==='prep'?'Le restaurant prépare ta commande.':'Bon appétit !';
    (threads[n]=threads[n]||[]).push({t:r,at:Math.floor(gameMin)});if(!$('#phone').hidden&&phThN===n)phThread(n);else unread[n]=(unread[n]||0)+1;},1500);
}

/* ---------------- commande d'une course ---------------- */
function rideBlock(){
  if(!started)return 'Pas encore en ville.';
  if(T.ride)return 'Une course est déjà en cours.';
  if(player.car)return 'Descends de ta voiture d’abord.';
  if(player.inside)return 'Sors du bâtiment pour commander.';
  if(T.isBusy&&T.isBusy())return 'Pas maintenant.';
  if(mission&&mission.kind==='crime')return 'Pas en pleine mission.';
  return '';
}
function orderRide(r,s){
  const why=rideBlock();if(why){toast(why,'warn');return false;}
  if(r.id!=='okada'&&typeof blackout!=='undefined'&&blackout>0){toast('Pas de réseau pour commander.','warn');return false;}
  const q=quote(r,s);if(!q)return false;if(state.cash+state.bank<q.price){toast('Pas assez d’argent pour cette course.','warn');return false;}
  const P=project(player.x,player.z);if(!P){toast('Aucune route accessible ici.','warn');return false;}
  /* le chauffeur part d'un carrefour à 90-190 m */
  const N=Object.values(net().N),A=arrival(P,player.x,player.z);
  let cand=N.filter(n=>{const d=Math.hypot(n.x-P.x,n.z-P.z);return d>90&&d<190&&n.x<=224;});if(!cand.length)cand=N.filter(n=>Math.hypot(n.x-P.x,n.z-P.z)>40);
  let C=null;for(let t=0;t<6&&!C;t++){const n=pick(cand);C=planFromNode(n,P,player.x,player.z);}
  if(!C)C=[{x:A.from.x,z:A.from.z},{x:P.x,z:P.z}];
  const pts=lanePath(C,false,true),F=follower(pts),h0=Math.atan2(pts[1].x-pts[0].x,pts[1].z-pts[0].z);
  const c=spawnVehicle(r,pts[0].x,pts[0].z,h0);attachDriver(c,r);
  const driver=pick(DRIVERS)+(r.id==='okada'?' · Okada':r.id==='keke'?' · Keke':r.id==='danfo'?' · Danfo':r.id==='confort'?' · Prestige':' · Taxi');
  const vehDesc=(r.id==='okada'?'moto rouge':r.id==='keke'?'keke jaune et vert':r.id==='danfo'?'danfo jaune':r.id==='confort'?'berline noire':'taxi jaune')+' '+c.plate;
  T.ride={r,dest:s,q,c,F,phase:'coming',t:0,driver,vehDesc,fare:0,dist:0,beacon:beacon(0xffd23f),wait:0,stopsAt:r.stops?[0.4]:[],stopT:0,P};
  T.ride.left=F.L;
  svcMsg(driver,'Bonjour ! Je prends ta course vers '+s.label+'. J’arrive dans '+fmtSec(F.L/(r.vmax*.6)+5)+', '+vehDesc+'.',r.emo);
  if(typeof bump==='function')try{bump('transit');}catch(e){}
  closePanel();rideHud(true);return true;
}
T.orderRide=orderRide;
function fmtSec(s){s=Math.max(0,Math.round(s));return s<60?s+' s':Math.floor(s/60)+' min'+(s%60>=10?' '+String(s%60).padStart(2,'0'):'');}
function cancelRide(msg){const R=T.ride;if(!R)return;
  if(R.onboard){stopHere();return;}
  if(R.phase==='waiting'&&R.wait>30){takeMoney(3);toast('Course annulée · frais d’attente '+fmt(3),'warn');}else toast(msg||'Course annulée.','warn');
  svcMsg(R.driver,'Pas de souci, course annulée. À bientôt !',R.r.emo);leaveRide();}
function leaveRide(){const R=T.ride;if(!R)return;if(R.beacon)scene.remove(R.beacon);
  const c=R.c;c.leaving={t:0};
  const P=project(c.x,c.z);let F=null;
  if(P){const N=Object.values(net().N).filter(n=>Math.hypot(n.x-c.x,n.z-c.z)>110&&n.x<=224);const n=pick(N.length?N:Object.values(net().N));const Q=project(n.x+(Math.random()<.5?20:-20),n.z);if(Q){const C=planFrom(P,Math.sin(c.h),Math.cos(c.h),Q,Q.x+1,Q.z+1);if(C)F=follower(lanePath(C,true,false));}}
  T.leavers=T.leavers||[];T.leavers.push({c,F,r:R.r,t:0});T.ride=null;rideHud(false);
}
function board(){
  const R=T.ride;if(!R||R.phase!=='waiting')return;
  R.phase='boarding';R.onboard=true;R.t=0;R.bfrom={x:player.x,z:player.z};
  const c=R.c,rx=-Math.cos(c.h),rz=Math.sin(c.h);R.door={x:c.x+rx*1.3,z:c.z+rz*1.3};
  if(R.beacon){scene.remove(R.beacon);R.beacon=null;}
  /* trajet vers la destination */
  const P=project(c.x,c.z),s=R.dest,Q=project(s.x,s.z);let C=P&&Q?planFrom(P,Math.sin(c.h),Math.cos(c.h),Q,s.x,s.z):null;
  if(!C)C=[{x:c.x,z:c.z},{x:s.x,z:s.z}];
  const pts=lanePath(C,true,true);pts[0]={x:c.x,z:c.z};R.F=follower(pts);R.total=R.F.L;
  if(R.r.stops)R.stopsAt=[R.F.L*0.45];
  T.cam.blend=0;T.cam.from=camera.position.clone();T.cam.fromQ=camera.quaternion.clone();
  if(R.c.mesh.userData.int26==null&&R.r.seat==='car'){const g=carInterior(c,R.r);c.mesh.add(g);c.mesh.userData.int26=g;}
  toast(R.r.seat==='car'?'Tu montes à bord. V : vue intérieure / extérieure.':'Tu t’installes derrière le chauffeur. V : changer de vue.','good');
  rideHud(true);
}
function stopHere(){const R=T.ride;if(!R||R.phase!=='riding')return;
  const s=R.F.s;R.F=follower([{x:R.c.x,z:R.c.z},fAt(R.F,Math.min(R.F.L,s+Math.max(10,R.c.v*R.c.v/4+6)))]);R.early=true;toast('Le chauffeur se range au bord de la route.');}
function finishRide(){
  const R=T.ride;if(!R)return;const c=R.c,r=R.r;
  const price=r.meter?Math.max(r.base,Math.round(R.fare)):(R.early?Math.max(2,Math.round(R.q.price*Math.min(1,R.dist/Math.max(1,R.total)))):R.q.price);
  takeMoney(price);if(typeof econTxP58==='function')try{econTxP58(r.name+' · '+(R.early?'arrêt anticipé':R.dest.label),-price,state.cash>=0?'Cash':'Banque');}catch(e){}
  const rx=-Math.cos(c.h),rz=Math.sin(c.h);let ex={x:c.x+rx*2.1,z:c.z+rz*2.1};
  for(const k of [2.1,2.8,-2.4]){const t={x:c.x+rx*k,z:c.z+rz*k};if(pushAABB(t,.5)===0){ex=t;break;}}
  player.x=ex.x;player.z=ex.z;player.h=c.h;camYaw=c.h;player.mesh.visible=true;unsit(player.mesh);player.mesh.position.set(player.x,.1,player.z);
  if(c.mesh.userData.int26){c.mesh.remove(c.mesh.userData.int26);c.mesh.userData.int26=null;}
  showExterior(c,true);restoreCam();
  state.energy=Math.max(0,state.energy-R.t*.004);if(typeof fameAdd==='function')try{fameAdd(1);}catch(e){}
  if(r.id==='okada'&&Math.random()<.06){state.health=Math.max(5,state.health-6);toast('Okada : petit écart sur la route, −6 santé.','warn');}
  toast((R.early?'Tu descends en route':'Arrivé : '+R.dest.label)+' · '+fmt(price)+' payés','good');
  svcMsg(R.driver,'Merci pour la course ! '+fmt(price)+' réglés. Bonne journée 🙏',r.emo);
  try{if(typeof saveProgress==='function')saveProgress();}catch(e){}
  leaveRide();
}
function restoreCam(){camera.up.set(0,1,0);if(camera.near!==0.3){camera.near=0.3;camera.updateProjectionMatrix();}T.look.y=0;T.look.p=0;T.cam.blend=1;CAMX.tgt=null;camDist=5.4*CAMX.zoom;}
T.restoreCam=restoreCam;
function showExterior(c,on){
  const ws=new Set();(c.mesh.userData.wheels||[]).forEach(w=>{let o=w;while(o&&o!==c.mesh){ws.add(o);o=o.parent;}});
  c.mesh.children.forEach(ch=>{if(ch===c.mesh.userData.int26||ch===c.driverMesh){ch.visible=ch===c.mesh.userData.int26?!on:true;return;}if(ws.has(ch))return;ch.visible=on;});
}
T.showExterior=showExterior;

/* ---------------- tick des courses ---------------- */
let hudT=0,gpsT=0;
function tickRide(dt){
  const R=T.ride;if(!R)return;R.t+=dt;const c=R.c,r=R.r;
  const o={vmax:r.vmax*(rush()&&r.id!=='okada'?0.8:1),acc:r.seat==='moto'?4:3,noCars:!!r.noCars,ignorePlayer:R.phase!=='coming'};
  if(R.phase==='coming'){
    const done=driveStep(c,R.F,dt,o);R.left=R.F.L-R.F.s;
    if(R.beacon)R.beacon.position.set(c.x,13,c.z);
    if(done){R.phase='waiting';R.wait=0;c.v=0;
      const where=nearestLabel(c.x,c.z);svcMsg(R.driver,'Je suis arrivé'+(where?' devant '+where:'')+' : '+R.vehDesc+'. Je t’attends au bord de la route.',r.emo);
      if(typeof honk==='function')try{honk(.05);}catch(e){}
    }
  }else if(R.phase==='waiting'){
    R.wait+=dt;c.v=0;if(R.beacon)R.beacon.position.set(c.x,13,c.z);
    if(R.wait>60&&!R.remind){R.remind=1;svcMsg(R.driver,'Toujours là ? Je peux attendre encore un peu.',r.emo);if(typeof honk==='function')try{honk(.05);}catch(e){}}
    if(R.wait>150){svcMsg(R.driver,'Je n’ai pas pu attendre plus longtemps, course annulée. Frais d’attente '+fmt(3)+'.',r.emo);takeMoney(3);leaveRide();return;}
  }else if(R.phase==='boarding'){
    const k=clamp(R.t/0.9,0,1),m=player.mesh;
    if(k<0.75){const f=k/0.75;player.x=lerp(R.bfrom.x,R.door.x,f);player.z=lerp(R.bfrom.z,R.door.z,f);player.h=Math.atan2(R.door.x-R.bfrom.x,R.door.z-R.bfrom.z);player.walk=(player.walk||0)+dt*9;animPerson(m,player.walk,.6,false);m.position.set(player.x,.1,player.z);m.rotation.y=player.h;}
    else if(r.seat==='car')m.visible=false;
    if(R.t>=1){R.phase='riding';R.t=0;R.dist=0;R.fare=r.base;if(r.seat!=='car'){m.visible=true;sitPose(m,'hold',r.seat==='moto');}}
  }else if(R.phase==='riding'){
    const n=T.speed,sdt=dt/n;
    for(let i=0;i<n;i++){
      if(R.stopT>0){R.stopT-=sdt;c.v=Math.max(0,c.v-9*sdt);continue;}
      const px=c.x,pz=c.z,done=driveStep(c,R.F,sdt,o);R.dist+=Math.hypot(c.x-px,c.z-pz);
      if(r.meter)R.fare=r.base+R.dist*r.perM+(c.v<0.5?sdt*0.02:0);
      if(R.stopsAt.length&&R.F.s>=R.stopsAt[0]){R.stopsAt.shift();R.stopT=3.2;toast('Danfo : arrêt, un passager descend.');}
      if(done){finishRide();return;}
    }
    if(n>1)gameMin+=dt*0.4*(n-1);
    R.left=R.F.L-R.F.s;
    /* inclinaison de la moto / du keke en virage */
    const yr=angDiff(R.ph==null?c.h:R.ph,c.h)/Math.max(dt,1e-3);R.ph=c.h;R.lean=lerp(R.lean||0,clamp(-yr*c.v*0.045,-.42,.42),Math.min(1,5*dt));
    if(r.seat==='moto')c.mesh.rotation.z=R.lean;
    const U=c.mesh.userData.int26;
    if(U){gpsT-=dt;if(gpsT<=0){gpsT=.25;drawGps(U.userData.gps,c,R.F,R.dest.label);if(U.userData.meter)U.userData.meter.draw(R.fare,true);}if(U.userData.pend)U.userData.pend.rotation.z=lerp(U.userData.pend.rotation.z,clamp(yr*.25,-.6,.6),Math.min(1,4*dt));}
  }
}
function nearestLabel(x,z){let b=null,bd=45;spots.forEach(s=>{const d=Math.hypot(s.x-x,s.z-z);if(d<bd&&s.label){bd=d;b=s.label;}});return b;}
T.nearestLabel=nearestLabel;
function tickLeavers(dt){
  if(!T.leavers)return;
  for(let i=T.leavers.length-1;i>=0;i--){const L=T.leavers[i];L.t+=dt;let done=true;
    if(L.F)done=driveStep(L.c,L.F,dt,{vmax:L.r?L.r.vmax:11,acc:3,ignorePlayer:true});
    const far=Math.hypot(L.c.x-player.x,L.c.z-player.z)>130;
    if(done||L.t>90||(far&&L.t>8)){removeVehicle(L.c);if(L.extra)L.extra.forEach(o=>scene.remove(o));T.leavers.splice(i,1);}}
}
T.leaveVehicle=(c,F,r,extra)=>{T.leavers=T.leavers||[];T.leavers.push({c,F,r,t:0,extra});};

/* ---------------- livraison de repas en personne ---------------- */
const COURIERS=['Moussa','Chloé','Rayan','Aïcha','Tidiane','Sarah','Ousmane','Maëlys'];
function orderFood(item){
  const [name,id,food,emo]=item,price=foodPrice(item);
  if(typeof blackout!=='undefined'&&blackout>0){toast('Pas de réseau.','warn');return;}
  if(T.food){toast('Une commande est déjà en route.','warn');return;}
  if(state.cash<price){toast('Pas assez de cash.','warn');return;}
  state.cash-=price;if(typeof econTxP58==='function')try{econTxP58('Livraison · '+name,-price,'Cash');}catch(e){}
  const courier=pick(COURIERS)+' · Livreur';
  T.food={name,id,food,emo,price,phase:'prep',t:0,prep:rand(10,16),courier,where:'',left:0};
  T.svc.add(courier);
  svcMsg(courier,'Commande reçue : '+name+'. Le restaurant prépare, je pars dès que c’est prêt !',emo);
  if(typeof phApp!=='undefined'&&phApp&&phApp[0]==='Livraison')phOpen(phApp);
}
function foodPrice(item){const id=item[1];return (typeof walletP58!=='undefined'&&walletP58.prices&&walletP58.prices[id]!=null?walletP58.prices[id]:{sand:9,menu:14,fish:12}[id]||10)+4;}
function foodTarget(){if(player.inside&&player.outside)return {x:player.outside.x,z:player.outside.z,inside:true};return {x:player.x,z:player.z,inside:false};}
function startCourier(){
  const Fd=T.food,tg=foodTarget(),P=project(tg.x,tg.z);if(!P){Fd.phase='fail';return;}
  const N=Object.values(net().N);let cand=N.filter(n=>{const d=Math.hypot(n.x-P.x,n.z-P.z);return d>110&&d<220&&n.x<=224;});if(!cand.length)cand=N;
  let C=null;for(let t=0;t<6&&!C;t++)C=planFromNode(pick(cand),P,tg.x,tg.z);
  if(!C){const A=arrival(P,tg.x,tg.z);C=[{x:A.from.x,z:A.from.z},{x:P.x,z:P.z}];}
  const pts=lanePath(C,false,true),F=follower(pts),h0=Math.atan2(pts[1].x-pts[0].x,pts[1].z-pts[0].z);
  const c=addCar(pts[0].x,pts[0].z,h0,0x06c167,'ride','scooter');c.kind='ride';c.ride26=true;
  const box=bxm(c.mesh,.62,.55,.55,0,1.72,-.62,std(0x06c167,.5));const lbl=canvasTex(128,64);lbl.g.fillStyle='#06c167';lbl.g.fillRect(0,0,128,64);lbl.g.fillStyle='#fff';lbl.g.font='800 26px Barlow,Arial';lbl.g.textAlign='center';lbl.g.fillText('MIAM',64,42);lbl.t.needsUpdate=true;
  [[.312,Math.PI/2],[-.312,-Math.PI/2]].forEach(([x,ry])=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.25),new THREE.MeshBasicMaterial({map:lbl.t}));p.position.set(x,1.74,-.62);p.rotation.y=ry;c.mesh.add(p);});
  const d=npcPerson(0x06c167);sitPose(d,'bars',true);d.position.set(0,.45,-.1);c.mesh.add(d);
  const helm=new THREE.Mesh(new THREE.SphereGeometry(.17,14,10),std(0x06c167,.35,.1));helm.position.y=1.72;helm.scale.set(1,1.05,1.12);d.add(helm);
  Fd.c=c;Fd.F=F;Fd.rider=d;Fd.phase='ride';Fd.t=0;Fd.tg=tg;Fd.left=F.L;Fd.beacon=beacon(0x06c167);
  svcMsg(Fd.courier,'C’est parti ! Je suis en route avec ta commande ('+Fd.name+'), environ '+fmtSec(F.L/7+10)+'.',Fd.emo);
}
function walkTo(o,tx,tz,dt,sp){const dx=tx-o.x,dz=tz-o.z,d=Math.hypot(dx,dz);if(d<0.15)return d;const st=Math.min(d,sp*dt),p={x:o.x+dx/d*st,z:o.z+dz/d*st};pushAABB(p,.38);
  if(Math.hypot(p.x-o.x,p.z-o.z)<st*0.25){o.stuck=(o.stuck||0)+dt;if(o.stuck>1.5){p.x=o.x+dx/d*st;p.z=o.z+dz/d*st;}}else o.stuck=0;
  o.x=p.x;o.z=p.z;o.h=o.h==null?Math.atan2(dx,dz):o.h+angDiff(o.h,Math.atan2(dx,dz))*Math.min(1,10*dt);o.walk=(o.walk||0)+dt*sp*2.3;return d;}
function tickFood(dt){
  const Fd=T.food;if(!Fd)return;Fd.t+=dt;
  if(Fd.phase==='prep'){if(Fd.t>=Fd.prep)startCourier();return;}
  if(Fd.phase==='fail'){state.cash+=Fd.price;toast('Livraison impossible ici, commande remboursée.','warn');T.food=null;return;}
  const c=Fd.c;
  if(Fd.phase==='ride'){
    const done=driveStep(c,Fd.F,dt,{vmax:12,acc:4,noCars:false,ignorePlayer:false});Fd.left=Fd.F.L-Fd.F.s;Fd.beacon.position.set(c.x,13,c.z);
    if(done){c.v=0;Fd.phase='walk';Fd.t=0;
      const w=new THREE.Vector3();Fd.rider.getWorldPosition(w);c.mesh.remove(Fd.rider);Fd.rider.rotation.set(0,0,0);unsit(Fd.rider);scene.add(Fd.rider);
      Fd.p={x:c.x-Math.cos(c.h)*1.1,z:c.z+Math.sin(c.h)*1.1,h:c.h};Fd.rider.position.set(Fd.p.x,.1,Fd.p.z);
      const bag=bxm(Fd.rider,.36,.3,.3,0,1.05,.32,std(0x06c167,.5));Fd.bag=bag;}
  }else if(Fd.phase==='walk'||Fd.phase==='wait'){
    const tg=foodTarget(),near=Math.hypot(tg.x-c.x,tg.z-c.z)<55;
    let gx,gz;
    if(!tg.inside&&near){const dx=Fd.p.x-tg.x,dz=Fd.p.z-tg.z,d=Math.hypot(dx,dz)||1;gx=tg.x+dx/d*1.4;gz=tg.z+dz/d*1.4;}
    else{const s=Fd.tg,dx=c.x-s.x,dz=c.z-s.z,d=Math.hypot(dx,dz)||1;gx=s.x+dx/d*1.6;gz=s.z+dz/d*1.6;}
    const m=Fd.rider;
    if(Fd.phase==='walk'){const d=walkTo(Fd.p,gx,gz,dt,2.6);animPerson(m,Fd.p.walk,.55,false);if(d<0.3||Fd.t>35){Fd.phase='wait';Fd.t=0;Fd.where=tg.inside?nearestLabel(Fd.p.x,Fd.p.z)||'l’entrée':(nearestLabel(Fd.p.x,Fd.p.z)||'toi');
        svcMsg(Fd.courier,tg.inside?'Je suis arrivé, je t’attends en bas devant '+Fd.where+' avec ta commande.':'Je suis arrivé ! Je suis juste devant '+(Fd.where==='toi'?'toi':Fd.where)+', je t’attends avec ta commande 🛵',Fd.emo);
        if(typeof wp!=='undefined')wp={x:Fd.p.x,z:Fd.p.z,l:'Ton livreur'};}}
    else{const d=Math.hypot(gx-Fd.p.x,gz-Fd.p.z);if(d>2.2)walkTo(Fd.p,gx,gz,dt,2.2),animPerson(m,Fd.p.walk,.5,false);else{animPerson(m,Fd.p.walk,0,false);const ph=Math.hypot(player.x-Fd.p.x,player.z-Fd.p.z)<12?Math.atan2(player.x-Fd.p.x,player.z-Fd.p.z):Fd.p.h;Fd.p.h+=angDiff(Fd.p.h,ph)*Math.min(1,5*dt);}
      if(Fd.t>70&&!Fd.remind){Fd.remind=1;svcMsg(Fd.courier,'Je suis toujours devant '+Fd.where+', ta commande refroidit 😅',Fd.emo);}
      if(Fd.t>170){svcMsg(Fd.courier,'Je dois repartir pour une autre livraison. Remboursement de '+fmt(Math.round(Fd.price/2))+'.',Fd.emo);state.cash+=Math.round(Fd.price/2);Fd.phase='back';Fd.t=0;if(Fd.bag){Fd.rider.remove(Fd.bag);Fd.bag=null;}if(typeof wp!=='undefined'&&wp&&wp.l==='Ton livreur')wp=null;return;}}
    m.position.set(Fd.p.x,.1,Fd.p.z);m.rotation.y=Fd.p.h;Fd.beacon.position.set(Fd.p.x,13,Fd.p.z);
  }else if(Fd.phase==='back'){
    const m=Fd.rider,sx=c.x-Math.cos(c.h)*1.1,sz=c.z+Math.sin(c.h)*1.1,d=walkTo(Fd.p,sx,sz,dt,2.8);animPerson(m,Fd.p.walk,.55,false);m.position.set(Fd.p.x,.1,Fd.p.z);m.rotation.y=Fd.p.h;
    if(d<0.4||Fd.t>30){scene.remove(m);m.position.set(0,.45,-.1);m.rotation.set(0,0,0);sitPose(m,'bars',true);c.mesh.add(m);if(Fd.bag){m.remove(Fd.bag);}courierLeave(true);}
  }
}
function collectFood(){const Fd=T.food;if(!Fd||Fd.phase!=='wait')return;
  state.hunger=Math.min(100,state.hunger+Fd.food);state.fun=Math.min(100,state.fun+3);
  say(Fd.rider,'Bon appétit !',3);toast(Fd.emo+' '+Fd.name+' récupéré · +'+Fd.food+' de faim','good');
  svcMsg(Fd.courier,'Merci et bon appétit ! N’hésite pas à me noter ⭐⭐⭐⭐⭐',Fd.emo);
  if(typeof wp!=='undefined'&&wp&&wp.l==='Ton livreur')wp=null;
  Fd.phase='back';Fd.t=0;if(Fd.bag){Fd.rider.remove(Fd.bag);Fd.bag=null;}
}
function courierLeave(mounted){const Fd=T.food;if(!Fd)return;if(Fd.beacon)scene.remove(Fd.beacon);
  if(!mounted&&Fd.rider&&Fd.rider.parent===scene){scene.remove(Fd.rider);}
  if(typeof wp!=='undefined'&&wp&&wp.l==='Ton livreur')wp=null;
  const c=Fd.c;if(c){const P=project(c.x,c.z);let F=null;if(P){const N=Object.values(net().N).filter(n=>Math.hypot(n.x-c.x,n.z-c.z)>110&&n.x<=224);const n=pick(N.length?N:Object.values(net().N)),Q=project(n.x+15,n.z);if(Q){const C=planFrom(P,Math.sin(c.h),Math.cos(c.h),Q,Q.x+1,Q.z+1);if(C)F=follower(lanePath(C,true,false));}}
    if(!mounted&&Fd.rider){/* le livreur repart directement */}
    T.leaveVehicle(c,F,{vmax:12});}
  T.food=null;
}
T.orderFood=orderFood;T.foodPrice=foodPrice;

/* ---------------- caméra pendant les trajets ---------------- */
const EYE={car:V3(-.4,1.2,.08),moto:V3(.16,2.2,-.66),keke:V3(.26,1.6,-.48)};
function lookDeltas(dt,lim){
  const dy=camYaw-(T.lastYaw==null?camYaw:T.lastYaw),dp=camPitch-(T.lastPitch==null?camPitch:T.lastPitch);T.lastYaw=camYaw;T.lastPitch=camPitch;
  T.look.y=clamp(T.look.y+dy,-(lim||2.7),lim||2.7);T.look.p=clamp(T.look.p+dp*1.2,-.75,.7);
  if(performance.now()-lastDrag>2600){const k=Math.exp(-1.6*dt);T.look.y*=k;T.look.p*=k;}
}
T.lookDeltas=lookDeltas;
const _v1=new THREE.Vector3(),_v2=new THREE.Vector3(),_q=new THREE.Quaternion(),_up=new THREE.Vector3();
function vehicleCam(dt,mesh,eye,o){ /* o:{int, extDist, extH, fovInt, fovExt, yaw0, pitch0} */
  mesh.updateMatrixWorld(true);lookDeltas(dt,o.lim);
  const want=o.int?(o.near||0.06):0.3;if(Math.abs(camera.near-want)>1e-4){camera.near=want;camera.updateProjectionMatrix();}
  let P,L;
  if(o.int){
    const yaw=(o.yaw0||0)+T.look.y,pit=(o.pitch0||0.04)+T.look.p,cp=Math.cos(pit);
    P=_v1.copy(eye);L=_v2.set(eye.x+Math.sin(yaw)*cp,eye.y-Math.sin(pit),eye.z+Math.cos(yaw)*cp);
    mesh.localToWorld(P);mesh.localToWorld(L);
    _up.set(0,1,0).applyQuaternion(mesh.getWorldQuaternion(_q));camera.up.copy(_up);
  }else{
    camera.up.set(0,1,0);
    const yaw=mesh.rotation.y+T.look.y,pit=clamp(0.26+T.look.p*.6,0.05,1.1),d=o.extDist*CAMX.zoom,cp=Math.cos(pit);
    const tx=mesh.position.x,ty=mesh.position.y+(o.extH||1.3),tz=mesh.position.z;
    P=_v1.set(tx-Math.sin(yaw)*cp*d,ty+Math.sin(pit)*d,tz-Math.cos(yaw)*cp*d);L=_v2.set(tx,ty,tz);
    if(P.y<0.6)P.y=0.6;
  }
  if(T.cam.blend<1&&T.cam.from){T.cam.blend=Math.min(1,T.cam.blend+dt/0.9);const k=T.cam.blend*T.cam.blend*(3-2*T.cam.blend);P=P.clone().lerp(T.cam.from,1-k);}
  camera.position.copy(P);camera.lookAt(L);
  const fov=o.int?(o.fovInt||70):(o.fovExt||62);if(Math.abs(camera.fov-fov)>.05){camera.fov+=(fov-camera.fov)*Math.min(1,4*dt);camera.updateProjectionMatrix();}
}
T.vehicleCam=vehicleCam;
function rideCam(dt){
  const R=T.ride;if(!R||!(R.phase==='riding'||(R.phase==='boarding'&&R.t>0.75)))return false;
  const c=R.c,int=T.view==='int';
  if(r_seat(R)==='car'){showExterior(c,!int);}
  if(r_seat(R)!=='car'){player.mesh.visible=!int;}
  vehicleCam(dt,c.mesh,EYE[r_seat(R)],{int,extDist:r_seat(R)==='car'?7.4:5.6,extH:r_seat(R)==='car'?1.3:1.6,lim:2.9});
  return true;
}
const r_seat=R=>R.r.seat;

/* ---------------- interface : carte de trajet ---------------- */
let card=null;
function rideHud(on){
  if(!card){card=document.createElement('section');card.id='ride26';card.className='card';$('#hud').appendChild(card);
    card.addEventListener('click',e=>{const b=e.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a;
      if(a==='view'){T.view=T.view==='int'?'ext':'int';saveView();T.look.y=0;T.look.p=0;}
      else if(a==='speed'){T.speed=T.speed===1?2:T.speed===2?4:1;}
      else if(a==='cancel')cancelRide();
      else if(a==='stop')stopHere();
      else if(a==='call'){togglePhone();setTimeout(()=>{if(T.ride&&typeof phThread==='function'){unread[T.ride.driver]=0;phThread(T.ride.driver);}},120);}
      rideHudFill(true);});}
  card.hidden=!on;if(on)rideHudFill(true);
}
function rideHudFill(force){
  const R=T.ride;if(!R||!card)return;const r=R.r;
  let title,sub,meta,prog=0,btn='';
  if(R.phase==='coming'){title=r.emo+' '+(r.seat==='car'?'Ton '+r.short.toLowerCase()+' arrive':'Ton '+r.short.toLowerCase()+' arrive');sub=R.driver.split(' · ')[0]+' · '+R.vehDesc;meta=Math.round(R.left)+' m · ~'+fmtSec(R.left/Math.max(4,r.vmax*.6));prog=1-R.left/Math.max(1,R.F.L);btn='<button data-a="call">Message</button><button data-a="cancel" class="ghost">Annuler</button>';}
  else if(R.phase==='waiting'){title=r.emo+' Ton chauffeur est là';sub='Approche-toi et appuie sur E pour monter';meta='Attend encore '+fmtSec(150-R.wait);prog=1;btn='<button data-a="call">Message</button><button data-a="cancel" class="ghost">Annuler</button>';}
  else{const rem=Math.max(0,R.F.L-R.F.s);title=r.emo+' En route · '+R.dest.label;sub=R.driver.split(' · ')[0]+(R.c.why==='light'?' · feu rouge':R.c.why==='car'?' · circulation':R.stopT>0?' · arrêt':'');meta=(rem>999?(rem/1000).toFixed(1)+' km':Math.round(rem)+' m')+' · ~'+fmtSec(rem/Math.max(5,r.vmax*.62)/T.speed)+' · '+(r.meter?'compteur '+fmt(R.fare||r.base):fmt(R.q.price));prog=R.total?1-rem/R.total:0;
    btn='<button data-a="view">'+(T.view==='int'?'Vue extérieure':'Vue intérieure')+'</button><button data-a="speed">×'+T.speed+'</button><button data-a="stop" class="ghost">Descendre ici</button>';}
  const k=R.phase+'|'+T.view+'|'+T.speed;
  if(force||card.dataset.k!==k){card.dataset.k=k;card.innerHTML=`<div class="r26-top"><b class="r26-t"></b><span class="r26-s"></span></div><div class="r26-bar"><i></i></div><div class="r26-m"></div><div class="r26-b">${btn}</div><small class="r26-h">${R.phase==='riding'?'V : vue · glisser : regarder autour':''}</small>`;}
  card.querySelector('.r26-t').textContent=title;card.querySelector('.r26-s').textContent=sub;card.querySelector('.r26-m').textContent=meta;card.querySelector('.r26-bar i').style.width=(clamp(prog,0,1)*100).toFixed(1)+'%';
}

/* ---------------- applis téléphone : Taxi, Transports, Livraison ---------------- */
const CAR_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l1.8-5a1.5 1.5 0 0 1 1.4-1h7.6a1.5 1.5 0 0 1 1.4 1L19 12"/><rect x="3" y="12" width="18" height="5.5" rx="2"/><path d="M5.5 17.5v2M18.5 17.5v2"/></svg>';
function rideApp(b,def){
  const sel=RIDES.find(r=>r.id===(b._r26||def))||RIDES[0];
  const R=T.ride;
  if(R){const st=R.phase==='coming'?'En approche · '+Math.round(R.left)+' m':R.phase==='waiting'?'Arrivé, t’attend au bord de la route':R.phase==='riding'?'En route vers '+R.dest.label:'À bord';
    b.appendChild(h25(`<div class="track"><span>${esc(R.r.name)} · ${esc(R.driver.split(' · ')[0])}</span><b>${esc(st)}</b><div class="pg"><i style="--from:${(R.phase==='coming'?100*(1-R.left/Math.max(1,R.F.L)):100).toFixed(1)}%;animation:none;width:${(R.phase==='coming'?100*(1-R.left/Math.max(1,R.F.L)):100).toFixed(1)}%"></i></div><div class="steps"><span>Commande</span><span>En approche</span><span>À bord</span></div></div>`));
    const g=grp25(b);row25(g,{lead:sq25(R.r.tint,CAR_SVG),title:R.vehDesc,sub:'Écrire au chauffeur',onClick:()=>{unread[R.driver]=0;phThread(R.driver);}});
    if(!R.onboard&&R.phase!=='riding')row25(g,{title:'Annuler la course',sub:R.phase==='waiting'&&R.wait>30?'Frais d’attente '+fmt(3):'Gratuit',onClick:()=>{cancelRide();phOpen(phApp);}});
    return;}
  const why=rideBlock();
  const tabs=mk('div','seg26');RIDES.forEach(r=>{const x=mk('button',r===sel?'on':'',r.emo+' '+r.short,()=>{b._r26=r.id;b.innerHTML='';b.appendChild(mk('h1','ph-lt',phApp?phApp[0]:'Taxi'));rideApp(b,def);});x.type='button';tabs.appendChild(x);});b.appendChild(tabs);
  b.appendChild(h25(`<div class="hero26" style="--c:${sel.tint}"><span>${sel.emo}</span><div><b>${esc(sel.name)}</b><em>${esc(sel.desc)}${sel.id==='danfo'&&rush()?' · heure de pointe':''}</em></div></div>`));
  if(why){b.appendChild(mk('p','dim',why));}
  b.appendChild(mk('div','sec','Où vas-tu ?'));
  const g=grp25(b);
  destList().slice(0,40).forEach(({s})=>{const q=quote(sel,s);if(!q)return;const ok=!why&&state.cash+state.bank>=q.price;
    const r=row25(g,{lead:sq25('#'+(s.color||0x888888).toString(16).padStart(6,'0'),SV.pin),title:s.label,sub:(q.L>999?(q.L/1000).toFixed(1)+' km':Math.round(q.L)+' m')+' · ~'+fmtSec(q.secs),right:fmt(q.price),onClick:()=>{if(orderRide(sel,s)){}}});if(!ok)r.disabled=true;});
  b.appendChild(mk('p','dim','Le chauffeur vient te chercher là où tu es. Tu paies à l’arrivée (cash, puis banque).'));
}
function foodApp(b){
  const Fd=T.food;
  b.appendChild(h25(`<div class="addr"><small>Livrer à</small><b>${player.inside?'Entrée de '+esc(nearestLabel(player.outside?player.outside.x:player.x,player.outside?player.outside.z:player.z)||'ton bâtiment'):'Ta position'}</b></div>`));
  if(Fd){const st=Fd.phase==='prep'?['Préparation',Math.max(0,Math.ceil(Fd.prep-Fd.t))+' s',15]:Fd.phase==='ride'?['En route · '+Fd.courier.split(' · ')[0],Math.round(Fd.left)+' m',55]:Fd.phase==='walk'?['Le livreur arrive à pied','presque là',85]:Fd.phase==='wait'?['Arrivé · t’attend devant '+Fd.where,fmtSec(170-Fd.t),100]:['Livrée','',100];
    b.appendChild(h25(`<div class="track"><span>Commande · ${esc(Fd.name)}</span><b>${esc(st[0])}</b><div class="pg"><i style="animation:none;width:${st[2]}%"></i></div><div class="steps"><span>Préparation</span><span>En route</span><span>Arrivé</span></div></div>`));
    const g=grp25(b);row25(g,{lead:av25(Fd.courier),title:Fd.courier.split(' · ')[0],sub:st[1]?st[1]+' · écrire au livreur':'Écrire au livreur',onClick:()=>{unread[Fd.courier]=0;phThread(Fd.courier);}});
    if(Fd.phase==='wait'||Fd.phase==='walk')row25(g,{lead:sq25('#007aff',SV.nav),title:'Itinéraire vers le livreur',sub:'Affiche la balise GPS',onClick:()=>{if(typeof wp!=='undefined'&&Fd.p)wp={x:Fd.p.x,z:Fd.p.z,l:'Ton livreur'};closePanel();}});
    if(Fd.phase==='prep')row25(g,{title:'Annuler la commande',sub:'Remboursée intégralement',onClick:()=>{state.cash+=Fd.price;T.food=null;toast('Commande annulée et remboursée.');phOpen(phApp);}});}
  b.appendChild(mk('div','sec','Restaurants à Port-Aurore'));
  const list=typeof FOOD25!=='undefined'?FOOD25:[['Tacos du Port','sand',35,'🌮','linear-gradient(135deg,#ffcf70,#ff8a3d)','4,7','10–15 min']];
  list.forEach(it=>{const [name,id,food,emo,bg,rate,eta]=it,pr=foodPrice(it);
    const c=h25(`<div class="resto"><div class="hero" style="background:${bg}">${emo}<span class="eta">${eta}</span></div><div class="bd"><div class="tx"><b>${name}</b><span>★ ${rate} · frais ${fmt(4)} inclus · +${food} faim</span></div></div></div>`);
    const x=mk('button',null,'Commander · '+fmt(pr),()=>orderFood(it));x.type='button';x.disabled=state.cash<pr||!!T.food;c.querySelector('.bd').appendChild(x);b.appendChild(c);});
  b.appendChild(mk('p','dim','Un livreur vient en scooter jusqu’à toi et t’envoie un message à son arrivée. Va le rejoindre pour récupérer ta commande (touche E).'));
}
function patchApps(){
  if(typeof RENDER25==='undefined')return;
  RENDER25['Taxi']={fn:b=>rideApp(b,'taxi')};
  RENDER25['Transports']={fn:b=>rideApp(b,'danfo')};
  RENDER25['Livraison']={fn:b=>foodApp(b)};
  patchMessages();
}
T.patchApps=patchApps;

/* ---------------- branchements sur le jeu ---------------- */
T.isBusy=()=>!!(T.ride&&T.ride.phase!=='coming'&&T.ride.phase!=='waiting')||T.busy.some(f=>f());
T.ride_onboard=()=>!!(T.ride&&(T.ride.phase==='riding'||T.ride.phase==='boarding'));
const _upl26=updatePlayer;updatePlayer=function(dt){
  const R=T.ride;
  if(R&&(R.phase==='riding'||R.phase==='boarding')){
    if(R.phase==='riding'){const c=R.c;player.x=c.x;player.z=c.z;player.h=c.h;player.moving=0;player.amp=0;
      if(R.r.seat!=='car'){const m=player.mesh,seat=R.r.seat==='moto'?V3(0,.6,-.74):V3(.05,.04,-.45);c.mesh.updateMatrixWorld(true);c.mesh.localToWorld(seat);m.position.copy(seat);m.rotation.order='YXZ';m.rotation.y=c.h;m.rotation.x=0;m.rotation.z=R.r.seat==='moto'?(R.lean||0):0;sitPose(m,'hold',R.r.seat==='moto');}}
    return;}
  for(const f of T.busy)if(f()){return;}
  _upl26(dt);
};
const _upr26=updatePrompt;updatePrompt=function(){
  _upr26();if(!started)return;let txt=null;
  if(panelOpen||chatOpen){}
  else if(T.ride_onboard())txt='';
  else{for(const f of T.prompts){const t=f();if(t!=null){txt=t;break;}}
    if(txt==null&&!player.car&&!player.inside){const R=T.ride;if(R&&R.phase==='waiting'&&Math.hypot(R.c.x-player.x,R.c.z-player.z)<4.2)txt='E · Monter · '+R.r.emo+' '+R.driver.split(' · ')[0];
      const Fd=T.food;if(txt==null&&Fd&&Fd.phase==='wait'&&Math.hypot(Fd.p.x-player.x,Fd.p.z-player.z)<2.8)txt='E · Récupérer ta commande · '+Fd.emo+' '+Fd.name;}}
  if(txt!=null&&txt!==promptKey){promptKey=txt;const b=$('#prompt');b.hidden=!txt;b.textContent=txt;}
};
const _int26=interact;interact=function(){
  if(!started||paused||panelOpen||chatOpen){_int26();return;}
  if(T.ride_onboard())return;
  for(const f of T.acts)if(f())return;
  if(!player.car&&!player.inside){const R=T.ride;if(R&&R.phase==='waiting'&&Math.hypot(R.c.x-player.x,R.c.z-player.z)<4.2){board();return;}
    const Fd=T.food;if(Fd&&Fd.phase==='wait'&&Math.hypot(Fd.p.x-player.x,Fd.p.z-player.z)<2.8){collectFood();return;}}
  _int26();
};
const _uc26=updateCamera;updateCamera=function(dt){
  _uc26(dt);if(!started)return;
  try{if(rideCam(dt))return;for(const f of T.cams)if(f(dt))return;
    if(T.lastYaw!=null){T.lastYaw=null;T.lastPitch=null;}
  }catch(e){if(!T.errc){T.errc=1;console.warn('v26 cam',e);}}
};
const _up26=update;update=function(dt){
  _up26(dt);if(!started)return;
  try{tickRide(dt);tickFood(dt);tickLeavers(dt);for(const f of T.ticks)f(dt);}catch(e){if(!T.err){T.err=1;console.warn('v26',e);}}
  hudT-=dt;if(hudT<=0){hudT=.2;if(T.ride)rideHudFill(false);else if(card&&!card.hidden)card.hidden=true;
    if(!$('#phone').hidden&&typeof phApp!=='undefined'&&phApp&&['Taxi','Transports','Livraison'].includes(phApp[0])&&(T.ride||T.food)){T.appT=(T.appT||0)+1;if(T.appT%5===0){const sel=document.querySelector('#ph-body .seg26 .on');phOpen(phApp);}}}
};
/* touche V : vue intérieure / extérieure pendant un trajet (prioritaire sur le zoom caméra) */
addEventListener('keydown',e=>{if(!started||chatOpen||paused)return;if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;
  const k=(e.key||'').toLowerCase();
  if(k==='v'&&(T.ride_onboard()||T.busy.some(f=>f()))){T.view=T.view==='int'?'ext':'int';saveView();T.look.y=0;T.look.p=0;e.stopImmediatePropagation();rideHudFill(true);if(T.onView)T.onView();}
},true);
/* réinitialisation */
if(typeof resetProgress==='function'){const _rs26=resetProgress;resetProgress=function(){if(T.ride){removeVehicle(T.ride.c);T.ride=null;}T.food=null;_rs26();};}
patchApps();
})();
