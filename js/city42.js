'use strict';
/* v42 · Nouvelle-Aurore vivante : vrais immeubles, trottoirs, éclairage, arbres, stationnement, passants et circulation. */
(function(){
const C={x:-2150,z:0};
const RX=[-380,-190,0,190,380].map(v=>C.x+v),RZ=[-360,-180,0,180,360].map(v=>C.z+v);
const CITY={walkers:[],traffic:[],built:false};
const nearRoad=(x,z,m)=>RX.some(r=>Math.abs(x-r)<m)||RZ.some(r=>Math.abs(z-r)<m);
const nearRail=(x,z)=>z>-172&&z<-128&&x<C.x+640;
const nearSpot=(x,z,m)=>spots.some(s=>Math.abs(s.x-x)<m&&Math.abs(s.z-z)<m);
function free(x,z,w,d,m){if(x-w/2<C.x-600||x+w/2>C.x+600||z-d/2<C.z-560||z+d/2>C.z+540)return false;
  for(const b of boxes){if(b.room)continue;if(x+w/2+m>b.x0&&x-w/2-m<b.x1&&z+d/2+m>b.z0&&z-d/2-m<b.z1)return false;}
  for(let k=-1;k<=1;k++)for(let q=-1;q<=1;q++){const px=x+k*w/2,pz=z+q*d/2;if(nearRoad(px,pz,13)||nearRail(px,pz))return false;}
  if(z>C.z+278&&z<C.z+362&&Math.abs(x-C.x)<420)return false;return !nearSpot(x,z,Math.max(w,d)/2+8);}
let seed=4242;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
function pavement(){const mat=new THREE.MeshLambertMaterial({map:tileTex('#a7a9a3')});const xs=[C.x-600].concat(RX,[C.x+600]),zs=[C.z-560].concat(RZ,[C.z+540]);
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){const x0=xs[i]+(i?10.5:0),x1=xs[i+1]-(i<xs.length-2?10.5:0),z0=zs[j]+(j?10.5:0),z1=zs[j+1]-(j<zs.length-2?10.5:0);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),mat);m.rotation.x=-Math.PI/2;m.position.set((x0+x1)/2,.03,(z0+z1)/2);m.receiveShadow=true;scene.add(m);}
  // passages piétons aux carrefours
  const zeb=new THREE.MeshLambertMaterial({color:0xf2f2ec}),G=new THREE.PlaneGeometry(1.1,6);let n=0;const im=new THREE.InstancedMesh(G,zeb,RX.length*RZ.length*4*6),D=new THREE.Object3D();
  RX.forEach(x=>RZ.forEach(z=>{[[0,-12,0],[0,12,0],[-12,0,1],[12,0,1]].forEach(([ox,oz,rot])=>{for(let k=-2.5;k<=2.5;k++){D.position.set(x+ox+(rot?0:k*1.9),.06,z+oz+(rot?k*1.9:0));D.rotation.set(-Math.PI/2,0,rot?Math.PI/2:0);D.updateMatrix();im.setMatrixAt(n++,D.matrix);}});}));
  im.count=n;im.instanceMatrix.needsUpdate=true;scene.add(im);}
function buildings(){let made=0;const want=96;
  for(let pass=0;pass<2&&made<want;pass++)for(let gx=C.x-585;gx<C.x+585&&made<want;gx+=pass?29:37)for(let gz=C.z-545;gz<C.z+525&&made<want;gz+=pass?31:39){
    const w=pass?16+Math.floor(rnd()*8):22+Math.floor(rnd()*12),d=pass?16+Math.floor(rnd()*8):20+Math.floor(rnd()*12),x=gx+rnd()*6,z=gz+rnd()*6;if(!free(x,z,w,d,4))continue;
    const center=1-Math.min(1,Math.hypot(x-C.x,z-C.z)/600),h=12+Math.round((center*36+rnd()*14)/4)*4;
    addBuilding(x,z,w,d,h,Math.floor(rnd()*12),{balcony:rnd()<.55,roof:h<=16&&rnd()<.5?'gable':null,setback:h>=32});made++;}
  if(DECO.length){const m=new THREE.Mesh(mergeParts(DECO),decoMat);m.castShadow=true;m.receiveShadow=true;scene.add(m);DECO.length=0;}
  return made;}
function lamps(){const pts=[];RX.forEach(x=>{for(let z=C.z-550;z<C.z+530;z+=34){if(RZ.some(r=>Math.abs(z-r)<14))continue;pts.push([x-9.6,z,0]);pts.push([x+9.6,z+17,Math.PI]);}});
  RZ.forEach(z=>{for(let x=C.x-590;x<C.x+590;x+=34){if(RX.some(r=>Math.abs(x-r)<14))continue;pts.push([x,z-9.6,Math.PI/2]);pts.push([x+17,z+9.6,-Math.PI/2]);}});
  const pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.09,.13,6,6),new THREE.MeshLambertMaterial({color:0x3a3f45}),pts.length),arm=new THREE.InstancedMesh(new THREE.BoxGeometry(.1,.1,1.6),new THREE.MeshLambertMaterial({color:0x3a3f45}),pts.length);
  const headMat=new THREE.MeshBasicMaterial({color:0xfff0c8}),head=new THREE.InstancedMesh(new THREE.BoxGeometry(.5,.14,.7),headMat,pts.length),D=new THREE.Object3D();
  pts.forEach(([x,z,r],i)=>{D.rotation.set(0,r,0);D.position.set(x,3,z);D.updateMatrix();pole.setMatrixAt(i,D.matrix);const fx=Math.sin(r)*-.75,fz=Math.cos(r)*-.75;
    D.position.set(x+fx,5.95,z+fz);D.updateMatrix();arm.setMatrixAt(i,D.matrix);D.position.set(x+fx*1.9,5.85,z+fz*1.9);D.updateMatrix();head.setMatrixAt(i,D.matrix);});
  [pole,arm,head].forEach(m=>{m.instanceMatrix.needsUpdate=true;scene.add(m);});CITY.lampMat=headMat;return pts.length;}
function trees(){const pts=[];RX.forEach(x=>{for(let z=C.z-540;z<C.z+520;z+=26){const zz=z+13;if(!RZ.some(r=>Math.abs(zz-r)<16)&&!nearRail(x,zz))pts.push([x-12.4,zz],[x+12.4,zz-6]);}});
  RZ.forEach(z=>{for(let x=C.x-580;x<C.x+580;x+=26){const xx=x+13;if(!RX.some(r=>Math.abs(xx-r)<16))pts.push([xx,z-12.4],[xx-6,z+12.4]);}});
  const ok=pts.filter(([x,z])=>!boxes.some(b=>!b.room&&x>b.x0-1.5&&x<b.x1+1.5&&z>b.z0-1.5&&z<b.z1+1.5)&&!nearSpot(x,z,3));
  const im=new THREE.InstancedMesh(treeGeo(rnd()<.5?'round':'flam'),decoMat,ok.length),D=new THREE.Object3D();ok.forEach(([x,z],i)=>{const s=.75+rnd()*.35;D.position.set(x,0,z);D.rotation.set(0,rnd()*6.28,0);D.scale.set(s,s,s);D.updateMatrix();im.setMatrixAt(i,D.matrix);});
  im.instanceMatrix.needsUpdate=true;im.castShadow=true;scene.add(im);return ok.length;}
function parked(){const types=['sedan','toyota','bmw','benz','hyundai','honda','suv','jeep'];let n=0;
  RX.forEach(x=>{for(let z=C.z-520;z<C.z+500;z+=23){if(rnd()>.33||RZ.some(r=>Math.abs(z-r)<22)||nearRail(x,z))continue;const side=rnd()<.5?-1:1;const c=addCar(x+side*6.4,z,side<0?0:Math.PI,pick(CAR_COLORS),'parked',pick(types));c.fuel=60+Math.round(rnd()*40);n++;}});return n;}
function walkers(){const routes=[];RX.forEach(x=>{routes.push({ax:x-8,az:C.z-500,bx:x-8,bz:C.z+480});routes.push({ax:x+8,az:C.z+480,bx:x+8,bz:C.z-500});});RZ.forEach(z=>{routes.push({ax:C.x-560,az:z-8,bx:C.x+560,bz:z-8});});
  for(let i=0;i<34;i++){const r=routes[i%routes.length],m=makePerson(pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{style:pick(['court','long','afro','chignon','queue','ras']),top:pick(['tee','long','veste','sweat']),bottom:pick(['pantalon','short','jupe']),bag:rnd()<.3});
    m.traverse(o=>{if(o.isMesh)o.castShadow=false;});scene.add(m);CITY.walkers.push({m,r,t:rnd(),sp:(1.2+rnd()*.5)/Math.hypot(r.bx-r.ax,r.bz-r.az),dir:rnd()<.5?1:-1,ph:rnd()*6});}}
function traffic(){const L=3.4,xs=[C.x-190,C.x+190],zs=[C.z-180,C.z+180];
  const loop=[[xs[0]+L,zs[0]],[xs[0]+L,zs[1]],[xs[1]-L,zs[1]],[xs[1]-L,zs[0]]].map(([x,z])=>({x,z}));
  const outer=[[C.x-380+L,C.z-360],[C.x-380+L,C.z+360],[C.x+380-L,C.z+360],[C.x+380-L,C.z-360]].map(([x,z])=>({x,z}));
  [[loop,5],[outer,6]].forEach(([path,n])=>{let per=0;for(let i=0;i<path.length;i++){const a=path[i],b=path[(i+1)%path.length];per+=Math.hypot(b.x-a.x,b.z-a.z);}
    for(let k=0;k<n;k++){const c=addCar(path[0].x,path[0].z,0,pick(CAR_COLORS),'script',pick(['sedan','toyota','bmw','suv','taxi','hyundai']));c.path=path;c.per=per;c.s=per*k/n;c.v=0;c.cruise=10+rnd()*3;CITY.traffic.push(c);}});}
function along(c){let s=((c.s%c.per)+c.per)%c.per;for(let i=0;i<c.path.length;i++){const a=c.path[i],b=c.path[(i+1)%c.path.length],L=Math.hypot(b.x-a.x,b.z-a.z);if(s<=L){const t=s/L;return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,h:Math.atan2(b.x-a.x,b.z-a.z),rem:L-s};}s-=L;}return {x:c.path[0].x,z:c.path[0].z,h:0,rem:0};}
function tick(dt){if(!CITY.built)return;const cx=camera.position.x,cz=camera.position.z,inCity=Math.abs(cx-C.x)<760&&Math.abs(cz-C.z)<700;
  CITY.walkers.forEach(w=>{const vis=inCity&&Math.abs(w.m.position.x-cx)<120&&Math.abs(w.m.position.z-cz)<120&&!player.inside;w.m.visible=vis;if(!inCity)return;
    w.t+=w.sp*dt*w.dir;if(w.t>1){w.t=1;w.dir=-1;}if(w.t<0){w.t=0;w.dir=1;}const r=w.r,x=r.ax+(r.bx-r.ax)*w.t,z=r.az+(r.bz-r.az)*w.t;w.m.position.set(x,.1,z);w.m.rotation.y=Math.atan2((r.bx-r.ax)*w.dir,(r.bz-r.az)*w.dir);if(vis){w.ph+=dt*4.4;animPerson(w.m,w.ph,.6,false);}});
  CITY.traffic.forEach(c=>{if(c===player.car)return;if(!inCity){c.mesh.visible=false;return;}let target=c.cruise;const p=along(c);if(p.rem<16)target=Math.min(target,5.5);
    const fx=Math.sin(p.h),fz=Math.cos(p.h);for(const o of cars){if(o===c)continue;const dx=o.x-c.x,dz=o.z-c.z;if(Math.abs(dx)>14||Math.abs(dz)>14)continue;const ahead=dx*fx+dz*fz;if(ahead>0&&ahead<11&&Math.abs(dx*fz-dz*fx)<2.2){target=0;break;}}
    if(!player.car&&Math.hypot(player.x-c.x,player.z-c.z)<5&&((player.x-c.x)*fx+(player.z-c.z)*fz)>0)target=0;
    c.v+=clamp(target-c.v,-14*dt,4*dt);c.s+=c.v*dt;const q=along(c);c.x=q.x;c.z=q.z;c.h+=angDiff(c.h,q.h)*Math.min(1,dt*5);c.mesh.visible=true;});}
const _bd=buildDecor;buildDecor=function(){_bd();try{pavement();const nb=buildings(),nl=lamps(),nt=trees(),np=parked();walkers();traffic();CITY.built=true;CITY.stats={buildings:nb,lamps:nl,trees:nt,parked:np};}catch(e){console.warn('city42',e);}};
const _up=update;update=function(dt){_up(dt);try{tick(dt);}catch(e){if(!CITY.err){CITY.err=1;console.warn('city42 tick',e);}}};
window.CITY42=CITY;
})();
