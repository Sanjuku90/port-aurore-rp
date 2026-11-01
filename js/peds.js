'use strict';
/* ---------- habitants ---------- */
function spawnPed(){
  const ix=Math.floor(Math.random()*nodeX.length),iz=Math.floor(Math.random()*nodeZ.length);
  const mesh=makePerson(pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS));const sc=rand(0.9,1.07);mesh.scale.set(sc,sc,sc);scene.add(mesh);mesh.traverse(o=>{if(o.isMesh)o.castShadow=false;});mesh.children[0].castShadow=true;
  const p={mesh,ix,iz,pi:-1,pj:-1,ti:0,tj:0,x:nodeX[ix],z:nodeZ[iz],speed:rand(1.1,1.7),wait:rand(0,3),stun:0,phase:rand(0,6),name:pick(NAMES),chat:rand(8,30),h:0};
  chooseNext(p);peds.push(p);
}
function chooseNext(p){
  const o=[];[[1,0],[-1,0],[0,1],[0,-1]].forEach(a=>{const i=p.ix+a[0],j=p.iz+a[1];if(i>=0&&i<nodeX.length&&j>=0&&j<nodeZ.length)o.push([i,j]);});
  let f=o.filter(t=>!(t[0]===p.pi&&t[1]===p.pj));if(!f.length)f=o;
  const t=pick(f);p.ti=t[0];p.tj=t[1];
}
function updatePed(p,dt){
  const vis=Math.abs(p.x-camera.position.x)<130&&Math.abs(p.z-camera.position.z)<130;p.mesh.visible=vis;
  if(p.stun>0){p.stun-=dt;if(vis)animPerson(p.mesh,p.phase,0);}
  else if(p.wait>0){p.wait-=dt;if(vis)animPerson(p.mesh,p.phase,0);}
  else{
    const tx=nodeX[p.ti],tz=nodeZ[p.tj],dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz),st=p.speed*dt;
    if(d<=st){p.x=tx;p.z=tz;p.pi=p.ix;p.pj=p.iz;p.ix=p.ti;p.iz=p.tj;chooseNext(p);if(Math.random()<0.3)p.wait=rand(1,4);}
    else{p.x+=dx/d*st;p.z+=dz/d*st;const th=Math.atan2(dx,dz);p.h+=angDiff(p.h,th)*Math.min(1,10*dt);p.phase+=st*3.2;if(vis)animPerson(p.mesh,p.phase,0.65);}
  }
  p.mesh.position.set(p.x,0.1,p.z);p.mesh.rotation.y=p.h;
  p.chat-=dt;
  if(p.chat<0){p.chat=rand(10,28);if(started&&Math.hypot(p.x-player.x,p.z-player.z)<30){const t=pick(LINES);say(p.mesh,t,5);addChat(p.name,t);tone(240+Math.random()*180,0.07,'triangle',0.025);}}
}

