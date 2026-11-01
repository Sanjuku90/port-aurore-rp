'use strict';
/* ---------- phase 2 : quartiers, feux, parkings, intérieurs, commerces, météo, carte ---------- */
const DIST=[
  {id:'hauts',n:'Les Hauts',tint:0x7f9a6a,col:'#4d5a45',shops:['ÉCOLE','LAVERIE','ÉPICERIE','PRIMEUR','CABINET MÉDICAL','FLEURISTE']},
  {id:'centre',n:'Centre-ville',tint:null,col:'#555b64',shops:['BOULANGERIE','TABAC','LIBRAIRIE','OPTICIEN','COIFFEUR','PRESSING']},
  {id:'port',n:'Quartier du Port',tint:0x6f8fa8,col:'#4a5a68',shops:['POISSONNERIE','BAR DU PORT','MATÉRIEL NAUTIQUE','CRÊPERIE','GLACIER','AGENCE MARITIME']}
];
const distAt=(x,z)=>z<-48?DIST[0]:z>48?DIST[2]:DIST[1];
const UB=new THREE.BoxGeometry(1,1,1),_ic=new THREE.Color();
function inst(mat,list){
  if(!list.length)return null;
  const im=new THREE.InstancedMesh(UB,mat,list.length);
  list.forEach((p,i)=>{
    dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.ry||0,0);dummy.scale.set(p.sx||1,p.sy||1,p.sz||1);dummy.updateMatrix();
    im.setMatrixAt(i,dummy.matrix);if(p.c!=null)im.setColorAt(i,_ic.setHex(p.c));
  });
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;scene.add(im);return im;
}

/* ----- quartiers : teinte du sol + mobilier urbain ----- */
const PK={bench:[1.8,.5,.55,0x7a5a3a],bin:[.6,.9,.6,0x2f6b45],shelter:[3.2,2.4,1,0x9fc6d8],bollard:[.3,.8,.3,0xe0b400],crate:[1.3,1.1,1.3,0x8b6b43],barrel:[.8,1,.8,0x2e6fd1],mail:[.5,1.1,.4,0xe0b400],hedge:[3,.9,.9,0x2f7a3d]};
function buildDistricts(){
  const geo=new THREE.PlaneGeometry(50,50);geo.rotateX(-Math.PI/2);
  const L={};Object.keys(PK).forEach(k=>L[k]=[]);
  for(let i=-3;i<=3;i++)for(let j=-3;j<=2;j++){
    const cx=i*BLOCK,cz=j*BLOCK;if(i===0&&(j===-2||j===0))continue;
    const D=distAt(cx,cz);
    if(D.tint!=null){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:D.tint,transparent:true,opacity:0.22,depthWrite:false}));m.position.set(cx,0.175,cz);scene.add(m);}
    [-1,1].forEach(sz=>[-15,-7,7,15].forEach(ox=>{
      if(Math.random()<0.35)return;
      const k=D.id==='centre'?pick(['bench','bin','shelter','bench']):D.id==='port'?pick(['bollard','crate','barrel','bollard']):pick(['mail','hedge','hedge','bin']);
      L[k].push({x:cx+ox+rand(-1,1),z:cz+sz*23.6,s:sz});
    }));
  }
  Object.keys(L).forEach(k=>{
    L[k].forEach(p=>addFurn(k,p.x,p.z,p.s>0?0:Math.PI));
  });
}

/* ----- feux rouges, panneaux de rues ----- */
const TL={t:0,mz:new THREE.MeshBasicMaterial({color:0x2ecc71}),mx:new THREE.MeshBasicMaterial({color:0xe74c3c})};
function lightState(axis){
  const t=TL.t%28;
  if(axis==='z')return t<12?'g':t<14?'y':'r';
  return t>=14&&t<26?'g':t>=26?'y':'r';
}
const TLC={g:0x2ecc71,y:0xf1c40f,r:0xe74c3c};
function buildLights(){
  const poles=[],lz=[],lx=[];
  roadC.forEach((X,ix)=>roadC.forEach((Z,iz)=>{
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(s=>{
      const px=X+s[0]*6.8,pz=Z+s[1]*6.8;
      poles.push({x:px,y:3.2,z:pz,sx:.14,sy:6.4,sz:.14,c:0x2e3338});
      lz.push({x:px,y:5.3,z:pz,sx:.42,sy:.42,sz:.42});
      lx.push({x:px,y:4.6,z:pz,sx:.42,sy:.42,sz:.42});
    });
    addSign(STREETS[iz%STREETS.length],X+6.8,Z-6.8+0.2,6.3,3.4,0.7,'#1f6f4d','#ffffff');
  }));
  inst(lamb(0xffffff),poles);inst(TL.mz,lz);inst(TL.mx,lx);
}
function redAhead(c){
  const ax=c.lane&&c.lane.axis;if(!ax)return false;
  const pos=ax==='z'?c.z:c.x,dir=Math.sign(ax==='z'?Math.cos(c.h):Math.sin(c.h));
  if(!dir)return false;
  let best=1e9;for(let i=0;i<roadC.length;i++){const d=(roadC[i]-pos)*dir;if(d>5.5&&d<best)best=d;}
  const brake=c.v*c.v/24;
  if(best>7.6+brake+7)return false;
  const s=lightState(ax);
  return s==='r'||(s==='y'&&best>7.6+brake+1);
}

/* ----- parkings ----- */
const LOTS=[[-64,-178,40,14,1],[64,-178,40,14,1],[64,178,40,14,-1],[-192,178,42,16,-1],[192,178,42,16,-1]];/* v22 : les parkings devant le concessionnaire et la station sont remplacés par leurs propres parvis */
function buildParkings(){
  LOTS.forEach(([cx,cz,w,d,face])=>{
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),lamb(0x474c55));m.rotation.x=-Math.PI/2;m.position.set(cx,0.03,cz);m.receiveShadow=true;scene.add(m);
    const n=Math.floor(w/4.4),lines=[];
    for(let k=0;k<=n;k++)lines.push({x:cx-w/2+k*4.4,y:0.045,z:cz,sx:.15,sy:.02,sz:7});
    inst(new THREE.MeshBasicMaterial({color:0xe4e4da}),lines);
    for(let k=0;k<n;k++)if(Math.random()<0.6)addCar(cx-w/2+2.2+k*4.4,cz,Math.random()<0.5?0:Math.PI,pick(CAR_COLORS),'parked',pick(['sedan','suv','sport','sedan']));
    const sz=cz-face*(d/2+0.3);
    addSign('P · PARKING',cx,sz,3.6,7,1.4,'#1f4f9a','#ffffff');
    if(face<0){const s=scene.children[scene.children.length-1];s.rotation.y=Math.PI;}
    inst(lamb(0x2e3338),[{x:cx-3.2,y:1.8,z:sz,sx:.14,sy:3.6,sz:.14},{x:cx+3.2,y:1.8,z:sz,sx:.14,sy:3.6,sz:.14}]);
  });
}

/* ----- façades : auvents, portes, enseignes, commerces ----- */
function buildFronts(){
  const bl=boxes.filter(b=>b.big&&b.x0>-200&&b.x1<200&&b.z1<200&&b.z0>-200),aw=[],dr=[];
  bl.forEach(b=>{
    const w=b.x1-b.x0,cx=(b.x0+b.x1)/2;
    if(w<12||(b.z1-b.z0)<8)return;
    const special=spots.some(s=>Math.hypot(s.x-cx,s.z-b.z1)<9);
    aw.push({x:cx,y:3.4,z:b.z1+0.7,sx:Math.min(9,w*.6),sy:.12,sz:1.5,c:pick([0xc0392b,0x2e6fd1,0x2e9a6a,0xe0a526,0x7b4bb3,0xdddddd])});
    dr.push({x:cx+(special?4.5:0),y:1.3,z:b.z1+0.04,sx:1.7,sy:2.6,sz:.12,c:0x22262c});
    if(!special&&Math.random()<0.5){
      const D=distAt(cx,b.z1);
      addSign(pick(D.shops),cx,b.z1,4.9,Math.min(9,w*.6),1.3,pick(['#2b3445','#5a2d2d','#2d4a3a','#4a3d5a']),'#ffffff');
    }
  });
  inst(lamb(0xffffff),aw);inst(lamb(0xffffff),dr);
  const COM=[[1,0,-1,'cafe','CAFÉ AURORE','#6b3f2a',0xc9a26b,'Café Aurore'],[-1,0,1,'boutique','BOUTIQUE MODE','#7b4bb3',0xc79bff,'Boutique Mode'],[0,2,-1,'pharma','PHARMACIE','#1f7a4d',0x58d68d,'Pharmacie']];
  COM.forEach(([i,j,a,id,txt,bg,col,label])=>{
    const cx=i*BLOCK+a*11,cz=j*BLOCK+13,b=bl.find(q=>Math.abs((q.x0+q.x1)/2-cx)<1&&Math.abs((q.z0+q.z1)/2-cz)<1);
    if(!b)return;
    addSign(txt,(b.x0+b.x1)/2,b.z1,5.8,9,1.8,bg,'#ffffff');
    addSpot((b.x0+b.x1)/2,b.z1+2.3,id,col,label);spots[spots.length-1].door=true;
  });
}

/* ----- intérieurs visitables ----- */
const RD={
  dealership:['Concessionnaire Aurora',0x9aa6b3,0x17699a,[[6,1.1,1.2,0,-3.8,0x24344a],[2.4,.8,1.2,-5,.5,0x26364a],[2.4,.8,1.2,5,.5,0x26364a]]],
  job:['Pôle Emploi',0x9aa6b3,0x1d4f8a,[[6,1.1,1.2,0,-3.8,0x35506b],[2.4,.8,1.2,-5,.5,0x6b5a45],[2.4,.8,1.2,5,.5,0x6b5a45],[2.4,.8,1.2,-5,3,0x6b5a45],[2.4,.8,1.2,5,3,0x6b5a45]]],
  shop:['Supérette',0xb9b2a6,0x1f7a4d,[[6,1.1,1.2,0,-3.8,0x2e6e4a],[1,2,6,-6.5,-.5,0xc0392b],[1,2,6,6.5,-.5,0x2e6fd1],[1,1.5,4,-2,1,0xe0a526],[1,1.5,4,2,1,0x7b4bb3]]],
  bank:['Banque',0xcfc8b8,0x27306b,[[7,1.2,1.2,0,-3.8,0x27306b],[2,.5,2,-5,1.5,0x555b64],[2,.5,2,5,1.5,0x555b64],[1,2.4,1,-7,-3,0x9fb4c8]]],
  home:['Appartement',0xa8896c,0x4a2c6d,[[3.4,.6,2.2,-4.5,-3.5,0xd9d9e8],[3,.7,1.2,3,-3.8,0x6b4a8a],[.8,1.2,3,6.6,1,0x2b2b33],[2.4,.7,1,0,2.5,0x8a5fc9]]],
  club:['Club Néon',0x1a1030,0x3a0f4a,[[6,1.3,1.6,0,-4,0xff5fd2],[8,.05,6,0,.5,0x5aa9ff],[1,2.5,1,-6.5,-4.5,0xff5fd2],[1,2.5,1,6.5,-4.5,0x58d68d]]],
  hospital:['Hôpital',0xe8eef0,0xb32d2d,[[6,1.1,1.2,0,-3.8,0xdfe7ea],[1.2,.6,2.6,-5,.5,0xffffff],[1.2,.6,2.6,5,.5,0xffffff],[1.2,.6,2.6,0,2.5,0xffffff]]],
  cafe:['Café Aurore',0x9b7a56,0x6b3f2a,[[6,1.1,1.2,0,-3.8,0x4a2c1a],[1.4,.8,1.4,-5,1,0x8a5a3a],[1.4,.8,1.4,5,1,0x8a5a3a],[1.4,.8,1.4,-5,3.5,0x8a5a3a],[1.4,.8,1.4,5,3.5,0x8a5a3a]]],
  boutique:['Boutique Mode',0xd8d0e0,0x7b4bb3,[[6,1.1,1.2,0,-3.8,0x4a3a6a],[.5,2,5,-7,0,0xe0b34a],[.5,2,5,7,0,0xd94f4f],[1.5,1.6,.5,-3,1.5,0x4fb58a],[1.5,1.6,.5,3,1.5,0x2e6fd1]]],
  pharma:['Pharmacie',0xeef2f0,0x1f7a4d,[[6,1.1,1.2,0,-3.8,0xdfe7ea],[1,2,6,-6.5,-.5,0x1f7a4d],[1,2,6,6.5,-.5,0x1f7a4d],[1.2,1.5,3,0,1,0xffffff]]]
};
const ROOMS={};
const emat=(c,k)=>new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:k,side:THREE.DoubleSide});
function buildRooms(){
  Object.keys(RD).forEach((id,idx)=>{
    const [name,fc,wc,props]=RD[id],rx=300+idx*40,rz=300;
    const add=(w,h,d,x,z,c,big,k)=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),emat(c,k));m.position.set(rx+x,h/2+0.02,rz+z);scene.add(m);
      if(h>0.2)boxes.push({x0:rx+x-w/2,x1:rx+x+w/2,z0:rz+z-d/2,z1:rz+z+d/2,big:!!big});return m;
    };
    add(16,0.04,12,0,0,fc,false,.55).position.y=0.02;
    add(16.4,5,.4,0,-6.1,wc,true,.35);add(16.4,5,.4,0,6.1,wc,true,.35);
    add(.4,5,12.8,-8.1,0,wc,true,.35);add(.4,5,12.8,8.1,0,wc,true,.35);
    props.forEach(p=>add(p[0],p[1],p[2],p[3],p[4],p[5],false,.45));
    addPlant(rx-7.2,rz+5.3,1.1);addPlant(rx+7.2,rz+5.3,1.1);
    const rug=new THREE.Mesh(new THREE.PlaneGeometry(5,3.2),emat(shade(wc,1.25),.3));rug.rotation.x=-Math.PI/2;rug.position.set(rx,0.06,rz+2.2);scene.add(rug);
    const clerk=makePerson(wc,0x2b3445,pick(SKINS),pick(HAIRS),{top:'long',bottom:'pantalon',bag:false});clerk.position.set(rx,0.1,rz-4.9);scene.add(clerk);
    addSign(name.toUpperCase(),rx,rz-5.85,3.6,8,1.2,'#'+wc.toString(16).padStart(6,'0'),'#ffffff');
    addSpot(rx,rz-2.5,id,0xffffff,name);addSpot(rx,rz+4.8,'exit',0xffffff,'Sortir');
    const sp=spots.splice(spots.length-2,2);sp.forEach(s=>{s.int=true;});
    ROOMS[id]={rx,rz,b:[rx-7.3,rx+7.3,rz-5.2,rz+5.2],sp,name};
  });
}
function useSpot(s){
  if(s.id==='exit')leaveInterior();
  else if(s.door)enterInterior(s);
  else openSpot(s.id);
}
function enterInterior(s){
  const R=ROOMS[s.id];if(!R){openSpot(s.id);return;}
  if(blackout>0&&(s.id==='shop'||s.id==='club')){toast('Coupure de courant : fermé.','warn');return;}
  player.outside={x:s.x,z:s.z};player.inside=R;
  player.x=R.rx;player.z=R.rz+3.4;player.h=Math.PI;camYaw=Math.PI;camPitch=Math.max(camPitch,0.5);camT=1;
  R.sp.forEach(q=>spots.push(q));toast(R.name,'good');
}
function leaveInterior(){
  const R=player.inside;if(!R)return;
  R.sp.forEach(q=>{const i=spots.indexOf(q);if(i>=0)spots.splice(i,1);});
  player.x=player.outside.x;player.z=player.outside.z;player.inside=null;player.h=0;camYaw=0;camT=1;
}
const SHOPX={cafe:1,boutique:1,pharma:1};
function shopX(id){
  const buy=(n,c,fn)=>({label:n+' · '+fmt(c),off:state.cash<c,fn:()=>{state.cash-=c;fn();openSpot(id);}});
  if(id==='cafe')openPanel('Café Aurore','Un café, une viennoiserie, et on repart. Énergie : '+Math.round(state.energy)+' · Faim : '+Math.round(state.hunger)+'.',[
    buy('Café',3,()=>{state.energy=Math.min(100,state.energy+12);toast('Ça réveille. +12 énergie','good');}),
    buy('Croissant',2,()=>{state.hunger=Math.min(100,state.hunger+12);toast('Délicieux. +12 de faim','good');}),
    buy('Petit-déjeuner',9,()=>{state.hunger=Math.min(100,state.hunger+35);state.energy=Math.min(100,state.energy+15);toast('Bien démarré.','good');})]);
  else if(id==='pharma')openPanel('Pharmacie','Santé : '+Math.round(state.health)+' sur 100.',[
    buy('Pansements',6,()=>{state.health=Math.min(100,state.health+15);toast('+15 santé','good');}),
    buy('Kit de soins',18,()=>{state.health=Math.min(100,state.health+45);toast('+45 santé','good');})]);
  else openPanel('Boutique Mode','Change de style : '+fmt(25)+' la tenue.',[[0xd94f4f,'Haut rouge'],[0x4fb58a,'Haut vert'],[0xe0b34a,'Haut jaune'],[0x2f3a4a,'Haut sombre']].map(a=>buy(a[1],25,()=>{
    look.s=a[0];scene.remove(player.mesh);player.mesh=makePlayerMesh();scene.add(player.mesh);toast('Nouvelle tenue.','good');})));
}

/* ----- circulation supplémentaire ----- */
function addTraffic(n){
  for(let k=0;k<n;k++){
    const axis=Math.random()<0.5?'z':'x',dir=Math.random()<0.5?1:-1,rc=pick(roadC);
    let x,z,h;const s=axis==='z'?rand(-214,180):rand(-250,250);
    if(axis==='z'){x=rc-3.5*dir;z=s;h=dir>0?0:Math.PI;}else{z=rc+3.5*dir;x=s;h=dir>0?Math.PI/2:-Math.PI/2;}
    const ty=pick(['sedan','sedan','suv','sport','danfo','taxi']),c=addCar(x,z,h,ty==='danfo'||ty==='taxi'?0xf2c200:pick(CAR_COLORS),'npc',ty);
    c.lane={axis,dir};c.maxV=rand(8,12);c.v=c.maxV;
  }
}

/* ----- météo ----- */
const WX=[['clair','Clair','☀️',0,1,0],['nuageux','Nuageux','⛅',.28,.8,0],['pluie','Pluie','🌧️',.5,.5,1],['orage','Orage','⛈️',.7,.35,1.6]];
const WXNEXT=[[1,1,2],[0,0,2,3],[1,1,3],[2,2,1]];
const wx={i:0,k:{dark:0,fog:1,rain:0},t:rand(100,180),flash:0,nf:8,N:1100,rain:null,base:null,el:null,c:new THREE.Color()};
function buildWeather(){
  const N=wx.N,b=[];
  for(let i=0;i<N;i++)b.push(rand(-20,20),rand(0,24),rand(-20,20));
  wx.base=new Float32Array(b);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*6),3));
  wx.rain=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xbcd0e8,transparent:true,opacity:0.4,depthWrite:false,fog:false}));
  wx.rain.frustumCulled=false;wx.rain.visible=false;scene.add(wx.rain);
  const e=document.createElement('div');e.id='wx';e.className='card';wx.el=e;
  const mb=document.createElement('button');mb.id='map-btn';mb.className='card';mb.textContent='🗺 Carte';mb.addEventListener('click',openBigMap);
  const r=$('#right'),ph=$('#ph-btn');r.insertBefore(e,ph);r.insertBefore(mb,ph);
  setWeather(0,true);
}
function setWeather(i,quiet){
  wx.i=i;wx.t=rand(110,230);wx.el.textContent=WX[i][2]+' '+WX[i][1];
  if(!quiet)toast(['Le ciel se dégage.','Le ciel se couvre.','Il se met à pleuvoir.','Orage en approche !'][i],i>=2?'warn':'');
}
function updateWeather(dt){
  wx.t-=dt;if(wx.t<=0)setWeather(pick(WXNEXT[wx.i]));
  const T=WX[wx.i],k=wx.k,s=Math.min(1,dt*0.25);
  k.dark+=(T[3]-k.dark)*s;k.fog+=(T[4]-k.fog)*s;k.rain+=(T[5]-k.rain)*s;
  const bg=scene.background,lum=(bg.r+bg.g+bg.b)/3,a=k.dark*0.9;
  wx.c.setRGB(lum*0.85,lum*0.88,lum*0.92);
  bg.lerp(wx.c,a);scene.fog.color.copy(bg);sky.material.uniforms.hor.value.copy(bg);sky.material.uniforms.top.value.lerp(wx.c,a*0.9);
  scene.fog.near=90*k.fog;scene.fog.far=300*k.fog+40*(1-k.fog);
  hemi.intensity*=1-k.dark*0.45;sun.intensity*=1-k.dark*0.85;
  if(wx.i===3){wx.nf-=dt;if(wx.nf<=0){wx.nf=rand(6,15);wx.flash=0.35;try{tone(60,1.4,'sawtooth',0.1,0.5);}catch(e){}}}
  if(wx.flash>0){wx.flash-=dt;hemi.intensity+=2.2*Math.max(0,wx.flash/0.35)*(Math.random()<0.5?1:0.4);}
  const R=wx.rain,fr=clamp(k.rain/1.3,0,1);R.visible=fr>0.02&&!player.inside&&started;
  if(R.visible){
    R.position.set(camera.position.x,camera.position.y-10,camera.position.z);
    const p=R.geometry.attributes.position.array,b=wx.base;
    for(let i=0;i<wx.N;i++){
      b[i*3+1]-=dt*(30+(i%7)*2);if(b[i*3+1]<0)b[i*3+1]+=24;
      const x=b[i*3],y=b[i*3+1],z=b[i*3+2];
      p[i*6]=x;p[i*6+1]=y;p[i*6+2]=z;p[i*6+3]=x+0.12;p[i*6+4]=y+0.9;p[i*6+5]=z;
    }
    R.geometry.attributes.position.needsUpdate=true;R.geometry.setDrawRange(0,Math.floor(wx.N*fr)*2);R.material.opacity=0.2+0.3*fr;
  }
}

/* ----- carte générale ----- */
function buildMap(){
  const d=document.createElement('div');d.id='bigmap';d.hidden=true;
  d.innerHTML='<div class="bm-head"><b>Carte de Port-Aurore</b><span><button id="bm-clr">Effacer le repère</button><button id="bm-x" class="primary">Fermer</button></span></div><canvas id="bm-cv"></canvas><p>Touche la carte pour placer un repère GPS.</p>';
  $('#app').appendChild(d);
  $('#bm-x').addEventListener('click',closePanel);
  $('#bm-clr').addEventListener('click',()=>{wp=null;drawBigMap();});
  $('#bm-cv').addEventListener('pointerdown',e=>{
    const cv=e.currentTarget,r=cv.getBoundingClientRect();
    wp={x:clamp((e.clientX-r.left)/r.width*512-256,-256,256),z:clamp((e.clientY-r.top)/r.height*512-256,-256,256),l:'Repère'};
    toast('GPS : repère placé.','good');drawBigMap();
  });
}
function openBigMap(){
  if(!$('#bigmap').hidden){closePanel();return;}
  if(!started||paused||panelOpen||chatOpen)return;
  if(player.inside){toast('Sors du bâtiment pour ouvrir la carte.','warn');return;}
  panelOpen=true;for(const k in keys)keys[k]=false;
  $('#bigmap').hidden=false;drawBigMap();
}
function drawBigMap(){
  const cv=$('#bm-cv'),S=Math.max(200,Math.floor(Math.min(innerWidth-24,innerHeight-170,560)));
  cv.width=cv.height=S;cv.style.width=cv.style.height=S+'px';
  const g=cv.getContext('2d'),k=S/440,X=v=>(v+220)*k;
  g.fillStyle='#262b33';g.fillRect(0,0,S,S);g.fillStyle='#1f6f9c';g.fillRect(0,X(205),S,S-X(205));
  for(let i=-3;i<=3;i++)for(let j=-3;j<=2;j++){g.fillStyle=(i===0&&j===-2)?'#35603c':distAt(i*64,j*64).col;g.fillRect(X(i*64-25),X(j*64-25),50*k,50*k);}
  g.fillStyle='#8a9099';
  boxes.forEach(b=>{if(b.big&&b.x0>-200&&b.x1<200&&b.z0>-200&&b.z1<200)g.fillRect(X(b.x0),X(b.z0),(b.x1-b.x0)*k,(b.z1-b.z0)*k);});
  g.fillStyle='#474c55';LOTS.forEach(l=>g.fillRect(X(l[0]-l[2]/2),X(l[1]-l[3]/2),l[2]*k,l[3]*k));
  const fs=Math.max(9,Math.round(S/44));g.font='600 '+fs+'px sans-serif';g.textAlign='center';
  g.fillStyle='#ffffff';LOTS.forEach(l=>g.fillText('P',X(l[0]),X(l[1])+fs/3));
  g.fillStyle='rgba(255,255,255,.4)';g.font='700 '+Math.round(fs*1.2)+'px sans-serif';
  [[-170,DIST[0].n],[0,DIST[1].n],[170,DIST[2].n]].forEach(a=>{if(a[0]!==0)g.fillText(a[1],X(0),X(a[0]===-170?-168:170));});
  g.font='600 '+fs+'px sans-serif';
  spots.forEach(s=>{g.fillStyle='#'+s.color.toString(16).padStart(6,'0');g.beginPath();g.arc(X(s.x),X(s.z),Math.max(3,S/110),0,7);g.fill();g.fillStyle='#fff';g.fillText(s.label,X(s.x),X(s.z)-fs*0.7);});
  if(wp){g.strokeStyle='#6cc6ff';g.lineWidth=2;g.beginPath();g.arc(X(wp.x),X(wp.z),9,0,7);g.stroke();}
  g.save();g.translate(X(player.x),X(player.z));g.rotate(Math.PI-player.h);g.fillStyle='#ffd24a';g.strokeStyle='#000';g.beginPath();g.moveTo(0,-9);g.lineTo(6,7);g.lineTo(-6,7);g.closePath();g.fill();g.stroke();g.restore();
}

/* ----- assemblage ----- */
let curD=null;
function buildPhase2(){
  spots.forEach(s=>{if(RD[s.id])s.door=true;});
  buildDistricts();buildLights();buildParkings();buildFronts();buildRooms();
  addTraffic(10);for(let k=0;k<20;k++)spawnPed();
  buildWeather();buildMap();
}
function updatePhase2(dt){
  TL.t+=dt;TL.mz.color.setHex(TLC[lightState('z')]);TL.mx.color.setHex(TLC[lightState('x')]);
  updateWeather(dt);
  if(started&&!player.inside){const D=distAt(player.x,player.z);if(D!==curD){curD=D;toast(D.n,'');}}
}
