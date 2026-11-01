'use strict';
/* ==========================================================================
   v28 · SOLENNE AGRANDIE
   - L'île passe de 940 m à 1 580 m de large : Pointe des Alizés à l'est
     (beach club, distillerie, cascade, tyrolienne, mini-golf, cinéma plein air)
     et Anse Créole à l'ouest (restaurant Ti Kaz, musée, centre des tortues,
     boutique, école de surf, yoga).
   - 7 bâtiments où l'on peut entrer, 30+ activités.
   - Plages accessibles : on peut nager dans le lagon, la piscine de l'hôtel et
     le bassin de la cascade (snorkeling au récif avec un masque).
   ========================================================================== */
(function(){
const X=SOL27.x;
const S28={mask:false,swim:false,wade:false,seen:{},zip:null,rent:null,film:0};
try{const o=JSON.parse(localStorage.getItem('port-aurore-sol28')||'null');if(o){S28.mask=!!o.mask;S28.seen=o.seen||{};}}catch(e){}
const save=()=>{try{localStorage.setItem('port-aurore-sol28',JSON.stringify({mask:S28.mask,seen:S28.seen}));}catch(e){}};
window.S28=S28;
/* bornes : plage et lagon accessibles */
worldB27=function(x){return inSol27(x)?[X-790,X+790,-345,560]:[-1000,760,-760,207];};
/* zones d'eau */
const POOL={x0:X+107,x1:X+133,z0:161.2,z1:171.2},BASIN={x:X+690,z:-178,r:15};
function waterAt(x,z){if(!inSol27(x))return 0;
  if(z>293.5&&Math.abs(x-X)<792){if(Math.abs(x-(X-250))<2.3&&z<329)return 0;return z>301?2:1;}
  if(x>POOL.x0&&x<POOL.x1&&z>POOL.z0&&z<POOL.z1)return 2;
  if(Math.hypot(x-BASIN.x,z-BASIN.z)<BASIN.r)return 2;return 0;}
S28.waterAt=waterAt;
/* ---------------- construction ---------------- */
const lamb28=c=>new THREE.MeshLambertMaterial({color:c});
function bld(x,z,ry,w,d,h,wall,roof,label,o){o=o||{};const s=ry?-1:1,fz=z+s*d/2;
  b27(x,h/2+.1,z,w,h,d,wall);b27(x,.25,z,w+.3,.3,d+.3,shade(wall,.7));
  W27.parts.push(pp(gableGeo(w,d,o.hr||2.8,.6),x,h+.1,z,roof,1,1,1,0,ry,0));W27.parts.push(pp(gableEnds(w,d,o.hr||2.8),x,h+.1,z,wall,1,1,1,0,ry,0));
  if(o.veranda!==false){for(let i=-2;i<=2;i++)b27(x+i*w/4.4,1.45,fz+s*1.7,.2,2.7,.2,0xf4f1ea);b27(x,2.85,fz+s*1.7,w+.5,.16,3.6,0xf4f1ea);b27(x,.18,fz+s*1.7,w+.5,.16,3.4,0xc9b38a);}
  b27(x,1.25,fz+s*.04,1.7,2.4,.1,o.door||0x5a3a26);
  [-1,1].forEach(q=>{for(let f=0;f<Math.max(1,Math.floor(h/3.2));f++){b27(x+q*w*.3,1.8+f*3.2,fz+s*.04,1.6,1.3,.08,0x2e4455);b27(x+q*w*.3-.9,1.8+f*3.2,fz+s*.1,.12,1.4,.06,o.shut||0x1f6f6a);b27(x+q*w*.3+.9,1.8+f*3.2,fz+s*.1,.12,1.4,.06,o.shut||0x1f6f6a);}});
  if(label){const sg=sign27(label,Math.min(w*.8,14),1.4,o.sbg||'#1f6f6a',o.sfg||'#ffffff');sg.position.set(x,Math.min(h-.6,4.3),fz+s*.12);sg.rotation.y=ry;scene.add(sg);}
  col27(x-w/2,x+w/2,z-d/2,z+d/2,true);return {x,z:fz+s*3.9};}
function door(p,id,color,label){addSpot27(p.x,p.z,id,color,label);const s=spots[spots.length-1];s.door=true;return s;}
function act(p,k,color,label){return addSpot27(p.x,p.z,'sol28:'+k,color,label);}
const T28=[];
function buildLand(){mats27();
  [[X+645,290],[X-645,290]].forEach(([x,w])=>{surf27(x,-60,w,660,-0.041,M27.grassS,12);surf27(x,258,w,70,-0.021,M27.sand,8);});
  if(W27.lagoon){W27.lagoon.scale.x=1640/1100;}
  const zone=(id,n,s,x0,x1)=>W27.zones.unshift({id,n,s,x0,x1,z0:-350,z1:560});
  zone('sol-est','Pointe des Alizés','Solenne · beach club, cascade, distillerie',X+500,X+800);zone('sol-ouest','Anse Créole','Solenne · restaurant, musée, tortues',X-800,X-500);
  const Z=W27.zones.find(z=>z.id==='sol');if(Z){Z.x0=X-800;Z.x1=X+800;Z.z1=560;}
  road27(X+430,212,X+780,212,12,{lamps:30,dashC:0xf2c200});road27(X-780,212,X-430,212,12,{lamps:30,dashC:0xf2c200});
  road27(X+300,60,X+780,60,10,{});road27(X-780,60,X-430,60,10,{});road27(X+640,66,X+640,206,10,{});road27(X-640,66,X-640,206,10,{});
  road27(X+640,-180,X+640,54,8,{dash:false});road27(X-640,-120,X-640,54,8,{dash:false});
  for(let x=-780;x<=780;x+=16){if(Math.abs(x)<425)continue;T28.push({x:X+x+rand(-2,2),z:222+rand(-1,1),s:rand(1,1.35),type:'palm',col:true});}
  for(let k=0;k<160;k++){const side=Math.random()<.5?-1:1,x=X+side*rand(510,780),z=rand(-330,195);if(Math.abs(z-60)<9||Math.abs(z-212)<10||Math.abs(Math.abs(x-X)-640)<8)continue;T28.push({x,z,s:rand(1,1.5),type:Math.random()<.6?'palm':'round',col:false,chk:true});}
}
/* ---------------- intérieurs ---------------- */
const RZ=1500;let RI=0;
function room(id,name,sc,o){const rx=X-300+RI*42;RI++;const R=roomCtx(id,rx,RZ,o.H||3.4);R.name=name;R.sp=[];
  shopShell(R,{name,sc,floor:o.floor||tm(rep(woodTex(0xb98a5a),.55),0xffffff,.5,0),wall:o.wall||PLM(0xf4efe6),back:o.back||PLM(0xe9dcc6),wWin:1,eWin:1,spot:50});
  o.fill(R);R.G.traverse(q=>{if(q.isMesh)q.receiveShadow=true;});ROOMS[id]=R;return R;}
const buy=(n,c,fn,msg)=>({label:n+(c?' · '+fmt(c):''),off:state.cash+state.bank<c,fn:()=>{if(c){if(state.cash+state.bank<c){toast('Fonds insuffisants.','bad');return;}takeMoney(c);}fn&&fn();if(msg)toast(msg,'good');}});
const up=(k,v)=>{state[k]=clamp((state[k]||0)+v,0,100);};
const fadeDo=(min,fn,msg)=>{const F=window.fade27||((on,cb)=>cb&&cb());F(true,()=>{gameMin+=min;fn&&fn();F(false);if(msg)toast(msg,'good');});};
function buildRooms28(){
  room('sol28hotel','Hôtel Lagon Bleu','#1f6f6a',{floor:tm(rep(marbleTex(0xf2efe8,0xc9c2b4),.55),0xffffff,.25,.05),wall:PLM(0xf6f1e7),back:PLM(0x9fe0d8),fill:R=>{
    R.place(F7.counter(4,0x1f6f6a),0,-3.6,Math.PI,4,.7);clerk7(R,0,-4.5,0x1f6f6a);R.int(0,-2.6,'Réception · chambres et spa',()=>openSpot('sol27:hotel'));
    R.place(F7.sofa(0x2fc6c9,2.4),-5,1.6,Math.PI/2,1,2.4);seatAt(R,-5,1.6,.45,Math.PI/2,[-4.2,1.6],'S’asseoir',{sofa:1});R.place(F7.sofa(0x2fc6c9,2.4),5,1.6,-Math.PI/2,1,2.4);seatAt(R,5,1.6,.45,-Math.PI/2,[4.2,1.6],'S’asseoir',{sofa:1});
    R.place(F7.coffeeTable(),-3.6,1.6,Math.PI/2,1.2,.6);R.place(F7.plant(2,1.4),-7.2,-5.2);R.place(F7.plant(1,1.4),7.2,-5.2);R.place(F7.plant(0,1.2),-7.2,5.2);R.place(F7.art(1,2,1.2),0,-5.88,0,0,0,2.2);
    R.int(6.5,-4.6,'Spa et hammam',()=>openPanel('Spa du Lagon','Massages aux huiles de coco, hammam et soins. Santé '+Math.round(state.health)+' · Énergie '+Math.round(state.energy)+'.',[buy('Massage 1 h',45,()=>fadeDo(60,()=>{state.health=100;up('fun',15);}),'Massage relaxant. Santé au max.'),buy('Hammam 30 min',20,()=>fadeDo(30,()=>{up('energy',15);up('fun',8);}),'Ça détend. +15 énergie'),buy('Manucure / soin du visage',25,()=>fadeDo(40,()=>{up('fun',12);}),'Tu te sens neuf. +12 humeur')]));
    R.light(-3.5,3.2,0,10,0xfff1d8);R.light(3.5,3.2,0,10,0xfff1d8);R.light(0,3.2,-3.6,8,0xfff1d8);}});
  const tk=room('sol28tikaz','Ti Kaz · cuisine créole','#b5651d',{wall:PLM(0xf7c8a0),back:PLM(0xf6e27a),fill:R=>{
    R.place(F7.counter(3.6,0x8a5a3a),3.2,-3.6,Math.PI,3.6,.7);clerk7(R,3.2,-4.5,0xb5651d);R.int(3.2,-2.6,'Commander au comptoir',()=>tikaz(R));
    R.place(F7.stove(),-1.2,-5.4,0,.8,.7);R.place(F7.hood?F7.hood():F7.plant(0,.8),-1.2,-5.6,0,0,0,1.6);
    const tabs=[[-5,0],[-5,3.4],[-1.6,1.8],[2.2,1.8],[5.4,0.4],[5.4,3.6]];R.meal28=[];
    tabs.forEach(p=>{R.place(F7.table(1.2,.8,0xc69a5a),p[0],p[1],0,1.2,.8);[[0,-.7,0],[0,.7,Math.PI]].forEach(c=>{R.place(F7.chair(0xf2a7b8,0x6b4a2a),p[0]+c[0],p[1]+c[1],c[2]);seatAt(R,p[0],p[1]+c[1]*.92,.48,c[2],[p[0]+.75,p[1]+c[1]],'S’asseoir à table',{table:1});});});
    const plate=new THREE.Group();const pl=new THREE.Mesh(new THREE.CylinderGeometry(.18,.16,.03,20),lamb28(0xffffff));plate.add(pl);const fd=new THREE.Mesh(new THREE.SphereGeometry(.12,10,6,0,6.3,0,1.4),lamb28(0xc0632a));fd.position.y=.03;plate.add(fd);plate.visible=false;R.G.add(plate);R.meal=plate;R.mealPos=tabs;
    R.int(-6.6,-4.6,'Cours de cuisine créole',()=>openPanel('Atelier cuisine','Le chef t’apprend le rougail saucisse et les accras de morue (1 h 30).',[buy('Participer à l’atelier',35,()=>fadeDo(90,()=>{up('fun',25);up('hunger',40);if(typeof gainSk==='function')try{gainSk('commerce',10);}catch(e){}}),'Tu sais faire des accras ! +25 humeur, +40 faim')]));
    R.place(F7.plant(2,1.2),7.2,5.2);R.light(-3,3,1.8,10,0xffd9a8);R.light(3,3,1.8,10,0xffd9a8);R.light(3,3,-3.6,8,0xffe2b8);}});
  room('sol28corail','Le Corail · beach club','#ff8fb1',{floor:tm(rep(woodTex(0x5a3a24),.55),0xffffff,.4,0),wall:PLM(0x2a2f45),back:PLM(0x1a1030),fill:R=>{
    R.place(F7.bar(4.4),-3,-4,Math.PI,4.4,.8);clerk7(R,-3,-4.9,0xff8fb1);R.int(-3,-2.9,'Bar · cocktails',()=>openPanel('Bar du Corail','Cocktails, mocktails et jus frais. Humeur '+Math.round(state.fun)+'.',[buy('Mojito coco',9,()=>up('fun',15),'Rafraîchissant ! +15 humeur'),buy('Planteur maison',8,()=>up('fun',14),'Le planteur du Corail. +14 humeur'),buy('Jus de goyave',4,()=>{if(state.thirst!=null)state.thirst=Math.min(100,state.thirst+35);},'Désaltérant.'),buy('Tournée générale',60,()=>{up('fun',30);state.rep+=2;},'Toute la salle trinque avec toi ! +2 réputation')]));
    R.place(F7.djBooth(),4.2,-4.6,Math.PI,2,1);const dj=clerk7(R,4.2,-5.3,0x111111);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(6,5),new THREE.MeshBasicMaterial({color:0xff5fd2,transparent:true,opacity:.35}));fl.rotation.x=-Math.PI/2;fl.position.set(2,.03,1.4);R.G.add(fl);R.flr28=fl;
    R.int(2,1.4,'Danser',()=>fadeDo(30,()=>{up('fun',22);up('energy',-8);state.rep+=1;},'Tu as mis le feu à la piste ! +22 humeur'));
    R.int(4.2,-3.4,'Demander un morceau au DJ',()=>{say(dj,'Celle-là, c’est pour toi !',3);up('fun',6);});
    [[-6,2],[-6,4]].forEach(p=>{R.place(F7.sofa(0xff8fb1,2),p[0],p[1],Math.PI/2,1,2);seatAt(R,p[0],p[1],.45,Math.PI/2,[p[0]+.8,p[1]],'S’installer');});
    R.light(-3,2.8,-3,8,0xff6fd8);R.light(3,2.8,1.4,10,0x6fb8ff);R.light(-5,2.8,3,8,0xffb86f);}});
  room('sol28musee','Maison créole · musée de l’île','#6b4a2a',{floor:tm(rep(woodTex(0x8a5a3a),.55),0xffffff,.5,0),wall:PLM(0xf6e8d0),back:PLM(0xe8d4b0),fill:R=>{
    const EX=[['Pirogue des premiers pêcheurs','Les premiers habitants arrivèrent en pirogue il y a quatre siècles.'],['Cartes anciennes de Solenne','Solenne apparaît sur les cartes marines dès 1712 sous le nom d’« île aux Perles ».'],['Instruments de musique','Le maloya et le séga rythment les fêtes de l’île.'],['La vanille de Solenne','La pollinisation à la main, inventée ici, a fait la richesse de l’île.'],['Le grand cyclone de 1948','Le phare est le seul bâtiment resté debout.']];
    EX.forEach((e,i)=>{const x=-6+i*3;R.place(F7.table(1.4,.8,0x6b4a2a),x,-1,0,1.4,.8);const vit=new THREE.Mesh(new THREE.BoxGeometry(1.3,.5,.7),new THREE.MeshPhongMaterial({color:0xbfe3ff,transparent:true,opacity:.35}));vit.position.set(x,1.05,-1);R.G.add(vit);
      const ob=new THREE.Mesh(i===0?new THREE.BoxGeometry(1,.12,.25):new THREE.BoxGeometry(.4,.3,.3),lamb28([0x8a5a3a,0xe8d4a0,0x6b4a2a,0x2e2a1a,0x9aa3ad][i]));ob.position.set(x,.95,-1);R.G.add(ob);
      R.int(x,.1,'Lire : '+e[0],()=>{toast(e[0]+' · '+e[1],'');up('fun',2);if(!S28.seen['ex'+i]){S28.seen['ex'+i]=1;save();}});});
    R.place(F7.art(0,1.4,1),-4,-5.88,0,0,0,1.8);R.place(F7.art(1,1.4,1),0,-5.88,0,0,0,1.8);R.place(F7.art(2,1.4,1),4,-5.88,0,0,0,1.8);
    R.int(5.5,3.5,'Visite guidée (30 min)',()=>openPanel('Visite guidée','Une conteuse raconte l’histoire de Solenne : pirogues, vanille, cyclone et légendes du lagon.',[buy('Suivre la visite',8,()=>fadeDo(30,()=>{up('fun',14);}),'Passionnant ! +14 humeur')]));
    R.light(-3.5,3.2,0,10,0xfff1d8);R.light(3.5,3.2,0,10,0xfff1d8);}});
  room('sol28tortues','Centre des tortues marines','#2fc6c9',{floor:TLM(0xe6f4f2,0xd0e8e4,0xa8c8c4,5,false,1.4),wall:PLM(0xe8f6f4),back:PLM(0x9fe0d8),fill:R=>{
    const tanks=[[-5,-3.8],[0,-3.8],[5,-3.8],[-5,2.2],[5,2.2]];R.turt28=[];
    tanks.forEach((p,i)=>{const g=new THREE.Group();g.position.set(p[0],0,p[1]);R.G.add(g);const base=new THREE.Mesh(new THREE.BoxGeometry(3,.6,1.8),lamb28(0xdfe7ea));base.position.y=.3;g.add(base);
      const w=new THREE.Mesh(new THREE.BoxGeometry(2.9,.9,1.7),new THREE.MeshPhongMaterial({color:0x2fc6c9,transparent:true,opacity:.55,shininess:90}));w.position.y=1.05;g.add(w);R.col(p[0],p[1],3,1.8);
      const t=new THREE.Group();const sh=new THREE.Mesh(new THREE.SphereGeometry(.28,12,8),lamb28(0x6b7a3a));sh.scale.set(1,.45,1.2);t.add(sh);const hd=new THREE.Mesh(new THREE.SphereGeometry(.1,8,6),lamb28(0x8a9a5a));hd.position.set(0,0,.36);t.add(hd);
      [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([a,b])=>{const f=new THREE.Mesh(new THREE.BoxGeometry(.22,.03,.1),lamb28(0x8a9a5a));f.position.set(a*.28,0,b*.18);t.add(f);});t.position.y=1;g.add(t);R.turt28.push({t,ph:i});});
    R.int(0,-2.4,'Nourrir les tortues',()=>openPanel('Repas des tortues','Salade de mer et calamars pour les pensionnaires du centre.',[buy('Nourrir avec la soigneuse',6,()=>fadeDo(15,()=>up('fun',12)),'Elles adorent ! +12 humeur')]));
    R.int(-5,.6,'Parrainer une tortue',()=>openPanel('Parrainage','Ton don finance les soins d’une tortue blessée. Tu recevras son nom et sa photo.',[buy('Parrainer « Nalu »',30,()=>{up('fun',10);state.rep+=2;S28.seen.parrain=1;save();},'Merci ! Nalu est ta filleule. +2 réputation')]));
    R.int(5,.6,'Relâcher une tortue au lagon',()=>openPanel('Remise à l’eau','Une tortue soignée retourne au lagon ce soir. Tu peux accompagner l’équipe.',[buy('Participer (gratuit)',0,()=>fadeDo(40,()=>{up('fun',25);}),'Elle a rejoint le récif. Moment magique. +25 humeur')]));
    clerk7(R,0,-1.6,0x2fc6c9);R.light(-3.5,3.2,0,10,0xe8fff8);R.light(3.5,3.2,0,10,0xe8fff8);}});
  room('sol28boutique','Boutique Souvenirs du Lagon','#ffc23d',{wall:PLM(0xfff3c4),back:PLM(0xffd59e),fill:R=>{
    const cs=[0xff6b6b,0xffc23d,0x2fc6c9,0x58d68d,0xff8fb1,0xffffff];[[-5.2,-5.55,0],[-1.8,-5.55,0],[-7.5,-1.5,Math.PI/2],[7.5,-1.5,-Math.PI/2]].forEach(p=>R.place(F7.shelfUnit(3.2,2.1,cs,'box'),p[0],p[1],p[2],3.2,.55));
    R.place(F7.counter(3,0xffc23d),3,-3.4,Math.PI,3,.64);clerk7(R,3,-4.1,0xffc23d);
    R.int(3,-2.4,'Acheter des souvenirs',()=>openPanel('Souvenirs','Pour ramener un peu de Solenne à Port-Aurore.',[buy('Carte postale',2,()=>up('fun',2),'Carte postale achetée.'),buy('Chapeau de paille tressé',18,()=>up('fun',6),'Joli chapeau !'),buy('Gousses de vanille (x10)',15,()=>{try{if(typeof P3!=='undefined'){P3.inv.vanille=(P3.inv.vanille||0)+10;}}catch(e){}},'Vanille de Solenne dans ton sac.'),buy('Paréo du lagon',14,()=>up('fun',5),'Paréo acheté.'),buy('Bouteille de sable coloré',6,()=>up('fun',3),'Souvenir parfait.')]));
    for(let i=0;i<3;i++)R.place(F7.table(1.2,.7,0xe9e2d4),-1.6+i*1.6,.4,0,1.2,.7);R.light(-3,3.2,0,10,0xfff4e0);R.light(3,3.2,0,10,0xfff4e0);}});
  room('sol28distil','Distillerie Vanille & Canne','#6b4a2a',{floor:tm(rep(woodTex(0x6b4a2a),.55),0xffffff,.55,0),wall:PLM(0xe8d4b0),back:PLM(0xc9a26b),fill:R=>{
    for(let i=0;i<6;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,1,14),lamb28(0x8a5a3a));b.rotation.z=Math.PI/2;b.position.set(-6+i*1.1,.5,-5);R.G.add(b);}R.col(-3.2,-5,7,1);
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.9,1.1,2.4,16),new THREE.MeshStandardMaterial({color:0xb87333,metalness:.8,roughness:.35}));st.position.set(4.5,1.2,-3.8);R.G.add(st);R.col(4.5,-3.8,2.2,2.2);
    R.place(F7.counter(3,0x6b4a2a),0,1.6,0,3,.64);clerk7(R,0,.8,0x6b4a2a);
    R.int(0,2.6,'Visite et dégustation',()=>openPanel('Distillerie','Visite des chais, de la colonne à distiller et des serres de vanille.',[buy('Visite guidée (45 min)',10,()=>fadeDo(45,()=>up('fun',14)),'Tu sais tout sur la canne. +14 humeur'),buy('Dégustation de sirops et punchs',12,()=>up('fun',12),'Arômes de vanille et de coco !'),buy('Atelier pollinisation de la vanille',20,()=>fadeDo(60,()=>{up('fun',18);}),'Tu as pollinisé ta première fleur ! +18 humeur')]));
    R.light(-3,3.2,-2,10,0xffe2b8);R.light(3,3.2,0,10,0xffe2b8);}});
  return tk;}
/* commande au restaurant : on paie, on attend, le plat est servi à table */
const ORD={on:false,t:0};
function tikaz(R){if(ORD.on){toast('Ta commande est en préparation…','');return;}if(H7.meal&&R.meal&&R.meal.visible){toast('Ton plat t’attend à table : assieds-toi pour manger.','');return;}
  const D=[['Rougail saucisse + riz',14],['Cari poulet + grains',13],['Poisson grillé, sauce chien',18],['Accras de morue (x8)',7],['Salade de palmiste',9],['Jus de canne frais',4]];
  openPanel('Ti Kaz · menu du jour','Commande au comptoir, installe-toi : le serveur t’apporte ton plat dès qu’il est prêt.',D.map(([n,c])=>buy(n,c,()=>{ORD.on=true;ORD.t=c>8?14:7;ORD.R=R;ORD.n=n;toast('Commande envoyée en cuisine : '+n+'. Installe-toi à une table.','good');})));}
/* ---------------- lieux extérieurs ---------------- */
function buildPlaces(){
  const E=X+500;
  /* Pointe des Alizés (est) */
  door(bld(X+560,178,Math.PI,22,14,6,0x2a2f45,0xff8fb1,'LE CORAIL · BEACH CLUB',{sbg:'#1a1030',sfg:'#ff8fb1',shut:0xff8fb1}),'sol28corail',0xff8fb1,'Le Corail · beach club');
  door(bld(X+600,22,0,20,14,6,0xe8d4b0,0x8a3b2a,'DISTILLERIE VANILLE & CANNE',{sbg:'#6b4a2a'}),'sol28distil',0xc9a26b,'Distillerie Vanille & Canne');
  /* mini-golf */
  const gx=X+705,gz=150;surf27(gx,gz,40,30,.06,M27.grassS,4);for(let i=0;i<6;i++){const x=gx-15+(i%3)*15,z=gz-7+Math.floor(i/3)*14;b27(x,.2,z,9,.25,.4,0xffffff);b27(x,.2,z+3,9,.25,.4,0xffffff);c27(x+3.5,.12,z+1.5,.18,.05,0x111111);c27(x+3.5,.8,z+1.5,.03,1.4,0xffffff,null,true);b27(x+3.75,1.35,z+1.5,.5,.3,.02,0xff3b30);}
  act({x:gx,z:gz+17},'golf',0x58d68d,'Mini-golf des Alizés');
  /* cinéma plein air */
  const cx=X+700,cz=86;b27(cx,5,cz-12,18,8,.4,0x111111);b27(cx,5,cz-11.75,17,7,.05,0xf4f4f4,0,W27.emis);[-1,1].forEach(s=>b27(cx+s*9,4,cz-12,.4,8,.6,0x2a2f35));col27(cx-9.5,cx+9.5,cz-12.5,cz-11.5);
  for(let r=0;r<4;r++)for(let k=0;k<6;k++)b27(cx-7.5+k*3,.35,cz-4+r*3,1.6,.25,.8,[0xff6b6b,0xffc23d,0x2fc6c9,0xff8fb1][r]);
  act({x:cx,z:cz+9},'cine',0x9b59b6,'Cinéma plein air');
  /* cascade et bassin */
  const B=BASIN;for(let i=0;i<7;i++){const a=Math.PI*(.9+i*.2/1.2),r=B.r+8;b27(B.x+Math.cos(a)*r*1.3,8+rand(0,6),B.z-18+Math.sin(a)*4,16,18+rand(0,8),10,pick([0x5f6a5a,0x6b7a62,0x58665a]));}
  b27(B.x,12,B.z-22,34,24,10,0x5d6b58);col27(B.x-17,B.x+17,B.z-27,B.z-17,true);
  const wc=document.createElement('canvas');wc.width=64;wc.height=256;const wg=wc.getContext('2d');for(let y=0;y<256;y+=2){wg.fillStyle='rgba(220,245,255,'+(0.35+Math.random()*.5)+')';wg.fillRect(Math.random()*64,y,8+Math.random()*20,6+Math.random()*14);}
  const wt=new THREE.CanvasTexture(wc);wt.wrapS=wt.wrapT=THREE.RepeatWrapping;wt.repeat.set(2,2);const fall=new THREE.Mesh(new THREE.PlaneGeometry(7,22),new THREE.MeshBasicMaterial({map:wt,transparent:true,opacity:.9,depthWrite:false,color:0xdff6ff}));fall.position.set(B.x,11,B.z-16.9);scene.add(fall);
  W27.anim.push((t,dt)=>{wt.offset.y-=dt*1.6;});
  const pool=new THREE.Mesh(new THREE.CircleGeometry(B.r,40),new THREE.MeshPhongMaterial({color:0x2fb8c9,transparent:true,opacity:.78,shininess:100,specular:0xffffff}));pool.rotation.x=-Math.PI/2;pool.position.set(B.x,.03,B.z);scene.add(pool);
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;if(Math.sin(a)<-.6)continue;c27(B.x+Math.cos(a)*(B.r+.8),.4,B.z+Math.sin(a)*(B.r+.8),rand(.8,1.6),rand(.5,1.2),0x7d837a,null,true);}
  const foam=new THREE.Mesh(new THREE.CircleGeometry(4,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false}));foam.rotation.x=-Math.PI/2;foam.position.set(B.x,.05,B.z-13);scene.add(foam);W27.anim.push(t=>{const s=1+.08*Math.sin(t*5);foam.scale.set(s,s,1);});
  act({x:B.x+B.r+3,z:B.z+6},'cascade',0x2fc6c9,'Cascade des Fées · baignade');
  const sg=sign27(['CASCADE DES FÉES','Sentier · 400 m · baignade'],5,1.6,'#24543a','#ffffff',{fg2:'#cfe8d6'});sg.position.set(X+640,2.4,40);scene.add(sg);[-1,1].forEach(k=>b27(X+640+k*2.3,1.2,39.95,.15,2.4,.15,0x4a3a26));
  /* tyrolienne */
  const Z1={x:X+560,z:-60},Z2={x:X+735,z:-130},H1=18,H2=4;c27(Z1.x,H1/2,Z1.z,.5,H1,0x6b4a2a);b27(Z1.x,H1,Z1.z,4,.3,4,0x8a5a3a);c27(Z2.x,H2/2,Z2.z,.4,H2+1,0x6b4a2a);
  const L=Math.hypot(Z2.x-Z1.x,Z2.z-Z1.z,H1-H2),cab=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,L,6),lamb28(0x222222));cab.position.set((Z1.x+Z2.x)/2,(H1+H2)/2+1.6,(Z1.z+Z2.z)/2);cab.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Z2.x-Z1.x,H2-H1,Z2.z-Z1.z).normalize());scene.add(cab);
  for(let k=0;k<6;k++)b27(Z1.x+2.6,k*3+1.5,Z1.z,1.6,.15,.8,0x8a5a3a);col27(Z1.x-.6,Z1.x+.6,Z1.z-.6,Z1.z+.6);
  S28.zipLine={a:{x:Z1.x,z:Z1.z,y:H1-.4},b:{x:Z2.x,z:Z2.z,y:H2-.4}};act({x:Z1.x+4,z:Z1.z+3},'zip',0xffc23d,'Tyrolienne du Morne · 220 m');
  /* phare : visite */
  act({x:X+430,z:252},'phare',0xffffff,'Phare de Solenne · visite');
  /* Anse Créole (ouest) */
  door(bld(X-580,170,Math.PI,18,12,5.2,0xf7c8a0,0xb2573a,'TI KAZ · CUISINE CRÉOLE',{sbg:'#b5651d'}),'sol28tikaz',0xff9f43,'Ti Kaz · restaurant créole');
  door(bld(X-690,96,Math.PI,16,12,6,0xf6e8d0,0x6e4a3a,'MAISON CRÉOLE · MUSÉE',{sbg:'#6b4a2a'}),'sol28musee',0xc9a26b,'Musée de l’île');
  door(bld(X-560,22,0,20,14,5,0xe8f6f4,0x2e6fd1,'CENTRE DES TORTUES MARINES',{sbg:'#1f6f6a'}),'sol28tortues',0x2fc6c9,'Centre des tortues marines');
  door(bld(X-690,22,0,14,10,4.6,0xfff3c4,0xe0a526,'SOUVENIRS DU LAGON',{sbg:'#e0a526',sfg:'#3a1f0a'}),'sol28boutique',0xffc23d,'Boutique souvenirs');
  /* hôtel : on entre dans le hall */
  const hs=spots.find(s=>s.id==='sol27:hotel');if(hs){hs.id='sol28hotel';hs.door=true;hs.label='Hôtel Lagon Bleu · entrer';}
  /* front de mer : cabanes d'activités */
  const hut=(x,z,label,col)=>{b27(x,1.4,z,4,2.8,3,0xf4f1ea);W27.parts.push(pp(CONE27,x,3.5,z,0xc9a35a,3.4,1.6,3.4));const s=sign27(label,4.4,.7,col,'#ffffff');s.position.set(x,2.4,z+1.56);scene.add(s);col27(x-2,x+2,z-1.5,z+1.5,true);return {x,z:z+3.4};};
  act(hut(X+300,230,'NAUTIC CENTER','#2e6fd1'),'nautic',0x2e6fd1,'Nautic Center · jet-ski, parachute, bouée');
  act(hut(X+200,230,'CLUB DE PLONGÉE','#1f6f6a'),'plongee',0x2fc6c9,'Club de plongée · masques, baptêmes');
  act(hut(X-330,230,'KAYAK & PADDLE','#e0a526'),'kayak',0xe0a526,'Location kayak & paddle');
  act(hut(X-720,230,'ÉCOLE DE SURF','#ff6b6b'),'surf',0xff6b6b,'École de surf');
  act(hut(X+90,230,'COCO GIVRÉ','#ff8fb1'),'glace',0xff8fb1,'Coco Givré · glaces');
  act(hut(X+40,-62,'SCOOTERS SOLENNE','#58d68d'),'scoot',0x58d68d,'Location de scooters');
  /* beach-volley */
  const vx=X-80,vz=262;b27(vx,.04,vz,18,.02,9,0xf2e2b0);[-1,1].forEach(s=>c27(vx,1.2,vz+s*4.5,.06,2.4,0xffffff,null,true));b27(vx,2.2,vz,.04,.8,9,0xffffff);act({x:vx-10,z:vz},'volley',0xffc23d,'Beach-volley');
  /* yoga, bain de soleil */
  b27(X-640,.15,250,10,.2,7,0xc69a5a);act({x:X-640,z:256},'yoga',0x9fe0d8,'Yoga au lever du soleil');
  act({x:X-150,z:266},'transat',0xffd27a,'Transats · bain de soleil');
  /* ponton : sorties en mer */
  /* parcours sportif, marché nocturne via le marché existant */
}
/* ---------------- poissons du récif, nageurs ---------------- */
const REEF=[{x:X+150,z:420,n:'Poisson-perroquet',c:0x2fd0a0},{x:X-300,z:380,n:'Poisson-clown',c:0xff8a2a},{x:X+520,z:400,n:'Tortue verte',c:0x6b7a3a},{x:X-620,z:360,n:'Raie léopard',c:0x2a3f6a},{x:X+20,z:340,n:'Chirurgien bleu',c:0x2e6fd1},{x:X+700,z:330,n:'Poisson-papillon',c:0xffd23f}];
function buildReef(){REEF.forEach((r,i)=>{const N=r.n==='Tortue verte'||r.n==='Raie léopard'?3:14,g=r.n==='Raie léopard'?new THREE.BoxGeometry(.9,.05,.7):r.n==='Tortue verte'?new THREE.SphereGeometry(.4,10,6):new THREE.ConeGeometry(.12,.45,6);if(g.rotateX&&r.n!=='Raie léopard'&&r.n!=='Tortue verte')g.rotateX(Math.PI/2);
  const im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:r.c}),N);im.frustumCulled=false;scene.add(im);r.im=im;r.N=N;
  for(let k=0;k<8;k++){const c=new THREE.Mesh(new THREE.IcosahedronGeometry(rand(.6,1.4),0),lamb28(pick([0xff7a8a,0xffb36b,0xc9a2ff,0xf2e6c8])));c.position.set(r.x+rand(-7,7),-.55,r.z+rand(-7,7));scene.add(c);}});
  W27.anim.push(t=>{if(!inSol27())return;REEF.forEach((r,i)=>{if(Math.abs(camera.position.x-r.x)>200)return;for(let k=0;k<r.N;k++){const a=t*.5*(k%2?1:-1)+k*.7+i,rr=2+(k%5)*.9;dummy.position.set(r.x+Math.cos(a)*rr,-.35-(k%3)*.08,r.z+Math.sin(a)*rr);dummy.rotation.set(0,a+(k%2?Math.PI:0),0);dummy.scale.set(1,1,1);dummy.updateMatrix();r.im.setMatrixAt(k,dummy.matrix);}r.im.instanceMatrix.needsUpdate=true;});});}
const SW=[];function buildSwimmers(){for(let i=0;i<9;i++){const p=npc27(pick([0xff8fb1,0xffc23d,0x2fc6c9,0xffffff,0x58d68d]));const x=X+rand(-700,700),z=rand(305,360);p.position.set(x,-.95,z);p.rotation.x=1.15;scene.add(p);SW.push({p,x,z,a:rand(0,6),r:rand(4,10)});}
  for(let i=0;i<10;i++){const p=npc27(pick([0xff8fb1,0xffc23d,0x2fc6c9,0xffffff]));const x=X+rand(-400,400),z=rand(252,276);p.rotation.x=-Math.PI/2;p.position.set(x,.35,z);scene.add(p);}
  W27.anim.push((t,dt)=>{if(!inSol27())return;SW.forEach((s,i)=>{const a=s.a+t*.12;const x=s.x+Math.cos(a)*s.r,z=s.z+Math.sin(a)*s.r;s.p.position.set(x,-.95+Math.sin(t*2+i)*.05,z);s.p.rotation.y=a+Math.PI/2;s.p.rotation.order='YXZ';const u=s.p.userData;if(u.armR){u.armR.rotation.x=(t*4+i)%6.28;u.armL.rotation.x=(t*4+i+3.14)%6.28;}});});}
/* ---------------- activités ---------------- */
function A(k){
  if(k==='nautic')openPanel('Nautic Center','Sports nautiques sur le lagon, gilet fourni. Énergie '+Math.round(state.energy)+'.',[buy('Jet-ski · 20 min',35,()=>fadeDo(20,()=>{up('fun',28);up('energy',-6);}),'Pleins gaz sur le lagon ! +28 humeur'),buy('Parachute ascensionnel',55,()=>fadeDo(25,()=>{up('fun',35);}),'La vue sur l’île est incroyable ! +35 humeur'),buy('Bouée tractée entre amis',25,()=>fadeDo(15,()=>{up('fun',22);up('energy',-5);}),'Fous rires garantis. +22 humeur'),buy('Ski nautique (initiation)',40,()=>fadeDo(30,()=>{up('fun',24);up('energy',-12);}),'Tu tiens debout ! +24 humeur')]);
  else if(k==='plongee')openPanel('Club de plongée Les Tortues','Masque et tuba pour nager au-dessus du récif, ou baptême avec un moniteur.',[S28.mask?{label:'Masque et tuba ✓ (déjà loués)',off:true}:buy('Louer masque et tuba',8,()=>{S28.mask=true;save();},'Masque loué ! Nage au-dessus des récifs pour observer les poissons.'),buy('Baptême de plongée · 45 min',70,()=>fadeDo(45,()=>{up('fun',45);up('energy',-10);REEF.forEach(r=>S28.seen['f_'+r.n]=1);save();}),'Tortues, raies et poissons-perroquets à 8 m ! +45 humeur'),{label:'Carnet d’observation · '+REEF.filter(r=>S28.seen['f_'+r.n]).length+'/'+REEF.length+' espèces',off:true}]);
  else if(k==='kayak')openPanel('Kayak & Paddle','Tour de l’îlot aux oiseaux ou balade dans la mangrove.',[buy('Kayak · 1 h',15,()=>fadeDo(60,()=>{up('fun',20);up('energy',-10);}),'Tu as vu des hérons dans la mangrove. +20 humeur'),buy('Paddle au coucher du soleil',18,()=>fadeDo(45,()=>{up('fun',24);}),'Coucher de soleil sur le lagon… +24 humeur')]);
  else if(k==='surf')openPanel('École de surf','Cours sur la vague de la passe, planche et lycra fournis.',[buy('Cours débutant · 1 h 30',40,()=>fadeDo(90,()=>{up('fun',30);up('energy',-18);if(typeof gainSk==='function')try{gainSk('forme',15);}catch(e){}}),'Première vague surfée ! +30 humeur'),buy('Location de planche · 1 h',12,()=>fadeDo(60,()=>{up('fun',15);up('energy',-12);}),'Belle session.')]);
  else if(k==='glace')openPanel('Coco Givré','Glaces artisanales aux fruits de l’île.',[buy('Sorbet coco',4,()=>{up('hunger',8);up('fun',6);},'Miam !'),buy('Glace vanille de Solenne',5,()=>{up('hunger',10);up('fun',7);},'Divin.'),buy('Coupe mangue-passion',8,()=>{up('hunger',18);up('fun',10);},'Fraîcheur tropicale.')]);
  else if(k==='scoot'){const has=S28.rent&&cars.includes(S28.rent);openPanel('Scooters Solenne','Scooter 50 cm³, casque fourni. Parfait pour faire le tour de l’île.',[has?{label:'Rendre le scooter',fn:()=>{const c=S28.rent;if(player.car===c)exitCar();const i=cars.indexOf(c);if(i>=0)cars.splice(i,1);scene.remove(c.mesh);S28.rent=null;toast('Scooter rendu. Merci !','good');}}:buy('Louer un scooter · journée',25,()=>{const c=addCar(X+44,-56,Math.PI/2,pick([0x58d68d,0xff8fb1,0x2fc6c9,0xffc23d]),'parked','scooter');c.owned=true;c.fuel=100;S28.rent=c;},'Scooter garé devant l’agence. Monte dessus (E).')]);}
  else if(k==='volley')openPanel('Beach-volley','Une équipe cherche un quatrième joueur.',[{label:'Jouer un match',fn:()=>volley()}]);
  else if(k==='yoga')openPanel('Yoga sur la plage','Séance face au lagon avec Maëlle.',[buy('Séance d’une heure',10,()=>fadeDo(60,()=>{up('energy',20);up('fun',12);state.health=Math.min(100,state.health+8);}),'Zen. +20 énergie')]);
  else if(k==='transat')openPanel('Bain de soleil','Un transat libre sous un parasol.',[{label:'S’allonger 30 min',fn:()=>fadeDo(30,()=>{up('energy',12);up('fun',10);},'Sieste au soleil. +12 énergie')},{label:'Lire un roman 1 h',fn:()=>fadeDo(60,()=>{up('fun',14);},'Chapitre après chapitre…')}]);
  else if(k==='golf')openPanel('Mini-golf des Alizés','18 trous entre cocotiers et cascades miniatures.',[buy('Partie de 18 trous',8,()=>{const s=Math.floor(rand(36,58));fadeDo(45,()=>{up('fun',16);},'Partie terminée en '+s+' coups'+(s<42?' : record !':'.')+' +16 humeur');})]);
  else if(k==='cine'){const h=(gameMin/60)%24,films=['Le Secret du Lagon','Cyclone 48','Les Pirates de Solenne','Coup de foudre aux Alizés'];const f=films[Math.floor(gameMin/1440)%films.length];
    openPanel('Cinéma plein air','Ce soir : « '+f+' ». Séance à 21 h, transats et pop-corn.',[buy('Séance (2 h)',9,()=>{if(h<19&&h>6){toast('La séance commence à la nuit tombée. Reviens après 19 h.','warn');state.cash+=9;return;}fadeDo(120,()=>{up('fun',30);},'« '+f+' » : quel film ! +30 humeur');}),buy('Pop-corn et soda',5,()=>{up('hunger',12);up('fun',4);},'Pop-corn !')]);}
  else if(k==='cascade')openPanel('Cascade des Fées','Bassin d’eau douce au pied de la cascade. Tu peux nager directement dans le bassin.',[{label:'Pique-niquer au bord de l’eau',fn:()=>fadeDo(40,()=>{up('fun',14);up('hunger',20);},'Pique-nique au frais. +14 humeur')},{label:'Se baigner sous la cascade',fn:()=>{player.x=BASIN.x;player.z=BASIN.z-8;toast('Brrr, l’eau est fraîche ! Nage où tu veux dans le bassin.','good');up('fun',10);}}]);
  else if(k==='zip')openPanel('Tyrolienne du Morne','220 m au-dessus de la forêt. Baudrier et casque fournis.',[buy('Descendre en tyrolienne',20,()=>zipStart())]);
  else if(k==='phare')openPanel('Phare de Solenne','147 marches jusqu’à la lanterne. Vue à 360° sur l’île et le lagon.',[buy('Monter au sommet',5,()=>fadeDo(30,()=>{up('fun',16);up('energy',-6);}),'Vue spectaculaire sur le lagon ! +16 humeur')]);
}
function volley(){let sc=[0,0];const round=()=>{if(sc[0]>=3||sc[1]>=3){const w=sc[0]>sc[1];fadeDo(20,()=>{up('fun',w?25:14);up('energy',-12);},w?'Victoire '+sc[0]+'-'+sc[1]+' ! +25 humeur':'Défaite '+sc[0]+'-'+sc[1]+', mais quel match. +14 humeur');return;}
  const b=pick([['Le ballon arrive haut au filet','Smash'],['Service puissant adverse','Manchette'],['Le bloc adverse est en place','Feinte']]);
  openPanel('Beach-volley · '+sc[0]+' - '+sc[1],b[0]+'. Que fais-tu ?',shuf(['Smash','Manchette','Feinte']).map(o=>({label:o,fn:()=>{const ok=o===b[1]?Math.random()<.8:Math.random()<.3;sc[ok?0:1]++;toast(ok?'Point gagné !':'Point perdu.',ok?'good':'warn');setTimeout(round,350);}})));};round();}
const shuf=a=>a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
/* tyrolienne : trajet animé */
function zipStart(){const Z=S28.zipLine;if(player.car)exitCar();S28.zip={t:0,dur:9};player.x=Z.a.x+1.2;player.z=Z.a.z;toast('3… 2… 1… c’est parti !','good');}
function tickZip(dt){const z=S28.zip,Z=S28.zipLine;if(!z)return false;z.t+=dt;const k=clamp(z.t/z.dur,0,1),e=k<.1?k*k*5:k;const x=lerp(Z.a.x,Z.b.x,e),zz=lerp(Z.a.z,Z.b.z,e),y=lerp(Z.a.y,Z.b.y,e)-.3;
  player.x=x;player.z=zz;player.h=Math.atan2(Z.b.x-Z.a.x,Z.b.z-Z.a.z);const m=player.mesh;m.position.set(x,y-1.9,zz);m.rotation.set(0,player.h,0);const u=m.userData;if(u.armR){u.armR.rotation.x=u.armL.rotation.x=-2.9;}if(u.legL){u.legL.rotation.x=u.legR.rotation.x=-.5;}
  z.y=y-1.9;if(k>=1){S28.zip=null;up('fun',30);toast('Atterrissage parfait ! +30 humeur','good');}return true;}
/* ---------------- nage ---------------- */
let swimEl=null,splash=[];
function swimUI(on,txt){if(!swimEl){swimEl=document.createElement('div');swimEl.id='swim28';swimEl.innerHTML='<span>🏊 Nage</span><i><u></u></i>';$('#app').appendChild(swimEl);}swimEl.hidden=!on;if(on){swimEl.querySelector('span').textContent=txt;swimEl.querySelector('u').style.width=Math.round(state.energy)+'%';}}
function ripple(x,z){const m=new THREE.Mesh(new THREE.RingGeometry(.3,.45,24),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,-.08,z);scene.add(m);splash.push({m,t:0});}
let ripT=0,fishT=0;
const _uP=updatePlayer;updatePlayer=function(dt){
  if(S28.zip&&!player.car){tickZip(dt);return;}
  const ox=player.x,oz=player.z;_uP(dt);if(window.FL27&&FL27.on)return;if(player.car||player.inside||!started){if(S28.swim){S28.swim=false;swimUI(false);}return;}
  const w=waterAt(player.x,player.z);
  if(w){const k=w===2?.5:.72;player.x=ox+(player.x-ox)*k;player.z=oz+(player.z-oz)*k;const m=player.mesh,t=performance.now()*.001;
    if(w===2){m.position.set(player.x,-.95+Math.sin(t*2.2)*.05,player.z);m.rotation.order='YXZ';m.rotation.x=player.moving>.3?1.2:.35;const u=m.userData;
      if(player.moving>.3){if(u.armR){u.armR.rotation.x=-(t*5)%6.28;u.armL.rotation.x=-(t*5+3.14)%6.28;u.armR.rotation.z=-.1;u.armL.rotation.z=.1;}if(u.legL){u.legL.rotation.x=Math.sin(t*12)*.35;u.legR.rotation.x=-Math.sin(t*12)*.35;}}
      else if(u.armR){u.armR.rotation.x=Math.sin(t*2)*.6-.4;u.armL.rotation.x=-Math.sin(t*2)*.6-.4;u.armR.rotation.z=-.9;u.armL.rotation.z=.9;}
      state.energy=Math.max(0,state.energy-dt*(keys.shift?.5:.15));state.fun=Math.min(100,state.fun+dt*.25);if(typeof P3!=='undefined')P3.wet=1;
      ripT-=dt;if(ripT<=0&&player.moving>.3){ripT=.45;ripple(player.x,player.z);}
      if(state.energy<=3){toast('Tu es épuisé, tu regagnes la plage.','bad');player.z=Math.min(player.z,292);if(Math.hypot(player.x-BASIN.x,player.z-BASIN.z)<BASIN.r){player.z=BASIN.z+BASIN.r+1;}if(player.x>POOL.x0&&player.x<POOL.x1&&player.z>POOL.z0&&player.z<POOL.z1)player.z=POOL.z0-1;}
      if(!S28.swim){S28.swim=true;toast(S28.mask?'Tu nages avec masque et tuba : approche-toi des récifs !':'Tu nages ! (Maj = crawl rapide, fatigue plus vite)','good');}
      fishT-=dt;if(S28.mask&&fishT<=0){fishT=.5;REEF.forEach(r=>{if(Math.hypot(player.x-r.x,player.z-r.z)<12){if(!S28.seen['f_'+r.n]){S28.seen['f_'+r.n]=1;save();up('fun',8);const n=REEF.filter(q=>S28.seen['f_'+q.n]).length;toast('Espèce observée : '+r.n+' ('+n+'/'+REEF.length+')','good');if(n===REEF.length){state.rep+=3;toast('Carnet d’observation complet ! +3 réputation','good');}}}});}
      swimUI(true,(S28.mask?'🤿 Snorkeling':'🏊 Nage')+' · énergie');}
    else{m.position.y=-.35;S28.swim=false;swimUI(true,'🌊 Dans l’eau jusqu’à la taille');}}
  else if(S28.swim||swimEl&&!swimEl.hidden){S28.swim=false;swimUI(false);}};
/* caméra : suit la tyrolienne en hauteur */
const _uC=updateCamera;updateCamera=function(dt){_uC(dt);if(S28.zip&&S28.zip.y!=null){camera.position.y+=S28.zip.y;}else if(S28.swim&&!player.inside){camera.position.y=Math.max(.5,camera.position.y-.8);}};
/* boucle : commande Ti Kaz, ondes, voitures hors de l'eau, tortues */
const _up=update;update=function(dt){_up(dt);if(!started)return;
  for(let i=splash.length-1;i>=0;i--){const s=splash[i];s.t+=dt;const k=1+s.t*3;s.m.scale.set(k,k,1);s.m.material.opacity=.6*(1-s.t/1.2);if(s.t>1.2){scene.remove(s.m);s.m.geometry.dispose();s.m.material.dispose();splash.splice(i,1);}}
  if(ORD.on){ORD.t-=dt;if(ORD.t<=0){ORD.on=false;const R=ORD.R;H7.meal=1;if(R&&R.meal){const p=pick(R.mealPos);R.meal.position.set(p[0],.82,p[1]);R.meal.visible=true;}toast('Le serveur dépose ton plat : '+ORD.n+'. Assieds-toi à la table pour manger.','good');}}
  cars.forEach(c=>{if(c.x<-3000&&c.z>291){c.z=291;c.v=Math.min(c.v,0)*.3;if(c===player.car&&fineCd<=0){fineCd=3;toast('Pas de véhicule dans l’eau !','warn');}}});
  const R=player.inside;if(R&&R.turt28){const t=performance.now()*.001;R.turt28.forEach(o=>{o.t.position.x=Math.sin(t*.4+o.ph)*1;o.t.position.z=Math.cos(t*.3+o.ph)*.5;o.t.rotation.y=t*.4+o.ph+Math.PI/2;});}
  if(R&&R.flr28){R.flr28.material.color.setHSL((performance.now()*.0001)%1,.8,.55);}};
/* lieux : routage des activités */
const _os=openSpot;openSpot=function(id){if(typeof id==='string'&&id.startsWith('sol28:')){A(id.slice(6));return;}_os(id);};
/* intérieurs : sortie vers l'île (enterInterior gère la position de retour) */
/* ponton : deux sorties en mer de plus */
const _os2=openSpot;openSpot=function(id){if(id==='sol27:ponton'){openPanel('Ponton de Solenne','Sorties en mer autour de l’île.',[buy('Tour de l’île · 1 h',40,()=>fadeDo(60,()=>up('fun',35)),'Des dauphins ont suivi le bateau 🐬 +35 humeur'),buy('Plongée au récif · 2 h',65,()=>fadeDo(120,()=>{up('fun',50);up('energy',-15);}),'Tortues et poissons-perroquets ! +50 humeur'),buy('Observation des baleines · 3 h',90,()=>fadeDo(180,()=>{up('fun',60);}),'Une baleine à bosse a sauté devant le bateau ! +60 humeur'),buy('Pêche au gros · 4 h',120,()=>{const f=pick([['un thon jaune',140],['une daurade coryphène',90],['un marlin (relâché)',0]]);fadeDo(240,()=>{up('fun',40);if(f[1])state.cash+=f[1];},'Tu as pêché '+f[0]+(f[1]?' : revendu '+fmt(f[1]):'')+' ! +40 humeur');})]);return;}_os2(id);};
/* construction */
const _bd=buildDecor;buildDecor=function(){_bd();try{buildLand();buildPlaces();buildRooms28();buildReef();buildSwimmers();
  const T=T28.filter(t=>!t.chk||!boxes.some(b=>b.big&&t.x>b.x0-3&&t.x<b.x1+3&&t.z>b.z0-3&&t.z<b.z1+3)&&Math.hypot(t.x-BASIN.x,t.z-BASIN.z)>BASIN.r+20&&!(Math.abs(t.x-(X+640))<12&&t.z<60)&&!(Math.abs(t.x-(X-640))<12)&&!(Math.abs(t.x-(X+700))<25&&Math.abs(t.z-120)<45)&&!(Math.abs(t.x-(X+650))<110&&Math.abs(t.z+95)<60));T.forEach(t=>t.col=!t.chk||t.col);
  trees27(T);flush27(W27.parts,M27.vc,true);const em=flush27(W27.emis,M27.emis,false);flush27(W27.glass,M27.glass,false);
}catch(e){console.warn('v28 Solenne',e);}};
/* le plan GPS indique les nouveaux lieux de l'île */
const _obm=openBigMap;openBigMap=function(){if(inSol27()&&started&&!(window.FL27&&FL27.on)){openPanel('Plan de Solenne','Ouest : Anse Créole (Ti Kaz, musée, tortues, souvenirs, surf, yoga). Centre : village, marché, Hôtel Lagon Bleu, plage, beach-volley, kayak, glaces. Est : Pointe des Alizés (Le Corail, distillerie, mini-golf, cinéma plein air, cascade, tyrolienne, phare). Choisis une destination :',[
  ['Ti Kaz',X-580,184],['Centre des tortues',X-560,8],['Hôtel Lagon Bleu',X+120,161],['Club de plongée',X+200,236],['Le Corail',X+560,192],['Cascade des Fées',X+690,-160],['Tyrolienne',X+564,-57],['Location de scooters',X+40,-56]].map(([n,x,z])=>({label:n,fn:()=>{wp={x,z,l:n};toast('Repère GPS : '+n+'.','good');}})));return;}_obm();};
if(typeof CHANGELOG!=='undefined'&&CHANGELOG.unshift)CHANGELOG.unshift(['v28','Métiers réalistes, Solenne agrandie (30+ activités, 7 bâtiments ouverts, baignade), vol réaliste, aménagement de l’appartement']);
})();
