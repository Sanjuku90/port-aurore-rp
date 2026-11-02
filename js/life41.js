'use strict';
/* v41 · quotidien vivant: animaux, agenda d'événements, contrats courts et gestion du logement. */
(function(){
const KEY='port-aurore-life41';
const blank=()=>({pet:null,bills:0,lastDay:Math.floor(gameMin/1440),contract:null,events:{},tenants:[],rentDue:0});
let L=blank();try{const o=JSON.parse(localStorage.getItem(KEY)||'null');if(o)L=Object.assign(blank(),o);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(L));}catch(e){}}
const clamp41=(v,a,b)=>Math.max(a,Math.min(b,v));
const pay41=(cost,label)=>{if(state.cash+state.bank<cost){toast('Fonds insuffisants.','warn');return false;}takeMoney(cost);toast(label+' · −'+fmt(cost),'good');saveProgress();return true;};
function addPetMesh(){if(!L.pet||L.pet.mesh)return;const p=L.pet,g=new THREE.Group(),fur=new THREE.MeshStandardMaterial({color:p.kind==='chat'?0x777c83:0xc7925e,roughness:.92}),dark=new THREE.MeshStandardMaterial({color:0x39281e,roughness:.9}),eye=new THREE.MeshBasicMaterial({color:0x171513});
 const body=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8),fur);body.scale.set(1,.7,1.25);body.position.y=.48;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.29,12,8),fur);head.position.set(0,.8,.42);g.add(head);
 if(p.kind==='chien')[-1,1].forEach(s=>{const ear=new THREE.Mesh(new THREE.ConeGeometry(.11,.3,7),fur);ear.position.set(s*.2,1.02,.39);ear.rotation.z=s*.35;g.add(ear);});
 if(p.kind==='chat')[-1,1].forEach(s=>{const ear=new THREE.Mesh(new THREE.ConeGeometry(.12,.3,7),fur);ear.position.set(s*.18,1.04,.39);g.add(ear);});
 [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),eye);e.position.set(s*.105,.83,.67);g.add(e);});
 const nose=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),dark);nose.position.set(0,.68,.7);g.add(nose);
 [-1,1].forEach(s=>[-1,1].forEach(t=>{const leg=new THREE.Mesh(new THREE.CylinderGeometry(.065,.06,.28,7),fur);leg.position.set(s*.22,.19,t*.24);g.add(leg);}));
 const tail=new THREE.Mesh(new THREE.CylinderGeometry(.045,.065,.42,7),fur);tail.position.set(0,.68,-.48);tail.rotation.x=1.1;g.add(tail);
 g.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false;}});g.visible=false;scene.add(g);p.mesh=g;p.tail=tail;}
function petShop(){const has=!!L.pet;openPanel('Refuge animalier · trois villes',has?L.pet.name+' est un '+(L.pet.kind==='chien'?'chien':'chat')+' · faim '+Math.round(L.pet.hunger)+' · propreté '+Math.round(L.pet.clean)+' · humeur '+Math.round(L.pet.mood)+'.':'Adopte un compagnon, puis nourris-le, lave-le, promène-le et apprends-lui des ordres.',has?[
 {label:'Nourrir · croquettes $5',off:state.cash<5||L.pet.hunger>88,fn:()=>{if(pay41(5,'Croquettes')){L.pet.hunger=Math.min(100,L.pet.hunger+35);L.pet.mood=Math.min(100,L.pet.mood+4);save();}}},
 {label:'Acheter une friandise · $3',off:state.cash<3,fn:()=>{if(pay41(3,'Friandise')){L.pet.mood=Math.min(100,L.pet.mood+12);save();toast(L.pet.name+' remue la queue !','good');}}},
 {label:'Promener au parc · 20 min',off:L.pet.energy<10,fn:()=>{gameMin+=20;L.pet.energy=Math.max(0,L.pet.energy-12);L.pet.mood=Math.min(100,L.pet.mood+18);L.pet.clean=Math.max(0,L.pet.clean-4);save();toast(L.pet.name+' a fait une belle promenade.','good');}},
 {label:'Toilettage et bain · $12',off:state.cash<12,fn:()=>{if(pay41(12,'Toilettage')){L.pet.clean=100;L.pet.mood=Math.min(100,L.pet.mood+8);save();}}},
 {label:'Apprendre un ordre · $8',off:state.cash<8,fn:()=>{if(pay41(8,'Cours de dressage')){L.pet.tricks=Math.min(5,(L.pet.tricks||0)+1);L.pet.mood=Math.min(100,L.pet.mood+5);save();toast(L.pet.name+' apprend un nouvel ordre.','good');}}},
 {label:'Garde animale · 24 h · $15',off:state.cash<15,fn:()=>{if(pay41(15,'Garde animale')){L.pet.boardedUntil=gameMin+1440;save();toast(L.pet.name+' est confié à la garderie pour 24 h.','good');}}},
 {label:'Reprendre mon compagnon',fn:()=>{L.pet.boardedUntil=0;save();toast(L.pet.name+' est de retour avec toi.','good');}}
 ]:[
 {label:'Adopter un chien adulte · gratuit',fn:()=>adopt('chien','Koda')},
 {label:'Adopter un chat adulte · gratuit',fn:()=>adopt('chat','Moka')},
 {label:'Adopter un chiot · $35',off:state.cash<35,fn:()=>{if(pay41(35,'Adoption du chiot'))adopt('chien','Pixel');}},
 {label:'Adopter un chaton · $25',off:state.cash<25,fn:()=>{if(pay41(25,'Adoption du chaton'))adopt('chat','Plume');}}
 ]);}
function adopt(kind,name){L.pet={kind,name,hunger:78,clean:82,mood:78,energy:90,tricks:0,boardedUntil:0};save();addPetMesh();toast(name+' rejoint ton foyer !','good');}
function tenantPanel(){const options=['Mina Kaboré','Yanis Morel','Awa Traoré'];const rows=[];if(L.tenants.length<3)options.filter(n=>!L.tenants.includes(n)).forEach(n=>rows.push({label:'Signer un bail avec '+n+' · +$18/jour',fn:()=>{L.tenants.push(n);save();toast(n+' a signé un bail. Le loyer s’ajoute chaque jour.','good');}}));rows.push({label:'Encaisser les loyers · '+fmt(L.rentDue||0),off:!L.rentDue,fn:()=>{state.cash+=L.rentDue;state.earned=(state.earned||0)+L.rentDue;toast('Loyers encaissés : '+fmt(L.rentDue)+'.','good');L.rentDue=0;saveProgress();}});rows.push({label:'Réparer une fuite · $25',off:state.cash+state.bank<25,fn:()=>{if(pay41(25,'Réparation de la fuite'))toast('La réparation est terminée.','good');}});openPanel('Gestion locative · '+L.tenants.length+' locataire(s)',L.tenants.length?L.tenants.join(' · ')+' · revenus de $18 par locataire et par jour de jeu.':'Aucun locataire. Signe un bail pour générer des loyers.',rows);}
function housing(){const day=Math.floor(gameMin/1440);const days=Math.max(0,day-(L.lastDay||day));if(days){L.bills=Math.min(9999,(L.bills||0)+days*14);L.lastDay=day;save();}
 openPanel('Gestion du logement','Factures eau/électricité en attente : '+fmt(L.bills||0)+'. Les factures s’accumulent à raison de $14 par jour de jeu. Contrôle, petites réparations et revenus des locataires.',[
 {label:'Régler toutes les factures · '+fmt(L.bills||0),off:!L.bills||state.cash+state.bank<L.bills,fn:()=>{if(pay41(L.bills,'Factures eau et électricité')){L.bills=0;save();}}},
 {label:'Réparation et entretien · $35',off:state.cash+state.bank<35,fn:()=>{if(pay41(35,'Entretien du logement')){state.fun=Math.min(100,state.fun+4);save();}}},
 {label:'Gérer les locataires',fn:()=>tenantPanel()},
 {label:'Inviter des amis à la maison',off:!state.friends.length,fn:()=>openPanel('Inviter chez toi','Prépare une soirée à domicile avec tes amis.',[
 {label:'Soirée jeux · $12',off:state.cash<12,fn:()=>{if(pay41(12,'Soirée jeux')){state.fun=Math.min(100,state.fun+20);state.rep++;toast('Tes amis ont passé une super soirée.','good');}}},
 {label:'Dîner entre amis · $25',off:state.cash<25,fn:()=>{if(pay41(25,'Dîner à domicile')){state.fun=Math.min(100,state.fun+24);state.hunger=Math.min(100,state.hunger+20);toast('Le dîner à la maison est une réussite.','good');}}}
 ])}
 ]);}
const EVENTS=[
 {id:'concert',name:'Concert sur la plage',icon:'🎤',price:12,activity:'rhythm',opts:{id:'life41-concert',title:'Concert au bord de mer',icon:'🎤',bpm:112,dur:24,min:30,gain:{fun:20,rep:1}}},
 {id:'festival',name:'Festival de la ville',icon:'🎉',price:18,activity:'rhythm',opts:{id:'life41-festival',title:'Festival de Nouvelle-Aurore',icon:'🎉',bpm:120,dur:26,min:45,gain:{fun:24,rep:2}}},
 {id:'foot',name:'Match avec public',icon:'⚽',price:8,activity:'football',opts:{id:'life41-match',title:'Match national avec public',duration:50,replay:true,gain:{fun:20,energy:-10,rep:1}}},
 {id:'race',name:'Course automobile organisée',icon:'🏁',price:25,activity:'race',opts:null},
 {id:'night',name:'Marché nocturne',icon:'🏮',price:0,activity:'market',opts:null},
 {id:'national',name:'Fête nationale',icon:'🎆',price:0,activity:'holiday',opts:null}
];
function eventBoard(){const hour=(gameMin/60)%24,nightOpen=hour>=18||hour<2;openPanel('Agenda de la ville','Événements de cette semaine. Matchs avec public, concerts, festival, course automobile, marché nocturne et fête nationale.',EVENTS.map(e=>({label:e.icon+' '+e.name+(e.price?' · '+fmt(e.price):''),off:(e.id==='night'&&!nightOpen)||state.cash<e.price,fn:()=>joinEvent(e)})));}
function joinEvent(e){if(e.price&&!pay41(e.price,'Billet · '+e.name))return;const day=Math.floor(gameMin/1440),key=e.id+'-'+day;if(L.events[key]){toast('Tu as déjà participé à cet événement aujourd’hui.','warn');return;}L.events[key]=1;save();
 if(e.id==='race'){const V=window.V17;if(V&&V.RACES&&V.RACES.length){const r=V.RACES[0];wp={x:V.LOC.race17.x,z:V.LOC.race17.z,l:'Circuit des Docks · '+r.n};if(Math.hypot(player.x-V.LOC.race17.x,player.z-V.LOC.race17.z)<60){V.startRace(r);}else toast('Inscription validée. Rejoins la grille au Circuit des Docks (repère GPS), la course démarre à ton arrivée.','good');L.raceWait=1;save();return;}openPanel('Course organisée','Le circuit des Docks ouvre ses grilles. Rejoins le point de départ au Circuit des Docks.',[{label:'Repère GPS',fn:()=>{wp={x:typeof LOC!=='undefined'?LOC.race17.x:160,z:typeof LOC!=='undefined'?LOC.race17.z:160,l:'Circuit des Docks'};toast('Repère posé sur le circuit.','good');}}]);return;}
 if(e.id==='night'){openPanel('Marché nocturne','Les stands ouvrent après 18 h : plats de rue, produits locaux et artisanat.',[
 {label:'Plat de rue · $10',off:state.cash<10,fn:()=>{state.cash-=10;state.hunger=Math.min(100,state.hunger+38);toast('Repas acheté au marché nocturne.','good');}},
 {label:'Artisanat local · $14',off:state.cash<14,fn:()=>{state.cash-=14;state.fun=Math.min(100,state.fun+10);toast('Souvenir artisanal acheté.','good');}}
 ]);return;}
 if(e.id==='national'){state.fun=Math.min(100,state.fun+20);state.rep+=2;gameMin+=30;toast('Bonne fête nationale ! Défilé, musique et feux d’artifice.','good');saveProgress();return;}
 const action=MG29.act(e.name,0,e.activity,e.opts);action.fn();}
function contractDesk(){openPanel('Bureau des missions dynamiques','Contrats locaux avec objectif GPS et paiement à l’arrivée. Un seul contrat à la fois.',L.contract?[{label:'Contrat actif · '+L.contract.title+' · '+Math.max(0,Math.ceil(L.contract.left))+' s',off:true},{label:'Annuler le contrat',fn:()=>{L.contract=null;wp=null;save();toast('Contrat annulé.','warn');}}]:[
 {label:'Livraison urgente · +$45 · 90 s',fn:()=>acceptContract('Livraison urgente',45,90)},
 {label:'Dépannage routier · +$60 · 120 s',fn:()=>acceptContract('Dépannage routier',60,120)},
 {label:'Contrat de transport interurbain · +$120 · 240 s',fn:()=>acceptContract('Contrat interurbain · TGV',120,240)},
 {label:'Transport VIP · +$85 · 150 s',off:!player.car,fn:()=>acceptContract('Transport VIP',85,150)}]);}
function acceptContract(title,reward,secs){const c=window.NATION40&&NATION40.thirdCity||{x:-2150,z:0};let target;const inThird=player.x<c.x+700&&player.x>c.x-700;if(title.indexOf('interurbain')>=0)target=inThird?[-330,-245]:[c.x-450,-150];else{const targets=inThird?[[c.x-450,-150],[c.x-260,105],[c.x+120,-75],[c.x-70,285]]:[[160,160],[0,-150],[0,170],[330,-300]];target=targets.sort((a,b)=>Math.hypot(b[0]-player.x,b[1]-player.z)-Math.hypot(a[0]-player.x,a[1]-player.z))[0];}L.contract={title,reward,left:secs,x:target[0],z:target[1],needsCar:title==='Transport VIP'};wp={x:target[0],z:target[1],l:title};save();toast('Contrat accepté : '+title+'. Suis le GPS avant la fin du chrono.','good');}
function tickContract(dt){if(L.raceWait&&started&&!mission&&window.V17){const P=V17.LOC.race17;if(Math.hypot(player.x-P.x,player.z-P.z)<14){L.raceWait=0;save();V17.startRace(V17.RACES[0]);}}const c=L.contract;if(!c||!started)return;c.left-=dt;if(c.left<=0){L.contract=null;wp=null;save();toast('Le contrat a expiré.','warn');}}
function completeContract(){const c=L.contract;if(!c||Math.hypot(player.x-c.x,player.z-c.z)>=6)return false;if(c.needsCar&&!player.car){toast('Le client VIP attend une voiture.','warn');return true;}if(c.title.indexOf('Dépannage')===0&&player.car){toast('Gare le véhicule et descends pour intervenir.','warn');return true;}state.cash+=c.reward;state.earned=(state.earned||0)+c.reward;state.done++;state.rep++;L.contract=null;wp=null;save();saveProgress();toast('Contrat terminé · +'+fmt(c.reward),'good');return true;}
let petClock=0;function daily(dt){const d=Math.floor(gameMin/1440);if(d>L.lastDay){const elapsed=d-L.lastDay;L.bills=(L.bills||0)+elapsed*14;L.rentDue=(L.rentDue||0)+elapsed*(L.tenants||[]).length*18;L.lastDay=d;save();}if(L.pet){petClock+=dt||0;if(petClock>=60){const n=Math.floor(petClock/60);petClock%=60;L.pet.hunger=Math.max(0,L.pet.hunger-3*n);L.pet.clean=Math.max(0,L.pet.clean-1*n);L.pet.mood=Math.max(0,L.pet.mood-1*n);save();}const p=L.pet;p.energy=Math.min(100,p.energy+.004*(dt||0));if(p.boardedUntil&&p.boardedUntil<=gameMin){p.boardedUntil=0;p.mood=Math.max(40,p.mood);toast(p.name+' est de retour de la garderie.','good');}if(p.mesh){const visible=!player.inside&&!p.boardedUntil&&started;
 if(player.car){const pos=new THREE.Vector3(.72,.72,-.15);player.car.mesh.updateMatrixWorld(true);player.car.mesh.localToWorld(pos);p.mesh.position.lerp(pos,.18);p.mesh.rotation.y=player.car.h;p.mesh.visible=visible;}
 else{const a=player.h+Math.PI*.72,x=player.x+Math.sin(a)*1.55,z=player.z+Math.cos(a)*1.55;p.mesh.position.lerp(new THREE.Vector3(x,0, z),Math.min(1,dt*3));p.mesh.rotation.y=player.h+(p.kind==='chat'?Math.PI/2:0);p.mesh.visible=visible;if(p.tail)p.tail.rotation.z=Math.sin(performance.now()*.006)*.25;}
 }} }
const _bd=buildDecor;buildDecor=function(){_bd();try{const city=window.NATION40&&NATION40.thirdCity||{x:-2150,z:0};
 addSpot(-30,210,'life41:events',0xff8fb1,'Agenda · concerts, matchs et fêtes');
 addSpot(city.x,city.z+40,'life41:events:third',0xff8fb1,'Agenda de Nouvelle-Aurore');
 addSpot(city.x+480,city.z+400,'life41:pets',0x7fc96a,'Refuge animalier · adoption et soins');
 addSpot(city.x+440,city.z+325,'life41:contracts',0xffc23d,'Bureau des contrats dynamiques');
 addSpot(city.x-430,city.z+385,'life41:housing',0x7b91d1,'Agence logement · factures et locataires');
 addSpot(SOL27.x-60,-95,'life41:events:sol',0xff8fb1,'Agenda · fêtes de Solenne');
 addSpot(SOL27.x+360,230,'life41:pets:sol',0x7fc96a,'Refuge animalier de Solenne');
 if(ROOMS.home){const R=ROOMS.home;if(!R.ints.some(i=>i.label==='S’occuper de mon compagnon'))R.int(7.4,2.4,'S’occuper de mon compagnon',()=>petShop(),{r:1.8});if(!R.ints.some(i=>i.label==='Gestion du logement · factures'))R.int(7.3,-2.1,'Gestion du logement · factures',housing,{r:1.7});}
 addPetMesh();
 }catch(e){console.warn('life41 build',e);}};
const _op=openSpot;openSpot=function(id){if(id==='life41:pets'||id==='life41:pets:sol'){petShop();return;}if(id.startsWith('life41:events')){eventBoard();return;}if(id==='life41:contracts'){contractDesk();return;}if(id==='life41:housing'){housing();return;}_op(id);};
const _up=update;update=function(dt){_up(dt);daily(dt);tickContract(dt);};
const _ip=interact;interact=function(){if(L.contract&&completeContract())return;_ip();};
const _pr=updatePrompt;updatePrompt=function(){_pr();const c=L.contract;if(!c||!started||panelOpen||chatOpen)return;if(Math.hypot(player.x-c.x,player.z-c.z)<6){const el=document.querySelector('#prompt');if(el){el.hidden=false;el.textContent=c.title.indexOf('Dépannage')===0?'E · Intervenir sur le véhicule':c.needsCar?'E · Déposer le VIP':'E · Remettre le colis';}}};
window.LIFE41={get pet(){return L.pet;},get bills(){return L.bills||0;},get contract(){return L.contract;}};
})();
