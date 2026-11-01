'use strict';
/* ---------- v7 : l'appartement (chambre, salle de bain, cuisine, salon) et les commerces ---------- */
const PLM=(c,s)=>MT7['pl'+c+s]||(MT7['pl'+c+s]=tm(rep(plasterTex(c,s),.5),0xffffff,.92,0));
const TLM=(a,b,g,n,ch,sz)=>MT7['tl'+[a,b,g,n,ch,sz]]||(MT7['tl'+[a,b,g,n,ch,sz]]=tm(rep(tileTex7(a,b,g,n,ch),1/sz),0xffffff,.35,0));
const EXT7=()=>PLM(0xd9cfc0);
const PEN7=(R,c,x,z)=>{const p=F7.pendant(c);R.place(p,x,z,0,0,0,R.H);(R.hang=R.hang||[]).push(p);return p;};
function seatAt(R,x,z,y,h,app,label,o){return R.int(app[0],app[1],label||'S’asseoir',()=>sitAct({x:R.rx+x,z:R.rz+z,y,h},o),Object.assign({kind:'sit'},o||{}));}
function buildHome7(R){
  const H=R.H,wood=tm(rep(woodTex(0xb98a5a),.55),0xffffff,.5,0),kit=TLM(0xe8e4dc,0x3a3f47,0x9a9a9a,4,true,1.6),bath=TLM(0xe6ecee,0xe6ecee,0xaab4b8,6,false,1.4),
    wall=PLM(0xefe9df),bed=PLM(0x7f93a8),bw=TLM(0xf4f6f6,0xf4f6f6,0xc0c8cc,8,false,1.2),kw=PLM(0xf3efe8),ext=EXT7();
  R.floor(-9,-6.5,-1.5,-.5,wood,2);R.floor(-9,-.5,9,6.5,wood,2);R.floor(-1.5,-6.5,2.5,-.5,bath,1.4);R.floor(2.5,-6.5,9,-.5,kit,1.6);R.ceil(-9,-6.5,9,6.5);
  const T=.2,win=(t,y0,y1,w,out,curt)=>({k:'window',t,w,y0,y1,out,curt});
  R.wall(-9,-6.5,-1.5,-6.5,bed,ext,[],{th:T});R.wall(-1.5,-6.5,2.5,-6.5,bw,ext,[win(2,1.55,2.25,.8,-1)],{th:T});R.wall(2.5,-6.5,9,-6.5,kw,ext,[win(3.1,1.2,2.25,1.4,-1)],{th:T});
  R.wall(-9,6.5,9,6.5,ext,wall,[win(2.5,.85,2.35,1.4,1,0xd8c3a0),win(7.5,.6,2.45,2.2,1,0xd8c3a0),{k:'door',t:15,w:1,dir:-1,leaf:WOOD(0x7a5136),panels:true}],{th:T});
  R.wall(-9,-6.5,-9,-.5,ext,wall,[win(3.2,.9,2.3,1.3,1,0x9fb4c8)],{th:T});R.wall(-9,-.5,-9,6.5,ext,wall,[win(3.5,.85,2.35,1.4,1,0xd8c3a0)],{th:T});
  R.wall(9,-6.5,9,-.5,kw,ext,[],{th:T});R.wall(9,-.5,9,6.5,wall,ext,[win(3.5,.85,2.35,1.4,-1,0xd8c3a0)],{th:T});
  R.wall(-9,-.5,-1.5,-.5,wall,bed,[{k:'door',t:5.4,w:.9,dir:1}],{th:.12});R.wall(-1.5,-.5,2.5,-.5,wall,bw,[{k:'door',t:2.1,w:.8,dir:1}],{th:.12});
  R.wall(-1.5,-6.5,-1.5,-.5,bed,bw,[],{th:.12});R.wall(2.5,-6.5,2.5,-.5,bw,kw,[],{th:.12});
  /* ---- chambre ---- */
  const B=R.place(F7.bed(1.7,2.1,0x4a6fa5),-5.25,-5.3,0,1.9,2.2);R.bed=B;
  const n1=R.place(F7.nightstand(),-6.55,-6.12,0,.5,.42),n2=R.place(F7.nightstand(),-3.95,-6.12,0,.5,.42);R.lamps=[n1.userData.lamp,n2.userData.lamp];
  R.place(F7.rug(2.8,2.3,rugTex(0xe9e2d4,0x8a5a3a,0x4a6fa5,1)),-5.25,-4.4);
  const wr=R.place(F7.wardrobe(1.8,2.25),-7.6,-.9,Math.PI,1.8,.62);R.wardrobe=wr;
  const dk=R.place(F7.desk(1.3),-1.88,-3.4,-Math.PI/2,1.3,.62);const lp=F7.laptop();lp.position.set(0,.76,.02);dk.add(lp);R.laptop=lp.userData.scr;
  R.place(F7.officeChair(0x2f3a4a),-2.68,-3.4,Math.PI/2);R.place(F7.plant(0,1.1),-8.45,-6.0,0,.4,.4);
  R.place(F7.art(1,.7,.9),-1.57,-3.4,-Math.PI/2,0,0,1.65);R.place(F7.art(2,.5,.62),-8.88,-1.9,Math.PI/2,0,0,1.6);
  PEN7(R,0xf2efe8,-5.25,-3.4);
  R.light(-5.25,2.3,-3.4,9,0xffe2b8,'main');R.light(-5.25,1.1,-6.0,3.5,0xffcf8a,'bed');
  /* ---- salle de bain ---- */
  const sh=R.place(F7.shower(1.1,1.1),1.89,-5.85,-Math.PI/2);R.shower=sh;R.col(1.89,-6.3,1.1,.2);R.col(2.4,-5.85,.1,1.1);
  R.place(F7.toilet(),-1.06,-5.4,Math.PI/2,.5,.7);const va=R.place(F7.vanity(),-1.21,-3.4,Math.PI/2,.84,.5);R.vanity=va;
  R.place(F7.towel(0x9fd3c7),2.42,-3.0,-Math.PI/2);R.place(F7.rug(.9,.6,rugTex(0xf2efe6,0x9fd3c7,0xffffff,2)),.6,-4.4);R.place(F7.plant(0,.7),2.1,-1.0);
  R.light(.5,2.4,-3.4,7,0xf4f6ff,'main');
  /* ---- cuisine ---- */
  R.place(F7.counter(5.2,0x2f3236),5.25,-6.08,0,5.2,.64);const st=R.place(F7.stove(),3.6,-6.08,0);R.stove=st;const sk=R.place(F7.sinkTop(),5.6,-6.08,0);R.ksink=sk;
  R.place(F7.hood(),3.6,-6.2,0,0,0,1.6);R.place(F7.upper(.85),4.42,-6.22,0,0,0,1.9);R.place(F7.upper(1.4),7.1,-6.22,0,0,0,1.9);R.place(F7.upper(.5),2.95,-6.22,0,0,0,1.9);
  R.place(F7.coffeeMachine(),7.2,-6.15,0,0,0,.92);R.place(F7.kettle(),6.6,-6.1,0,0,0,.92);R.place(F7.microwave(),7.7,-6.12,0,0,0,.92);
  const fr=R.place(F7.fridge(),8.52,-5.6,-Math.PI/2,.74,.7);R.fridge=fr;
  R.place(F7.table(1.5,.85,0xa87a4f),5.9,-3.4,0,1.5,.85);[[5.45,-4.12,0],[6.35,-4.12,0],[5.45,-2.68,Math.PI],[6.35,-2.68,Math.PI]].forEach(c=>R.place(F7.chair(0xd94f4f,0x8a5a3a),c[0],c[1],c[2]));
  R.place(F7.fruitBowl(),5.7,-3.3,0,0,0,.78);const pl=R.place(F7.plate(),6.0,-3.62,0,0,0,.775);pl.visible=false;R.meal=pl;
  R.place(F7.counter(2.4,0xe9e6e0),5.9,-.95,Math.PI,2.4,.64);[5.15,5.9,6.65].forEach(x=>R.place(F7.stool(),x,-.12,0));
  PEN7(R,0x3c6e47,5.9,-3.4);R.light(5.9,2.3,-3.4,9,0xffe7c4,'main');
  /* ---- salon ---- */
  R.place(F7.tvUnit(2),-6.3,-.25,0,2,.44);const tv=R.place(F7.tv(1.5),-6.3,-.42,0,0,0,1.35);R.tv=tv.userData.tv;
  R.place(F7.rug(3.6,2.8,rugTex(0xc9b8a0,0x7a2f2f,0xe9e2d4,1)),-6.3,1.9);
  R.place(F7.sofa(0x5a6b7a,2.3,0xe0b34a),-6.3,3.05,Math.PI,2.3,.95);R.place(F7.coffeeTable(),-6.3,1.7,0,1.2,.62);
  R.place(F7.sofa(0xb5603f,1.0,false),-3.6,1.8,-2.2,.95,.95);R.place(F7.floorLamp(),-8.45,4.1).userData.lamp&&(R.flamp=R.G.children[R.G.children.length-1].userData.lamp);
  R.place(F7.bookshelf(1.6,2.1),-8.72,5.5,Math.PI/2,1.6,.38);const sb=R.place(F7.sideboard(1.6),-3.8,6.18,Math.PI,1.6,.44);const rd=F7.radio();rd.position.set(.3,.7,0);sb.add(rd);R.radio=rd.userData.dial;
  R.place(F7.art(0,1.0,1.25),-3.8,6.38,Math.PI,0,0,1.75);R.place(F7.art(3,.6,.75),8.88,1.0,-Math.PI/2,0,0,1.6);
  R.place(F7.plant(2,1.3),8.35,.25,0,.5,.5);R.place(F7.plant(1,1),-.2,6.0,0,.4,.4);R.place(F7.plant(0,.9),3.2,6.0,0,.4,.4);
  R.place(F7.sideboard(1),7.85,6.2,Math.PI,1,.44);const sw=M(R.G,rbox(.08,.12,.02,.01),M7.white,5.25,1.25,6.38,0,0,0,false);
  PEN7(R,0xf2efe8,-6.3,1.8);PEN7(R,0xf2efe8,3.5,3.0);
  R.light(-5.2,2.3,2.6,10,0xffe2b8,'main');R.light(3.5,2.3,3,8,0xffe2b8,'main');R.light(-6.3,1.2,.6,4,0x8fb8ff,'tv');R.light(-8.4,1.7,4.1,4,0xffcf8a,'lamp');
  R.zones=[[-5.25,-3.4],[.5,-3.4],[5.8,-3.4],[-4.5,3],[4,3]];R.spotI=32;
  R.entry={x:6,z:5.3,h:Math.PI};R.b=[R.rx-8.8,R.rx+8.8,R.rz-6.3,R.rz+6.3];
  /* ---- interactions ---- */
  R.int(-6.55,-4.75,'Dormir',()=>sleepAct(R,-1));R.int(-3.95,-4.6,'Dormir',()=>sleepAct(R,1));
  R.int(-3.95,-5.55,'Lampe de chevet',()=>{RIG7.on.bed=!RIG7.on.bed;});
  R.int(-7.6,-1.75,'Ouvrir la garde-robe',()=>wardrobeAct(R));
  seatAt(R,-2.72,-3.4,.53,Math.PI/2,[-2.95,-2.7],'Utiliser l’ordinateur',{after:()=>laptopPanel(R),screen:R.laptop});
  R.int(1.25,-4.75,'Prendre une douche',()=>showerAct(R));
  R.int(-.45,-5.4,'Toilettes',()=>sitAct({x:R.rx-.98,z:R.rz-5.4,y:.42,h:Math.PI/2},{dur:4,done:()=>{state.fun=Math.min(100,state.fun+4);toast('Ça va mieux.','good');}}));
  R.int(-.55,-3.55,'Se laver les mains',()=>useAct({x:R.rx-.72,z:R.rz-3.4,h:-Math.PI/2},'use',3,()=>{state.thirst=Math.min(100,state.thirst+10);toast('Mains propres. +10 soif','good');},{water:R.vanity.userData.water}));
  R.int(-.55,-2.85,'Se coiffer au miroir',()=>useAct({x:R.rx-.72,z:R.rz-3.2,h:-Math.PI/2},'comb',2,()=>mirrorPanel()));
  R.int(3.6,-5.3,'Cuisiner',()=>cookAct(R));R.int(5.6,-5.3,'Boire un verre d’eau',()=>useAct({x:R.rx+5.6,z:R.rz-5.45,h:Math.PI},'drink',3,()=>{state.thirst=Math.min(100,state.thirst+30);toast('Rafraîchissant. +30 soif','good');},{water:R.ksink.userData.water}));
  R.int(7.2,-5.3,'Faire un café',()=>useAct({x:R.rx+7.2,z:R.rz-5.45,h:Math.PI},'use',3,()=>{state.energy=Math.min(100,state.energy+12);toast('Café serré. +12 énergie','good');}));
  R.int(7.75,-4.8,'Ouvrir le frigo',()=>fridgeAct(R));
  [[5.45,-4.12,0,-4.75],[6.35,-4.12,0,-4.75],[5.45,-2.68,Math.PI,-2.05],[6.35,-2.68,Math.PI,-2.05]].forEach(c=>seatAt(R,c[0],c[1]-(c[2]?.06:-.06),.5,c[2],[c[0],c[3]],'S’asseoir à table',{table:true}));
  [5.15,5.9,6.65].forEach(x=>seatAt(R,x,-.12,.77,0,[x,.45],'S’asseoir au comptoir'));
  [-.62,0,.62].forEach(o=>seatAt(R,-6.3-o,2.95,.56,Math.PI,[-6.3-o,2.25],'S’asseoir sur le canapé',{sofa:true}));
  seatAt(R,-3.62,1.82,.56,-2.2,[-3.0,1.25],'S’asseoir dans le fauteuil',{sofa:true});
  R.int(-6.3,.75,'Télé',()=>tvToggle(R));
  R.int(-8.0,5.5,'Lire un livre',()=>useAct({x:R.rx-8.1,z:R.rz+5.5,h:-Math.PI/2},'read',5,()=>{state.fun=Math.min(100,state.fun+10);gameMin+=20;toast('Bon chapitre. +10 humeur','good');}));
  R.int(-3.8,5.45,'Radio',()=>{const n=radioN+1>=STATIONS.length?-1:radioN+1;radioPlay(n);R.radio.emissiveIntensity=n<0?0:2;toast(n<0?'Radio coupée.':'📻 '+STATIONS[n].n);});
  R.int(5.1,5.8,'Interrupteur',()=>{RIG7.on.main=!RIG7.on.main;toast(RIG7.on.main?'Lumière allumée.':'Lumière éteinte.');});
  R.int(-8.0,3.55,'Lampadaire',()=>{RIG7.on.lamp=!RIG7.on.lamp;});
  R.int(-1.5,5.75,'Ouvrir / fermer les rideaux',()=>curtainsToggle(R));
  R.int(7.7,.85,'Arroser la plante',()=>useAct({x:R.rx+7.8,z:R.rz+.85,h:Math.PI*.75},'water',2.5,()=>{state.fun=Math.min(100,state.fun+3);toast('La plante te remercie.','good');}));
  R.place(F7.gymMat(),3.4,3.6,Math.PI/2);R.int(3.4,4.6,'Faire du sport',()=>useAct({x:R.rx+3.4,z:R.rz+3.6,h:0},'workout',6,()=>{state.health=Math.min(100,state.health+8);state.fun=Math.min(100,state.fun+8);state.energy=Math.max(0,state.energy-10);state.thirst=Math.max(0,state.thirst-8);toast('Séance finie ! +8 santé, +8 humeur','good');},{title:'Sport'}));
  R.place(F7.guitar(),.9,5.9,Math.PI);R.place(F7.sofa(0x8a5fc9,.9,false),1.9,5.6,Math.PI,.9,.9);
  seatAt(R,1.9,5.62,.56,Math.PI,[1.9,4.9],'Jouer de la guitare',{dur:6,guitar:1,done:()=>{state.fun=Math.min(100,state.fun+15);toast('Joli morceau ! +15 humeur','good');}});
  R.place(F7.rug(2.2,1.6,rugTex(0xe9e2d4,0x2e6f9c,0xd8c3a0,2)),1.6,4.9);
  R.int(6,5.95,'Sortir',()=>leaveInterior(),{exit:1});
}
/* ----- commerces : coque commune ----- */
function shopShell(R,o){
  const H=R.H,ext=EXT7(),wl=o.wall,fl=o.floor;
  R.floor(-8,-6,8,6,fl,o.tile||2);R.ceil(-8,-6,8,6,o.ceil);
  R.wall(-8,-6,8,-6,o.back||wl,ext,[],{th:.2});
  R.wall(-8,6,8,6,ext,wl,[{k:'door',t:8,w:1.6,open:false}].concat(o.sWin===false?[]:[{k:'window',t:3.4,w:2.6,y0:.5,y1:2.6,out:1},{k:'window',t:12.6,w:2.6,y0:.5,y1:2.6,out:1}]),{th:.2});
  R.wall(-8,-6,-8,6,ext,wl,o.wWin?[{k:'window',t:6,w:2.4,y0:.9,y1:2.5,out:1}]:[],{th:.2});R.wall(8,-6,8,6,wl,ext,o.eWin?[{k:'window',t:6,w:2.4,y0:.9,y1:2.5,out:-1}]:[],{th:.2});
  R.zones=[[0,0]];R.spotI=o.spot||60;R.entry={x:0,z:4.9,h:Math.PI};R.b=[R.rx-7.8,R.rx+7.8,R.rz-5.8,R.rz+5.8];
  R.int(0,5.55,'Sortir',()=>leaveInterior(),{exit:1});
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(5,.9),new THREE.MeshBasicMaterial({map:signTex7(o.name,o.sc)}));sg.position.set(0,2.75,-5.88);R.G.add(sg);
}
function signTex7(t,bg){return ctex('sg7'+t,512,96,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.fillStyle='#fff';g.font='700 58px Rajdhani, Arial Narrow, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t.toUpperCase(),W/2,H/2+3);});}
function clerk7(R,x,z,sh,sit){const c=makePerson(sh,0x2b3445,pick(SKINS),pick(HAIRS),{top:'long',bottom:'pantalon',bag:false});c.position.set(x,sit?-.32:.1,z);R.G.add(c);if(sit){const u=c.userData;u.legL.rotation.x=u.legR.rotation.x=-1.5;u.kneeL.rotation.x=u.kneeR.rotation.x=1.5;u.armL.rotation.x=u.armR.rotation.x=-.9;}else R.clerk=c;return c;}
function addRoomCrowd7(R,people){
  R.crowd7=[];
  people.forEach((a,i)=>{
    const m=makePerson(a.shirt||pick(SHIRTS),a.pants||pick(PANTS),a.skin||pick(SKINS),a.hair||pick(HAIRS),{style:a.style||pick(['court','long','afro','ras','chignon']),top:a.top||pick(['tee','long','veste']),bottom:a.bottom||'pantalon',bag:false,glasses:false,beard:false,shoe:pick(SHOE_COLS)});
    m.position.set(a.x,.1,a.z);m.rotation.y=a.h||0;R.G.add(m);
    if(a.kind==='sit'){
      const u=m.userData;u.legL.rotation.x=u.legR.rotation.x=-1.25;u.kneeL.rotation.x=u.kneeR.rotation.x=1.3;u.armL.rotation.x=u.armR.rotation.x=-.55;
    }
    R.crowd7.push({mesh:m,kind:a.kind||'queue',x:a.x,z:a.z,h:a.h||0,phase:rand(0,Math.PI*2),speed:rand(1.5,3.2),sit:a.kind==='sit'});
  });
}
const SHOPS7={
  job(R){shopShell(R,{name:'Pôle Emploi',sc:'#1d4f8a',floor:TLM(0xc9d0d8,0xb3bcc6,0x8f99a3,4,true,1.2),wall:PLM(0xe9edf1),back:PLM(0x1d4f8a),wWin:1,eWin:1,spot:60});
    [[-4.8,-3.2],[0,-3.2],[4.8,-3.2]].forEach((p,i)=>{const d=R.place(F7.desk(1.6),p[0],p[1],0,1.6,.62);const mo=F7.monitor();mo.position.set(0,1.0,-.12);d.add(mo);R.place(F7.officeChair(0x35506b),p[0],p[1]-.75,0);
      clerk7(R,p[0],p[1]-.75,[0x1d4f8a,0x4f7fd9,0x2e9a6a][i],1);R.place(F7.chair(0x35506b,0x4a4f58),p[0]-.4,p[1]+.8,Math.PI);R.place(F7.chair(0x35506b,0x4a4f58),p[0]+.4,p[1]+.8,Math.PI);
      seatAt(R,p[0]-.4,p[1]+.86,.48,Math.PI,[p[0]-.4,p[1]+1.5],'Voir un conseiller',{after:()=>openSpot('job')});});
    for(let i=0;i<6;i++){const x=-6.6+i*.6;R.place(F7.chair(0x1d4f8a,0x4a4f58),x,2.6,0);seatAt(R,x,2.55,.48,0,[x,3.2],'Attendre son tour');}
    R.place(F7.waterCooler(),7.3,-.5,-Math.PI/2,.4,.4);R.int(6.7,-.5,'Boire un verre',()=>useAct({x:R.rx+6.85,z:R.rz-.5,h:Math.PI/2},'drink',2.5,()=>{state.thirst=Math.min(100,state.thirst+20);toast('+20 soif','good');}));
    R.place(F7.plant(2,1.2),-7.2,5.2);R.place(F7.plant(2,1.2),7.2,5.2);
    [[-7.86,-2,'Offres du jour'],[7.86,2,'Livreur · Taxi · Police']].forEach(a=>{const m=M(R.G,new THREE.PlaneGeometry(.9,1.25),tm(F7.posterTex(['EMPLOI',a[2],'Rang 2 : police'],'#f2efe8','#1d4f8a'),0xffffff,.8,0),a[0],1.6,a[1],0,a[0]<0?Math.PI/2:-Math.PI/2,0,false);});
    R.light(-4,3,-1,10,0xf4f6ff);R.light(4,3,-1,10,0xf4f6ff);R.light(0,3,3,8,0xf4f6ff);},
  shop(R){shopShell(R,{name:'Supérette',sc:'#1f7a4d',floor:TLM(0xe8e2d6,0xd6cfc0,0xa8a090,5,false,1.5),wall:PLM(0xf2efe8),back:PLM(0x1f7a4d),spot:70});
    const cs=[0xd94f4f,0x4fb58a,0xe0b34a,0x3d7be0,0xffffff,0x8a5fc9,0xff8a3a];
    [[-4.5,-1.2,0],[-4.5,1.6,0],[2.8,-1.2,0],[2.8,1.6,0]].forEach(p=>{R.place(F7.shelfUnit(3.2,1.8,cs),p[0],p[1]-.25,0,3.2,.55);R.place(F7.shelfUnit(3.2,1.8,cs),p[0],p[1]+.25,Math.PI);R.col(p[0],p[1],3.3,1.1);});
    R.place(F7.drinkFridge(3.6),6.2,-5.45,0,3.6,.7);R.place(F7.drinkFridge(2.8),7.45,-1.5,-Math.PI/2,2.8,.7);
    R.place(F7.till(),-3.2,4.0,Math.PI/2,1.6,.6);clerk7(R,-3.8,4.0,0x1f7a4d).rotation.y=Math.PI/2;
    R.int(-2.4,4.0,'Passer en caisse',()=>openSpot('shop'));R.int(6.2,-4.6,'Prendre une boisson fraîche',()=>openSpot('shop'));
    [[-6.6,4.8,0xd94f4f],[-5.6,4.8,0xe0a526],[-4.6,4.8,0x4fb58a]].forEach(a=>{R.place(F7.table(.9,.6,0xb98a4a),a[0],a[1],0,.9,.6);for(let i=0;i<6;i++)M(R.G,new THREE.SphereGeometry(.07,10,8),sm(a[2],.5,0),a[0]-.3+(i%3)*.3,.84,a[1]-.12+Math.floor(i/3)*.24,0,0,0,false);});
    R.light(-3,3.2,0,12,0xf8fbff);R.light(3.5,3.2,0,12,0xf8fbff);R.light(0,3.2,4,8,0xfff0dc);},
  bank(R){shopShell(R,{name:'Banque',sc:'#27306b',floor:tm(rep(marbleTex(0xe9e4da,0x8a7a60),.5),0xffffff,.12,0),tile:2,wall:PLM(0xe6dfcf),back:PLM(0x27306b),wWin:1,spot:60});
    R.place(F7.counter(7,0x2a2f3a),0,-3.6,Math.PI,7,.64);for(let i=0;i<4;i++){M(R.G,new THREE.PlaneGeometry(1.7,1.1),M7.glass,-2.6+i*1.75,1.55,-3.3,0,0,0,false).renderOrder=3;M(R.G,new THREE.BoxGeometry(.04,1.1,.06),M7.chrome,-3.48+i*1.75,1.55,-3.3);}
    [-2.6,0,2.6].forEach((x,i)=>{clerk7(R,x,-4.3,[0x27306b,0x5a4a3a,0x2e6fd1][i]);});
    R.int(0,-2.6,'Guichet',()=>openSpot('bank'));R.int(-2.6,-2.6,'Guichet',()=>openSpot('bank'));
    const v=R.place(F7.vault(),5.8,-5.88,0);R.place(F7.atm(),-7.5,0,Math.PI/2,.8,.6);R.place(F7.atm(),-7.5,1.4,Math.PI/2,.8,.6);R.int(-6.7,.7,'Distributeur',()=>useAct({x:R.rx-6.85,z:R.rz+.7,h:-Math.PI/2},'use',1.5,()=>openSpot('bank')));
    R.place(F7.sofa(0x27306b,2.2,0xd8c27a),3.5,2.6,Math.PI/2,2.3,.95);[-.62,0,.62].forEach(o=>seatAt(R,3.6,2.6+o,.56,Math.PI/2,[4.3,2.6+o],'S’asseoir'));
    for(let i=0;i<5;i++){M(R.G,new THREE.CylinderGeometry(.03,.05,.95,10),M7.chrome,-3+i*1.2,.47,-1.2);if(i<4)M(R.G,tube([[-3+i*1.2,.85,-1.2],[-2.4+i*1.2,.7,-1.2],[-1.8+i*1.2,.85,-1.2]],.025,10,6),FAB(0x8a1f2a),0,0,0,0,0,0,false);}
    R.place(F7.plant(2,1.3),-7.2,-5.2);R.place(F7.plant(2,1.3),7.2,5.2);R.place(F7.art(1,1.2,1.5),7.88,-1.6,-Math.PI/2,0,0,1.8);
    R.light(-3,3.2,0,10,0xfff0dc);R.light(3,3.2,0,10,0xfff0dc);R.light(0,3.2,-4,8,0xfff0dc);},
  club(R){shopShell(R,{name:'Club Néon',sc:'#1a0933',floor:tm(rep(concreteTex(0x2a2a30),.3),0xffffff,.35,.2),wall:sm(0x1a1424,.8,0),back:sm(0x140f1e,.8,0),ceil:sm(0x0e0b14,.9,0),sWin:false,spot:20});
    const cv=document.createElement('canvas');cv.width=cv.height=256;const dt=new THREE.CanvasTexture(cv);M(R.G,new THREE.PlaneGeometry(7,5),new THREE.MeshBasicMaterial({map:dt}),0,.02,-.2,-Math.PI/2,0,0,false);R.dance={cv,t:dt};
    const dj=R.place(F7.djBooth(),0,-4.6,0,2,.8);R.decks=dj.userData.decks;clerk7(R,0,-5.3,0x111111);
    R.place(F7.bar(5),-5.4,3.2,Math.PI/2,5,.8);R.col(-6.6,3.2,.5,5);[1.2,2.2,3.2,4.2,5.2].forEach(z=>{R.place(F7.stool(),-4.3,z-1.0,0);});
    R.int(-4.0,3.2,'Commander un verre · $5',()=>{if(state.cash<5){toast('Pas assez de cash.','warn');return;}state.cash-=5;useAct({x:R.rx-4.1,z:R.rz+3.2,h:-Math.PI/2},'drink',3,()=>{state.fun=Math.min(100,state.fun+12);state.thirst=Math.min(100,state.thirst+15);toast('Santé ! +12 humeur','good');});});
    R.int(0,-.2,'Danser',()=>danceAct({x:R.rx,z:R.rz-.2}));R.int(1.5,1.2,'Danser',()=>danceAct({x:R.rx+1.5,z:R.rz+1.2}));R.int(-1.5,1.2,'Danser',()=>danceAct({x:R.rx-1.5,z:R.rz+1.2}));
    [[6.6,-2.5],[6.6,1.5]].forEach(p=>{R.place(F7.sofa(0x7a1f8a,2.2,0xff5fd2),p[0],p[1],-Math.PI/2,2.3,.95);[-.62,.62].forEach(o=>seatAt(R,p[0]-.1,p[1]-o,.56,-Math.PI/2,[p[0]-.8,p[1]-o],'S’asseoir'));});
    [[0xff5fd2,[[-7.85,2.6,-5],[-7.85,2.9,-1],[-7.85,2.6,3]]],[0x5aa9ff,[[-6,3.1,-5.85],[0,2.2,-5.85],[6,3.1,-5.85]]],[0x58d68d,[[7.85,2.6,-5],[7.85,2.9,0],[7.85,2.6,4]]]].forEach(a=>M(R.G,tube(a[1],.035,40,8),sm(a[0],.3,0,{emissive:a[0],emissiveIntensity:3,k:'neon'+a[0]}),0,0,0,0,0,0,false));
    const ball=M(R.G,new THREE.IcosahedronGeometry(.45,2),new THREE.MeshStandardMaterial({color:0xdddddd,metalness:1,roughness:.15,flatShading:true}),0,R.H-.8,-.2);R.ball=ball;
    R.beams=[];[0xff5fd2,0x5aa9ff,0x58d68d,0xffd24a].forEach((c,i)=>{const b=new THREE.Mesh(new THREE.ConeGeometry(.9,R.H,20,1,true).translate(0,-R.H/2,0),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));b.position.set(-3+i*2,R.H,-1.5);R.G.add(b);R.beams.push(b);});
    R.light(-3,2.6,0,10,0xff5fd2);R.light(3,2.6,0,10,0x5aa9ff);R.light(0,2.4,-4,6,0x58d68d);R.light(-5,2.2,3,6,0xb07aff);},
  hospital(R){shopShell(R,{name:'Hôpital',sc:'#b32d2d',floor:TLM(0xeef3f5,0xd3dde1,0xb8c4c9,4,true,1.2),wall:PLM(0xeef4f6),back:PLM(0xe6eef1),wWin:1,eWin:1,spot:60});
    R.place(F7.counter(3,0xdfe7ea),0,-3.9,Math.PI,3,.64);clerk7(R,0,-4.55,0xdfe7ea);R.int(0,-2.9,'Accueil',()=>openSpot('hospital'));
    [[-5.6,-2.6],[-5.6,1.6],[5.6,-2.6],[5.6,1.6]].forEach((p,i)=>{const s=p[0]<0?1:-1,b=R.place(F7.hbed(),p[0],p[1],s>0?Math.PI/2:-Math.PI/2,1.05,2.2);R.place(F7.ivStand(),p[0],p[1]-.9,0);const mo=F7.monitor();mo.position.set(p[0]-s*1.25,1.5,p[1]-.7);mo.rotation.y=s*Math.PI/2;R.G.add(mo);(R.ecg=R.ecg||[]).push(mo.userData.ecg);
      const cg=new THREE.PlaneGeometry(2.4,2.1,28,2),q=cg.attributes.position;for(let k=0;k<q.count;k++)q.setZ(k,Math.sin(q.getX(k)*22)*.04);cg.computeVertexNormals();M(R.G,cg,new THREE.MeshStandardMaterial({map:FAB(0xa8d4e6).map,side:THREE.DoubleSide,roughness:.95}),p[0],1.2,p[1]+1.25,0,0,0);
      R.int(p[0]+s*1.0,p[1],'Se faire soigner · $30',()=>healAct(R,b,1));});
    for(let i=0;i<5;i++){const x=-2.4+i*.6;R.place(F7.chair(0xdfe7ea,0x9aa3ad),x,3.4,Math.PI);seatAt(R,x,3.46,.48,Math.PI,[x,2.8],'S’asseoir');}
    M(R.G,new THREE.BoxGeometry(.05,1.2,.36),sm(0xd94f4f,.3,0,{emissive:0xd94f4f,emissiveIntensity:1.2,k:'crx'}),7.88,2.2,0);M(R.G,new THREE.BoxGeometry(.05,.36,1.2),sm(0xd94f4f,.3,0,{emissive:0xd94f4f,emissiveIntensity:1.2,k:'crx'}),7.88,2.2,0);
    R.place(F7.plant(2,1.2),-7.2,5.2);R.light(-4,3.2,0,10,0xf4f8ff);R.light(4,3.2,0,10,0xf4f8ff);R.light(0,3.2,-3,8,0xf4f8ff);},
  cafe(R){shopShell(R,{name:'Café Aurore',sc:'#6b3f2a',floor:tm(rep(woodTex(0x9a6a44),.55),0xffffff,.5,0),wall:PLM(0xe9dcc6),back:tm(rep(tileTex7(0x2f4a3a,0x2f4a3a,0x1a2a20,10,false),.6),0xffffff,.3,0),wWin:1,spot:50});
    R.place(F7.pastryCase(3.2),-1.6,-3.6,Math.PI,3.2,.72);R.place(F7.counter(2.4,0x3a2a20),2.2,-3.6,Math.PI,2.4,.64);R.place(F7.espresso(),2.2,-4.6,0,0,0,.0).position.y=0;
    const es=R.G.children[R.G.children.length-1];es.position.set(2.2,.92,-3.75);es.rotation.y=Math.PI;clerk7(R,.6,-4.5,0x6b3f2a);
    R.int(.6,-2.6,'Commander',()=>shopX('cafe'));
    const chalk=ctex('chalk',512,320,(g,W,H)=>{g.fillStyle='#22302a';g.fillRect(0,0,W,H);g.fillStyle='#f2efe8';g.textAlign='center';g.font='700 46px Rajdhani, sans-serif';g.fillText('CAFÉ AURORE',W/2,60);g.font='500 30px Barlow, sans-serif';['Café ........ $3','Croissant ... $2','Petit-déj ... $9'].forEach((l,i)=>g.fillText(l,W/2,130+i*56));});
    M(R.G,new THREE.PlaneGeometry(2.4,1.5),tm(chalk,0xffffff,.9,0),-1.6,2.1,-5.86,0,0,0,false);
    [[-5,0],[-5,3.2],[-2,1.6],[2.2,1.4],[5.2,0],[5.2,3.2]].forEach(p=>{R.place(F7.roundTable(.45,0xf2efe8),p[0],p[1],0,.9,.9);PEN7(R,0xd8b88a,p[0],p[1]);
      [[0,-.75,0],[0,.75,Math.PI]].forEach(c=>{R.place(F7.chair(null,0x3a2a20),p[0]+c[0],p[1]+c[1],c[2]);seatAt(R,p[0],p[1]+c[1]*.92,.48,c[2],[p[0]+.7,p[1]+c[1]],'S’asseoir');});});
    R.place(F7.plant(2,1.2),-7.2,-5.2);R.place(F7.plant(0,1),7.2,-5.2);R.place(F7.art(0,1.2,1.5),-7.88,1.6,Math.PI/2,0,0,1.7);
    R.light(-3.5,2.6,1.6,9,0xffd9a8);R.light(3.5,2.6,1.6,9,0xffd9a8);R.light(0,2.8,-3.6,8,0xffe7c4);},
  boutique(R){shopShell(R,{name:'Boutique Mode',sc:'#7b4bb3',floor:tm(rep(woodTex(0xd8c8b0),.55),0xffffff,.45,0),wall:PLM(0xf2efea),back:PLM(0xd8d0e0),wWin:1,spot:60});
    [[-4.6,-1],[-4.6,1.8],[4.6,-1],[4.6,1.8]].forEach(p=>R.place(F7.rack(2.6),p[0],p[1],0,2.6,.5));
    [[-1.4,2.8,[0xd94f4f,0x2b3445,'veste','pantalon',0x2b3445]],[0,3.2,[0xe0b34a,0x3d6fb0,'tee','jupe']],[1.4,2.8,[0x4fb58a,0x5a4a3a,'sweat','short']]].forEach(m=>R.place(F7.mannequin(m[2]),m[0],m[1],0,.5,.5));
    [-6.3,-4.8].forEach(x=>{R.place(F7.cabin(0x7b4bb3),x,-5.1,0,1.4,1.4);});R.int(-5.55,-3.9,'Cabine d’essayage',()=>shopX('boutique'));
    R.place(F7.counter(2.2,0x4a3a6a),4.6,-3.8,Math.PI,2.2,.64);clerk7(R,4.6,-4.5,0x7b4bb3);R.int(4.6,-2.8,'Caisse',()=>shopX('boutique'));
    M(R.G,new THREE.PlaneGeometry(1,2),M7.mirror,7.88,1.2,4,0,-Math.PI/2,0,false);
    for(let i=0;i<3;i++){R.place(F7.table(1.2,.7,0xe9e2d4),-1.6+i*1.6,-.6,0,1.2,.7);for(let k=0;k<4;k++)M(R.G,rbox(.36,.05,.28,.02),FAB(pick([0xd94f4f,0x3d7be0,0xe0b34a,0xf2f2ee,0x8a5fc9])),-1.85+i*1.6+(k%2)*.48,.8+Math.floor(k/2)*.05,-.6,0,0,0,false);}
    R.light(-3.5,3.2,.5,10,0xfff4e8);R.light(3.5,3.2,.5,10,0xfff4e8);R.light(0,3.2,3,8,0xfff4e8);},
  pharma(R){shopShell(R,{name:'Pharmacie',sc:'#1f7a4d',floor:TLM(0xf0f4f2,0xd5e1da,0xb8c8bf,5,false,1.4),wall:PLM(0xf3f7f5),back:PLM(0xdcebe2),eWin:1,spot:60});
    const cs=[0xffffff,0x4fb58a,0xd94f4f,0xf2f2ee,0x3d7be0,0xe8f4ee];
    [[-5.2,-5.55,0],[-1.8,-5.55,0],[-7.5,-1.5,Math.PI/2],[-7.5,2,Math.PI/2]].forEach(p=>R.place(F7.shelfUnit(3.2,2.1,cs,'box'),p[0],p[1],p[2],3.2,.55));
    R.place(F7.counter(4,0xdfe7ea),2.5,-3.4,Math.PI,4,.64);clerk7(R,2.5,-4.1,0xf2f2ee);R.int(2.5,-2.4,'Comptoir',()=>shopX('pharma'));
    [[-2,1.4],[1.6,1.4]].forEach(p=>R.place(F7.shelfUnit(2.4,1.4,cs,'box'),p[0],p[1],Math.PI/2*0,2.4,.55));
    M(R.G,new THREE.BoxGeometry(.05,1.1,.34),sm(0x1f9a5a,.3,0,{emissive:0x1fda7a,emissiveIntensity:1.5,k:'pcx'}),7.88,2.2,-1);M(R.G,new THREE.BoxGeometry(.05,.34,1.1),sm(0x1f9a5a,.3,0,{emissive:0x1fda7a,emissiveIntensity:1.5,k:'pcx'}),7.88,2.2,-1);
    for(let i=0;i<3;i++){const z=2.6+i*.6;R.place(F7.chair(0xdfe7ea,0x9aa3ad),6.6,z,-Math.PI/2);seatAt(R,6.66,z,.48,-Math.PI/2,[6.0,z],'S’asseoir');}
    R.place(F7.plant(2,1.2),-7.2,5.2);R.light(-3,3.2,0,10,0xf4fff8);R.light(3,3.2,0,10,0xf4fff8);R.light(2.5,3.2,-3.5,8,0xf4fff8);}
};
function yard7(R){/* abords : pelouse, trottoir, haies, arbres (vus à travers les fenêtres et en vue coupée) */
  const gr=tm(rep(ctex('lawn',256,256,(g,W,H)=>{g.fillStyle='#4f7d45';g.fillRect(0,0,W,H);for(let i=0;i<5000;i++){g.fillStyle=Math.random()<.5?'rgba(20,50,10,.25)':'rgba(160,200,90,.18)';g.fillRect(Math.random()*W,Math.random()*H,1,3);}}),12),0xffffff,.95,0);
  M(R.G,new THREE.PlaneGeometry(38,34),gr,0,-.01,0,-Math.PI/2,0,0,false);
  const pv=tm(rep(tileTex7(0xb8b2a6,0xb8b2a6,0x8a857c,4,false),1/1.2),0xffffff,.8,0);M(R.G,new THREE.PlaneGeometry(30,3),pv,0,0,(R.id==='home'?6.5:6)+1.6,-Math.PI/2,0,0,false);
  const hd=sm(0x2f6b35,.9,0);[-1,1].forEach(s=>M(R.G,rbox(10,1.1,.9,.3),hd,s*14,.55,(R.id==='home'?6.5:6)+3.6));
  for(let i=0;i<6;i++){const t=new THREE.Mesh(treeGeo(i%2?'round':'flam'),decoMat);t.position.set(-16+i*6.4,0,-(R.id==='home'?6.5:6)-4-Math.random()*3);t.castShadow=true;R.G.add(t);}
}
buildRooms=function(){
  buildRig7();
  Object.keys(RD).forEach((id,idx)=>{
    const rx=300+idx*40,rz=300,R=roomCtx(id,rx,rz,id==='home'?2.9:3.4);R.name=RD[id][0];R.sp=[];
    if(id==='home')buildHome7(R);else SHOPS7[id](R);
    if(id==='shop')addRoomCrowd7(R,[{x:-2.1,z:2.9,h:0,kind:'queue',shirt:0xd94f4f},{x:-2.1,z:1.55,h:0,kind:'queue',shirt:0x3d7be0},{x:-2.1,z:.2,h:0,kind:'queue',shirt:0xe0b34a},{x:4.4,z:2.1,h:Math.PI/2,kind:'browse',shirt:0x4fb58a}]);
    if(id==='club')addRoomCrowd7(R,[{x:-2.6,z:.2,kind:'dance',shirt:0xd94f4f},{x:-1.1,z:1.5,kind:'dance',shirt:0x3d7be0},{x:.3,z:-.7,kind:'dance',shirt:0x4fb58a},{x:2.2,z:.8,kind:'dance',shirt:0xe0b34a},{x:3.1,z:-1.6,kind:'dance',shirt:0x8a5fc9},{x:-3.7,z:-1.8,kind:'dance',shirt:0xff8fb1}]);
    if(id==='cafe')addRoomCrowd7(R,[{x:-5,z:-.72,h:Math.PI,kind:'sit',shirt:0x3d7be0},{x:-2,z:.85,h:0,kind:'sit',shirt:0x4fb58a},{x:2.2,z:.65,h:0,kind:'sit',shirt:0xe0b34a},{x:5.2,z:-.72,h:Math.PI,kind:'sit',shirt:0x8a5fc9}]);
    if(id==='job')addRoomCrowd7(R,[{x:-5.8,z:2.55,h:0,kind:'sit',shirt:0xd94f4f},{x:-4.6,z:2.55,h:0,kind:'sit',shirt:0x4fb58a},{x:-3.4,z:2.55,h:0,kind:'sit',shirt:0x3d7be0}]);
    if(id==='bank')addRoomCrowd7(R,[{x:-2.6,z:-1.5,h:0,kind:'queue',shirt:0xe0b34a},{x:0,z:-1.5,h:0,kind:'queue',shirt:0x8a5fc9}]);
    if(id==='hospital')addRoomCrowd7(R,[{x:-2.2,z:3.45,h:Math.PI,kind:'sit',shirt:0x3d7be0},{x:-1.2,z:3.45,h:Math.PI,kind:'sit',shirt:0xff8fb1},{x:-.2,z:3.45,h:Math.PI,kind:'sit',shirt:0xe0b34a}]);
    yard7(R);R.G.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});
    ROOMS[id]=R;
  });
};
