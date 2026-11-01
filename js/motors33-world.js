'use strict';
/* ==========================================================================
   v33 · QUARTIER AUTOMOBILE DE PORT-AURORE
   Aurore Motors Prestige (showroom vitré, portes automatiques, exposition
   extérieure, parkings clients et VIP, mezzanine, atelier de livraison & SAV,
   écrans de suivi), boulevard Aurore, piste d'essai chronométrée,
   Aurore Moto, Aurore Occasion et Aurore Exclusive.
   ========================================================================== */
(function(){
const AM=window.AM=window.AM||{};
const W=AM.W={displays:[],staff:{},clients:[],doors:[],screens:[],spots:[],trees:[]};
let P,GL,EM,NC;
const B=(x,y,z,w,h,d,c,ry,arr)=>b27(x,y,z,w,h,d,c,ry||0,arr||P);
const Cy=(x,y,z,r,h,c,arr)=>c27(x,y,z,r,h,c,arr||P);
const col=(x0,x1,z0,z1)=>col27(x0,x1,z0,z1,true);
const sign=(t,w,h,bg,fg,x,y,z,ry,o)=>{const s=sign27(t,w,h,bg,fg,o);s.position.set(x,y,z);s.rotation.y=ry||0;scene.add(s);return s;};
const tree=(x,z,s,t)=>W.trees.push({x,z,s:s||1.15,type:t||'palm',col:true});
AM.spot=function(x,z,id,c,label,o){o=o||{};const s=addSpot27(x,z,id,c,label,o.s||.5);if(o.indoor){s.b.visible=false;s.ring.scale.set(.42,1,.42);s.ring.material.transparent=true;s.ring.material.opacity=.55;}W.spots.push(s);return s;};
function removeSpot(fn){for(let i=spots.length-1;i>=0;i--){const s=spots[i];if(typeof s.id==='string'&&fn(s.id)){scene.remove(s.b);scene.remove(s.ring);spots.splice(i,1);}}}
/* ---------- texture animée pour les écrans de suivi ---------- */
AM.screen=function(w,h,px,draw){const c=document.createElement('canvas');c.width=px;c.height=Math.round(px*h/w);const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,toneMapped:false}));const S={m,c,g,t,draw};W.screens.push(S);return S;};
function person(sh,o){return makePerson(sh,o&&o.p||0x1c1d22,pick(SKINS),pick(HAIRS),Object.assign({top:'long',bottom:'pantalon',bag:false,style:pick(['court','chignon','ras','long','afro'])},o||{}));}
AM.staffAt=function(key,name,role,sh,x,z,h,o){const m=person(sh,o);m.position.set(x,(o&&o.y)||.22,z);m.rotation.y=h||0;scene.add(m);const S={key,name,role,m,x,z,h:h||0,ph:rand(0,6)};W.staff[key]=S;return S;};
/* ---------- voiture d'exposition (hors circulation) ---------- */
AM.display=function(model,color,x,y,z,ry,o){o=o||{};const m=makeCar(color,model.t);try{applyType(m,model.t);}catch(e){}m.position.set(x,y,z);m.rotation.y=ry;scene.add(m);
  const R=AMC.rig(m);if(R&&o.mods)AMC.apply(m,o.mods);(AMC.extra=AMC.extra||[]).push(m);
  const d={m,model,color,x,y,z,ry,spin:o.spin||0,line:o.line||model.line,slot:W.displays.length};W.displays.push(d);return d;};
AM.recolorDisplay=function(d,color){const keep=d.m.userData.rig33?Object.assign({},d.m.userData.rig33.state):null;const i=AMC.extra.indexOf(d.m);scene.remove(d.m);
  const m=makeCar(color,d.model.t);try{applyType(m,d.model.t);}catch(e){}m.position.copy(d.m.position);m.rotation.copy(d.m.rotation);scene.add(m);AMC.rig(m);if(keep)Object.assign(m.userData.rig33.state,keep);
  if(i>=0)AMC.extra[i]=m;else AMC.extra.push(m);d.m=m;d.color=color;};
/* ---------- piste d'essai ---------- */
const TR=AM.TRACK={cx:[-132,-48],cz:-738,r:14,zN:-724,zS:-752,cps:[[-90,-724],[-34,-738],[-90,-752],[-146,-738]]};
function track(){
  const asph=M27.asph,w=9;
  road27(-132,TR.zN,-48,TR.zN,w,{dash:false});road27(-132,TR.zS,-48,TR.zS,w,{dash:false});
  [[-48,1],[-132,-1]].forEach(([cx,sd])=>{const N=14;for(let i=0;i<N;i++){const a0=-Math.PI/2+i/N*Math.PI,a1=-Math.PI/2+(i+1)/N*Math.PI,x0=cx+sd*Math.cos(a0)*TR.r,z0=TR.cz+Math.sin(a0)*TR.r,x1=cx+sd*Math.cos(a1)*TR.r,z1=TR.cz+Math.sin(a1)*TR.r;
    road27(x0,z0,x1,z1,w,{dash:false});
    for(let k=0;k<2;k++){const t=(k+.5)/2,a=a0+(a1-a0)*t,ox=cx+sd*Math.cos(a)*(TR.r+w/2+.3),oz=TR.cz+Math.sin(a)*(TR.r+w/2+.3);B(ox,.12,oz,.9,.14,1.6,(i*2+k)%2?0xc8102e:0xf4f4f0,-sd*a);}}});
  for(let x=-130;x<=-50;x+=2.4){[TR.zN-5,TR.zN+5,TR.zS-5,TR.zS+5].forEach((z,k)=>B(x,.12,z,1.6,.14,.7,(Math.round(x/2.4)+k)%2?0xc8102e:0xf4f4f0));}
  B(-90,.09,-738,80,.04,14,0x3e7d43);sign(['PISTE D’ESSAI','AURORE MOTORS'],10,2.4,'#111316','#ffffff',-90,2.2,-738,0,{fg2:'#ff5a5a'});
  [-1,1].forEach(s=>{B(-90+s*5.6,3,TR.zN,.5,6,.5,0x15171a);});B(-90,6,TR.zN,11.7,.9,.6,0x15171a);
  const st=sign('START · FINISH',9,.8,'#c8102e','#ffffff',-90,6,TR.zN+.35,0);const st2=sign('START · FINISH',9,.8,'#c8102e','#ffffff',-90,6,TR.zN-.35,Math.PI);
  for(let i=0;i<12;i++)B(-90,.11,TR.zN-4+i*.7,1.2,.02,.35,i%2?0x111111:0xf4f4f4);
  road27(-90,-712,-90,TR.zN-4.5,8,{dash:false});
  for(let k=0;k<6;k++){const x=-115+k*5;B(x,.3+k*0,-758,4.2,.6,1,k%2?0xc8102e:0x2a2d31);}
  for(let t=0;t<3;t++)B(-90,.3+t*.45,-760.8+t*.0,24,.5+t*.45,.8,t%2?0xc8102e:0xd8dde2);col(-102,-78,-759.5,-758);
  [[-60,-731],[-120,-731],[-60,-745],[-120,-745]].forEach(([x,z])=>{for(let i=0;i<3;i++)Cy(x+i*1.2,.25,z,.18,.5,0xff6a13);});
  W27.zones.push({id:'track33',n:'Piste d’essai Aurore',s:'Essais chronométrés',x0:-150,x1:-30,z0:-758,z1:-718});
}
/* ---------- Aurore Motors Prestige : extérieur ---------- */
function prestigeOutside(){
  // boulevard et accès
  road27(-300,-712,132,-712,12,{lamps:30});road27(-130,-646,-130,-706,10,{lamps:20});
  // parking clients (ouest) + exposition extérieure
  B(-102,.075,-683,40,.04,32,0x34373c);
  for(let k=0;k<9;k++){B(-120+k*4.4,.1,-692,.12,.02,5.5,0xe8e8e0);B(-120+k*4.4,.1,-676,.12,.02,5.5,0xe8e8e0);}
  sign(['PARKING CLIENTS','Aurore Motors'],6,1.6,'#1e5fae','#ffffff',-123,2.6,-667,Math.PI/2,{fg2:'#cfe3ff'});Cy(-123,1.2,-667,.06,2.4,0x9aa1a8);
  B(-102,.075,-656,40,.04,14,0xd8d2c6);
  W.outdoor=[[-114,-655,.9],[-102,-655,0],[-90,-655,-.9]];
  W.outdoor.forEach(([x,z])=>{Cy(x,.18,z,3.3,.24,0xf4f4f0);Cy(x,.32,z,3.35,.04,0xc8102e);[-1,1].forEach(s=>{Cy(x+s*3.6,3,z-2.4,.05,6,0xd8dde2);B(x+s*3.6+.55*s*0,5.2,z-2.4,.04,1.8,1.1,0xc8102e,Math.PI/2);});});
  col(-118,-86,-659,-651);
  // totem lumineux
  B(-84,4.5,-645.5,2.4,9,1.2,0x15171a);B(-84,8.6,-644.85,2.2,.9,.04,0xc8102e,0,EM);
  sign(['AURORE','MOTORS'],2.1,3.6,'#c8102e','#ffffff',-84,5.4,-644.88,0,{fg2:'#ffffff'});sign(['AURORE','MOTORS'],2.1,3.6,'#c8102e','#ffffff',-84,5.4,-646.12,Math.PI,{fg2:'#ffffff'});col(-85.3,-82.7,-646.2,-644.8);
  // parking VIP doré + tapis rouge
  for(let k=0;k<5;k++)B(-60+k*4.6,.105,-649.4,.14,.02,5,0xc9a24a);B(-50.8,.1,-647,18.4,.02,.14,0xc9a24a);
  sign(['VIP','Places réservées'],2.6,1,'#111316','#c9a24a',-62,1.8,-646.5,0,{fg2:'#ffffff'});Cy(-62,.9,-646.5,.05,1.8,0xc9a24a);
  B(-40,.1,-648,4,.03,12,0x9c1020);[-1,1].forEach(s=>{for(let k=0;k<3;k++){Cy(-40+s*2.6,.5,-652+k*3,.05,1,0xc9a24a);}});
  // portes vitrées automatiques
  const gm=new THREE.MeshPhysicalMaterial({color:0xcfe6f2,roughness:.04,transparent:true,opacity:.28,depthWrite:false,side:THREE.DoubleSide});
  [-1,1].forEach(s=>{const m=new THREE.Mesh(new THREE.BoxGeometry(5,4.2,.08),gm);m.position.set(-40+s*2.5,2.3,-653.85);scene.add(m);const f=new THREE.Mesh(new THREE.BoxGeometry(5,.12,.12),sm(0x15171a,.5,.3));f.position.set(0,-2.06,0);m.add(f);W.doors.push({m,s,x0:-40+s*2.5,o:0});});
  B(-40,4.55,-653.9,10.4,.3,.3,0x15171a);sign('ENTRÉE',2.4,.5,'#15171a','#ffffff',-40,4.95,-653.7,0);
  W27.zones.push({id:'motors33',n:'Aurore Motors Prestige',s:'Showroom · essais · financement · SAV',x0:-124,x1:24,z0:-695,z1:-646});
}
/* ---------- intérieur du showroom ---------- */
function prestigeInside(){
  // mezzanine sur le côté est + escalier
  B(-10.5,4.6,-683,9.6,.35,20,0xf4f4f2);B(-15.25,5.3,-683,.06,1.05,20,0xbfe0ee,0,GL);B(-10.5,5.3,-672.9,9.6,1.05,.06,0xbfe0ee,0,GL);
  for(let k=0;k<12;k++)B(-13.2,.2+k*.38,-660-k*.9,2.6,.4,.9,0x2a2d31);B(-11.85,2.6,-665,.06,1,10.8,0xbfe0ee,0,GL);
  [-14.8,-6.2].forEach(x=>[-692,-674].forEach(z=>Cy(x,2.3,z,.15,4.6,0x15171a)));col(-15.3,-5.5,-693,-673.5);col(-14.6,-11.9,-671,-659);
  sign(['BUREAUX · FINANCEMENT','SALON VIP'],5,1.1,'#15171a','#ffffff',-13.2,6.4,-672.6,0,{fg2:'#c9a24a'});
  // espace de négociation (rez-de-chaussée, à côté de l'accueil)
  B(-31,.6,-660,1.8,.06,1.8,0xf4f4f2);Cy(-31,.3,-660,.08,.6,0x15171a);[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{B(-31+a*1.4,.45,-660+b*1.4,.6,.08,.6,0x2a2d31);B(-31+a*1.7,.8,-660+b*1.7,.6+(b?0:-.5),.7,.6+(a?0:-.5),0x2a2d31);});
  col(-32,-30,-661,-659);
  // écran de suivi géant au-dessus du podium
  const S=AM.screen(17,4.6,1024,AM.drawBoard||(()=>{}));S.m.position.set(-46,6.9,-693.5);scene.add(S.m);W.board=S;
  // éclairages de podium
  for(let i=0;i<5;i++){const x=-67+i*11;B(x,8.6,-684,.5,.25,.5,0x15171a);B(x,8.45,-684,.4,.04,.4,0xffffff,0,EM);}
}
/* ---------- atelier de livraison & SAV ---------- */
function workshop(){
  const x0=1,x1=23,z0=-694,z1=-678,cx=12;
  B(cx,.08,(z0+z1)/2,22,.04,16,0x8a8f94);
  B(cx,3.2,z0+.25,22,6.4,.5,0xe9e6e0);B(x0+.25,3.2,(z0+z1)/2,.5,6.4,16,0xe9e6e0);B(x1-.25,3.2,(z0+z1)/2,.5,6.4,16,0xe9e6e0);
  B(cx,6.55,(z0+z1)/2,22.6,.3,16.6,0x2a2d31);col(x0,x1,z0,z0+.5);col(x0,x0+.5,z0,z1);col(x1-.5,x1,z0,z1);
  [3.6,9,15,20.4].forEach(x=>{B(x,3.2,z1-.2,1.2,6.4,.4,0xe9e6e0);col(x-.6,x+.6,z1-.4,z1);});
  [6.3,12,17.7].forEach(x=>{B(x,5.6,z1-.2,4.6,1.6,.5,0xbfc4ca);for(let k=0;k<4;k++)B(x,4.95+k*.38,z1+.06,4.6,.04,.06,0x8a8f94);});
  B(cx,5.9,z1+.4,22,.6,.4,0xc8102e);sign(['ATELIER AURORE','Livraison · Service après-vente'],10,1.4,'#c8102e','#ffffff',cx,7.6,z1+.2,0,{fg2:'#ffe0e0'});
  // pont élévateur + voiture levée
  [[-1.2,1],[1.2,1],[-1.2,-1],[1.2,-1]].forEach(([a,b])=>Cy(6.3+a,1.4,-686+b*2.2,.12,2.8,0xe0b32b));
  const lift=makeCar(0x2e6fd1,'bmw');try{applyType(lift,'bmw');}catch(e){}lift.position.set(6.3,1.75,-686);scene.add(lift);
  B(6.3,1.62,-686,3.2,.12,4.6,0x3a3d42);
  // établi, panneau d'outils, pneus
  B(20,.5,-692.8,4,1,.8,0x6b4a2a);B(20,2.2,-693.6,4,2,.1,0x2a2d31);for(let k=0;k<8;k++)B(18.4+k*.45,2.2,-693.5,.12,.5,.08,pick([0xc0392b,0xe0b32b,0x9aa1a8]));
  for(let k=0;k<5;k++){const t=new THREE.Mesh(new THREE.TorusGeometry(.33,.12,8,18),sm(0x151515,.9,0));t.position.set(21.6,.45+k*.25,-684+0);t.rotation.x=Math.PI/2;scene.add(t);}
  // borne de remise des clés
  Cy(cx,.14,-671,3.3,.18,0xf4f4f0);Cy(cx,.25,-671,3.34,.04,0xc8102e,EM);
  [-1,1].forEach(s=>{Cy(cx+s*3.8,2,-671,.12,4,0x15171a);});B(cx,4.1,-671,7.8,.4,.4,0x15171a);sign('REMISE DES CLÉS',5,.55,'#15171a','#ffffff',cx,4.1,-670.78,0);
  // écran de suivi atelier
  const S=AM.screen(6.4,3.2,640,AM.drawShop||(()=>{}));S.m.position.set(2.2,3.6,z1+.05);S.m.rotation.y=0;scene.add(S.m);W.shop=S;
  W.bays=[[cx,-671,0],[4.5,-660,0],[19.5,-660,0],[-118,-689,Math.PI/2],[-109,-689,Math.PI/2],[-100,-689,Math.PI/2],[-91,-689,Math.PI/2]];
}
/* ---------- autres concessions ---------- */
function hall(cx,cz,w,d,wall,accent,trim){const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
  B(cx,.1,cz,w,.2,d,0x1d2024);B(cx,7.2,cz,w+1,.5,d+1,trim,0,NC);
  B(cx,3.6,z0+.25,w,7.2,.5,wall,0,NC);B(x0+.25,3.6,cz,.5,7.2,d,wall,0,NC);B(x1-.25,3.6,cz,.5,7.2,d,wall,0,NC);
  B(x0+(w/2-3)/2,3.6,z1,w/2-3,7.2,.12,0x9fc3d8,0,GL);B(x1-(w/2-3)/2,3.6,z1,w/2-3,7.2,.12,0x9fc3d8,0,GL);B(cx,6,z1,6,2.4,.12,0x9fc3d8,0,GL);
  col(x0,x0+w/2-3,z1-.3,z1+.3);col(x1-(w/2-3),x1,z1-.3,z1+.3);col(x0,x1,z0,z0+.5);col(x0,x0+.5,z0,z1);col(x1-.5,x1,z0,z1);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(w-1,d-1),new THREE.MeshStandardMaterial({color:0x22262c,roughness:.32,metalness:.1,envMapIntensity:.35}));fl.rotation.x=-Math.PI/2;fl.position.set(cx,.215,cz);scene.add(fl);
  B(cx,7.6,z1+.35,w*.7,.04,.04,accent,0,EM);for(let k=-1;k<=1;k++)B(cx,6.9,cz+k*d/3.2,w*.78,.05,.45,0xfff4e0,0,EM);[x0+1.2,x1-1.2].forEach(x=>B(x,6.9,cz,.3,.05,d*.85,accent,0,EM));return {x0,x1,z0,z1};}
function moto(){
  const cx=-262,cz=-734,H=hall(cx,cz,34,24,0xf4f4f2,0xff6a13,0x23262b);
  B(cx,4.2,H.z0+.6,14,6,.3,0xff6a13,0,NC);sign(['AURORE','MOTO'],8,3,'#ff6a13','#ffffff',cx,4.6,H.z0+.8,0,{fg2:'#ffffff'});
  sign('AURORE MOTO · MOTOS & SCOOTERS',20,1.6,'#111316','#ffffff',cx,8.4,H.z1+.6,0,{fg2:'#ff6a13'});
  W.motoPods=[[cx-11,cz-5,.6],[cx-4,cz-5,.2],[cx+4,cz-5,-.2],[cx+11,cz-5,-.6]];W.motoPods.forEach(([x,z])=>{Cy(x,.3,z,1.8,.2,0x111316);Cy(x,.42,z,1.84,.03,0xff6a13,EM);});
  B(cx+12,.6,H.z1-4,4,1,1.2,0x111316);B(cx+12,1.15,H.z1-4,4.2,.08,1.4,0xff6a13);col(cx+10,cx+14,H.z1-4.7,H.z1-3.3);
  W27.zones.push({id:'moto33',n:'Aurore Moto',s:'Motos sportives, scooters, motos de luxe',x0:H.x0,x1:H.x1,z0:H.z0,z1:H.z1});W.moto={cx,cz,H};
}
function occasion(){
  const cx=-195,cz=-738;B(cx,.075,cz,50,.04,32,0x3a3d42);for(let k=0;k<7;k++){B(cx-21+k*7,.1,cz-6,.12,.02,5.5,0xe8e8e0);B(cx-21+k*7,.1,cz+6,.12,.02,5.5,0xe8e8e0);}
  for(let k=0;k<12;k++){Cy(cx-24+k*4.4,2.2,cz+15.6,.05,4.4,0x9aa1a8);}for(let k=0;k<11;k++)B(cx-21.8+k*4.4,4.1,cz+15.6,4.4,.05,.05,0xf4f4f0);
  for(let k=0;k<22;k++)B(cx-23+k*2.2,3.9,cz+15.6,.5,.45,.03,[0xff6b6b,0xffc23d,0x2fc6c9,0x58d68d][k%4]);
  B(cx+18,1.5,cz-11,8,3,5,0xf2f2ee);B(cx+18,3.1,cz-11,8.6,.25,5.6,0x2e9a6a);B(cx+18,1.5,cz-8.45,5,1.6,.08,0x8fb8d0,0,GL);col(cx+14,cx+22,cz-13.5,cz-8.5);
  sign(['AURORE OCCASION','Achat · Vente · Reprise · Annonces'],12,2.4,'#2e9a6a','#ffffff',cx,3.4,cz+16.4,0,{fg2:'#e6fff0'});[-1,1].forEach(s=>Cy(cx+s*5.8,1.6,cz+16.4,.08,3.2,0x2a2d31));
  W.occSlots=[[cx-17.5,cz-8,0],[cx-10.5,cz-8,0],[cx-3.5,cz-8,0],[cx-17.5,cz+3.5,Math.PI],[cx-10.5,cz+3.5,Math.PI],[cx-3.5,cz+3.5,Math.PI],[cx+3.5,cz+3.5,Math.PI],[cx+10.5,cz+3.5,Math.PI]];
  W27.zones.push({id:'occ33',n:'Aurore Occasion',s:'Véhicules d’occasion, reprise, annonces',x0:cx-25,x1:cx+25,z0:cz-16,z1:cz+16});W.occ={cx,cz};
}
function exclusive(){
  const cx=55,cz=-735,H=hall(cx,cz,40,26,0x101114,0xc9a24a,0x0b0c0e);
  B(cx,3.6,H.z0+.55,18,7.2,.3,0x15130f,0,NC);sign(['AURORE','EXCLUSIVE'],12,3.2,'#0b0c0e','#c9a24a',cx,4.5,H.z0+.75,0,{fg2:'#f4e6c0'});
  sign('AURORE EXCLUSIVE · SUR RENDEZ-VOUS',22,1.6,'#0b0c0e','#c9a24a',cx,8.4,H.z1+.6,0,{fg2:'#ffffff'});
  [-1,1].forEach(s=>{Cy(cx+s*3.6,3.6,H.z1+1.4,.35,7.2,0xc9a24a);});B(cx,.11,H.z1+4,3.4,.03,8,0x9c1020);
  W.exPods=[[cx-12,cz-4,.5],[cx,cz-5,0],[cx+12,cz-4,-.5],[cx+12,cz+5,-2.4]];W.exPods.forEach(([x,z])=>{Cy(x,.3,z,3.2,.2,0x0b0c0e);Cy(x,.42,z,3.24,.03,0xc9a24a,EM);});
  B(cx-12,.55,cz+6,6,.7,2.2,0x2a2117);B(cx-12,.95,cz+6,6.2,.06,2.4,0xc9a24a);col(cx-15,cx-9,cz+4.9,cz+7.1);
  W27.zones.push({id:'excl33',n:'Aurore Exclusive',s:'Limousines, éditions limitées, VIP',x0:H.x0,x1:H.x1,z0:H.z0,z1:H.z1});W.ex={cx,cz,H};
}
/* ---------- mezzanine : bureaux, négociation, financement, salon VIP ---------- */
function mezzanine(){
  const R=roomCtx('am33',1160,640,3.6);R.name='Aurore Motors · étage';R.sp=[];
  const wl=sm(0xf1efea,.85,0),ext=sm(0xd8d2c6,.9,0),fl=tm(rep(tileTex7(0x2b3036,0x262a30,0x1d2024,4,false),1),0xffffff,.18,.25);
  R.floor(-14,-9,14,9,fl,2);R.ceil(-14,-9,14,9,sm(0xf7f5f0,.9,0));
  R.wall(-14,-9,14,-9,wl,ext,[{k:'window',t:4,w:5,y0:.8,y1:3,out:1},{k:'window',t:24,w:5,y0:.8,y1:3,out:1}],{th:.25});
  R.wall(-14,9,14,9,ext,wl,[{k:'door',t:14,w:1.6,open:false}],{th:.25});R.wall(-14,-9,-14,9,ext,wl,[],{th:.25});R.wall(14,-9,14,9,wl,ext,[],{th:.25});
  const box=(w,h,d,c,x,y,z,o)=>{o=o||{};const m=M(R.G,new THREE.BoxGeometry(w,h,d),o.mat||sm(c,o.r==null?.6:o.r,o.m||0,o.e?{emissive:o.e,emissiveIntensity:o.ei||.8,k:'am'+c+o.e}:undefined),x,y,z,0,o.ry||0,0,o.cast!==false);if(o.col)R.col(x,z,w,d);return m;};
  const signIn=(t,w,h,bg,fg,x,y,z,ry)=>{const s=sign27(t,w,h,bg,fg);s.position.set(x,y,z);s.rotation.y=ry||0;R.G.add(s);};
  // cloisons vitrées
  [-5,5].forEach(x=>{M(R.G,new THREE.BoxGeometry(.06,3.2,10),M7.glass,x,1.6,-4,0,0,0,false);R.col(x,-4,.2,10);box(.12,.1,10,0x15171a,x,3.2,-4);});
  // bureau des vendeurs (ouest)
  signIn('BUREAU DES VENDEURS',5.4,.6,'#15171a','#ffffff',-9.5,2.9,-8.8);
  [-12,-9.5,-7].forEach((x,i)=>{R.place(F7.desk(),x,-6.4,0,1.6,.8);R.place(F7.officeChair(),x,-7.4,Math.PI);R.place(F7.chair(0x2a2d31),x,-5.3,0);const mo=F7.monitor();mo.position.set(x,.76,-6.6);R.G.add(mo);
    const c=clerk7(R,x,-7.45,[0xc8102e,0x15171a,0xc8102e][i],1);c.rotation.y=0;});
  R.int(-9.5,-4.4,'Bureau des vendeurs · parler à un conseiller',()=>AM.talk('vendeur'),{r:2.4});
  // bureau de financement (centre)
  signIn('FINANCEMENT',3.6,.6,'#1e5fae','#ffffff',0,2.9,-8.8);R.place(F7.desk(),0,-6.4,0,1.8,.8);R.place(F7.officeChair(),0,-7.4,Math.PI);const fo=clerk7(R,0,-7.45,0x1e5fae,1);fo.rotation.y=0;
  [-.8,.8].forEach(x=>R.place(F7.chair(0x1e5fae),x,-5.3,0));const lp=F7.laptop?F7.laptop():F7.monitor();lp.position.set(0,.76,-6.4);R.G.add(lp);
  R.int(0,-4.6,'Bureau de financement · crédits, contrats, mensualités',()=>AM.financeOffice(),{r:2.2});
  // espace de négociation (centre avant)
  signIn('ESPACE DE NÉGOCIATION',4.6,.55,'#15171a','#ffffff',0,2.9,8.8,Math.PI);R.place(F7.roundTable(.7),0,3,0,1.4,1.4);[[1.2,0],[-1.2,0],[0,1.2],[0,-1.2]].forEach(([a,b])=>R.place(F7.chair(0xc8102e),a,3+b,Math.atan2(-a,-b)));
  R.place(F7.plant(2,1.3),-3.6,6.6);R.int(0,4.6,'Négocier le prix d’un véhicule',()=>AM.negotiate(),{r:2.2});
  // salon VIP (est)
  signIn('SALON VIP',3.6,.6,'#0b0c0e','#c9a24a',9.5,2.9,-8.8);
  R.place(F7.rug(5.4,4,ctex('vip33',128,128,(g,W,H)=>{g.fillStyle='#2a2117';g.fillRect(0,0,W,H);g.strokeStyle='#c9a24a';g.lineWidth=3;g.strokeRect(8,8,W-16,H-16);})),9.5,-4);
  R.place(F7.sofa(0x1d1f24,3),9.5,-1.8,Math.PI,3,1);R.place(F7.sofa(0x1d1f24,2.2),12.6,-4.4,-Math.PI/2,2.2,1);R.place(F7.coffeeTable(),9.5,-4,0,1.2,.6);
  R.place(F7.bar(3.4),7,-7.6,0,3.4,.8);const bm=clerk7(R,7,-8.4,0x0b0c0e);bm.rotation.y=0;
  const tv=AM.screen(3.2,1.8,512,AM.drawVip||(()=>{}));tv.m.position.set(13.85,1.8,-4);tv.m.rotation.y=-Math.PI/2;R.G.add(tv.m);W.vipTv=tv;
  R.int(9.5,-3,'Salon VIP · boissons et présentation privée',()=>AM.vipLounge(),{r:2.4});
  R.place(F7.plant(2,1.3),13,7.8);R.place(F7.plant(2,1.3),-13,7.8);R.place(F7.sofa(0xe8e4dc,2.6),-10,6.5,Math.PI,2.6,1);R.place(F7.waterCooler?F7.waterCooler():F7.plant(1.6,1),-13,2);
  R.int(0,7.6,'Redescendre au showroom',()=>leaveInterior(),{exit:1,r:1.6});
  R.zones=[[-9.5,-4],[0,-4],[0,3],[9.5,-4]];R.spotI=40;R.entry={x:0,z:7,h:Math.PI};R.b=[R.rx-13.6,R.rx+13.6,R.rz-8.6,R.rz+8.6];
  R.light(-9.5,3.2,-5,9,0xfff4e4);R.light(0,3.2,-5,8,0xfff4e4);R.light(0,3.2,3,8,0xffe2b8);R.light(9.5,3.2,-4,8,0xffd9a8);
  R.G.traverse(o=>{if(o.isMesh)o.receiveShadow=true;});ROOMS.am33=R;W.mez=R;
}
/* ---------- personnel et clients ---------- */
function people(){
  AM.staffAt('ama','Ama Mensah','Hôtesse d’accueil',0xc8102e,-24,-665.3,0,{bottom:'jupe',style:'chignon'});
  AM.staffAt('koffi','Koffi Agbeko','Conseiller commercial',0x15171a,-40,-671.5,0,{style:'court'});
  AM.staffAt('nadia','Nadia Traoré','Conseillère commerciale',0x15171a,-55,-661,Math.PI*.15,{bottom:'pantalon',style:'long'});
  AM.staffAt('yao','Yao Kouassi','Chef d’atelier',0x2e4a6a,9,-674,0,{style:'casquette',capColor:0xc8102e});
  AM.staffAt('rachid','Rachid Bamba','Conseiller Aurore Moto',0xff6a13,-250,-728,Math.PI,{style:'court'});
  AM.staffAt('mamadou','Mamadou Sow','Responsable Aurore Occasion',0x2e9a6a,-180,-726.5,Math.PI,{style:'ras'});
  AM.staffAt('selom','Sélom Lawson','Concierge Aurore Exclusive',0x0b0c0e,58.5,-720.5,Math.PI,{style:'court'});
  const WP=[[-62,-672],[-50,-673],[-38,-674],[-26,-672],[-60,-660],[-48,-661],[-36,-662],[-20,-675],[-30,-668],[-56,-668]];
  for(let i=0;i<5;i++){const m=makePerson(pick(SHIRTS),pick(PANTS),pick(SKINS),pick(HAIRS),{style:pick(['court','long','afro','chignon','queue','ras']),top:pick(['tee','long','veste']),bottom:pick(['pantalon','jupe','short']),bag:Math.random()<.4});
    const a=pick(WP);m.position.set(a[0],.22,a[1]);scene.add(m);W.clients.push({m,WP,t:pick(WP),w:rand(0,4),ph:rand(0,6),sp:rand(.9,1.3),i});}
}
AM.buildWorld=function(){
  mats27();P=[];GL=[];EM=[];NC=[];
  // on retire l'exposition v31 (remplacée par la gamme Aurore)
  try{(window.V31&&V31.disp||[]).forEach(d=>scene.remove(d.m));if(window.V31)V31.disp.length=0;
    if(window.V31&&V31.statics){for(let i=V31.statics.length-1;i>=0;i--){const p=V31.statics[i].m.position;if(p.x>-76&&p.x<-4&&p.z>-695&&p.z<-653){scene.remove(V31.statics[i].m);V31.statics.splice(i,1);}}}
    removeSpot(id=>id.startsWith('zone31:car:')||id==='zone31:motors');
    scene.children.filter(o=>o.isMesh&&Math.abs(o.position.x-12)<.6&&Math.abs(o.position.z+657.6)<.6&&o.position.y>1.5).forEach(o=>scene.remove(o));}catch(e){console.warn('am33 clean',e);}
  [['prestigeOutside',prestigeOutside],['prestigeInside',prestigeInside],['workshop',workshop],['track',track],['moto',moto],['occasion',occasion],['exclusive',exclusive]].forEach(([n,f])=>{try{f();}catch(e){console.warn('am33 '+n,e);}});
  [[-126,-650],[-126,-700],[-78,-700],[26,-695],[26,-676],[-300,-724],[-226,-724],[-164,-724],[-24,-724],[30,-724],[82,-724],[-300,-752],[-226,-754],[82,-752],[-160,-758],[-20,-758]].forEach(([x,z])=>tree(x,z,1.25));
  try{trees27(W.trees);}catch(e){}
  flush27(P,M27.vc,true);flush27(NC,M27.vc,false);flush27(GL,M27.glass,false);flush27(EM,M27.emis,false);
  try{mezzanine();}catch(e){console.warn('am33 mezz',e);}
  try{people();}catch(e){console.warn('am33 people',e);}
};
/* ---------- animation du quartier ---------- */
AM.tickWorld=function(dt){const t=performance.now()*.001,cx=camera.position.x,cz=camera.position.z,near=Math.abs(cx+60)<170&&Math.abs(cz+700)<120;
  W.doors.forEach(d=>{let want=Math.hypot(player.x+40,player.z+654)<7||W.clients.some(c=>Math.hypot(c.m.position.x+40,c.m.position.z+654)<4)?1:0;if(player.car&&Math.hypot(player.car.x+40,player.car.z+654)<7)want=0;d.o+=(want-d.o)*Math.min(1,dt*3);d.m.position.x=d.x0+d.s*d.o*4.8;});
  if(!near||player.inside){W.clients.forEach(c=>c.m.visible=false);Object.values(W.staff).forEach(s=>s.m.visible=!player.inside&&Math.abs(s.x-cx)<150&&Math.abs(s.z-cz)<150);return;}
  Object.values(W.staff).forEach(s=>{s.m.visible=true;if(s.face&&s.face>t){s.m.rotation.y+=angDiff(s.m.rotation.y,Math.atan2(player.x-s.x,player.z-s.z))*Math.min(1,dt*5);}else s.m.rotation.y+=angDiff(s.m.rotation.y,s.h)*Math.min(1,dt*2);animPerson(s.m,t+s.ph,0,false);});
  W.clients.forEach(c=>{c.m.visible=true;if(c.w>0){c.w-=dt;animPerson(c.m,t*2+c.ph,0,false);return;}
    const dx=c.t[0]-c.m.position.x,dz=c.t[1]-c.m.position.z,d=Math.hypot(dx,dz);
    if(d<.4){c.w=rand(3,9);c.t=pick(c.WP).map(v=>v+rand(-1,1));const dd=W.displays.filter(q=>q.line==='prestige').sort((a,b)=>Math.hypot(a.x-c.m.position.x,a.z-c.m.position.z)-Math.hypot(b.x-c.m.position.x,b.z-c.m.position.z))[0];if(dd)c.m.rotation.y=Math.atan2(dd.x-c.m.position.x,dd.z-c.m.position.z);return;}
    c.m.position.x+=dx/d*c.sp*dt;c.m.position.z+=dz/d*c.sp*dt;c.m.rotation.y=Math.atan2(dx,dz);c.ph+=dt*c.sp*2.3;animPerson(c.m,c.ph,.45,false);
    const px=player.x-c.m.position.x,pz=player.z-c.m.position.z;if(Math.hypot(px,pz)<.7){c.m.position.x-=px*.2;c.m.position.z-=pz*.2;}});
  W.displays.forEach(d=>{if(d.spin)d.m.rotation.y+=dt*d.spin;});
};
})();
