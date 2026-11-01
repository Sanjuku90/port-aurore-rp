'use strict';
/* ---------- caméra, jour et nuit ---------- */
let camT=1;
function updateCamera(dt){
  if(!started){
    idleT+=dt;const a=idleT*0.12;camera.position.set(Math.cos(a)*40,17,Math.sin(a)*40);camera.lookAt(0,5,0);return;
  }
  const driving=!!player.car;
  if(driving&&performance.now()-lastDrag>1500)camYaw+=angDiff(camYaw,player.car.h)*Math.min(1,2.6*dt);
  camDist=lerp(camDist,driving?8.6:(player.inside?3.6:5.6),Math.min(1,4*dt));
  const ty=driving?1.3:1.5,cp=Math.cos(camPitch),sp=Math.sin(camPitch);
  const dx=-Math.sin(camYaw)*cp,dz=-Math.cos(camYaw)*cp;
  let t=1;
  for(let i=1;i<=12;i++){
    const f=i/12,x=player.x+dx*camDist*f,z=player.z+dz*camDist*f,y=ty+sp*camDist*f;let inside=false;
    for(let k=0;k<boxes.length;k++){const b=boxes[k];if(b.big&&x>b.x0-0.4&&x<b.x1+0.4&&z>b.z0-0.4&&z<b.z1+0.4&&y<60){inside=true;break;}}
    if(inside){t=Math.max(Math.min(1,1.3/camDist),(i-1)/12);break;}
  }
  camT+=(t-camT)*Math.min(1,(t<camT?20:2.5)*dt);
  camera.position.set(player.x+dx*camDist*camT,Math.max(0.6,ty+sp*camDist*camT),player.z+dz*camDist*camT);
  camera.lookAt(player.x,ty,player.z);
}
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

