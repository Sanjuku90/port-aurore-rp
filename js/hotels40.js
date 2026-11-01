'use strict';
/* v40.1 · hôtels de luxe dans les trois cartes: réception, séjour temporaire, suites et services. */
(function(){
const H={defs:{
  pax:{name:'Grand Hôtel Port-Aurore',color:0x344c64,x:430,z:-365,spot:'hotel40:pax',lobby:'hotel40:pax:lobby',suiteBase:'hotel40:pax:suite',accent:0xb99b5b},
  sol:{name:'Palace du Lagon Bleu',color:0x347b76,x:SOL27.x+120,z:161,spot:'sol28hotel',lobby:'sol28hotel',suiteBase:'hotel40:sol:suite',accent:0x43c7b7},
  third:{name:'Grand Palace Nouvelle-Aurore',color:0x64504a,x:-2030,z:461,spot:'hotel40:third',lobby:'hotel40:third:lobby',suiteBase:'hotel40:third:suite',accent:0xd5af62}
},stay:{},built:false};
const KEY='pa-hotels40';try{Object.assign(H.stay,JSON.parse(localStorage.getItem(KEY)||'{}'));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(H.stay));}catch(e){}}
const money=(v)=>'$'+Math.round(v).toLocaleString('fr-FR');
const kinds=[
 {id:'standard',name:'Chambre supérieure',price:160,desc:'Lit king size, salle de bain en marbre, minibar, bureau, Wi‑Fi et service de chambre.'},
 {id:'deluxe',name:'Chambre Deluxe vue ville',price:320,desc:'Salon privé, balcon, baignoire, dressing, minibar premium et petit-déjeuner.'},
 {id:'suite',name:'Suite présidentielle',price:850,desc:'Salon séparé, chambre king size, salle de bain double, terrasse, majordome et minibar.'}
];
const mat=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function hotelRug(key,color){return F7.rug(6,3.6,ctex('luxrug-'+key,128,128,(g,W,H)=>{g.fillStyle='#'+color.toString(16).padStart(6,'0');g.fillRect(0,0,W,H);g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=5;g.strokeRect(10,10,W-20,H-20);g.beginPath();g.arc(W/2,H/2,24,0,Math.PI*2);g.stroke();}));}
function b(parent,geo,material,x,y,z){const o=new THREE.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function exterior(d){const g=new THREE.Group();g.position.set(d.x,0,d.z);scene.add(g);const stone=mat(d.color,.7),glass=mat(0x8fc3d6,.24,.12),gold=mat(d.accent,.35,.62),roof=mat(0x252f3b,.55,.12);
  b(g,new THREE.BoxGeometry(42,22,28),stone,0,11,0);b(g,new THREE.BoxGeometry(44,1,30),roof,0,22.4,0);
  b(g,new THREE.BoxGeometry(14,5,.5),glass,0,2.7,14.25);b(g,new THREE.BoxGeometry(11,.3,.35),gold,0,5.5,14.55);
  for(let floor=0;floor<4;floor++)for(let col=-2;col<=2;col++){if(floor===0&&col===0)continue;const win=b(g,new THREE.BoxGeometry(3.8,2.3,.18),glass,col*6.7,7+floor*3.4,14.12);win.material=glass;}
  for(let q=-1;q<=1;q++){b(g,new THREE.CylinderGeometry(.25,.32,6,10),gold,q*6,3,16.5);}
  b(g,new THREE.BoxGeometry(17,.45,4),gold,0,.45,17);b(g,new THREE.BoxGeometry(20,.35,3),stone,0,3.3,16.5);
  const cv=document.createElement('canvas');cv.width=512;cv.height=90;const ctx=cv.getContext('2d');ctx.fillStyle='#'+d.color.toString(16).padStart(6,'0');ctx.fillRect(0,0,512,90);ctx.fillStyle='#f8edce';ctx.font='700 37px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(d.name.toUpperCase(),256,47);
  const sign=b(g,new THREE.PlaneGeometry(21,3.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),side:THREE.DoubleSide}),0,19.4,14.2);
  boxes.push({x0:d.x-21,x1:d.x+21,z0:d.z-14,z1:d.z+13,big:true});
  addSpot(d.x,d.z+18,d.spot,d.accent,d.name+' · Réception');const s=spots[spots.length-1];s.door=true;s.luxHotel=true;
  // sheltered arrival loop and landscape lighting
  const canopy=b(g,new THREE.BoxGeometry(19,.55,7),roof,0,6,18);canopy.castShadow=true;
  for(const dx of [-8,8]){const pole=b(g,new THREE.CylinderGeometry(.12,.16,5,8),gold,dx,2.5,20);}
}
function hotelRoom(id,title,d,kind,roomIndex){
  const rx=5600+roomIndex*60,rz=2800+roomIndex*35,Ht=3.5,R=roomCtx(id,rx,rz,Ht);R.name=title;R.sp=[];
  const floor=mat(0x8c7558,.72),wall=mat(0xf0e8dc,.92),dark=mat(0x364452,.7),trim=mat(d.accent,.4,.35),windowM=mat(0x82b9d0,.2,.1);
  R.floor(-8,-6,8,6,floor,1.6);R.ceil(-8,-6,8,6,mat(0xf8f5ef));
  R.wall(-8,-6,8,-6,wall,dark,[{k:'window',t:8,w:4.4,y0:1,y1:2.8,out:1}],{th:.18});
  R.wall(-8,6,8,6,dark,wall,[{k:'door',t:8,w:1.6,open:false}],{th:.18});
  R.wall(-8,-6,-8,6,dark,wall,[],{th:.18});R.wall(8,-6,8,6,wall,dark,[],{th:.18});
  R.entry={x:0,z:4.8,h:Math.PI};R.b=[rx-7.7,rx+7.7,rz-5.7,rz+5.7];R.spotI=32;R.spot=[0,0];R.zones=[[0,0]];
  R.place(hotelRug(id,kind==='suite'?d.accent:0x735f4c),0,0,0,5,3.5);
  R.place(F7.bed(2.2,2.3,kind==='suite'?0x35445b:0x60758b),-3.8,-2.2,0,2.2,2.3);
  R.place(F7.nightstand(),-5.5,-3.6);R.place(F7.nightstand(),-2.1,-3.6);
  R.place(F7.sofa(kind==='suite'?0x3d5c67:0x6e777c,2.5),3.7,1.8,Math.PI,2.5,1);
  R.place(F7.coffeeTable(),3.7,-.1,0,1.2,.6);R.place(F7.tvUnit(2),3.8,-5.5,0,2,.45);const tv=F7.tv(1.6);tv.position.set(3.8,1.5,-5.65);R.G.add(tv);
  R.place(F7.plant(2,1.15),6.7,4.3);R.place(F7.art(1,1.4,1.8),-7.85,1.4,Math.PI/2,0,0,1.9);
  const minibar=R.place(F7.drinkFridge?F7.drinkFridge(1.2):F7.fridge(),6.1,-3.9,0,.8,.7);
  R.int(3.7,1.1,'Regarder la télévision',()=>{if(typeof V31!=='undefined'&&V31.tv)V31.tv();else{state.fun=Math.min(100,state.fun+4);toast('Le téléviseur du salon est allumé.','good');}},{r:1.4});
  R.int(6.1,-3.7,'Commander au minibar',()=>openPanel('Minibar · '+d.name,'Produits et service en chambre disponibles 24 h/24.',[
    {label:'Eau minérale · $4',off:state.cash<4,fn:()=>{state.cash-=4;state.thirst=Math.min(100,(state.thirst||0)+22);toast('Eau fraîche servie.','good');}},
    {label:'Plateau repas · $24',off:state.cash<24,fn:()=>{state.cash-=24;state.hunger=Math.min(100,state.hunger+55);toast('Le room service apporte ton plateau.','good');}},
    {label:'Petit-déjeuner en chambre · $18',off:state.cash<18,fn:()=>{state.cash-=18;state.hunger=Math.min(100,state.hunger+38);state.energy=Math.min(100,state.energy+10);toast('Petit-déjeuner servi.','good');}}
  ]),{r:1.5});
  R.int(-3.8,-1.2,'Dormir dans le lit king size',()=>{state.energy=100;state.health=Math.min(100,state.health+12);state.hunger=Math.max(0,state.hunger-14);gameMin+=480;toast('Tu as dormi confortablement. Énergie au maximum.','good');saveProgress();},{r:1.8});
  R.int(0,4.8,'Retourner au hall de l’hôtel',()=>toHotelLobby(d,key),{r:1.5});
  R.int(-6.2,3.7,'Douche et bain',()=>openPanel('Salle de bain en marbre','Douche pluie, baignoire profonde, serviettes fraîches et produits de soin.',[
   {label:'Prendre un bain · 30 min',fn:()=>{gameMin+=30;state.fun=Math.min(100,state.fun+15);state.health=Math.min(100,state.health+5);toast('Bain terminé. Humeur +15.','good');}},
   {label:'Demander des serviettes fraîches · $3',off:state.cash<3,fn:()=>{state.cash-=3;state.fun=Math.min(100,state.fun+3);toast('Serviettes fraîches livrées.','good');}}
  ]),{r:1.5});
  R.G.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});ROOMS[id]=R;return R;
}
function buildLobby(d,key,index){let R;
 if(key==='sol'&&ROOMS.sol28hotel)R=ROOMS.sol28hotel;
 else{
  const id=d.lobby,rx=5700+index*80,rz=3500+index*50;R=roomCtx(id,rx,rz,4.2);R.name=d.name+' · Hall';R.sp=[];
  const stone=mat(0xd5c7ad,.45),cream=mat(0xf5f0e5,.9),gold=mat(d.accent,.4,.45),dark=mat(0x303b48,.7);
  R.floor(-9,-7,9,7,stone,1.4);R.ceil(-9,-7,9,7,cream);
  R.wall(-9,-7,9,-7,cream,dark,[{k:'window',t:9,w:5,y0:1,y1:3.4,out:1}],{th:.2});R.wall(-9,7,9,7,dark,cream,[{k:'door',t:9,w:2.2,open:false}],{th:.2});R.wall(-9,-7,-9,7,dark,cream,[],{th:.2});R.wall(9,-7,9,7,cream,dark,[],{th:.2});
  R.entry={x:0,z:5.4,h:Math.PI};R.b=[rx-8.7,rx+8.7,rz-6.7,rz+6.7];R.spotI=38;R.spot=[0,0];R.zones=[[0,0]];
  R.place(hotelRug(d.name,d.accent),0,0,0,7,4);R.place(F7.counter(5,d.accent),0,-4,Math.PI,5,.8);R.place(F7.sofa(0x46606b,3),-5,1.5,Math.PI/2,1,3);R.place(F7.sofa(0x46606b,3),5,1.5,-Math.PI/2,1,3);R.place(F7.plant(2,1.5),-7,-5.4);R.place(F7.plant(1,1.5),7,-5.4);const chandelier=F7.pendant(d.accent);chandelier.position.set(0,3.7,0);R.G.add(chandelier);
  R.light(-4,3.8,0,12,0xffe8bf);R.light(4,3.8,0,12,0xffe8bf);R.light(0,3.8,-4,10,0xffe8bf);
  const receptionist=makePerson(0x253e4b,0x1e2b38,0x9a684c,0x1a1410,{style:'court',top:'veste',bottom:'pantalon',bag:false});receptionist.position.set(rx,0.1,rz-2.5);receptionist.rotation.y=Math.PI;R.G.add(receptionist);
  R.int(0,-2.55,'Réceptionniste · chambres et services',()=>reception(d,key));
  R.int(0,5.2,'Sortir de l’hôtel',()=>leaveInterior(),{exit:1,r:1.8});
  R.int(-5,1.5,'Salon du hall · conciergerie',()=>openPanel('Conciergerie · '+d.name,'Notre équipe organise ton séjour, tes déplacements et tes demandes.',[
   {label:'Commander un taxi',fn:()=>{try{const app=typeof APPS!=='undefined'&&APPS.find(a=>a[0]==='Taxi');if(app&&typeof phOpen==='function'){togglePhone();phOpen(app,'slide');toast('Choisis ta destination dans l’application Taxi.','good');}else toast('Ouvre l’application Taxi sur ton téléphone pour commander.','warn');}catch(e){toast('Ouvre l’application Taxi sur ton téléphone pour commander.','warn');}}},
   {label:'Réserver un transfert aéroport · $20',off:state.cash<20,fn:()=>{state.cash-=20;toast('Transfert réservé. Présente-toi au parvis de l’hôtel.','good');saveProgress();}},
   {label:'Demander un service de bagagerie',fn:()=>toast('Tes bagages sont pris en charge par le concierge.','good')}
  ]),{r:1.8});
  R.int(5,1.5,'Restaurant gastronomique',()=>openPanel('Restaurant · '+d.name,'Petit-déjeuner, déjeuner et dîner à la carte.',[
   {label:'Petit-déjeuner · $18',off:state.cash<18,fn:()=>{state.cash-=18;state.hunger=Math.min(100,state.hunger+38);toast('Petit-déjeuner servi à table.','good');}},
   {label:'Dîner gastronomique · $42',off:state.cash<42,fn:()=>{state.cash-=42;state.hunger=Math.min(100,state.hunger+65);state.fun=Math.min(100,state.fun+10);toast('Dîner servi.','good');}}
  ]),{r:1.8});
  R.int(6,4.5,'Spa, piscine et salle de sport',()=>openPanel('Spa & bien-être · '+d.name,'Piscine chauffée, sauna, hammam, massages et salle de sport.',[
   {label:'Accès piscine & fitness · $20',off:state.cash<20,fn:()=>{state.cash-=20;state.fun=Math.min(100,state.fun+16);state.health=Math.min(100,state.health+5);state.energy=Math.max(0,state.energy-5);toast('Séance terminée. Humeur +16.','good');}},
   {label:'Massage aux huiles · $55',off:state.cash<55,fn:()=>{state.cash-=55;state.health=100;state.fun=Math.min(100,state.fun+18);toast('Massage terminé. Santé au maximum.','good');}}
  ]),{r:1.8});
  R.G.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});ROOMS[id]=R;
 }
 const old=R.ints.some(q=>q.label&&q.label.startsWith('Réceptionniste ·'));
 if(!old)R.int(0,-2.5,'Réceptionniste · chambres et services',()=>reception(d,key));
 const outside=spots.find(s=>s.id===d.spot);if(outside){outside.door=true;outside.label=d.name+' · entrer';}
}

function toHotelLobby(d,key){
 const current=player.inside,lobby=ROOMS[d.lobby];if(!current||!lobby)return;
 current.G.visible=false;lobby.G.visible=true;player.inside=lobby;player.x=lobby.rx+lobby.entry.x;player.z=lobby.rz+lobby.entry.z;player.h=lobby.entry.h;camYaw=lobby.entry.h;camPitch=Math.max(camPitch,.72);
 if(typeof RIG7!=='undefined')RIG7.room=lobby;toast('Retour au hall. La réception et les services sont à ta disposition.','good');
}
function suiteType(key){const q=H.stay[key];return kinds.find(k=>k.id===(q&&q.kind))||null;}
function reception(d,key){const rec=H.stay[key],valid=rec&&rec.until>gameMin,room=valid?suiteType(key):null;
 const buttons=[];
 if(valid){buttons.push({label:'Entrer dans '+room.name+' · suite '+rec.room,fn:()=>{const id=d.suiteBase+':'+room.id;const exterior=spots.find(s=>s.id===d.spot),outside=player.outside&&{x:player.outside.x,z:player.outside.z};enterInterior({id,x:exterior?exterior.x:d.x,z:exterior?exterior.z:d.z});if(outside)player.outside=outside;}});buttons.push({label:'Durée restante · '+Math.ceil((rec.until-gameMin)/60)+' h',off:true});}
 else{
  buttons.push(...kinds.map(k=>({label:k.name+' · 24 h · '+money(k.price),off:state.cash+state.bank<k.price,fn:()=>{
    if(state.cash+state.bank<k.price){toast('Fonds insuffisants.','warn');return;}
    takeMoney(k.price);H.stay[key]={kind:k.id,room:'0'+(Math.floor(Math.random()*8)+1),until:gameMin+1440};save();saveProgress();toast('Bienvenue au '+d.name+'. Ta chambre est prête pour 24 h de jeu.','good');
  }})));
 }
 buttons.push({label:'Services de luxe · restaurant, spa, piscine',fn:()=>openPanel('Services · '+d.name,'Réserve tes repas, demande le concierge ou accède au spa depuis le hall de l’hôtel.',[
  {label:'Restaurant gastronomique',fn:()=>openPanel('Restaurant','Petit-déjeuner · $18, dîner gastronomique · $42.',[{label:'Petit-déjeuner · $18',off:state.cash<18,fn:()=>{state.cash-=18;state.hunger=Math.min(100,state.hunger+38);toast('Petit-déjeuner servi.','good');}},{label:'Dîner · $42',off:state.cash<42,fn:()=>{state.cash-=42;state.hunger=Math.min(100,state.hunger+60);state.fun=Math.min(100,state.fun+10);toast('Dîner servi.','good');}}])},
  {label:'Spa & piscine · $20',off:state.cash<20,fn:()=>{state.cash-=20;state.fun=Math.min(100,state.fun+15);state.health=Math.min(100,state.health+5);toast('Accès au spa activé.','good');}},
  {label:'Room service · $24',off:state.cash<24,fn:()=>{state.cash-=24;state.hunger=Math.min(100,state.hunger+55);toast('Le room service est en route.','good');}}
 ])});
 openPanel('Réception · '+d.name,valid?'Bonjour '+state.name+'. Ta '+room.name+' est réservée jusqu’à expiration. Une chambre comprend salle de bain, lit king size, salon, télévision, minibar et service en chambre.':'Bienvenue. La réception est ouverte 24 h/24. Choisis ton type de chambre pour un séjour de 24 heures de jeu. Toutes les chambres comprennent salle de bain, lit king size, salon, télévision et minibar.',buttons);
}
function buildHotelSuite(d,key,index){for(const k of kinds){const id=d.suiteBase+':'+k.id;if(ROOMS[id])continue;hotelRoom(id,d.name+' · '+k.name,d,k.id,index*10+kinds.indexOf(k)+1);}}
function buildHotels(){if(H.built)return;H.built=true;
 // Port-Aurore
 exterior(H.defs.pax);buildLobby(H.defs.pax,'pax',0);buildHotelSuite(H.defs.pax,'pax',0);
 // Upgrade the already existing Lagon Bleu into a true luxury hotel with check-in and room inventory.
 const sol=H.defs.sol;const hs=spots.find(s=>s.id==='sol28hotel')||spots.find(s=>s.id==='sol27:hotel');if(hs){hs.luxHotel=true;hs.door=true;hs.label='Palace du Lagon Bleu · entrer';sol.x=hs.x;sol.z=hs.z;}
 const solLobby=ROOMS.sol28hotel;if(solLobby){solLobby.name='Palace du Lagon Bleu · Hall';if(!solLobby.ints.some(q=>q.label&&q.label.startsWith('Réceptionniste ·')))solLobby.int(0,-2.5,'Réceptionniste · chambres et services',()=>reception(sol,'sol'));
  const rep=solLobby.ints.find(q=>q.label&&q.label.startsWith('Réception ·'));if(rep)rep.fn=()=>reception(sol,'sol');
  solLobby.int(5,3.4,'Spa, piscine et services de luxe',()=>openPanel('Palace du Lagon Bleu · Bien-être','Piscine à débordement, hammam, soins, restaurant créole et majordome.',[
   {label:'Piscine & hammam · $20',off:state.cash<20,fn:()=>{state.cash-=20;state.fun=Math.min(100,state.fun+16);state.health=Math.min(100,state.health+5);toast('Accès piscine et hammam activé.','good');}},
   {label:'Massage aux huiles · $55',off:state.cash<55,fn:()=>{state.cash-=55;state.health=100;state.fun=Math.min(100,state.fun+18);toast('Massage terminé.','good');}},
   {label:'Dîner créole en chambre · $24',off:state.cash<24,fn:()=>{state.cash-=24;state.hunger=Math.min(100,state.hunger+55);toast('Le room service apporte ton dîner créole.','good');}}
  ]),{r:1.8});
 }
 buildHotelSuite(sol,'sol',1);
 // Nouvelle-Aurore
 exterior(H.defs.third);buildLobby(H.defs.third,'third',2);buildHotelSuite(H.defs.third,'third',2);
}
const _bd=buildDecor;buildDecor=function(){_bd();try{buildHotels();}catch(e){console.warn('luxury hotels v40',e);}};
const _open=openSpot;openSpot=function(id){if(id==='sol28hotel'||id==='hotel40:pax'||id==='hotel40:third'){const key=id==='sol28hotel'?'sol':id==='hotel40:pax'?'pax':'third',d=H.defs[key];if(!player.inside){const s=spots.find(q=>q.id===id);if(s&&ROOMS[d.lobby]){enterInterior({id:d.lobby,x:s.x,z:s.z});return;}}reception(d,key);return;}_open(id);};
const _save=saveProgress;saveProgress=function(){_save();save();};
window.HOTELS40={stay:H.stay,hotels:H.defs};
})();
