'use strict';
/* ---------- construction de la ville ---------- */
function buildWorld(){
  makeWallMats();
  const road=new THREE.Mesh(new THREE.PlaneGeometry(560,560),new THREE.MeshPhongMaterial({map:noiseTex('#2d3138',22,60),specular:0x0d0d0d,shininess:10}));
  road.rotation.x=-Math.PI/2;road.receiveShadow=true;scene.add(road);
  const walkMat=new THREE.MeshPhongMaterial({map:tileTex('#8f9398'),specular:0x080808,shininess:6}),plazaMat=new THREE.MeshPhongMaterial({map:tileTex('#bdb6a6'),specular:0x080808,shininess:6});
  const grass=new THREE.Mesh(new THREE.PlaneGeometry(2200,2200),new THREE.MeshLambertMaterial({map:noiseTex('#3f6e46',26,220)}));grass.receiveShadow=true;grass.rotation.x=-Math.PI/2;grass.position.y=-0.05;scene.add(grass);

  const trees=[],lamps=[];
  for(let i=-3;i<=3;i++)for(let j=-3;j<=2;j++){
    const cx=i*BLOCK,cz=j*BLOCK,key=i+','+j;
    const park=key==='0,-2',plaza=key==='0,0';
    const slab=new THREE.Mesh(new THREE.BoxGeometry(50,0.16,50),lamb(park?0x3f7a47:plaza?0xb9b4a8:0x8b8f94));
    slab.position.set(cx,0.08,cz);slab.receiveShadow=true;scene.add(slab);
    if(park){const pg=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.MeshLambertMaterial({map:noiseTex('#4a8550',30,8)}));pg.rotation.x=-Math.PI/2;pg.position.set(cx,0.163,cz);pg.receiveShadow=true;scene.add(pg);}
    if(!park){const pl=new THREE.Mesh(new THREE.PlaneGeometry(50,50),plaza?plazaMat:walkMat);pl.rotation.x=-Math.PI/2;pl.position.set(cx,0.163,cz);pl.receiveShadow=true;scene.add(pl);}
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(s=>lamps.push({x:cx+s[0]*24.4,z:cz+s[1]*24.4}));
    if(!park){[[0,-1],[0,1],[-1,0],[1,0]].forEach(s=>trees.push({x:cx+s[0]*24.4,z:cz+s[1]*24.4,s:rand(0.8,1.1)}));}
    let southLots=true;
    if(park){
      southLots=false;
      for(let k=0,tr=0;k<34&&tr<400;tr++){
        const tx=cx+rand(-21,21),tz=cz+rand(-21,21),r=Math.hypot(tx-cx,tz-cz);
        if(Math.abs(tx-cx)<3||Math.abs(tz-cz)<3||Math.abs(r-12)<2.6||r<9.5)continue;
        if(trees.some(t=>t.park&&Math.hypot(t.x-tx,t.z-tz)<3.4))continue;
        trees.push({x:tx,z:tz,s:rand(0.9,1.4),park:true});k++;
      }
    }else if(plaza){
      southLots=false;
      buildFountain(0,6);
      boxes.push({x0:-4.3,x1:4.3,z0:1.7,z1:10.3});
      addBuilding(0,-14,22,10,9,1,{setback:false});addSign('PÔLE EMPLOI',0,-9,6.2,14,2.4,'#1d4f8a','#ffffff');
      addSpot(0,-5.5,'job',0xffb84d,'Pôle Emploi');
    }else if(key==='1,0'){
      addBuilding(cx,cz-10,26,10,10,4);addSign('SUPÉRETTE',cx,cz-5,8,14,2.4,'#1f7a4d','#ffffff');
      addSpot(cx,cz-1.5,'shop',0x58d68d,'Supérette');
    }else if(key==='-1,0'){
      addBuilding(cx,cz-10,24,12,16,12);addSign('BANQUE',cx,cz-4,13,12,2.4,'#27306b','#ffffff');
      addSpot(cx,cz-0.5,'bank',0x5aa9ff,'Banque');
    }else if(key==='-1,1'){
      addBuilding(cx,cz-10,24,12,18,13,{balcony:true});addSign('APPARTS',cx,cz-4,14,12,2.4,'#4a2c6d','#ffd9ff');
      addSpot(cx,cz-0.5,'home',0xc79bff,'Appartement');
    }else if(key==='1,1'){
      addBuilding(cx,cz-10,24,12,12,11);addSign('CLUB NÉON',cx,cz-4,10,12,2.4,'#1a0933','#ff5fd2');
      addSpot(cx,cz-0.5,'club',0xff5fd2,'Club Néon');
    }else if(key==='0,2'){
      addBuilding(cx,cz-12,30,12,12,10);addSign('HÔPITAL',cx,cz-6,10,14,2.4,'#b32d2d','#ffffff');
      addSpot(cx,cz-2.5,'hospital',0xff6b6b,'Hôpital');
    }else if(['-3,-3','3,-3','-3,2','3,2'].includes(key)){
      southLots=false;
    }else{
      for(let a=-1;a<=1;a+=2)for(let b=-1;b<=1;b+=2){
        const near=1+0.5*(1-Math.hypot(i,j)/3);let h=rand(10,26)*near;if(Math.random()<0.16)h=rand(34,56);
        lotBuilding(cx+a*11,cz+b*11,rand(15,20),rand(15,20),h);
      }
      southLots=false;
    }
    if(['1,0','-1,0','-1,1','1,1','0,2'].includes(key)){southLots=false;if(typeof forecourt22==='function')forecourt22(key,cx,cz);}
    if(southLots){
      for(let a=-1;a<=1;a+=2){lotBuilding(cx+a*11,cz+13,rand(15,20),rand(14,16),rand(10,24));}
    }
  }
  // arbres et lampadaires (modèles détaillés)
  plantTrees(trees);buildLamps(lamps);
  // marquages
  const dz=[],dx=[];
  roadC.forEach(rc=>{for(let s=-256;s<=256;s+=8){
    const d=(((s-32)%64)+64)%64;if(Math.min(d,64-d)<9)continue;
    dz.push({x:rc,z:s});dx.push({x:s,z:rc});
  }});
  const dashMat=new THREE.MeshBasicMaterial({color:0xd8d8c4});
  [[dz,0.25,3],[dx,3,0.25]].forEach(([list,w,d])=>{
    const im=new THREE.InstancedMesh(new THREE.BoxGeometry(w,0.02,d),dashMat,list.length);
    list.forEach((p,i)=>{dummy.position.set(p.x,0.02,p.z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});
    im.instanceMatrix.needsUpdate=true;scene.add(im);
  });
  // halos des lampadaires
  glowMat=new THREE.MeshBasicMaterial({color:0xffc870,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
  const glowG=new THREE.CircleGeometry(6,24);glowG.rotateX(-Math.PI/2);
  const gm=new THREE.InstancedMesh(glowG,glowMat,lamps.length);
  lamps.forEach((l,i)=>{dummy.position.set(l.x+Math.sign(l.x-Math.round(l.x/64)*64)*1.2,0.19,l.z+Math.sign(l.z-Math.round(l.z/64)*64)*1.2);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();gm.setMatrixAt(i,dummy.matrix);});
  gm.instanceMatrix.needsUpdate=true;scene.add(gm);
  // passages piétons
  const zA=[],zB=[];
  roadC.forEach(X=>roadC.forEach(Z=>{
    for(let k=-4;k<=4;k++){const o=k*1.35;
      zA.push({x:X+o,z:Z-10},{x:X+o,z:Z+10});
      zB.push({x:X-10,z:Z+o},{x:X+10,z:Z+o});
    }
  }));
  const zebraMat=new THREE.MeshBasicMaterial({color:0xe4e4da});
  [[zA,0.7,3],[zB,3,0.7]].forEach(([list,w,d])=>{
    const im=new THREE.InstancedMesh(new THREE.BoxGeometry(w,0.02,d),zebraMat,list.length);
    list.forEach((p,i)=>{dummy.position.set(p.x,0.025,p.z);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);dummy.updateMatrix();im.setMatrixAt(i,dummy.matrix);});
    im.instanceMatrix.needsUpdate=true;scene.add(im);
  });
  // toits : rebord et machinerie
  const unitG=new THREE.BoxGeometry(1,1,1),capM=new THREE.InstancedMesh(unitG,new THREE.MeshLambertMaterial({map:noiseTex('#5a5f66',20,1)}),roofs.length),units=[];
  roofs.forEach((r,i)=>{
    dummy.position.set(r.x,r.y+0.25,r.z);dummy.rotation.set(0,0,0);dummy.scale.set(r.w+0.6,0.7,r.d+0.6);dummy.updateMatrix();capM.setMatrixAt(i,dummy.matrix);
    const n=r.units===false?0:1+Math.floor(Math.random()*3);
    for(let k=0;k<n;k++){const sw=rand(1.5,3),sh=rand(0.8,1.8),sd=rand(1.5,3);units.push({x:r.x+rand(-r.w/2+2.5,r.w/2-2.5),y:r.y+0.5+sh/2,z:r.z+rand(-r.d/2+2.5,r.d/2-2.5),w:sw,h:sh,d:sd});}
  });
  capM.instanceMatrix.needsUpdate=true;capM.castShadow=true;scene.add(capM);
  const unM=new THREE.InstancedMesh(unitG,new THREE.MeshLambertMaterial({map:noiseTex('#d8dcdf',30,1)}),units.length),grays=[0x9ba1a8,0x7f868d,0xb4b9bf].map(c=>new THREE.Color(c));
  units.forEach((u,i)=>{dummy.position.set(u.x,u.y,u.z);dummy.rotation.set(0,0,0);dummy.scale.set(u.w,u.h,u.d);dummy.updateMatrix();unM.setMatrixAt(i,dummy.matrix);unM.setColorAt(i,pick(grays));});
  unM.instanceMatrix.needsUpdate=true;if(unM.instanceColor)unM.instanceColor.needsUpdate=true;unM.castShadow=true;scene.add(unM);
  // balise de mission
  beam=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,60,24,1,true),new THREE.MeshBasicMaterial({color:0xffb84d,transparent:true,opacity:0.32,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  beam.position.y=30;beam.visible=false;scene.add(beam);

  // voitures garées
  [[26,10,0],[-26,-12,Math.PI],[12,26,Math.PI/2],[-14,-26,-Math.PI/2],[90,14,0],[-90,-10,Math.PI]].forEach((p,i)=>addCar(p[0],p[1],p[2],CAR_COLORS[i%CAR_COLORS.length],'parked'));
  for(let k=0,tr=0;k<18&&tr<150;tr++){
    const x=pick([-96,-32,32,96])+pick([-6,6]),z=Math.floor(rand(-2,3))*64+rand(-17,17);
    if(cars.some(o=>Math.hypot(o.x-x,o.z-z)<5))continue;
    addCar(x,z,Math.random()<0.5?0:Math.PI,pick(CAR_COLORS),'parked',pick(['sedan','suv','sport','sedan','suv','benz','toyota','bmw','honda','hyundai','jeep','ford','porsche','lambo','ferrari']));k++;
  }
  // circulation
  for(let k=0;k<18;k++){
    const axis=Math.random()<0.5?'z':'x',dir=Math.random()<0.5?1:-1,rc=pick(roadC);
    let x,z,h;const s=axis==='z'?rand(-214,180):rand(-250,250);
    if(axis==='z'){x=rc-3.5*dir;z=s;h=dir>0?0:Math.PI;}else{z=rc+3.5*dir;x=s;h=dir>0?Math.PI/2:-Math.PI/2;}
    const ty=pick(['sedan','sedan','suv','sport','danfo','danfo','taxi','toyota','bmw','honda','hyundai','benz','jeep','ford']),c=addCar(x,z,h,ty==='danfo'?0xf2c200:ty==='taxi'?0xf5c400:pick(CAR_COLORS),'npc',ty);c.lane={axis,dir};c.maxV=rand(8,12);c.v=c.maxV;
  }
  // habitants
  for(let k=0;k<56;k++)spawnPed();
  player.mesh=makePlayerMesh();scene.add(player.mesh);
  built=true;
}

