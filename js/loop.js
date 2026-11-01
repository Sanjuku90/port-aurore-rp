'use strict';
/* ---------- boucle ---------- */
function update(dt){
  gameMin+=dt*0.4;impactCd-=dt;fineCd-=dt;
  if(started){cutCd-=dt;if(blackout>0){blackout-=dt;if(blackout<=0)toast('Le courant est revenu.','good');}else if(cutCd<=0){blackout=rand(35,60);cutCd=rand(150,260);toast('Coupure de courant ! Les commerces ferment.','warn');}}
  $('#app').classList.toggle('cut',blackout>0);
  if(started){updatePlayer(dt);updateMission(dt);needs(dt);}
  cars.forEach(c=>{
    if(c.kind==='npc')updateNpc(c,dt);
    c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.h;
    const ac=(c.v-(c.pv||0))/Math.max(dt,0.001);c.pv=c.v;c.pt=(c.pt||0)+(clamp(-ac*0.004,-0.05,0.05)-(c.pt||0))*Math.min(1,8*dt);c.mesh.rotation.x=c.pt;
    const w=c.mesh.userData.wheels;for(let i=0;i<Math.min(4,w.length);i++)w[i].rotation.x+=c.v*dt/(c.type==='motorcycle'||c.type==='scooter'?0.32:0.36);
  });
  peds.forEach(p=>updatePed(p,dt));
  const tt=performance.now()*0.003;
  spots.forEach(s=>{s.b.material.opacity=0.24+0.1*Math.sin(tt+s.x);});
  if(beam.visible)beam.material.opacity=0.28+0.08*Math.sin(tt*1.5);
  if(started){
    if(wp&&Math.hypot(player.x-wp.x,player.z-wp.z)<5){toast('Arrivé : '+wp.l,'good');wp=null;}
    if(state.friends.length&&blackout<=0){msgCd-=dt;if(msgCd<=0){msgCd=rand(70,150);incoming(pick(state.friends));}}
  }
  wpBeam.visible=!!wp;if(wp){wpBeam.position.x=wp.x;wpBeam.position.z=wp.z;}
  clouds.forEach(c=>{c.position.x+=dt*1.5;if(c.position.x>320)c.position.x=-320;});
  updateBubbles();updateEnv();updatePhase2(dt);updateDecor(dt);updateCamera(dt);
  if(started){
    updatePrompt();
    hudT-=dt;if(hudT<=0){hudT=0.2;updateHud();}
    miniT-=dt;if(miniT<=0){miniT=0.05;updateMini();}
    if(engGain)engineUpdate19();
  }
}
let last=performance.now();
function loop(now){
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(built&&!paused)update(dt);
  renderer.render(scene,camera);
  if(shotReq){shotReq=false;try{gallery.unshift(renderer.domElement.toDataURL('image/jpeg',0.7));gallery.length=Math.min(gallery.length,8);}catch(e){}}
  requestAnimationFrame(loop);
}

