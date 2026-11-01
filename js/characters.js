'use strict';
/* ---------- personnages (v4 : silhouettes arrondies, visages, coiffures, tenues, genoux articulés) ---------- */
const HAIR_STYLES=['court','long','chignon','afro','queue','ras','casquette','chauve'];
const HAIR_LABELS={court:'Court',long:'Long',chignon:'Chignon',afro:'Afro',queue:'Queue',ras:'Ras',casquette:'Casquette',chauve:'Chauve'};
const TOPS=['tee','tee','long','veste','sweat'];
const BOTTOMS=['pantalon','pantalon','pantalon','short','jupe'];
const SHOE_COLS=[0x1c1c1c,0xf2f2ee,0x5a3b24,0x2b3445];
const JACKETS=[0x2b3445,0x5a4a3a,0x3b3b3b,0x7a2f2f,0x2f5a4a,0xc9b38a];
const CAP_COLS=[0xd94f4f,0x2e6fd1,0x1c1c1c,0xe0b34a,0x4fb58a];
const _pm=new THREE.Matrix4(),_pq=new THREE.Quaternion(),_pe=new THREE.Euler(),_pv=new THREE.Vector3(),_ps=new THREE.Vector3();
/* pièce avec position, couleur, échelle et rotation */
function pp(g,x,y,z,c,sx,sy,sz,rx,ry,rz){
  _pe.set(rx||0,ry||0,rz||0);_pq.setFromEuler(_pe);_pv.set(x,y,z);_ps.set(sx||1,sy||sx||1,sz||sx||1);
  return {g:g,m:new THREE.Matrix4().compose(_pv,_pq,_ps),c:c};
}
const shade=(c,k)=>{const o=new THREE.Color(c);o.multiplyScalar(k);return o.getHex();};
const cyl=(rt,rb,h,s)=>new THREE.CylinderGeometry(rt,rb,h,s||10);
const sph=(r,w,h)=>new THREE.SphereGeometry(r,w||12,h||9);
const bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d);

function makePerson(shirt,pants,skin,hair,opt){
  opt=opt||{};
  const style=opt.style||pick(HAIR_STYLES),top=opt.top||pick(TOPS),bottom=opt.bottom||pick(BOTTOMS);
  const shoe=opt.shoe!=null?opt.shoe:pick(SHOE_COLS),jacket=opt.jacket!=null?opt.jacket:pick(JACKETS);
  const sleeve=top==='veste'?jacket:shirt,torsoC=top==='veste'?jacket:shirt;
  const g=new THREE.Group(),P=[];
  /* bassin et ceinture */
  P.push(pp(cyl(0.19,0.2,0.2,12),0,0.96,0,bottom==='jupe'?shirt:pants,1,1,0.72));
  if(bottom==='jupe')P.push(pp(cyl(0.2,0.29,0.34,14),0,0.8,0,pants,1,1,0.8));
  P.push(pp(cyl(0.2,0.2,0.05,12),0,1.07,0,0x22201e,1,1,0.74));
  P.push(pp(bx(0.07,0.045,0.02),0,1.07,0.15,0xb9a46a));
  /* torse effilé */
  P.push(pp(cyl(0.255,0.2,0.48,14),0,1.33,0,torsoC,1,1,0.6));
  P.push(pp(sph(0.11,10,8),-0.235,1.5,0,torsoC,1,0.9,0.95));
  P.push(pp(sph(0.11,10,8),0.235,1.5,0,torsoC,1,0.9,0.95));
  P.push(pp(cyl(0.2,0.255,0.06,14),0,1.56,0,torsoC,1,1,0.6));
  /* col de vêtement et détails de couture */
  if(top!=='tee')P.push(pp(cyl(0.072,0.072,0.045,10),0,1.59,0,shade(torsoC,0.78)));
  if(top==='veste'||top==='long'){P.push(pp(bx(0.012,0.34,0.012),0,1.34,0.158,shade(torsoC,0.7)));for(let by=1.25;by<1.48;by+=.1)P.push(pp(sph(0.012,6,5),0,by,0.17,0xd9c18a));}
  if(top==='tee'||top==='long'){P.push(pp(bx(0.095,0.12,0.012),-0.135,1.22,0.13,shade(torsoC,0.82)));P.push(pp(bx(0.095,0.12,0.012),0.135,1.22,0.13,shade(torsoC,0.82)));}
  if(top==='veste'){
    P.push(pp(bx(0.12,0.46,0.02),0,1.33,0.152,shirt));
    P.push(pp(bx(0.06,0.2,0.03),-0.08,1.47,0.15,shade(jacket,0.8),1,1,1,0,0,-0.35));
    P.push(pp(bx(0.06,0.2,0.03),0.08,1.47,0.15,shade(jacket,0.8),1,1,1,0,0,0.35));
  }else if(top==='sweat'){
    P.push(pp(sph(0.15,12,8),0,1.6,-0.1,shade(shirt,0.85),1.2,0.75,0.7));
    P.push(pp(bx(0.26,0.12,0.03),0,1.2,0.14,shade(shirt,0.85)));
    P.push(pp(cyl(0.008,0.008,0.14,4),-0.05,1.48,0.155,0xeeeeee));P.push(pp(cyl(0.008,0.008,0.14,4),0.05,1.48,0.155,0xeeeeee));
  }else if(top==='long'){
    P.push(pp(bx(0.14,0.035,0.03),0,1.58,0.12,shade(shirt,0.75)));
  }
  if(opt.bag||(opt.bag==null&&Math.random()<0.16)){const bc=opt.bagColor||pick([0x2b3445,0x7a2f2f,0x2f5a4a,0xe0a526]);P.push(pp(bx(0.3,0.36,0.14),0,1.32,-0.2,bc));P.push(pp(bx(0.24,0.12,0.04),0,1.2,-0.28,shade(bc,0.8)));P.push(pp(bx(0.24,0.045,0.025),0,1.49,-0.28,shade(bc,1.15)));[-.115,.115].forEach(x=>P.push(pp(bx(.045,.3,.035),x,1.32,-.11,shade(bc,.72),1,1,1,-.12,0,0)));P.push(pp(bx(.065,.05,.012),0,1.32,-.294,0xb9a46a));}
  /* cou et tête */
  P.push(pp(cyl(0.058,0.066,0.12,8),0,1.62,0,skin));
  P.push(pp(sph(0.15,16,12),0,1.77,0,skin,1,1.12,1.05));
  P.push(pp(sph(0.036,6,5),-0.148,1.765,0,shade(skin,0.92),0.5,1,0.8));
  P.push(pp(sph(0.036,6,5),0.148,1.765,0,shade(skin,0.92),0.5,1,0.8));
  P.push(pp(sph(0.012,6,5),-0.148,1.765,0.033,shade(skin,.72),.65,1,.6));P.push(pp(sph(0.012,6,5),0.148,1.765,0.033,shade(skin,.72),.65,1,.6));
  /* visage */
  [-0.055,0.055].forEach(x=>{
    P.push(pp(sph(0.026,8,6),x,1.785,0.151,0xf4f1ea,1,0.85,0.5));
    P.push(pp(sph(0.015,6,5),x,1.783,0.162,0x1c140e,1,1,0.45));
    P.push(pp(bx(0.052,0.014,0.02),x,1.82,0.156,shade(hair,0.9),1,1,1,0,0,x>0?-0.12:0.12));
  });
  P.push(pp(bx(0.032,0.05,0.04),0,1.752,0.155,shade(skin,0.9),1,1,1,-0.2,0,0));
  P.push(pp(bx(0.065,0.014,0.014),0,1.707,0.151,shade(skin,0.55)));
  if(opt.glasses||(opt.glasses==null&&Math.random()<0.14)){
    const frame=opt.frameColor||0x25242a;[-.055,.055].forEach(x=>{P.push(pp(bx(.082,.05,.014),x,1.785,.171,frame));P.push(pp(bx(.064,.034,.009),x,1.785,.18,0x8bb8c5));});
    P.push(pp(bx(.024,.012,.014),0,1.797,.174,frame));P.push(pp(bx(.08,.012,.012),-.13,1.795,.16,frame));P.push(pp(bx(.08,.012,.012),.13,1.795,.16,frame));
  }
  if(opt.earrings){[-.148,.148].forEach(x=>{P.push(pp(cyl(.018,.018,.025,8),x,1.72,.025,0xd9bf78));P.push(pp(sph(.018,8,6),x,1.70,.03,0xd9bf78));});}
  if(opt.necklace){P.push(pp(cyl(.078,.078,.018,12),0,1.565,.025,0xd9bf78,1,1,1,.15,0,0));P.push(pp(sph(.022,8,6),0,1.51,.082,opt.pendantColor||0xd94f4f));}
  if(opt.watch){P.push(pp(cyl(.059,.059,.045,10),-.36,1.22,.008,0x22262c,1,1,1,0,0,Math.PI/2));P.push(pp(bx(.068,.045,.015),-.36,1.22,.042,0xc7d5df));P.push(pp(bx(.045,.006,.004),-.36,1.22,.052,0x315e87));}
  if(opt.beard||(opt.beard==null&&style!=='long'&&style!=='chignon'&&Math.random()<0.2)){
    P.push(pp(new THREE.SphereGeometry(0.13,12,8,0,Math.PI*2,Math.PI*0.5,Math.PI*0.5),0,1.73,0.025,hair,1.05,1.05,1.05));
  }
  /* coiffure */
  const cap=(r,k)=>pp(new THREE.SphereGeometry(r,16,10,0,Math.PI*2,0,Math.PI*(k||0.52)),0,1.775,-0.012,hair,1,1.12,1.06);
  if(style==='court'){P.push(cap(0.162));P.push(pp(bx(0.2,0.05,0.06),0,1.89,0.11,hair,1,1,1,0.5,0,0));}
  else if(style==='ras'){P.push(cap(0.154,0.45));}
  else if(style==='long'){P.push(cap(0.165,0.55));P.push(pp(bx(0.3,0.38,0.09),0,1.66,-0.1,hair));P.push(pp(bx(0.06,0.3,0.08),-0.15,1.7,0.0,hair));P.push(pp(bx(0.06,0.3,0.08),0.15,1.7,0.0,hair));}
  else if(style==='chignon'){P.push(cap(0.163));P.push(pp(sph(0.075,10,8),0,1.93,-0.09,hair));}
  else if(style==='afro'){P.push(pp(sph(0.21,14,10),0,1.86,-0.06,hair,1.06,0.92,1));}
  else if(style==='queue'){P.push(cap(0.163));P.push(pp(sph(0.05,8,6),0,1.84,-0.17,hair));P.push(pp(cyl(0.045,0.02,0.26,8),0,1.7,-0.2,hair,1,1,1,0.25,0,0));}
  else if(style==='casquette'){const cc=opt.capColor!=null?opt.capColor:pick(CAP_COLS);P.push(pp(new THREE.SphereGeometry(0.166,16,10,0,Math.PI*2,0,Math.PI*0.5),0,1.79,-0.012,cc,1,1,1.06));P.push(pp(bx(0.22,0.02,0.14),0,1.84,0.17,cc,1,1,1,-0.12,0,0));P.push(pp(bx(0.3,0.06,0.2),0,1.72,-0.08,hair));}
  g.add(new THREE.Mesh(mergeParts(P),vcLamb));
  /* membres articulés */
  function grp(parent,parts,x,y,z){const p=new THREE.Group();p.position.set(x,y,z||0);p.add(new THREE.Mesh(mergeParts(parts),vcLamb));parent.add(p);return p;}
  const shortLeg=bottom==='short',bareLeg=bottom==='jupe';
  function leg(x){
    const thighC=bareLeg?skin:pants,shinC=(bareLeg||shortLeg)?skin:pants;
    const th=[pp(cyl(0.1,0.085,0.44,10),0,-0.22,0,thighC,1,1,1.05)];
    if(shortLeg){th.length=0;th.push(pp(cyl(0.105,0.095,0.28,10),0,-0.14,0,pants,1,1,1.05));th.push(pp(cyl(0.08,0.078,0.18,10),0,-0.35,0,skin));}
    const hip=grp(g,th,x,0.9);
    const sh=[pp(cyl(0.08,0.062,0.4,10),0,-0.2,0,shinC),pp(sph(0.081,8,6),0,0,0,shinC),
      pp(bx(0.135,0.085,0.27),0,-0.425,0.045,shoe),pp(bx(0.14,0.03,0.28),0,-0.47,0.045,shoe===0xf2f2ee?0xbdbdb6:0xf2f2ee),pp(sph(0.07,8,6),0,-0.41,0.15,shoe,1,0.6,0.9),pp(bx(.075,.012,.07),0,-.405,.155,shade(shoe,.72))];
    for(let ly=-.40;ly>-.46;ly-=.025)sh.push(pp(bx(.045,.007,.008),0,ly,.19,shoe===0x1c1c1c?0xc8c8c8:0x343434));
    const knee=grp(hip,sh,0,-0.44);
    return [hip,knee];
  }
  function arm(x){
    const sgn=x<0?-1:1,sleeveLen=top==='tee'?0.15:0.3;
    const up=[pp(cyl(0.07,0.062,sleeveLen,10),0,-sleeveLen/2,0,sleeve)];
    if(sleeveLen<0.3)up.push(pp(cyl(0.058,0.055,0.3-sleeveLen,10),0,-sleeveLen-(0.3-sleeveLen)/2,0,skin));
    const foreC=top==='tee'?skin:sleeve;
    /* avant-bras légèrement plié (coude intégré) */
    up.push(pp(sph(0.057,8,6),0,-0.3,0,foreC));
    const fx=0,fy=-0.3-0.13*Math.cos(0.28),fz=0.13*Math.sin(0.28);
    up.push(pp(cyl(0.055,0.046,0.27,10),fx,fy,fz,foreC,1,1,1,-0.28,0,0));
    if(top!=='tee')up.push(pp(cyl(0.05,0.05,0.04,10),fx,-0.3-0.255*Math.cos(0.28),0.255*Math.sin(0.28),skin,1,1,1,-0.28,0,0));
    up.push(pp(sph(0.054,8,6),0,-0.3-0.3*Math.cos(0.28),0.3*Math.sin(0.28),skin,0.8,1.15,1));
    return grp(g,up,x,1.5);
  }
  const L=leg(-0.105),R=leg(0.105);
  const u=g.userData;u.legL=L[0];u.kneeL=L[1];u.legR=R[0];u.kneeR=R[1];
  u.armL=arm(-0.315);u.armR=arm(0.315);
  u.armL.rotation.z=0.08;u.armR.rotation.z=-0.08;
  castAll(g);return g;
}
function makePlayerMesh(){
  return makePerson(look.s,look.p||0x2b3445,look.k,look.h||0x1a1410,{style:look.y||'court',top:look.t||'tee',bottom:look.bt||'pantalon',bag:!!look.bag,glasses:!!look.g,beard:!!look.b,shoe:look.f!=null?look.f:0xf2f2ee,earrings:!!look.e,necklace:!!look.n,watch:!!look.w,jacket:look.j||0x2b3445,capColor:look.cap||0xd94f4f});
}
function animPerson(g,phase,amp,run){
  const u=g.userData,s=Math.sin(phase)*amp,c=Math.cos(phase)*amp,a=0.8+(run?0.5:0),z=0.07+(run?0.08:0);
  u.legL.rotation.x=s;u.legR.rotation.x=-s;
  const kb=run?2.1:1.4;
  if(u.kneeL){u.kneeL.rotation.x=Math.max(0,-c)*kb+Math.max(0,s)*0.25;u.kneeR.rotation.x=Math.max(0,c)*kb+Math.max(0,-s)*0.25;}
  u.armL.rotation.x=-s*a-(run?0.35:0);u.armR.rotation.x=s*a-(run?0.35:0);u.armL.rotation.z=z;u.armR.rotation.z=-z;
  if(amp<0.06){const b=Math.sin(performance.now()*0.0018+phase)*0.035;u.armL.rotation.x=b;u.armR.rotation.x=-b;if(u.kneeL){u.kneeL.rotation.x=0.02;u.kneeR.rotation.x=0.02;}}
}
