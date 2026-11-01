'use strict';
/* v31 : ville vivante, villas de luxe, concession, centre commercial intérieur, entreprises, sports 3D. */
(function(){
const V31=window.V31={places:{},agents:[],biz:{},st:{},err:{}};
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')||d;}catch(e){return d;}};
const SV=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}};
V31.LS=LS;V31.SV=SV;
const RES=V31.res=LS('pa-res31',{});            // logements loués / achetés
const OWN=V31.own=LS('pa-own31',{});            // objets possédés
const CARS=V31.cars=LS('pa-cars31',[]);         // voitures achetées
V31.saveRes=()=>SV('pa-res31',RES);V31.saveOwn=()=>SV('pa-own31',OWN);V31.saveCars=()=>SV('pa-cars31',CARS);
const afford=c=>state.cash+state.bank>=c;
const pay=c=>{if(!afford(c)){toast('Fonds insuffisants.','bad');return false;}takeMoney(c);return true;};
V31.afford=afford;V31.pay=pay;
const up=(k,v)=>{state[k]=clamp((state[k]||0)+v,0,100);};V31.up=up;
const buy=(label,cost,fn)=>({label:label+(cost?' · '+fmt(cost):''),off:!afford(cost),fn:()=>{if(cost&&!pay(cost))return;fn();}});V31.buy=buy;
/* --------- géométrie --------- */
let P,GL,EM,NC,WT;
const B=(x,y,z,w,h,d,c,ry,arr)=>b27(x,y,z,w,h,d,c,ry||0,arr||P);
const C=(x,y,z,r,h,c,arr)=>c27(x,y,z,r,h,c,arr||P);
const col=(x0,x1,z0,z1)=>col27(x0,x1,z0,z1,true);
const sign=(t,w,h,bg,fg,x,y,z,ry,o)=>{const s=sign27(t,w,h,bg,fg,o);s.position.set(x,y,z);s.rotation.y=ry||0;scene.add(s);return s;};
const spot=(x,z,id,c,l,s)=>addSpot27(x,z,id,c,l,s||.7);
V31.TREES=[];const tree=(x,z,s,t)=>V31.TREES.push({x,z,s:s||1.15,type:t||'palm',col:true});
/* rotation locale (villas) */
function frame(x,z,ry){const ca=Math.cos(ry),sa=Math.sin(ry);
  const R=(lx,lz)=>[x+lx*ca+lz*sa,z-lx*sa+lz*ca];
  return {R,
    b:(lx,y,lz,w,h,d,c,arr)=>{const p=R(lx,lz);B(p[0],y,p[1],w,h,d,c,ry,arr);},
    c:(lx,y,lz,r,h,c,arr)=>{const p=R(lx,lz);C(p[0],y,p[1],r,h,c,arr);},
    col:(lx0,lx1,lz0,lz1)=>{const a=R(lx0,lz0),b=R(lx1,lz1);col(Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1]));},
    sign:(t,w,h,bg,fg,lx,y,lz,o)=>{const p=R(lx,lz);return sign(t,w,h,bg,fg,p[0],y,p[1],ry,o);},
    tree:(lx,lz,s,t)=>{const p=R(lx,lz);tree(p[0],p[1],s,t);}};}
/* --------- routes --------- */
function roads(){
  road27(-300,-307,-300,-646,14,{lamps:28});
  road27(-307,-640,-166,-640,12,{lamps:30});
  road27(102,-640,300,-640,12,{lamps:30});
  road27(220,-307,220,-634,10,{lamps:24,dashC:0xe8e2c8});
  [[220,-450],[56,-646],[-230,-646],[-40,-646],[165,-646],[300,-200],[300,-120]].forEach(([x,z])=>NODES.push({x,z}));
}
/* --------- villas de luxe --------- */
const VNAMES=['Ébène','Flamboyant','Baobab','Corail','Iroko','Acajou','Hibiscus','Lagune','Kapokier','Néré','Palmeraie','Savane','Ivoire','Bougainvillier'];
V31.villas=[];
function villa(i,x,z,ry,rent){
  const F=frame(x,z,ry),wall=pick([0xf2eee6,0xe8e2d6,0xeeeae3]),stone=pick([0xc9b392,0xb9a17f,0xd3c1a2]),roof=pick([0x2f3640,0x3a3f47]),mod=i%2===0;
  // terrain, allée, haies
  F.b(0,.075,0,34,.05,34,0x4f8a45);F.b(9,.09,9,6,.04,16,0xb9b4aa);F.b(-3,.09,13,4,.04,9,0xd8d2c4);
  [[-17,0,.9,34],[17,0,.9,34],[0,-17,34,.9]].forEach(([lx,lz,w,d])=>{F.b(lx,.8,lz,w,1.6,d,0x2f6b35);});
  F.b(-8.5,.8,17,17,1.6,.9,0x2f6b35);F.b(15,.8,17,4,1.6,.9,0x2f6b35);
  F.col(-17.5,-16.5,-17,17);F.col(16.5,17.5,-17,17);F.col(-17,17,-17.5,-16.5);F.col(-17,0,16.5,17.5);F.col(13,17,16.5,17.5);
  [6,12].forEach(lx=>{F.b(lx,1.4,17,1.1,2.8,1.1,stone);F.b(lx,2.9,17,1.3,.2,1.3,0x2a2d31);});
  F.b(-3,1.2,17,3,2.4,.12,0x2a2d31);F.b(9,.9,17.2,5.6,1.8,.08,0x25282c);
  // maison
  if(mod){
    F.b(0,1.9,0,20,3.8,13,wall);F.b(-2,5.6,-.5,15,3.6,12,wall);F.b(0,3.9,0,21,.35,14,0xffffff);F.b(-2,7.55,-.5,16.4,.4,13.4,roof);
    F.b(8.2,3.6,6.6,3.4,7.2,.4,stone);F.b(-9.6,3.7,6.6,.5,7.4,.5,0x2a2d31);
    for(let k=0;k<3;k++)F.b(-5+k*4.6,1.9,6.58,3.6,3,.12,0x2e4a5c,GL);
    for(let k=0;k<3;k++)F.b(-7+k*4.6,5.6,5.6,3.6,2.6,.12,0x2e4a5c,GL);
    F.b(-2,4.65,6.9,13,.12,2.1,0xf2f2f2);F.b(-2,5.25,7.9,13,1,.06,0x9ccbe0,GL);
    F.b(4.2,1.4,6.62,1.8,2.8,.14,0x5a3b24);F.b(4.2,3.25,7.8,4.5,.18,2.6,0x2a2d31);
  }else{
    F.b(0,2,0,19,4,13,wall);F.b(0,5.9,0,19,3.8,13,wall);F.b(0,7.95,0,20,.2,14,0xffffff);
    const g=gableGeo(20,14,3.4,.5),p=F.R(0,0);P.push(pp(g,p[0],8,p[1],roof,1,1,1,0,ry,0));const e=gableEnds(20,14,3.4);P.push(pp(e,p[0],8,p[1],wall,1,1,1,0,ry,0));
    F.b(-6,3.9,6.6,3.6,7.8,.5,stone);F.b(6,3.9,6.6,3.6,7.8,.5,stone);
    [-6,0,6].forEach(lx=>{F.b(lx,2.1,6.58,2.6,2.6,.12,0x2e4a5c,GL);F.b(lx,5.9,6.58,2.6,2.4,.12,0x2e4a5c,GL);F.b(lx,7.2,6.62,2.8,.15,.2,0xffffff);});
    F.b(0,4.15,7.6,7,.18,2.2,0xf4f4f4);F.b(0,4.7,8.6,7,.9,.06,0x9ccbe0,GL);[-3.2,3.2].forEach(lx=>F.b(lx,2,8.4,.35,4,.35,0xffffff));
    F.b(0,1.4,6.62,1.8,2.8,.14,0x5a3b24);
  }
  F.col(-10.3,10.3,-6.8,7);
  // piscine, terrasse, transats
  F.b(0,.1,-11.5,26,.12,9,0xf1efe9);F.b(0,.13,-11.5,14,.06,5.2,0x2fb6d6,WT);
  for(let k=0;k<3;k++){F.b(-11+k*1.8,.35,-10,.8,.2,2,0xffffff);F.b(-11+k*1.8,.6,-9.1,.8,.5,.15,0xffffff);}
  F.c(10,1.5,-11,.06,3,0xf1efe9);const u=F.R(10,-11);P.push(pp(CONE27,u[0],3.1,u[1],0xf4efe4,2.2,.6,2.2));
  // jardins
  F.tree(-13,13,1.2);F.tree(14,-13,1.3);F.tree(-14,-14,1.1,'round');F.tree(14,9,1,'round');
  [[-9,15.8],[1,15.8],[-15,4],[15,-4]].forEach(([a,b])=>{F.c(a,.5,b,.06,1,0x2a2d31);F.b(a,1.05,b,.25,.15,.25,0xffffff,EM);});
  const gate=F.R(9,20.5),door=F.R(-3,18.8);
  const v={i,id:'v'+i,name:'Villa '+VNAMES[i],x:gate[0],z:gate[1],dx:door[0],dz:door[1],rent,area:{c:F.R(-3,11),r:4},h:ry};
  F.sign(rent?['À LOUER','Villa '+VNAMES[i]]:['Villa '+VNAMES[i]],3.6,1.2,rent?'#1f6b4a':'#20262e','#ffffff',12,2.2,17.72,{fg2:'#ffe9b0'});
  spot(door[0],door[1],'zone31:villa:'+i,rent?0x5be3a1:0xd9bf77,(rent?'Villa à louer · ':'')+v.name);
  if(Math.random()<.65&&!rent){const pc=F.R(9,12);addCar(pc[0],pc[1],ry+Math.PI,pick([0x111214,0xf2f2f2,0x1f3f6a,0x8a9096]),'parked',pick(['porsche','benz','jeep','bmw','lambo']));}
  V31.villas.push(v);return v;
}
function belvedere(){
  const rows=[-340,-382,-424,-466,-508,-550,-592];let i=0;
  rows.forEach((z,r)=>{villa(i++,182,z,Math.PI/2,r===1||r===4);villa(i++,258,z,-Math.PI/2,r===2||r===5||r===6);});
  // poste de garde
  B(212,1.4,-312,3.2,2.8,3.2,0xe8e2d6);B(212,2.95,-312,4,.3,4,0x2a2d31);B(212,1.7,-310.35,2.6,1.2,.1,0x2e4a5c,0,GL);col(210.4,213.6,-313.6,-310.4);
  B(220,1,-314,.25,2,.25,0xc0392b);B(222.8,1.85,-314,6,.16,.16,0xf2f2f2);
  sign(['RÉSIDENCES DU BELVÉDÈRE','Villas de standing · accès sécurisé'],13,2.6,'#1d2a26','#f0d9a8',232,3.2,-306,0,{fg2:'#ffffff'});
  [-1,1].forEach(s=>{B(232+s*7,1.8,-306.2,.4,3.6,.4,0xb9a17f);});
  const guard=makePerson(0x1f2a44,0x1c1c1c,pick(SKINS),0x1a1410,{style:'casquette',capColor:0x1f2a44,top:'long',bag:false});guard.position.set(214.5,.1,-308.5);guard.rotation.y=Math.PI/2;scene.add(guard);V31.statics.push({m:guard,ph:0});
  W27.zones.push({id:'belv31',n:'Résidences du Belvédère',s:'14 villas de luxe',x0:160,x1:280,z0:-612,z1:-306});
}
/* --------- concession Aurore Motors --------- */
const CATA=V31.cata=[
  {t:'honda',n:'Honda Civic',p:950,c:0x9aa3ad,g:'Occasion'},{t:'hyundai',n:'Hyundai Tucson',p:1300,c:0xe8e8e8,g:'Occasion'},{t:'toyota',n:'Toyota Land Cruiser Prado',p:3800,c:0xf2f2f2,g:'SUV'},
  {t:'ford',n:'Ford Mustang GT',p:4200,c:0xc0392b,g:'Sport'},{t:'bmw',n:'BMW M5',p:5200,c:0x8a9096,g:'Berline'},{t:'benz',n:'Mercedes Classe S',p:5800,c:0x1f4f8a,g:'Luxe'},
  {t:'jeep',n:'Mercedes Classe G',p:7200,c:0x121315,g:'Luxe'},{t:'porsche',n:'Porsche 911 Carrera',p:6500,c:0xb32d4a,g:'Sport'},{t:'lambo',n:'Lamborghini Huracán',p:9500,c:0xe0a526,g:'Supercar'},{t:'ferrari',n:'Ferrari F8',p:9800,c:0x2e9a6a,g:'Supercar'}];
V31.disp=[];
function showroom(){
  const x=-40,z=-674,w=70,d=40,x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2;
  B(x,.1,z,w,.2,d,0x1d2024);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(w-1,d-1),new THREE.MeshStandardMaterial({color:0x2b3036,roughness:.12,metalness:.35}));fl.rotation.x=-Math.PI/2;fl.position.set(x,.215,z);fl.receiveShadow=true;scene.add(fl);
  for(let k=0;k<=7;k++){const cx=x0+k*10;[z0,z1].forEach(cz=>B(cx,4.7,cz,.6,9.2,.6,0x15171a));}
  [z0+10,z0+20,z0+30].forEach(cz=>[x0,x1].forEach(cx=>B(cx,4.7,cz,.6,9.2,.6,0x15171a)));
  B(x,9.5,z,w+1.5,.6,d+1.5,0x23262b,0,NC);B(x,9.95,z1+.3,w+1.5,.5,.3,0xf2f2f2,0,EM);
  // vitrages, porte au centre
  B(x0+15,4.6,z1,30,9,.12,0x9fc3d8,0,GL);B(x1-15,4.6,z1,30,9,.12,0x9fc3d8,0,GL);B(x,8.2,z1,10,1.8,.12,0x9fc3d8,0,GL);
  [x0,x1].forEach(cx=>B(cx,4.6,z,.12,9,d,0x9fc3d8,0,GL));
  col(x0,x0+30,z1-.3,z1+.3);col(x1-30,x1,z1-.3,z1+.3);col(x0-.3,x0+.3,z0,z1);col(x1-.3,x1+.3,z0,z1);col(x0,x1,z0-.6,z0+.3);
  // mur du fond : blanc lumineux + mur rouge de marque
  B(x,4.7,z0+.4,w-1,9,.3,0xf4f4f2,0,NC);B(x+22,4.7,z0+.7,12,9,.4,0xc8102e,0,NC);
  sign(['AURORE','MOTORS'],10,3.4,'#c8102e','#ffffff',x+22,6.4,z0+.95,0,{fg2:'#ffffff'});
  sign('AURORE MOTORS · CONCESSION PREMIUM',30,2.2,'#111316','#ffffff',x,10.9,z1+.5,0);
  // podium arrière + garde-corps vitré
  B(x-6,.45,z0+9,56,.5,12,0x15171a);B(x-6,.72,z0+15.05,56,.06,.1,0xffffff,0,EM);B(x-6,1.25,z0+15.3,56,1,.06,0xbfe0ee,0,GL);col(x-34,x+22,z0+3,z0+15.4);
  // cadres lumineux suspendus en losanges
  for(let i=0;i<6;i++)for(let j=0;j<3;j++){const cx=x0+7+i*11.2,cz=z0+7+j*12;[[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,b])=>B(cx+a*1.4,8,cz+b*1.4,4,.12,.12,0xffffff,a*b>0?-Math.PI/4:Math.PI/4,EM));B(cx,8.75,cz,.03,1.5,.03,0x111111,0,NC);}
  // voitures exposées
  const pods=[[x0+8,z0+9,.5],[x0+19,z0+9,.4],[x0+30,z0+9,.3],[x0+41,z0+9,.2],[x0+52,z0+9,-.1]];
  const turn=[[x0+10,z1-12],[x0+30,z1-12]];
  const showList=[8,9,6,5,7,3,4];
  pods.forEach(([px,pz,ry],k)=>{const c=CATA[showList[k]],m=makeCar(c.c,c.t);m.position.set(px,.7,pz);m.rotation.y=ry;scene.add(m);V31.disp.push({m,c,spin:0});
    B(px,1.15,pz+7.4,.5,1.3,.35,0xf2f2f2);B(px,1.75,pz+7.25,.42,.32,.04,0xd94f4f,0,EM);col(px-.3,px+.3,pz+7.2,pz+7.6);
    spot(px,pz+9,'zone31:car:'+showList[k],0xffffff,c.n+' · '+fmt(c.p),.45);});
  turn.forEach(([px,pz],k)=>{const c=CATA[showList[5+k]];C(px,.3,pz,3.4,.18,0x111316);const ring=new THREE.Mesh(new THREE.TorusGeometry(3.4,.05,6,48),M27.emis.clone());ring.material.vertexColors=false;ring.material.color.setHex(0xffffff);ring.rotation.x=Math.PI/2;ring.position.set(px,.42,pz);scene.add(ring);
    const m=makeCar(c.c,c.t);m.position.set(px,.4,pz);scene.add(m);V31.disp.push({m,c,spin:.25});col(px-2.4,px+2.4,pz-2.4,pz+2.4);
    spot(px+4.5,pz+2,'zone31:car:'+showList[5+k],0xffffff,c.n+' · '+fmt(c.p),.45);});
  // accueil rouge et noir
  B(x+16,.75,z1-10,7,1.1,1.6,0xc8102e);B(x+16,1.33,z1-10,7.2,.08,1.8,0x111316);B(x+16,1.75,z1-10.3,.9,.6,.06,0x0d1a24,0,EM);col(x+12.4,x+19.6,z1-10.9,z1-9.1);
  spot(x+16,z1-7.4,'zone31:motors',0xff5a5a,'Aurore Motors · catalogue complet',.6);
  [[x+16,z1-11.4,0],[x-6,z1-14,Math.PI],[x-24,z1-7,Math.PI/2]].forEach(([sx,sz,h])=>{const p=makePerson(0xc8102e,0x1c1c1c,pick(SKINS),pick(HAIRS),{top:'long',bottom:pick(['pantalon','jupe']),bag:false,style:pick(['chignon','court','long'])});p.position.set(sx,.22,sz);p.rotation.y=h;scene.add(p);V31.statics.push({m:p,ph:rand(0,6)});});
  // parking de livraison
  B(12,.075,-674,24,.04,32,0x3a3d42);for(let k=0;k<5;k++)[1,13].forEach(px=>B(px+5.5,.1,-660-k*6,10,.02,.12,0xe8e8e0));
  sign(['LIVRAISON','Véhicules vendus'],5,1.4,'#c8102e','#ffffff',12,2.4,-657.6,0,{fg2:'#ffe0e0'});
  W27.zones.push({id:'motors31',n:'Aurore Motors',s:'Concession premium',x0:x0,x1:24,z0:z0,z1:z1});
}
V31.slots=[];for(let k=0;k<5;k++)[6,18].forEach(px=>V31.slots.push({x:px,z:-663-k*6}));
/* --------- centre commercial (façade) --------- */
function mallOutside(){
  const x=-230,z=-676,w=84,d=40,z1=z+d/2;
  B(x,7,z,w,14,d,0xe9e3d8);B(x,14.3,z,w+1,.6,d+1,0xc9c2b4);col(x-w/2,x+w/2,z-d/2,z1);
  B(x,6,z1+.05,26,12,.12,0x8fb8d0,0,GL);for(let k=-2;k<=2;k++)B(x+k*6.5,6,z1+.15,.25,12,.25,0x2a2d31);
  B(x,4.6,z1+3,30,.35,6.5,0xf2f2f2);[-1,1].forEach(s=>B(x+s*14,2.3,z1+5.9,.35,4.6,.35,0x2a2d31));
  sign('LES PALMIERS',30,4,null,'#1f6b4a',x,11.8,z1+.25,0);
  [['SUPERMARCHÉ','#2e9a6a',-36],['MODE','#d94f4f',-27.5],['CINÉMA','#7b1f3a',-19],['TECH','#2e6fd1',19],['ARCADE','#7b4bb3',27.5],['MEUBLES','#8a5a3a',36]].forEach(([t,c,o])=>{sign(t,7.4,1.6,c,'#ffffff',x+o,9,z1+.12,0);B(x+o,4,z1+.06,7,5.5,.1,0x2e4a5c,0,GL);});
  for(let k=-3;k<=3;k++){if(k===0)continue;const px=x+k*11.5;B(px,.45,z1+4.2,2,.9,2,0xd8d2c4);tree(px,z1+4.2,1.2);col(px-1,px+1,z1+3.2,z1+5.2);}
  spot(x,z1+4,'zone31:mall',0x58d68d,'Les Palmiers · entrer au centre commercial',.8);
  W27.zones.push({id:'mall31',n:'Les Palmiers',s:'Centre commercial',x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z1+6});
}
V31.statics=[];
V31.clearZones=function(R){const inR=(x,z)=>R.some(r=>x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]);const mt=new THREE.Matrix4(),v=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),Z=new THREE.Matrix4().makeScale(0,0,0);let n=0;
  scene.children.forEach(o=>{if(!o.isInstancedMesh)return;let ch=false;for(let i=0;i<o.count;i++){o.getMatrixAt(i,mt);mt.decompose(v,q,sc);if(v.y>-.01&&v.y<.2&&sc.y>.5&&inR(v.x,v.z)){o.setMatrixAt(i,Z);ch=true;n++;}}if(ch)o.instanceMatrix.needsUpdate=true;});
  for(let i=boxes.length-1;i>=0;i--){const b=boxes[i];if(!b.big&&!b.room&&b.x1-b.x0<.8&&b.z1-b.z0<.8&&inR((b.x0+b.x1)/2,(b.z0+b.z1)/2))boxes.splice(i,1);}return n;};
V31.build=function(){
  try{V31.cleared=V31.clearZones([[160,282,-616,-300],[-306,306,-762,-647],[304,364,-296,-94],[-306,-200,-648,-300]]);}catch(e){console.warn('v31 clear',e);}
  P=[];GL=[];EM=[];NC=[];WT=[];
  roads();belvedere();showroom();mallOutside();
  V31.build2&&V31.build2({B,C,col,sign,spot,tree,frame,P,GL,EM,NC,WT});
  trees27(V31.TREES);
  flush27(P,M27.vc,true);flush27(NC,M27.vc,false);flush27(GL,M27.glass,false);flush27(EM,M27.emis,false);
  if(WT.length)flush27(WT,new THREE.MeshPhongMaterial({vertexColors:true,shininess:140,specular:0xffffff,transparent:true,opacity:.9}),false);
  CARS.forEach((c,i)=>{const s=V31.slots[i%V31.slots.length];const v=addCar(s.x,s.z,0,c.color,'parked',c.type);v.owned=true;v.own31=true;});
};
})();
'use strict';
(function(){
const V31=window.V31;
V31.build2=function(K){const {B,C,col,sign,spot,tree}=K;const P=K.P,GL=K.GL,EM=K.EM,NC=K.NC;
  /* ---- Marché de la Lagune ---- */
  const mx=38,mz=-664;B(mx,.08,mz,26,.04,18,0xc9b48a);
  for(let i=0;i<6;i++){const x=mx-9+(i%3)*9,z=mz-4+Math.floor(i/3)*8,c=pick([0xff6b6b,0xffc23d,0x2fc6c9,0x58d68d,0xff8fb1,0xe0732b]);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>C(x+a*3,1.3,z+b*2,.07,2.6,0x6b4a2a));B(x,2.7,z,6.8,.12,4.8,c);B(x,.75,z+1,6,.85,1.4,0x8a5a3a);
    for(let q=0;q<9;q++)C(x-2.6+q*.65,1.28,z+1,.22,.24,pick([0xff8c1a,0xffd23f,0x58b33a,0xd93a2e,0x8a3ab9,0xf2e6c8]));col(x-3,x+3,z+.3,z+1.7);}
  sign(['MARCHÉ DE LA LAGUNE','Fruits · poisson · épices'],12,2.2,'#ffc23d','#3a1f0a',mx,3.9,mz+9.2,0,{fg2:'#5a2f0a'});
  spot(32,-650,'zone30:market',0xffc23d,'Marché de la Lagune · acheter');spot(45,-650,'zone31:biz:marche',0xffe08a,'Étal à reprendre · bureau');
  /* ---- Chez Mama Adjo ---- */
  const ax=76,az=-669;B(ax,3,az,20,6,16,0xc8693f);B(ax,6.2,az,21,.4,17,0x5a3b24);col(ax-10,ax+10,az-8,az+8);
  B(ax,2.2,az+8.05,9,2.4,.1,0x2e4a5c,0,GL);B(ax-6.5,1.4,az+8.06,1.6,2.8,.12,0x3a2414);
  sign(['CHEZ MAMA ADJO','Cuisine du pays · depuis 1998'],12,2,'#5a1f0f','#ffd27a',ax,4.7,az+8.15,0,{fg2:'#ffffff'});
  for(let k=0;k<4;k++){const tx=ax-7+k*4.7,tz=az+11;C(tx,.38,tz,.75,.06,0xf2efe8);C(tx,.2,tz,.06,.4,0x2a2d31);C(tx,1.3,tz,.05,2.6,0xf2efe8);P.push(pp(CONE27,tx,2.7,tz,k%2?0xd94f4f:0xf2c94c,1.9,.5,1.9));
    [-1,1].forEach(s=>B(tx+s*1.05,.25,tz,.4,.5,.4,0x8a5a3a));}
  spot(70,-649,'zone30:mama',0xff8f6b,'Chez Mama Adjo · manger');spot(83,-649,'zone31:biz:mama',0xffd27a,'Chez Mama Adjo · bureau du gérant');
  /* ---- Parc sportif ---- */
  const fx=165,fz=-700;
  B(fx,.08,fz,52,.04,36,0x3e7d43);B(fx,.1,fz,44,.03,28,0x2f9a4c);
  for(let k=0;k<11;k++)B(fx-22+2+k*4,.115,fz,2,.01,28,k%2?0x2f9a4c:0x37a556);
  const L=(x,z,w,d)=>B(x,.13,z,w,.01,d,0xf4f4ee);
  L(fx,fz-14,44,.12);L(fx,fz+14,44,.12);L(fx-22,fz,.12,28);L(fx+22,fz,.12,28);L(fx,fz,.12,28);
  P.push(pp(new THREE.TorusGeometry(3,.06,4,40),fx,.13,fz,0xf4f4ee,1,1,1,Math.PI/2,0,0));
  [-1,1].forEach(s=>{L(fx+s*19,fz,.12,10);L(fx+s*20.5,fz-5,3,.12);L(fx+s*20.5,fz+5,3,.12);
    const gx=fx+s*22.1;[-1.6,1.6].forEach(o=>C(gx,1,fz+o,.06,2,0xffffff));B(gx,2,fz,.12,.12,3.32,0xffffff);B(gx+s*1,1,fz,.04,2,3.2,0xdddddd,0,GL);B(gx+s*.5,1.98,fz,1,.04,3.2,0xdddddd,0,GL);});
  const fen=new THREE.MeshLambertMaterial({color:0x22382c,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false});
  const fence=(x,z,w,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,4),fen);m.position.set(x,2,z);m.rotation.y=ry;scene.add(m);};
  fence(fx,fz-18,52,0);fence(fx-26,fz,36,Math.PI/2);fence(fx+26,fz,36,Math.PI/2);
  for(let k=0;k<=13;k++){C(fx-26+k*4,2,fz-18,.06,4,0x2a2d31);}for(let k=0;k<=9;k++){C(fx-26,2,fz-18+k*4,.06,4,0x2a2d31);C(fx+26,2,fz-18+k*4,.06,4,0x2a2d31);}
  col(fx-26.3,fx+26.3,fz-18.3,fz-17.7);col(fx-26.3,fx-25.7,fz-18,fz+18);col(fx+25.7,fx+26.3,fz-18,fz+18);
  for(let t=0;t<3;t++)B(fx,.3+t*.45,fz+16.2+t*.9,34,.6+t*.9-.3*t,.9,t%2?0x2e6fd1:0xd8dde2);col(fx-17,fx+17,fz+15.7,fz+18.6);
  V31.fans=[];for(let k=0;k<16;k++){const t=k%3,top=.6+.75*t,m=makePerson(pick([0x2e6fd1,0xf5c400,0xd94f4f,0xffffff,0x2e9a6a]),pick(PANTS),pick(SKINS),pick(HAIRS),{style:pick(['court','afro','long','casquette','chignon']),top:'tee',bottom:'pantalon',bag:false});
    const u=m.userData;u.legL.rotation.x=u.legR.rotation.x=-1.4;u.kneeL.rotation.x=u.kneeR.rotation.x=1.4;m.position.set(fx-15+k*2+rand(-.3,.3),top-.5,fz+16.2+t*.9);m.rotation.y=Math.PI;scene.add(m);V31.fans.push({m,ph:rand(0,6)});}
  V31.areaFix={foot:{x:165,z:-677,r:4}};
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const x=fx+a*25,z=fz+b*17.2;C(x,7,z,.2,14,0x8a9096);B(x,14,z,2.6,1,.4,0xffffff,0,EM);});
  sign(['PARC SPORTIF AURORE','Football · basket · food truck'],14,2.6,'#0b3a2a','#ffffff',fx,3.6,fz+19.2,0,{fg2:'#9be3b8'});
  spot(fx+22,fz+20,'zone31:foot',0x56d8a5,'Terrain de football à 5 · jouer');
  /* basket : 2 terrains bleus façon street */
  V31.courts=[];
  [-678,-712].forEach((cz,ci)=>{const cx=240;B(cx,.08,cz,32,.04,19,0x9aa3ad);B(cx,.1,cz,28,.03,15,0x4f9fe0);B(cx,.115,cz,26,.01,13,0x2f6fc0);
    const W=(x,z,w,d)=>B(x,.13,z,w,.01,d,0xf8f8f8);W(cx,cz-7.5,28,.1);W(cx,cz+7.5,28,.1);W(cx-14,cz,.1,15);W(cx+14,cz,.1,15);W(cx,cz,.1,15);
    P.push(pp(new THREE.TorusGeometry(1.8,.05,4,32),cx,.13,cz,0xf8f8f8,1,1,1,Math.PI/2,0,0));
    [1,-1].forEach(s=>{const hx=cx+s*14;B(hx-s*2.9,.12,cz,5.8,.01,4.9,0x1f4f9a);W(hx-s*5.8,cz,.1,4.9);W(hx-s*2.9,cz-2.45,5.8,.1);W(hx-s*2.9,cz+2.45,5.8,.1);
      P.push(pp(new THREE.TorusGeometry(6.75,.05,4,40,Math.PI),hx-s*1.2,.13,cz,0xf8f8f8,1,1,1,Math.PI/2,0,s>0?Math.PI/2:-Math.PI/2));
      const bx=hx-s*1,px=hx+s*.4;C(px,1.8,cz,.09,3.6,0x2a2d31);B(px-s*.5,3.5,cz,1,.1,.1,0x2a2d31);B(bx,3.4,cz,.06,1.05,1.8,0xffffff);B(bx-s*.02,3.25,cz,.04,.45,.6,0xd94f4f,0,EM);
      P.push(pp(new THREE.TorusGeometry(.23,.025,6,20),bx-s*.3,3.05,cz,0xe0601f,1,1,1,Math.PI/2,0,0));
      const net=new THREE.Mesh(new THREE.CylinderGeometry(.23,.15,.42,12,1,true),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,wireframe:true}));net.position.set(bx-s*.3,2.83,cz);scene.add(net);col(px-.15,px+.15,cz-.15,cz+.15);});
    V31.courts.push({x:cx,z:cz,hoopX:cx+14-1.3,hoopY:3.05});
    spot(cx,cz+(ci?-9.5:9.5),'zone31:basket:'+ci,0x5aa9ff,'Terrain de basket '+(ci+1)+' · jouer');});
  /* food truck + distributeur */
  const tx=205,tz=-700;B(tx,1.9,tz,2.6,2.8,6.5,0xf5c400);B(tx,.75,tz+3.9,2.5,1.5,1.4,0xf5c400);B(tx,1.4,tz+4.4,2.3,.8,.4,0x2e4a5c,0,GL);
  B(tx-1.32,2.1,tz,.08,1.3,3.8,0x1d1f22);B(tx-1.9,3,tz,1.2,.08,4,0xd94f4f);[[-1,2.4],[1,2.4],[-1,-2.4],[1,-2.4]].forEach(([a,b])=>C(tx+a*1.2,.45,tz+b,.42,.3,0x141414));
  sign('HOT DOG',4,1.1,'#d94f4f','#ffffff',tx-1.36,3.7,tz,-Math.PI/2);col(tx-1.3,tx+1.3,tz-3.3,tz+4.6);
  B(196,1,-684,1,2,.8,0xc0392b);B(196,1.3,-683.58,.8,1,.04,0x1d1f22,0,EM);col(195.5,196.5,-684.4,-683.6);
  spot(201,-700,'zone31:truck',0xffd24a,'Food truck · Hot dog & grillades');spot(201,-707,'zone31:biz:truck',0xffe08a,'Food truck · reprendre l’affaire');
  [[194,-670],[194,-728],[262,-695],[205,-724],[205,-676]].forEach(([x,z])=>tree(x,z,1.25));
  for(let k=0;k<4;k++){B(196+k*0,.45,-690+k*5.5,.6,.1,2,0x8a5a3a);}
  W27.zones.push({id:'sport31',n:'Parc sportif Aurore',s:'Football · basket · food truck',x0:139,x1:262,z0:-730,z1:-664});
  /* ---- Résidence Palmeraie (immeubles à balcons) ---- */
  V31.apts=[];
  [-118,-168,-218,-268].forEach((zc,i)=>{const x=346,fl=5,h=3.3,col1=i%2?0x8f9190:0xd8d2c6;
    B(x,fl*h/2,zc,24,fl*h,40,col1);B(x,fl*h+.3,zc,24.6,.6,40.6,0x2a2d31);col(x-12,x+12,zc-20,zc+20);
    B(334,1.6,zc,.12,3,12,0x8fb8d0,0,GL);B(333,3.2,zc,2,.2,14,0xf2f2f2);
    for(let f=1;f<fl;f++)for(let k=-1;k<=1;k+=2)for(let q=0;q<2;q++){const bz=zc+k*(6+q*8),y=f*h;
      B(333.1,y,bz,1.8,.18,5,0xeae7e0);B(332.25,y+.55,bz,.05,.95,5,0xbfe0ee,0,GL);B(333.6,y+.3,bz+1.9,.6,.45,.9,0x4f7d45);B(333.6,y+.75,bz+1.9,.7,.6,1,0x3f8a3a);B(333.96,y+1.4,bz,.1,2.2,2.8,0x24343e,0,GL);}
    for(let f=1;f<fl;f++)B(333.96,f*h+1.4,zc,.1,2,3,0x24343e,0,GL);
    sign(['RÉSIDENCE PALMERAIE','Bâtiment '+'ABCD'[i]],6,1.6,'#1d2a26','#ffffff',333.9,3.9,zc,-Math.PI/2,{fg2:'#cde8d6'});
    spot(330,zc,'zone31:apt:'+i,0xc79bff,'Résidence Palmeraie · bâtiment '+'ABCD'[i]);
    tree(315,zc-12,1.3);tree(315,zc+12,1.3);
    if(Math.random()<.8)addCar(311.5,zc+rand(-6,6),Math.random()<.5?0:Math.PI,pick([0x8a9096,0x1f3f6a,0xf2f2f2,0x111214]),'parked',pick(['porsche','benz','bmw','jeep','toyota','hyundai']));
    V31.apts.push({i,x:330,z:zc,name:'Résidence Palmeraie '+'ABCD'[i]});});
  W27.zones.push({id:'palm31',n:'Résidence Palmeraie',s:'Appartements avec balcons',x0:307,x1:360,z0:-290,z1:-96});
  /* ---- Caserne : portes rouges + camions ---- */
  for(let k=0;k<4;k++){const dx=375+k*10;B(dx,2.6,-650.6,7,5.2,.2,0xc0302a);for(let q=1;q<6;q++)B(dx,q*.9,-650.48,7,.05,.05,0x8a1f1a);}
  sign('FIRE STATION · CASERNE 7',16,1.6,'#20262e','#ffffff',390,6.6,-650.4,0);
  [375,385].forEach(x=>{const t=addCar(x,-640,0,0xc82d25,'parked','firetruck');});
  /* ---- Campus : allée de palmiers pavée ---- */
  B(650,.09,-487,10,.02,30,0xb07a6a);for(let k=0;k<10;k++)B(650,.105,-501+k*3,10,.01,.12,0x8a5a4a);[-1,1].forEach(s=>B(650+s*2.5,.1,-487,.3,.01,30,0x8a5a4a));
  for(let k=0;k<5;k++){tree(642,-499+k*6,1.3);tree(658,-499+k*6,1.3);}
};
})();
'use strict';
(function(){
const V31=window.V31;
const tile=()=>tm(rep(tileTex7(0xefebe3,0xe4dfd5,0xbdb7ab,4,false),1),0xffffff,.22,.05);
function signIn(R,t,w,h,bg,fg,x,y,z,ry){const s=sign27(t,w,h,bg,fg);s.position.set(x,y,z);s.rotation.y=ry||0;R.G.add(s);return s;}
function box(R,w,h,d,c,x,y,z,o){o=o||{};const m=M(R.G,new THREE.BoxGeometry(w,h,d),o.mat||sm(c,o.r==null?.6:o.r,o.m||0,o.e?{emissive:o.e,emissiveIntensity:o.ei||.8,k:'e31'+c+o.e}:undefined),x,y,z,0,o.ry||0,0,o.cast!==false);if(o.col)R.col(x,z,o.ry?d:w,o.ry?w:d);return m;}
V31.shoppers=[];V31.clerks=[];
/* ================= LES PALMIERS : intérieur ================= */
const STORES=[
 {id:'super',n:'Supermarché Lagune',c:'#2e9a6a',s:'N',x:-32},{id:'mode',n:'Mode Aurore',c:'#d94f4f',s:'N',x:-16},{id:'shoes',n:'Sneakers & Co',c:'#20262e',s:'N',x:0},
 {id:'bijoux',n:'Bijouterie Or du Golfe',c:'#b8902f',s:'N',x:16},{id:'tech',n:'Aurore Tech',c:'#2e6fd1',s:'N',x:32},
 {id:'meubles',n:'Maison & Meubles',c:'#8a5a3a',s:'S',x:-32},{id:'pharma',n:'Pharmacie des Palmiers',c:'#1f8a7a',s:'S',x:-16},
 {id:'cine',n:'Cinéma Palmiers',c:'#7b1f3a',s:'S',x:16},{id:'arcade',n:'Arcade Néon',c:'#7b4bb3',s:'S',x:32}];
V31.STORES=STORES;
function buildMall(){
  const R=roomCtx('mall31',1000,640,7.5);R.name='Les Palmiers · centre commercial';R.sp=[];
  const wl=sm(0xf3efe8,.85,0),ext=sm(0xd8d2c6,.9,0);
  R.floor(-40,-21,40,21,tile(),2.4);R.ceil(-40,-21,40,21,sm(0xf7f5f0,.9,0));
  R.wall(-40,-21,40,-21,wl,ext,[],{th:.3});R.wall(-40,21,40,21,ext,wl,[{k:'door',t:40,w:8,open:true}],{th:.3});
  R.wall(-40,-21,-40,21,ext,wl,[],{th:.3});R.wall(40,-21,40,21,wl,ext,[],{th:.3});
  for(let k=-3;k<=3;k++)box(R,6,.06,30,0xffffff,k*11,7.45,0,{e:0xfff6e0,ei:1.2,cast:false});
  const gl=M7.glass;
  STORES.forEach(st=>{const N=st.s==='N',fz=N?-12:12,bz=N?-21:21,mid=(fz+bz)/2,cx=st.x,dir=N?1:-1;
    [cx-7.8,cx+7.8].forEach(px=>box(R,.25,7.5,9,0xe9e4dc,px,3.75,mid,{col:true}));
    [-1,1].forEach(s=>{M(R.G,new THREE.BoxGeometry(5.2,4.2,.06),gl,cx+s*5,2.1,fz,0,0,0,false);R.col(cx+s*5,fz,5.2,.2);});
    box(R,15.6,1.4,.4,parseInt(st.c.slice(1),16),cx,4.9,fz,{cast:false});signIn(R,st.n.toUpperCase(),11,1,st.c,'#ffffff',cx,4.9,fz+dir*.22,N?0:Math.PI);
    box(R,15.4,.05,8.6,0xf2efe8,cx,7.4,mid,{e:0xffeccc,ei:.5,cast:false});
    R.light(cx,6.5,mid,9,0xfff1dc);
    const clerk=clerk7(R,cx+4.5,bz+dir*2.2,parseInt(st.c.slice(1),16));clerk.rotation.y=N?0:Math.PI;V31.clerks.push(clerk);
    const cnt=R.place(F7.counter(2.4,0x1d1f22),cx+4.5,bz+dir*3.4,N?0:Math.PI,2.4,.7);
    st.int={x:cx,z:fz+dir*-2.5};
    R.int(cx,fz-dir*2.6,st.n,()=>V31.store(st.id),{r:2.6});
    decorStore(R,st,cx,fz,bz,dir);
  });
  // food court (ouest) et café (est)
  for(let k=0;k<3;k++){const z=-8+k*8;R.place(F7.counter(5,0x2a2d31),-37.6,z,Math.PI/2,5,.7);box(R,.3,1.2,5,[0xd94f4f,0xf5c400,0x2e9a6a][k],-39.6,3.2,z,{e:[0x401010,0x403000,0x0c3018][k],ei:.6,cast:false});
    signIn(R,['BURGER AURORE','POULET BRAISÉ','PIZZA LAGUNE'][k],4.4,.8,['#d94f4f','#c8901f','#2e9a6a'][k],'#ffffff',-39.3,4.4,z,Math.PI/2);
    const c=clerk7(R,-38.9,z,[0xd94f4f,0xf5c400,0x2e9a6a][k]);c.rotation.y=Math.PI/2;V31.clerks.push(c);}
  R.int(-35,0,'Food court · manger',()=>V31.store('food'),{r:5});
  for(let k=0;k<6;k++){const x=-30+(k%3)*4.2,z=-5+Math.floor(k/3)*8;R.place(F7.roundTable(.6),x,z,0,1.2,1.2);[-1,1].forEach(s=>R.place(F7.chair(0xd94f4f),x+s*.95,z,s>0?-Math.PI/2:Math.PI/2));}
  R.place(F7.counter(4,0x5a3b24),37.6,4,-Math.PI/2,4,.7);R.place(F7.espresso(),38.2,4.6,-Math.PI/2);const bc=clerk7(R,38.9,4,0x5a3b24);bc.rotation.y=-Math.PI/2;V31.clerks.push(bc);
  signIn(R,'CAFÉ DES PALMIERS',5,.9,'#5a3b24','#ffe8c0',39.6,4.4,4,-Math.PI/2);R.int(35.5,4,'Café des Palmiers',()=>V31.store('cafe'),{r:2.6});
  R.place(F7.atm(),39.4,-8,-Math.PI/2,.8,.8);R.int(38,-8,'Distributeur · banque',()=>openSpot('bank'),{r:1.8});
  // fontaine, palmiers, bancs
  M(R.G,new THREE.CylinderGeometry(3.4,3.6,.6,40),sm(0xd8d2c6,.6,0),0,.3,0);M(R.G,new THREE.CylinderGeometry(3,3,.05,40),new THREE.MeshStandardMaterial({color:0x3fb8d6,roughness:.05,metalness:.2}),0,.58,0,0,0,0,false);R.col(0,0,6.6,6.6);
  const pt=new THREE.Mesh(treeGeo('palm'),decoMat);pt.scale.set(1.4,1.2,1.4);pt.position.set(0,.5,0);R.G.add(pt);
  [[-10,0],[10,0],[0,-7],[0,7]].forEach(([x,z],k)=>{R.place(F7.plant(2,1.3),x+(k<2?0:6),z+(k<2?5:0));M(R.G,rbox(2.4,.12,.6,.04),WOOD(0x8a5a3a),x,.48,z);M(R.G,new THREE.BoxGeometry(.1,.45,.5),M7.black,x-1,.22,z);M(R.G,new THREE.BoxGeometry(.1,.45,.5),M7.black,x+1,.22,z);});
  R.int(0,18.5,'Sortir du centre commercial',()=>leaveInterior(),{exit:1,r:2.4});
  signIn(R,'SORTIE · PARKING',4,.8,'#1f6b4a','#ffffff',0,4.2,20.7,Math.PI);
  R.zones=[[0,0],[-28,-14],[28,-14],[-28,14],[28,14]];R.spotI=40;R.entry={x:0,z:17,h:Math.PI};R.b=[R.rx-39.5,R.rx+39.5,R.rz-20.5,R.rz+20.5];
  [[0,10],[-20,0],[20,0],[-12,-8],[12,8],[30,-6],[-30,8]].forEach(([x,z])=>R.light(x,6.8,z,12,0xfff4e4));
  // promeneurs
  const WP=[[0,10],[-12,8],[12,8],[-24,8],[24,8],[-34,8],[34,-6],[-12,-8],[12,-8],[-24,-8],[24,-8],[-30,-9],[30,9],[0,-9],[-20,0],[20,0],[-32,-15],[-16,-15],[0,-15],[16,-15],[32,-15],[-32,15],[-16,15],[16,15],[32,15]];
  for(let i=0;i<24;i++){const m=makePerson(pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{style:pick(['court','long','afro','chignon','queue','ras']),top:pick(['tee','long','veste','sweat']),bottom:pick(['pantalon','short','jupe']),bag:Math.random()<.5});
    const a=pick(WP);m.position.set(a[0]+rand(-1,1),.1,a[1]+rand(-1,1));R.G.add(m);V31.shoppers.push({m,WP,t:pick(WP),w:rand(0,3),ph:rand(0,6),sp:rand(1,1.5),i});}
  R.G.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});ROOMS.mall31=R;V31.mall=R;
}
function decorStore(R,st,cx,fz,bz,dir){
  const back=bz+dir*.9,mid=(fz+bz)/2,N=dir>0,ry=N?0:Math.PI;
  if(st.id==='super'){for(let k=0;k<3;k++)R.place(F7.shelfUnit(4,1.9,[0xd94f4f,0xf5c400,0x2e9a6a,0x3d7be0,0xf2f2f2],'box'),cx-3+k*0,mid+(k-1)*2.6,ry,4,.6);R.place(F7.drinkFridge(3),cx-4,back,ry,3,.7);R.place(F7.till(),cx+1.5,fz-dir*1.8,ry,1.6,.6);}
  else if(st.id==='mode'){[-4,-1,2].forEach(x=>R.place(F7.rack(1.6),cx+x,mid,ry+Math.PI/2,.5,1.6));[[0xd94f4f,0x2b3445,'veste','pantalon'],[0xf2c94c,0x2b3445,'tee','short'],[0x2e9a6a,0xc9b38a,'long','jupe']].forEach((l,k)=>{const mq=F7.mannequin(l);R.place(mq,cx-4+k*3,fz-dir*1.4,ry+Math.PI);});}
  else if(st.id==='shoes'){[-4,0,4].forEach(x=>R.place(F7.shelfUnit(3,2,[0xf2f2f2,0x1c1c1c,0xd94f4f,0x2e6fd1],'box'),cx+x,back,ry,3,.6));[-2,2].forEach(x=>R.place(F7.stool(),cx+x,mid));}
  else if(st.id==='bijoux'){for(let k=0;k<3;k++){const x=cx-4+k*4;box(R,2.6,1,.9,0x1d1f22,x,.5,mid,{col:true});M(R.G,new THREE.BoxGeometry(2.5,.5,.85),M7.glass,x,1.25,mid,0,0,0,false);for(let q=0;q<5;q++)M(R.G,new THREE.SphereGeometry(.05,10,8),sm(0xe0b34a,.2,1),x-1+q*.5,1.05,mid);box(R,2.5,.05,.85,0xffffff,x,1.5,mid,{e:0xfff3c0,ei:1,cast:false});}}
  else if(st.id==='tech'){for(let k=0;k<4;k++){const tv=F7.tv(1.6);tv.position.set(cx-5+k*3.3,2.4,back+dir*.1);tv.rotation.y=ry;R.G.add(tv);box(R,1.5,.84,.02,[0x2e6fd1,0xd94f4f,0x2e9a6a,0xf5c400][k],cx-5+k*3.3,2.4,back+dir*.14,{e:[0x2e6fd1,0xd94f4f,0x2e9a6a,0xf5c400][k],ei:.9,cast:false});}
    [-3,2].forEach(x=>{R.place(F7.table(2.4,1,0xf2f2f2),cx+x,mid,ry,2.4,1);const lp=F7.laptop?F7.laptop():F7.monitor();lp.position.set(cx+x,.78,mid);lp.rotation.y=ry;R.G.add(lp);});}
  else if(st.id==='meubles'){R.place(F7.sofa(0xe8e4dc,2.6),cx-3,mid-dir*1,ry,2.6,1);R.place(F7.bed(1.8,2.1,0x6c7a89),cx+3.5,back+dir*1.3,ry,1.8,2.1);R.place(F7.floorLamp(),cx-6,back);R.place(F7.coffeeTable(),cx-3,mid+dir*.6,ry,1.2,.6);}
  else if(st.id==='pharma'){[-4,0,4].forEach(x=>R.place(F7.shelfUnit(3,1.9,[0xffffff,0x1f8a7a,0x9fd3c7],'bottle'),cx+x,back,ry,3,.6));R.place(F7.till(),cx+3,fz-dir*1.8,ry,1.6,.6);}
  else if(st.id==='cine'){for(let k=0;k<3;k++){const a=F7.art(k,1.6,2.3);a.position.set(cx-5+k*3.4,2.4,back+dir*.1);a.rotation.y=ry;R.G.add(a);}box(R,1.2,1.6,.9,0xd94f4f,cx+5,.8,mid,{col:true,e:0x401010,ei:.3});box(R,1,.8,.8,0xfff2c0,cx+5,2,mid,{e:0xffe08a,ei:.8,cast:false});}
  else if(st.id==='arcade'){for(let k=0;k<6;k++){const x=cx-6+k*2.4,z=k%2?mid-dir*1:back+dir*.6;box(R,1,1.9,.8,[0x7b4bb3,0xd94f4f,0x2e6fd1][k%3],x,.95,z,{col:true});box(R,.8,.6,.02,0x111111,x,1.5,z+dir*.41,{e:[0xff4fd8,0x4fd8ff,0xffe14f][k%3],ei:1.2,cast:false});}
    box(R,15,.08,.08,0xff4fd8,cx,6.9,bz+dir*.3,{e:0xff4fd8,ei:1.5,cast:false});}
}
/* ================= intérieur villa / appartement ================= */
function buildHome(){
  const R=roomCtx('villa31',1080,640,3.3);R.name='Villa';R.sp=[];
  const wl=sm(0xefeae2,.88,0),ext=sm(0xd8d2c6,.9,0),wood=WOOD(0x8a6a48);
  R.floor(-9,-7,9,7,wood,1.6);R.ceil(-9,-7,9,7,sm(0xf4f1ea,.9,0));
  R.wall(-9,-7,9,-7,wl,ext,[{k:'window',t:12,w:3,y0:.9,y1:2.6,out:1},{k:'window',t:15.5,w:2.2,y0:.9,y1:2.6,out:1}],{th:.2});
  R.wall(-9,7,9,7,ext,wl,[{k:'door',t:13,w:1.4,open:false}],{th:.2});R.wall(-9,-7,-9,7,ext,wl,[],{th:.2});R.wall(9,-7,9,7,wl,ext,[{k:'window',t:7,w:3,y0:.9,y1:2.6,out:-1}],{th:.2});
  // séparation façon claustra noire
  for(let k=0;k<5;k++)box(R,.12,3.2,.12,0x15171a,-1,1.6,-6.6+k*.9,{});for(let k=0;k<4;k++)box(R,.1,.1,3.6,0x15171a,-1,.6+k*.75,-4.8,{cast:false});
  // salon
  R.place(F7.rug(5,3.6,ctex('rug31',128,128,(g,W,H)=>{g.fillStyle='#2b2d31';g.fillRect(0,0,W,H);g.strokeStyle='#4a4d52';for(let i=0;i<W;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,H);g.stroke();}})),4.6,1);
  R.place(F7.sofa(0xeeebe6,3.2),4.6,3.2,Math.PI,3.2,1);R.place(F7.sofa(0xeeebe6,2.2),7.6,.6,-Math.PI/2,2.2,1);
  R.place(F7.coffeeTable(),4.6,1.1,0,1.2,.6);R.place(F7.roundTable(.35,0xf2f2f2),2.4,3.6);
  const tvu=R.place(F7.tvUnit(2.4),4.6,-6.6,0,2.4,.45);const tv=F7.tv(1.9);tv.position.set(4.6,1.55,-6.75);R.G.add(tv);
  R.place(F7.floorLamp(),8.2,3.2);R.place(F7.plant(2,1.3),8.2,-6.2);const art=F7.art(0,1.6,1);art.position.set(-8.85,1.7,4);art.rotation.y=Math.PI/2;R.G.add(art);
  M(R.G,new THREE.SphereGeometry(.55,18,12),FAB(0xb9b4ac),1.2,.4,-2,0,0,0,true);
  // cuisine
  const cn=R.place(F7.counter(5,0xe9e6e0),-5.5,-6.55,0,5,.65);R.place(F7.upper(5),-5.5,-6.75).position.y=2.15;
  R.place(F7.stove(),-4.2,-6.55);R.place(F7.sinkTop(),-6.6,-6.55);R.place(F7.fridge(),-8.4,-6.4,0,.8,.75);R.place(F7.microwave(),-3.2,-6.55).position.y=.93;
  R.place(F7.counter(3,0x2a2d31),-5,-3.2,Math.PI,3,.7);[-1,0,1].forEach(o=>R.place(F7.stool(),-5+o*.9,-2.2));
  // chambre
  R.place(F7.bed(1.8,2.1,0x4a6fa5),-6.4,4.2,Math.PI/2,2.1,1.8);R.place(F7.nightstand(),-8.3,2.6);R.place(F7.wardrobe(),-3,6.4,Math.PI,1.6,.6);
  // interactions
  R.int(-4.2,-5.4,'Cuisiner un repas',()=>V31.cook(),{r:1.6});
  R.int(-6.4,2.8,'Dormir jusqu’au matin',()=>V31.sleep(),{r:1.8});
  R.int(4.6,2.2,'Regarder la télé',()=>V31.tv(),{r:1.8});
  R.int(1.2,-1,'Console de jeu',()=>V31.console(),{r:1.4});
  R.int(-5,-2,'Ordinateur · travail en ligne',()=>V31.laptop(),{r:1.4});
  R.int(-8.2,-5.6,'Ouvrir le frigo',()=>V31.fridge(),{r:1.4});
  R.int(4,6.4,'Sortir',()=>leaveInterior(),{exit:1,r:1.6});
  R.zones=[[4,1],[-5,-4],[-6,4]];R.spotI=35;R.entry={x:4,z:5.6,h:Math.PI};R.b=[R.rx-8.7,R.rx+8.7,R.rz-6.7,R.rz+6.7];
  R.light(4.6,3,1,9,0xffe2b8);R.light(-5,3,-4,8,0xfff1dc);R.light(-6,3,4,6,0xffd9a8,'bed');R.light(1,3,-2,6,0xffe2b8);
  R.G.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});ROOMS.villa31=R;V31.home=R;
}
V31.buildInteriors=function(){try{buildMall();}catch(e){console.warn('v31 mall',e);}try{buildHome();}catch(e){console.warn('v31 home',e);}};
V31.tickInside=function(dt){const R=player.inside;if(!R)return;const t=performance.now()*.001;
  if(R===V31.mall){const h=(gameMin/60)%24,open=h>=8&&h<22;
    V31.shoppers.forEach(s=>{const vis=open||s.i<4;s.m.visible=vis;if(!vis)return;
      if(s.w>0){s.w-=dt;animPerson(s.m,t*2+s.ph,0,false);return;}
      const dx=s.t[0]-s.m.position.x,dz=s.t[1]-s.m.position.z,d=Math.hypot(dx,dz);
      if(d<.4){s.w=rand(1.5,6);s.t=pick(s.WP).map(v=>v+rand(-1.2,1.2));return;}
      s.m.position.x+=dx/d*s.sp*dt;s.m.position.z+=dz/d*s.sp*dt;s.m.rotation.y=Math.atan2(dx,dz);s.ph+=dt*s.sp*2.3;animPerson(s.m,s.ph,.45,false);
      const px=player.x-R.rx-s.m.position.x,pz=player.z-R.rz-s.m.position.z;if(Math.hypot(px,pz)<.7){s.m.position.x-=px*.2;s.m.position.z-=pz*.2;}});
  }
  V31.clerks.forEach((c,i)=>{if(c.parent&&c.parent.visible)animPerson(c,t+i,0,false);});
};
})();
'use strict';
(function(){
const V31=window.V31,buy=V31.buy,up=V31.up,OWN=V31.own,RES=V31.res;
const remeshP=()=>{try{remesh();}catch(e){if(player.mesh)scene.remove(player.mesh);player.mesh=makePlayerMesh();scene.add(player.mesh);}};
const bag=(k,c)=>({label:IT[k][0]+' · '+fmt(c),off:!V31.afford(c)||inv()>=CAP,fn:()=>{if(inv()>=CAP){toast('Sac plein.','warn');return;}if(!V31.pay(c))return;P3.inv[k]=(P3.inv[k]||0)+1;toast(IT[k][0]+' dans le sac.','good');V31.biz.sale&&V31.biz.sale('mall',c);}});
IT.fruit=IT.fruit||['Fruits frais',s=>{s.hunger+=18;s.thirst+=8;}];
IT.riz=IT.riz||['Sac de riz (+5 portions au frigo)',()=>{if(window.H7)H7.food=(H7.food||0)+5;toast('Frigo : +5 portions.','good');}];
IT.jus=IT.jus||['Jus de bissap',s=>{s.thirst+=40;s.fun+=4;}];
const fadeDo=V31.fadeDo=function(fn){let el=document.getElementById('fade31');if(!el){el=document.createElement('div');el.id='fade31';el.style.cssText='position:fixed;inset:0;background:#05070a;opacity:0;pointer-events:none;transition:opacity .45s;z-index:60';document.body.appendChild(el);}
  el.style.opacity='1';setTimeout(()=>{try{fn();}catch(e){console.warn(e);}el.style.opacity='0';},480);};
const has=k=>!!OWN[k];V31.has=has;
const own=(k,lab,cost,msg,extra)=>({label:(has(k)?'✓ ':'')+lab+' · '+fmt(cost),off:has(k)||!V31.afford(cost),fn:()=>{if(!V31.pay(cost))return;OWN[k]=1;V31.saveOwn();extra&&extra();toast(msg,'good');V31.biz.sale&&V31.biz.sale(k.startsWith('t_')?'tech':'mall',cost);}});
const outfit=(lab,cost,f)=>({label:lab+' · '+fmt(cost),off:!V31.afford(cost),fn:()=>{if(!V31.pay(cost))return;f();remeshP();toast(lab+' : porté tout de suite.','good');V31.biz.sale&&V31.biz.sale('mode',cost);V31.store('mode');}});
V31.store=function(id){
  const h=(gameMin/60)%24;if(id!=='cafe'&&id!=='food'&&id!=='cine'&&id!=='arcade'&&(h<8||h>=22)){toast('Boutique fermée (8 h – 22 h).','warn');return;}
  if(id==='super')market('Supermarché Lagune','Courses du quotidien, rangées dans ton sac.',[['water',2],['jus',3],['fruit',4],['sand',7],['menu',13],['fish',11],['groc',10],['riz',16]],()=>V31.store('super'));
  else if(id==='mode')openPanel('Mode Aurore','Essaie et porte immédiatement. Garde-robe : '+(OWN.wardrobe||0)+' pièces.',[
    outfit('Chemise lin blanche',35,()=>{look.s=0xf4f1ea;look.t='long';}),outfit('Polo vert lagune',28,()=>{look.s=0x2e9a6a;look.t='tee';}),outfit('Veste de costume',95,()=>{look.t='veste';look.j=0x1d2230;look.s=0xf4f1ea;}),
    outfit('Sweat à capuche',40,()=>{look.t='sweat';look.s=pick([0x2f3a4a,0xd94f4f,0x8a5fc9]);}),outfit('Jean bleu',30,()=>{look.bt='pantalon';look.p=0x3d6fb0;}),outfit('Short d’été',18,()=>{look.bt='short';look.p=0xc9b38a;}),
    outfit('Robe / jupe',32,()=>{look.bt='jupe';look.p=pick([0xd94f4f,0x2e9a6a,0xf5c400]);}),outfit('Casquette',15,()=>{look.y='casquette';look.cap=pick([0xd94f4f,0x1c1c1c,0x2e6fd1]);})]);
  else if(id==='shoes')openPanel('Sneakers & Co','Chaussures portées tout de suite.',[outfit('Sneakers blanches',45,()=>{look.f=0xf2f2ee;}),outfit('Baskets noires',45,()=>{look.f=0x1c1c1c;}),outfit('Mocassins cuir',70,()=>{look.f=0x5a3b24;}),outfit('Running bleues',55,()=>{look.f=0x2b3445;})]);
  else if(id==='bijoux')openPanel('Bijouterie Or du Golfe','Le style, ça se voit. Les pièces de luxe augmentent ta réputation.',[
    outfit('Chaîne en or',120,()=>{look.n=true;state.rep+=1;}),outfit('Boucles d’oreilles',80,()=>{look.e=true;}),outfit('Montre chronographe',260,()=>{look.w=true;state.rep+=2;}),
    own('j_rolex','Montre de luxe « Lagune Royale »',1800,'Montre de luxe achetée. Réputation +4.',()=>{look.w=true;state.rep+=4;remeshP();})]);
  else if(id==='tech')openPanel('Aurore Tech','Les appareils s’utilisent dans ta villa ou ton appartement.',[
    own('t_laptop','Ordinateur portable (travail en ligne)',650,'Ordinateur acheté : tu peux faire des missions en ligne chez toi.'),own('t_console','Console de jeu',420,'Console achetée : branche-la chez toi.'),
    own('t_tv','TV 4K 75 pouces',900,'TV 4K installée chez toi : plus d’humeur devant la télé.'),own('t_phone','Smartphone haut de gamme',780,'Nouveau smartphone : réputation +1.',()=>{state.rep+=1;}),own('t_audio','Casque audio',140,'Casque audio : +humeur en marchant.')]);
  else if(id==='meubles')openPanel('Maison & Meubles','Livraison dans ton logement. Chaque meuble améliore ton repos.',[
    own('m_sofa','Canapé d’angle',850,'Canapé livré : la télé détend davantage.'),own('m_bed','Lit king size',1200,'Lit king size : sommeil plus réparateur.'),own('m_kitchen','Cuisine équipée',1600,'Cuisine équipée : tes plats nourrissent mieux.'),own('m_art','Œuvres d’art',500,'Œuvres d’art : +humeur à la maison.')]);
  else if(id==='pharma'){if(typeof pharma==='function')pharma();}
  else if(id==='cine')openPanel('Cinéma Palmiers','Quatre salles, son Dolby. Humeur '+Math.round(state.fun)+'.',['Les Marées d’Aurore','Dernier Tram pour Solenne','Opération Lagune','Le Roi du Port'].map(f=>buy('Séance · '+f,15,()=>{fadeDo(()=>{gameMin+=120;up('fun',32);up('energy',-4);toast('Séance terminée : « '+f+' ». +32 humeur','good');});})).concat([buy('Pop-corn XL',6,()=>{up('hunger',10);up('fun',4);})]));
  else if(id==='arcade')openPanel('Arcade Néon','Bornes jouables au clavier, à la souris et à la manette.',[MG29.act('Danse rythmique',4,'rhythm',{id:'arc31-dance',title:'Dance Battle',bpm:120,dur:26,diff:.6,replay:true,gain:{fun:16}}),MG29.act('Stand de tir',4,'tir',{id:'arc31-tir',title:'Tir aux cibles',replay:true,gain:{fun:14}}),MG29.act('Course urbaine',4,'runner',{id:'arc31-run',title:'Course urbaine',bgk:'road',replay:true,gain:{fun:14}}),MG29.act('Basket arcade',4,'basketball',{id:'arc31-bb',title:'Basket arcade',duration:40,replay:true,gain:{fun:15}})]);
  else if(id==='food')openPanel('Food court','Faim '+Math.round(state.hunger)+' · Soif '+Math.round(state.thirst)+'.',[buy('Burger Aurore + frites',13,()=>{up('hunger',50);up('fun',4);toast('Burger avalé. +50 faim','good');}),buy('Poulet braisé + attiéké',16,()=>{up('hunger',60);toast('Poulet braisé : +60 faim','good');}),buy('Pizza Lagune',14,()=>{up('hunger',52);}),buy('Glace coco',5,()=>{up('fun',8);up('thirst',10);}),buy('Jus de bissap',3,()=>{up('thirst',38);})]);
  else if(id==='cafe')openPanel('Café des Palmiers','Énergie '+Math.round(state.energy)+'.',[buy('Expresso',3,()=>{up('energy',14);}),buy('Cappuccino + croissant',7,()=>{up('energy',12);up('hunger',14);}),buy('Smoothie mangue',5,()=>{up('thirst',35);up('fun',3);})]);
};
V31.enterMall=function(ox,oz){const h=(gameMin/60)%24;if(!V31.mall){toast('Centre commercial en travaux.','warn');return;}if(player.car){toast('Gare-toi d’abord.','warn');return;}
  enterInterior({id:'mall31',x:ox!=null?ox:-230,z:oz!=null?oz:-649});if(h<8||h>=22)toast('Il est tard : seuls le food court, le café, le cinéma et l’arcade sont ouverts.','warn');};
/* ---------- logement : villas & appartements ---------- */
const nowM=()=>gameMin;
const resOf=k=>RES[k]||(RES[k]={});
const access=k=>{const r=RES[k];return !!r&&(r.own||(r.until||0)>nowM());};
V31.access=access;
function goHome(k,name,x,z){const R=V31.home;if(!R)return;R.name=name;V31.cur=k;enterInterior({id:'villa31',x,z});}
V31.villaPanel=function(i){const v=V31.villas[i];if(!v)return;const k=v.id,r=resOf(k),acc=access(k),left=r.until>nowM()?Math.ceil((r.until-nowM())/60):0;
  if(!v.rent&&!r.own){openPanel(v.name,'Villa habitée par une famille du quartier. Piscine, jardin, deux étages.',[{label:'Sonner à l’interphone',fn:()=>{up('fun',4);toast(pick(['« Bonjour voisin ! Belle journée au Belvédère. »','« On organise un barbecue samedi, passe ! »','« Désolé, on est occupés. Bonne journée ! »']),'');}},
    {label:'Faire une offre de rachat · '+fmt(24000),off:!V31.afford(24000),fn:()=>{if(!V31.pay(24000))return;r.own=1;V31.saveRes();toast(v.name+' est à toi. La famille déménage.','good');}}]);return;}
  openPanel(v.name+(r.own?' · propriétaire':acc?' · location active':''),r.own?'Ta villa : piscine, cuisine équipée, salon et chambre.':acc?'Location active encore '+left+' h.':'Villa meublée avec piscine. Location à la journée ou achat.',[
    acc?{label:'Entrer dans la villa',fn:()=>goHome(k,v.name,v.dx,v.dz)}:buy('Louer 24 h',150,()=>{r.until=nowM()+1440;V31.saveRes();toast('Clés remises : '+v.name+' est à toi pour 24 h.','good');goHome(k,v.name,v.dx,v.dz);}),
    r.own?{label:'Revendre la villa · '+fmt(11000),fn:()=>{state.bank+=11000;r.own=0;V31.saveRes();toast('Villa revendue.','good');}}:buy('Acheter la villa',16000,()=>{r.own=1;V31.saveRes();toast('Félicitations, '+v.name+' t’appartient !','good');}),
    !r.own&&acc?buy('Prolonger de 24 h',150,()=>{r.until=Math.max(r.until,nowM())+1440;V31.saveRes();toast('Location prolongée.','good');}):null].filter(Boolean));};
V31.aptPanel=function(i){const a=V31.apts[i];if(!a)return;const k='apt'+i,r=resOf(k),acc=access(k);
  openPanel(a.name,'Appartement avec balcon, cuisine et chambre. '+(r.own?'Tu es propriétaire.':acc?'Bail actif.':'Loyer à la journée.'),[
    acc?{label:'Monter à l’appartement',fn:()=>goHome(k,a.name,a.x,a.z)}:buy('Louer 24 h',45,()=>{r.until=nowM()+1440;V31.saveRes();goHome(k,a.name,a.x,a.z);}),
    r.own?null:buy('Acheter l’appartement',6000,()=>{r.own=1;V31.saveRes();toast(a.name+' : tu es propriétaire.','good');})].filter(Boolean));};
/* actions à la maison */
V31.cook=function(){const full=has('m_kitchen')?1.3:1;const run=()=>MG29.play('stir',{id:'cook31',title:'Cuisiner',icon:'🍳',intro:'Garde la cuisson dans la zone idéale.',items:['🍅','🧅','🌶️','🐟'],dur:16,min:30,gain:{hunger:Math.round(50*full),fun:8},msg:'Repas maison prêt !'});
  if(window.H7&&H7.food>0){H7.food--;run();}else openPanel('Cuisine','Frigo vide. Achète des courses au supermarché, ou commande.',[V31.buy('Cuisiner avec les restes du placard',4,run)]);};
V31.sleep=function(){const bonus=has('m_bed')?10:0;fadeDo(()=>{gameMin=(Math.floor(gameMin/1440)+((gameMin%1440)>=420?1:0))*1440+420;state.energy=100;up('health',8+bonus);up('fun',6+bonus);up('hunger',-20);toast('Bonne nuit. Il est 7 h.','good');});};
V31.tv=function(){const k=(has('t_tv')?1.5:1)*(has('m_sofa')?1.3:1);fadeDo(()=>{gameMin+=60;up('fun',Math.round(15*k));up('energy',4);toast('Une heure devant la télé. +'+Math.round(15*k)+' humeur','good');});};
V31.console=function(){if(!has('t_console')){toast('Pas de console ici : Aurore Tech, au centre commercial.','warn');return;}MG29.play(pick(['runner','tir','rhythm']),{id:'console31',title:'Console de salon',replay:true,gain:{fun:20},min:30});};
V31.laptop=function(){if(!has('t_laptop')){toast('Il te faut un ordinateur (Aurore Tech).','warn');return;}openPanel('Travail en ligne','Missions freelance payées selon ta performance.',[MG29.act('Mission de développement',0,'code',{id:'free31',title:'Mission freelance',n:6,min:60,work:true,gain:{cash:90,cashMin:.2,energy:-8}}),{label:'Gérer mes entreprises',fn:()=>V31.bizList()}]);};
V31.fridge=function(){openPanel('Frigo','Portions disponibles : '+((window.H7&&H7.food)||0)+'.',[{label:'Prendre un en-cas',off:!(window.H7&&H7.food>0),fn:()=>{H7.food--;up('hunger',25);toast('En-cas : +25 faim','good');}},{label:'Boire un verre d’eau',fn:()=>{up('thirst',30);}}]);};
/* ---------- concession ---------- */
const COLS=[[0x111214,'Noir'],[0xf2f2f2,'Blanc'],[0x1f4f8a,'Bleu'],[0xc0392b,'Rouge'],[0x8a9096,'Gris'],[0xe0a526,'Or'],[0x2e9a6a,'Vert']];
V31.carPanel=function(i){const c=V31.cata[i];if(!c)return;const sp=(CT[c.t]||[0,0,0,27])[3];
  openPanel(c.n,c.g+' · vitesse max '+Math.round(sp*3.6)+' km/h · '+fmt(c.p)+'. Livraison au parking de la concession.',COLS.slice(0,5).map(([col,cn])=>buy('Acheter · '+cn,c.p,()=>V31.deliver(c,col))).concat([{label:'Essai routier (2 min)',fn:()=>V31.test(c)}]));};
V31.deliver=function(c,color){const n=V31.cars.length,s=V31.slots[n%V31.slots.length];const v=addCar(s.x,s.z,0,color,'parked',c.t);v.owned=true;v.own31=true;v.fuel=100;V31.cars.push({type:c.t,color});V31.saveCars();state.rep+=c.p>6000?2:1;
  if(typeof saveProgress==='function')saveProgress();wp={x:s.x,z:s.z,l:c.n};toast(c.n+' livrée au parking (repère placé). Bonne route !','good');V31.biz.carSold&&V31.biz.carSold(c);};
V31.test=function(c){if(player.car){toast('Descends d’abord.','warn');return;}if(V31.testCar){toast('Un essai est déjà en cours.','warn');return;}const v=addCar(-40,-650,Math.PI/2,c.c,'parked',c.t);v.fuel=100;V31.testCar={v,t:120};enterCar(v);toast('Essai routier : 2 minutes au volant de la '+c.n+'.','good');};
V31.tickTest=function(dt){const T=V31.testCar;if(!T)return;T.t-=dt;if(T.t<=0){if(player.car===T.v){player.car.v=0;exitCar();}const i=cars.indexOf(T.v);if(i>=0){scene.remove(T.v.mesh);cars.splice(i,1);}V31.testCar=null;player.x=-40;player.z=-650;toast('Fin de l’essai. Le vendeur récupère les clés.','');}};
V31.catalog=function(){openPanel('Aurore Motors · catalogue','Occasions, SUV, berlines, sport et supercars.',V31.cata.map((c,i)=>({label:c.g+' · '+c.n+' · '+fmt(c.p),fn:()=>V31.carPanel(i)})).concat([{label:'Bureau de la concession (entreprise)',fn:()=>V31.bizPanel('motors')}]));};
})();
'use strict';
(function(){
const V31=window.V31,BZ=V31.biz;
const SURN=['Mensah','Koffi','Adjovi','Diallo','Traoré','Kouassi','Agbeko','Sow','Ndiaye','Amouzou','Lawson','Dossou','Akakpo','Bamba','Tchalla','Gnassingbé'];
const DEF=BZ.DEF={
  mama:{n:'Chez Mama Adjo',k:'Restaurant',price:6500,ticket:14,base:80,max:5,open:[10,23],roles:['Cuisinier','Serveur','Plongeur','Chef de salle'],unit:3,mg:'cook',pos:[[72,-656.5],[78,-656.5],[81,-657.5],[69,-657.5],[75,-655.5]],shirt:0xc8693f},
  marche:{n:'Étal du Marché de la Lagune',k:'Épicerie',price:1800,ticket:6,base:50,max:2,open:[7,19],roles:['Vendeur','Porteur'],unit:1,mg:'catch',pos:[[33,-660],[43,-660]],shirt:0xffc23d},
  truck:{n:'Food truck du parc',k:'Fast-food',price:3000,ticket:8,base:55,max:2,open:[11,24],roles:['Cuisinier','Caissier'],unit:1.5,mg:'catch',pos:[[203.4,-699],[203.4,-701.4]],shirt:0xd94f4f},
  mode:{n:'Mode Aurore (Les Palmiers)',k:'Boutique',price:9000,ticket:35,base:24,max:4,open:[8,22],roles:['Vendeur','Styliste','Caissier'],unit:5,mg:'quiz',store:'mode',inPos:[[-19,-15.5],[-13,-15.5],[-16,-18.5],[-11,-18.5]],shirt:0xd94f4f},
  tech:{n:'Aurore Tech (Les Palmiers)',k:'Électronique',price:15000,ticket:95,base:12,max:4,open:[8,22],roles:['Vendeur','Technicien','Caissier'],unit:12,mg:'quiz',store:'tech',inPos:[[29,-15.5],[35,-15.5],[32,-18.5],[37,-18.5]],shirt:0x2e6fd1},
  arcade:{n:'Arcade Néon (Les Palmiers)',k:'Loisirs',price:7000,ticket:5,base:95,max:3,open:[10,24],roles:['Animateur','Technicien','Caissier'],unit:2,mg:'timing',store:'arcade',inPos:[[29,15.5],[35,15.5],[32,17.5]],shirt:0x7b4bb3},
  motors:{n:'Aurore Motors',k:'Concession auto',price:60000,ticket:900,base:1.3,max:6,open:[8,20],roles:['Commercial','Mécanicien','Hôte d’accueil','Livreur'],unit:150,mg:'quiz',pos:[[-30,-661],[-50,-661],[-14,-663],[-60,-668],[-22,-672],[-45,-667]],shirt:0xc8102e}};
const S=BZ.S=V31.LS('pa-biz31',{});const save=()=>V31.SV('pa-biz31',S);BZ.save=save;
const own=id=>S[id]&&S[id].own;BZ.own=own;
const hourNow=()=>Math.floor(gameMin/60);
const QZ={
  mode:[['Une cliente hésite entre deux robes.',['Lui proposer d’essayer les deux','Lui dire de se dépêcher','Ignorer la cliente'],0],['Un client cherche une tenue de mariage.',['Proposer un costume et des accessoires','Vendre un short','Dire qu’il n’y a rien'],0],['La caisse affiche une erreur.',['Recompter et vérifier le ticket','Encaisser deux fois','Fermer la boutique'],0],['Un vêtement est taché.',['Le retirer du rayon et le signaler','Le vendre plein tarif','Le cacher'],0]],
  tech:[['Un client veut un ordinateur pour ses études.',['Conseiller un portable léger et autonome','Vendre la console la plus chère','Refuser de conseiller'],0],['Une TV ne s’allume plus en démo.',['Vérifier l’alimentation et la source','La frapper','La mettre en vitrine'],0],['Le client veut une garantie.',['Expliquer l’extension de garantie','Dire que ça n’existe pas','Changer de sujet'],0],['Un smartphone est rapporté sous 7 jours.',['Appliquer la politique de retour','Refuser sans regarder','Garder le téléphone'],0]],
  motors:[['Un client veut une voiture familiale.',['Présenter le Land Cruiser Prado','Proposer une Lamborghini deux places','Lui conseiller le bus'],0],['Le client demande un essai.',['Préparer un essai routier accompagné','Lui donner les clés sans papiers','Refuser'],0],['Négociation : il veut 10 % de remise.',['Proposer 4 % + entretien offert','Accepter 30 %','Partir en claquant la porte'],0],['La voiture livrée a une rayure.',['Faire la retouche avant livraison','Livrer sans rien dire','Repeindre en rose'],0]]};
function cand(id){const d=DEF[id],day=Math.floor(gameMin/1440),b=S[id];if(b.cand&&b.cday===day)return b.cand;
  b.cday=day;b.cand=[0,1,2].map(()=>{const sk=1+Math.floor(Math.random()*5);return {n:pick(NAMES)+' '+pick(SURN),r:pick(d.roles),sk,w:Math.round(22+sk*13+rand(-4,6)),sh:d.shirt,s:pick(SKINS),hr:pick(HAIRS)};});save();return b.cand;}
const stars=n=>'★'.repeat(n)+'☆'.repeat(5-n);
function demand(h){return h>=12&&h<14?1.45:h>=18&&h<21?1.55:h>=8&&h<11?.85:1;}
function isOpen(d,h){h=h%24;const a=d.open[0],b=d.open[1];return b>24?(h>=a||h<b-24):(h>=a&&h<b);}
function simHour(id,h){const d=DEF[id],b=S[id];if(!isOpen(d,h)){b.lastH=h;return;}
  const sk=b.staff.reduce((a,p)=>a+p.sk,0),staffF=b.staff.length?(.4+.6*Math.min(1,sk/(d.max*3)))*(1+.08*b.staff.length):(V31.workingHere===id?.9:.18);
  const lvlM=[1,1,1.5,2.2][b.lvl||1],repM=.5+b.rep/100,cust=d.base/10*demand(h%24)*staffF*lvlM*repM*Math.pow(b.price,-1.7)*(b.stock>0?1:0)*rand(.8,1.2);
  const rev=cust*d.ticket*b.price;b.till+=rev;b.stock=Math.max(0,b.stock-cust*(.9/(lvlM))*(d.unit>20?3:1));b.hrev=Math.round(rev);b.cust=(b.cust||0)+cust;
  const q=b.staff.length?sk/b.staff.length:1.5;b.rep=clamp(b.rep+(q-2.6)*.25-(b.stock<15?1.2:0)-(b.price>1.15?.25:0)+(b.price<.95?.15:0),5,100);}
function payroll(id){const b=S[id];const tot=b.staff.reduce((a,p)=>a+p.w,0);if(!tot)return;
  if(b.till>=tot)b.till-=tot;else{let rest=tot-b.till;b.till=0;const fromBank=Math.min(state.bank,rest);state.bank-=fromBank;rest-=fromBank;if(rest>0){const q=b.staff.pop();if(q)toast(q.n+' a démissionné de '+DEF[id].n+' : salaire impayé.','bad');}}
  b.wages=(b.wages||0)+tot;}
BZ.tick=function(){const H=hourNow();Object.keys(S).forEach(id=>{const b=S[id];if(!b.own)return;if(b.lastH==null)b.lastH=H;let n=Math.min(48,H-b.lastH);
  for(let k=1;k<=n;k++){const hh=b.lastH+1;simHour(id,hh);b.lastH=hh;if(hh%24===0)payroll(id);}
  if(n>0&&b.stock<12&&!b.warned){b.warned=1;toast(DEF[id].n+' : stock presque vide, pense à réapprovisionner.','warn');}if(b.stock>=12)b.warned=0;});if(Object.keys(S).length)save();};
BZ.sale=function(store,amt){Object.keys(DEF).forEach(id=>{if(own(id)&&DEF[id].store===store){S[id].till+=amt*.35;}});};
BZ.carSold=function(c){if(own('motors')){S.motors.till+=c.p*.12;toast('Ta concession touche une commission : '+fmt(c.p*.12),'good');}};
BZ.visit=function(id){if(!own(id))return;const d=DEF[id],b=S[id];if(!isOpen(d,(gameMin/60)%24)||b.stock<=0)return;b.till+=d.ticket*b.price*rand(.6,1.4);b.stock=Math.max(0,b.stock-.4);};
function work(id){const d=DEF[id],b=S[id],lvl=b.lvl||1,done=s=>{const g=Math.round((d.ticket*6+40)*s*lvl);b.till+=g;b.rep=clamp(b.rep+s*3,5,100);save();V31.workingHere=null;toast('Service terminé : '+fmt(g)+' en caisse · réputation +'+Math.round(s*3),'good');};
  V31.workingHere=id;
  if(d.mg==='cook')MG29.chain([{type:'catch',title:'Préparer les ingrédients',good:['🍅','🧅','🌶️','🐟','🍗'],bad:['🧴','🥾','📱'],basket:'🧺',dur:16},{type:'timing',icon:'🔥',title:'Cuisson',steps:['Poisson','Alloco','Sauce','Dressage'],rounds:4},{type:'stir',title:'Mijoter',items:['🍅','🌶️','🍗'],dur:12}],{id:'biz31-'+id,title:'Service · '+d.n,min:60,done});
  else if(d.mg==='catch')MG29.play('catch',{id:'biz31-'+id,title:'Rush · '+d.n,intro:'Attrape les bonnes commandes, évite les erreurs.',good:id==='truck'?['🌭','🍔','🍟','🥤']:['🍌','🥭','🍍','🐟','🌶️'],bad:['🧦','🪳','🥾'],basket:'🧺',dur:22,min:45,done});
  else if(d.mg==='timing')MG29.play('timing',{id:'biz31-'+id,title:'Maintenance des bornes',icon:'🔧',steps:['Borne 1','Borne 2','Borne 3','Borne 4','Borne 5'],rounds:5,min:45,done});
  else MG29.play('quiz',{id:'biz31-'+id,title:'Conseil client · '+d.n,icon:'🤝',q:QZ[id]||QZ.mode,n:4,min:45,done});}
BZ.panel=V31.bizPanel=function(id,here){const d=DEF[id];if(!d)return;const b=S[id];
  if(!own(id)){openPanel(d.n,d.k+' à reprendre. Prix '+fmt(d.price)+'. Recrute jusqu’à '+d.max+' employés, fixe tes prix, réapprovisionne et encaisse les recettes. Les habitants qui passent ici deviennent tes clients.',[
    {label:'Acheter l’entreprise · '+fmt(d.price),off:!V31.afford(d.price),fn:()=>{if(!V31.pay(d.price))return;S[id]={own:1,lvl:1,staff:[],stock:70,price:1,till:0,rep:50,lastH:hourNow(),cust:0};save();BZ.sync();toast('Tu es propriétaire de '+d.n+' ! Recrute ton équipe.','good');BZ.panel(id,here);}},
    {label:'Mes entreprises',fn:()=>V31.bizList()}]);return;}
  const restock=Math.round((100-b.stock)*d.unit*(b.lvl||1));const nxt=b.lvl<3?Math.round(d.price*.6*b.lvl):0;
  openPanel(d.n+' · niveau '+b.lvl,'Caisse '+fmt(b.till)+' · stock '+Math.round(b.stock)+' % · réputation '+Math.round(b.rep)+'/100 · prix '+(b.price<1?'bas':b.price>1?'premium':'normal')+' · dernière heure '+fmt(b.hrev||0)+'. Équipe '+b.staff.length+'/'+d.max+' · masse salariale '+fmt(b.staff.reduce((a,p)=>a+p.w,0))+'/jour.',[
    {label:'Encaisser la caisse · '+fmt(b.till),off:b.till<1,fn:()=>{state.cash+=Math.round(b.till);state.earned=(state.earned||0)+Math.round(b.till);toast('+'+fmt(b.till)+' encaissés.','good');b.till=0;save();BZ.panel(id,here);}},
    {label:'Réapprovisionner · '+fmt(restock),off:b.stock>=99||!V31.afford(restock),fn:()=>{if(!V31.pay(restock))return;b.stock=100;save();toast('Stock plein.','good');BZ.panel(id,here);}},
    {label:'Recruter ('+b.staff.length+'/'+d.max+')',off:b.staff.length>=d.max,fn:()=>hire(id,here)},
    {label:'Gérer l’équipe',off:!b.staff.length,fn:()=>team(id,here)},
    {label:'Prix : '+(b.price<1?'bas → normal':b.price>1?'premium → bas':'normal → premium'),fn:()=>{b.price=b.price<1?1:b.price>1?.85:1.2;save();BZ.panel(id,here);}},
    nxt?{label:'Agrandir (niveau '+(b.lvl+1)+') · '+fmt(nxt),off:!V31.afford(nxt),fn:()=>{if(!V31.pay(nxt))return;b.lvl++;save();toast(d.n+' passe au niveau '+b.lvl+' : plus de clients.','good');BZ.panel(id,here);}}:null,
    here?{label:'Travailler toi-même (mini-jeu)',fn:()=>work(id)}:null,
    {label:'Revendre · '+fmt(d.price*.7*(b.lvl||1)),fn:()=>{state.bank+=Math.round(d.price*.7*(b.lvl||1)+b.till);delete S[id];save();BZ.sync();toast(d.n+' revendue.','warn');}}].filter(Boolean));};
function hire(id,here){const d=DEF[id],b=S[id],L=cand(id);
  openPanel('Recrutement · '+d.n,'Candidats du jour. Plus la note est haute, plus ils attirent de clients et améliorent ta réputation.',L.map((c,i)=>({label:c.n+' · '+c.r+' · '+stars(c.sk)+' · '+fmt(c.w)+'/jour',off:b.staff.length>=d.max,fn:()=>{b.staff.push(c);L.splice(i,1);save();BZ.sync();toast(c.n+' rejoint ton équipe comme '+c.r.toLowerCase()+'.','good');BZ.panel(id,here);}})).concat([{label:'Retour',fn:()=>BZ.panel(id,here)}]));}
function team(id,here){const b=S[id];openPanel('Équipe · '+DEF[id].n,'Augmenter un salaire fidélise ; licencier libère un poste.',b.staff.map((c,i)=>({label:c.n+' · '+c.r+' · '+stars(c.sk)+' · '+fmt(c.w)+'/j · former (+1★) '+fmt(c.sk<5?200*c.sk:0),off:c.sk>=5||!V31.afford(200*c.sk),fn:()=>{if(!V31.pay(200*c.sk))return;c.sk++;c.w+=8;save();toast(c.n+' a suivi une formation.','good');team(id,here);}})).concat(b.staff.map((c,i)=>({label:'Licencier '+c.n,fn:()=>{b.staff.splice(i,1);save();BZ.sync();toast(c.n+' quitte l’entreprise.','warn');team(id,here);}}))).concat([{label:'Retour',fn:()=>BZ.panel(id,here)}]));}
V31.bizList=function(){openPanel('Mes entreprises','Achète des commerces, recrute, encaisse. Gestion à distance possible depuis le téléphone.',Object.keys(DEF).map(id=>({label:(own(id)?'✓ '+DEF[id].n+' · caisse '+fmt(S[id].till):DEF[id].n+' · à vendre '+fmt(DEF[id].price)),fn:()=>{if(own(id))BZ.panel(id,false);else{const P=V31.places[id]||V31.places[DEF[id].store?'mall':id];if(P){wp={x:P.ex,z:P.ez,l:DEF[id].n};toast('Repère placé : '+DEF[id].n,'good');}}}})));};
/* employés visibles */
BZ.npcs=[];
BZ.sync=function(){BZ.npcs.forEach(o=>{if(o.m.parent)o.m.parent.remove(o.m);});BZ.npcs=[];
  Object.keys(S).forEach(id=>{const b=S[id],d=DEF[id];if(!b.own)return;b.staff.forEach((c,i)=>{const m=makePerson(d.shirt,0x1c1c1c,c.s||pick(SKINS),c.hr||pick(HAIRS),{top:'long',bottom:'pantalon',bag:false,style:pick(['court','chignon','ras','queue'])});
    if(d.inPos&&V31.mall){const p=d.inPos[i%d.inPos.length];m.position.set(p[0],.1,p[1]);m.rotation.y=p[1]<0?0:Math.PI;V31.mall.G.add(m);}
    else if(d.pos){const p=d.pos[i%d.pos.length];m.position.set(p[0],.12,p[1]);m.rotation.y=id==='truck'?-Math.PI/2:0;scene.add(m);}
    BZ.npcs.push({m,id,ph:rand(0,6),bx:m.position.x,bz:m.position.z});});});};
BZ.anim=function(dt){const t=performance.now()*.001;BZ.npcs.forEach(o=>{if(!o.m.parent||!o.m.parent.visible)return;if(o.m.parent===scene&&Math.hypot(o.bx-camera.position.x,o.bz-camera.position.z)>120)return;
  if(o.id==='mama'||o.id==='motors'){o.ph+=dt*.4;const x=o.bx+Math.sin(o.ph)*1.4,z=o.bz+Math.cos(o.ph*.8)*.6;o.m.rotation.y=Math.atan2(x-o.m.position.x,z-o.m.position.z)||o.m.rotation.y;o.m.position.x=x;o.m.position.z=z;animPerson(o.m,t*3,.25,false);}else animPerson(o.m,t+o.ph,0,false);});};
/* application téléphone */
function appBiz(b){const ids=Object.keys(DEF).filter(own);
  if(!ids.length){b.appendChild(mk('p','dim','Aucune entreprise. Rachète un commerce : Mama Adjo, le marché, le food truck, les boutiques des Palmiers ou Aurore Motors.'));return;}
  let tot=0;ids.forEach(id=>{const s=S[id];tot+=s.till;const c=mk('div','bigc');c.appendChild(mk('small',null,DEF[id].k+' · niveau '+s.lvl));const t=mk('b',null,DEF[id].n);c.appendChild(t);c.appendChild(mk('p','dim','Caisse '+fmt(s.till)+' · stock '+Math.round(s.stock)+' % · '+s.staff.length+' employé(s) · réputation '+Math.round(s.rep)));b.appendChild(c);
    b.appendChild(mk('button','pbtn','Virer la caisse sur mon compte (frais 5 %)',()=>{state.bank+=Math.round(s.till*.95);s.till=0;save();phOpen(phApp);}));
    b.appendChild(mk('button','pbtn','Commander le réassort ('+fmt(Math.round((100-s.stock)*DEF[id].unit*s.lvl))+')',()=>{const c2=Math.round((100-s.stock)*DEF[id].unit*s.lvl);if(state.bank+state.cash<c2){toast('Fonds insuffisants.','bad');return;}takeMoney(c2);s.stock=100;save();phOpen(phApp);}));});
  b.insertBefore(mk('p','dim','Total en caisse : '+fmt(tot)),b.firstChild);}
try{APPS.splice(Math.max(0,APPS.length-1),0,['Business','🏢','#ffd27a,#c8693f',appBiz]);}catch(e){}
})();
'use strict';
(function(){
const V31=window.V31;
/* graphe piéton des nouveaux quartiers */
const N=[[-300,-300],[-160,-300],[-32,-300],[96,-300],[220,-300],[300,-300],[-300,-640],[-230,-640],[-160,-640],[-32,-640],[56,-640],[96,-640],[165,-640],[220,-640],[300,-640],
  [220,-340],[220,-382],[220,-424],[220,-466],[220,-508],[220,-550],[220,-592],
  [300,-470],[300,-610],[390,-470],[510,-470],[650,-470],[390,-610],[510,-610],[650,-610],[300,-268],[300,-218],[300,-168],[300,-118]];
const E=[[0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[1,8],[2,9],[3,11],
  [4,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,13],[5,22],[22,23],[23,14],[22,24],[24,25],[25,26],[23,27],[27,28],[28,29],[5,30],[30,31],[31,32],[32,33]];
const ADJ=N.map(()=>[]);E.forEach(([a,b])=>{ADJ[a].push(b);ADJ[b].push(a);});
function route(a,b){if(a===b)return [a];const prev=new Array(N.length).fill(-1),q=[a];prev[a]=a;while(q.length){const u=q.shift();if(u===b)break;ADJ[u].forEach(v=>{if(prev[v]<0){prev[v]=u;q.push(v);}});}
  if(prev[b]<0)return [a];const p=[b];let u=b;while(u!==a){u=prev[u];p.unshift(u);}return p;}
const PL=V31.places;
function place(id,o){PL[id]=Object.assign({id,ex:o.e[0],ez:o.e[1]},o);return PL[id];}
V31.buildPlaces=function(){
  V31.villas.forEach(v=>place(v.id,{type:'home',n:15+Math.floor(v.i/2),e:[v.x,v.z],area:{x:v.area.c[0],z:v.area.c[1],r:3.5},show:.35,villa:v}));
  V31.apts.forEach(a=>place('apt'+a.i,{type:'home',n:30+(3-a.i),e:[312,a.z],area:{x:322,z:a.z,r:3},show:.25}));
  place('mall',{type:'shop',n:7,e:[-230,-650],inside:1,biz:['mode','tech','arcade']});
  place('motors',{type:'shop',n:9,e:[-40,-651],area:{x:-40,z:-664,r:12},show:1,biz:['motors']});
  place('marche',{type:'shop',n:10,e:[38,-651],area:{x:38,z:-656,r:5},show:1,biz:['marche']});
  place('mama',{type:'food',n:10,e:[76,-650],area:{x:76,z:-656,r:4},show:1,biz:['mama']});
  place('foot',{type:'sport',n:12,e:[165,-651],area:{x:165,z:-677,r:4},show:1,play:{x:165,z:-700,hx:20,hz:12}});
  place('basket',{type:'sport',n:13,e:[226,-651],area:{x:240,z:-668,r:6},show:1,play:{x:240,z:-678,hx:12,hz:6}});
  place('truck',{type:'food',n:12,e:[190,-651],area:{x:198,z:-700,r:2.5},show:1,biz:['truck']});
  place('cinema',{type:'fun',n:24,e:[390,-488],inside:1});place('galerie',{type:'shop',n:25,e:[510,-488],inside:1});
  place('campus',{type:'work',n:26,e:[650,-486],area:{x:650,z:-492,r:5},show:.5});
  place('caserne',{type:'work',n:27,e:[390,-636],area:{x:385,z:-645,r:6},show:.6});place('commissariat',{type:'work',n:28,e:[510,-636],inside:1});place('musee',{type:'fun',n:29,e:[650,-636],inside:1});
};
const ROLES=[['employé','motors'],['employé','mall'],['employé','mall'],['employé','marche'],['employé','mama'],['employé','caserne'],['employé','commissariat'],['employé','galerie'],['employé','campus'],['étudiant','campus'],['étudiant','campus'],['sportif','foot'],['sportif','basket'],['retraité',null],['cadre','galerie'],['cadre','motors']];
V31.buildAgents=function(){
  const homes=Object.values(PL).filter(p=>p.type==='home'&&!(p.villa&&p.villa.rent));
  for(let i=0;i<52;i++){const r=ROLES[i%ROLES.length],home=homes[i%homes.length],work=r[1]?PL[r[1]]:null;
    const fem=Math.random()<.5,m=makePerson(r[0]==='employé'&&work===PL.caserne?0xc82d25:r[0]==='employé'&&work===PL.commissariat?0x1d3f7a:r[0]==='sportif'?pick([0xf5c400,0x2e6fd1,0xd94f4f,0xffffff]):pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{style:fem?pick(['long','chignon','queue','afro']):pick(['court','ras','afro','casquette']),top:r[0]==='cadre'?'veste':pick(['tee','long','sweat','tee']),bottom:r[0]==='sportif'?'short':fem&&Math.random()<.4?'jupe':'pantalon',bag:r[0]==='étudiant'||Math.random()<.2});
    m.visible=false;scene.add(m);
    const a={m,role:r[0],home,work,cur:home,st:'hidden',until:0,path:[],pi:0,x:home.ex,z:home.ez,h:0,sp:rand(1.25,1.7),side:i%2?1:-1,ph:rand(0,6),wt:0,tx:0,tz:0,run:false,i};
    V31.agents.push(a);plan(a,true);}
};
const H=()=>(gameMin/60)%24;
function choose(a){const h=H(),r=a.role;
  if(h>=22.5||h<6.5)return [a.home,rand(300,520)];
  if(a.work&&(r==='employé'||r==='cadre')&&h>=7.5&&h<17)return [a.work,(17-h)*60+rand(0,30)];
  if(r==='étudiant'&&h>=8&&h<15)return [a.work,(15-h)*60];
  if(r==='sportif'&&h>=7&&h<21&&Math.random()<.7)return [a.work,rand(60,150)];
  const opts=h<11?[['marche',3],['mama',1],['motors',1],['foot',1],['campus',1]]:h<17?[['mall',3],['marche',2],['mama',2],['truck',1],['basket',1],['foot',1],['motors',1],['musee',1]]:[['mall',3],['mama',3],['truck',2],['cinema',2],['basket',2],['foot',2],['marche',1],['motors',1]];
  let tot=opts.reduce((s,o)=>s+o[1],0),x=Math.random()*tot;for(const o of opts){x-=o[1];if(x<=0)return [PL[o[0]],rand(40,130)];}return [PL.mall,60];}
function areaPt(p){const A=p.play&&Math.random()<.6?p.play:null;if(A)return [A.x+rand(-A.hx,A.hx),A.z+rand(-A.hz,A.hz),true];const r=p.area||{x:p.ex,z:p.ez,r:1.5};const an=rand(0,6.28),d=Math.sqrt(Math.random())*r.r;return [r.x+Math.cos(an)*d,r.z+Math.sin(an)*d,false];}
function plan(a,init){const [p,dur]=choose(a);
  if(init){a.cur=p;a.until=gameMin+dur*rand(.3,1);arrive(a,true);return;}
  if(p===a.cur){a.until=gameMin+dur;return;}
  const o=8*a.side,pts=[[a.cur.ex,a.cur.ez]];route(a.cur.n,p.n).forEach(n=>pts.push([N[n][0]+o,N[n][1]+o]));pts.push([p.ex,p.ez]);
  a.path=pts;a.pi=0;a.dest=p;a.dur=dur;a.st='walk';a.run=false;a.m.visible=true;
  if(a.wasHidden){a.x=a.cur.ex;a.z=a.cur.ez;a.wasHidden=false;}}
function arrive(a,init){const p=a.dest||a.cur;a.cur=p;if(!init)a.until=gameMin+(a.dur||60);
  if(a.cur.biz&&!init)a.cur.biz.forEach(id=>V31.biz.visit&&V31.biz.visit(id));
  const show=!p.inside&&Math.random()<(p.show==null?1:p.show);
  if(!show){a.st='hidden';a.m.visible=false;a.wasHidden=true;a.x=p.ex;a.z=p.ez;return;}
  a.st='stay';const q=areaPt(p);if(init){a.x=q[0];a.z=q[1];}a.tx=q[0];a.tz=q[1];a.run=q[2]&&(a.role==='sportif'||Math.random()<.3);a.wt=0;}
const busy=()=>V31.match&&V31.match.zone;
V31.tickAgents=function(dt){const cx=camera.position.x,cz=camera.position.z,inside=!!player.inside,t=performance.now()*.001;
  V31.agents.forEach(a=>{
    if(a.st==='hidden'){if(gameMin>=a.until)plan(a);return;}
    const near=Math.abs(a.x-cx)<120&&Math.abs(a.z-cz)<120;let sp=0,tx,tz;
    if(a.st==='walk'){const p=a.path[a.pi];tx=p[0];tz=p[1];sp=near?a.sp:9;}
    else{if(gameMin>=a.until){if(a.cur.play)a.run=false;plan(a);return;}
      const M=busy();if(M&&a.cur.play&&Math.abs(a.tx-M.x)<M.hx+2&&Math.abs(a.tz-M.z)<M.hz+2){const q=a.cur.area;a.tx=q.x+rand(-q.r,q.r);a.tz=q.z+rand(-1,1);a.run=false;}
      tx=a.tx;tz=a.tz;sp=a.run?3.6:.9;}
    const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);
    if(d<.35){if(a.st==='walk'){a.pi++;if(a.pi>=a.path.length)arrive(a);}else{a.wt+=dt;if(a.wt>(a.run?.2:rand(2,6))){const q=areaPt(a.cur);a.tx=q[0];a.tz=q[1];a.run=q[2]&&(a.role==='sportif'||Math.random()<.3);a.wt=0;}}sp=0;}
    else{const s=Math.min(d,sp*dt);a.x+=dx/d*s;a.z+=dz/d*s;a.h+=angDiff(a.h,Math.atan2(dx,dz))*Math.min(1,8*dt);}
    if(near&&!player.car&&Math.hypot(player.x-a.x,player.z-a.z)<.75){const ux=a.x-player.x,uz=a.z-player.z,l=Math.hypot(ux,uz)||1;a.x+=ux/l*.05;a.z+=uz/l*.05;}
    if(player.car&&near){const c=player.car;if(Math.abs(c.v)>4&&Math.hypot(c.x-a.x,c.z-a.z)<2.4){const ux=a.x-c.x,uz=a.z-c.z,l=Math.hypot(ux,uz)||1;a.x+=ux/l*2;a.z+=uz/l*2;if(!a.yell||t>a.yell){a.yell=t+6;say(a.m,pick(['Hé ! Doucement !','Tu vas tuer quelqu’un !','Regarde la route !']),2.5);}}}
    const vis=near&&!inside;a.m.visible=vis;if(!vis)return;
    a.m.position.set(a.x,.1,a.z);a.m.rotation.y=a.h;
    if(sp>0){a.ph+=dt*sp*(a.run?1.9:2.3);animPerson(a.m,a.ph,a.run?.85:.45,a.run);}else{const cheer=a.cur&&a.cur.play&&V31.match&&a.st==='stay';if(cheer){const u=a.m.userData;u.armL.rotation.x=u.armR.rotation.x=-2.6+Math.sin(t*6+a.i)*.4;}else animPerson(a.m,t+a.ph,0,false);}
  });};
V31.agentTalk=function(){if(player.car||player.inside)return false;let best=null,bd=2.2;V31.agents.forEach(a=>{if(!a.m.visible)return;const d=Math.hypot(a.x-player.x,a.z-player.z);if(d<bd){bd=d;best=a;}});
  if(!best)return false;const r=best.role,w=best.work;const L={employé:'Je bosse '+(w?(w.id==='mall'?'aux Palmiers':w.id==='motors'?'chez Aurore Motors':w.id==='mama'?'chez Mama Adjo':'à '+w.id):'en ville')+'. Grosse journée !',cadre:'Réunion après réunion… Tu as vu les nouvelles villas du Belvédère ?',étudiant:'Je sors de la fac, je vais au terrain de basket.',sportif:'Tu joues ? On se fait un match au parc sportif !',retraité:'Le poisson est frais au marché de la Lagune ce matin.'};
  best.h=Math.atan2(player.x-best.x,player.z-best.z);say(best.m,L[r]||'Salut !',4);best.wt=-3;up31('fun',3);return true;};
const up31=(k,v)=>V31.up(k,v);
})();
'use strict';
(function(){
const V31=window.V31;
let hud=null;
function HUD(t){if(!hud){hud=document.createElement('div');hud.id='m31hud';hud.style.cssText='position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:40;background:rgba(8,12,18,.82);color:#fff;font:600 17px Rajdhani,Arial Narrow,sans-serif;padding:8px 18px;border-radius:12px;letter-spacing:.3px;text-align:center;pointer-events:none;box-shadow:0 6px 24px rgba(0,0,0,.35)';document.body.appendChild(hud);}hud.hidden=!t;if(t)hud.innerHTML=t;}
const ballMat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5});
function ballMesh(r,c){const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,14),c?new THREE.MeshStandardMaterial({color:c,roughness:.6}):ballMat);m.castShadow=true;scene.add(m);
  if(!c){const s=new THREE.Mesh(new THREE.IcosahedronGeometry(r*1.005,0),new THREE.MeshBasicMaterial({color:0x111111,wireframe:true}));m.add(s);}return m;}
function npc(x,z,shirt,o){const m=makePerson(shirt,o&&o.p||0x1c1c1c,pick(SKINS),pick(HAIRS),Object.assign({top:'tee',bottom:'short',bag:false,style:pick(['court','ras','afro'])},o||{}));m.position.set(x,.1,z);scene.add(m);return {m,x,z,h:0,ph:rand(0,6),cd:0};}
function move(n,tx,tz,sp,dt){const dx=tx-n.x,dz=tz-n.z,d=Math.hypot(dx,dz);let mv=0;if(d>.15){const s=Math.min(d,sp*dt);n.x+=dx/d*s;n.z+=dz/d*s;n.h+=angDiff(n.h,Math.atan2(dx,dz))*Math.min(1,10*dt);mv=s/Math.max(dt,1e-3);}
  n.m.position.set(n.x,.1+(n.jump||0),n.z);n.m.rotation.y=n.h;if(mv>.3){n.ph+=dt*mv*2;animPerson(n.m,n.ph,Math.min(.9,.3+mv/7),mv>4.5);}else animPerson(n.m,performance.now()*.002+n.ph,0,false);return d;}
function physics(b,dt,R,floor){b.vy-=18*dt;b.y+=b.vy*dt;if(b.y<R){b.y=R;if(b.vy<-1.5)b.vy=-b.vy*(floor||.5);else b.vy=0;}
  const k=Math.exp(-(b.y<=R+.02?1.2:.12)*dt);b.vx*=k;b.vz*=k;b.x+=b.vx*dt;b.z+=b.vz*dt;}
const face=()=>[Math.sin(player.h),Math.cos(player.h)];
function finishMatch(win,txt){const M=V31.match;if(!M)return;[...M.npcs].forEach(n=>scene.remove(n.m));scene.remove(M.ball.m);HUD(null);V31.match=null;
  V31.up('fun',win?30:16);V31.up('energy',-12);state.rep+=win?2:1;if(win)state.cash+=50;
  openPanel(win?'Victoire !':'Fin du match',txt+(win?' Prime de victoire : '+fmt(50)+'. Réputation +2.':' Réputation +1. Retente ta chance !'),[{label:'Rejouer',fn:()=>M.again()}]);}
V31.matchClamp=function(){const M=V31.match;if(!M)return;const Z=M.zone;player.x=clamp(player.x,Z.x-Z.hx-1.5,Z.x+Z.hx+1.5);player.z=clamp(player.z,Z.z-Z.hz-1.5,Z.z+Z.hz+1.5);};
/* ===================== FOOTBALL À 5 ===================== */
V31.startFoot=function(){if(V31.match)return;if(player.car){toast('Descends de voiture.','warn');return;}
  const c={x:165,z:-700},Z={x:c.x,z:c.z,hx:22,hz:14},GW=1.6;
  const M={kind:'foot',zone:Z,t:150,sc:[0,0],npcs:[],again:V31.startFoot,pause:0};
  M.ball={m:ballMesh(.22),x:c.x,y:.22,z:c.z,vx:0,vy:0,vz:0};
  M.mate=npc(c.x-8,c.z+5,0x2e6fd1);M.gk1=npc(c.x-21,c.z,0x1d3f7a,{top:'long'});M.o1=npc(c.x+4,c.z-2,0xd94f4f);M.o2=npc(c.x+10,c.z+4,0xd94f4f);M.gk2=npc(c.x+21,c.z,0x7a1f1f,{top:'long'});
  M.npcs=[M.mate,M.gk1,M.o1,M.o2,M.gk2];[M.o1,M.o2,M.gk2].forEach(n=>n.team=2);[M.mate,M.gk1].forEach(n=>n.team=1);
  player.x=c.x-3;player.z=c.z;player.h=Math.PI/2;camYaw=Math.PI/2;
  M.reset=(toOpp)=>{M.ball.x=c.x+(toOpp?1.2:-1.2);M.ball.z=c.z;M.ball.y=.22;M.ball.vx=M.ball.vy=M.ball.vz=0;player.x=c.x-3;player.z=c.z;M.mate.x=c.x-8;M.mate.z=c.z+5;M.o1.x=c.x+4;M.o1.z=c.z-2;M.o2.x=c.x+10;M.o2.z=c.z+4;M.pause=1.2;};
  M.owner=null;M.pv=[0,0];M.lp=[player.x,player.z];
  M.act=()=>{const b=M.ball,d=Math.hypot(b.x-player.x,b.z-player.z);if(d>1.7){toast('Approche-toi du ballon.','');return;}
    const f=face(),gx=Z.x+Z.hx-b.x,gz=Z.z-b.z,gl=Math.hypot(gx,gz)||1,ax=f[0]*.72+gx/gl*.28,az=f[1]*.72+gz/gl*.28,al=Math.hypot(ax,az)||1,run=keys.shift||running||(window.GP19&&GP19.on&&GP19.run);
    const pw=run?24:20;b.vx=ax/al*pw;b.vz=az/al*pw;b.vy=3.4;M.pcd=.45;M.owner=null;try{tone&&tone(180,.08,'triangle',.08);}catch(e){}};
  M.tick=dt=>{const b=M.ball;M.t-=dt;
    const pvx=(player.x-M.lp[0])/Math.max(dt,1e-3),pvz=(player.z-M.lp[1])/Math.max(dt,1e-3);M.lp=[player.x,player.z];M.pcd=Math.max(0,(M.pcd||0)-dt);
    if(M.pause>0){M.pause-=dt;}
    const dp=Math.hypot(b.x-player.x,b.z-player.z);
    // contrôle du joueur
    if(M.pause<=0&&dp<.95&&M.pcd<=0&&b.y<.8){const f=face();const tx=player.x+f[0]*.7,tz=player.z+f[1]*.7;b.x+=(tx-b.x)*Math.min(1,12*dt);b.z+=(tz-b.z)*Math.min(1,12*dt);b.vx=pvx;b.vz=pvz;M.owner='p';}
    else if(M.owner==='p')M.owner=null;
    // IA
    const tgt=(n,x,z,sp)=>move(n,x,z,sp,dt);
    const opps=[M.o1,M.o2].sort((a,q)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(q.x-b.x,q.z-b.z));
    if(M.pause<=0){
      const ch=opps[0];const dch=tgt(ch,b.x,b.z,5.6);
      tgt(opps[1],(b.x+Z.x-Z.hx)/2+6,clamp(b.z+(b.z>Z.z?-5:5),Z.z-Z.hz+1,Z.z+Z.hz-1),4.6);
      if(dch<.85&&ch.cd<=0&&b.y<.8){
        if(M.owner==='p'&&Math.random()<dt*1.6){b.vx=rand(-5,-9);b.vz=rand(-6,6);ch.cd=.8;M.pcd=.5;}
        else if(M.owner!=='p'){const gx=Z.x-Z.hx-b.x,gz=Z.z+rand(-1.4,1.4)-b.z;if(Math.abs(gx)<14||Math.random()<dt*.6){const l=Math.hypot(gx,gz);b.vx=gx/l*18;b.vz=gz/l*18;b.vy=2.6;ch.cd=.9;}else{b.vx=-5;b.vz=(Z.z-b.z)*.2;ch.cd=.15;}}}
      ch.cd-=dt;opps[1].cd-=dt;
      const dm=Math.hypot(M.mate.x-b.x,M.mate.z-b.z),go=dm+2<dp;tgt(M.mate,go?b.x:clamp(b.x-6,Z.x-Z.hx+4,Z.x+Z.hx-2),go?b.z:clamp(b.z+(b.z>Z.z?-6:6),Z.z-Z.hz+1,Z.z+Z.hz-1),5.2);
      if(dm<.85&&M.mate.cd<=0&&b.y<.8){const toGoal=Z.x+Z.hx-b.x<12,tx=toGoal?Z.x+Z.hx:player.x,tz=toGoal?Z.z+rand(-1.3,1.3):player.z,l=Math.hypot(tx-b.x,tz-b.z)||1;b.vx=(tx-b.x)/l*(toGoal?19:12);b.vz=(tz-b.z)/l*(toGoal?19:12);b.vy=toGoal?2.4:.6;M.mate.cd=1;}M.mate.cd-=dt;
      [[M.gk1,Z.x-Z.hx+.7,1],[M.gk2,Z.x+Z.hx-.7,-1]].forEach(([g,gx,dir])=>{tgt(g,gx,clamp(b.z,Z.z-GW+.2,Z.z+GW-.2),4.2);const d=Math.hypot(g.x-b.x,g.z-b.z);if(d<1.15&&b.y<2&&g.cd<=0&&Math.random()<.78){b.vx=dir*rand(12,16);b.vz=rand(-7,7);b.vy=3;g.cd=1;toast('Arrêt du gardien !','');}g.cd-=dt;});
    }else M.npcs.forEach(n=>move(n,n.x,n.z,0,dt));
    physics(b,dt,.22,.5);
    if(Math.abs(b.z-Z.z)>Z.hz){b.z=Z.z+Math.sign(b.z-Z.z)*Z.hz;b.vz*=-.6;}
    if(Math.abs(b.x-Z.x)>Z.hx){const s=Math.sign(b.x-Z.x);if(Math.abs(b.z-Z.z)<GW&&b.y<2.05){M.sc[s>0?0:1]++;toast(s>0?'⚽ BUUUT ! Score '+M.sc[0]+' - '+M.sc[1]:'But adverse… '+M.sc[0]+' - '+M.sc[1],s>0?'good':'bad');M.reset(s>0);}else{b.x=Z.x+s*Z.hx;b.vx*=-.6;}}
    b.m.position.set(b.x,b.y,b.z);b.m.rotation.x+=b.vz*dt*3;b.m.rotation.z-=b.vx*dt*3;
    HUD('⚽ <b>Port-Aurore '+M.sc[0]+' – '+M.sc[1]+' Visiteurs</b> · '+Math.floor(M.t/60)+':'+String(Math.floor(M.t%60)).padStart(2,'0')+'<br><small>Stick / ZQSD : bouger · Maj / RT : sprint · E / A : frapper · Échap : abandonner</small>');
    if(M.t<=0||M.sc[0]>=5||M.sc[1]>=5)finishMatch(M.sc[0]>M.sc[1],'Score final : '+M.sc[0]+' – '+M.sc[1]+'.');};
  V31.match=M;toast('Coup d’envoi ! Tu attaques vers la droite (cage rouge).','good');
};
/* ===================== BASKET 1 CONTRE 1 ===================== */
V31.startBasket=function(ci){if(V31.match)return;if(player.car){toast('Descends de voiture.','warn');return;}
  const C=V31.courts[ci||0],Z={x:C.x,z:C.z,hx:14,hz:7.5},HX=C.hoopX,HY=C.hoopY,HZ=C.z;
  const M={kind:'basket',zone:Z,t:150,sc:[0,0],npcs:[],again:()=>V31.startBasket(ci),state:'p',cd:0};
  M.ball={m:ballMesh(.12,0xe0601f),x:0,y:1,z:0,vx:0,vy:0,vz:0};M.d=npc(HX-4,HZ,0xd94f4f,{top:'tee'});M.npcs=[M.d];
  player.x=C.x+1;player.z=HZ;player.h=Math.PI/2;camYaw=Math.PI/2;
  const checkTo=w=>{const b=M.ball;b.vx=b.vz=b.vy=0;if(w==='p'){M.state='p';player.x=C.x+1;player.z=HZ;}else{M.state='n';M.d.x=C.x+1;M.d.z=HZ;}M.cd=.6;};
  const shoot=(fromX,fromZ,y0,ok,who)=>{const b=M.ball,d=Math.hypot(HX-fromX,HZ-fromZ);M.state='air';M.fl={x0:fromX,z0:fromZ,y0,x1:HX+(ok?0:rand(-.45,.45)),z1:HZ+(ok?0:rand(-.45,.45)),T:.55+d*.045,t:0,ok,who,pts:d>6.75?3:2,h:1.1+d*.16};};
  M.act=()=>{const b=M.ball;
    if(M.state==='p'){const d=Math.hypot(HX-player.x,HZ-player.z),dd=Math.hypot(M.d.x-player.x,M.d.z-player.z),run=keys.shift||running||(window.GP19&&GP19.on&&GP19.run);
      const dunk=d<1.9&&run;let p=dunk?.9:clamp(.86-Math.max(0,d-1.2)*.058-(dd<1.5?.28:0)-(run?.1:0),.05,.9);if(dunk){M.jump=.6;}
      shoot(player.x,player.z,dunk?2.6:2.1,Math.random()<p,'p');if(dunk)toast('DUNK !','good');}
    else if(M.state==='n'){const dd=Math.hypot(M.d.x-player.x,M.d.z-player.z);if(dd<1.4&&M.cd<=0){if(Math.random()<.38){M.state='p';toast('Interception !','good');}else{M.cd=.9;toast('Raté…','');}}}
  };
  M.tick=dt=>{const b=M.ball,t=performance.now()*.001;M.t-=dt;M.cd-=dt;
    if(M.jump>0){M.jump-=dt;player.mesh.position.y=.1+Math.sin((.6-M.jump)/.6*Math.PI)*.9;}
    if(M.state==='p'){const f=face();b.x=player.x+f[0]*.35+f[1]*.3;b.z=player.z+f[1]*.35-f[0]*.3;b.y=.15+Math.abs(Math.sin(t*9))*.75;
      const ux=HX-player.x,uz=HZ-player.z,l=Math.hypot(ux,uz)||1;move(M.d,player.x+ux/l*1.3,player.z+uz/l*1.3,5,dt);}
    else if(M.state==='n'){const n=M.d,d=Math.hypot(HX-n.x,HZ-n.z);b.x=n.x+Math.sin(n.h)*.35;b.z=n.z+Math.cos(n.h)*.35;b.y=.15+Math.abs(Math.sin(t*8))*.75;
      const block=Math.hypot(player.x-n.x,player.z-n.z)<1.2;move(n,HX+(block?0:0),HZ+(block?rand(-3,3):0),block?2.6:4,dt);
      if(d<4.8&&M.cd<=0&&Math.random()<dt*1.4){const con=Math.hypot(player.x-n.x,player.z-n.z)<1.4;shoot(n.x,n.z,2.1,Math.random()<(con?.25:.52),'n');}}
    else if(M.state==='air'){const F=M.fl;F.t+=dt/F.T;const k=Math.min(1,F.t);b.x=F.x0+(F.x1-F.x0)*k;b.z=F.z0+(F.z1-F.z0)*k;b.y=F.y0+(HY+.15-F.y0)*k+4*F.h*k*(1-k);
      if(M.state==='air'&&F.who==='p')move(M.d,M.d.x,M.d.z,0,dt);else move(M.d,HX-3,HZ,3,dt);
      if(F.t>=1){if(F.ok){M.sc[F.who==='p'?0:1]+=F.pts;toast(F.who==='p'?'🏀 Panier ! +'+F.pts+' · '+M.sc[0]+' - '+M.sc[1]:'Panier adverse… '+M.sc[0]+' - '+M.sc[1],F.who==='p'?'good':'bad');b.x=HX;b.z=HZ;b.y=HY-.1;b.vx=b.vz=0;b.vy=-1;M.state='drop';M.next=F.who==='p'?'n':'p';}
        else{b.vx=rand(-5,-2);b.vz=rand(-3,3);b.vy=3;M.state='free';}}}
    else if(M.state==='drop'){physics(b,dt,.12,.55);if(b.y<.4){checkTo(M.next);}}
    else if(M.state==='free'){physics(b,dt,.12,.62);if(Math.abs(b.z-Z.z)>Z.hz){b.z=Z.z+Math.sign(b.z-Z.z)*Z.hz;b.vz*=-.6;}if(Math.abs(b.x-Z.x)>Z.hx){b.x=Z.x+Math.sign(b.x-Z.x)*Z.hx;b.vx*=-.6;}
      move(M.d,b.x,b.z,4.6,dt);if(b.y<1.4){if(Math.hypot(b.x-player.x,b.z-player.z)<.9)M.state='p';else if(Math.hypot(b.x-M.d.x,b.z-M.d.z)<.8){M.state='n';M.cd=.4;}}}
    b.m.position.set(b.x,b.y,b.z);b.m.rotation.x+=dt*6;
    HUD('🏀 <b>Toi '+M.sc[0]+' – '+M.sc[1]+' Kenzo</b> · premier à 11 · '+Math.floor(M.t/60)+':'+String(Math.floor(M.t%60)).padStart(2,'0')+'<br><small>Bouger : stick / ZQSD · Tirer : E / A (sprint près du panier = dunk) · Défense : E pour intercepter</small>');
    if(M.t<=0||M.sc[0]>=11||M.sc[1]>=11)finishMatch(M.sc[0]>M.sc[1],'Score final : '+M.sc[0]+' – '+M.sc[1]+'.');};
  V31.match=M;toast('1 contre 1 face à Kenzo. Attaque le panier de droite !','good');
};
V31.quitMatch=function(){const M=V31.match;if(!M)return;M.npcs.forEach(n=>scene.remove(n.m));scene.remove(M.ball.m);HUD(null);V31.match=null;if(player.mesh)player.mesh.position.y=.1;toast('Match abandonné.','warn');};
V31.tickMatch=function(dt){const M=V31.match;if(!M)return;if(paused||panelOpen)return;M.tick(Math.min(dt,.05));};
})();
'use strict';
(function(){
const V31=window.V31;
const once=(k,e)=>{if(!V31.err[k]){V31.err[k]=1;console.warn('v31 '+k,e);}};
const _bd=buildDecor;buildDecor=function(){_bd();
  try{V31.build();}catch(e){console.warn('v31 build',e);}
  try{V31.buildPlaces();}catch(e){console.warn('v31 places',e);}
  try{V31.buildInteriors();}catch(e){console.warn('v31 int',e);}
  try{V31.biz.sync();}catch(e){console.warn('v31 biz',e);}
  try{V31.buildAgents();}catch(e){console.warn('v31 agents',e);}
  try{const T={villa:['🏡','Maison'],apt:['🏢','Maison'],mall:['🛍️','Commerces'],motors:['🚗','Commerces'],car:['🚘','Commerces'],biz:['💼','Services'],foot:['⚽','Loisirs'],basket:['🏀','Loisirs'],truck:['🌭','Commerces']};
    POI['zone31:*']=['📍','Loisirs'];POI['zone30:*']=['🛒','Commerces'];spots.forEach(s=>{if(typeof s.id==='string'&&s.id.startsWith('zone31:')){const k=s.id.split(':')[1];if(T[k])POI[s.id]=T[k];}});}catch(e){}
};
let bt=0;
const _up=update;update=function(dt){_up(dt);if(!started)return;
  try{V31.tickAgents(dt);}catch(e){once('agents',e);}
  try{V31.tickInside(dt);}catch(e){once('inside',e);}
  try{V31.tickMatch(dt);}catch(e){once('match',e);}
  try{V31.tickTest(dt);}catch(e){once('test',e);}
  try{bt-=dt;if(bt<=0){bt=1;V31.biz.tick();}V31.biz.anim(dt);}catch(e){once('biz',e);}
  try{const t=performance.now()*.001;V31.disp.forEach(d=>{if(d.spin)d.m.rotation.y+=dt*d.spin;});
    const hh=(gameMin/60)%24,fv=hh>=9&&hh<21,foot=V31.match&&V31.match.kind==='foot';(V31.fans||[]).forEach(f=>{f.m.visible=fv;if(!fv||Math.abs(f.m.position.x-camera.position.x)>110||Math.abs(f.m.position.z-camera.position.z)>110)return;const u=f.m.userData;const a=foot?-2.5+Math.sin(t*5+f.ph)*.5:-.4+Math.sin(t*.8+f.ph)*.1;u.armL.rotation.x=u.armR.rotation.x=a;});
    V31.statics.forEach((s,i)=>{if(Math.abs(s.m.position.x-camera.position.x)<90&&Math.abs(s.m.position.z-camera.position.z)<90)animPerson(s.m,t+s.ph,0,false);});}catch(e){once('statics',e);}
};
const _upl=updatePlayer;updatePlayer=function(dt){_upl(dt);if(V31.match)V31.matchClamp();};
const _int=interact;interact=function(){
  if(V31.match){if(!paused&&!panelOpen&&!chatOpen)V31.match.act();return;}
  if(started&&!paused&&!panelOpen&&!chatOpen&&!player.inside&&!player.car&&!nearSpot&&!nearCar&&!nearPed){try{if(V31.agentTalk())return;}catch(e){}}
  _int();};
addEventListener('keydown',e=>{if(V31.match&&e.key==='Escape'&&!panelOpen){e.stopImmediatePropagation();V31.quitMatch();}},true);
const _os=openSpot;openSpot=function(id){
  if(typeof id==='string'&&id.startsWith('zone31:')){const a=id.split(':'),k=a[1],n=a[2];
    if(k==='villa')V31.villaPanel(+n);else if(k==='apt')V31.aptPanel(+n);else if(k==='mall')V31.enterMall();
    else if(k==='car')V31.carPanel(+n);else if(k==='motors')V31.catalog();else if(k==='biz')V31.bizPanel(n,true);
    else if(k==='foot')openPanel('Terrain de football à 5','Match en 3D sur le vrai terrain : tu contrôles ton joueur, ton coéquipier et les gardiens jouent avec toi. Premier à 5 buts ou 2 min 30.',[{label:'⚽ Jouer sur le terrain (3D)',fn:V31.startFoot},MG29.act('Version arcade rapide',0,'football',{id:'sport-foot30',title:'Football à 5',duration:50,replay:true,gain:{fun:20,energy:-10}})]);
    else if(k==='basket')openPanel('Terrain de basket '+(+n+1),'1 contre 1 en 3D face à Kenzo. Dribble, tire, dunke. Premier à 11 points.',[{label:'🏀 Jouer sur le terrain (3D)',fn:()=>V31.startBasket(+n)},MG29.act('Concours de tirs (arcade)',0,'basketball',{id:'sport-basket30',title:'Basket-ball',duration:45,replay:true,gain:{fun:18,energy:-8}})]);
    else if(k==='truck'){const h=(gameMin/60)%24;openPanel('Food truck du parc',(h>=11||h<1)?'Hot dogs, brochettes et boissons fraîches.':'Ouvre à 11 h.',[V31.buy('Hot dog',5,()=>{V31.up('hunger',28);}),V31.buy('Brochettes + alloco',9,()=>{V31.up('hunger',45);}),V31.buy('Soda frais',2,()=>{V31.up('thirst',30);}),{label:'Reprendre le food truck (entreprise)',fn:()=>V31.bizPanel('truck',true)}]);if(V31.biz.own('truck'))V31.biz.visit('truck');}
    return;}
  if(id==='zone30:mama'||id==='zone30:market'){_os(id);return;}
  _os(id);};
})();
