'use strict';
/* ---------- v15 : GPS avec itinéraire routier + carte aérienne 3D ---------- */
(function(){
const POI={bank:['🏦','Services'],home:['🏠','Maison'],job:['💼','Emploi'],hospital:['🏥','Services'],shop:['🛒','Commerces'],club:['🪩','Loisirs'],cafe:['☕','Commerces'],boutique:['🛍️','Commerces'],pharma:['💊','Commerces'],dealership:['🚗','Commerces'],fuel:['⛽','Services'],garage:['🔧','Services'],drivingschool:['🚦','Services'],comm13:['🚓','Services'],court13:['⚖️','Services'],gend13:['🛡️','Services'],prison13:['🔒','Services'],coiffeur:['💇','Commerces'],'hotel40:*':['🏨','Services'],'life41:*':['🐾','Loisirs'],'sol28hotel':['🏨','Services'],'hotel40:pax':['🏨','Services'],'air27:*':['✈️','Services'],'zone27:*':['📍','Loisirs'],'lag44:*':['📍','Loisirs']};
const ZONES=[['LES HAUTS',-10,-150],['CENTRE-VILLE',0,34],['QUARTIER DU PORT',0,170],['OCÉAN AURORE',0,238],['QUARTIER OUEST',-232,0],['QUARTIER EST',232,-20],['AÉROPORT INTERNATIONAL',-560,-40],['LES HAUTS-JARDINS',0,-470],['STADE AURORE',520,-150],['ZONE D’ACTIVITÉS',560,110]];
const FILTERS=['Tout','Emploi','Commerces','Services','Loisirs','Maison'];
const RC=roadC.slice().sort((a,b)=>a-b),LO=RC[0],HI=RC[RC.length-1];
/* ---- calcul d’itinéraire sur le réseau de rues (Dijkstra) ---- */
function snap(p){let b=null;RC.forEach(v=>{const z=clamp(p.z,LO,HI),d=Math.hypot(p.x-v,p.z-z);if(!b||d<b.d)b={x:v,z,d,ax:'x',v};const x=clamp(p.x,LO,HI),d2=Math.hypot(p.x-x,p.z-v);if(d2<b.d)b={x,z:v,d:d2,ax:'z',v};});return b;}
function findRoute(from,to){
  const a=snap(from),b=snap(to),N=new Map(),key=p=>p.x.toFixed(1)+','+p.z.toFixed(1);
  const node=p=>{const k=key(p);if(!N.has(k))N.set(k,{x:p.x,z:p.z,e:[]});return N.get(k);};
  const link=(p,q)=>{if(key(p)===key(q))return;const P=node(p),Q=node(q),w=Math.abs(p.x-q.x)+Math.abs(p.z-q.z);P.e.push([Q,w]);Q.e.push([P,w]);};
  for(const v of RC)for(let i=0;i<RC.length-1;i++){link({x:v,z:RC[i]},{x:v,z:RC[i+1]});link({x:RC[i],z:v},{x:RC[i+1],z:v});}
  const attach=s=>{const t=s.ax==='x'?s.z:s.x;let lo=LO,hi=HI;RC.forEach(r=>{if(r<=t)lo=r;});for(let i=RC.length-1;i>=0;i--)if(RC[i]>=t)hi=RC[i];
    node(s);(s.ax==='x'?[{x:s.v,z:lo},{x:s.v,z:hi}]:[{x:lo,z:s.v},{x:hi,z:s.v}]).forEach(q=>link(s,q));return lo+'|'+hi;};
  const sa=attach(a),sb=attach(b);if(a.ax===b.ax&&a.v===b.v&&sa===sb)link(a,b);
  const S=node(a),T=node(b),dist=new Map([[S,0]]),prev=new Map(),open=new Set([S]),done=new Set();
  while(open.size){let u=null,du=1e9;open.forEach(n=>{const d=dist.get(n);if(d<du){du=d;u=n;}});open.delete(u);done.add(u);if(u===T)break;
    u.e.forEach(([v,w])=>{if(done.has(v))return;const nd=du+w;if(nd<(dist.has(v)?dist.get(v):1e9)){dist.set(v,nd);prev.set(v,u);open.add(v);}});}
  const pts=[];let c=T;while(c){pts.unshift({x:c.x,z:c.z});c=prev.get(c);}
  pts.unshift({x:from.x,z:from.z});pts.push({x:to.x,z:to.z});
  const out=[];pts.forEach(p=>{const l=out[out.length-1];if(l&&Math.hypot(p.x-l.x,p.z-l.z)<.5)return;if(out.length>=2){const o=out[out.length-2];if(Math.abs((l.x-o.x)*(p.z-l.z)-(l.z-o.z)*(p.x-l.x))<.01){out[out.length-1]=p;return;}}out.push(p);});
  let len=0;for(let i=1;i<out.length;i++)len+=Math.hypot(out[i].x-out[i-1].x,out[i].z-out[i-1].z);
  return {pts:out,len};
}
function nextTurn(pts){let acc=0;for(let i=1;i<pts.length-1;i++){const a=pts[i-1],b=pts[i],c=pts[i+1],l1=Math.hypot(b.x-a.x,b.z-a.z);acc+=l1;if(i===1&&l1<8)continue;
  const d1x=(b.x-a.x)/l1,d1z=(b.z-a.z)/l1,l2=Math.hypot(c.x-b.x,c.z-b.z)||1,d2x=(c.x-b.x)/l2,d2z=(c.z-b.z)/l2,cr=d1x*d2z-d1z*d2x,dt=d1x*d2x+d1z*d2z;
  if(dt>.9)continue;return {d:acc,s:dt<-.5?'u':cr>0?'r':'l'};}
  let t=0;for(let i=1;i<pts.length;i++)t+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].z-pts[i-1].z);return {d:t,s:'f'};}
const R={list:[],t:0,main:null};
function targets(){const L=[];if(wp)L.push({id:'wp',p:wp,l:wp.l||'Repère',css:'#3fa9ff',hex:0x3fa9ff});
  if(mission){const t=mission.tgt||(mission.stage==='pickup'?mission.pickup:mission.drop);if(t)L.push({id:'ms',p:t,l:mission.ui?mission.ui[0]:'Mission',css:mission.stage==='pickup'?'#ffb84d':'#58d68d',hex:mission.stage==='pickup'?0xffb84d:0x58d68d});}return L;}
function refresh(){const from={x:player.x,z:player.z};R.list=targets().map(t=>Object.assign(t,findRoute(from,t.p)));R.main=R.list[0]||null;ribbons();gpsCard();}
/* ---- ruban d’itinéraire au sol (chevrons animés) ---- */
const tex=(()=>{const c=document.createElement('canvas');c.width=64;c.height=64;const g=c.getContext('2d');g.fillStyle='rgba(255,255,255,.55)';g.fillRect(0,0,64,64);g.strokeStyle='#fff';g.lineWidth=9;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(18,14);g.lineTo(42,32);g.lineTo(18,50);g.stroke();const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const RIB={};
function ribbon(r,w){const pos=[],uv=[],idx=[];let u=0,n=0;const y=.13;
  for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],l=Math.hypot(b.x-a.x,b.z-a.z);if(l<.01)continue;const nx=-(b.z-a.z)/l*w/2,nz=(b.x-a.x)/l*w/2,ex=(b.x-a.x)/l*w/2,ez=(b.z-a.z)/l*w/2,u2=u+l/(w*1.6);
    pos.push(a.x+nx-ex*(i>1?1:0),y,a.z+nz-ez*(i>1?1:0),a.x-nx-ex*(i>1?1:0),y,a.z-nz-ez*(i>1?1:0),b.x+nx,y,b.z+nz,b.x-nx,y,b.z-nz);uv.push(u,0,u,1,u2,0,u2,1);idx.push(n,n+2,n+1,n+1,n+2,n+3);n+=4;u=u2;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);
  const t=tex.clone();t.needsUpdate=true;const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:r.hex,map:t,transparent:true,opacity:.85,depthWrite:false,fog:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4}));m.renderOrder=3;m.frustumCulled=false;return m;}
function ribbons(){const w=M3.on?6:2.2,seen={};R.list.forEach(r=>{seen[r.id]=1;const k=w+'|'+r.hex+'|'+r.pts.map(p=>Math.round(p.x)+','+Math.round(p.z)).join(';');const o=RIB[r.id];if(o&&o.k===k)return;if(o){scene.remove(o.m);o.m.geometry.dispose();o.m.material.map.dispose();o.m.material.dispose();}const m=ribbon(r,w);scene.add(m);RIB[r.id]={m,k};});
  Object.keys(RIB).forEach(id=>{if(!seen[id]){const o=RIB[id];scene.remove(o.m);o.m.geometry.dispose();o.m.material.map.dispose();o.m.material.dispose();delete RIB[id];}});}
/* ---- carte GPS dans le HUD ---- */
let card=null;const ARW={l:'↰',r:'↱',u:'⤺',f:'↑'},TXT={l:'tourne à gauche',r:'tourne à droite',u:'fais demi-tour',f:'continue tout droit'};
const mDist=d=>d<1000?Math.round(d/5)*5+' m':(d/1000).toFixed(1).replace('.',',')+' km';
const eta=d=>{const v=player.car?13:4.2,s=Math.max(5,d/v);return s<60?Math.round(s)+' s':Math.round(s/60)+' min';};
function gpsCard(){if(!card){card=document.createElement('div');card.id='gps15';card.className='card';const mini=$('#mini');mini.parentNode.insertBefore(card,mini.nextSibling);}
  const r=R.main;if(!r||player.inside){card.hidden=true;return;}card.hidden=false;const t=nextTurn(r.pts);
  card.innerHTML='<i style="background:'+r.css+'">'+ARW[t.s]+'</i><div><b>'+(t.s==='f'?mDist(t.d):'Dans '+mDist(t.d))+'</b><span>'+(t.s==='f'?'Destination':TXT[t.s])+' · '+r.l+'</span><small>'+mDist(r.len)+' · ~'+eta(r.len)+'</small></div>';}
/* ---- tracé sur la mini-carte et la carte 2D ---- */
const _dpm=drawProMap;drawProMap=function(g,S,mini){_dpm(g,S,mini);if(!R.list.length)return;const k=mini?S/150:S/512,X=v=>mini?S/2+(v-player.x)*k:(v+256)*k,Y=v=>mini?S/2+(v-player.z)*k:(v+256)*k;
  g.save();g.lineJoin='round';g.lineCap='round';R.list.slice().reverse().forEach(r=>{[['rgba(6,14,22,.9)',mini?8:Math.max(6,S/80)],[r.css,mini?4.5:Math.max(3.5,S/140)]].forEach(([c,w])=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();r.pts.forEach((p,i)=>i?g.lineTo(X(p.x),Y(p.z)):g.moveTo(X(p.x),Y(p.z)));g.stroke();});});
  g.translate(X(player.x),Y(player.z));g.rotate(Math.PI-player.h);g.fillStyle='#ffd34e';g.strokeStyle='#111';g.lineWidth=2;g.beginPath();g.moveTo(0,-10);g.lineTo(7,7);g.lineTo(0,4);g.lineTo(-7,7);g.closePath();g.fill();g.stroke();g.restore();};
/* ---- carte aérienne 3D ---- */
const M3={on:false,cx:0,cz:0,h:230,f:'Tout',el:null,pins:[],zones:[],far:420,ptr:new Map(),moved:0,pinch:0};
function el(t,c,h){const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function setDest(x,z,l){wp={x,z,l};toast('Itinéraire vers '+l,'good');refresh();m3Card();}
function build(){const d=el('div');d.id='map3d';d.hidden=true;
  d.innerHTML='<div class="m3-top"><button class="m3-pill m3-city" id="m3-city">📍 <b>Port-Aurore</b></button><div class="m3-chips" id="m3-chips"></div><button class="m3-pill m3-ic" id="m3-2d" title="Plan 2D">2D</button><button class="m3-pill m3-ic" id="m3-x" title="Fermer">✕</button></div><div id="m3-layer"></div><div class="m3-side"><button class="m3-pill m3-ic" id="m3-zi">＋</button><button class="m3-pill m3-ic" id="m3-zo">－</button><button class="m3-pill m3-ic" id="m3-me" title="Me recentrer">◎</button></div><div class="m3-card" id="m3-card"></div>';
  $('#app').appendChild(d);M3.el=d;const layer=d.querySelector('#m3-layer');
  FILTERS.forEach(f=>{const b=el('button','m3-chip'+(f==='Tout'?' on':''),f);b.onclick=e=>{e.stopPropagation();M3.f=f;d.querySelectorAll('.m3-chip').forEach(x=>x.classList.toggle('on',x.textContent===f));};d.querySelector('#m3-chips').appendChild(b);});
  ZONES.forEach(([t,x,z])=>{const e=el('div','m3-zone',t);layer.appendChild(e);M3.zones.push({e,x,z});});
  const me=el('div','m3-pin m3-me','<span></span><em>Toi</em>');layer.appendChild(me);M3.me=me;
  const ms=el('div','m3-pin m3-ms','<span>🎯</span><em>Mission</em>');layer.appendChild(ms);M3.ms=ms;
  const wpE=el('div','m3-pin m3-wp','<span>📍</span><em>Repère</em>');layer.appendChild(wpE);M3.wpE=wpE;
  d.querySelector('#m3-x').onclick=e=>{e.stopPropagation();closePanel();};
  d.querySelector('#m3-2d').onclick=e=>{e.stopPropagation();m3Off();$('#bigmap').hidden=false;drawBigMap();};
  d.querySelector('#m3-zi').onclick=e=>{e.stopPropagation();M3.h=clamp(M3.h*.75,55,900);};
  d.querySelector('#m3-zo').onclick=e=>{e.stopPropagation();M3.h=clamp(M3.h*1.3,55,900);};
  d.querySelector('#m3-me').onclick=e=>{e.stopPropagation();M3.cx=player.x;M3.cz=player.z;};
  d.querySelector('#m3-city').onclick=e=>{e.stopPropagation();M3.cx=-120;M3.cz=-150;M3.h=760;};
  ['#m3-chips','.m3-side','#m3-card','.m3-top'].forEach(s=>d.querySelector(s).addEventListener('pointerdown',e=>e.stopPropagation()));
  d.addEventListener('pointerdown',e=>{d.setPointerCapture(e.pointerId);M3.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});M3.moved=0;if(M3.ptr.size===2){const [a,b]=[...M3.ptr.values()];M3.pinch=Math.hypot(a.x-b.x,a.y-b.y);}});
  d.addEventListener('pointermove',e=>{const p=M3.ptr.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
    if(M3.ptr.size>=2){const [a,b]=[...M3.ptr.values()],dd=Math.hypot(a.x-b.x,a.y-b.y);if(M3.pinch)M3.h=clamp(M3.h*M3.pinch/dd,55,900);M3.pinch=dd;M3.moved=99;return;}
    M3.moved+=Math.abs(dx)+Math.abs(dy);const k=2*M3.h*Math.tan(camera.fov*Math.PI/360)/Math.max(200,d.clientHeight)*1.1;M3.cx=clamp(M3.cx-dx*k,-1000,760);M3.cz=clamp(M3.cz-dy*k*1.35,-760,240);});
  const up=e=>{const was=M3.ptr.size===1&&M3.moved<8;M3.ptr.delete(e.pointerId);if(M3.ptr.size<2)M3.pinch=0;if(!was)return;
    const r=renderer.domElement.getBoundingClientRect(),v=new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),rc=new THREE.Raycaster();rc.setFromCamera(v,camera);const o=rc.ray.origin,dr=rc.ray.direction;if(dr.y>=0)return;const t=-o.y/dr.y;
    setDest(clamp(o.x+dr.x*t,-1000,760),clamp(o.z+dr.z*t,-760,205),'Repère');};
  d.addEventListener('pointerup',up);d.addEventListener('pointercancel',e=>{M3.ptr.delete(e.pointerId);});
  d.addEventListener('wheel',e=>{e.preventDefault();M3.h=clamp(M3.h*(1+e.deltaY*.0012),55,900);},{passive:false});
}
function buildPins(){const layer=M3.el.querySelector('#m3-layer');M3.pins.forEach(p=>p.e.remove());M3.pins=[];
  spots.filter(s=>(POI[s.id]||POI[String(s.id).split(':')[0]+':*'])&&s.x>=-1010&&s.x<=770&&s.z>=-770&&s.z<=262).map(s=>{if(!POI[s.id])POI[s.id]=POI[String(s.id).split(':')[0]+':*'];return s;}).forEach(s=>{const P=POI[s.id],e=el('button','m3-pin','<span>'+P[0]+'</span><em>'+s.label+'</em>');e.onpointerdown=ev=>ev.stopPropagation();e.onclick=ev=>{ev.stopPropagation();setDest(s.x,s.z,s.label);};layer.insertBefore(e,M3.me);M3.pins.push({e,x:s.x,z:s.z,y:5,cat:s.category||P[1]});});}
function m3Card(){if(!M3.el)return;const c=M3.el.querySelector('#m3-card'),r=R.main;
  if(r){c.innerHTML='<div class="m3-route"><i style="background:'+r.css+'">🧭</i><div><b>'+r.l+'</b><span>'+mDist(r.len)+' · ~'+eta(r.len)+(player.car?' en voiture':' à pied')+'</span></div></div>';
    const go=el('button','m3-go','Démarrer');go.onclick=()=>closePanel();c.appendChild(go);if(wp){const x=el('button','m3-clear','Effacer');x.onclick=()=>{wp=null;refresh();m3Card();};c.appendChild(x);}return;}
  c.innerHTML='<p>Touche une icône ou un point de la carte pour tracer ton itinéraire.</p>';const row=el('div','m3-quick');
  spots.slice().sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z)).slice(0,4).forEach(s=>{const b=el('button',null,(POI[s.id]||['📍'])[0]+' '+s.label);b.onclick=()=>setDest(s.x,s.z,s.label);row.appendChild(b);});c.appendChild(row);}
const V=new THREE.Vector3();
function place(e,x,y,z,show){if(!show){e.style.display='none';return;}V.set(x,y,z).project(camera);if(V.z>1||Math.abs(V.x)>1.15||Math.abs(V.y)>1.15){e.style.display='none';return;}
  const r=renderer.domElement.getBoundingClientRect(),a=M3.el.getBoundingClientRect();e.style.display='';e.style.transform='translate('+((V.x+1)/2*r.width+r.left-a.left)+'px,'+((1-V.y)/2*r.height+r.top-a.top)+'px)';}
function pins(){const lbl=M3.h<210;M3.el.classList.toggle('m3-far',!lbl);
  M3.pins.forEach(p=>place(p.e,p.x,p.y,p.z,M3.f==='Tout'||M3.f===p.cat));M3.zones.forEach(z=>place(z.e,z.x,0,z.z,true));
  place(M3.me,player.x,3,player.z,true);M3.me.querySelector('span').style.background='#'+(look&&look.s!=null?look.s:0x3d7be0).toString(16).padStart(6,'0');
  const mt=R.list.find(r=>r.id==='ms');place(M3.ms,mt?mt.p.x:0,4,mt?mt.p.z:0,!!mt);place(M3.wpE,wp?wp.x:0,4,wp?wp.z:0,!!wp&&!M3.pins.some(p=>p.x===wp.x&&p.z===wp.z));}
function m3On(){if(!M3.el)build();buildPins();M3.on=true;panelOpen=true;for(const k in keys)keys[k]=false;M3.cx=player.x;M3.cz=player.z;M3.h=175;M3.far=camera.far;camera.far=2600;camera.updateProjectionMatrix();
  M3.el.hidden=false;const h=$('#hud');if(h)h.style.visibility='hidden';refresh();m3Card();}
function m3Off(){if(!M3.on)return;M3.on=false;if(M3.el)M3.el.hidden=true;camera.far=M3.far;camera.updateProjectionMatrix();const h=$('#hud');if(h)h.style.visibility='';refresh();}
window.M3=M3;window.m3On=m3On;window.m3Off=m3Off;window.M3refresh=refresh;
const _cp=closePanel;closePanel=function(){m3Off();_cp();};
openBigMap=function(){if(M3.on||!$('#bigmap').hidden){closePanel();return;}if(!started||paused||panelOpen||chatOpen)return;if(player.inside){toast('Sors du bâtiment pour ouvrir la carte.','warn');return;}m3On();};
// retour 3D depuis le plan 2D
const _dbm=drawBigMap;drawBigMap=function(){_dbm();const hd=document.querySelector('#bigmap .bm-head span');if(hd&&!hd.querySelector('#bm-3d')){const b=el('button',null,'Vue 3D');b.id='bm-3d';b.onclick=()=>{$('#bigmap').hidden=true;panelOpen=false;m3On();};hd.insertBefore(b,hd.firstChild);}};
const _uc=updateCamera;updateCamera=function(dt){_uc(dt);if(!M3.on)return;const H=M3.h;camera.position.set(M3.cx,H,M3.cz+H*.62);camera.lookAt(M3.cx,0,M3.cz);camera.updateMatrixWorld(true);
  if(scene.fog){scene.fog.near=3000;scene.fog.far=6000;}if(hemi)hemi.intensity=Math.max(hemi.intensity,.85);pins();};
const _up=update;update=function(dt){_up(dt);if(!started)return;R.t-=dt;if(R.t<=0){R.t=.4;refresh();if(M3.on)m3Card();}
  Object.values(RIB).forEach(o=>{o.m.material.map.offset.x-=dt*(M3.on?.4:1.1);o.m.visible=!player.inside;});};
})();
