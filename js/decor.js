'use strict';
/* ---------- décor v4 : arbres, lampadaires, fontaine, parc, port, phare, bateaux, mouettes, collines ---------- */
const decoMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const EXTRA_TREES=[],FX={jets:null,flags:[],boats:[],gulls:[],beam:null,lantern:null,halo:null,waterTex:[],park:null};
function ppE(g,x,y,z,c,sx,sy,sz,rx,ry,rz,ord){
  const e=new THREE.Euler(rx||0,ry||0,rz||0,ord||'YXZ'),q=new THREE.Quaternion().setFromEuler(e);
  return {g:g,m:new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(sx||1,sy||sx||1,sz||sx||1)),c:c};
}
/* feuillage organique : icosaèdre bosselé à facettes */
function blob(r,seed){
  let g=new THREE.IcosahedronGeometry(r,1);if(g.index)g=g.toNonIndexed();
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+0.16*Math.sin(x*5.3+seed)*Math.cos(z*4.7+y*3.9+seed*0.7);p.setXYZ(i,x*k,y*k*0.92,z*k);}
  g.computeVertexNormals();return g;
}
function treeGeo(type){
  const P=[],T=0x6b4a2a;
  if(type==='round'){
    P.push(pp(cyl(0.16,0.27,2.8,7),0,1.4,0,T));P.push(pp(cyl(0.07,0.1,1.3,5),0.45,2.6,0,T,1,1,1,0,0,-0.7));
    [[0,3.6,0,1.55,0x3f8f4a],[0.95,3.15,0.35,1.1,0x4b9a45],[-0.85,3.3,-0.35,1.15,0x2f7a3d],[0.1,4.45,-0.15,1.05,0x58a24f],[-0.2,3.2,0.9,0.95,0x3a8544]].forEach((b,i)=>P.push(pp(blob(b[3],i*1.7),b[0],b[1],b[2],b[4])));
  }else if(type==='flam'){
    P.push(pp(cyl(0.18,0.28,2.4,7),0,1.2,0,0x5a3d26));
    [[0.9,2.6,0,0.5],[-0.9,2.6,0,-0.5]].forEach(b=>P.push(pp(cyl(0.07,0.1,1.6,5),b[0]*0.5,b[1],b[2],0x5a3d26,1,1,1,0,0,b[3]*1.4)));
    [[0,3.4,0,2.1,0xd9482b],[1.4,3.2,0.4,1.3,0xe8622f],[-1.4,3.25,-0.3,1.35,0xc93b25],[0.2,3.3,1.3,1.2,0xef7a3a],[-0.3,3.35,-1.3,1.2,0xd9482b],[0.3,3.9,0.1,1.2,0x4f8a3c]].forEach((b,i)=>P.push(pp(blob(b[3],i*2.3),b[0],b[1],b[2],b[4],1,0.55,1)));
  }else if(type==='pine'){
    P.push(pp(cyl(0.13,0.2,1.6,6),0,0.8,0,T));
    [[1.6,2.3,2.0,0x2f6b3a],[1.25,2.0,3.1,0x2a6034],[0.85,1.7,4.1,0x356f3d],[0.45,1.2,4.9,0x2f6b3a]].forEach(c=>P.push(pp(new THREE.ConeGeometry(c[0],c[1],8),0,c[2],0,c[3])));
  }else if(type==='palm'){
    let x=0,y=0,ang=0;
    for(let i=0;i<7;i++){const h=0.95;ang+=0.055;const cx=x+Math.sin(ang)*h/2,cy=y+Math.cos(ang)*h/2;
      P.push(pp(cyl(0.16-i*0.008,0.2-i*0.008,h,7),cx,cy,0,i%2?0x8a6b48:0x7a5c3c,1,1,1,0,0,-ang));
      x+=Math.sin(ang)*h;y+=Math.cos(ang)*h;}
    for(let f=0;f<9;f++){const yaw=f/9*Math.PI*2+0.2;
      for(let j=0;j<3;j++){const dist=0.55+j*0.85,droop=0.15+j*0.42,py=y-(j*j*0.18);
        P.push(ppE(UBX,x+Math.sin(yaw)*dist,py,Math.cos(yaw)*dist,j===2?0x5f9a3c:0x3f8a3a,0.65-j*0.15,0.05,0.95,droop,yaw,0));}}
    [[0.18,0],[-0.12,0.15],[0,-0.18]].forEach(c=>P.push(pp(sph(0.13,6,5),x+c[0],y-0.2,c[1],0x6b4a1e)));
  }
  return mergeParts(P);
}
function plantTrees(list){
  list=list.concat(EXTRA_TREES);
  const G={},types=['round','flam','pine','palm'];
  types.forEach(t=>G[t]=[]);
  list.forEach(t=>{
    let ty=t.type;
    if(!ty){
      if(t.park)ty=Math.random()<0.25?'pine':Math.random()<0.2?'flam':'round';
      else if(t.z>48)ty='palm';
      else if(t.z<-48)ty=Math.random()<0.55?'pine':'round';
      else ty=Math.random()<0.4?'flam':'round';
    }
    G[ty].push(t);
    if(!t.park&&!t.noPit){dbox(t.x,0.17,t.z,1.5,0.04,1.5,0x3b2f25);dbox(t.x,0.2,t.z-0.72,1.56,0.08,0.1,0x6f7378);dbox(t.x,0.2,t.z+0.72,1.56,0.08,0.1,0x6f7378);dbox(t.x-0.72,0.2,t.z,0.1,0.08,1.4,0x6f7378);dbox(t.x+0.72,0.2,t.z,0.1,0.08,1.4,0x6f7378);}
    boxes.push({x0:t.x-0.3,x1:t.x+0.3,z0:t.z-0.3,z1:t.z+0.3});
  });
  const mat=new THREE.MeshLambertMaterial({vertexColors:true});
  types.forEach(ty=>{
    const L=G[ty];if(!L.length)return;
    const im=new THREE.InstancedMesh(treeGeo(ty),mat,L.length);
    L.forEach((t,i)=>{dummy.position.set(t.x,0.16,t.z);dummy.rotation.set(0,rand(0,6.28),0);const s=t.s*(ty==='palm'?1.25:1);dummy.scale.set(s,s*rand(0.92,1.1),s);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);
      const v=rand(0.85,1.12);im.setColorAt(i,new THREE.Color(v,v*rand(0.97,1.03),v));});
    im.instanceMatrix.needsUpdate=true;im.instanceColor.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;scene.add(im);
  });
}
/* lampadaires à crosse */
function buildLamps(lamps){
  const pole=mergeParts([pp(cyl(0.2,0.24,0.5,10),0,0.25,0,0x2e3338),pp(cyl(0.075,0.1,5.2,8),0,2.9,0,0x3a3f47),pp(UBX,0,5.45,0.55,0x3a3f47,0.08,0.08,1.2),
    pp(UBX,0,5.25,0.12,0x3a3f47,0.07,0.4,0.07,-0.6,0,0),pp(UBX,0,5.42,1.25,0x23272c,0.46,0.16,0.72),pp(cyl(0.12,0.12,0.06,10),0,0.52,0,0x8a9099)]);
  const head=new THREE.BoxGeometry(0.38,0.05,0.6);head.translate(0,5.32,1.25);
  lampMat=new THREE.MeshBasicMaterial({color:0x555555});
  const pm=new THREE.InstancedMesh(pole,new THREE.MeshLambertMaterial({vertexColors:true}),lamps.length),hm=new THREE.InstancedMesh(head,lampMat,lamps.length);
  lamps.forEach((l,i)=>{const sx=Math.sign(l.x-Math.round(l.x/64)*64)||1,sz=Math.sign(l.z-Math.round(l.z/64)*64)||1;
    dummy.position.set(l.x,0.16,l.z);dummy.rotation.set(0,Math.atan2(sx,sz),0);dummy.scale.set(1,1,1);dummy.updateMatrix();pm.setMatrixAt(i,dummy.matrix);hm.setMatrixAt(i,dummy.matrix);
    boxes.push({x0:l.x-0.2,x1:l.x+0.2,z0:l.z-0.2,z1:l.z+0.2});});
  pm.instanceMatrix.needsUpdate=true;hm.instanceMatrix.needsUpdate=true;pm.castShadow=true;scene.add(pm);scene.add(hm);
}
/* eau animée (texture de normales générée) */
function rippleNormal(){
  const S=128,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d'),im=g.createImageData(S,S),H=new Float32Array(S*S);
  const W=[];for(let i=0;i<7;i++)W.push([Math.floor(rand(1,5))*(Math.random()<0.5?-1:1),Math.floor(rand(1,5)),rand(0,6.28),rand(0.4,1)]);
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){let h=0;W.forEach(w=>{h+=Math.sin((w[0]*x+w[1]*y)/S*Math.PI*2+w[2])*w[3];});H[y*S+x]=h;}
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const dx=H[y*S+(x+1)%S]-H[y*S+(x-1+S)%S],dy=H[((y+1)%S)*S+x]-H[((y-1+S)%S)*S+x];
    let nx=-dx*0.9,ny=-dy*0.9,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    const o=(y*S+x)*4;im.data[o]=(nx*0.5+0.5)*255;im.data[o+1]=(ny*0.5+0.5)*255;im.data[o+2]=(nz*0.5+0.5)*255;im.data[o+3]=255;
  }
  g.putImageData(im,0,0);return c;
}
let RIPPLE=null;
function waterTex(rx,ry,sp){
  if(!RIPPLE)RIPPLE=rippleNormal();
  const t=new THREE.CanvasTexture(RIPPLE);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);FX.waterTex.push({t,sp});return t;
}
function waterMat(rx,ry,col){
  return new THREE.MeshPhongMaterial({color:col||0x2f86c0,specular:0xd8eeff,shininess:110,transparent:true,opacity:0.88,normalMap:waterTex(rx,ry,0.02),normalScale:new THREE.Vector2(0.7,0.7)});
}
/* fontaine de la place */
function buildFountain(fx,fz){
  const st=0xb4ada2,st2=0xcfc8bc;
  [pp(cyl(4.5,4.7,0.7,36),fx,0.5,fz,st),pp(new THREE.TorusGeometry(4.35,0.22,8,40),fx,0.86,fz,st2,1,1,1,Math.PI/2,0,0),
   pp(cyl(0.55,0.8,1.7,14),fx,1.5,fz,st),pp(cyl(1.75,0.55,0.4,20),fx,2.45,fz,st2),pp(new THREE.TorusGeometry(1.7,0.1,6,24),fx,2.65,fz,st2,1,1,1,Math.PI/2,0,0),
   pp(cyl(0.22,0.3,1.0,10),fx,3.1,fz,st),pp(cyl(0.85,0.28,0.3,16),fx,3.7,fz,st2),pp(sph(0.2,10,8),fx,4.0,fz,0xd1a54a)].forEach(p=>DECO.push(p));
  const wm=waterMat(3,3,0x3d93d1);
  const w1=new THREE.Mesh(cyl(4.15,4.15,0.06,36),wm);w1.position.set(fx,0.8,fz);scene.add(w1);
  const w2=new THREE.Mesh(cyl(1.6,1.6,0.05,20),wm);w2.position.set(fx,2.64,fz);scene.add(w2);
  const N=420,pos=new Float32Array(N*3),P=[];
  for(let i=0;i<N;i++){const top=i<140,a=rand(0,6.28);P.push({top,a,t:rand(0,1.2),v:top?rand(2.6,3.4):rand(0.6,1.1),h:top?rand(0.25,0.55):rand(0.7,1.1)});}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(g,new THREE.PointsMaterial({color:0xdff1ff,size:0.13,transparent:true,opacity:0.85,depthWrite:false}));pts.frustumCulled=false;scene.add(pts);
  FX.jets={pts,P,fx,fz};
  /* bancs autour, jardinières et flamboyants */
  [0.8,2.35,3.9,5.5].forEach(a=>{const bx=fx+Math.sin(a)*7.4,bz=fz+Math.cos(a)*7.4;addFurn('bench',bx,bz,a+Math.PI);});
  [[-16,-2],[16,-2],[-16,16],[16,16]].forEach(q=>{dbox(q[0],0.55,q[1],3.2,0.8,3.2,0xa49a8a);dbox(q[0],0.96,q[1],2.8,0.06,2.8,0x3b2f25);boxes.push({x0:q[0]-1.6,x1:q[0]+1.6,z0:q[1]-1.6,z1:q[1]+1.6});EXTRA_TREES.push({x:q[0],z:q[1],s:1.05,type:'flam',noPit:true});});
}
/* mobilier urbain détaillé */
const FURN={};
function furnGeo(k){
  if(FURN[k])return FURN[k];
  const P=[],M=0x2e3338,b=(x,y,z,w,h,d,c,rx)=>P.push(pp(UBX,x,y,z,c,w,h,d,rx||0,0,0));
  if(k==='bench'){for(let i=0;i<3;i++)b(0,0.45,-0.12+i*0.14,1.8,0.05,0.12,0x8a6440);b(0,0.72,-0.27,1.8,0.12,0.04,0x8a6440,-0.15);b(0,0.9,-0.29,1.8,0.12,0.04,0x8a6440,-0.15);
    [-0.75,0.75].forEach(x=>{b(x,0.22,0,0.06,0.45,0.42,M);b(x,0.68,-0.27,0.06,0.5,0.06,M);});}
  else if(k==='bin'){P.push(pp(cyl(0.28,0.25,0.85,12),0,0.43,0,0x2f6b45));P.push(pp(cyl(0.3,0.3,0.08,12),0,0.88,0,0x24543a));P.push(pp(cyl(0.05,0.05,0.9,6),0.3,0.45,0,M));}
  else if(k==='shelter'){b(0,2.45,0,3.3,0.1,1.3,0x2e3338);b(0,1.25,-0.55,3.1,2.1,0.04,0x9fc6d8);[-1.55,1.55].forEach(x=>{b(x,1.22,-0.55,0.08,2.4,0.08,M);b(x,1.22,0.5,0.08,2.4,0.08,M);});
    b(1.55,1.3,0,0.06,1.8,0.95,0xf2c200);b(1.58,1.3,0,0.02,1.5,0.8,0xd94f4f);b(-0.4,0.45,-0.35,2,0.06,0.35,0x8a9099);b(0,2.3,0.6,3.2,0.2,0.06,0x2e6fd1);}
  else if(k==='bollard'){P.push(pp(cyl(0.14,0.16,0.8,10),0,0.4,0,0x2e3338));P.push(pp(cyl(0.15,0.15,0.12,10),0,0.62,0,0xe0b400));P.push(pp(sph(0.15,10,6),0,0.8,0,0x2e3338,1,0.5,1));}
  else if(k==='crate'){b(0,0.55,0,1.3,1.1,1.3,0x9a7a4e);[[-0.6,-0.6],[0.6,-0.6],[-0.6,0.6],[0.6,0.6]].forEach(q=>b(q[0],0.55,q[1],0.12,1.12,0.12,0x6b5232));b(0,0.55,0,1.32,0.1,1.32,0x6b5232);}
  else if(k==='barrel'){P.push(pp(cyl(0.38,0.38,1,14),0,0.5,0,0x2e6fd1));P.push(pp(cyl(0.4,0.4,0.06,14),0,0.25,0,0x1f4f9a));P.push(pp(cyl(0.4,0.4,0.06,14),0,0.75,0,0x1f4f9a));}
  else if(k==='mail'){b(0,0.35,0,0.08,0.7,0.08,M);b(0,0.9,0,0.5,0.45,0.4,0xe0b400);b(0,0.98,0.205,0.28,0.04,0.01,0x1c1c1c);P.push(pp(cyl(0.2,0.2,0.5,10,1,false,0,Math.PI),0,1.12,0,0xe0b400,1,1,0.8,0,0,Math.PI/2));}
  else if(k==='hedge'){b(0,0.3,0,3,0.6,0.85,0x2a6a35);[-1,0,1].forEach((x,i)=>P.push(pp(blob(0.55,i*3.1),x,0.6,0,[0x2f7a3d,0x357f40,0x2a6f38][i],1.1,0.7,0.85)));}
  FURN[k]=mergeParts(P);return FURN[k];
}
const FURN_LIST={};
function addFurn(k,x,z,ry,noBox){
  (FURN_LIST[k]=FURN_LIST[k]||[]).push({x,z,ry:ry||0});
  if(!noBox){const d=PK[k];const sw=Math.abs(Math.sin(ry||0))>0.5;const w=sw?d[2]:d[0],dd=sw?d[0]:d[2];boxes.push({x0:x-w/2,x1:x+w/2,z0:z-dd/2,z1:z+dd/2});}
}
function flushFurn(){
  Object.keys(FURN_LIST).forEach(k=>{
    const L=FURN_LIST[k];if(!L.length)return;
    const im=new THREE.InstancedMesh(furnGeo(k),decoMat,L.length);
    L.forEach((p,i)=>{dummy.position.set(p.x,0.16,p.z);dummy.rotation.set(0,p.ry,0);dummy.scale.set(1,1,1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});
    im.instanceMatrix.needsUpdate=true;im.castShadow=true;im.receiveShadow=true;scene.add(im);L.length=0;
  });
}
function addPlant(x,z,s){s=s||1;DECO.push(pp(cyl(0.32*s,0.24*s,0.55*s,10),x,0.29*s,z,0xa8613a));[[0,0.95,0,0.42],[0.18,0.8,0.1,0.3],[-0.15,0.85,-0.1,0.32]].forEach((b,i)=>DECO.push(pp(blob(b[3]*s,i+x),x+b[0]*s,b[1]*s,z+b[2]*s,[0x3f8f4a,0x4b9a45,0x2f7a3d][i])));}
/* immeubles selon le quartier */
function lotBuilding(cx,cz,w,d,h){
  const D=distAt(cx,cz);
  if(D.id==='hauts'){
    if(h<=20)addBuilding(cx,cz,w,d,Math.min(h,16),pick([0,2,3,4,5,13]),{roof:'gable',balcony:Math.random()<0.6});
    else addBuilding(cx,cz,w,d,h,pick([0,3,13,12]),{balcony:true});
  }else if(D.id==='port'){
    if(h<=20&&Math.random()<0.7)addBuilding(cx,cz,w,d,Math.min(h,12),pick([8,9,14]),{roof:'gable',roofC:pick([0x7f868d,0x6a737b,0x8f5a3a])});
    else addBuilding(cx,cz,w,d,h,pick([2,5,1,3]),{balcony:Math.random()<0.4});
  }else{
    if(h>30)addBuilding(cx,cz,w,d,h,pick([6,7,6,12]),{towerMi:pick([6,7])});
    else addBuilding(cx,cz,w,d,h,pick([0,1,2,3,4,5,12]),{balcony:Math.random()<0.35});
  }
}
/* parc */
function buildPark(cx,cz){
  const pathMat=new THREE.MeshLambertMaterial({map:noiseTex('#c9b48a',26,4)});
  [[3,50],[50,3]].forEach(s=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(s[0],s[1]),pathMat);m.rotation.x=-Math.PI/2;m.position.set(cx,0.172,cz);m.receiveShadow=true;scene.add(m);});
  const ring=new THREE.Mesh(new THREE.RingGeometry(10.8,13.2,56),pathMat);ring.rotation.x=-Math.PI/2;ring.position.set(cx,0.174,cz);ring.receiveShadow=true;scene.add(ring);
  const disc=new THREE.Mesh(new THREE.CircleGeometry(9.2,48),new THREE.MeshLambertMaterial({map:noiseTex('#4f9255',22,3)}));disc.rotation.x=-Math.PI/2;disc.position.set(cx,0.176,cz);disc.receiveShadow=true;scene.add(disc);
  DECO.push(pp(new THREE.TorusGeometry(6.9,0.38,8,48),cx,0.3,cz,0xa49d92,1,1,1,Math.PI/2,0,0));
  const w=new THREE.Mesh(new THREE.CircleGeometry(6.8,48),waterMat(4,4,0x2f7fa8));w.rotation.x=-Math.PI/2;w.position.set(cx,0.32,cz);scene.add(w);
  for(let i=0;i<9;i++){const a=rand(0,6.28),r=rand(2,5.6);DECO.push(pp(cyl(0.4,0.4,0.02,10),cx+Math.cos(a)*r,0.34,cz+Math.sin(a)*r,0x4f9a45));}
  boxes.push({x0:cx-4.9,x1:cx+4.9,z0:cz-4.9,z1:cz+4.9},{x0:cx-7,x1:cx+7,z0:cz-2.8,z1:cz+2.8},{x0:cx-2.8,x1:cx+2.8,z0:cz-7,z1:cz+7});
  const FL=[0xd94f4f,0xf2c200,0xff8fb1,0xf4f1ea,0x8a5fc9,0xef7a3a];
  for(let i=0;i<150;i++){const a=rand(0,6.28),r=rand(7.6,9);DECO.push(pp(sph(0.14,5,4),cx+Math.cos(a)*r,0.32,cz+Math.sin(a)*r,pick(FL)));if(i%3===0)DECO.push(pp(sph(0.2,5,4),cx+Math.cos(a+0.05)*r,0.26,cz+Math.sin(a+0.05)*r,0x3a8544));}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2+Math.PI/8,r=14.6;addFurn('bench',cx+Math.sin(a)*r,cz+Math.cos(a)*r,a+Math.PI);}
  /* kiosque */
  const kx=cx+15,kz=cz+15;
  DECO.push(pp(cyl(3,3.2,0.4,8),kx,0.36,kz,0xd8d0c0));
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;DECO.push(pp(cyl(0.1,0.1,2.8,6),kx+Math.cos(a)*2.6,1.95,kz+Math.sin(a)*2.6,0xf4f1ea));}
  DECO.push(pp(new THREE.ConeGeometry(3.4,1.8,8),kx,4.2,kz,0x2f6b4a));DECO.push(pp(sph(0.2,8,6),kx,5.2,kz,0xd1a54a));
  boxes.push({x0:kx-2.4,x1:kx+2.4,z0:kz-2.4,z1:kz+2.4});
}
/* drapeaux de la ville devant le Pôle Emploi */
function flagTex(k){
  const c=document.createElement('canvas');c.width=128;c.height=80;const g=c.getContext('2d');
  if(k===0){g.fillStyle='#1d4f8a';g.fillRect(0,0,128,80);g.fillStyle='#f2a93b';g.fillRect(0,52,128,28);g.fillStyle='#ffd27a';g.beginPath();g.arc(64,52,20,Math.PI,0);g.fill();g.fillStyle='#fff';g.fillRect(0,50,128,3);}
  else{g.fillStyle='#ffffff';g.fillRect(0,0,128,80);g.fillStyle='#1d4f8a';g.font='700 26px Rajdhani, sans-serif';g.textAlign='center';g.fillText('PORT',64,36);g.fillText('AURORE',64,64);}
  return new THREE.CanvasTexture(c);
}
function buildFlags(){
  [[-12.5,-7.6,0],[12.5,-7.6,1],[-9.5,-7.6,1],[9.5,-7.6,0]].forEach(f=>{
    DECO.push(pp(cyl(0.06,0.08,7.5,8),f[0],3.9,f[1],0xd8dce0));DECO.push(pp(sph(0.1,8,6),f[0],7.7,f[1],0xd1a54a));DECO.push(pp(cyl(0.3,0.36,0.3,10),f[0],0.3,f[1],0x8a9099));
    boxes.push({x0:f[0]-0.2,x1:f[0]+0.2,z0:f[1]-0.2,z1:f[1]+0.2});
    const g=new THREE.PlaneGeometry(2,1.25,10,4);g.translate(1,0,0);
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:flagTex(f[2]),side:THREE.DoubleSide}));m.position.set(f[0]+0.07,6.9,f[1]);scene.add(m);
    FX.flags.push({m,base:g.attributes.position.array.slice(),ph:rand(0,6)});
  });
}
/* port : quai, conteneurs, grues, jetée, phare, bateaux, mouettes */
function contTex(){
  const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');
  g.fillStyle='#fff';g.fillRect(0,0,128,64);
  for(let x=0;x<128;x+=6){g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(x,0,2,64);g.fillStyle='rgba(255,255,255,0.5)';g.fillRect(x+3,0,1,64);}
  g.fillStyle='rgba(0,0,0,0.3)';g.fillRect(0,0,128,3);g.fillRect(0,61,128,3);g.fillRect(0,0,3,64);g.fillRect(125,0,3,64);
  g.fillStyle='rgba(255,255,255,0.75)';g.font='700 11px sans-serif';g.fillText('AURORE LINES',10,20);
  return new THREE.CanvasTexture(c);
}
function buildHarbor(){
  /* conteneurs empilés */
  const L=[],cc=[0xc0392b,0x2e6fd1,0xe0a526,0x2e9a6a,0x7b4bb3,0xdddddd,0xd97f4f,0x3b5f7a];
  const cranes=[-130,-10,110];
  [194.6,197.3,201.5,204.2].forEach(z=>{for(let x=-186;x<186;x+=6.4){
    if(cranes.some(c=>Math.abs(c-x)<7)||Math.random()<0.18)continue;
    const n=1+Math.floor(Math.random()*(z>200?3:2));for(let s=0;s<n;s++)L.push({x,y:1.3+s*2.62+0.16,z,c:pick(cc)});}});
  const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(6,2.6,2.4),new THREE.MeshLambertMaterial({map:contTex()}),L.length);
  L.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();cm.setMatrixAt(i,dummy.matrix);cm.setColorAt(i,_ic.setHex(p.c));});
  cm.instanceMatrix.needsUpdate=true;cm.instanceColor.needsUpdate=true;cm.castShadow=true;cm.receiveShadow=true;scene.add(cm);
  /* bord du quai */
  dbox(0,0.12,225.2,560,0.7,0.9,0xa3a7ab);dbox(0,0.36,223.6,560,0.02,0.25,0xe0b400);
  for(let x=-210;x<=210;x+=10){DECO.push(pp(cyl(0.22,0.26,0.5,10),x,0.6,224.6,0x2e3338));DECO.push(pp(cyl(0.32,0.32,0.08,10),x,0.86,224.6,0x2e3338));}
  for(let x=-205;x<=205;x+=14)DECO.push(pp(new THREE.TorusGeometry(0.42,0.16,6,12),x,-0.1,225.75,0x1c1c1c));
  /* grues portiques */
  cranes.forEach((cx,i)=>{
    const col=i===1?0x2e6fd1:0xe0702a,Y=27;
    [[-5,206],[5,206],[-5,221],[5,221]].forEach(q=>dbox(cx+q[0],Y/2,q[1],0.9,Y,0.9,col));
    [206,221].forEach(z=>{dbox(cx,Y-1,z,11,0.8,0.8,col);dbox(cx,4,z,11,0.6,0.6,col);DECO.push(pp(UBX,cx,Y/2+1,z,col,0.35,Math.hypot(10,Y-6),0.35,0,0,Math.atan2(10,Y-6)));});
    [-5,5].forEach(x=>{dbox(cx+x,Y-1,213.5,0.8,0.8,15,col);DECO.push(pp(UBX,cx+x,Y/2,213.5,col,0.3,Math.hypot(15,Y-4),0.3,Math.atan2(15,Y-4),0,0));});
    dbox(cx,Y+0.6,226,2.4,1.6,64,col);dbox(cx,Y+3.4,212,6,4,6,0xe8e8e0);dbox(cx,Y+3.6,215.05,4.6,1.4,0.05,0x25405a);
    dbox(cx,Y+6.5,202,0.5,8,0.5,col);DECO.push(pp(UBX,cx,Y+5,228,0x2e3338,0.06,0.06,52,-0.17,0,0));
    dbox(cx,Y-0.6,238,2.2,1,3,0x3a3f47);dbox(cx,Y-6,238,0.05,10,0.05,0x1c1c1c);dbox(cx,Y-11.4,238,1.2,0.8,0.8,0xe0b400);
  });
  /* jetée et phare */
  const px=150;dbox(px,0.2,256,6,0.7,62,0xa3a7ab);
  for(let z=230;z<288;z+=8){[-2.6,2.6].forEach(x=>DECO.push(pp(cyl(0.3,0.3,3,8),px+x,-1.3,z,0x6b5a45)));}
  for(let z=228;z<286;z+=4){[-2.8,2.8].forEach(x=>dbox(px+x,0.95,z,0.08,0.9,0.08,0xd8dce0));}
  [-2.8,2.8].forEach(x=>dbox(px+x,1.4,256,0.06,0.06,58,0xd8dce0));
  const lz=292;
  DECO.push(pp(cyl(5,5.6,1.6,20),px,0.2,lz,0xa3a7ab));DECO.push(pp(cyl(1.9,2.7,20,20),px,11,lz,0xf4f1ea));
  [4,10,16].forEach(y=>DECO.push(pp(cyl(2.62-y*0.04,2.7-y*0.04,2.4,20),px,y,lz,0xc0392b)));
  DECO.push(pp(cyl(2.8,2.8,0.35,20),px,21.1,lz,0x2e3338));
  for(let i=0;i<16;i++){const a=i/16*Math.PI*2;DECO.push(pp(cyl(0.04,0.04,0.9,4),px+Math.cos(a)*2.65,21.7,lz+Math.sin(a)*2.65,0x2e3338));}
  DECO.push(pp(new THREE.TorusGeometry(2.65,0.05,4,24),px,22.15,lz,0x2e3338,1,1,1,Math.PI/2,0,0));
  DECO.push(pp(new THREE.SphereGeometry(1.55,16,8,0,Math.PI*2,0,Math.PI/2),px,23.6,lz,0xc0392b));DECO.push(pp(cyl(0.05,0.05,1.2,4),px,25.5,lz,0x2e3338));
  FX.lantern=new THREE.Mesh(cyl(1.35,1.35,2.2,16),new THREE.MeshBasicMaterial({color:0xffe6a8}));FX.lantern.position.set(px,22.5,lz);scene.add(FX.lantern);
  const bg=new THREE.CylinderGeometry(0.5,9,110,20,1,true);bg.translate(0,55,0);bg.rotateZ(-Math.PI/2);
  const bm=new THREE.MeshBasicMaterial({color:0xfff0c0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false});
  const beamG=new THREE.Group();beamG.position.set(px,22.5,lz);const b1=new THREE.Mesh(bg,bm),b2=new THREE.Mesh(bg,bm);b2.rotation.y=Math.PI;beamG.add(b1);beamG.add(b2);scene.add(beamG);
  FX.halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex([[0,'rgba(255,240,200,1)'],[0.3,'rgba(255,220,150,0.5)'],[1,'rgba(255,200,120,0)']]),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,fog:false}));
  FX.halo.scale.set(14,14,1);FX.halo.position.set(px,22.5,lz);scene.add(FX.halo);
  FX.beam={g:beamG,m:bm};
  /* bateaux */
  [[-170,229.5,'fish',0x2e6fd1],[-150,229.5,'fish',0xc0392b],[-85,229.5,'fish',0x2e9a6a],[-60,229.5,'fish',0xe0a526],[40,229.5,'fish',0x2e6fd1],[70,229.5,'fish',0xf4f1ea],[180,232,'sail',0xf4f1ea],[120,232,'sail',0xf4f1ea]].forEach((b,i)=>{
    const m=new THREE.Mesh(boatGeo(b[2],b[3]),decoMat);m.position.set(b[0],0,b[1]);m.rotation.y=Math.PI/2+(i%2?Math.PI:0);m.castShadow=true;scene.add(m);FX.boats.push({m,mode:'moor',ph:rand(0,6),y:0});
  });
  for(let i=0;i<4;i++){const m=new THREE.Mesh(boatGeo('sail',pick([0xf4f1ea,0x1d4f8a,0xc0392b])),decoMat);scene.add(m);FX.boats.push({m,mode:'sail',ph:rand(0,6),cx:rand(-120,80),cz:rand(290,340),rx:rand(60,110),rz:rand(18,35),sp:rand(0.012,0.025)*(Math.random()<0.5?1:-1)});}
  const ship=new THREE.Mesh(boatGeo('ship',0x7a2f2f),decoMat);ship.position.set(-260,0,410);scene.add(ship);FX.boats.push({m:ship,mode:'ship',ph:0,x:-300});
  /* mouettes */
  for(let i=0;i<16;i++){
    const g=new THREE.Group(),wm=new THREE.MeshLambertMaterial({color:0xf4f1ea,side:THREE.DoubleSide});
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.14,0.6),wm);g.add(body);
    const wl=new THREE.Group(),wr=new THREE.Group();const wg=new THREE.BoxGeometry(0.8,0.03,0.26);wg.translate(0.4,0,0);
    const a=new THREE.Mesh(wg,wm),b=new THREE.Mesh(wg,wm);wl.add(a);wr.add(b);wr.rotation.y=Math.PI;g.add(wl);g.add(wr);
    const tip=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.12),lamb(0xe0a526));tip.position.z=0.34;g.add(tip);
    scene.add(g);FX.gulls.push({g,wl,wr,cx:rand(-160,160),cz:rand(190,260),r:rand(14,36),y:rand(12,26),ph:rand(0,6.28),sp:rand(0.25,0.45)*(Math.random()<0.5?1:-1)});
  }
}
function boatGeo(type,col){
  const P=[];
  const hull=(L,W,H,c,deck)=>{
    const s=new THREE.Shape();s.moveTo(-W/2,-L/2);s.lineTo(W/2,-L/2);s.lineTo(W/2,L*0.22);s.quadraticCurveTo(W/2,L*0.42,0,L/2);s.quadraticCurveTo(-W/2,L*0.42,-W/2,L*0.22);s.lineTo(-W/2,-L/2);
    const g=new THREE.ExtrudeGeometry(s,{depth:H,bevelEnabled:false,curveSegments:6});g.rotateX(Math.PI/2);g.translate(0,H*0.65,0);
    P.push({g,m:new THREE.Matrix4(),c:c});
    const s2=new THREE.Shape();const w2=W*0.94,l2=L*0.96;s2.moveTo(-w2/2,-l2/2);s2.lineTo(w2/2,-l2/2);s2.lineTo(w2/2,l2*0.22);s2.quadraticCurveTo(w2/2,l2*0.42,0,l2/2);s2.quadraticCurveTo(-w2/2,l2*0.42,-w2/2,l2*0.22);s2.lineTo(-w2/2,-l2/2);
    const d=new THREE.ShapeGeometry(s2);d.rotateX(Math.PI/2);d.translate(0,H*0.65-0.02,0);P.push({g:d,m:new THREE.Matrix4(),c:deck});
    const st=new THREE.ExtrudeGeometry(s,{depth:0.18,bevelEnabled:false,curveSegments:6});st.rotateX(Math.PI/2);st.translate(0,H*0.65-H*0.55,0);P.push({g:st,m:new THREE.Matrix4().makeScale(1.01,1,1.005),c:0xf4f1ea});
  };
  if(type==='fish'){hull(7,2.6,1.5,col,0x8a6440);P.push(pp(UBX,0,1.6,-1,0xf4f1ea,1.8,1.4,2));P.push(pp(UBX,0,1.95,0.02,0x25405a,1.6,0.5,0.04));P.push(pp(UBX,0,2.35,-1,shade(col,0.8),2,0.1,2.2));P.push(pp(cyl(0.06,0.06,4,6),0,3,0.8,0xd8dce0));P.push(pp(UBX,0,4,0.8,0xd8dce0,0.04,0.04,2.4,0.3,0,0));}
  else if(type==='sail'){hull(6,2,1.1,col,0xc9a26b);P.push(pp(cyl(0.06,0.07,8,6),0,4.9,0.4,0xd8dce0));P.push(pp(UBX,0,1.8,-0.6,0xd8dce0,0.06,0.06,2.6));
    const sl=new THREE.BufferGeometry();sl.setAttribute('position',new THREE.Float32BufferAttribute([0,1.9,-1.85,0,8.6,0.35,0,1.9,0.35],3));sl.computeVertexNormals();P.push({g:sl,m:new THREE.Matrix4(),c:0xf8f6ef});
    const jb=new THREE.BufferGeometry();jb.setAttribute('position',new THREE.Float32BufferAttribute([0,1.4,0.5,0,7.6,0.45,0,1.2,2.9],3));jb.computeVertexNormals();P.push({g:jb,m:new THREE.Matrix4(),c:0xe9e4d6});}
  else{hull(70,11,6,col,0x5a5f66);
    for(let x=-1;x<=1;x++)for(let z=-5;z<=3;z++){const n=1+((x+z+9)%3);for(let s=0;s<n;s++)P.push(pp(UBX,x*3.4,4.6+s*2.4,z*6.4,[0xc0392b,0x2e6fd1,0xe0a526,0x2e9a6a,0xdddddd][(x*7+z*3+s+20)%5],3.2,2.3,6));}
    P.push(pp(UBX,0,7,-30,0xf4f1ea,10,8,6));P.push(pp(UBX,0,11.4,-30,0x25405a,10.2,1.2,6.2));P.push(pp(UBX,0,13,-32,0x1c1c1c,2.2,4,2.2));}
  return mergeParts(P);
}
/* collines lointaines */
function buildHills(){
  for(let i=0;i<26;i++){
    const a=-Math.PI*0.08-i/25*Math.PI*1.16,r=rand(238,272),x=Math.cos(a)*r,z=Math.sin(a)*r*1.05;
    let g=new THREE.IcosahedronGeometry(1,1);if(g.index)g=g.toNonIndexed();const p=g.attributes.position;
    for(let k=0;k<p.count;k++){const y=p.getY(k);p.setY(k,y<0?y*0.1:y*(1+0.12*Math.sin(p.getX(k)*4+i)));}
    g.computeVertexNormals();
    const m=new THREE.Mesh(g,lamb(pick([0x4f7a55,0x5d7f5a,0x58775a,0x6b8a6e])));m.scale.set(rand(45,85),rand(16,42),rand(30,55));m.rotation.y=a+Math.PI/2;m.position.set(x,-2,z);scene.add(m);
  }
}
/* bordures de trottoir */
function buildCurbs(){
  for(let i=-3;i<=3;i++)for(let j=-3;j<=2;j++){const cx=i*BLOCK,cz=j*BLOCK,c=0xb8bcc0;
    dbox(cx,0.11,cz-25.05,50.5,0.22,0.36,c);dbox(cx,0.11,cz+25.05,50.5,0.22,0.36,c);dbox(cx-25.05,0.11,cz,0.36,0.22,50.5,c);dbox(cx+25.05,0.11,cz,0.36,0.22,50.5,c);}
}
/* enseignes et détails des bâtiments importants */
function buildLandmarks(){
  /* banque : colonnes et fronton */
  const bx=-64,bz=-4;
  for(let k=-2;k<=2;k++){const x=bx+k*2.6;DECO.push(pp(cyl(0.32,0.36,6.2,14),x,3.3,bz+0.9,0xe8e2d6));DECO.push(pp(UBX,x,6.5,bz+0.9,0xd8d0c0,0.9,0.3,0.9));DECO.push(pp(UBX,x,0.3,bz+0.9,0xd8d0c0,0.9,0.3,0.9));boxes.push({x0:x-0.4,x1:x+0.4,z0:bz+0.5,z1:bz+1.3});}
  dbox(bx,6.9,bz+0.9,14,0.5,1.6,0xd8d0c0);
  dbox(bx,0.2,bz+1.8,12,0.12,1.2,0xcfc8b8);
  /* hôpital : croix et héliport */
  const hx=0,hz=128-12;
  dbox(hx-13,9.5,hz+6.12,0.6,2.2,0.12,0xe74c3c);dbox(hx-13,9.5,hz+6.12,2.2,0.6,0.12,0xe74c3c);
  dbox(hx+8,12.8,hz,7,0.06,7,0x3a3f47);dbox(hx+8,12.86,hz,0.6,0.02,4,0xf4f1ea);dbox(hx+8-1.4,12.86,hz,0.6,0.02,4,0xf4f1ea);dbox(hx+8+1.4,12.86,hz,0.6,0.02,4,0xf4f1ea);dbox(hx+8,12.86,hz,2.4,0.02,0.6,0xf4f1ea);
  /* club : néons */
  const neon=new THREE.MeshBasicMaterial({color:0xff5fd2}),neon2=new THREE.MeshBasicMaterial({color:0x5aa9ff});
  const cx=64,cz=64-4;
  [[cx,11.9,cz+0.1,24,0.12,0.12,neon],[cx,4.3,cz+0.1,24,0.1,0.1,neon2],[cx-11.9,8,cz+0.1,0.12,7.6,0.12,neon],[cx+11.9,8,cz+0.1,0.12,7.6,0.12,neon]].forEach(n=>{const m=new THREE.Mesh(UBX,n[6]);m.position.set(n[0],n[1],n[2]);m.scale.set(n[3],n[4],n[5]);scene.add(m);});
  /* supérette : bacs de fruits devant */
  [[64-8.5,-1.4],[64+8.5,-1.4]].forEach(q=>{dbox(q[0],0.55,q[1]-2.6,2.4,0.7,1,0x8a6440);for(let i=0;i<10;i++)DECO.push(pp(sph(0.16,6,5),q[0]+rand(-1,1),0.98,q[1]-2.6+rand(-0.35,0.35),pick([0xd94f4f,0xf2c200,0x4fb58a,0xef7a3a])));boxes.push({x0:q[0]-1.2,x1:q[0]+1.2,z0:q[1]-3.1,z1:q[1]-2.1});});
}
function buildDecor(){
  buildCurbs();buildPark(0,-128);buildFlags();buildHarbor();buildHills();buildLandmarks();
  if(sea){sea.material.normalMap=waterTex(70,24,0.012);sea.material.normalScale=new THREE.Vector2(0.55,0.55);sea.material.color.setHex(0x1f6f9c);sea.material.needsUpdate=true;}
  flushFurn();
  if(DECO.length){const m=new THREE.Mesh(mergeParts(DECO),decoMat);m.castShadow=true;m.receiveShadow=true;scene.add(m);DECO.length=0;}
}
function updateDecor(dt){
  const T=performance.now()*0.001;
  FX.waterTex.forEach(w=>{w.t.offset.x=(T*w.sp)%1;w.t.offset.y=(T*w.sp*0.7)%1;});
  const J=FX.jets;
  if(J&&Math.abs(J.fx-camera.position.x)<90&&Math.abs(J.fz-camera.position.z)<90){
    const a=J.pts.geometry.attributes.position.array;
    J.P.forEach((p,i)=>{
      p.t+=dt;let x,y,r;
      if(p.top){r=p.t*p.h;y=4.05+p.v*p.t-4.9*p.t*p.t;if(y<2.65){p.t=0;p.a=rand(0,6.28);}}
      else{r=1.72+p.t*p.h;y=2.62+p.v*p.t*0.3-4.9*p.t*p.t;if(y<0.82){p.t=0;p.a=rand(0,6.28);}}
      a[i*3]=J.fx+Math.cos(p.a)*r;a[i*3+1]=y;a[i*3+2]=J.fz+Math.sin(p.a)*r;
    });
    J.pts.geometry.attributes.position.needsUpdate=true;
  }
  FX.flags.forEach(f=>{const p=f.m.geometry.attributes.position,b=f.base;for(let i=0;i<p.count;i++){const x=b[i*3];p.setZ(i,Math.sin(x*2.2-T*4+f.ph)*0.18*x/2);}p.needsUpdate=true;f.m.geometry.computeVertexNormals();});
  const h=(gameMin/60)%24,s=Math.sin((h-6)/12*Math.PI),d=s>0?clamp(s*1.4,0,1):0,n=1-d;
  if(FX.beam){FX.beam.g.rotation.y=T*0.55;FX.beam.m.opacity=clamp(n*0.22-0.02,0,0.2)*(1-(wx&&wx.k?wx.k.dark*0.3:0));FX.halo.material.opacity=clamp(n*1.2,0.15,1);FX.lantern.material.color.setRGB(1,0.9*(0.6+0.4*n)+0.1,0.66*(0.5+0.5*n)+0.1);}
  FX.boats.forEach(b=>{
    if(b.mode==='moor'){b.m.position.y=Math.sin(T*1.2+b.ph)*0.12-0.1;b.m.rotation.z=Math.sin(T*0.9+b.ph)*0.04;}
    else if(b.mode==='sail'){b.ph+=b.sp*dt;const x=b.cx+Math.cos(b.ph)*b.rx,z=b.cz+Math.sin(b.ph)*b.rz;const dx=-Math.sin(b.ph)*b.rx*Math.sign(b.sp),dz=Math.cos(b.ph)*b.rz*Math.sign(b.sp);
      b.m.position.set(x,Math.sin(T*1.4+b.cx)*0.15-0.1,z);b.m.rotation.set(0,Math.atan2(dx,dz),Math.sin(T+b.cx)*0.06-0.08*Math.sign(b.sp));}
    else{b.x+=dt*1.6;if(b.x>320)b.x=-320;b.m.position.set(b.x,-0.6+Math.sin(T*0.5)*0.1,410);b.m.rotation.y=Math.PI/2;}
  });
  FX.gulls.forEach(g=>{g.ph+=g.sp*dt;const x=g.cx+Math.cos(g.ph)*g.r,z=g.cz+Math.sin(g.ph)*g.r;g.g.position.set(x,g.y+Math.sin(T*0.7+g.r)*1.5,z);
    g.g.rotation.y=Math.atan2(-Math.sin(g.ph)*Math.sign(g.sp),Math.cos(g.ph)*Math.sign(g.sp));g.g.rotation.z=-0.25*Math.sign(g.sp);
    const f=Math.sin(T*7+g.r)*0.5;g.wl.rotation.z=f;g.wr.rotation.z=f;});
}
