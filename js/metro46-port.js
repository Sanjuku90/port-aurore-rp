'use strict';
/* v46 · Port-Aurore · Aurore Business District (phase 2 de la feuille de route) */
(function(){
const MET=window.MET46,A=MET.ARCH;
/* gratte-ciel : socle, entrée monumentale, fût vitré à gradins, couronne, toit technique, parking */
A.tower=function(k,b){const P=b.pal||{},wall=P.wall||0x8fa3b5,acc=P.accent||0xd6b25a,ph=b.podium||12,tw=b.tw||b.w*.6,td=b.td||b.d*.6,hd=b.d/2;
  k.blk('vol',0,0,0,b.w,ph,b.d,P.base||0xd9d4c8);k.blk('gloss',0,0,hd-.02,b.w*.8,ph*.55,.3,0x2a4256);
  k.blk('det',0,0,hd+3,12,.4,6,0xb9b4a8);k.blk('det',0,ph*.6,hd+3,14,.5,7,acc);[-6,6].forEach(x=>k.cyl('det',x,0,hd+5.8,.45,ph*.6,acc));
  k.blk('det',b.w/2-4,-.2,hd+.5,6,3.2,1,0x111418);k.box('det',b.w/2-4,1,hd+4,.15,.15,5,0xd94f4f);
  for(let i=0;i<6;i++){k.box('det',-b.w/2+3+i*3,.06,hd+10,.15,.02,5,0xf2f2ee);if(i%2)k.car(-b.w/2+4.5+i*3,hd+10,0);}
  const tiers=b.tiers||3;let y=ph,w=tw,d=td;for(let t=0;t<tiers;t++){const h=(b.h-ph)/tiers,r=(b.twist||0)*t;k.blk('vol',0,y,0,w,h,d,wall,r);k.windows(0,0,w,d,y,y+h,{lry:r,lit:.4});k.farBox(0,y,0,w,h,d,wall,r);y+=h;w*=.86;d*=.86;}
  k.blk('emit',0,y,0,w+.3,.6,d+.3,acc);k.blk('det',0,y+.6,0,w*.5,3,d*.5,0x6d7178);if(b.spire)k.cyl('vol',0,y,0,.5,b.spire,0xcfd4d8);
  k.sign(b.name,b.tagline||'',0,ph+2.5,hd+.25,Math.min(b.w*.8,22),3.2,'#0d141c','#f5d38a');k.col(0,0,b.w,b.d);k.farBox(0,0,0,b.w,ph,b.d,P.base||0xd9d4c8);
  k.person(-4,hd+7,0);k.person(5,hd+8,Math.PI);};
/* bâtiment classique monumental : emmarchement, colonnade, fronton, dôme */
A.civic=function(k,b){const P=b.pal||{},wall=P.wall||0xe6dfcf,hd=b.d/2;k.blk('vol',0,0,0,b.w+6,1.4,b.d+6,0xcfc8b8);k.blk('vol',0,1.4,0,b.w,b.h,b.d,wall);k.windows(0,0,b.w,b.d,1.4,b.h+1.4,{faces:'blr',fh:4.5,lit:.3});
  const n=Math.floor(b.w/4);for(let i=0;i<n;i++)k.cyl('det',-b.w/2+2+i*(b.w-4)/(n-1),1.4,hd+3,.7,b.h-1,0xf2ece0);k.blk('vol',0,b.h,hd+1.5,b.w,1.6,5,wall);k.pediment('vol',0,b.h+1.6,hd+1.5,b.w,5,4,wall);
  if(b.dome){k.cyl('vol',0,b.h+1.4,0,b.dome*.9,4,wall);k.dome('gloss',0,b.h+5.4,0,b.dome,b.dome*.8,P.dome||0x6f9a8a);}
  k.sign(b.name,'',0,b.h-1.2,hd+4.2,Math.min(b.w*.7,24),2.4,'#14181e','#e8d3a0');k.col(0,0,b.w+6,b.d+6);k.farBox(0,0,0,b.w,b.h+2,b.d,wall);};
A.slab=A.tower;
const D=MET.district({key:'abd',name:'Aurore Business District',sub:'Port-Aurore · quartier financier',city:'port',x0:800,x1:1320,z0:-440,z1:220,walkers:10,specs:[
 {name:'Aurore Tower',arch:'tower',tpl:'tower',x:920,z:-150,w:72,d:64,h:210,tw:42,td:40,tiers:4,twist:.12,spire:24,offices:true,hero:true,emoji:'🏙️',cat:'Affaires',pal:{wall:0x6f8fa8,accent:0xf5c451},tagline:'Bureaux · rooftop',desc:'La plus haute tour de la Métropole.'},
 {name:'Atlantic Finance Center',arch:'tower',tpl:'finance',x:1220,z:-230,w:40,d:30,h:135,tiers:2,emoji:'🏦',cat:'Affaires',hero:true,pal:{wall:0x2f4a5f,accent:0x9fd3ff},desc:'Banque d’affaires, prêts et placements.'},
 {name:'World Trade Center',arch:'tower',tpl:'tower',x:1225,z:-90,w:56,d:30,h:150,tw:24,td:24,tiers:3,offices:true,emoji:'🌐',cat:'Affaires',pal:{wall:0x7d93a3,accent:0xffffff},desc:'Commerce international et sièges de négoce.'},
 {name:'Aurore Exchange',arch:'civic',tpl:'exchange',x:920,z:110,w:60,d:36,h:20,dome:12,emoji:'📈',cat:'Affaires',hero:true,desc:'Bourse et investissements.'},
 {name:'Platinum Corporate',arch:'tower',tpl:'tower',x:1220,z:110,w:42,d:34,h:165,tiers:5,offices:true,emoji:'🏢',cat:'Affaires',pal:{wall:0x9aa3ad,accent:0xd6b25a},desc:'Sièges de multinationales.'},
 {name:'Skyline Business Hotel',arch:'tower',tpl:'hotel',x:920,z:-385,w:46,d:28,h:95,tiers:2,emoji:'🏨',cat:'Hôtels',price:1,pal:{wall:0xc9b38a,accent:0xf5c451},desc:'Hôtel des voyageurs d’affaires, rooftop et spa.'},
 {name:'International Convention Center',arch:'civic',tpl:'convention',x:1195,z:-385,w:84,d:40,h:18,emoji:'🎤',cat:'Affaires',pal:{wall:0xdfe3e6},desc:'Congrès internationaux.'}]});
MET.onBuild(()=>{MET.road(560,-300,1700,-300,14,{lanes:2});MET.road(307,20,1700,20,14,{lanes:2});MET.road(820,-460,820,230,12);MET.road(1320,-460,1320,230,12);
  MET.lamps(560,-300,1700,-300,9,34);MET.lamps(307,20,1700,20,9,34);
  MET.walkRect(760,1700,-460,230);MET.walkRect(300,1700,10,30);
  MET.ground(1010,1130,-215,-85,'pave',.03);MET.sbox(1070,0,-150,8,.6,8,0xd8d2c4);MET.stat('gloss',MET.G.cyl,1070,.7,-150,3.4,.3,3.4,0x7fd3e6);
  for(let i=0;i<8;i++)MET.tree(1020+i*15,-210,'round',.9);});
})();
