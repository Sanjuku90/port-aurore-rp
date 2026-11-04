'use strict';
/* v47 · déploiement réel des quartiers annoncés en v46.
   Les secteurs restent streamés; le ferry traverse la mer, jamais une route. */
(function(){
const MET=window.MET46,S=MET.S,A=MET.ARCH,F=MET.FAM,T=MET.TPL;
const X=SOL27.x;
const C={glass:0x9ec7d8,gold:0xd6b25a,stone:0xd9d4c8};
const B=(key,name,x,z,w,d,h,arch,tpl,more={})=>Object.assign({
  key,name,x,z,w,d,h,arch,tpl,emoji:'🏙️',cat:'Métropole',
  desc:'Lieu métropolitain visitable avec services et interactions.'
},more);
const D=(key,name,sub,city,x0,x1,z0,z1,specs,walkers=5)=>MET.district({
  key,name,sub,city,x0,x1,z0,z1,specs,walkers
});

/* Façades spécialisées: tours v46, logements, mall, resorts, terminaux,
   industrie, gares, parkings, villas et place publique. */
A.residence=function(k,b){
  const P=b.pal||{},wall=P.wall||0xd7d8d3,bal=P.accent||C.gold,hd=b.d/2,
    pod=b.podium||8,levels=b.levels||Math.max(4,Math.floor((b.h-pod)/6));
  k.blk('vol',0,0,0,b.w,pod,b.d,P.base||0xd0c9b9);
  k.blk('gloss',0,1.2,hd+.06,b.w*.65,2.3,.14,C.glass);
  k.blk('det',0,pod-.5,hd+1.5,b.w+2,1.1,3,bal);
  const fh=(b.h-pod)/levels;
  for(let i=0;i<levels;i++){
    const y=pod+i*fh,w=b.w*(1-i*.012),d=b.d*(1-i*.01);
    k.blk('vol',0,y,0,w,fh-.25,d,wall);
    k.windows(0,0,w,d,y,y+fh-.25,{fh:3.4,ww:1.5,wh:2.05,lit:.32});
    k.blk('det',0,y+.55,hd+1.3,w*.72,.18,2.2,bal);
    k.box('det',0,y+.68,hd+2.35,w*.72,.12,.12,0xf1eee7);
    k.farBox(0,y,0,w,fh-.25,d,wall);
  }
  k.blk('det',0,b.h-.2,0,b.w*.78,.5,b.d*.78,0xc4c7c5);
  k.sign(b.name,b.tagline||'RÉSIDENCE · ACCÈS SÉCURISÉ',0,pod+2,hd+.25,Math.min(b.w*.72,20),2.2,'#172531','#f4d48a');
  k.col(0,0,b.w,b.d);
};
A.mall=function(k,b){
  const P=b.pal||{},hd=b.d/2,wall=P.wall||0xd9dce0;
  k.blk('vol',0,0,0,b.w,b.h,b.d,wall);
  k.blk('vol',0,b.h-.4,0,b.w+4,.8,b.d+4,P.roof||0x333b45);
  k.blk('gloss',0,1.2,hd+.08,b.w*.66,Math.min(5,b.h*.45),.18,C.glass);
  k.blk('det',0,4.3,hd+1.1,b.w*.74,.42,2.2,P.accent||C.gold);
  for(let i=-2;i<=2;i++)k.blk('det',i*b.w*.105,1.2,hd+1.2,1.2,3.3,.22,0xe8edf0);
  k.windows(0,0,b.w,b.d,2,b.h-1,{fh:4,ww:2.2,wh:2.2,lit:.22});
  k.blk('gloss',0,b.h+.05,0,b.w*.28,.6,b.d*.25,C.glass);
  k.sign(b.name,b.tagline||'GALERIE · RESTAURATION · LOISIRS',0,b.h-2,hd+.2,Math.min(b.w*.7,28),3,'#132437','#f5d38a');
  for(let i=0;i<8;i++){const x=-b.w*.43+i*b.w*.123;k.box('det',x,.07,hd+12,.14,.02,4.3,0xf2f2ee);if(i%2===0)k.car(x,hd+15,0);}
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,b.h,b.d,wall);
};
A.resort=function(k,b){
  const P=b.pal||{},hd=b.d/2,wall=P.wall||0xece4d3;
  k.blk('vol',0,0,0,b.w,b.h,b.d,wall);
  k.blk('vol',0,b.h-.2,0,b.w+2,.6,b.d+2,P.roof||0x9a7653);
  k.blk('gloss',0,1,hd+.12,b.w*.6,2.2,.18,C.glass);
  k.blk('det',0,2.5,hd+1,b.w*.72,.28,2.1,P.accent||C.gold);
  for(let y=4;y<b.h-1;y+=Math.max(4,b.h/Math.max(2,Math.floor(b.h/5)))){
    k.blk('det',0,y,hd+1.25,b.w*.76,.18,2.4,0xe7d2ad);
    k.windows(0,0,b.w,b.d,y,y+4,{fh:3.8,ww:1.8,wh:2.2,lit:.42});
  }
  for(let i=-3;i<=3;i++)k.cyl('det',i*b.w/7,0,hd+2.4,.26,b.h-1,0xf2eee5);
  k.sign(b.name,b.tagline||'RESORT · SPA · VUE MER',0,b.h-1.7,hd+.3,Math.min(b.w*.72,24),2.5,'#154358','#f5d38a');
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,b.h,b.d,wall);
};
A.terminal=function(k,b){
  const P=b.pal||{},hd=b.d/2,wall=P.wall||0xe4e7e7;
  k.blk('vol',0,0,0,b.w,b.h,b.d,wall);
  k.blk('gloss',0,2,hd+.08,b.w*.78,Math.max(2,b.h*.42),.15,C.glass);
  k.blk('vol',0,b.h,0,b.w+8,1.2,b.d+8,P.roof||0x435563);
  k.blk('det',0,b.h+.65,0,b.w*.56,.24,b.d*.68,C.gold);
  for(let i=-3;i<=3;i++)k.cyl('det',i*b.w/7,0,hd+2.6,.28,b.h,0xf5f2e9);
  k.blk('det',0,.2,hd+6,b.w*.88,.3,12,0x596775);
  k.windows(0,0,b.w,b.d,1,b.h-1,{fh:3.6,ww:2.5,wh:2.6,lit:.3});
  k.sign(b.name,b.tagline||'DÉPARTS · ARRIVÉES',0,b.h-1.5,hd+.24,Math.min(b.w*.7,30),2.8,'#0c2032','#f5d38a');
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,b.h,b.d,wall);
};
A.industrial=function(k,b){
  const P=b.pal||{},hd=b.d/2,wall=P.wall||0x8d969d;
  k.blk('vol',0,0,0,b.w,b.h,b.d,wall);k.blk('vol',0,b.h+.1,0,b.w+2,.7,b.d+2,P.roof||0x424b53);
  for(let i=-2;i<=2;i++){const x=i*b.w*.16;k.blk('det',x,0,hd+.2,b.w*.1,Math.min(b.h*.72,7),.3,0x394650);k.blk('gloss',x,1.2,hd+.42,b.w*.085,1.4,.08,C.glass);k.blk('det',x,0,hd+2,b.w*.1,.4,4,0xb1b6b8);}
  for(let i=-2;i<=2;i++)k.blk('det',i*b.w*.17,.3,-hd-1,6,.6,2,0xb9753c);
  k.sign(b.name,b.tagline||'LOGISTIQUE · ACCÈS CONTRÔLÉ',0,b.h-1.4,hd+.28,Math.min(b.w*.72,26),2.4,'#26333e','#f2cf7a');
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,b.h,b.d,wall);
};
A.station=function(k,b){
  const P=b.pal||{},hd=b.d/2,wall=P.wall||0xdfe5e6;
  k.blk('vol',0,0,0,b.w,b.h,b.d,wall);k.blk('gloss',0,1.3,hd+.08,b.w*.7,2.4,.14,C.glass);
  k.blk('vol',0,b.h,0,b.w+6,.6,b.d+6,P.roof||0x344c61);
  for(let i=-2;i<=2;i++)k.cyl('det',i*b.w/5,0,hd+2,.18,b.h+.2,0xe6e8e8);
  k.blk('emit',0,.06,hd+7,b.w*.8,.06,1.2,0xf5c451);
  k.sign(b.name,b.tagline||'MOBILITÉ MÉTROPOLITAINE',0,b.h-1,hd+.25,Math.min(b.w*.72,20),2.2,'#102536','#f5d38a');
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,b.h,b.d,wall);
};
A.carpark=function(k,b){
  const hd=b.d/2,wall=0x8c9398;k.blk('vol',0,0,0,b.w,b.h,b.d,wall);
  for(let y=1.2;y<b.h;y+=3.2){k.blk('vol',0,y,0,b.w,.34,b.d,0x5b646b);for(let i=-2;i<=2;i++)k.cyl('det',i*b.w/5,y-.4,hd+1,.18,2.6,0xd1d4d4);}
  for(let i=-2;i<=2;i++)k.blk('emit',i*b.w/5,.05,hd+4,.14,.02,5,0xf5c451);
  k.sign(b.name,'PARKING · ACCÈS 24/7',0,b.h-1.2,hd+.2,Math.min(b.w*.7,20),2.2,'#26333e','#f5d38a');
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,b.h,b.d,wall);
};
A.villa=function(k,b){
  const P=b.pal||{},hd=b.d/2,wall=P.wall||0xe6ddcc;
  k.blk('vol',0,0,0,b.w,b.h,b.d,wall);k.blk('vol',0,b.h,0,b.w+2,.7,b.d+2,P.roof||0x5e665c);
  k.blk('gloss',0,1.3,hd+.1,b.w*.45,2.3,.16,C.glass);k.blk('det',0,0,hd+3,b.w*.72,.25,6,P.accent||C.gold);
  for(let i=-2;i<=2;i++)k.cyl('det',i*b.w/5,0,hd+4,.16,b.h+1,0xf0ece1);
  k.windows(0,0,b.w,b.d,1,b.h-1,{fh:3.5,ww:1.8,wh:2,lit:.22});
  k.sign(b.name,b.tagline||'VILLAS · ACCÈS PRIVÉ',0,b.h-1.2,hd+.2,Math.min(b.w*.7,17),2,'#27383d','#f4d48a');
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,b.h,b.d,wall);
};
A.plaza=function(k,b){
  const hw=b.w/2,hd=b.d/2;k.blk('vol',0,0,0,b.w,.22,b.d,0xb7b3a8);
  k.blk('det',0,.13,0,b.w*.52,.12,b.d*.5,0x637f62);k.cyl('gloss',0,.2,0,Math.min(b.w,b.d)*.16,.34,0x55cce0);k.cyl('det',0,.25,0,.35,1.7,0xd8d2c4);
  for(const x of [-hw+4,hw-4])for(const z of [-hd+4,hd-4]){k.blk('det',x,.5,z,4,1,4,0x627a52);k.sph('det',x,2,z,.9,0x4d8a4e,1.4);}
  for(let i=-2;i<=2;i++)k.box('emit',i*4,.28,hd-2,.18,.06,1,0xf5c451);
  k.sign(b.name,b.tagline||'PLACE PUBLIQUE · ÉVÉNEMENTS',0,3,hd+1,Math.min(b.w*.62,18),2,'#26333e','#f5d38a');
  k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,1,b.d,0x74826a);
};

/* Place publique financière, complément du quartier v46 déjà construit. */
const abd=MET.districts.find(q=>q.key==='abd');
if(abd){
  const p=MET.building(abd,B('aurore-plaza','Aurore Plaza',1050,75,44,32,4,'plaza','clubonly',{
    emoji:'🌳',cat:'Places publiques',tagline:'PLACE FINANCIÈRE · RENDEZ-VOUS',
    onEnter(){openPanel('Aurore Plaza','La place publique du quartier financier.',[
      {label:'Déjeuner d’affaires · 30 min',fn:()=>MET.fade(30,()=>MET.up('energy',8),'Pause terminée.')},
      {label:'Événement de quartier',fn:()=>{state.rep+=1;MET.up('fun',8);toast('Rencontres et networking à Aurore Plaza.','good');}}
    ]);}
  }));p.arch='plaza';
}

/* Port-Aurore: résidences, grand commerce, waterfront. */
const heights=D('platinum-heights','Platinum Heights','Port-Aurore · résidences premium','port',760,1350,-900,-440,[
  B('platinum-residence','Platinum Residence',900,-610,54,40,58,'residence','residence',{cat:'Immobilier',units:['studio','t3','duplex','penthouse'],price:2.1,hero:true,pal:{wall:0xc8c8c2,accent:C.gold}}),
  B('diamond-tower','Diamond Tower Residences',1110,-610,42,36,128,'residence','residence',{cat:'Immobilier',units:['t3','duplex','penthouse'],price:2.7,pal:{wall:0x8299a8,accent:0xcceeff},hero:true}),
  B('penthouse-terraces','Terrasses Platinum',1260,-530,34,30,92,'residence','residence',{cat:'Immobilier',units:['t3','penthouse'],price:2.4,pal:{wall:0xb0a797,accent:C.gold}}),
  B('modern-villas','Villas contemporaines',880,-790,30,24,15,'villa','villa',{cat:'Immobilier',units:['villa'],price:2.8,pal:{wall:0xd8d2c2,accent:0x75a9a1}}),
  B('platinum-residents-club','Club privé des résidents',1060,-790,34,24,13,'resort','clubonly',{cat:'Loisirs',pal:{wall:0x493c33,accent:C.gold}}),
  B('platinum-fitness','Fitness premium',1230,-770,32,24,12,'mall','gymonly',{cat:'Sport',pal:{wall:0x637c8a,accent:0x6ce0c1}}),
  B('platinum-carpark','Parking souterrain Platinum',1120,-850,56,34,12,'carpark','carpark',{cat:'Services',pal:{wall:0x727a82}}),
  B('platinum-metro','Station Platinum Heights',790,-540,24,14,6,'station','metro',{cat:'Transports',line:'metro-port',stop:1,lines:['metro-port']})
],5);
const mall=D('aurore-grand-mall','Aurore Grand Mall','Port-Aurore · commerce, cinéma et loisirs','port',1330,1760,-260,230,[
  B('aurore-grand-mall','Aurore Grand Mall',1510,-45,100,76,26,'mall','mall',{cat:'Commerce',hero:true,pal:{wall:0xd6dce0,accent:C.gold},tagline:'GRAND MAGASIN · FOOD COURT · IMAX'}),
  B('grand-mall-parking','Parking multiniveau du Mall',1660,-180,46,30,13,'carpark','carpark',{cat:'Services'}),
  B('grand-mall-supermarket','Supermarché international',1395,125,40,28,12,'mall','mall',{cat:'Commerce',tagline:'ÉPICERIE INTERNATIONALE'}),
  B('aurore-multiplex','Multiplex Aurore',1640,115,42,30,18,'mall','arena',{cat:'Loisirs',tagline:'CINÉMA · ARCADE · BOWLING'}),
  B('grand-mall-metro','Station Grand Mall',1370,-175,24,14,6,'station','metro',{cat:'Transports',line:'metro-port',stop:2,lines:['metro-port']})
],5);
const waterfront=D('aurore-waterfront','Aurore Waterfront','Port-Aurore · marina, croisières et loisirs','port',1320,1760,230,790,[
  B('international-marina','Marina internationale',1420,390,42,26,12,'terminal','marina',{cat:'Tourisme',pal:{wall:0xdfe7e7,accent:0x2f83a0}}),
  B('yacht-club','Yacht Club Aurore',1620,400,36,26,15,'resort','yacht',{cat:'Tourisme',pal:{wall:0xe9dfce,accent:C.gold}}),
  B('cruise-terminal','Terminal de croisière',1425,635,74,38,14,'terminal','terminal',{cat:'Transports',line:'ferry',lines:['ferry'],hero:true,pal:{wall:0xd9e0e4,accent:0x3b89a7}}),
  B('aurore-aquarium','Aquarium de la Lagune',1630,640,54,40,18,'mall','aquarium',{cat:'Culture',pal:{wall:0x16394e,accent:0x4bd1e5}}),
  B('waterfront-grand-hotel','Grand Hôtel Waterfront',1620,275,52,34,72,'tower','hotel',{cat:'Hôtels',price:2.4,hero:true,pal:{wall:0xd6c6a7,accent:C.gold}}),
  B('centre-nautique','Centre nautique Aurore',1370,285,36,28,13,'resort','beachclub',{cat:'Sport',pal:{wall:0xe8ddc9,accent:0x2899ad}}),
  B('waterfront-restaurants','Restaurants des Docks',1510,495,34,22,10,'resort','resto',{cat:'Restauration',pal:{wall:0xe4d2b6,accent:0xd9874b}}),
  B('waterfront-metro','Station Waterfront',1325,260,24,14,6,'station','metro',{cat:'Transports',line:'metro-port',stop:3,lines:['metro-port']})
],6);

/* PAX existe déjà: cette zone lui ajoute fret, hôtel et parking, sans second terminal. */
const pax=D('pax-metropolitan-services','Pôle aéroportuaire métropolitain','Port-Aurore · services de l’aéroport PAX existant','port',-635,-370,-740,-350,[
  B('aurore-air-cargo','Centre de fret aérien Aurore',-505,-520,64,42,16,'industrial','warehouse',{cat:'Logistique',ctl:'logistique',pal:{wall:0x89959b,accent:0xf0bf54}}),
  B('pax-airport-hotel','Hôtel de l’Aéroport',-410,-650,40,28,42,'tower','hotel',{cat:'Hôtels',price:1.5,pal:{wall:0xd7c8a8,accent:C.gold}}),
  B('pax-parking','Parking international PAX',-545,-680,48,34,12,'carpark','carpark',{cat:'Services'})
],3);

/* Nouvelle-Aurore: les équipements publics v40 restent en place. */
const federal=D('federal-boulevard','Federal Boulevard','Nouvelle-Aurore · institutions fédérales','third',-2850,-2310,540,1010,[
  B('palais-des-nations','Palais des Nations',-2750,700,76,50,34,'civic','nations',{cat:'Institutions',hero:true,pal:{wall:0xe2d6c0,dome:0xc7a75a},dome:13}),
  B('assemblee-nationale','Assemblée nationale',-2565,700,62,42,24,'civic','assembly',{cat:'Institutions',hero:true,dome:10,pal:{wall:0xe5dfd2}}),
  B('ministere-finances','Ministère des Finances',-2740,890,40,30,18,'civic','ministry',{cat:'Institutions',pal:{wall:0xd7d2c4}}),
  B('ministere-transports','Ministère des Transports',-2605,890,40,30,18,'civic','ministry',{cat:'Institutions',pal:{wall:0xcad4d8}}),
  B('cour-constitutionnelle','Cour constitutionnelle',-2470,890,42,30,20,'civic','court',{cat:'Institutions',pal:{wall:0xd9d3c7}}),
  B('banque-centrale','Banque centrale',-2380,700,46,36,24,'civic','cbank',{cat:'Finance',hero:true,dome:8,pal:{wall:0x8d9eaa,accent:C.gold}}),
  B('federal-metro','Station Federal Boulevard',-2630,600,24,14,6,'station','metro',{cat:'Transports',line:'metro-nouvelle',stop:0,lines:['metro-nouvelle']})
],5);
const diplomatic=D('diplomatic-quarter','Diplomatic Quarter','Nouvelle-Aurore · ambassades et relations internationales','third',-2310,-1850,540,1010,[
  B('ambassade-internationale','Ambassade internationale',-2220,700,42,30,19,'civic','embassy',{cat:'Diplomatie',flag:0x2caa8e,pal:{wall:0xe7dfd0}}),
  B('consulat-des-nations','Consulat des Nations',-2070,700,34,26,15,'civic','embassy',{cat:'Diplomatie',flag:0x3d7be0,pal:{wall:0xd4dfe0}}),
  B('residences-diplomatiques','Résidences diplomatiques',-1925,700,48,34,32,'residence','residence',{cat:'Immobilier',units:['t3','penthouse'],price:1.9,pal:{wall:0xd2c8b7,accent:C.gold}}),
  B('centre-conferences-presidentielles','Centre de conférences présidentielles',-2205,885,64,40,22,'civic','presconf',{cat:'Institutions',hero:true,pal:{wall:0xd6dce0}}),
  B('diplomatic-metro','Station Diplomatic Quarter',-1930,885,24,14,6,'station','metro',{cat:'Transports',line:'metro-nouvelle',stop:1,lines:['metro-nouvelle']})
],4);
const university=D('university-heights','University Heights','Nouvelle-Aurore · campus, recherche et santé','third',-2850,-2310,-1060,-620,[
  B('residence-etudiante','Résidence universitaire',-2740,-710,48,36,42,'residence','residence',{cat:'Logement',units:['studio','t3'],price:.72,pal:{wall:0xd6d8d1,accent:0x4e9b82}}),
  B('bibliotheque-nationale','Bibliothèque nationale',-2550,-710,68,46,24,'civic','library',{cat:'Culture',hero:true,pal:{wall:0xe0d7c6}}),
  B('centre-recherche-scientifique','Centre de recherche scientifique',-2380,-710,50,34,20,'mall','lab',{cat:'Recherche',pal:{wall:0xe1e7e8,accent:0x65b3c4}}),
  B('campus-student-center','Maison des étudiants',-2710,-900,42,28,15,'resort','clubonly',{cat:'Loisirs',pal:{wall:0xe5d8c6,accent:0x44a884}}),
  B('university-metro','Station University Heights',-2380,-920,24,14,6,'station','metro',{cat:'Transports',line:'metro-nouvelle',stop:5,lines:['metro-nouvelle']})
],4);
const innovation=D('innovation-city','Innovation City','Nouvelle-Aurore · technologie et entrepreneuriat','third',-2310,-1850,-1060,-620,[
  B('innovation-incubator','Innovation City Incubator',-2220,-710,58,40,20,'mall','incubator',{cat:'Technologie',hero:true,pal:{wall:0xd9e5df,accent:0x39a77b}}),
  B('aurore-data-center','Centre de données métropolitain',-2050,-710,64,44,18,'industrial','lab',{cat:'Technologie',dc:true,pal:{wall:0x545c65,accent:0x38d3a2}}),
  B('scientific-lab-innovation','Laboratoire scientifique Aurore',-1900,-710,42,30,18,'mall','lab',{cat:'Recherche',pal:{wall:0xe8ecee,accent:0x4da8d1}}),
  B('tech-corporate','Aurore Tech Campus',-2200,-900,48,34,68,'tower','tower',{cat:'Technologie',offices:true,hero:true,pal:{wall:0x597b8f,accent:0x58ddb5}}),
  B('innovation-metro','Station Innovation City',-1900,-920,24,14,6,'station','metro',{cat:'Transports',line:'metro-nouvelle',stop:4,lines:['metro-nouvelle']})
],4);
const premium=D('nouvelle-premium','Nouvelle-Aurore Premium','Nouvelle-Aurore · résidences, hôtels et pôle médical','third',-1840,-1570,-1160,-620,[
  B('nouvelle-premium-residence','Nouvelle-Aurore Premium Résidences',-1790,-930,48,36,112,'residence','residence',{cat:'Immobilier',units:['studio','t3','duplex','penthouse'],price:2.3,hero:true,pal:{wall:0x8c9cab,accent:C.gold}}),
  B('executive-hotel-na','Nouvelle-Aurore Executive Hotel',-1635,-920,42,32,66,'tower','hotel',{cat:'Hôtels',price:1.8,pal:{wall:0xcbb997,accent:C.gold}}),
  B('private-clinic-na','Clinique privée métropolitaine',-1780,-700,34,24,14,'mall','med',{cat:'Santé',med:'clinic',pal:{wall:0xe9f0ef,accent:0x4b9eaa}}),
  B('dental-center-na','Centre dentaire métropolitain',-1670,-700,30,22,12,'mall','med',{cat:'Santé',med:'dental',pal:{wall:0xe9f0ef,accent:0x4b9eaa}}),
  B('maternity-center-na','Maternité métropolitaine',-1780,-790,34,24,13,'mall','med',{cat:'Santé',med:'maternity',pal:{wall:0xf0e9e7,accent:0xc7758d}}),
  B('central-lab-na','Laboratoire d’analyses',-1670,-790,30,22,12,'mall','med',{cat:'Santé',med:'lab',pal:{wall:0xe9f0ef,accent:0x4b9eaa}}),
  B('radiology-center-na','Centre de radiologie',-1780,-865,34,24,13,'mall','med',{cat:'Santé',med:'radio',pal:{wall:0xe9f0ef,accent:0x4b9eaa}}),
  B('central-pharmacy-na','Pharmacie centrale métropolitaine',-1670,-865,30,22,12,'mall','med',{cat:'Santé',med:'pharma',pal:{wall:0xddebe2,accent:0x3d9c6c}})
],5);
const exhibition=D('exhibition-district','Exhibition District','Nouvelle-Aurore · salons, congrès et événements','third',-1840,-1570,540,1010,[
  B('centre-international-expositions','Centre international des expositions',-1770,700,96,60,24,'terminal','expo',{cat:'Événements',hero:true,pal:{wall:0xdfe4e6,accent:C.gold}}),
  B('nouvelle-arena','Arène métropolitaine',-1770,900,70,48,28,'mall','arena',{cat:'Événements',pal:{wall:0x39414c,accent:0x9b68d2}}),
  B('hotel-congres-na','Hôtel des Congrès',-1625,875,42,30,46,'tower','hotel',{cat:'Hôtels',price:1.4,pal:{wall:0xcab99a,accent:C.gold}}),
  B('expo-parking','Parking Exhibition District',-1625,680,46,30,12,'carpark','carpark',{cat:'Services'}),
  B('exhibition-metro','Station Exhibition District',-1780,1010,24,14,6,'station','metro',{cat:'Transports',line:'metro-nouvelle',stop:2,lines:['metro-nouvelle']})
],5);

/* Corridor A1: logistique, services techniques, contrôle et transports. */
const corridor=D('metro-corridor','Corridor métropolitain','A1 · aire de service · logistique · mobilité','corr',-1710,-980,-650,250,[
  B('a1-intermodal-hub','Pôle intermodal central',-1300,-350,54,32,15,'terminal','terminal',{cat:'Transports',line:'a1-coach',lines:['a1-coach'],hero:true,pal:{wall:0xe2e4e3,accent:C.gold}}),
  B('aurore-logistics-park','Aurore Logistics Park',-1480,-120,68,46,18,'industrial','warehouse',{cat:'Logistique',ctl:'logistique',pal:{wall:0x8e999e,accent:0xe0aa51}}),
  B('national-distribution-center','Centre de distribution national',-1300,70,62,42,16,'industrial','warehouse',{cat:'Logistique',ctl:'logistique',pal:{wall:0x9aa1a5,accent:0x426b86}}),
  B('cold-storage-hub','Entrepôts frigorifiques',-1120,-125,54,38,15,'industrial','warehouse',{cat:'Logistique',cold:true,pal:{wall:0x9bb8c0,accent:0x5fc5d5}}),
  B('premium-service-station','Station-service premium A1',-1480,100,34,24,10,'mall','fuel',{cat:'Services',pal:{wall:0xe4e2d7,accent:0x42a170}}),
  B('motorway-hotel','Hôtel autoroutier',-1280,190,42,28,32,'resort','hotel',{cat:'Hôtels',price:.8,pal:{wall:0xd4c4a3,accent:C.gold}}),
  B('road-control-center','Centre de contrôle routier',-1080,100,38,26,16,'mall','control',{cat:'Services',ctl:'routes',pal:{wall:0x5f707c,accent:0x68bfd0}}),
  B('transport-maintenance-center','Centre de maintenance des transports',-1080,-340,54,36,15,'industrial','control',{cat:'Services',ctl:'transport',pal:{wall:0x737e84,accent:0xf0bf54}}),
  B('metropolitan-emergency-center','Centre de secours métropolitain',-1600,190,46,30,16,'civic','control',{cat:'Sécurité',ctl:'secours',pal:{wall:0xe2e3df,accent:0xd94f4f}}),
  B('metropolitan-bus-depot','Dépôt métropolitain de bus',-1600,-120,54,38,14,'industrial','control',{cat:'Transports',ctl:'bus',pal:{wall:0x7c878b,accent:0xe0b44d}}),
  B('metropolitan-power-plant','Centrale électrique métropolitaine',-1025,-500,52,38,20,'industrial','control',{cat:'Services techniques',ctl:'energie',pal:{wall:0x707a7f,accent:0xe0b44d}}),
  B('metropolitan-water-treatment','Station de traitement des eaux',-1035,-235,56,38,14,'industrial','control',{cat:'Services techniques',ctl:'eau',pal:{wall:0x87989a,accent:0x4abac5}}),
  B('metropolitan-recycling-center','Centre métropolitain de recyclage',-1025,20,48,34,13,'industrial','control',{cat:'Services techniques',ctl:'recyclage',pal:{wall:0x87927e,accent:0x65a768}}),
  B('corridor-metro','Station Corridor central',-1300,-515,24,14,6,'station','metro',{cat:'Transports',line:'metro-nouvelle',stop:3,lines:['metro-nouvelle']})
],5);
const portCoach=MET.building(abd,B('a1-terminal-port','Gare routière A1 · Port-Aurore',820,-330,38,24,11,'terminal','terminal',{
  cat:'Transports',line:'a1-coach',lines:['a1-coach'],pal:{wall:0xdce5e8,accent:0x3d7be0}
}));
const hub=MET.byKey.get('a1-intermodal-hub');
const naCoach=MET.building(corridor,B('a1-terminal-nouvelle','Gare routière A1 · Nouvelle-Aurore',-1630,-330,42,28,12,'terminal','terminal',{
  cat:'Transports',line:'a1-coach',lines:['a1-coach'],pal:{wall:0xdde3e5,accent:0x3d7be0}
}));

/* Solenne: deux extensions de terre, reliées localement, jamais au continent. */
const emerald=D('emerald-coast','Emerald Coast','Solenne · resorts, villas et bien-être','sol',X+800,X+1160,-300,40,[
  B('emerald-resort','Emerald Coast Resort',X+900,-170,52,34,38,'resort','hotel',{cat:'Hôtellerie',price:2.8,hero:true,pal:{wall:0xece3cf,accent:0x2f9d89}}),
  B('overwater-villas','Villas Emerald',X+1040,-165,34,24,16,'villa','villa',{cat:'Immobilier',units:['villa'],price:3,pal:{wall:0xe5ddc9,accent:0x3c9d91}}),
  B('emerald-spa','Spa & bien-être Emerald',X+900,-20,34,24,12,'resort','beachclub',{cat:'Bien-être',pal:{wall:0xe8e2d5,accent:0x54aaa0}}),
  B('emerald-shuttle','Arrêt Emerald Coast',X+1080,-20,22,14,6,'station','station',{cat:'Transports',line:'solenne-shuttle',stop:1,lines:['solenne-shuttle']})
],4);
const solMarina=D('solenne-marina','Solenne Marina','Solenne · plaisance, ferry et croisières','sol',X+800,X+1160,40,260,[
  B('solenne-international-marina','Solenne International Marina',X+900,110,46,28,13,'terminal','marina',{cat:'Tourisme',pal:{wall:0xdfe8e6,accent:0x2f9d89}}),
  B('solenne-yacht-club','Yacht Club de Solenne',X+1050,110,38,28,15,'resort','yacht',{cat:'Tourisme',pal:{wall:0xe4d9c5,accent:C.gold}}),
  B('solenne-ferry-terminal','Terminal ferry de Solenne',X+900,220,60,34,13,'terminal','terminal',{cat:'Transports',line:'ferry',lines:['ferry'],hero:true,pal:{wall:0xe6ecea,accent:0x2f8b9e}}),
  B('solenne-boat-rental','Centre de location nautique',X+1050,220,34,24,11,'resort','marina',{cat:'Loisirs',pal:{wall:0xdbe7e3,accent:0x2f9d89}}),
  B('solenne-marina-shuttle','Arrêt Solenne Marina',X+840,80,22,14,6,'station','station',{cat:'Transports',line:'solenne-shuttle',stop:2,lines:['solenne-shuttle']})
],4);
const pearl=D('pearl-island','Pearl Island','Solenne · villas privées et plage réservée','sol',X+800,X+1160,260,510,[
  B('pearl-residences','Pearl Residences',X+900,330,48,34,36,'residence','residence',{cat:'Immobilier',units:['t3','duplex','penthouse'],price:2.8,pal:{wall:0xe4dbc9,accent:0xb4d8d0}}),
  B('pearl-villas','Villas privées Pearl',X+1050,330,34,24,16,'villa','villa',{cat:'Immobilier',units:['villa'],price:3.2,pal:{wall:0xe9e1d0,accent:C.gold}}),
  B('pearl-private-beach','Club de plage privé Pearl',X+900,455,34,24,12,'resort','beachclub',{cat:'Loisirs',pal:{wall:0xe9dfcf,accent:0x2f9d89}}),
  B('pearl-restaurants','Restaurants panoramiques Pearl',X+1050,455,34,24,12,'resort','resto',{cat:'Restauration',pal:{wall:0xe6dac5,accent:0x2f9d89}}),
  B('pearl-shuttle','Arrêt Pearl Island',X+840,330,22,14,6,'station','station',{cat:'Transports',line:'solenne-shuttle',stop:3,lines:['solenne-shuttle']})
],4);
const reserve=D('solenne-nature-reserve','Solenne Nature Reserve','Solenne · biodiversité et protection marine','sol',X-1160,X-800,-300,60,[
  B('nature-reserve-center','Centre de la réserve naturelle',X-950,-175,42,28,14,'resort','reserve',{cat:'Nature',pal:{wall:0xdce5d2,accent:0x4b8a50}}),
  B('marine-protection-center','Centre de protection marine',X-1050,-35,34,24,12,'civic','reserve',{cat:'Nature',pal:{wall:0xd6e5df,accent:0x329fa1}}),
  B('solenne-observatory','Observatoire de Solenne',X-900,-35,32,22,16,'civic','reserve',{cat:'Nature',obs:true,pal:{wall:0xd8d9cd,accent:0x65a5b9}}),
  B('botanical-garden','Jardin botanique',X-1050,-205,40,30,8,'plaza','reserve',{cat:'Nature'}),
  B('reserve-shuttle','Arrêt Nature Reserve',X-900,25,22,14,6,'station','station',{cat:'Transports',line:'solenne-shuttle',stop:4,lines:['solenne-shuttle']})
],4);
const solIntl=D('solenne-international','Solenne International','Solenne · accueil touristique, congrès et affaires','sol',X-1160,X-800,60,510,[
  B('solenne-tourism-terminal','Terminal touristique international',X-950,150,58,36,14,'terminal','terminal',{cat:'Tourisme',line:'solenne-shuttle',lines:['solenne-shuttle'],hero:true,pal:{wall:0xe5e5d9,accent:0x1f7777}}),
  B('solenne-tourism-office','Office du tourisme international',X-1050,330,30,22,11,'resort','tourism',{cat:'Tourisme'}),
  B('solenne-convention-center','Centre de congrès de Solenne',X-900,330,66,42,18,'terminal','expo',{cat:'Événements',pal:{wall:0xe5e7e4,accent:C.gold}}),
  B('solenne-business-hotel','Hôtel d’affaires Solenne',X-1050,455,40,28,34,'resort','hotel',{cat:'Hôtels',price:1.4,pal:{wall:0xe4dac6,accent:0x1f7777}}),
  B('solenne-international-shuttle','Arrêt Solenne International',X-900,455,22,14,6,'station','station',{cat:'Transports',line:'solenne-shuttle',stop:0,lines:['solenne-shuttle']})
],4);

/* Accès piéton continu et aires de terre, sans route au-dessus de la mer. */
MET.walkRect(760,1760,-900,800);MET.walkRect(-2850,-1570,-1160,1010);
MET.walkRect(-1710,-980,-900,300);MET.walkRect(-1000,-560,-940,-740);
MET.walkRect(X-1160,X-760,-300,510);MET.walkRect(X+760,X+1160,-300,510);
T.carpark=[['main','Parking multiniveau','parking']];F.carpark=[['main','Parking multiniveau','parking']];

const portStations=[
  MET.building(abd,B('abd-metro','Station Aurore Business District',1080,-300,24,14,6,'station','metro',{cat:'Transports',line:'metro-port',stop:0,lines:['metro-port']})),
  MET.byKey.get('platinum-metro'),MET.byKey.get('grand-mall-metro'),MET.byKey.get('waterfront-metro')
];
const natStations=[
  MET.byKey.get('federal-metro'),MET.byKey.get('diplomatic-metro'),
  MET.byKey.get('exhibition-metro'),MET.byKey.get('corridor-metro'),
  MET.byKey.get('innovation-metro'),MET.byKey.get('university-metro')
];
const makePath=arr=>arr.map(b=>({x:b.door.x,y:.2,z:b.door.z}));
const portPath=makePath(portStations);
MET.line({id:'metro-port',name:'Métro M1 · Port-Aurore',icon:'🚇',kind:'metro',color:0xe0a526,speed:26,
  stops:portStations.map((b,i)=>({n:b.name,x:b.door.x,z:b.door.z,point:i})),path:portPath});
const natPath=makePath(natStations);
MET.line({id:'metro-nouvelle',name:'Métro M2 · Nouvelle-Aurore',icon:'🚇',kind:'metro',color:0x3d7be0,speed:34,
  stops:natStations.map((b,i)=>({n:b.name,x:b.door.x,z:b.door.z,point:i})),path:natPath});

/* A1 contourne la piste PAX au sud, puis rejoint la ville et le corridor. */
if(portCoach&&hub&&naCoach){
  const p0={x:portCoach.door.x,y:.2,z:portCoach.door.z},p1={x:-620,y:.2,z:-300},
    p2={x:-620,y:.2,z:-850},p3={x:-950,y:.2,z:-850},
    p4={x:-950,y:.2,z:-300},p5={x:hub.door.x,y:.2,z:hub.door.z},
    p6={x:naCoach.door.x,y:.2,z:naCoach.door.z};
  MET.line({id:'a1-coach',name:'Autocar A1 · Port-Aurore ↔ Nouvelle-Aurore',icon:'🚌',kind:'coach',color:0x3d7be0,speed:58,
    path:[p0,p1,p2,p3,p4,p5,p6],
    stops:[{n:portCoach.name,x:p0.x,z:p0.z,point:0},{n:hub.name,x:p5.x,z:p5.z,point:5},{n:naCoach.name,x:p6.x,z:p6.z,point:6}]});
}
const solStations=['solenne-international-shuttle','emerald-shuttle','solenne-marina-shuttle','pearl-shuttle','reserve-shuttle'].map(k=>MET.byKey.get(k));
const solPath=makePath(solStations);
MET.line({id:'solenne-shuttle',name:'Navette Solenne · boucle touristique',icon:'🚐',kind:'coach',color:0x2f9d89,speed:25,
  stops:solStations.map((b,i)=>({n:b.name,x:b.door.x,z:b.door.z,point:i})),path:solPath});
const cruise=MET.byKey.get('cruise-terminal'),ferry=MET.byKey.get('solenne-ferry-terminal');
if(cruise&&ferry){
  const start={x:cruise.door.x,y:.7,z:cruise.door.z},end={x:ferry.door.x,y:.7,z:ferry.door.z};
  const route=[start,{x:700,y:.7,z:920},{x:-1800,y:.7,z:900},{x:-4400,y:.7,z:720},{x:-6500,y:.7,z:470},end];
  const length=route.slice(1).reduce((n,p,i)=>n+Math.hypot(p.x-route[i].x,p.z-route[i].z),0);
  MET.line({id:'ferry',name:'Ferry international · Port-Aurore ↔ Solenne',icon:'⛴️',kind:'ferry',color:0x35a6bd,speed:150,
    path:route,jump:[520,Math.max(700,length-520)],jumpMin:35,
    stops:[{n:cruise.name,x:start.x,z:start.z,point:0},{n:ferry.name,x:end.x,z:end.z,point:5}]});
}

/* Billetterie partagée. Sortie de l’intérieur avant le départ physique. */
function pathBetween(line,from,to){
  const a=line.stops[from].point==null?from:line.stops[from].point,
    b=line.stops[to].point==null?to:line.stops[to].point,
    pts=line.path.slice(Math.min(a,b),Math.max(a,b)+1);
  return from<=to?pts:pts.reverse();
}
function board(b){
  const line=MET.lines[b.line];if(!line){openPanel(b.name,'Aucune ligne active à cette station.',[]);return;}
  const from=Number.isInteger(b.stop)?b.stop:line.stops.reduce((best,s,i)=>
    Math.hypot(s.x-b.door.x,s.z-b.door.z)<Math.hypot(line.stops[best].x-b.door.x,line.stops[best].z-b.door.z)?i:best,0);
  const fare=line.kind==='ferry'?95:line.kind==='coach'?32:8;
  const rows=line.stops.map((s,to)=>{
    if(to===from)return null;
    const cost=line.kind!=='ferry'&&S.pass>MET.day()?0:fare;
    return {label:'Billet vers '+s.n+' · '+(cost?fmt(cost):'Pass actif'),off:cost>0&&!MET.afford(cost),fn:()=>{
      if(MET.ride){toast('Tu es déjà en trajet.','warn');return;}
      if(player.car){toast('Gare ta voiture avant de monter.','warn');return;}
      if(cost&&!MET.pay(cost))return;
      const path=pathBetween(line,from,to);
      if(player.inside)leaveInterior();
      const start=()=>{if(player.inside){setTimeout(start,90);return;}
        panelOpen=false;const el=document.getElementById('panel');if(el)el.hidden=true;
        MET.rideStart({kind:line.kind,color:line.color,path,speed:line.speed,label:line.name,
          arrive:'Arrivée · '+s.n,minutes:line.kind==='ferry'?35:line.kind==='coach'?18:4,
          jump:line.jump,jumpMin:line.jumpMin,dropZ:4});
      };setTimeout(start,80);
    }};
  }).filter(Boolean);
  if(line.kind!=='ferry')rows.unshift({
    label:S.pass>MET.day()?'✓ Pass Métropole actif':'Pass Métropole · 7 jours · 200 $',
    off:S.pass>MET.day()||!MET.afford(200),
    fn:()=>{if(!MET.pay(200))return;S.pass=MET.day()+7;MET.save();toast('Pass Métropole activé pour 7 jours de jeu.','good');board(b);}
  });
  openPanel(b.name+' · '+line.name,'Choisis ta destination. Les autocars suivent l’A1; le ferry traverse la mer, sans route artificielle.',rows);
}
MET.tickets=board;MET.metroBoard=board;

MET.onBuild(()=>{
  MET.ground(720,1760,-920,800,'ground',-.045);
  MET.ground(-2860,-1560,520,1050,'ground',-.045);
  MET.ground(-2860,-1560,-1160,-600,'ground',-.045);
  MET.ground(-1160,-760,-300,510,'sand',.012);MET.ground(-1120,-800,-220,440,'ground',.028);
  MET.ground(X+760,X+1160,-300,510,'sand',.012);MET.ground(X+800,X+1120,-220,440,'ground',.028);
  MET.road(560,-300,-620,-300,18,{lanes:2,median:true});
  MET.road(-620,-300,-620,-850,16,{lanes:2});MET.road(-620,-850,-950,-850,16,{lanes:2});
  MET.road(-950,-850,-950,-300,16,{lanes:2});MET.road(-950,-300,-1710,-300,18,{lanes:2,median:true});
  MET.road(-1710,-300,-1960,-300,12,{lanes:2});MET.lamps(560,-300,-620,-300,12,42);
  MET.lamps(-950,-300,-1710,-300,12,42);MET.road(-380,-300,-380,-710,10,{lanes:1});
  [-2530,-2340,-2150,-1960,-1770].forEach(x=>{
    MET.road(x,520,x,1010,11,{lanes:1});MET.road(x,-620,x,-1120,11,{lanes:1});
  });
  [680,860].forEach(z=>MET.road(-2830,z,-1580,z,12,{lanes:2}));
  [-760,-940].forEach(z=>MET.road(-2830,z,-1580,z,12,{lanes:2}));
  MET.road(1340,250,1340,740,12,{lanes:1});MET.road(1340,500,1730,500,10,{lanes:1});
  MET.road(X-800,212,X-980,212,8,{lanes:1});MET.road(X-980,212,X-980,-180,8,{lanes:1});
  MET.road(X+780,212,X+980,212,8,{lanes:1});MET.road(X+980,212,X+980,455,8,{lanes:1});
  MET.road(X-430,212,X+430,212,8,{lanes:1});MET.lamps(1340,250,1340,740,7,32);
  for(let i=0;i<12;i++){MET.tree(850+i*18,-420,'round',.8);MET.tree(850+i*18,720,'palm',.95);}
  for(let i=0;i<8;i++){MET.tree(X-1100+i*34,-250,'palm',.9);MET.tree(X+850+i*34,-250,'palm',.9);}
  for(let i=0;i<7;i++)MET.sbox(1425+i*5,.05,690,1.2,.25,48,0x8b7357);
  for(let i=0;i<5;i++)MET.sbox(X+900+i*5,.05,270,1,.22,34,0x8b7357);
});
if(typeof CHANGELOG!=='undefined'&&CHANGELOG.unshift)CHANGELOG.unshift([
  'v47 · Déploiement de la Métropole',
  'Ajout de Platinum Heights, Aurore Grand Mall, Aurore Waterfront, Federal Boulevard, Diplomatic Quarter, Innovation City, University Heights, Nouvelle-Aurore Premium, Exhibition District, Corridor métropolitain, Emerald Coast, Solenne Marina, Pearl Island, Solenne Nature Reserve et Solenne International. A1 contournant la piste PAX, navette Solenne, métro dans Port-Aurore et Nouvelle-Aurore, ferry maritime, bâtiments spécialisés, commerces, résidences, santé, secours, logistique, énergie, eau, recyclage et congrès.'
]);
})();
