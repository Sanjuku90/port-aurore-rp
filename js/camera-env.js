'use strict';
/* ---------- caméra, jour et nuit ---------- */
let camT=1;
/* v25 : caméra à la 3e personne lissée, zoom molette/pincement, recentrage auto, champ de vision dynamique */
const CAMX={sens:1.25,SENS:[['Faible',.8],['Moyenne',1.25],['Élevée',1.7],['Très élevée',2.2]],zoom:1,fov:60,tgt:null,look:null,shake:0,preset:1,PRE:[['Proche',.72],['Normale',1],['Éloignée',1.38]]};
try{const z=+localStorage.getItem('port-aurore-cam');if(z>=.5&&z<=1.7)CAMX.zoom=z;CAMX.preset=CAMX.PRE.reduce((b,p,i)=>Math.abs(p[1]-CAMX.zoom)<Math.abs(CAMX.PRE[b][1]-CAMX.zoom)?i:b,1);}catch(e){}
try{const v=+localStorage.getItem('port-aurore-sens');if(v>=.5&&v<=2.5)CAMX.sens=v;}catch(e){}
function camSens(){const i=CAMX.SENS.findIndex(x=>x[1]===CAMX.sens),n=CAMX.SENS[(i+1)%CAMX.SENS.length];CAMX.sens=n[1];try{localStorage.setItem('port-aurore-sens',String(n[1]));}catch(e){}return n[0];}
function camSensName(){const f=CAMX.SENS.find(x=>x[1]===CAMX.sens);return f?f[0]:'Personnalisée';}
function camSaveZoom(){try{localStorage.setItem('port-aurore-cam',CAMX.zoom.toFixed(2));}catch(e){}}
function camCycle(){CAMX.preset=(CAMX.preset+1)%CAMX.PRE.length;CAMX.zoom=CAMX.PRE[CAMX.preset][1];camSaveZoom();if(typeof toast==='function'&&started)toast('Caméra : '+CAMX.PRE[CAMX.preset][0]);}
function updateCamera(dt){
  if(!started){
    /* plan d'ouverture : survol lent du port, hauteur et rayon qui respirent */
    idleT+=dt;const a=idleT*0.07,r=46+Math.sin(idleT*0.11)*10,hh=15+Math.sin(idleT*0.09)*5;
    camera.position.set(Math.cos(a)*r,hh,Math.sin(a)*r+20);camera.lookAt(Math.cos(a+0.9)*8,4.5,Math.sin(a+0.9)*8+10);
    if(Math.abs(camera.fov-52)>.05){camera.fov=52;camera.updateProjectionMatrix();}return;
  }
  const driving=!!player.car,now=performance.now(),car=player.car,spd=driving?Math.abs(car.v||0):(player.moving||0);
  const k=s=>1-Math.exp(-s*dt);
  /* recentrage derrière le joueur après 2,5 s sans toucher la caméra (pas en marchant vers la caméra) */
  if(driving&&now-lastDrag>1500)camYaw+=angDiff(camYaw,car.h)*Math.min(1,2.6*dt);
  else if(!driving&&!player.inside&&spd>1.2&&now-lastDrag>2500){const d=angDiff(camYaw,player.h);if(Math.abs(d)<2.1)camYaw+=d*Math.min(1,0.9*dt*Math.min(1,spd/4));}
  const base=driving?8.2+Math.min(2.4,spd*0.09):(player.inside?3.6:5.4);
  camDist=lerp(camDist,base*CAMX.zoom,Math.min(1,4*dt));
  /* cible lissée + regard en avant en voiture */
  const ty=driving?1.35:1.55;
  if(!CAMX.tgt)CAMX.tgt=new THREE.Vector3(player.x,ty,player.z);
  const ah=driving?Math.min(3.2,spd*0.13)*(car.v<0?-1:1):0,hx=driving?Math.sin(car.h):0,hz=driving?Math.cos(car.h):0;
  const tx=player.x+hx*ah,tz=player.z+hz*ah;
  if(Math.hypot(tx-CAMX.tgt.x,tz-CAMX.tgt.z)>12)CAMX.tgt.set(tx,ty,tz);else{const f=k(driving?9:14);CAMX.tgt.x+=(tx-CAMX.tgt.x)*f;CAMX.tgt.z+=(tz-CAMX.tgt.z)*f;CAMX.tgt.y+=(ty-CAMX.tgt.y)*f;}
  const T=CAMX.tgt,cp=Math.cos(camPitch),sp=Math.sin(camPitch),dx=-Math.sin(camYaw)*cp,dz=-Math.cos(camYaw)*cp;
  /* anti-traversée des bâtiments */
  let t=1;
  for(let i=1;i<=14;i++){
    const f=i/14,x=T.x+dx*camDist*f,z=T.z+dz*camDist*f,y=T.y+sp*camDist*f;let inside=false;
    for(let q=0;q<boxes.length;q++){const b=boxes[q];if(b.big&&x>b.x0-0.45&&x<b.x1+0.45&&z>b.z0-0.45&&z<b.z1+0.45&&y<60){inside=true;break;}}
    if(inside){t=Math.max(Math.min(1,1.3/camDist),(i-1)/14);break;}
  }
  camT+=(t-camT)*Math.min(1,(t<camT?20:2.5)*dt);
  /* léger tremblement à haute vitesse */
  CAMX.shake=driving&&spd>18?(spd-18)*0.0035:0;const sh=CAMX.shake?Math.sin(now*0.047)*CAMX.shake:0,sv=CAMX.shake?Math.cos(now*0.061)*CAMX.shake:0;
  camera.position.set(T.x+dx*camDist*camT+sh,Math.max(0.6,T.y+sp*camDist*camT)+sv,T.z+dz*camDist*camT);
  camera.lookAt(T.x,T.y+(driving?0.15:0.05),T.z);
  /* champ de vision : s'ouvre avec la vitesse */
  const run=!driving&&spd>5.2,fov=60+(driving?Math.min(13,spd*0.48):run?4:0);
  CAMX.fov+=(fov-CAMX.fov)*k(3);if(Math.abs(camera.fov-CAMX.fov)>.02){camera.fov=CAMX.fov;camera.updateProjectionMatrix();}
}
/* molette (PC) et pincement (mobile) pour zoomer */
(function(){
  const ok=()=>typeof started!=='undefined'&&started&&!panelOpen&&!(typeof paused!=='undefined'&&paused)&&!(typeof M3!=='undefined'&&M3.on);
  addEventListener('wheel',e=>{if(!ok())return;if(e.target&&e.target.closest&&e.target.closest('#phone,#panel,#pause,#start,.sheet'))return;CAMX.zoom=Math.max(.55,Math.min(1.6,CAMX.zoom*(1+e.deltaY*0.0011)));camSaveZoom();},{passive:true});
  const pts=new Map();let pd=0;
  addEventListener('pointerdown',e=>{if(e.target&&e.target.id==='gl'){pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const [a,b]=[...pts.values()];pd=Math.hypot(a[0]-b[0],a[1]-b[1]);}}});
  addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2&&ok()){const [a,b]=[...pts.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pd>0){CAMX.zoom=Math.max(.55,Math.min(1.6,CAMX.zoom*pd/d));}pd=d;}});
  const up=e=>{if(pts.delete(e.pointerId)&&pts.size<2){pd=0;camSaveZoom();}};addEventListener('pointerup',up);addEventListener('pointercancel',up);
  addEventListener('keydown',e=>{if(e.key&&e.key.toLowerCase()==='v'&&ok()&&!(typeof chatOpen!=='undefined'&&chatOpen)&&!(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)))camCycle();});
})();
const C_NIGHT=new THREE.Color(0x0a1224),C_DAY=new THREE.Color(0x9ccdf2),C_DAWN=new THREE.Color(0xe8946a);
const T_NIGHT=new THREE.Color(0x050914),T_DAY=new THREE.Color(0x3d7fd0);
const SUNW=new THREE.Color(0xfff2d6),SUNO=new THREE.Color(0xff9a55),MOONC=new THREE.Color(0x7b90d6);
const tmpC=new THREE.Color(),tmpT=new THREE.Color(),sv=new THREE.Vector3(),mv=new THREE.Vector3(),ld=new THREE.Vector3();
function updateEnv(){
  const h=(gameMin/60)%24,a=(h-6)/12*Math.PI,s=Math.sin(a),d=s>0?clamp(s*1.4,0,1):0,n=1-d;
  tmpC.copy(C_NIGHT).lerp(C_DAY,d);
  tmpT.copy(T_NIGHT).lerp(T_DAY,d);
  if(d>0.02&&d<0.45){const k=Math.sin(d/0.45*Math.PI);tmpC.lerp(C_DAWN,k*0.5);tmpT.lerp(C_DAWN,k*0.18);}
  scene.background.copy(tmpC);scene.fog.color.copy(tmpC);
  sky.material.uniforms.hor.value.copy(tmpC);sky.material.uniforms.top.value.copy(tmpT);
  sky.position.copy(camera.position);stars.position.copy(camera.position);
  stars.material.opacity=clamp(n*1.4-0.4,0,1);
  sv.set(Math.cos(a)*0.9,s,0.35).normalize();mv.set(-sv.x,-sv.y,-sv.z);
  sunSp.visible=sv.y>0.02;sunSp.position.copy(camera.position).addScaledVector(sv,280);
  moonSp.visible=mv.y>0.02;moonSp.position.copy(camera.position).addScaledVector(mv,280);
  const day=d>0.02;
  ld.copy(day?sv:mv);ld.y=Math.max(ld.y,0.3);ld.normalize();
  sun.color.copy(day?SUNO:MOONC);if(day)sun.color.lerp(SUNW,clamp(d*1.6,0,1));
  sun.intensity=day?0.12+0.9*d:0.3;
  const px=Math.round(player.x/2)*2,pz=Math.round(player.z/2)*2;
  sun.position.set(px+ld.x*120,ld.y*120,pz+ld.z*120);sun.target.position.set(px,0,pz);sun.target.updateMatrixWorld();
  hemi.intensity=0.3+0.7*d;clouds.forEach(c=>c.material.opacity=0.1+0.7*d);if(hgm){hgm.opacity=n*0.9;tgm.opacity=n*0.75;}
  const pw=blackout>0?0:1;wallMats.forEach(m=>m.emissiveIntensity=n*0.95*pw);shopMats.forEach(m=>m.emissiveIntensity=n*1.05*pw);
  const on=n>0.35&&pw;lampMat.color.setRGB(on?1:0.3,on?0.86:0.3,on?0.55:0.3);
  glowMat.opacity=clamp((n-0.3)*0.5,0,0.32)*pw;
  if(player.car&&n>0.25){
    const c=player.car,fx=Math.sin(c.h),fz=Math.cos(c.h);
    headSpot.intensity=1.8*n;headSpot.position.set(c.x+fx*2,1,c.z+fz*2);
    headSpot.target.position.set(c.x+fx*22,0,c.z+fz*22);headSpot.target.updateMatrixWorld();
  }else headSpot.intensity=0;
}
function updateMini(){
  const cv=$('#mini'),g=cv.getContext('2d'),S=cv.width,R=64,sc=(S/2)/R;
  g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,S,S);g.fillStyle='#262b33';g.fillRect(0,0,S,S);
  const cy=Math.cos(camYaw),sy=Math.sin(camYaw);
  g.save();g.translate(S/2,S/2);g.transform(-cy*sc,-sy*sc,sy*sc,-cy*sc,0,0);g.translate(-player.x,-player.z);
  g.fillStyle='#4a5058';
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)g.fillRect(i*64-25,j*64-25,50,50);
  g.fillStyle='#35603c';g.fillRect(-25,-153,50,50);
  g.fillStyle='#6b727b';
  boxes.forEach(b=>{if(b.big)g.fillRect(b.x0,b.z0,b.x1-b.x0,b.z1-b.z0);});
  g.restore();
  function dot(x,z,col,r){
    let dx=x-player.x,dz=z-player.z;
    let px=(-cy*dx+sy*dz)*sc,py=(-sy*dx-cy*dz)*sc;const l=Math.hypot(px,py),m=S/2-8;
    if(l>m){px*=m/l;py*=m/l;}
    g.fillStyle=col;g.beginPath();g.arc(S/2+px,S/2+py,r,0,7);g.fill();
  }
  spots.forEach(s=>dot(s.x,s.z,'#'+s.color.toString(16).padStart(6,'0'),7));
  if(wp)dot(wp.x,wp.z,'#6cc6ff',9);
  if(mission){const t=mission.stage==='pickup'?mission.pickup:mission.drop;g.strokeStyle='#fff';g.lineWidth=3;dot(t.x,t.z,mission.stage==='pickup'?'#ffb84d':'#58d68d',9);}
  g.save();g.translate(S/2,S/2);g.rotate(camYaw-player.h);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=2;
  g.beginPath();g.moveTo(0,-13);g.lineTo(9,10);g.lineTo(0,5);g.lineTo(-9,10);g.closePath();g.stroke();g.fill();g.restore();
}
function updateHud(){
  $('#h-name').textContent=state.name;$('#h-job').textContent=JOBN[state.job]||'Sans emploi';
  $('#h-cash').textContent=fmt(state.cash);$('#h-bank').textContent=fmt(state.bank);
  $('#hp').style.width=clamp(state.health,0,100)+'%';$('#hp').className=state.health<30?'low':'';
  $('#hu').style.width=clamp(state.hunger,0,100)+'%';$('#hu').className=state.hunger<20?'low':'';
  $('#he').style.width=clamp(state.energy,0,100)+'%';$('#he').className='e'+(state.energy<20?' low':'');
  $('#hf').style.width=clamp(state.fun,0,100)+'%';$('#hf').className='m'+(state.fun<20?' low':'');
  $('#rank').textContent='Rang '+(rankOf()+1)+' · '+RANKS[rankOf()]+' · '+state.friends.length+' amis';
  const mm=Math.floor(gameMin%1440),hh=Math.floor(mm/60),mi=mm%60;
  $('#clock').textContent=String(hh).padStart(2,'0')+':'+String(mi).padStart(2,'0');
  const mb=$('#mission');
  if(mission){
    mb.hidden=false;
    const tx=mission.kind==='taxi',po=mission.kind==='police';
    if(mission.stage==='pickup'){$('#m-title').textContent=tx?'Prendre le client':po?'Se rendre sur place':'Récupérer';$('#m-text').textContent=mission.resto;$('#m-time').textContent='Pas de chrono';}
    else{const left=Math.round(mission.limit-mission.time);$('#m-title').textContent=tx?'Déposer':po?'Escorter':'Livrer';$('#m-text').textContent=mission.addr;$('#m-time').textContent=left>=0?Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'En retard';}
    $('#m-pay').textContent=fmt(mission.pay);
  }else mb.hidden=true;
  ambUpdate();const un=totalUnread(),bd=$('#ph-bd');bd.hidden=!un;bd.textContent=un;
  if(!$('#phone').hidden){$('#ph-time').textContent=$('#clock').textContent;$('#ph-net').textContent=blackout>0?'Pas de réseau':'5G ▂▄▆';}
  if(player.car)$('#speed').textContent=Math.round(Math.abs(player.car.v)*3.6)+' km/h';
}
function updatePrompt(){
  nearSpot=null;nearCar=null;nearPed=null;let txt='';
  if(started&&!panelOpen&&!chatOpen){
    if(player.car){if(Math.abs(player.car.v)<3)txt='E · Descendre';}
    else{
      let bd=3.4;spots.forEach(s=>{const d=Math.hypot(s.x-player.x,s.z-player.z);if(d<bd){bd=d;nearSpot=s;}});
      if(nearSpot)txt=(blackout>0&&(nearSpot.id==='shop'||nearSpot.id==='club'))?'Fermé · coupure de courant':'E · '+nearSpot.label;
      else{let cd=4.2;cars.forEach(c=>{if(c.kind!=='parked')return;const d=Math.hypot(c.x-player.x,c.z-player.z);if(d<cd){cd=d;nearCar=c;}});if(nearCar)txt='E · Monter dans la voiture';else{let pd=2.6;peds.forEach(p=>{const d=Math.hypot(p.x-player.x,p.z-player.z);if(d<pd&&p.stun<=0){pd=d;nearPed=p;}});if(nearPed)txt='E · Parler à '+nearPed.name+(state.friends.indexOf(nearPed.name)<0?'':' (ami)');}}
    }
  }
  if(txt!==promptKey){promptKey=txt;const b=$('#prompt');b.hidden=!txt;b.textContent=txt;}
}

