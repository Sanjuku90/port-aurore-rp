'use strict';
/* ---------- joueur ---------- */
function resolvePlayer(){
  const p={x:player.x,z:player.z};pushAABB(p,0.45);
  for(let i=0;i<cars.length;i++){const c=cars[i];
    if(Math.abs(c.x-p.x)>4||Math.abs(c.z-p.z)>4)continue;
    carCircles(c).forEach(o=>{const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<1.5&&d>0.001){p.x+=dx/d*(1.5-d);p.z+=dz/d*(1.5-d);}});
  }
  const B=player.inside?player.inside.b:[-252,252,-252,207];player.x=clamp(p.x,B[0],B[1]);player.z=clamp(p.z,B[2],B[3]);
}
function updatePlayer(dt){
  if(player.car){const c=player.car;driveCar(c,dt);player.x=c.x;player.z=c.z;player.h=c.h;player.amp=0;return;}
  const inp=(panelOpen||chatOpen)?{x:0,z:0}:getInput(),mag=Math.hypot(inp.x,inp.z);
  const sp=(running||keys.shift||(typeof GP19!=='undefined'&&GP19.on&&GP19.run))?7.2:3.9,ox=player.x,oz=player.z;
  if(mag>0.05){
    const fx=Math.sin(camYaw),fz=Math.cos(camYaw),rx=-Math.cos(camYaw),rz=Math.sin(camYaw);
    let dx=fx*inp.z+rx*inp.x,dz=fz*inp.z+rz*inp.x;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;
    const spd=sp*Math.min(1,mag),n=Math.max(1,Math.ceil(spd*dt/0.15));
    for(let i=0;i<n;i++){player.x+=dx*spd*dt/n;player.z+=dz*spd*dt/n;resolvePlayer();}
    player.h+=angDiff(player.h,Math.atan2(dx,dz))*Math.min(1,12*dt);
  }else resolvePlayer();
  const real=Math.hypot(player.x-ox,player.z-oz)/Math.max(dt,0.001);
  player.moving+=(real-player.moving)*Math.min(1,10*dt);
  const run=player.moving>5.2;
  player.walk+=player.moving*dt*(run?1.9:2.3);
  const target=player.moving>0.3?0.45+0.4*Math.min(1,player.moving/7):0;
  player.amp=(player.amp||0)+(target-(player.amp||0))*Math.min(1,12*dt);
  const m=player.mesh;m.rotation.order='YXZ';
  m.position.set(player.x,0.1+Math.abs(Math.sin(player.walk))*player.amp*(run?0.12:0.07),player.z);
  m.rotation.y=player.h;m.rotation.x+=((run?0.14:0.03*(player.amp>0.1?1:0))-m.rotation.x)*Math.min(1,8*dt);
  animPerson(m,player.walk,player.amp,run);
}

