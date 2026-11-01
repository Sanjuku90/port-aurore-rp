'use strict';
/* ==========================================================================
   v28 · AMÉNAGEMENT DE L'APPARTEMENT
   Chaque meuble acheté peut être déplacé, tourné, rangé ou ressorti.
   La disposition est sauvegardée (localStorage) et réappliquée à chaque visite.
   Commandes : flèches = déplacer · R / Maj+R = tourner · Tab = meuble suivant
   ========================================================================== */
(function(){
const LS='port-aurore-meubles28';
let LAY={};try{LAY=JSON.parse(localStorage.getItem(LS)||'{}')||{};}catch(e){LAY={};}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(LAY));}catch(e){}};
const PIV={};          // id -> pivot (THREE.Group) dans R.G
const ED={on:false,sel:null,ring:null};
const BASE_N={rug:'Tapis et poufs',lamp:'Lampadaire',plant:'Plante',art:'Tableaux'};
const nameOf=id=>{const x=(typeof HOME_FURN!=='undefined'?HOME_FURN:[]).find(q=>q.id===id);return x?x.name:(BASE_N[id]||id);};
/* encapsule le(s) groupe(s) ajouté(s) pour un meuble dans un pivot centré */
function wrap(R,id,added){if(!added.length)return;R.G.updateMatrixWorld(true);const bb=new THREE.Box3();added.forEach(o=>bb.expandByObject(o));if(bb.isEmpty())return;
  const c=bb.getCenter(new THREE.Vector3());const lx=c.x-R.G.position.x,lz=c.z-R.G.position.z;
  const pv=new THREE.Group();pv.position.set(lx,0,lz);pv.userData.furn28=id;pv.userData.home={x:lx,z:lz};pv.userData.size={w:Math.max(.4,bb.max.x-bb.min.x),d:Math.max(.4,bb.max.z-bb.min.z)};
  R.G.add(pv);added.forEach(o=>{R.G.remove(o);o.position.x-=lx;o.position.z-=lz;pv.add(o);});PIV[id]=pv;apply(id);}
function apply(id){const pv=PIV[id],L=LAY[id];if(!pv)return;if(!L){pv.position.set(pv.userData.home.x,0,pv.userData.home.z);pv.rotation.y=0;pv.visible=true;return;}
  pv.position.set(L.x,0,L.z);pv.rotation.y=L.r||0;pv.visible=!L.st;}
const _add=addHomeFurnitureP58;addHomeFurnitureP58=function(R,id){if(!R||!R.G)return _add(R,id);const before=new Set(R.G.children);_add(R,id);if(PIV[id]&&PIV[id].parent===R.G)return;
  const added=R.G.children.filter(o=>!before.has(o));try{wrap(R,id,added);}catch(e){console.warn('v28 meuble',e);}};
/* ---------------- interface ---------------- */
let UI=null;
function build(){if(UI)return UI;const d=document.createElement('div');d.id='am28';d.hidden=true;
  d.innerHTML='<h3>Aménager</h3><small>Choisis un meuble, puis déplace-le. Flèches : déplacer · R : tourner · Tab : suivant.</small><div class="am-sel" id="am-sel">Aucun meuble sélectionné</div><div class="am-list" id="am-list"></div>'+
   '<div class="am-pad"><span></span><button data-a="f" title="Avancer">▲</button><span></span><button data-a="l" title="Gauche">◀</button><button data-a="here" title="Placer devant moi">⦿</button><button data-a="r" title="Droite">▶</button><button data-a="rl" title="Tourner à gauche">⟲</button><button data-a="b" title="Reculer">▼</button><button data-a="rr" title="Tourner à droite">⟳</button></div>'+
   '<div class="am-row"><button data-a="here">Placer devant moi</button><button data-a="store" id="am-store">Ranger</button></div><div class="am-row"><button data-a="reset">Position d’origine</button><button data-a="done" class="primary">Terminer</button></div>';
  $('#app').appendChild(d);d.addEventListener('pointerdown',e=>e.stopPropagation());
  d.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>act(b.dataset.a));
  const btn=document.createElement('button');btn.id='am28-btn';btn.className='card';btn.textContent='🛋 Aménager';btn.hidden=true;btn.style.cssText='display:block;margin-top:6px';btn.onclick=()=>ED.on?close():open();
  const r=$('#right');if(r)r.appendChild(btn);UI={d,list:d.querySelector('#am-list'),sel:d.querySelector('#am-sel'),store:d.querySelector('#am-store'),btn};return UI;}
function ids(){return Object.keys(PIV).filter(id=>PIV[id].parent);}
function renderList(){const L=ids();UI.list.innerHTML='';if(!L.length){UI.list.innerHTML='<small>Aucun meuble acheté pour l’instant. Ouvre le catalogue Mobilier sur ton téléphone.</small>';return;}
  L.forEach(id=>{const b=document.createElement('button');b.className=id===ED.sel?'on':'';const st=LAY[id]&&LAY[id].st;b.innerHTML='<span>'+nameOf(id).replace(/[<>&]/g,'')+'</span><em>'+(st?'rangé':'placé')+'</em>';b.onclick=()=>select(id);UI.list.appendChild(b);});}
function select(id){ED.sel=id;const pv=PIV[id];UI.sel.textContent=id?nameOf(id):'Aucun meuble sélectionné';UI.store.textContent=LAY[id]&&LAY[id].st?'Sortir du rangement':'Ranger';renderList();ring();}
function ring(){const R=ROOMS.home,pv=PIV[ED.sel];if(!R)return;if(!ED.ring){ED.ring=new THREE.Mesh(new THREE.RingGeometry(.9,1.05,40),new THREE.MeshBasicMaterial({color:0xffc15a,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide}));ED.ring.rotation.x=-Math.PI/2;ED.ring.renderOrder=5;}
  if(ED.ring.parent!==R.G)R.G.add(ED.ring);ED.ring.visible=!!(ED.on&&pv&&pv.visible);if(pv){const s=Math.max(pv.userData.size.w,pv.userData.size.d)*.62;ED.ring.scale.set(s,s,1);ED.ring.position.set(pv.position.x,.04,pv.position.z);}}
function cur(){const id=ED.sel,pv=PIV[id];if(!pv)return null;if(!LAY[id])LAY[id]={x:pv.position.x,z:pv.position.z,r:pv.rotation.y,st:0};return LAY[id];}
function clampL(L){const R=ROOMS.home;const b=R&&R.b?[R.b[0]-R.rx+.4,R.b[1]-R.rx-.4,R.b[2]-R.rz+.4,R.b[3]-R.rz-.4]:[-8.4,8.4,-6,6];L.x=clamp(L.x,b[0],b[1]);L.z=clamp(L.z,b[2],b[3]);}
function act(a){if(a==='done'){close();return;}const L=cur();if(!L){toast('Choisis d’abord un meuble dans la liste.','warn');return;}const id=ED.sel,step=keys.shift?.05:.25;
  const fx=Math.sin(camYaw),fz=Math.cos(camYaw),rx=Math.cos(camYaw),rz=-Math.sin(camYaw);
  if(a==='f'){L.x+=fx*step;L.z+=fz*step;}else if(a==='b'){L.x-=fx*step;L.z-=fz*step;}else if(a==='l'){L.x+=rx*step;L.z+=rz*step;}else if(a==='r'){L.x-=rx*step;L.z-=rz*step;}
  else if(a==='rl')L.r=(L.r||0)+Math.PI/12;else if(a==='rr')L.r=(L.r||0)-Math.PI/12;
  else if(a==='here'){const R=ROOMS.home,d=1.4;L.x=player.x-R.rx+Math.sin(player.h)*d;L.z=player.z-R.rz+Math.cos(player.h)*d;L.st=0;}
  else if(a==='store'){L.st=L.st?0:1;toast(L.st?nameOf(id)+' rangé au placard.':nameOf(id)+' ressorti.','');}
  else if(a==='reset'){delete LAY[id];apply(id);save();select(id);return;}
  clampL(L);apply(id);save();select(id);}
function open(){if(!player.inside||player.inside!==ROOMS.home){toast('L’aménagement se fait chez toi.','warn');return;}build();ED.on=true;UI.d.hidden=false;if(!ED.sel||!PIV[ED.sel])ED.sel=ids()[0]||null;select(ED.sel);toast('Mode aménagement : choisis un meuble, puis déplace-le.','good');}
function close(){ED.on=false;if(UI)UI.d.hidden=true;if(ED.ring)ED.ring.visible=false;}
window.AMENAGER28={open,close,ED,PIV,LAY};
addEventListener('keydown',e=>{if(!ED.on||chatOpen||!started)return;const k=(e.key||'').toLowerCase();let a=null;
  if(k==='arrowup')a='f';else if(k==='arrowdown')a='b';else if(k==='arrowleft')a='l';else if(k==='arrowright')a='r';else if(k==='r')a=e.shiftKey?'rr':'rl';
  else if(k==='tab'){const L=ids();if(L.length)select(L[(L.indexOf(ED.sel)+1)%L.length]);e.preventDefault();e.stopImmediatePropagation();return;}
  else if(k==='escape'){close();e.stopImmediatePropagation();return;}
  if(a){keys.shift=e.shiftKey;act(a);e.preventDefault();e.stopImmediatePropagation();}},true);
/* bouton visible uniquement à l'appartement ; ferme le mode en sortant */
const _upd=update;update=function(dt){_upd(dt);if(!started)return;const home=player.inside&&player.inside===ROOMS.home;build();UI.btn.hidden=!home;if(!home&&ED.on)close();if(ED.on)ring();};
/* point d'interaction dans l'appartement + appli téléphone */
const _bh=buildHome7;buildHome7=function(R){_bh(R);try{R.int(4.6,4.9,'Aménager l’appartement',()=>open());}catch(e){}};
if(typeof addPhoneAppP58==='function')addPhoneAppP58('Aménager','🛋️','#c79bff,#4a2c6d',b=>{b.innerHTML='';const p=document.createElement('p');p.className='dim';p.textContent='Déplace, tourne ou range tes meubles. Disponible quand tu es dans ton appartement.';b.appendChild(p);
  const x=document.createElement('button');x.className='pbtn hot';x.textContent=player.inside===ROOMS.home?'Ouvrir le mode aménagement':'Rentrer à l’appartement d’abord';x.disabled=player.inside!==ROOMS.home;x.onclick=()=>{closePanel();open();};b.appendChild(x);});
const _rs=resetProgress;resetProgress=function(){_rs();LAY={};save();Object.keys(PIV).forEach(apply);};
})();
