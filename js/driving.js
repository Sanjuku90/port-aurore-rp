'use strict';
/* ---------- conduite ---------- */
function getInput(){
  let x=0,z=0;
  if(keys.q||keys.a||keys.arrowleft)x-=1;if(keys.d||keys.arrowright)x+=1;
  if(keys.z||keys.w||keys.arrowup)z+=1;if(keys.s||keys.arrowdown)z-=1;
  x+=joy.x;z+=-joy.y;
  if(typeof GP19!=='undefined'&&GP19.on){x+=GP19.x;z-=GP19.y;if(!gpOverlay||!gpOverlay()) {if(GP19.dpad.l)x-=1;if(GP19.dpad.r)x+=1;if(GP19.dpad.u)z+=1;if(GP19.dpad.d)z-=1;}}
  const m=Math.hypot(x,z);if(m>1){x/=m;z/=m;}
  return {x,z};
}
function driveCarLegacy(c,dt){
  const inp=(panelOpen||chatOpen)?{x:0,z:0}:getInput();
  const thr=inp.z,steer=inp.x;
  if(thr>0.05){c.v+=(c.v<0?30:15)*(c.acc||1)*thr*dt;}
  else if(thr<-0.05){c.v+=(c.v>0.5?-28:-9)*(-thr)*dt;}
  else c.v-=Math.sign(c.v)*Math.min(Math.abs(c.v),3.2*dt);
  c.v-=c.v*0.3*dt;
  if((keys[' ']||(typeof GP19!=='undefined'&&GP19.on&&GP19.brake))&&!chatOpen)c.v-=Math.sign(c.v)*Math.min(Math.abs(c.v),32*dt);
  c.v=clamp(c.v,-8,c.top||27);
  const rate=steer*1.75*clamp(Math.abs(c.v)/5,0,1)*(1-0.55*Math.abs(c.v)/27)*(c.v>=0?1:-1);
  c.h-=rate*dt;
  c.x+=Math.sin(c.h)*c.v*dt;c.z+=Math.cos(c.h)*c.v*dt;
  const speed=Math.abs(c.v),hit=collideCarWorld(c);
  if(hit>0){
    c.v*=0.82;
    if(impactCd<=0&&speed>9){impactCd=0.6;const dmg=(speed-8)*1.1;state.health=Math.max(0,state.health-dmg);toast('Collision. −'+Math.round(dmg)+' de santé','bad');}
  }
  peds.forEach(p=>{
    if(speed>3&&Math.hypot(p.x-c.x,p.z-c.z)<1.7&&p.stun<=0){
      p.stun=2.5;p.wait=0;
      if(fineCd<=0){fineCd=5;const f=Math.min(60,state.cash+state.bank);takeMoney(f);toast('Piéton percuté. Amende '+fmt(f),'bad');say(p.mesh,'Hé ! Regardez où vous allez !',3);}
    }
  });
}
/* v54 : la vraie physique de conduite vit dans drive54.js ; l'ancienne reste en secours */
function driveCar(c,dt){if(window.DRV54&&DRV54.step)return DRV54.step(c,dt);return driveCarLegacy(c,dt);}
function takeMoney(a){const c=Math.min(state.cash,a);state.cash-=c;state.bank=Math.max(0,state.bank-(a-c));}
function updateNpc(c,dt){
  const fx=Math.sin(c.h),fz=Math.cos(c.h);let blocked=false;
  for(let i=0;i<cars.length&&!blocked;i++){
    const o=cars[i];if(o===c)continue;
    const dx=o.x-c.x,dz=o.z-c.z,ahead=dx*fx+dz*fz;
    if(ahead<=0||ahead>10)continue;
    if(Math.abs(dx*fz-dz*fx)>2.1)continue;
    if(o.kind==='npc'&&Math.sin(o.h)*fx+Math.cos(o.h)*fz<0.7)continue;
    blocked=true;
  }
  for(let i=0;i<peds.length&&!blocked;i++){
    const p=peds[i],dx=p.x-c.x,dz=p.z-c.z,ahead=dx*fx+dz*fz;
    if(ahead>0&&ahead<9&&Math.abs(dx*fz-dz*fx)<1.8)blocked=true;
  }
  if(!blocked&&redAhead(c))blocked=true;
  c.hk=(c.hk||0)-dt;
  if(blocked&&c.v<1&&c.hk<=0&&Math.random()<dt*0.15){c.hk=rand(6,14);const dd=Math.hypot(c.x-player.x,c.z-player.z);if(dd<50)honk(0.07*(1-dd/50));}
  const target=blocked?0:c.maxV;
  c.v+=clamp(target-c.v,-20*dt,5*dt);
  c.x+=fx*c.v*dt;c.z+=fz*c.v*dt;
  if(c.x>250)c.x=-250;else if(c.x<-250)c.x=250;
  if(c.z>185)c.z=-214;else if(c.z<-214)c.z=185;
}
function enterCar(c){
  player.car=c;c.kind='player';c.v=0;player.mesh.visible=false;
  $('#speed').hidden=false;if(window.DRV54&&DRV54.onEnter)DRV54.onEnter(c);toast(window.DRV54&&DRV54.touch?'Au volant · touche une flèche pour démarrer.':'Au volant · ZQSD/flèches, Espace drift, Maj nitro, H klaxon.');
}
function exitCar(){
  const c=player.car,rx=-Math.cos(c.h),rz=Math.sin(c.h),fx=Math.sin(c.h),fz=Math.cos(c.h);
  let x=c.x+rx*2.5,z=c.z+rz*2.5;
  for(const [a,b] of [[rx,rz],[-rx,-rz],[fx,fz],[-fx,-fz]]){const t={x:c.x+a*2.6,z:c.z+b*2.6};if(pushAABB(t,0.5)===0){x=t.x;z=t.z;break;}}
  if(window.DRV54&&DRV54.onExit)DRV54.onExit(c);player.x=x;player.z=z;player.h=c.h;c.kind='parked';c.v=0;player.car=null;player.mesh.visible=true;$('#speed').hidden=true;
}

