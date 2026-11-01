'use strict';
/* ---------- collisions ---------- */
function pushAABB(p,r){
  let hit=0;
  for(let i=0;i<boxes.length;i++){
    const b=boxes[i];
    if(p.x<b.x0-r||p.x>b.x1+r||p.z<b.z0-r||p.z>b.z1+r)continue;
    const cx=clamp(p.x,b.x0,b.x1),cz=clamp(p.z,b.z0,b.z1);
    const dx=p.x-cx,dz=p.z-cz,d2=dx*dx+dz*dz;
    if(d2>=r*r)continue;
    if(d2>1e-8){const d=Math.sqrt(d2),pen=r-d;p.x+=dx/d*pen;p.z+=dz/d*pen;hit=Math.max(hit,pen);}
    else{
      const l=p.x-b.x0,rr=b.x1-p.x,t=p.z-b.z0,bt=b.z1-p.z,m=Math.min(l,rr,t,bt);
      if(m===l)p.x=b.x0-r;else if(m===rr)p.x=b.x1+r;else if(m===t)p.z=b.z0-r;else p.z=b.z1+r;
      hit=Math.max(hit,r);
    }
  }
  return hit;
}
function collideCarWorld(c){
  let hit=0;
  [-1.4,0,1.4].forEach(o=>{
    const cx=c.x+Math.sin(c.h)*o,cz=c.z+Math.cos(c.h)*o,p={x:cx,z:cz};
    const h=pushAABB(p,1.05);
    if(h>0){c.x+=p.x-cx;c.z+=p.z-cz;hit=Math.max(hit,h);}
  });
  cars.forEach(o=>{
    if(o===c)return;
    if(Math.abs(o.x-c.x)>6||Math.abs(o.z-c.z)>6)return;
    const oc=carCircles(o),sc=carCircles(c);
    for(let a=0;a<3;a++)for(let b=0;b<3;b++){
      const dx=sc[a].x-oc[b].x,dz=sc[a].z-oc[b].z,d=Math.hypot(dx,dz);
      if(d<2.1&&d>0.001){const pen=2.1-d;c.x+=dx/d*pen*0.5;c.z+=dz/d*pen*0.5;hit=Math.max(hit,pen);}
    }
  });
  {const B=worldB27(c.x);c.x=clamp(c.x,B[0],B[1]);c.z=clamp(c.z,B[2],B[3]);}
  return hit;
}

