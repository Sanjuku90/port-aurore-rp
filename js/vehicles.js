'use strict';
/* ---------- voitures ---------- */
function makeCar(color,type){
  const g=new THREE.Group(),P=[];
  const box=(w,h,d,x,y,z,c)=>P.push(part(new THREE.BoxGeometry(w,h,d),x,y,z,c));
  box(1.9,0.5,4.2,0,0.62,0,color);
  box(1.86,0.18,1.3,0,0.93,1.35,color);
  box(1.86,0.16,0.9,0,0.92,-1.55,color);
  box(1.98,0.2,0.18,0,0.42,2.15,0x1b1b1b);box(1.98,0.2,0.18,0,0.42,-2.15,0x1b1b1b);
  box(1.0,0.12,0.05,0,0.68,2.12,0x202225);
  box(0.5,0.12,0.03,0,0.46,2.25,0xe6e6e0);
  box(0.12,0.1,0.2,-1.0,1.05,0.55,color);box(0.12,0.1,0.2,1.0,1.05,0.55,color);
  box(0.1,0.08,0.02,-1.0,1.05,0.66,0x9fb4c8);box(0.1,0.08,0.02,1.0,1.05,0.66,0x9fb4c8);
  box(0.9,0.2,0.04,0,0.62,2.12,0x15171a);for(let i=0;i<3;i++)box(0.86,0.02,0.05,0,0.55+i*0.07,2.13,0x5a5f66);
  box(0.5,0.13,0.03,0,0.44,-2.25,0xe6e6e0);box(0.3,0.02,0.04,0,0.47,-2.26,0x2e6fd1);
  box(1.92,0.42,0.02,0,0.62,0.42,shade(color,0.55));box(1.92,0.42,0.02,0,0.62,-0.82,shade(color,0.55));
  box(0.04,0.04,0.18,-0.97,0.78,0.15,0x9aa0a6);box(0.04,0.04,0.18,0.97,0.78,0.15,0x9aa0a6);box(0.04,0.04,0.18,-0.97,0.78,-1.05,0x9aa0a6);box(0.04,0.04,0.18,0.97,0.78,-1.05,0x9aa0a6);
  [1.35,-1.35].forEach(z=>{box(0.05,0.12,0.98,-0.96,0.82,z,0x1b1d20);box(0.05,0.12,0.98,0.96,0.82,z,0x1b1d20);});
  box(1.94,0.1,1.6,0,0.38,0,0x1b1d20);
  box(0.16,0.03,0.06,-0.75,0.4,-2.2,0x9aa0a6);
  const cab=new THREE.BoxGeometry(1.7,0.62,2.3),pa=cab.attributes.position;
  for(let i=0;i<pa.count;i++)if(pa.getY(i)>0){pa.setX(i,pa.getX(i)*0.86);pa.setZ(i,pa.getZ(i)*0.82);}
  cab.computeVertexNormals();
  P.push(part(cab,0,1.18,-0.15,0x25405a));
  box(1.46,0.07,1.88,0,1.52,-0.15,color);
  if(type==='danfo'){box(1.95,0.16,4.25,0,0.78,0,0x111111);box(1.0,0.2,0.04,0,1.22,2.0,0x111111);}
  if(type==='taxi'){box(0.56,0.16,0.3,0,1.62,-0.15,0xffffff);box(1.93,0.07,4.22,0,0.86,0,0x111111);}
  if(type==='sport'){box(1.7,0.06,0.4,0,1.08,-2.05,0x15151a);box(0.08,0.2,0.1,-0.7,0.98,-2.0,0x15151a);box(0.08,0.2,0.1,0.7,0.98,-2.0,0x15151a);box(0.3,0.02,4.2,0,0.88,0,0xf2f2f2);}
  if(type==='suv'){box(0.06,0.06,1.9,-0.7,1.58,-0.15,0x202226);box(0.06,0.06,1.9,0.7,1.58,-0.15,0x202226);}
  g.add(new THREE.Mesh(mergeParts(P),carPaint));
  const L=[];
  [-0.65,0.65].forEach(x=>{
    L.push(part(new THREE.BoxGeometry(0.42,0.15,0.06),x,0.76,2.1,0xfff2c0));
    L.push(part(new THREE.BoxGeometry(0.42,0.13,0.06),x,0.78,-2.11,0xff2a1f));
  });
  g.add(new THREE.Mesh(mergeParts(L),lightsMat));
  g.userData.wheels=[];
  const tire=new THREE.CylinderGeometry(0.36,0.36,0.26,16);tire.rotateZ(Math.PI/2);
  const rim=new THREE.CylinderGeometry(0.2,0.2,0.28,10);rim.rotateZ(Math.PI/2);
  const wg=mergeParts([part(tire,0,0,0,0x141414),part(rim,0,0,0,0xb9bdc4),
    part(new THREE.BoxGeometry(0.29,0.36,0.05),0,0,0,0x30343a),part(new THREE.BoxGeometry(0.29,0.05,0.36),0,0,0,0x30343a)]);
  [[-0.95,1.35],[0.95,1.35],[-0.95,-1.35],[0.95,-1.35]].forEach(p=>{
    const w=new THREE.Mesh(wg,vcLamb);w.position.set(p[0],0.36,p[1]);g.add(w);g.userData.wheels.push(w);
  });
  castAll(g);return g;
}
function addCar(x,z,h,color,kind,type){type=type||'sedan';
  const mesh=makeCar(color,type);applyType(mesh,type);mesh.rotation.order='YXZ';mesh.position.set(x,0,z);mesh.rotation.y=h;scene.add(mesh);
  const c={mesh,x,z,h,v:0,kind,lane:null,maxV:0,dmgT:0,type,top:CT[type][3],acc:CT[type][4]};cars.push(c);return c;
}
function carCircles(c){const s=Math.sin(c.h),co=Math.cos(c.h);return [-1.4,0,1.4].map(o=>({x:c.x+s*o,z:c.z+co*o}));}

