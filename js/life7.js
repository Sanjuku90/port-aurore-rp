'use strict';
/* ---------- v7 : vie à l'intérieur (actions animées : dormir, s'asseoir, cuisiner, se doucher…) ---------- */
const H7={food:4,meal:0};
try{const s=JSON.parse(localStorage.getItem('port-aurore-v7')||'null');if(s){H7.food=clamp(+s.food||0,0,30);H7.meal=s.meal?1:0;}}catch(e){}
setInterval(()=>{if(started)try{localStorage.setItem('port-aurore-v7',JSON.stringify(H7));}catch(e){}},4000);
let ACT=null,nearInt=null;
const POSE={stand:[0,0,.02,.02,0,0,.08,-.08],sit:[-1.5,-1.5,1.5,1.5,-.45,-.45,.1,-.1],lie:[0,0,.06,.06,.02,.02,.13,-.13]};
function poseOf(p,t){const s=Math.sin(t*6)*.12;switch(p){
  case 'use':return [0,0,.02,.02,-1.0+s,-1.0-s,.18,-.18];
  case 'cook':return [0,0,.02,.02,-.9,-1.15+Math.sin(t*5)*.25,.15,-.25+Math.cos(t*5)*.15];
  case 'drink':return [0,0,.02,.02,-.1,-2.2+Math.sin(t*2)*.12,.1,-.45];
  case 'comb':return [0,0,.02,.02,-2.5+Math.sin(t*7)*.25,-.3,.55,-.1];
  case 'read':return [0,0,.02,.02,-1.25,-1.25,.32,-.32];
  case 'shower':return [0,0,.02,.02,-2.7+Math.sin(t*5)*.3,-2.7-Math.sin(t*5)*.3,.45,-.45];
  case 'water':return [0,0,.02,.02,-.1,-1.0+Math.sin(t*3)*.08,.08,-.1];
  case 'workout':{const b=Math.max(0,Math.sin(t*3.2));return [-.9*b,-.9*b,1.8*b,1.8*b,-.3-1.2*b,-.3-1.2*b,.15,-.15];}
  case 'guitar':return [-1.5,-1.5,1.5,1.5,-.95,-1.1+Math.sin(t*9)*.15,.55,-.15];
  case 'eat':return [-1.5,-1.5,1.5,1.5,-.6,-.6-1.4*Math.max(0,Math.sin(t*2.2)),.12,-.32];
  case 'type':return [-1.5,-1.5,1.5,1.5,-1.15+Math.sin(t*14)*.04,-1.15-Math.sin(t*13)*.04,.22,-.22];
  case 'dance':{const b=Math.sin(t*4.2);return [.15*b,-.15*b,.45+.35*b,.45-.35*b,-2.3-Math.sin(t*2.1)*.5,-2.3+Math.sin(t*2.1+1)*.5,.35+.2*b,-.35+.2*b];}
  default:return POSE[p]||POSE.stand;}}
const sm01=t=>t*t*(3-2*t);
function startAct(a){
  if(ACT||!player.inside)return;for(const k in keys)keys[k]=false;P3.emo.t=0;
  const from={x:player.x,z:player.z,y:.1,h:player.h,rx:0,pose:'stand'};
  const d=Math.hypot(a.K[0].x-from.x,a.K[0].z-from.z);a.K[0].t=Math.max(.25,Math.min(1.4,d/2.6));
  a.K.unshift(from);a.s=0;a.u=0;a.dir=1;a.state='play';a.time=0;a.holdT=0;a.wp=0;ACT=a;
}
function endAct(){const a=ACT;if(!a)return;if(a.state==='play'&&a.dir>0&&a.s===0){finishAct(true);return;}a.dir=-1;a.state='play';if(a.s===a.K.length-1){a.s=a.K.length-2;a.u=1;}}
function finishAct(stop){const a=ACT;ACT=null;const m=player.mesh;m.rotation.x=0;
  if(!stop){const k=a.K[1];player.x=k.x;player.z=k.z;player.h=k.h;}
  a.end&&a.end(a);$('#act7').hidden=true;$('#sl7').classList.remove('on');}
function actUpdate(dt){
  const a=ACT,m=player.mesh,K=a.K;a.time+=dt;
  if(a.state==='hold'){a.holdT+=dt;a.hold&&a.hold(dt,a);
    const inp=(panelOpen||chatOpen)?{x:0,z:0}:getInput();if(Math.hypot(inp.x,inp.z)>.5&&!a.noMove)endAct();
    if(a.dur&&a.holdT>=a.dur){const d=a.done;a.done=null;d&&d(a);if(ACT===a)endAct();}}
  else{const B=K[a.s+1];a.u+=a.dir*dt/Math.max(.05,B.t);
    if(a.dir>0&&a.u>=1){if(a.s+1>=K.length-1){a.u=1;a.state='hold';a.after&&a.after(a);a.after=null;}else{a.s++;a.u=0;}}
    else if(a.dir<0&&a.u<=0){if(a.s<=1){finishAct();return;}a.s--;a.u=1;}}
  const A=K[a.s],B=K[Math.min(a.s+1,K.length-1)],u=clamp(a.u,0,1),e=a.s===0?u:sm01(u);
  const x=lerp(A.x,B.x,e),z=lerp(A.z,B.z,e),y=lerp(A.y,B.y,e),rx=lerp(A.rx||0,B.rx||0,e);
  let h;
  if(a.s===0&&a.state==='play'){const mv=Math.atan2(B.x-A.x,B.z-A.z),dd=Math.hypot(B.x-A.x,B.z-A.z);h=dd>.2?(u<.7?A.h+angDiff(A.h,mv)*Math.min(1,u*5):mv+angDiff(mv,B.h)*((u-.7)/.3)):A.h+angDiff(A.h,B.h)*u;
    a.wp+=dt*9;animPerson(m,a.wp,dd>.2?.55*(1-Math.max(0,u-.85)*6):0,false);}
  else{h=A.h+angDiff(A.h,B.h)*e;const pa=poseOf(A.pose,a.time),pb=poseOf(B.pose,a.time),L=pa.map((v,i)=>lerp(v,pb[i],e)),U=m.userData;
    U.legL.rotation.x=L[0];U.legR.rotation.x=L[1];U.kneeL.rotation.x=L[2];U.kneeR.rotation.x=L[3];U.armL.rotation.x=L[4];U.armR.rotation.x=L[5];U.armL.rotation.z=L[6];U.armR.rotation.z=L[7];}
  m.rotation.order='YXZ';m.position.set(x,y,z);m.rotation.set(rx,h,0);
  player.x=x;player.z=z;player.h=h;a.prog&&a.prog(a.state==='hold'?1:(a.s>=K.length-2?e:0),a);
  const bar=$('#act7');if(a.dur&&a.state==='hold'){bar.hidden=false;bar.querySelector('b').textContent=a.title||'';bar.querySelector('i').style.width=Math.round(100*a.holdT/a.dur)+'%';}else bar.hidden=true;
}
/* ----- constructeurs d'actions ----- */
function sitAct(seat,o){o=o||{};const R=player.inside,fx=Math.sin(seat.h),fz=Math.cos(seat.h);
  const app=o.app||{x:seat.x+fx*.55,z:seat.z+fz*.55};
  startAct({K:[{x:app.x,z:app.z,y:.1,h:seat.h,pose:'stand'},{x:seat.x,z:seat.z,y:seat.y-.8,h:seat.h,pose:'sit',t:.6}],label:'Se lever',dur:o.dur,done:o.done,title:o.dur?'Pause':'',
    after:o.after?()=>o.after():null,
    hold:(dt,a)=>{state.energy=Math.min(100,state.energy+.5*dt);
      if(o.sofa&&RIG7.on.tv){state.fun=Math.min(100,state.fun+.7*dt);if(!a.tvMsg){a.tvMsg=1;toast('Tu regardes la télé. L’humeur remonte.','good');}}
      if(o.table&&H7.meal&&!a.eat){a.eat=1;a.K[a.K.length-1].pose='eat';a.title='Repas';a.dur=a.holdT+5;a.done=()=>{H7.meal=0;R.meal&&(R.meal.visible=false);state.hunger=Math.min(100,state.hunger+55);state.fun=Math.min(100,state.fun+6);toast('Délicieux ! +55 faim','good');a.K[a.K.length-1].pose='sit';a.dur=0;a.noEnd=1;};}
      if(o.screen)a.typing=1;a.hold2&&a.hold2(dt,a);},
    end:()=>{if(o.screen)drawLaptop(o.screen,false);}});
  if(o.screen&&ACT)ACT.K[ACT.K.length-1].pose='type';
  if(o.guitar&&ACT){ACT.K[ACT.K.length-1].pose='guitar';ACT.title='Guitare';ACT.hold2=(dt,a)=>{a.nt=(a.nt||0)-dt;if(a.nt<=0){a.nt=.25;try{tone([196,247,294,330,392,440][Math.floor(Math.random()*6)],.5,'triangle',.06);}catch(e){}}};}
}
function useAct(p,pose,dur,done,o){o=o||{};
  startAct({K:[{x:p.x,z:p.z,y:.1,h:p.h,pose:'stand'},{x:p.x,z:p.z,y:.1,h:p.h,pose,t:.35}],label:'Arrêter',title:o.title||'…',dur,done,
    hold:(dt,a)=>{if(o.water)o.water.visible=true;o.hold&&o.hold(dt,a);},end:()=>{if(o.water)o.water.visible=false;o.end&&o.end();}});
}
function lieKeys(B,s,top,headZ,side){B.updateWorldMatrix(true,false);const W=(x,z)=>{const v=new THREE.Vector3(x,0,z);B.localToWorld(v);return v;};
  const ry=B.rotation.y,ap=W(s*(side||1.2),.25),ed=W(s*.5,.25),ft=W(0,headZ+1.83),hs=ry+s*Math.PI/2;
  return [{x:ap.x,z:ap.z,y:.1,h:hs,pose:'stand'},{x:ed.x,z:ed.z,y:top-.82,h:hs,pose:'sit',t:.7},{x:ft.x,z:ft.z,y:top+.14,h:ry,rx:-Math.PI/2+.07,pose:'lie',t:1.2}];}
function duvetTo(B,k){const d=B.userData.duvet;if(!d)return;const sl=-.06*k;d.g.position.z=d.z0-sl;d.g.position.y=(d.y0==null?(d.y0=d.g.position.y):d.y0)+.4*k;d.g.scale.z=(d.len+sl)/d.len;}
function sleepAct(R,s){
  const B=R.bed,K=lieKeys(B,s,.58,-.78),h0=(gameMin/60)%24,night=h0>=20||h0<6;
  B.updateWorldMatrix(true,false);const c=new THREE.Vector3(1.9,2.1,1.6);B.localToWorld(c);const t=new THREE.Vector3(0,.65,-.35);B.localToWorld(t);
  startAct({K,label:'Se réveiller',cam:{p:c,t},sleep:1,
    prog:(e)=>duvetTo(B,e),
    after:(a)=>{a.slept=0;a.night=night;$('#sl7').classList.add('on');},
    hold:(dt,a)=>{const sp=Math.min(1,a.holdT/1.5)*42,dm=sp*dt;gameMin+=dm;a.slept+=dm;
      state.energy=Math.min(100,state.energy+dm*.22);state.hunger=Math.max(0,state.hunger-dm*.03);state.thirst=Math.max(0,state.thirst-dm*.03);
      if(P3.sick&&a.slept>240){P3.sick=0;}state.health=Math.min(100,state.health+dm*.02);
      const hh=(gameMin/60)%24,mm=Math.floor(gameMin%60);
      $('#sl7-t').textContent=String(Math.floor(hh)).padStart(2,'0')+':'+String(mm).padStart(2,'0');$('#sl7-e').textContent='Énergie '+Math.round(state.energy);
      zzz7(dt,player.mesh);
      const wake=(a.night&&hh>=7&&hh<8&&a.slept>60)||(!a.night&&state.energy>=100)||a.slept>660;
      if(wake){a.woke=1;endAct();}},
    end:(a)=>{duvetTo(B,0);zzzClear();state.fun=Math.min(100,state.fun+(a.slept>300?10:3));toast(a.woke?'Bien dormi ! Énergie '+Math.round(state.energy)+'.':'Tu te lèves.','good');}});
}
function healAct(R,B,s){
  if(state.health>=100){toast('Tu es en pleine forme.');return;}if(state.cash<30){toast('Il faut $30 en cash.','warn');return;}
  state.cash-=30;const K=lieKeys(B,-s,.78,-.8,1.0);
  startAct({K,label:'Se lever',prog:(e)=>duvetTo(B,e*.7),hold:(dt,a)=>{state.health=Math.min(100,state.health+9*dt);P3.sick=0;if(state.health>=100&&!a.ok){a.ok=1;toast('Soigné. Santé 100.','good');endAct();}},end:()=>duvetTo(B,0)});
}
function showerAct(R){const g=R.shower;g.updateWorldMatrix(true,false);const c=new THREE.Vector3(.05,0,.05);g.localToWorld(c);
  startAct({K:[{x:R.rx+1.3,z:R.rz-4.85,y:.1,h:Math.PI,pose:'stand'},{x:c.x,z:c.z,y:.16,h:0,pose:'shower',t:.8}],label:'Sortir de la douche',title:'Douche',dur:6,
    done:()=>{state.fun=Math.min(100,state.fun+12);P3.wet=0;toast('Tout propre ! +12 humeur','good');},
    hold:(dt)=>{const d=g.userData.drops;d.m.visible=true;const p=d.m.geometry.attributes.position.array;d.base.forEach((b,i)=>{b[1]-=dt*(4+i%5);if(b[1]<0)b[1]+=2;const x=d.hx+b[0],z=d.hz+b[2];p[i*6]=x;p[i*6+1]=b[1];p[i*6+2]=z;p[i*6+3]=x;p[i*6+4]=b[1]+.12;p[i*6+5]=z;});d.m.geometry.attributes.position.needsUpdate=true;},
    end:()=>{g.userData.drops.m.visible=false;}});}
function cookAct(R){
  if(H7.meal){toast('Ton repas t’attend sur la table.');return;}
  if(H7.food<=0){toast('Frigo vide. Fais des courses à la supérette.','warn');return;}
  const st=R.stove.userData;
  useAct({x:R.rx+3.6,z:R.rz-5.42,h:Math.PI},'cook',7,()=>{H7.food--;H7.meal=1;R.meal.visible=true;toast('Repas prêt ! Assieds-toi à table pour manger.','good');},
    {title:'Cuisine',hold:(dt,a)=>{st.burn[2].emissiveIntensity=2.2+Math.sin(a.time*9)*.3;st.pan.userData.food.visible=true;st.pan.rotation.z=Math.sin(a.time*4)*.05;steam7(dt,R,st.pan);},
     end:()=>{st.burn[2].emissiveIntensity=0;st.pan.userData.food.visible=false;st.pan.rotation.z=0;steamClear();}});
}
function fridgeAct(R){const fr=R.fridge.userData;
  useAct({x:R.rx+7.62,z:R.rz-5.6,h:Math.PI/2},'use',0,null,{title:'Frigo',hold:(dt,a)=>{fr.door.rotation.y+=(1.7-fr.door.rotation.y)*Math.min(1,6*dt);if(!a.p){a.p=1;fridgePanel();}else if(!panelOpen)endAct();},
    end:()=>{fr.door.rotation.y=0;}});
}
function fridgePanel(){openPanel('Frigo','Portions de nourriture : '+H7.food+'. Cuisine-les à la plaque pour un vrai repas.',[
  {label:'Boire de l’eau fraîche',fn:()=>{state.thirst=Math.min(100,state.thirst+30);toast('+30 soif','good');}},
  {label:'Grignoter un reste',off:H7.food<=0,fn:()=>{H7.food--;state.hunger=Math.min(100,state.hunger+20);toast('+20 faim','good');}},
  {label:'Prendre une bouteille d’eau (sac)',off:inv()>=CAP,fn:()=>{P3.inv.water=(P3.inv.water||0)+1;toast('Bouteille dans le sac.','good');}}]);}
function wardrobeAct(R){const d=R.wardrobe.userData.doors;
  useAct({x:R.rx-7.6,z:R.rz-1.7,h:Math.PI},'use',0,null,{title:'Garde-robe',hold:(dt,a)=>{d.forEach(g=>g.rotation.y+=(g.userData.s*1.6-g.rotation.y)*Math.min(1,6*dt));if(!a.p){a.p=1;wardrobePanel();}else if(!panelOpen)endAct();},
    end:()=>d.forEach(g=>g.rotation.y=0)});}
function freeO(re){return (l,f)=>({label:l,fn:()=>{f();remesh();re();}});}
function wardrobePanel(){const o=freeO(wardrobePanel);openPanel('Garde-robe','Tes vêtements, gratuitement. Haut : '+(look.t||'tee')+' · Bas : '+(look.bt||'pantalon')+'.',[
  o('Couleur du haut',()=>{look.s=nx(COLS,look.s);}),o('Type de haut',()=>{look.t=nx(['tee','long','veste','sweat'],look.t);}),o('Bas : '+(look.bt||'pantalon'),()=>{look.bt=nx(['pantalon','short','jupe'],look.bt||'pantalon');}),
  o('Couleur du bas',()=>{look.p=nx(PN3,look.p||PN3[0]);}),o('Chaussures',()=>{look.f=nx(SHOE_COLS,look.f!=null?look.f:0xf2f2ee);}),o(look.bag?'Ranger le sac à dos':'Prendre le sac à dos',()=>{look.bag=!look.bag;})]);}
function mirrorPanel(){const o=freeO(mirrorPanel);openPanel('Miroir','Coiffure : '+HAIR_LABELS[look.y||'court']+'. Pour une couleur ou un nouveau teint, passe au salon.',[
  o('Changer de coiffure',()=>{look.y=nx(HAIR_STYLES,look.y||'court');}),o(look.b?'Se raser':'Laisser pousser la barbe',()=>{look.b=!look.b;}),o(look.g?'Enlever les lunettes':'Mettre des lunettes',()=>{look.g=!look.g;})]);}
function laptopPanel(R){drawLaptop(R.laptop,true);openPanel('Ordinateur','Cash '+fmt(state.cash)+' · Banque '+fmt(state.bank)+'.',[
  {label:'Banque en ligne : tout déposer',off:state.cash<=0,fn:()=>{state.bank+=state.cash;state.cash=0;toast('Virement effectué.','good');}},
  {label:'Banque en ligne : retirer '+fmt(50),off:state.bank<50,fn:()=>{state.bank-=50;state.cash+=50;toast('+$50 en cash.','good');}},
  {label:'Jouer en ligne · 1 h',fn:()=>{state.fun=Math.min(100,state.fun+20);state.energy=Math.max(0,state.energy-6);gameMin+=60;toast('Partie gagnée ! +20 humeur','good');}},
  {label:'Chercher un emploi',fn:()=>openSpot('job')}]);}
function tvToggle(R){const tv=R.tv;tv.ch=(tv.ch+1)%4;RIG7.on.tv=tv.ch>0;tv.scr.material.color.setHex(tv.ch?0xffffff:0x000000);toast(['Télé éteinte.','📺 Infos de Port-Aurore','📺 Match en direct','📺 Dessins animés'][tv.ch]);}
function curtainsToggle(R){R.curtClosed=!R.curtClosed;toast(R.curtClosed?'Rideaux fermés.':'Rideaux ouverts.');}
function danceAct(p){startAct({K:[{x:p.x,z:p.z,y:.1,h:camYaw+Math.PI,pose:'stand'},{x:p.x,z:p.z,y:.1,h:camYaw+Math.PI,pose:'dance',t:.4}],label:'Arrêter de danser',
  hold:(dt,a)=>{state.fun=Math.min(100,state.fun+2*dt);state.energy=Math.max(0,state.energy-.3*dt);if(!a.m){a.m=1;toast('Sur la piste ! L’humeur grimpe.','good');}a.K[a.K.length-1].y=.1+Math.abs(Math.sin(a.time*4.2))*.05;}});}
/* ----- effets : zzz, vapeur ----- */
const FX7={z:[],st:[]};
function spriteTxt(t,c){return ctex('spt'+t+c,64,64,(g)=>{g.fillStyle=c;g.font='700 46px Rajdhani, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,32,34);});}
function zzz7(dt,m){FX7.zt=(FX7.zt||0)-dt;if(FX7.zt<=0){FX7.zt=.9;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:spriteTxt('Z','#dfe8ff'),transparent:true,depthWrite:false}));s.scale.set(.3,.3,1);
    const hd=new THREE.Vector3(0,1.75,.1);m.localToWorld(hd);s.position.copy(hd);s.userData.t=0;scene.add(s);FX7.z.push(s);}
  FX7.z.forEach(s=>{s.userData.t+=dt;s.position.y+=dt*.25;s.position.x+=Math.sin(s.userData.t*3)*dt*.1;s.material.opacity=1-s.userData.t/2.6;s.scale.setScalar(.25+s.userData.t*.12);});
  FX7.z=FX7.z.filter(s=>{if(s.userData.t>2.6){scene.remove(s);s.material.dispose();return false;}return true;});}
function zzzClear(){FX7.z.forEach(s=>scene.remove(s));FX7.z=[];}
function steam7(dt,R,pan){FX7.stt=(FX7.stt||0)-dt;if(FX7.stt<=0){FX7.stt=.18;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:SHADOWT(),color:0xffffff,transparent:true,opacity:.0,depthWrite:false}));
    s.material.map=glowTex([[0,'rgba(255,255,255,.7)'],[1,'rgba(255,255,255,0)']]);const v=new THREE.Vector3(0,.08,0);pan.localToWorld(v);s.position.copy(v);s.userData.t=0;s.scale.setScalar(.15);scene.add(s);FX7.st.push(s);}
  FX7.st.forEach(s=>{s.userData.t+=dt;s.position.y+=dt*.35;s.scale.setScalar(.15+s.userData.t*.25);s.material.opacity=.45*(1-s.userData.t/1.6);});
  FX7.st=FX7.st.filter(s=>{if(s.userData.t>1.6){scene.remove(s);return false;}return true;});}
function steamClear(){FX7.st.forEach(s=>scene.remove(s));FX7.st=[];}
/* ----- écrans animés ----- */
function drawTV(tv,t){const g=tv.cv.getContext('2d'),W=320,H=180;
  if(tv.ch===1){g.fillStyle='#10295e';g.fillRect(0,0,W,H);g.fillStyle='#1d4f8a';g.fillRect(170,20,140,90);g.fillStyle='#ffd24a';g.fillRect(180,30,120,70);g.fillStyle='#10295e';g.font='700 20px sans-serif';g.fillText('PORT',205,62);g.fillText('AURORE',195,86);
    g.fillStyle='#2b2f3a';g.beginPath();g.arc(90,70,24,0,7);g.fill();g.fillRect(52,98,76,60);g.fillStyle='#d9a47c';g.beginPath();g.arc(90,66,20,0,7);g.fill();
    g.fillStyle='#c0392b';g.fillRect(0,140,W,40);g.fillStyle='#fff';g.font='700 18px sans-serif';const msg='  Trafic dense sur le boulevard Aurore · Le Club Néon affiche complet · Météo : '+WX[wx.i][1].toLowerCase()+' · ';g.fillText(msg+msg,-(t*60)%700,166);g.font='700 13px sans-serif';g.fillText('EN DIRECT',8,16);}
  else if(tv.ch===2){g.fillStyle='#2f8a3c';g.fillRect(0,0,W,H);for(let i=0;i<8;i++){g.fillStyle=i%2?'#2a7d36':'#33923f';g.fillRect(i*40,0,40,H);}g.strokeStyle='#e8f5e8';g.lineWidth=2;g.strokeRect(10,10,W-20,H-20);g.beginPath();g.moveTo(W/2,10);g.lineTo(W/2,H-10);g.stroke();g.beginPath();g.arc(W/2,H/2,26,0,7);g.stroke();
    for(let i=0;i<14;i++){g.fillStyle=i<7?'#d94f4f':'#3d7be0';g.beginPath();g.arc(W/2+Math.sin(t*.7+i*1.3)*(60+i*7),H/2+Math.cos(t*.9+i*2.1)*55,5,0,7);g.fill();}
    g.fillStyle='#fff';g.beginPath();g.arc(W/2+Math.sin(t*1.3)*90,H/2+Math.cos(t*1.7)*50,3.5,0,7);g.fill();g.fillStyle='rgba(0,0,0,.6)';g.fillRect(8,8,120,22);g.fillStyle='#fff';g.font='700 14px sans-serif';g.fillText('PA 1 - 0 LAG  '+(Math.floor(t)%90+1)+"'",14,24);}
  else if(tv.ch===3){const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#8fd3ff');gr.addColorStop(1,'#ffe6a8');g.fillStyle=gr;g.fillRect(0,0,W,H);g.fillStyle='#6ccf6c';g.fillRect(0,140,W,40);
    [['#ff6b9a',80,1.1],['#ffd24a',170,1.6],['#7a6bff',250,.9]].forEach((b,i)=>{const y=110-Math.abs(Math.sin(t*2*b[2]))*60;g.fillStyle=b[0];g.beginPath();g.ellipse(b[1],y,26,26-Math.abs(Math.cos(t*2*b[2]))*4,0,0,7);g.fill();
      g.fillStyle='#fff';g.beginPath();g.arc(b[1]-8,y-6,7,0,7);g.arc(b[1]+8,y-6,7,0,7);g.fill();g.fillStyle='#222';g.beginPath();g.arc(b[1]-7,y-5,3,0,7);g.arc(b[1]+9,y-5,3,0,7);g.fill();});}
  tv.t.needsUpdate=true;}
function drawLaptop(L,on){if(!L)return;L.sc.material.color.setHex(on?0xffffff:0x111111);if(!on)return;const g=L.cv.getContext('2d');const gr=g.createLinearGradient(0,0,256,160);gr.addColorStop(0,'#3d7be0');gr.addColorStop(1,'#8a5fc9');g.fillStyle=gr;g.fillRect(0,0,256,160);
  g.fillStyle='rgba(255,255,255,.92)';g.fillRect(30,22,196,110);g.fillStyle='#1d4f8a';g.fillRect(30,22,196,16);g.fillStyle='#fff';g.font='700 10px sans-serif';g.fillText('Banque Aurore · '+fmt(state.bank),36,33);
  g.strokeStyle='#4fb58a';g.lineWidth=2;g.beginPath();for(let i=0;i<10;i++)g.lineTo(42+i*18,110-Math.sin(i*.9+performance.now()*.001)*18-i*3);g.stroke();g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,148,256,12);L.t.needsUpdate=true;}
function drawECG(E,dt){E.x=(E.x+dt*90)%200;const g=E.cv.getContext('2d');if(!E.init){g.fillStyle='#04140c';g.fillRect(0,0,200,140);E.init=1;}
  g.fillStyle='#04140c';g.fillRect(E.x,0,14,140);const ph=(performance.now()*.0012)%1,y=ph<.06?70-Math.sin(ph/.06*Math.PI)*50:ph<.1?70+Math.sin((ph-.06)/.04*Math.PI)*16:70;
  g.fillStyle='#3cff8a';g.fillRect(E.x,y,2,2);g.font='700 22px sans-serif';g.fillStyle='#04140c';g.fillRect(140,8,60,26);g.fillStyle='#3cff8a';g.fillText('72',150,30);E.t.needsUpdate=true;}
function drawDance(D,t){const g=D.cv.getContext('2d'),n=8,s=256/n,beat=Math.floor(t*2.1);for(let i=0;i<n;i++)for(let j=0;j<n;j++){const k=(i*7+j*13+beat)%5;g.fillStyle=['#ff5fd2','#5aa9ff','#58d68d','#ffd24a','#1a1030'][k];g.fillRect(i*s+2,j*s+2,s-4,s-4);}D.t.needsUpdate=true;}
/* ----- figurants des intérieurs ----- */
function updateRoomCrowds7(R,dt,t){
  if(!R.crowd7)return;
  R.crowd7.forEach((p,i)=>{
    const m=p.mesh,u=m.userData,ph=t*p.speed+p.phase;
    if(p.kind==='dance'){
      m.position.y=.1+Math.abs(Math.sin(ph*1.5))*.09;m.rotation.y=p.h+Math.sin(ph*.8)*.22;
      u.armL.rotation.x=-.75+Math.sin(ph*1.2)*.35;u.armR.rotation.x=-.75+Math.sin(ph*1.2+1.4)*.35;
      u.armL.rotation.z=-1.45-Math.sin(ph)*.45;u.armR.rotation.z=1.45+Math.sin(ph+1)*.45;
      u.legL.rotation.x=Math.sin(ph*1.5)*.38;u.legR.rotation.x=-Math.sin(ph*1.5)*.38;
      u.kneeL.rotation.x=Math.max(0,-Math.sin(ph*1.5))*.55;u.kneeR.rotation.x=Math.max(0,Math.sin(ph*1.5))*.55;
    }else if(p.kind==='sit'){
      m.rotation.y=p.h+Math.sin(ph*.35)*.035;u.armL.rotation.x=-.55+Math.sin(ph*.8)*.035;u.armR.rotation.x=-.55-Math.sin(ph*.8)*.035;
    }else{
      animPerson(m,ph*.35,.015,false);m.rotation.y=p.h+Math.sin(ph*.45)*.025;m.position.y=.1+Math.sin(ph*1.3)*.012;
    }
  });
}
/* ----- mise à jour par image ----- */
let scrT7=0;
function updateLife7(dt,day){
  const R=player.inside||null;RIG7.room=R;
  if(VIEW7)VIEW7.color.setRGB(.08+.92*day,.1+.9*day,.18+.82*day);
  if(R){
    const pw=blackout>0?0:1;sun.intensity*=.12;RIG7.pw=pw;hemi.intensity*=.32;scene.environment=ENV7.inn;scene.environmentIntensity=(RIG7.on.main&&pw?.55:.12)+day*.25;
    if(!pw){RIG7.on.main=false;}else if(RIG7.bo){RIG7.on.main=true;}RIG7.bo=!pw;
    if(R.lights)R.lights.sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z));
    if(R.zones){let best=R.zones[0];R.zones.forEach(zn=>{if(Math.hypot(R.rx+zn[0]-player.x,R.rz+zn[1]-player.z)<Math.hypot(R.rx+best[0]-player.x,R.rz+best[1]-player.z))best=zn;});R.spot=best;}
    rigUpdate7(dt);cutUpdate7(dt);
    if(R.lamps){R.lamps.forEach(l=>l.emissiveIntensity=RIG7.on.bed?1.4:0);}if(R.flamp)R.flamp.emissiveIntensity=RIG7.on.lamp?1.2:0;
    if(R.curt)R.curt.forEach(c=>{const tg=R.curtClosed?c.userData.full:.5;c.scale.x+=(tg-c.scale.x)*Math.min(1,4*dt);});
    if(R.curtClosed)sun.intensity*=.3;
    scrT7-=dt;const t=performance.now()*.001;
    if(scrT7<=0){scrT7=.06;if(R.tv&&R.tv.ch)drawTV(R.tv,t);if(ACT&&ACT.typing&&R.laptop)drawLaptop(R.laptop,true);if(R.dance)drawDance(R.dance,t);}
    if(R.ecg)R.ecg.forEach(E=>drawECG(E,dt));
    if(R.decks)R.decks.forEach(d=>d.rotation.y+=dt*3.5);if(R.ball)R.ball.rotation.y+=dt*.8;
    if(R.beams)R.beams.forEach((b,i)=>{b.rotation.z=Math.sin(t*.9+i*1.7)*.5;b.rotation.x=Math.cos(t*.7+i)*.4;});
    if(R.meal)R.meal.visible=!!H7.meal;
    if(R.hang){const up=camera.position.y>R.H-.15;R.hang.forEach(h=>h.visible=!up);}
    if(R.clerk&&R.clerk.userData.armL)animPerson(R.clerk,t,0,false);
    updateRoomCrowds7(R,dt,t);
  }else{RIG7.room=null;rigUpdate7(dt);scene.environment=ENV7.out;}
}
/* ----- branchements ----- */
const _upl7=updatePlayer;updatePlayer=function(dt){if(ACT){actUpdate(dt);return;}_upl7(dt);};
const _upr7=updatePrompt;updatePrompt=function(){
  if(started&&player.inside&&!panelOpen&&!chatOpen){
    nearSpot=null;nearCar=null;nearPed=null;nearInt=null;let txt='';
    if(ACT)txt=ACT.state==='hold'||ACT.s>0?'E · '+(ACT.label||'Arrêter'):'';
    else{let bd=1e9;player.inside.ints.forEach(it=>{const d=Math.hypot(it.x-player.x,it.z-player.z);if(d<it.r&&d<bd){bd=d;nearInt=it;}});if(nearInt)txt='E · '+nearInt.label;}
    if(txt!==promptKey){promptKey=txt;const b=$('#prompt');b.hidden=!txt;b.textContent=txt;}return;}
  nearInt=null;_upr7();
};
const _int7=interact;interact=function(){
  if(!started||paused||panelOpen||chatOpen)return;
  if(ACT){if(ACT.state==='hold'||ACT.s>0)endAct();return;}
  if(player.inside&&nearInt){nearInt.fn();return;}
  _int7();
};
['#prompt','#b-act'].forEach(s=>$(s).addEventListener('click',e=>{e.stopImmediatePropagation();interact();},true));
enterInterior=function(s){
  const R=ROOMS[s.id];if(!R){openSpot(s.id);return;}
  if(blackout>0&&(s.id==='shop'||s.id==='club')){toast('Coupure de courant : fermé.','warn');return;}
  player.outside={x:s.x,z:s.z};player.inside=R;R.G.visible=true;if(sea)sea.visible=false;RIG7.room=R;RIG7.on.main=true;
  player.x=R.rx+R.entry.x;player.z=R.rz+R.entry.z;player.h=R.entry.h;camYaw=R.entry.h;camPitch=Math.max(camPitch,.72);camT=1;CAM7.init=0;
  toast(R.name,'good');
};
const _lv7=leaveInterior;leaveInterior=function(){const R=player.inside;if(!R)return;if(ACT){const a=ACT;ACT=null;a.end&&a.end(a);player.mesh.rotation.x=0;$('#act7').hidden=true;$('#sl7').classList.remove('on');}
  R.G.visible=false;RIG7.room=null;scene.environment=ENV7.out;if(sea)sea.visible=true;_lv7();};
const CAM7={p:new THREE.Vector3(),t:new THREE.Vector3(),init:0};
const _uc8=updateCamera;updateCamera=function(dt){
  if(!started||!player.inside||window.CAMO){_uc8(dt);return;}
  const P=new THREE.Vector3(),T=new THREE.Vector3();
  if(ACT&&ACT.cam&&(ACT.state==='hold'||ACT.s>=ACT.K.length-2)){P.copy(ACT.cam.p);T.copy(ACT.cam.t);}
  else{const pit=clamp(camPitch,.5,1.2),d=ACT&&!ACT.cam?4.6:5.6;T.set(player.x,1.05,player.z);P.set(player.x-Math.sin(camYaw)*Math.cos(pit)*d,1.05+Math.sin(pit)*d,player.z-Math.cos(camYaw)*Math.cos(pit)*d);}
  const k=CAM7.init?1-Math.exp(-6*dt):1;CAM7.init=1;CAM7.p.lerp(P,k);CAM7.t.lerp(T,k);camera.position.copy(CAM7.p);camera.lookAt(CAM7.t);
};
/* courses pour le frigo à la supérette */
superette=function(){market('Supérette','Soif '+Math.round(state.thirst)+' · Faim '+Math.round(state.hunger)+' · Frigo : '+H7.food+' portions.',[['water',2],['soda',3],['sand',8],['menu',15],['fish',12],['groc',10]],superette);};
IT.groc=['Courses pour le frigo (+3 portions)',()=>{H7.food+=3;toast('Le frigo est rempli : '+H7.food+' portions.','good');}];
/* interface */
(function(){const st=document.createElement('style');st.textContent=
 '#act7{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 128px);transform:translateX(-50%);min-width:180px;padding:8px 12px;border-radius:12px;background:rgba(10,16,24,.78);color:#fff;font:600 14px Barlow,sans-serif;text-align:center;z-index:7;pointer-events:none}'+
 '#act7 u{display:block;height:6px;margin-top:6px;border-radius:3px;background:rgba(255,255,255,.18);overflow:hidden}#act7 i{display:block;height:100%;width:0;background:#ffd24a;transition:width .1s linear}'+
 '#sl7{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1.2s;background:radial-gradient(ellipse at center,rgba(8,12,30,0) 35%,rgba(6,9,24,.82) 100%);z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:12vh;color:#e8eeff;font-family:Rajdhani,Barlow,sans-serif}'+
 '#sl7.on{opacity:1}#sl7 b{font-size:64px;letter-spacing:2px;font-weight:700;text-shadow:0 4px 24px rgba(0,0,0,.5)}#sl7 span{font:600 18px Barlow,sans-serif;opacity:.85}#sl7 button{pointer-events:auto;margin-top:14px;padding:10px 18px;border:0;border-radius:999px;background:#ffd24a;color:#1a1a1a;font:700 15px Barlow,sans-serif}';
 document.head.appendChild(st);
 const a=document.createElement('div');a.id='act7';a.hidden=true;a.innerHTML='<b></b><u><i></i></u>';$('#hud').appendChild(a);
 const s=document.createElement('div');s.id='sl7';s.innerHTML='<span>Tu dors…</span><b id="sl7-t">00:00</b><span id="sl7-e"></span><button type="button" id="sl7-w">Se réveiller (E)</button>';$('#app').appendChild(s);
 $('#sl7-w').addEventListener('click',()=>{if(ACT)endAct();});})();
