'use strict';
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const angDiff=(a,b)=>{let d=(b-a)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;};
const fmt=n=>'$'+Math.round(n).toLocaleString('fr-FR');

if(!window.THREE){$('#go').textContent="Le moteur 3D n'a pas pu se charger. Recharge la page.";throw new Error('THREE manquant');}

const NAMES=['Camille','Mehdi','Inès','Lucas','Awa','Yanis','Sofia','Koffi','Léa','Bastien','Nadia','Théo','Amina','Hugo'];
const LINES=['Salut tout le monde !','Belle journée pour une balade.','Tu cherches du travail ? Va au Pôle Emploi.','Attention en conduisant, ça roule vite.','La supérette est à l’est de la place.','Quelqu’un a vu ma voiture ?','On se retrouve au parc ?','La vie est chère en ville.','Bonne livraison !','J’ai faim, il est quelle heure ?','Les livreurs gagnent bien en ce moment.','Pensez à passer à la banque.'];
const REPLIES=['Salut !','Bien le bonjour.','Ah oui, pas faux.','Haha, bien dit.','Bonne journée à toi !','Je ne suis pas d’ici, désolé.'];
const RESTOS=['Chez Mamadou','Pizza Aurore','Bao Express','Le Fournil','Tacos du Port','Café Lumière'];
const STREETS=['rue du Phare','avenue des Docks','rue des Mouettes','boulevard Aurore','rue de la Gare','quai Nord'];
const SHIRTS=[0xd94f4f,0x4f7fd9,0x4fb58a,0xe0b34a,0x8a5fc9,0xdddddd,0x2f3a4a,0xd97f4f,0xf4f1ea,0x2e9a6a,0xff8fb1,0x5aa9ff,0xc9b38a,0x1f6f6a];
const PANTS=[0x2b3445,0x3b3b3b,0x5a4a3a,0x27415a,0x4a6a8f,0xc9b38a,0x6b6f4a];
const SKINS=[0xf1c9a5,0xd9a47c,0xa8744f,0x7a4d33,0x4f3224];
const HAIRS=[0x1a1410,0x3a2616,0x6b4a2a,0xb08a4a,0x222222,0x1a1410,0x8a3a1e,0xd6c08a,0x9a9a9a];
const CAR_COLORS=[0xc0392b,0x2e6fd1,0xe8e8e8,0x2b2b2b,0xe0a526,0x2e9a6a,0x7b4bb3,0x9aa3ad];

const BLOCK=64,HALF=25;
const RANKS=['Nouveau','Local','Connu','Respecté','Légende'],JOBN={livreur:'Livreur',taxi:'Taxi',police:'Police'};
const INCID=['Cambriolage au port','Bagarre devant le club','Accident rue du Phare','Vol à l’étalage','Tapage nocturne'];
const TXT={taxi:['Client à bord. ','Client déposé. Pourboire inclus. ','Client déposé en retard. '],livreur:['Commande récupérée. ','Livré à temps. ','Livré en retard. '],police:['Suspect menotté. ','Intervention réussie. ','Intervention tardive. ']};
const rankOf=()=>Math.min(4,Math.floor(state.rep/10));
const MAP_EDGE=256,MAP_MIN=-256,MAP_MAX=256;
const roadC=[];for(let i=-3;i<=3;i++)roadC.push(i*64-32,i*64+32);roadC.splice(0,roadC.length,...Array.from(new Set(roadC)).filter(v=>v<=160).sort((a,b)=>a-b));
const nodeX=[];for(let i=-3;i<=3;i++){nodeX.push(i*64-23,i*64+23);}
const nodeZ=[];for(let j=-3;j<=2;j++){nodeZ.push(j*64-23,j*64+23);}
const NODES=[];for(let i=0;i<nodeX.length;i++)for(let j=0;j<nodeZ.length;j++)NODES.push({x:nodeX[i],z:nodeZ[j]});

const boxes=[],cars=[],peds=[],spots=[],bubbles=[],wallMats=[],roofs=[];
let renderer,scene,camera,hemi,sun,lampMat,beam,built=false,started=false,sky,stars,sunSp,moonSp,headSpot,glowMat;
const state={name:'Alex Martin',cash:150,bank:0,health:100,hunger:80,job:null,done:0,earned:0,energy:90,fun:70,rep:0,friends:[]};
const player={x:0,z:18,h:Math.PI,mesh:null,car:null,walk:0,moving:0,amp:0};
let camYaw=Math.PI,camPitch=0.38,camDist=5.6,lastDrag=0,gameMin=10*60,running=false;
let panelOpen=false,chatOpen=false,mission=null,missionCd=2,impactCd=0,fineCd=0,hudT=0,miniT=0,promptKey='',nearSpot=null,nearCar=null,idleT=0;
const keys={};const joy={x:0,y:0,id:null};
let blackout=0,cutCd=rand(90,160),look={s:0x3d7be0,k:0xd9a47c},nearPed=null,clouds=[],sea;
const dummy=new THREE.Object3D();
let actx=null,engOsc=null,engGain=null,engLp=null;

