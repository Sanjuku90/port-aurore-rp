'use strict';
/* v40 · Nouvelle-Aurore: troisième ville, infrastructures, commerce, TGV/bus physiques, présidences et culling léger. */
(function(){
const C={x:-2150,z:0,x0:-2750,x1:-1550,z0:-620,z1:520};
const N={
  main:{name:'République de Port-Aurore',pres:'Présidente Amara Diallo',color:0x3d7be0,x:360,z:128},
  sol:{name:'République de Solenne',pres:'Président Élias Morel',color:0x2caa8e,x:SOL27.x+18,z:215},
  third:{name:'Fédération de Nouvelle-Aurore',pres:'Présidente Leïla N’Dour',color:0xd5a53b,x:C.x+20,z:145}
};
const S={trip:null,timer:0,loaded:false,owned:{},votes:{}};
try{Object.assign(S,JSON.parse(localStorage.getItem('pa-nation40')||'{}'));}catch(e){}
function save(){try{localStorage.setItem('pa-nation40',JSON.stringify({owned:S.owned,votes:S.votes}));}catch(e){}}
const mat=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function box(parent,x,y,z,w,h,d,color,opts={}){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,opts.r||.8,opts.m||0));o.position.set(x,y,z);o.castShadow=!!opts.shadow;o.receiveShadow=true;parent.add(o);return o;}
function ground(x,z,w,d,c){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat(c,.96));o.rotation.x=-Math.PI/2;o.position.set(x,.02,z);o.receiveShadow=true;scene.add(o);return o;}
function sign(x,z,name,color){const cv=document.createElement('canvas');cv.width=512;cv.height=96;const g=cv.getContext('2d');g.fillStyle='#'+color.toString(16).padStart(6,'0');g.fillRect(0,0,512,96);g.fillStyle='#fff';g.font='700 42px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(name,256,49);const m=new THREE.Mesh(new THREE.PlaneGeometry(14,2.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide}));m.position.set(x,6,z);scene.add(m);}
function civic(x,z,name,color,id,opts={}){const g=new THREE.Group();scene.add(g);const w=opts.w||27,d=opts.d||19,h=opts.h||12;
  box(g,0,h/2,0,w,h,d,color,{shadow:true});box(g,0,h+.45,0,w+2,.9,d+2,opts.roof||0x3a4653,{shadow:true});
  box(g,0,2.15,d/2+.08,3.2,4.3,.22,0x4a382b);[-1,1].forEach(q=>{box(g,q*w*.28,5,d/2+.09,3.2,3.2,.18,0x91c7dc);box(g,q*w*.28-1.65,5,d/2+.19,.16,3.4,.12,0xf0e4c8);});
  const sx=x,sz=z;g.position.set(x,0,z);const sg=sign(0,0,name,color);sg.position.set(0,h*.78,d/2+.16);scene.remove(sg);g.add(sg);boxes.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,big:true});addSpot(sx,sz+d/2+4,id,color,name);return g;}
function buildCity(){if(S.loaded)return;S.loaded=true;
  ground(C.x,C.z,1250,1180,0x78836f);
  const roadMat=mat(0x343a40,.96),sideMat=mat(0xc1c3bc,.95),laneMat=mat(0xe1c950,.8);
  const roadGeo=new THREE.PlaneGeometry(15,1180),sideGeo=new THREE.PlaneGeometry(3,1180),lineGeo=new THREE.PlaneGeometry(.22,1180);
  for(let i=-2;i<=2;i++){const x=C.x+i*190;for(const [dx,m] of [[0,roadMat],[-9,sideMat],[9,sideMat]]){const q=new THREE.Mesh(dx===0?roadGeo:sideGeo,m);q.rotation.x=-Math.PI/2;q.position.set(x+dx,.04,C.z);scene.add(q);}const l=new THREE.Mesh(lineGeo,laneMat);l.rotation.x=-Math.PI/2;l.position.set(x,.055,C.z);scene.add(l);}
  const crossGeo=new THREE.PlaneGeometry(1250,14),crossSide=new THREE.PlaneGeometry(1250,3);
  for(let j=-2;j<=2;j++){const z=C.z+j*180;for(const [dz,m] of [[0,roadMat],[-9,sideMat],[9,sideMat]]){const q=new THREE.Mesh(dz===0?crossGeo:crossSide,m);q.rotation.x=-Math.PI/2;q.position.set(C.x,.04,z+dz);scene.add(q);}}
  // Repeated low-rise blocks are instanced so the new city doesn't become a draw-call tax.
  const geo=new THREE.BoxGeometry(1,1,1),base=new THREE.InstancedMesh(geo,mat(0xd5d1c5),48),roof=new THREE.InstancedMesh(geo,mat(0x505a63),48),win=new THREE.InstancedMesh(new THREE.BoxGeometry(.18,.22,.025),mat(0x92c8dc,.35),192);
  const D=new THREE.Object3D();let bi=0,wi=0;
  for(let ix=-2;ix<=2;ix++)for(let iz=-2;iz<=2;iz++){if((Math.abs(ix)<=1&&Math.abs(iz)<=1)||((ix+iz)%2===0))continue;const x=C.x+ix*190+70,z=C.z+iz*180+63,h=12+((ix*7+iz*11+101)%4)*3,w=38,d=38;
    D.position.set(x,h/2,z);D.scale.set(w,h,d);D.updateMatrix();base.setMatrixAt(bi,D.matrix);base.setColorAt(bi,new THREE.Color([0xd8d3c5,0xc3d3d6,0xd3c7b8,0xb9c7bf][bi%4]));D.position.set(x,h+.5,z);D.scale.set(w+1,1,d+1);D.updateMatrix();roof.setMatrixAt(bi,D.matrix);
    for(let f=0;f<3;f++)for(let q=-1;q<=1;q++){D.position.set(x+q*10,3+f*4,z+d/2+.03);D.scale.set(2.2,1.8,.05);D.updateMatrix();win.setMatrixAt(wi++,D.matrix);}bi++;}
  base.count=bi;roof.count=bi;win.count=wi;scene.add(base,roof,win);
  // Green corridors and a compact civic square.
  ground(C.x,C.z+320,820,68,0x548153);for(let i=0;i<24;i++){const x=C.x-390+i*34;const t=new THREE.Mesh(new THREE.CylinderGeometry(.25,.4,4,7),mat(0x725239));t.position.set(x,2,C.z+320);scene.add(t);const crown=new THREE.Mesh(new THREE.SphereGeometry(2.25,8,6),mat(i%2?0x43844d:0x559257));crown.position.set(x,5,C.z+320);scene.add(crown);}
  ground(C.x,C.z+5,110,90,0xbeb9ab);
  const places=[
   ['Palais fédéral',-260,-255,0xc8b995,'nat40:president',{w:44,d:28,h:16}],
   ['Hôpital central',-70,-255,0xe9e7df,'nat40:hospital',{w:38,d:24,h:17}],
   ['Université',120,-255,0xd4c8a7,'nat40:university',{w:38,d:24,h:14}],
   ['Aéroport international',310,-255,0x7b9aab,'nat40:airport',{w:50,d:25,h:10}],
   ['Gare TGV',-450,-75,0x334b61,'nat40:station:third',{w:43,d:24,h:11}],
   ['Centre commercial',-260,-75,0x477f84,'nat40:mall',{w:42,d:24,h:14}],
   ['Marché central',-70,-75,0xb88748,'nat40:market',{w:32,d:20,h:9}],
   ['Banque fédérale',120,-75,0x4e7490,'nat40:bank',{w:32,d:21,h:12}],
   ['Commissariat',310,-75,0x43566b,'nat40:police',{w:30,d:20,h:12}],
   ['Caserne de pompiers',-450,105,0xb94e42,'nat40:fire',{w:33,d:22,h:11}],
   ['Palais de justice',-260,105,0x9e9b90,'nat40:court',{w:34,d:23,h:13}],
   ['Stade national',-70,105,0x478159,'nat40:stadium',{w:42,d:30,h:12}],
   ['Port de commerce',120,105,0x597687,'nat40:port',{w:38,d:22,h:10}],
   ['Parc industriel',310,105,0x696e73,'nat40:industry',{w:42,d:24,h:11}],
   ['Gare routière',-450,285,0x527c7e,'nat40:busstation',{w:35,d:20,h:9}],
   ['Hôtel de ville',-260,285,0x778c8b,'nat40:civic',{w:29,d:20,h:11}],
   ['Résidence des jardins',-70,285,0x8c997a,'nat40:homes',{w:34,d:22,h:16}],
   ['Centre culturel',120,285,0x865c75,'nat40:culture',{w:31,d:22,h:12}],
   ['Station d’épuration',310,285,0x637a72,'nat40:water',{w:33,d:22,h:10}]
  ];
  places.forEach(([name,dx,dz,color,id,o])=>{const z=C.z+dz;const g=civic(C.x+dx,z,name,color,id,o);if(id==='nat40:president')N.third.x=C.x+dx,N.third.z=z+o.d/2+4;});
  // bus shelters and stops; interactable boarding points
  [[-450,285,'Gare routière'],[-260,-255,'Hôpital'],[120,-255,'Université'],[-260,-75,'Centre commercial'],[-70,105,'Stade']].forEach(([dx,dz,n],i)=>{const x=C.x+dx+28,z=C.z+dz+24;box(scene,x,1.5,z,4,3,2,0x40515a);box(scene,x,3.1,z,4.4,.25,2.4,0x8fc5cc);addSpot(x,z,'nat40:bus:'+i,0x4fd1b0,'Arrêt de bus · '+n);});
  const mainCivic=civic(N.main.x,N.main.z,'Palais présidentiel',0x546e91,'nat40:president:main',{w:28,d:18,h:12});
  // A Solenne presidential office is placed at the existing island village.
  civic(N.sol.x,N.sol.z,'Palais de Solenne',0x547c70,'nat40:president:sol',{w:24,d:17,h:10});
  buildRail();buildVehicle('train');buildVehicle('bus');
}
function buildRail(){const a={x:-330,z:-245},b={x:C.x-450,z:C.z-75+24/2+4};
  const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),ang=Math.atan2(dx,dz),mid={x:(a.x+b.x)/2,z:(a.z+b.z)/2};
  const track=new THREE.Group();track.position.set(mid.x,0,mid.z);track.rotation.y=ang;scene.add(track);
  const ballast=new THREE.Mesh(new THREE.BoxGeometry(len,.5,6),mat(0x666760));ballast.position.y=.45;track.add(ballast);
  for(const side of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(len,.35,.28),mat(0x9ba2a3,.32,.65));rail.position.set(0,.82,side*1.05);track.add(rail);}
  const count=Math.ceil(len/8),sleep=new THREE.InstancedMesh(new THREE.BoxGeometry(2.2,.25,4.5),mat(0x594638),count),D=new THREE.Object3D();
  for(let i=0;i<count;i++){const t=i/(count-1),x=a.x+dx*t,z=a.z+dz*t;D.position.set(x,.63,z);D.rotation.y=ang;D.updateMatrix();sleep.setMatrixAt(i,D.matrix);}scene.add(sleep);
  // Port-Aurore TGV terminal, platform, canopy and boarding marker.
  const terminal=new THREE.Group();scene.add(terminal);terminal.position.set(a.x,0,a.z);
  const tm=mat(0x40576b,.7),glass=mat(0x8ec6d9,.25,.1),metal=mat(0xadb7bc,.35,.6);
  const pl=new THREE.Mesh(new THREE.BoxGeometry(34,.35,12),mat(0x777c7c));pl.position.set(0,.25,0);terminal.add(pl);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(28,.55,9),tm);roof.position.set(0,6,0);terminal.add(roof);
  for(const x of [-12,-6,0,6,12]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,5.5,8),metal);p.position.set(x,3,0);terminal.add(p);}
  const pane=new THREE.Mesh(new THREE.BoxGeometry(24,2.3,.08),glass);pane.position.set(0,2.4,4.2);terminal.add(pane);
  addSpot(a.x,a.z+7,'nat40:station:main',0xe7c352,'Gare TGV · Port-Aurore');
}
function buildVehicle(type){const g=new THREE.Group();const color=type==='train'?0xe8e8e3:0xd8ad30;
  const len=type==='train'?19:9,w=type==='train'?4.1:3.1,h=type==='train'?4.1:3.1;
  box(g,0,h/2,0,len,h,w,color,{shadow:true});box(g,0,h+.13,0,len*.92,.24,w*.98,type==='train'?0x37536b:0x3b4144); 
  const windowMat=mat(type==='train'?0x85b6cc:0x8ac7d6,.22,.1);
  for(let i=-3;i<=3;i++){const q=new THREE.Mesh(new THREE.BoxGeometry(type==='train'?1.45:1.05,1.45,.08),windowMat);q.position.set(i*(type==='train'?2.35:1.2),h*.68,w/2+.04);g.add(q);q.rotation.y=0;}
  for(const s of [-1,1])for(const z of [-w*.37,w*.37]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.26,12),mat(0x202428));wh.rotation.x=Math.PI/2;wh.position.set(s*len*.32,.48,z);g.add(wh);}
  g.visible=false;scene.add(g);type==='train'?S.train=g:S.bus=g;
}
function ridePanel(type,stop){
  if(player.car||player.inside||S.trip){toast('Descends du véhicule et sors du bâtiment avant d’embarquer.','warn');return;}
  if(type==='train'){
    const atMain=stop==='main', dest=atMain?'Nouvelle-Aurore':'Port-Aurore', fare=atMain?35:35;
    openPanel('TGV · '+(atMain?'Port-Aurore → Nouvelle-Aurore':'Nouvelle-Aurore → Port-Aurore'),'Monte à bord. Le train part réellement sur la voie, puis s’arrête en gare. Durée du trajet : environ 18 secondes.',[
      {label:'Embarquer · '+fmt(fare),off:state.cash<fare,fn:()=>startTrip('train',atMain?'third':'main',fare)}]);
    return;
  }
  const i=Number(stop)||0, names=['Gare centrale','Hôpital','Université','Centre commercial','Stade'];
  const dests=names.map((n,j)=>({n,j})).filter(q=>q.j!==i);
  openPanel('Bus urbain · arrêt de '+names[i],'Tu montes dans le bus. Il roule sur sa ligne et tu peux suivre le trajet. Choisis ton arrêt.',dests.map(d=>({label:'Aller à '+d.n+' · $3',off:state.cash<3,fn:()=>startTrip('bus',String(d.j),3,i)})));
}
const busStops=[[-450,285],[-260,-255],[120,-255],[-260,-75],[-70,105]].map(([x,z])=>({x:C.x+x+28,z:C.z+z+24}));
function routeFor(type,dest,from){if(type==='train')return dest==='third'?[{x:-330,z:-245},{x:C.x-450,z:C.z-75}]:[{x:C.x-450,z:C.z-75},{x:-330,z:-245}];
  const a=busStops[from],b=busStops[+dest];const mid={x:(a.x+b.x)/2,z:(a.z+b.z)/2};return [a,{x:mid.x,z:a.z},{x:mid.x,z:b.z},b];}
function startTrip(type,dest,fare,from=0){if(state.cash<fare)return;state.cash-=fare;saveProgress();const pts=routeFor(type,dest,from),length=pts.slice(1).reduce((s,p,i)=>s+Math.hypot(p.x-pts[i].x,p.z-pts[i].z),0);S.trip={type,dest,pts,seg:0,along:0,length,dur:type==='train'?Math.max(10,length/95):Math.max(6,length/18),from};S[type==='train'?'train':'bus'].visible=true;S.timer=0;panelOpen=false;$('#panel').hidden=true;toast(type==='train'?'TGV en gare, embarquement terminé.':'Bus en route, prochain arrêt affiché.','good');}
function finishTrip(){const q=S.trip;if(!q)return;const p=q.pts[q.pts.length-1];player.x=p.x;player.z=p.z;player.moving=0;player.mesh.visible=true;S[q.type==='train'?'train':'bus'].visible=false;S.trip=null;gameMin+=q.type==='train'?20:4;state.energy=Math.max(0,state.energy-(q.type==='train'?2:1));toast(q.type==='train'?'Arrivée en gare. Tu peux descendre du TGV.':'Arrêt atteint. Tu peux descendre du bus.','good');saveProgress();}
function tickTrip(dt){const q=S.trip;if(!q)return;S.timer+=dt;const f=clamp(S.timer/q.dur,0,1),target=q.length*f;let sum=0,idx=1;for(;idx<q.pts.length;idx++){const len=Math.hypot(q.pts[idx].x-q.pts[idx-1].x,q.pts[idx].z-q.pts[idx-1].z);if(sum+len>=target)break;sum+=len;}
  idx=Math.min(idx,q.pts.length-1);const a=q.pts[idx-1],b=q.pts[idx],seg=Math.hypot(b.x-a.x,b.z-a.z)||1,t=clamp((target-sum)/seg,0,1);player.x=lerp(a.x,b.x,t);player.z=lerp(a.z,b.z,t);player.h=Math.atan2(b.x-a.x,b.z-a.z);player.moving=0;
  const v=S[q.type==='train'?'train':'bus'];v.position.set(player.x,.12,player.z);v.rotation.y=player.h;player.mesh.visible=false;
  if(f>=1)finishTrip();}
function shop(id){const pay=(name,c,act)=>({label:name+' · '+fmt(c),off:state.cash<c,fn:()=>{state.cash-=c;act();state.rep=(state.rep||0)+1;saveProgress();toast(name+' acheté.','good');}});
 if(id==='nat40:market')openPanel('Marché central · Nouvelle-Aurore','Produits frais, vente au comptoir.',[pay('Fruits de saison',8,()=>state.hunger=Math.min(100,state.hunger+25)),pay('Poisson du port',16,()=>state.hunger=Math.min(100,state.hunger+48)),pay('Panier familial',22,()=>{state.hunger=Math.min(100,state.hunger+60);state.fun=Math.min(100,state.fun+5);})]);
 else if(id==='nat40:mall')openPanel('Galeries de Nouvelle-Aurore','Commerce local, mêmes achats utiles que dans la première ville.',[pay('Tenue urbaine',32,()=>{look.s=0x2f7d68;look.t='veste';}),pay('Chaussures de ville',24,()=>{state.fun=Math.min(100,state.fun+10);}),pay('Casque audio',45,()=>{state.fun=Math.min(100,state.fun+18);}),pay('Repas complet',18,()=>state.hunger=Math.min(100,state.hunger+55))]);
 else if(id==='nat40:bank')openPanel('Banque fédérale','Tes comptes restent ceux du même personnage.',[{label:'Déposer tout le cash',off:state.cash<=0,fn:()=>{state.bank+=state.cash;state.cash=0;saveProgress();}},{label:'Retirer $100',off:state.bank<100,fn:()=>{state.bank-=100;state.cash+=100;saveProgress();}}]);
 else if(id==='nat40:hospital')openPanel('Hôpital central','Urgences et soins de proximité.',[{label:'Soins complets · $45',off:state.cash<45,fn:()=>{state.cash-=45;state.health=100;saveProgress();toast('Soins terminés.','good');}},{label:'Repas patient · $12',off:state.cash<12,fn:()=>{state.cash-=12;state.hunger=Math.min(100,state.hunger+40);}}]);
 else if(id==='nat40:airport')openPanel('Aéroport international','Terminal régional et desserte de Solenne.',[{label:'Consulter les destinations',fn:()=>openPanel('Vols régionaux','Port-Aurore et Solenne restent reliées par le vol existant depuis leurs terminaux. Consulte le comptoir de l’aéroport pour prendre un vol.',[{label:'Voir les services de l’aéroport',fn:()=>{toast('Le terminal de Port-Aurore est balisé sur la carte.','good');}}])}]);
 else if(id==='nat40:university')openPanel('Université fédérale','Campus, formation et vie étudiante.',[{label:'Cours de gestion · $20',off:state.cash<20,fn:()=>{state.cash-=20;gameMin+=60;state.fun=Math.min(100,state.fun+8);toast('Cours terminé.','good');}},{label:'Étudier gratuitement',fn:()=>{gameMin+=45;state.energy=Math.max(0,state.energy-4);state.rep++;}}]);
 else if(id==='nat40:president'||id==='nat40:president:main'||id==='nat40:president:sol')president(id);
 else if(id==='nat40:bus:0'||id.startsWith('nat40:bus:'))ridePanel('bus',id.slice(10));
 else if(id.startsWith('nat40:station:'))ridePanel('train',id.endsWith('main')?'main':'third');
 else if(id==='nat40:police')openPanel('Commissariat central','Dépose un signalement ou rejoins les forces de sécurité.',[{label:'Signaler un incident',fn:()=>{state.rep=(state.rep||0)+1;toast('Signalement enregistré par le commissariat.','good');}},{label:'Rejoindre la police',fn:()=>{state.job='police';toast('Affectation enregistrée. Consulte le Pôle Emploi pour les missions.','good');saveProgress();}}]);
 else if(id==='nat40:fire')openPanel('Caserne de pompiers','Centre de secours et de prévention.',[{label:'Suivre la formation de secours · $15',off:state.cash<15,fn:()=>{state.cash-=15;state.rep=(state.rep||0)+1;gameMin+=45;toast('Formation terminée.','good');}},{label:'Rejoindre les pompiers',fn:()=>{state.job='pompier';toast('Affectation enregistrée.','good');saveProgress();}}]);
 else if(id==='nat40:court')openPanel('Palais de justice','Information juridique et démarches civiles.',[{label:'Consulter un juriste · $20',off:state.cash<20,fn:()=>{state.cash-=20;gameMin+=30;toast('Entretien juridique terminé.','good');}},{label:'Déclarer un litige commercial',fn:()=>toast('Déclaration déposée au greffe.','good')}]);
 else if(id==='nat40:stadium')openPanel('Stade national','Terrain ouvert. Joue un match rapide.',[MG29.act('Jouer au football',0,'football',{id:'nation40-foot',title:'Match au Stade national',duration:45,replay:true,gain:{fun:18,energy:-10,rep:1}}),MG29.act('Défi basket',0,'basketball',{id:'nation40-basket',title:'Défi basket national',duration:40,replay:true,gain:{fun:16,energy:-8}})]);
 else if(id==='nat40:port')openPanel('Port de commerce','Échanges de marchandises et services portuaires.',[{label:'Vendre la pêche du jour · +$28',fn:()=>{state.cash+=28;state.earned=(state.earned||0)+28;state.rep=(state.rep||0)+1;toast('Lot vendu à la criée. +$28','good');saveProgress();}},{label:'Prendre un contrat de manutention',fn:()=>{state.job='docker';toast('Contrat portuaire accepté.','good');saveProgress();}}]);
 else if(id==='nat40:industry')openPanel('Parc industriel','Ateliers, entrepôts et entreprises locales.',[{label:'Mission de livraison industrielle · +$35',fn:()=>{state.cash+=35;state.earned=(state.earned||0)+35;gameMin+=25;toast('Livraison terminée. +$35','good');saveProgress();}},{label:'Consulter les entreprises',fn:()=>openPanel('Zone d’activités','Ateliers de réparation, logistique et production locale.',[{label:'Compris',fn:()=>{}}])}]);
 else if(id==='nat40:civic')president('nat40:president');
 else if(id==='nat40:homes')openPanel('Résidences des jardins','Logement temporaire et repos.',[{label:'Louer une nuit · $25',off:state.cash<25,fn:()=>{state.cash-=25;state.energy=Math.min(100,state.energy+35);gameMin+=90;toast('Nuit réservée. Énergie +35.','good');saveProgress();}}]);
 else if(id==='nat40:culture')openPanel('Centre culturel','Expositions, concerts et ateliers.',[{label:'Visiter l’exposition · $6',off:state.cash<6,fn:()=>{state.cash-=6;state.fun=Math.min(100,state.fun+16);gameMin+=30;toast('Visite terminée. Humeur +16.','good');}},{label:'Atelier de musique · $12',off:state.cash<12,fn:()=>{state.cash-=12;state.fun=Math.min(100,state.fun+22);gameMin+=45;toast('Atelier terminé.','good');}}]);
 else if(id==='nat40:water')openPanel('Station d’épuration','Service public de l’eau et de l’assainissement.',[{label:'Faire un don citoyen · $10',off:state.cash<10,fn:()=>{state.cash-=10;state.rep=(state.rep||0)+2;toast('Contribution enregistrée.','good');saveProgress();}},{label:'Consulter la qualité de l’eau',fn:()=>toast('Qualité de l’eau : contrôlée et conforme.','good')}]);
 else if(id==='nat40:busstation')ridePanel('bus','0');
 else if(id.startsWith('nat40:bus:'))ridePanel('bus',id.slice(10));
}
function president(id){const key=id.endsWith(':main')?'main':id.endsWith(':sol')?'sol':'third',n=N[key];const vote=S.votes[key];openPanel(n.name,'Chef d’État : '+n.pres+'. Palais ouvert au public. Le commerce et les services restent accessibles dans cette nation.',[
 {label:'Demander une audience',fn:()=>{state.fun=Math.min(100,state.fun+4);toast('Audience accordée. La présidence te remercie pour ta visite.','good');}},
 {label:vote?'Soutien enregistré · '+vote:'Exprimer mon soutien',fn:()=>{const candidates=['Amara Diallo','Élias Morel','Leïla N’Dour'];const candidate=key==='main'?candidates[0]:key==='sol'?candidates[1]:candidates[2];S.votes[key]=candidate;save();toast('Soutien enregistré pour '+candidate+'.','good');}},
 {label:'Consulter les infrastructures',fn:()=>openPanel('Services publics','Hôpital, université, sécurité, justice, transports, port et commerces sont représentés dans cette ville.',[{label:'Compris',fn:()=>{}}])}
]);}
function nationsMap(){const k=player.x<C.x+600&&player.x>C.x-600?'third':player.x<-3000?'sol':'main';const n=N[k];openPanel('Carte · '+n.name,'Déplace-toi entre les quartiers à pied, en bus, ou prends le TGV pour Port-Aurore et Nouvelle-Aurore.',[
 {label:'Tracer la route vers la gare TGV',fn:()=>{const p=k==='third'?{x:C.x-450,z:-59}:{x:-330,z:-245};wp={x:p.x,z:p.z,l:'Gare TGV'};toast('Itinéraire vers la gare ajouté.','good');}},
 {label:'Trouver l’hôtel de luxe',fn:()=>{const id=k==='third'?'hotel40:third':k==='sol'?'sol28hotel':'hotel40:pax',h=spots.find(q=>q.id===id);if(h){wp={x:h.x,z:h.z,l:h.label};toast('Itinéraire vers '+h.label+' ajouté.','good');}else toast('Suis les panneaux vers le palace de la ville.','warn');}},
 ...(k==='sol'?[{label:'Rejoindre l’aéroport de Solenne',fn:()=>{wp={x:SOL27.x+18,z:130,l:'Aéroport de Solenne'};toast('Suis le repère jusqu’au terminal.','good');}}]:[{label:'Voir les transports',fn:()=>ridePanel('train',k==='third'?'third':'main')}])
]);}
const _bd=buildDecor;buildDecor=function(){_bd();try{buildCity();}catch(e){console.warn('nation40 build',e);}};
const _open=openSpot;openSpot=function(id){if(typeof id==='string'&&(id.startsWith('nat40:')||id==='nat40:president')){shop(id);return;}_open(id);};
const _interact=interact;interact=function(){if(S.trip){toast('Tu es à bord. Attends l’arrêt pour descendre.','warn');return;}_interact();};
const _up=update;update=function(dt){_up(dt);tickTrip(dt);};
const _upd=updatePlayer;updatePlayer=function(dt){if(S.trip)return;_upd(dt);};
const _wp=worldB27;worldB27=function(x){const v=x==null?player.x:x;if(v<C.x+650&&v>C.x-650)return [C.x-600,C.x+600,C.z0,C.z1];return _wp(x);};
const _big=openBigMap;openBigMap=function(){if(player.x<C.x+650&&player.x>C.x-650){nationsMap();return;}_big();};
// Performance win: distant pedestrians and traffic no longer run full per-frame simulation.
const _ped=updatePed;updatePed=function(p,dt){if(Math.abs(p.x-camera.position.x)>115||Math.abs(p.z-camera.position.z)>115){p.mesh.visible=false;return;}_ped(p,dt);};
if(typeof updateNpc==='function'){const _npc=updateNpc;updateNpc=function(c,dt){if(Math.abs(c.x-camera.position.x)>155||Math.abs(c.z-camera.position.z)>155){c.mesh.visible=false;return;}_npc(c,dt);};}
const _oldUpdate=update; // documented hook for future profiling, kept intentionally side-effect free
window.NATION40={state:S,thirdCity:{x:C.x,z:C.z},openPresident:president};
})();
