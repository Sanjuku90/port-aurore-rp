'use strict';
/* ---------- phase 4 : transport, propriété, services et cartographie ---------- */
const FLEET_KEY='port-aurore-fleet-v1';
const FLEET_CATALOG=[
  {id:'scooter',label:'Scooter urbain',price:850,kind:'scooter',top:17,acc:1.2,license:'moto'},
  {id:'motorcycle',label:'Moto routière',price:2400,kind:'motorcycle',top:32,acc:1.7,license:'moto'},
  {id:'sedan',label:'Berline',price:5200,kind:'sedan',top:27,acc:1,license:'auto'},
  {id:'suv',label:'SUV',price:7800,kind:'suv',top:25,acc:.9,license:'auto'},
  {id:'sport',label:'Sportive',price:14000,kind:'sport',top:34,acc:1.35,license:'auto'},
  {id:'bus',label:'Bus urbain',price:22500,kind:'bus',top:20,acc:.65,license:'pro'},
  {id:'truck',label:'Camion de livraison',price:19500,kind:'truck',top:22,acc:.75,license:'pro'},
  {id:'police',label:'Véhicule de police',price:18000,kind:'police',top:30,acc:1.15,license:'service'},
  {id:'ambulance',label:'Ambulance',price:23500,kind:'ambulance',top:26,acc:.9,license:'service'},
  {id:'firetruck',label:'Camion de pompiers',price:29500,kind:'firetruck',top:19,acc:.6,license:'service'},
  {id:'benz',label:'Benz Berline Luxe',price:16000,kind:'benz',top:29,acc:1.0,license:'auto'},
  {id:'lambo',label:'Lambo Wedge',price:42000,kind:'lambo',top:44,acc:1.5,license:'auto'},
  {id:'ford',label:'Ford Muscle',price:9000,kind:'ford',top:38,acc:1.4,license:'auto'},
  {id:'toyota',label:'Toyota Compacte',price:6000,kind:'toyota',top:25,acc:1.0,license:'auto'},
  {id:'ferrari',label:'Ferrari Rouge GT',price:45000,kind:'ferrari',top:46,acc:1.55,license:'auto'},
  {id:'porsche',label:'Porsche Coupé',price:26000,kind:'porsche',top:40,acc:1.45,license:'auto'},
  {id:'bmw',label:'BMW Sport Sedan',price:13000,kind:'bmw',top:31,acc:1.1,license:'auto'},
  {id:'honda',label:'Honda Citadine',price:5500,kind:'honda',top:24,acc:1.0,license:'auto'},
  {id:'jeep',label:'Jeep Tout-Terrain',price:11000,kind:'jeep',top:24,acc:0.85,license:'auto'},
  {id:'hyundai',label:'Hyundai Familiale',price:5000,kind:'hyundai',top:25,acc:1.0,license:'auto'}
];
const VEHICLE_LICENSE={auto:'Permis B',moto:'Permis moto',pro:'Permis poids lourd',service:'Permis de service'};
let fleetOwned=[],fleetPaint={},p4FuelTick=0,drivingExam=null;state.license=state.license||{};
try{const q=JSON.parse(localStorage.getItem('port-aurore-paint-v1')||'{}');if(q&&typeof q==='object')fleetPaint=q;}catch(e){}
const _loadProgressP4=loadProgress;loadProgress=function(){_loadProgressP4();try{const q=JSON.parse(localStorage.getItem('port-aurore-rp')||'null');if(q&&q.license&&typeof q.license==='object')state.license=q.license;}catch(e){}};
const _saveProgressP4=saveProgress;saveProgress=function(){_saveProgressP4();if(started)try{const q=JSON.parse(localStorage.getItem('port-aurore-rp')||'{}');q.license=state.license||{};localStorage.setItem('port-aurore-rp',JSON.stringify(q));}catch(e){}};
function p4PaintVehicle(car,color){car.mesh.traverse(o=>{if(!o.isMesh)return;const arr=Array.isArray(o.material)?o.material:[o.material];let changed=false;const next=arr.map(m=>{if(!m||!m.userData||!m.userData.p4Paintable||!m.color)return m;const clone=m.clone();clone.userData=Object.assign({},m.userData);clone.color.setHex(color);clone.needsUpdate=true;changed=true;return clone;});if(changed)o.material=Array.isArray(o.material)?next:next[0];});car.paint=color;}
function paintFleet(id,color){fleetPaint[id]=color;try{localStorage.setItem('port-aurore-paint-v1',JSON.stringify(fleetPaint));}catch(e){}cars.filter(c=>c.owned&&c.type===id).forEach(c=>p4PaintVehicle(c,color));toast('Peinture appliquée.','good');}

try{const f=JSON.parse(localStorage.getItem(FLEET_KEY)||'[]');if(Array.isArray(f))fleetOwned=f.filter(x=>FLEET_CATALOG.some(v=>v.id===x)).slice(0,50);}catch(e){}
function resetFleetP4(){fleetOwned=[];fleetPaint={};drivingExam=null;try{localStorage.removeItem(FLEET_KEY);localStorage.removeItem('port-aurore-paint-v1');}catch(e){}}
function saveFleet(){try{localStorage.setItem(FLEET_KEY,JSON.stringify(fleetOwned));}catch(e){}}
function p4mat(color,roughness=.48,metalness=.16){return new THREE.MeshStandardMaterial({color,roughness,metalness});}
function p4box(g,w,h,d,x,y,z,mat){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;}
function p4cyl(g,r,len,x,y,z,mat,axis='x'){
  const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,18),mat);if(axis==='x')o.rotation.z=Math.PI/2;else if(axis==='z')o.rotation.x=Math.PI/2;o.position.set(x,y,z);o.castShadow=true;g.add(o);return o;
}
function specialVehicleMesh(kind,color){
  const g=new THREE.Group(),paint=p4mat(color,.27,.38),dark=p4mat(0x17191d,.74,.05),glass=new THREE.MeshPhysicalMaterial({color:0x416174,roughness:.16,metalness:.2,transparent:true,opacity:.7}),rubber=p4mat(0x111214,.9),chrome=p4mat(0xc1c7cc,.24,.85),lamp=p4mat(0xf8eec3,.18,.15);
  const wheels=[];
  const wheel=(x,z,r)=>{const pivot=new THREE.Group();pivot.position.set(x,r,z);g.add(pivot);const t=p4cyl(pivot,r,.22,0,0,0,rubber);wheels.push(t);p4cyl(pivot,r*.57,.235,0,0,0,chrome);};
  if(kind==='motorcycle'||kind==='scooter'){
    const scooter=kind==='scooter';wheel(0,1.18,scooter?.32:.39);wheel(0,-1.05,scooter?.32:.39);
    p4box(g,.18,.22,1.65,0,.7,.02,chrome);p4box(g,.58,.52,.9,0,1.05,-.02,paint);
    if(scooter){p4box(g,.58,.88,.24,0,1.08,.82,paint);p4box(g,.5,.12,.55,0,.54,.25,dark);p4box(g,.48,.16,.64,0,1.38,-.32,dark);}
    else{const tank=new THREE.Mesh(new THREE.SphereGeometry(.42,18,12),paint);tank.scale.set(.8,.7,1.35);tank.position.set(0,1.12,.24);g.add(tank);p4box(g,.48,.16,.78,0,1.36,-.48,dark);p4box(g,.08,.13,.6,0,1.6,.65,chrome);p4box(g,.72,.06,.12,0,1.56,.82,chrome);}
    p4box(g,.17,.35,.22,0,1.5,1.02,lamp);p4box(g,.08,.08,.08,-.33,.97,.05,dark);p4box(g,.08,.08,.08,.33,.97,.05,dark);
  }else{
    const bus=kind==='bus',truck=kind==='truck'||kind==='firetruck',service=kind==='police'||kind==='ambulance';
    const length=bus?9.4:truck?8.2:4.6,width=bus||truck?2.65:1.95;
    const wheelZ=bus?[-3.2,-.8,3.0]:truck?[-2.8,.7,2.8]:[-1.38,1.38];
    wheelZ.forEach((z,i)=>{const x=width/2+.02;wheel(x,z,bus||truck?.46:.37);wheel(-x,z,bus||truck?.46:.37);});
    if(bus){p4box(g,width,2.65,length,0,1.7,0,paint);p4box(g,width+.02,.24,length-.12,0,3.03,0,dark);
      for(let side of [-1,1])for(let z=-3.7;z<=3.5;z+=1.05)p4box(g,.035,1.05,.78,side*(width/2+.015),2.05,z,glass);
      p4box(g,width,.24,.1,0,.72,-length/2,dark);
    }else if(truck){p4box(g,width,.18,length,0,.82,-.1,dark);p4box(g,width,2.35,4.25,0,2.12,-1.62,kind==='firetruck'?p4mat(0xc72f25,.35,.12):p4mat(0xe8e7e2,.5,.1));
      p4box(g,width,1.25,2.25,0,1.65,2.25,paint);p4box(g,width-.18,.9,.08,0,2.08,3.39,glass);p4box(g,width+.06,.12,4.3,0,.95,-1.62,dark);
      if(kind==='firetruck'){p4box(g,.06,.08,3.4,-.82,3.38,-1.6,chrome);p4box(g,.06,.08,3.4,.82,3.38,-1.6,chrome);}
    }else{
      const cBody=kind==='police'?p4mat(0xe7e7e6,.26,.22):kind==='ambulance'?p4mat(0xf4f4ef,.3,.14):paint;
      p4box(g,2,.48,4.4,0,.68,0,cBody);p4box(g,1.74,.68,2.25,0,1.28,-.05,glass);p4box(g,1.92,.12,1.05,0,.96,1.46,paint);p4box(g,1.92,.12,1.05,0,.96,-1.42,paint);
      p4box(g,.46,.14,.05,-.65,.78,2.2,lamp);p4box(g,.46,.14,.05,.65,.78,2.2,lamp);
      if(kind==='police'){p4box(g,.72,.17,.26,0,1.76,-.1,p4mat(0x1974d2,.2,.25));p4box(g,.14,.15,.24,-.25,1.78,-.1,p4mat(0x2b86ff,.18,.1));}
      if(kind==='ambulance'){p4box(g,.12,.72,.08,0,1.45,.04,p4mat(0xd52828,.25,.05));p4box(g,.72,.12,.08,0,1.45,.04,p4mat(0xd52828,.25,.05));}
    }
    if(kind==='firetruck'){p4box(g,.07,.09,3.4,-.95,3.54,-1.6,chrome);p4box(g,.07,.09,3.4,.95,3.54,-1.6,chrome);}
  }
  g.userData.wheels=wheels;g.userData.steer=[];if(kind==='motorcycle'||kind==='scooter')g.userData.steer=[g.children[0]];
  return g;
}
const _addCarP4=addCar;
addCar=function(x,z,h,color,kind,type){
  const special=['motorcycle','scooter','bus','truck','police','ambulance','firetruck'].includes(type);
  if(!special){const c=_addCarP4(x,z,h,color,kind,type);c.fuel=100;c.damage=0;c.stored=false;return c;}
  const mesh=specialVehicleMesh(type,color);mesh.traverse(o=>{if(o.isMesh){const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>{if(m&&m.color&&m.roughness<.35&&m.metalness<.5)m.userData.p4Paintable=true;});}});mesh.rotation.order='YXZ';mesh.position.set(x,0,z);mesh.rotation.y=h;scene.add(mesh);
  const svc=['police','ambulance','firetruck'].includes(type),top=svc?(type==='firetruck'?19:27):type==='bus'?20:type==='truck'?22:type==='motorcycle'?32:17,acc=svc?.9:type==='bus'?.65:type==='truck'?.75:type==='motorcycle'?1.7:1.2;
  const c={mesh,x,z,h,v:0,kind,lane:null,maxV:0,dmgT:0,type,top,acc,fuel:100,damage:0,stored:false};cars.push(c);
  if(svc){c.service=true;}
  return c;
};
const _driveCarP4=driveCar;
driveCar=function(c,dt){
  p4FuelTick=Math.max(0,p4FuelTick-dt);const oldx=c.x,oldz=c.z;
  if(c.fuel<=0){c.v*=Math.max(0,1-3*dt);if(Math.abs(c.v)<.15)c.v=0;if(player.car===c&&p4FuelTick<=0){p4FuelTick=3;toast('Réservoir vide : ouvre le sac 🎒 pour utiliser un bidon, ou trouve une station-service.','warn');}}
  else _driveCarP4(c,dt);
  if(player.car===c&&c.fuel>0){c.fuel=Math.max(0,c.fuel-Math.hypot(c.x-oldx,c.z-oldz)*.027);if(drivingExam){drivingExam.distance+=Math.hypot(c.x-oldx,c.z-oldz);}}
  if(player.car===c&&drivingExam&&drivingExam.distance>=110){state.license=state.license||{};state.license[drivingExam.type]=true;toast(VEHICLE_LICENSE[drivingExam.type]+' obtenu !','good');drivingExam=null;saveProgress();}
};
const _exitCarP4=exitCar;exitCar=function(){if(drivingExam){drivingExam=null;toast('Examen interrompu.','warn');}_exitCarP4();};
const _collideCarP4=collideCarWorld;
collideCarWorld=function(c){const hit=_collideCarP4(c);if(hit>0&&drivingExam&&player.car===c){drivingExam=null;toast('Examen raté : collision. Tu peux le repasser à l’auto-école.','bad');}return hit;};
function p4service(x,z,kind){const c=addCar(x,z,Math.PI,kind==='police'?0xf4f4f0:kind==='ambulance'?0xf4f4f0:0xc82d25,'npc',kind);c.lane={axis:'z',dir:-1};c.maxV=c.top*.42;c.v=c.maxV;return c;}
const _buildPhase2P4=buildPhase2;
buildPhase2=function(){_buildPhase2P4();
  addSpot(-192,-180,'dealership',0xffbe55,'Concessionnaire');
  addSpot(192,-180,'fuel',0x55d68b,'Station-service');
  addSpot(-192,116,'garage',0x7fc7ff,'Garage personnel');
  addSpot(192,116,'drivingschool',0xc79bff,'Auto-école');
  /* v22 : bâtiments détaillés construits dans batiments22.js */
  // Véhicules de circulation et de service sur les grands axes.
  [[-224,-74,'motorcycle',0xd94f4f],[160,82,'scooter',0x3d7be0],[-160,136,'bus',0x2e9a6a],[160,-140,'truck',0xe0a526],[-96,146,'police',0xf4f4f0],[96,-202,'ambulance',0xf4f4f0],[32,150,'firetruck',0xc82d25]].forEach(([x,z,t,c])=>{const v=p4service(x,z,t);v.v=v.maxV;});
};
const _openSpotP4=openSpot;
openSpot=function(id){
  if(id==='fuel'){
    const target=()=>player.car||cars.filter(c=>Math.hypot(c.x-player.x,c.z-player.z)<12).sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0]||null;
    const car=target(),dmg0=car?Math.round(car.damage||0):0,rep0=Math.round(10+dmg0*.8),txt=car?'Véhicule sélectionné · '+Math.round(car.fuel||0)+'% carburant · état '+(100-dmg0)+' %.':'Gare-toi près des pompes pour faire le plein ou réparer.';
    openPanel('Station-service',txt,[
      {label:'Faire le plein · $45',off:state.cash<45||!car||(car.fuel||0)>=99,fn:()=>{const c=target();if(!c||state.cash<45)return;state.cash-=45;c.fuel=100;toast('Plein effectué.','good');saveProgress();openSpot('fuel');}},
      {label:'Réparer la carrosserie · $'+rep0+(dmg0?' (état '+(100-dmg0)+' %)':''),off:!car||dmg0<1||state.cash<rep0,fn:()=>{const c=target();if(!c)return;const p=Math.round(10+(c.damage||0)*.8);if(!(c.damage>0)||state.cash<p)return;state.cash-=p;c.damage=0;toast('Carrosserie remise à neuf.','good');saveProgress();openSpot('fuel');}},
      {label:'Réparer et faire le plein · $90',off:state.cash<90||!car,fn:()=>{const c=target();if(!c||state.cash<90)return;state.cash-=90;c.fuel=100;c.damage=0;toast('Véhicule réparé et révisé.','good');saveProgress();openSpot('fuel');}},
      {label:'Acheter un bidon d’essence · $20 (sac : '+inv()+'/'+CAP+')',off:state.cash<20||inv()>=CAP,fn:()=>{if(state.cash<20||inv()>=CAP)return;state.cash-=20;P3.inv.bidon=(P3.inv.bidon||0)+1;toast('Bidon d’essence dans le sac : utilise-le n’importe où.','good');saveProgress();openSpot('fuel');}}
    ].concat(window.V55?V55.packOpts(()=>openSpot('fuel')):[]));return;
  }
  if(id==='dealership'){const opts=FLEET_CATALOG.map(v=>({label:v.label+' · '+fmt(v.price)+(state.license&&state.license[v.license]?' · permis validé':' · '+VEHICLE_LICENSE[v.license]),off:state.cash<v.price||!state.license||!state.license[v.license],fn:()=>buyFleetVehicle(v)}));
    fleetOwned.forEach((owned,index)=>{const v=FLEET_CATALOG.find(q=>q.id===owned);if(v)opts.push({label:'Revendre '+v.label+' · +'+fmt(Math.round(v.price*.6)),fn:()=>sellFleetVehicle(owned,index)});});
    openPanel('Concessionnaire Aurora','Achète ou revends un véhicule. Les véhicules achetés se rangent dans ton garage. Permis requis.',opts);return;}
  if(id==='garage'){openGarageP4();return;}
  if(id==='drivingschool'){openDrivingSchoolP4();return;}
  _openSpotP4(id);
};
function showroomVehicle19(id){
  const v=FLEET_CATALOG.find(q=>q.id===id);if(!v){openSpot('dealership');return;}
  const licensed=!!(state.license&&state.license[v.license]),afford=state.cash>=v.price;
  const speed=v.top||27,acc=v.acc||1;
  openPanel(v.label,'Véhicule exposé · '+fmt(v.price)+' · vitesse max '+speed+' · accélération '+acc.toFixed(1)+' · '+(licensed?'Permis validé':'Permis requis : '+VEHICLE_LICENSE[v.license]),[
    {label:'Acheter · '+fmt(v.price),off:!licensed||!afford,fn:()=>buyFleetVehicle(v)},
    {label:'Voir tout le catalogue',fn:()=>openSpot('dealership')}
  ]);
}
function sellFleetVehicle(id,index){const v=FLEET_CATALOG.find(q=>q.id===id);if(!v)return;state.cash+=Math.round(v.price*.6);fleetOwned.splice(index,1);saveFleet();const c=cars.find(q=>q.owned&&q.type===id);if(c){if(player.car===c)exitCar();scene.remove(c.mesh);cars.splice(cars.indexOf(c),1);}toast(v.label+' revendu.','good');saveProgress();openSpot('dealership');}
function buyFleetVehicle(v){if(state.cash<v.price||!state.license||!state.license[v.license]){toast('Permis requis ou fonds insuffisants.','warn');return;}state.cash-=v.price;fleetOwned.push(v.id);saveFleet();toast(v.label+' ajouté au garage personnel.','good');saveProgress();openSpot('dealership');}
function spawnFleetVehicle(id){const v=FLEET_CATALOG.find(q=>q.id===id);if(!v)return null;
  const x=-212+(cars.length%5)*4.3,z=126+(Math.floor(cars.length/5)%2)*4,h=0,color=fleetPaint[id]|| (v.kind==='police'||v.kind==='ambulance'?0xf4f4f0:v.kind==='firetruck'?0xc82d25:pick(CAR_COLORS));
  const c=addCar(x,z,h,color,'parked',v.kind);c.kind='parked';c.owned=true;c.owner='player';c.fuel=100;c.maxV=v.top;if(fleetPaint[id])p4PaintVehicle(c,fleetPaint[id]);return c;}
function openGarageP4(){const opts=fleetOwned.map(id=>{const v=FLEET_CATALOG.find(q=>q.id===id),out=cars.some(c=>c.owned&&c.type===id);return {label:(out?'Déjà sorti · ':'Sortir · ')+v.label,off:out,fn:()=>{const c=spawnFleetVehicle(id);closePanel();if(c)toast(v.label+' sorti du garage.','good');}};});
  if(fleetOwned.length)opts.push({label:'Personnaliser la peinture',fn:()=>openPaintShopP4()});
  opts.push({label:'Ranger mon véhicule actuel',off:!player.car||!player.car.owned||Math.abs(player.car.v)>1,fn:()=>{const c=player.car;if(!c||!c.owned)return;const id=c.type;if(!fleetOwned.includes(id))fleetOwned.push(id);saveFleet();exitCar();scene.remove(c.mesh);cars.splice(cars.indexOf(c),1);closePanel();toast('Véhicule rangé au garage.','good');}});
  openPanel('Garage personnel',fleetOwned.length?fleetOwned.length+' véhicule(s) enregistré(s). Choisis-en un pour le sortir ou le modifier.':'Aucun véhicule pour l’instant. Le concessionnaire est au nord-ouest.',opts);}
function openPaintShopP4(){const ids=[...new Set(fleetOwned)],colors=[[0xf4f1ea,'Blanc'],[0x202329,'Noir'],[0xc0392b,'Rouge'],[0x2e6fd1,'Bleu'],[0x2e9a6a,'Vert'],[0xe0a526,'Jaune'],[0x7b4bb3,'Violet']];
  const opts=ids.map(id=>{const v=FLEET_CATALOG.find(q=>q.id===id);return {label:v.label,fn:()=>{const colorsOpts=colors.map(([c,n])=>({label:n,fn:()=>{paintFleet(id,c);openGarageP4();}}));openPanel('Peinture · '+v.label,'La peinture est aussi appliquée aux exemplaires déjà sortis.',colorsOpts);}};});
  openPanel('Peinture automobile','Choisis un véhicule puis sa couleur.',opts);}
function openDrivingSchoolP4(){const opts=[];
  [['auto','Permis B'],['moto','Permis moto'],['pro','Permis poids lourd'],['service','Permis de service']].forEach(([k,n])=>opts.push({label:(state.license&&state.license[k]?'✓ ':'')+n+(k==='auto'||k==='moto'?' · $120':' · $300'),off:state.cash<(k==='auto'||k==='moto'?120:300)||(state.license&&state.license[k])||!!drivingExam,fn:()=>beginDrivingExamP4(k)}));
  openPanel('Auto-école','Passe l’examen pratique : conduis sur 110 m sans collision. Un véhicule-école sera placé près de toi. Permis obtenus : achats débloqués chez le concessionnaire.',opts);}
function beginDrivingExamP4(type){const fee=(type==='auto'||type==='moto')?120:300;if(state.cash<fee)return;state.cash-=fee;drivingExam={type,distance:0};const v=type==='moto'?'motorcycle':'sedan',c=addCar(player.x+4,player.z,player.h,0xe0b34a,'parked',v);c.kind='parked';enterCar(c);closePanel();toast('Examen lancé : parcours 110 m sans collision.');}
// Carte 2D de style GPS : quartiers, rues, eau, POI, légende et position du joueur.
const MAP_R=256;
function mapXY(v,S){return (v+MAP_R)/ (MAP_R*2)*S;}
function drawProMap(g,S,mini=false){
  const k=mini?S/150:S/(MAP_R*2),X=v=>mini?S/2+(v-player.x)*k:(v+MAP_R)*k,Y=v=>mini?S/2+(v-player.z)*k:(v+MAP_R)*k;
  g.clearRect(0,0,S,S);g.fillStyle='#101d28';g.fillRect(0,0,S,S);
  g.fillStyle='#123d5b';g.fillRect(0,Y(222),S,S-Y(222));g.fillStyle='#1b6581';g.fillRect(0,Y(214),S,Y(222)-Y(214));
  for(let i=-3;i<=3;i++)for(let j=-3;j<=2;j++){
    const x=i*64,z=j*64;let col=z<-50?'#34473c':z>50?'#304452':'#39434c';
    if(i===0&&j===-2)col='#276248';if(i===0&&j===0)col='#484c50';
    g.fillStyle=col;g.fillRect(X(x-25),Y(z-25),50*k,50*k);
  }
  boxes.forEach(b=>{if(!b.big||b.x1<-MAP_R||b.x0>MAP_R||b.z1<-MAP_R||b.z0>MAP_R)return;g.fillStyle='#747e84';g.fillRect(X(b.x0),Y(b.z0),Math.max(1,(b.x1-b.x0)*k),Math.max(1,(b.z1-b.z0)*k));});
  g.lineCap='round';roadC.forEach(v=>{
    g.strokeStyle='#70777d';g.lineWidth=Math.max(1,9*k);g.beginPath();g.moveTo(X(v),Y(-MAP_R));g.lineTo(X(v),Y(MAP_R));g.stroke();g.beginPath();g.moveTo(X(-MAP_R),Y(v));g.lineTo(X(MAP_R),Y(v));g.stroke();
    if(!mini){g.strokeStyle='#c2c7ca';g.lineWidth=Math.max(1,1.1*k);g.setLineDash([3*k,4*k]);g.beginPath();g.moveTo(X(v),Y(-MAP_R));g.lineTo(X(v),Y(MAP_R));g.stroke();g.beginPath();g.moveTo(X(-MAP_R),Y(v));g.lineTo(X(MAP_R),Y(v));g.stroke();g.setLineDash([]);}
  });
  if(!mini){g.strokeStyle='#879096';g.lineWidth=Math.max(2,8*k);g.setLineDash([]);g.strokeRect(X(-MAP_R+3),Y(-MAP_R+3),S-6*k,S-6*k);
    g.fillStyle='rgba(255,255,255,.72)';g.font=`700 ${Math.max(8,S/42)}px system-ui`;g.textAlign='center';[['LES HAUTS',-145],['CENTRE-VILLE',0],['QUARTIER DU PORT',145]].forEach(([t,z])=>g.fillText(t,X(-115),Y(z)));
  }
  LOTS.forEach(l=>{g.fillStyle='#202a32';g.fillRect(X(l[0]-l[2]/2),Y(l[1]-l[3]/2),l[2]*k,l[3]*k);if(!mini){g.fillStyle='#fff';g.font=`700 ${Math.max(7,S/52)}px system-ui`;g.textAlign='center';g.fillText('P',X(l[0]),Y(l[1])+2);}});
  spots.forEach(s=>{const px=X(s.x),py=Y(s.z),r=Math.max(mini?2:3,S/(mini?55:75));g.beginPath();g.fillStyle='#'+s.color.toString(16).padStart(6,'0');g.arc(px,py,r,0,Math.PI*2);g.fill();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=Math.max(1,S/280);g.stroke();
    if(!mini){g.font=`600 ${Math.max(8,S/55)}px system-ui`;g.textAlign='left';g.lineWidth=3;g.strokeStyle='rgba(9,15,20,.9)';g.strokeText(s.label,px+r+3,py+3);g.fillStyle='#f5f7f8';g.fillText(s.label,px+r+3,py+3);}
  });
  if(wp){g.beginPath();g.strokeStyle='#6cc6ff';g.lineWidth=Math.max(2,S/180);g.arc(X(wp.x),Y(wp.z),Math.max(5,S/30),0,Math.PI*2);g.stroke();g.fillStyle='#6cc6ff';g.beginPath();g.arc(X(wp.x),Y(wp.z),Math.max(2,S/95),0,Math.PI*2);g.fill();}
  g.save();g.translate(X(player.x),Y(player.z));g.rotate(Math.PI-player.h);g.fillStyle='#ffd34e';g.strokeStyle='#111';g.lineWidth=mini?1:2;g.beginPath();g.moveTo(0,mini?-8:-10);g.lineTo(mini?5:7,mini?5:7);g.lineTo(0,mini?3:4);g.lineTo(mini?-5:-7,mini?5:7);g.closePath();g.fill();if(!mini)g.stroke();g.restore();
  if(!mini){const pad=10,legend=[['#ffb84d','Emploi'],['#58d68d','Commerces'],['#5aa9ff','Services'],['#ff5fd2','Loisirs'],['#c79bff','Résidentiel']];g.font='600 11px system-ui';let x=pad,y=S-pad-10;legend.forEach(([c,t])=>{g.fillStyle=c;g.beginPath();g.arc(x+5,y-3,4,0,7);g.fill();g.fillStyle='#e5edf1';g.fillText(t,x+13,y);x+=g.measureText(t).width+32;if(x>S-70){x=pad;y-=16;}});}
}
const _updateMiniP4=updateMini;
updateMini=function(){const cv=$('#mini'),g=cv.getContext('2d');g.save();g.beginPath();g.arc(cv.width/2,cv.height/2,cv.width/2-2,0,Math.PI*2);g.clip();drawProMap(g,cv.width,true);g.restore();};
appMap=function(b){const cv=mk('canvas','mapc');cv.width=280;cv.height=280;b.appendChild(cv);drawProMap(cv.getContext('2d'),280,false);
  b.appendChild(mk('p','dim','Touche un lieu pour créer un repère GPS.'));
  spots.forEach(s=>{const r=mk('button','prow',null,()=>{wp={x:s.x,z:s.z,l:s.label};toast('GPS vers '+s.label,'good');phOpen(phApp);});r.appendChild(mk('b',null,s.label));r.appendChild(mk('span',null,Math.round(Math.hypot(s.x-player.x,s.z-player.z))+' m'));b.appendChild(r);});
  if(wp)b.appendChild(mk('button','pbtn','Arrêter le GPS',()=>{wp=null;phOpen(phApp);}));
};
const _planAppP4=APPS.find(a=>a[0]==='Plan');if(_planAppP4)_planAppP4[3]=appMap;
const _drawBigMapP4=drawBigMap;
drawBigMap=function(){const cv=$('#bm-cv');if(!cv)return;const S=Math.max(260,Math.floor(Math.min(innerWidth-24,innerHeight-190,680)));cv.width=S;cv.height=S;cv.style.width=cv.style.height=S+'px';drawProMap(cv.getContext('2d'),S,false);};
