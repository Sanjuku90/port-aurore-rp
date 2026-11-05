'use strict';
/* v52 · Aviation pilotable : Aéro-club Aurore (PAX et Solenne), brevet de pilote, licence pro,
   vol libre 3D piloté (gaz, tangage, roulis, décrochage, atterrissage noté), anneaux de parcours,
   missions (baptêmes, charters vers Solenne, liaison Nouvelle-Aurore, voltige) et flotte d'avions. */
(function(){
if(!window.C52)return;
const K='pa-aero52';C51.resetKey(K);
const X=SOL27.x;
const PLANES={
  cub:{n:'Aurore Cub',d:'Monomoteur école · 2 places',price:60000,rent:150,vmax:62,vmin:22,climb:.55,seats:2,pay:1,scale:.3,liv:'aurore'},
  twin:{n:'Lagune Twin',d:'Bimoteur régional · 6 places',price:240000,vmax:86,vmin:27,climb:.5,seats:6,pay:1.8,scale:.4,liv:'atlantic'},
  jet:{n:'Sovereign Jet',d:'Jet d’affaires · 10 places',price:1800000,vmax:135,vmin:36,climb:.46,seats:10,pay:3.2,scale:.52,liv:'sahel'}
};
const AP={
  pax:{n:'Port-Aurore International',start:{x:-760,z:78,h:Math.PI},rw:{x0:-778,x1:-742,z0:-730,z1:118}},
  sol:{n:'Aéroport de Solenne',start:{x:X-246,z:-300,h:Math.PI/2},rw:{x0:X-275,x1:X+470,z0:-318,z1:-282}}
};
const blank=()=>({lic:0,pro:false,own:{},sel:'cub',flights:0,landings:0,kiss:0,crashes:0,km:0,best:{},theory:0});
let S=C51.load(K,blank);if(!S.own||typeof S.own!=='object')S.own={};S.best=S.best||{};
const save=()=>C51.store(K,S);
/* ---------------- missions ---------------- */
const NA=-2150;
const MIS={
  lecon:{n:'Vol d’instruction · tour de piste',from:'pax',to:'pax',pay:0,xp:60,rings:[[-760,45,-860],[-640,110,-1180],[-430,130,-900],[-440,110,-200],[-620,80,330],[-760,40,430]],brief:'Décolle vers le sud, passe les 6 anneaux puis pose-toi sur la piste de PAX. Ton instructeur note l’atterrissage.'},
  bapteme:{n:'Baptême de l’air · survol de Port-Aurore',from:'pax',to:'pax',pay:420,xp:45,pax:true,rings:[[-760,60,-880],[-380,170,-600],[40,180,-260],[220,180,160],[-180,170,420],[-600,90,420],[-760,40,440]],brief:'Tes passagers veulent voir la baie et le centre-ville. Vol souple : chaque secousse fait baisser le pourboire.'},
  liaison:{n:'Liaison Nouvelle-Aurore',from:'pax',to:'pax',pay:1100,xp:70,pax:true,rings:[[-900,140,-900],[-1500,220,-600],[NA,240,-200],[NA,240,250],[-1500,200,520],[-900,90,500],[-760,40,450]],brief:'Survole la capitale fédérale pour une délégation, puis reviens te poser à PAX.'},
  charter:{n:'Charter vers Solenne',from:'pax',to:'sol',pay:1600,xp:90,pax:true,rings:[[-760,90,-950],[-1800,300,-800],[-4600,340,-520],[X+1300,120,-300],[X+600,30,-300]],brief:'Vol de 7 km au-dessus de l’océan. Aligne-toi dans l’axe de la piste de Solenne et pose-toi en douceur.'},
  retour:{n:'Charter vers Port-Aurore',from:'sol',to:'pax',pay:1600,xp:90,pax:true,rings:[[X+300,90,-300],[X+1600,300,-420],[-4200,340,-1300],[-1500,260,-1700],[-760,110,-1350],[-760,35,-860]],brief:'Retour vers PAX : approche par le sud, plein axe de la piste.'},
  lagon:{n:'Tour du lagon de Solenne',from:'sol',to:'sol',pay:520,xp:45,pax:true,rings:[[X+300,70,-300],[X+600,120,40],[X+150,110,420],[X-400,110,260],[X-600,90,-120],[X+700,60,-300],[X+520,25,-300]],brief:'Survol touristique du lagon, des plages et du phare.'},
  voltige:{n:'Voltige chronométrée',from:'pax',to:'pax',pay:300,xp:70,timed:true,rings:[[-760,30,-820],[-700,22,-1050],[-560,55,-1230],[-420,28,-1060],[-460,70,-760],[-600,26,-560],[-700,60,-300],[-760,28,-600]],brief:'Enchaîne les anneaux bas le plus vite possible. Le chrono s’arrête au dernier anneau, puis pose-toi.'},
  libre:{n:'Vol libre',from:'pax',to:null,pay:0,xp:15,rings:[],brief:'Aucun objectif : vole où tu veux et pose-toi à PAX ou à Solenne.'}
};
const MIS_SOL={libre:{n:'Vol libre',from:'sol',to:null,pay:0,xp:15,rings:[],brief:'Vole librement au-dessus de Solenne.'}};
/* ---------------- état de vol ---------------- */
const F={on:false};let G0={};const MESH={};let HUD=null,ringMeshes=[];
const k=n=>!!(typeof keys!=='undefined'&&keys[n]);
function planeMesh(id){if(MESH[id])return MESH[id];const m=PLANES[id];const g=makePlane27({livery:m.liv});g.scale.setScalar(m.scale);g.visible=false;scene.add(g);MESH[id]=g;return g;}
function onRunway(x,z){for(const id in AP){const r=AP[id].rw;if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)return id;}return null;}
function nearestAirport(x,z){let best='pax',bd=1e9;for(const id in AP){const s=AP[id].start,d=Math.hypot(x-s.x,z-s.z);if(d<bd){bd=d;best=id;}}return best;}
function buildRings(list){clearRings();const geo=new THREE.TorusGeometry(13,.9,8,36);list.forEach((r,i)=>{const nx=list[i+1]||list[i-1]||r;let h=Math.atan2(nx[0]-r[0],nx[2]-r[2]);if(!list[i+1])h=Math.atan2(r[0]-nx[0],r[2]-nx[2]);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffd23f,transparent:true,opacity:.35,depthWrite:false}));m.position.set(r[0],r[1],r[2]);m.rotation.y=h;scene.add(m);ringMeshes.push(m);});}
function clearRings(){ringMeshes.forEach(m=>{scene.remove(m);m.material.dispose();});if(ringMeshes[0])ringMeshes[0].geometry.dispose();ringMeshes=[];}
function hud(){if(HUD)return HUD;const d=document.createElement('div');d.id='aero52';d.hidden=true;
  d.innerHTML='<div class="a52-top"><b class="a52-mis"></b><span class="a52-obj"></span></div>'+
  '<div class="a52-gauges"><div><small>VITESSE</small><b class="a52-spd">0</b><i>km/h</i></div><div><small>ALTITUDE</small><b class="a52-alt">0</b><i>m</i></div><div><small>VARIO</small><b class="a52-vs">0</b><i>m/s</i></div><div class="a52-thr"><small>GAZ</small><u><em></em></u></div></div>'+
  '<div class="a52-warn" hidden>DÉCROCHAGE · REMETS DES GAZ</div>'+
  '<div class="a52-pad"><button type="button" data-a="dn" aria-label="Réduire les gaz">GAZ −</button><button type="button" data-a="up" aria-label="Mettre les gaz">GAZ +</button><button type="button" data-a="brk">FREIN</button><button type="button" data-a="view">VUE</button><button type="button" data-a="quit" class="q">QUITTER</button></div>'+
  '<p class="a52-help">Z/↑ monter · S/↓ descendre · Q/D virer · R/F gaz · B frein · V vue · tactile : joystick + boutons</p>';
  (document.getElementById('app')||document.body).appendChild(d);
  const hold=(a,v)=>{F['btn_'+a]=v;};
  d.querySelectorAll('button').forEach(b=>{const a=b.dataset.a;
    b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(a==='up'||a==='dn'||a==='brk')hold(a,true);else if(a==='view')F.view=F.view==='chase'?'nose':'chase';else if(a==='quit')quit();});
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>hold(a,false)));});
  HUD={d,mis:d.querySelector('.a52-mis'),obj:d.querySelector('.a52-obj'),spd:d.querySelector('.a52-spd'),alt:d.querySelector('.a52-alt'),vs:d.querySelector('.a52-vs'),thr:d.querySelector('.a52-thr em'),warn:d.querySelector('.a52-warn')};return HUD;}
addEventListener('keydown',e=>{if(!F.on)return;const q=e.key.toLowerCase();if(q==='v'){F.view=F.view==='chase'?'nose':'chase';e.stopImmediatePropagation();}if(q==='escape'){e.stopImmediatePropagation();quit();}},true);
const fade=(on,cb)=>{if(window.fade27)fade27(on,cb);else if(cb)setTimeout(cb,30);};
/* ---------------- démarrage ---------------- */
function canFly(m,mis){
  if(F.on)return false;
  if(player.car){toast('Gare d’abord ta voiture : l’Aéro-club est à pied.','warn');return false;}
  if(window.FL27&&FL27.on)return false;
  if(mis!=='lecon'&&S.lic<3){toast('Il te faut le brevet de pilote (Aéro-club).','warn');return false;}
  if(MIS[mis]&&MIS[mis].pax&&!S.pro&&(mis==='charter'||mis==='retour'||mis==='liaison')){toast('Licence pro requise pour les vols commerciaux longs.','warn');return false;}
  return true;}
function start(misId,from){
  const M=(from==='sol'&&MIS_SOL[misId])||MIS[misId];if(!M)return;
  const model=S.own[S.sel]?S.sel:'cub';const P=PLANES[model];
  if(!canFly(model,misId))return;
  if(!S.own[model]&&model==='cub'&&misId!=='lecon'){if(!C51.pay(P.rent,'Location · '+P.n))return;}
  closePanel();
  fade(true,()=>{try{
    const a=AP[M.from].start;
    Object.assign(F,{on:true,mis:misId,M,model,P,x:a.x,y:0,z:a.z,h:a.h,pitch:0,roll:0,v:0,vy:0,th:0,air:false,ring:0,t:0,bumps:0,touchVy:null,view:'chase',done:false,ringsOk:0,startMin:gameMin,dist:0,cam:null,timer:null});
    G0={far:camera.far,fov:camera.fov,near:scene.fog?scene.fog.near:null,ffar:scene.fog?scene.fog.far:null};
    camera.far=6500;camera.updateProjectionMatrix();if(scene.fog){scene.fog.near=350;scene.fog.far=3200;}
    F.g=planeMesh(model);F.g.visible=true;if(player.mesh)player.mesh.visible=false;
    buildRings(M.rings);hud().d.hidden=false;HUD.mis.textContent=M.n;
    if(mission){try{mission=null;if(beam)beam.visible=false;}catch(e){}}
    place();camFollow(1,true);
    fade(false);
    C51.notify('✈️ '+M.n,M.brief);
  }catch(e){console.warn('aero52 start',e);abort();}});}
function place(){const g=F.g;g.position.set(F.x,F.y,F.z);g.rotation.order='YXZ';g.rotation.set(-F.pitch,F.h,F.roll);
  const gear=g.userData&&g.userData.gear;if(gear){const down=F.y<70;gear.visible=down;gear.scale.y=down?1:.02;}
  try{if(typeof tickPlaneLights27==='function')tickPlaneLights27(g,performance.now()*.001,true);}catch(e){}}
/* ---------------- physique arcade ---------------- */
function step(dt){
  const P=F.P,ground=F.y<=.02;F.t+=dt;
  let ip=(k('z')||k('w')||k('arrowup')?1:0)-(k('s')||k('arrowdown')?1:0),ir=(k('d')||k('arrowright')?1:0)-(k('q')||k('a')||k('arrowleft')?1:0);
  if(typeof joy!=='undefined'&&joy&&(Math.abs(joy.x)>.08||Math.abs(joy.y)>.08)){ip=clamp(-joy.y*1.25,-1,1);ir=clamp(joy.x*1.25,-1,1);}
  const thU=k('r')||F.btn_up,thD=k('f')||F.btn_dn;F.th=clamp(F.th+((thU?1:0)-(thD?1:0))*dt*.55,0,1);
  const brake=k('b')||F.btn_brk;
  const vT=F.th*P.vmax;let acc=(vT-F.v)*(vT>F.v?.32:.12)-9.8*Math.sin(F.pitch)*.75;
  if(ground){acc-=F.v*.015;if(brake)acc-=10;}
  F.v=Math.max(0,F.v+acc*dt);
  if(ground){
    F.roll+=(0-F.roll)*Math.min(1,6*dt);
    F.h-=ir*dt*(F.v<20?.7:.28)*Math.min(1,F.v/4);
    const want=ip>0&&F.v>P.vmin*.92?.2:0;F.pitch+=(want-F.pitch)*Math.min(1,2.4*dt);
  }else{
    F.roll+=(ir*.85-F.roll)*Math.min(1,2.2*dt);
    F.pitch=clamp(F.pitch+ip*P.climb*dt*1.25,-.62,.52);if(!ip)F.pitch*=1-.22*dt;
    F.h-=Math.tan(F.roll)*9.8/Math.max(F.v,14)*dt*1.05;
    if(Math.abs(F.roll)>.05&&Math.abs(ir)<.1)F.roll*=1-.6*dt;
    if(F.M.pax&&(Math.abs(F.roll)>.75||Math.abs(ip)>.9&&Math.abs(F.pitch)>.42))F.bumps+=dt;
  }
  const stall=F.v<P.vmin;F.stall=!ground&&stall;
  if(F.stall)F.pitch+=(-.32-F.pitch)*Math.min(1,1.1*dt);
  let vy=F.v*Math.sin(F.pitch);if(F.stall)vy-=(P.vmin-F.v)*.85;
  if(ground&&(F.v<P.vmin*.92||vy<0))vy=Math.max(0,ground&&F.v>=P.vmin*.92?vy:0);
  const hv=Math.cos(F.pitch)*F.v;const ox=F.x,oz=F.z;
  F.x+=Math.sin(F.h)*hv*dt;F.z+=Math.cos(F.h)*hv*dt;F.y=Math.min(1300,F.y+vy*dt);F.vy=vy;F.dist+=Math.hypot(F.x-ox,F.z-oz);
  if(F.y>3)F.air=true;
  /* contact avec le sol */
  if(F.y<=0){
    if(!ground){const rw=onRunway(F.x,F.z);F.touchVy=vy;
      const hard=vy<-7.5||Math.abs(F.roll)>.45;
      if(!rw&&F.v>12)return crash('Atterrissage hors piste');
      if(hard)return crash('Atterrissage trop violent');
      if(vy<-4.5){F.bumps+=1.5;toast('Atterrissage dur…','warn');if(window.CAMX)CAMX.shake=.5;}else if(vy>-1.6&&F.air)toast('Kiss landing ✨','good');}
    F.y=0;if(F.pitch<0)F.pitch=0;
  }
  /* collisions avec les grands bâtiments à basse altitude */
  if(F.y>.5&&F.y<16&&typeof boxes!=='undefined'){for(let i=0;i<boxes.length;i++){const b=boxes[i];if(b.big&&F.x>b.x0&&F.x<b.x1&&F.z>b.z0&&F.z<b.z1&&!onRunway(F.x,F.z))return crash('Collision avec un bâtiment');}}
  /* anneaux */
  const R=F.M.rings;if(F.ring<R.length){const r=R[F.ring],d=Math.hypot(F.x-r[0],F.y-r[1],F.z-r[2]);
    if(d<15){F.ring++;F.ringsOk++;if(F.M.timed&&F.ring===1)F.timer=0;try{MG29&&MG29._util&&MG29._util.sfx.ok();}catch(e){}if(F.ring>=R.length&&F.M.timed){F.final=F.timer;toast('Chrono : '+F.timer.toFixed(1)+' s · pose-toi maintenant','good');}}
    else if(F.M.timed&&F.ring>0){const nx=R[F.ring];/* anneau manqué : on autorise de continuer */}}
  if(F.timer!=null&&F.final==null)F.timer+=dt;
  /* fin : posé et arrêté */
  if(F.air&&F.y===0&&F.v<3.5){const rw=onRunway(F.x,F.z);if(rw)return land(rw);}
}
/* ---------------- caméra et interface ---------------- */
const V=()=>new THREE.Vector3();const cpos=V(),clook=V(),tmp=V();
function camFollow(dt,snap){
  const s=F.P.scale/.3,fx=Math.sin(F.h)*Math.cos(F.pitch),fz=Math.cos(F.h)*Math.cos(F.pitch),fy=Math.sin(F.pitch);
  let px,py,pz,lx,ly,lz;
  if(F.view==='nose'){px=F.x+fx*7*s;py=F.y+2.4*s+fy*7*s;pz=F.z+fz*7*s;lx=F.x+fx*80;ly=F.y+2*s+fy*80;lz=F.z+fz*80;}
  else{const d=(16+F.v*.08)*s;px=F.x-Math.sin(F.h)*d;py=F.y+5.2*s+Math.max(0,-fy)*4;pz=F.z-Math.cos(F.h)*d;lx=F.x+fx*14;ly=F.y+1.5*s+fy*10;lz=F.z+fz*14;}
  py=Math.max(py,1.2);
  const kk=snap?1:Math.min(1,(F.view==='nose'?18:4.5)*dt);
  cpos.lerp(tmp.set(px,py,pz),snap?1:kk);if(snap)cpos.set(px,py,pz);clook.set(lx,ly,lz);
  camera.position.copy(cpos);
  if(F.view==='nose'){const rx=-Math.cos(F.h),rz=Math.sin(F.h);camera.up.set(rx*Math.sin(F.roll),Math.cos(F.roll),rz*Math.sin(F.roll));}else camera.up.set(0,1,0);
  camera.lookAt(clook);
  const fov=F.view==='nose'?62:58+Math.min(10,F.v*.06);if(Math.abs(camera.fov-fov)>.2){camera.fov+=(fov-camera.fov)*Math.min(1,2*dt);camera.updateProjectionMatrix();}}
function paint(){if(!HUD)return;HUD.spd.textContent=Math.round(F.v*3.6);HUD.alt.textContent=Math.round(F.y);HUD.vs.textContent=(F.vy>=0?'+':'')+F.vy.toFixed(1);HUD.thr.style.width=Math.round(F.th*100)+'%';HUD.warn.hidden=!F.stall;
  const R=F.M.rings;let obj;
  if(F.ring<R.length){const r=R[F.ring];obj='Anneau '+(F.ring+1)+'/'+R.length+' · '+Math.round(Math.hypot(F.x-r[0],F.z-r[2]))+' m · alt. '+r[1]+' m';}
  else if(F.M.to){const s=AP[F.M.to].start;obj='Atterris à '+AP[F.M.to].n+' · '+Math.round(Math.hypot(F.x-s.x,F.z-s.z))+' m';}
  else obj='Vol libre · pose-toi sur une piste';
  if(F.timer!=null)obj+=' · ⏱ '+(F.final!=null?F.final:F.timer).toFixed(1)+' s';
  if(!F.air&&F.y===0)obj=(F.th<.6?'Mets les gaz (R / GAZ +), ':'')+'tire sur le manche à '+Math.round(F.P.vmin*3.3)+' km/h · '+obj;
  HUD.obj.textContent=obj;
  ringMeshes.forEach((m,i)=>{m.material.opacity=i===F.ring?.9:i>F.ring?.28:.06;m.material.color.setHex(i===F.ring?0xffd23f:0x7fd3ff);});}
/* ---------------- fins de vol ---------------- */
function teardown(ap){
  F.on=false;clearRings();if(F.g)F.g.visible=false;if(HUD)HUD.d.hidden=true;['up','dn','brk'].forEach(a=>F['btn_'+a]=false);
  camera.far=G0.far||420;camera.fov=G0.fov||60;camera.up.set(0,1,0);camera.updateProjectionMatrix();if(scene.fog&&G0.near!=null){scene.fog.near=G0.near;scene.fog.far=G0.ffar;}
  const T=window.W27&&W27.terms&&W27.terms[ap];const arr=T&&T.spot&&T.spot.arr;
  if(arr){player.x=arr.x;player.z=arr.z;player.h=T.spot.arrH||0;}else{const s=AP[ap].start;player.x=s.x+40;player.z=s.z;}
  camYaw=player.h;camPitch=.38;if(window.CAMX)CAMX.tgt=null;if(player.mesh){player.mesh.visible=true;player.mesh.position.set(player.x,0,player.z);}
  S.km+=Math.round(F.dist/1000*10)/10;gameMin+=Math.max(0,Math.round(F.t/60*6));save();saveProgress();}
function land(ap){if(F.done)return;F.done=true;const M=F.M,P=F.P,vy=F.touchVy==null?-3:F.touchVy;
  const okDest=!M.to||M.to===ap,allRings=F.ring>=M.rings.length;
  const q=vy>-1.6?1.3:vy>-3?1.1:vy>-4.5?.95:.7;const comfort=Math.max(.5,1-F.bumps*.04);
  let pay=0,lines=[];S.flights++;S.landings++;if(vy>-1.6)S.kiss++;
  if(M===MIS.lecon||F.mis==='lecon'){if(allRings&&okDest&&vy>-4.5){S.lic=3;lines.push('Brevet de pilote privé obtenu ! Les vols et l’achat d’avions sont débloqués.');C52.title('Pilote breveté');}else lines.push('Examen non validé : '+(!allRings?'anneaux manqués':'atterrissage trop dur')+'. Réessaie quand tu veux.');}
  else if(allRings&&okDest){pay=Math.round(M.pay*P.pay*q*comfort*(S.pro?1.25:1));if(M.pax)pay+=Math.round(P.seats*35*comfort);
    if(M.timed&&F.final!=null){const best=S.best[F.mis];if(best==null||F.final<best){S.best[F.mis]=F.final;lines.push('Nouveau record : '+F.final.toFixed(1)+' s');}if(F.final<75)C52.trophy('aero-voltige','Coupe de voltige Aurore','🛩️','sport',4000);}
    lines.push('Mission réussie · atterrissage '+(vy>-1.6?'parfait':vy>-3?'souple':vy>-4.5?'correct':'dur')+(M.pax?' · confort passagers '+Math.round(comfort*100)+' %':''));}
  else if(M.rings.length)lines.push(okDest?'Parcours incomplet : '+F.ringsOk+'/'+M.rings.length+' anneaux.':'Mauvaise destination.');
  else lines.push('Atterrissage à '+AP[ap].n+'.');
  if(S.flights>=10&&S.lic>=3&&!S.pro){S.pro=true;lines.push('Licence pro débloquée (10 vols) : vols commerciaux et primes +25 %.');C52.title('Pilote professionnel');}
  if(S.flights>=40)C52.trophy('aero-40','Ailes d’or · 40 vols','🪽','sport',6000);
  save();
  fade(true,()=>{teardown(ap);if(pay)C51.earn(pay,'Vol · '+M.n,true);C52.xp('ciel',M.xp*(allRings?1:.4));C52.stat('vols',1);fade(false);
    setTimeout(()=>C52.panel('🛬 '+AP[ap].n,lines.join(' ')+(pay?' Paiement : '+fmt(pay)+' sur ton compte.':''),[{label:'Retour à l’Aéro-club',fn:()=>club(ap)}]),500);});}
function crash(why){if(F.done)return;F.done=true;S.crashes++;save();if(window.CAMX)CAMX.shake=.9;
  const ap=nearestAirport(F.x,F.z),bill=Math.min(2500,Math.round(400+F.P.price*.004));
  fade(true,()=>{teardown(ap);state.health=Math.max(15,(state.health||100)-35);if(C51.afford(bill))takeMoney(bill);fade(false);
    setTimeout(()=>C52.panel('💥 '+why,'Les secours t’ont ramené à '+AP[ap].n+'. Réparations et frais médicaux : '+fmt(bill)+'. L’avion est réparé, mais la mission est perdue.',[{label:'Aéro-club',fn:()=>club(ap)}]),500);});}
function quit(){if(!F.on||F.done)return;F.done=true;const ap=F.y<1&&onRunway(F.x,F.z)?onRunway(F.x,F.z):nearestAirport(F.x,F.z);
  fade(true,()=>{teardown(ap);fade(false);toast(F.air?'Vol interrompu · retour automatique à '+AP[ap].n:'Vol annulé.','');});}
function abort(){try{F.done=true;teardown('pax');}catch(e){}fade(false);toast('Le vol a été annulé suite à un incident technique.','warn');}
/* ---------------- boucle ---------------- */
const _uP=updatePlayer;updatePlayer=function(dt){if(F.on)return;_uP(dt);};
if(typeof interact==='function'){const _ia=interact;interact=function(){if(F.on)return;return _ia.apply(this,arguments);};}
const _up=update;update=function(dt){_up(dt);if(!F.on||!started)return;
  try{if(!F.done){step(dt);}if(F.on&&!F.done){place();player.x=F.x;player.z=F.z;player.h=F.h;player.inside=false;player.moving=0;camFollow(dt);paint();}}
  catch(e){console.warn('aero52',e);abort();}};
/* ---------------- Aéro-club ---------------- */
function club(ap){ap=ap||'pax';
  if(S.lic<3){
    if(S.lic===0)return C52.panel('✈️ Aéro-club Aurore','Apprends à piloter ! Formation complète : cours théorique, vol d’instruction (tour de piste) puis brevet de pilote privé. Avions école fournis.',[C52.b('S’inscrire à la formation',()=>{S.lic=1;save();C51.journal('Inscription à l’Aéro-club Aurore.');club(ap);},900)]);
    if(S.lic===1)return C52.panel('✈️ Cours théorique','Ton instructrice, Capitaine Awa Diop, te fait passer le QCM : 5 questions, 3 bonnes réponses minimum.',[{label:'Passer le QCM',fn:theory}]);
    return C52.panel('✈️ Vol d’instruction','Théorie validée ✓ Prochaine étape : le tour de piste avec l’Aurore Cub. Commandes : Z/↑ monter, S/↓ descendre, Q/D virer, R/F gaz. En tactile : joystick et boutons GAZ.',[{label:'Décoller pour l’examen',fn:()=>start('lecon','pax')}]);}
  const list=ap==='sol'?['retour','lagon','libre']:['bapteme','liaison','charter','voltige','libre'];
  const P=PLANES[S.own[S.sel]?S.sel:'cub'];
  C52.panel('✈️ Aéro-club · '+AP[ap].n,C52.rankName('ciel')+' · '+S.flights+' vols · '+S.kiss+' kiss landings'+(S.pro?' · licence pro':' · licence pro après 10 vols')+'. Avion : '+P.n+(S.own[S.sel]?'':' (location '+fmt(PLANES.cub.rent)+')')+'.',
    list.map(id=>{const M=(ap==='sol'&&MIS_SOL[id])||MIS[id];const locked=M.pax&&!S.pro&&(id==='charter'||id==='retour'||id==='liaison');return {label:M.n+(M.pay?' · ~'+fmt(M.pay*P.pay):'')+(locked?' 🔒 pro':''),off:locked,fn:()=>start(id,ap)};}).concat([{label:'🛩️ Hangar · mes avions',fn:()=>hangar(ap)}]));}
function theory(){C52.mg('quiz',{id:'aero52-qcm',title:'Brevet · théorie',icon:'✈️',n:5,time:14,min:30,q:[
  ['Que provoque une vitesse trop faible ?',['Le décrochage','Plus de portance','Un virage','Rien'],0],
  ['Pour monter, on tire le manche et…',['On garde de la vitesse (gaz)','On coupe le moteur','On sort les freins','On vire'],0],
  ['Incliner l’avion à droite le fait…',['Virer à droite','Monter','Freiner','Virer à gauche'],0],
  ['Un bon atterrissage se fait…',['Dans l’axe, en descente douce','En piqué','Moteur plein gaz','Hors piste'],0],
  ['La piste de PAX est orientée…',['Nord-sud (36/18)','Est-ouest','En diagonale','Elle est circulaire'],0],
  ['La tour de contrôle sert à…',['Coordonner le trafic','Vendre des billets','Réparer les avions','Rien'],0],
  ['« Vario » indique…',['La vitesse verticale','Le carburant','La température','Le cap'],0]],
  after:s=>{if(s>=.6){S.lic=2;save();C52.xp('ciel',20);return 'Théorie validée ! Prochaine étape : vol d’instruction.';}return 'Il faut 3 bonnes réponses sur 5. Réessaie.';}});}
function hangar(ap){const rows=Object.keys(PLANES).map(id=>{const P=PLANES[id],own=!!S.own[id];
  if(own)return {label:(S.sel===id?'✓ ':'')+P.n+' · '+P.d,off:S.sel===id,fn:()=>{S.sel=id;save();toast(P.n+' sélectionné.','good');hangar(ap);}};
  return C52.b('Acheter '+P.n+' · '+P.d,()=>{S.own[id]=1;S.sel=id;save();C52.xp('ciel',40);C51.journal('Achat d’un avion : '+P.n+'.');toast(P.n+' livré au hangar !','good');if(id==='jet')C52.title('Propriétaire de jet');hangar(ap);},P.price,S.lic<3);});
  C52.panel('🛩️ Hangar','Plus l’avion est gros, plus les missions paient (passagers et vitesse). Sans avion, l’Aurore Cub est loué '+fmt(PLANES.cub.rent)+' par vol.',rows.concat([{label:'← Aéro-club',fn:()=>club(ap)}]));}
C52.venue('aero52:club',['air27:info',4,3],0x5ac8fa,'✈️ Aéro-club Aurore · apprendre à piloter',()=>club('pax'));
C52.venue('aero52:club@sol',['air27:info@sol',4,3,'air27:info'],0x5ac8fa,'✈️ Aéro-club de Solenne',()=>club('sol'));
/* ---------------- onglet Horizons ---------------- */
C52.tab('ciel','Ciel',(b,UI,X)=>{UI.hero(b,'Aviation · '+C52.rankName('ciel'),S.lic>=3?(S.pro?'Licence pro':'Brevet de pilote'):'Pas encore pilote',S.flights+' vols · '+S.kiss+' kiss landings · '+S.km.toFixed(1)+' km · '+S.crashes+' incident(s)');
  UI.btn(b,'📍 Aéro-club de PAX',()=>C52.go('aero52:club'),true);UI.btn(b,'📍 Aéro-club de Solenne',()=>C52.go('aero52:club@sol'));
  const g=UI.grp(b);Object.keys(PLANES).forEach(id=>{const P=PLANES[id];UI.row(g,{title:(S.own[id]?'✓ ':'')+P.n,sub:P.d+' · '+(S.own[id]?'dans ton hangar':fmt(P.price)),wrap:true});});
  if(S.best.voltige!=null)UI.note(b,'Record de voltige : '+S.best.voltige.toFixed(1)+' s.');},10);
window.AERO52={get state(){return S;},get flying(){return F.on;},start,club,PLANES};
})();
